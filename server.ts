import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  getVideoMetadata,
  generateThumbnail,
  extractAudio,
  cutAndConvert916,
  createSyntheticSampleVideo,
} from './server/ffmpeg-service.js';
import { analyzeVideoWithGemini } from './server/gemini-service.js';
import { SAMPLE_VIDEOS } from './server/sample-videos.js';
import {
  VideoMetadata,
  AnalysisResult,
  GeneratedClip,
  ProcessingJob,
  ClipGenerationOptions,
} from './src/types.js';

dotenv.config();

const rootDir = process.cwd();

const uploadsDir = path.join(rootDir, 'storage', 'uploads');
const clipsDir = path.join(rootDir, 'storage', 'clips');
const thumbsDir = path.join(rootDir, 'storage', 'thumbs');

// In-memory data store for sessions and jobs
const videosStore = new Map<string, VideoMetadata>();
const analysisStore = new Map<string, AnalysisResult>();
const clipsStore = new Map<string, GeneratedClip>();
const jobsStore = new Map<string, ProcessingJob>();

// Setup Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    cb(null, `vid_${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp4', '.mov', '.mkv', '.webm', '.avi', '.m4v'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported video format (${ext}). Supported: MP4, MOV, MKV, WEBM, AVI`));
    }
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static storage routes for thumbnails & downloads
  app.use('/api/storage/thumbs', express.static(thumbsDir));
  app.use('/api/storage/uploads', express.static(uploadsDir));
  app.use('/api/storage/clips', express.static(clipsDir));

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      storageReady: true,
      timestamp: new Date().toISOString(),
    });
  });

  // Get available sample demo videos
  app.get('/api/samples', (req: Request, res: Response) => {
    res.json({ samples: SAMPLE_VIDEOS });
  });

  // Load a sample demo video
  app.post('/api/samples/:sampleId/load', async (req: Request, res: Response) => {
    try {
      const { sampleId } = req.params;
      const sampleMeta = SAMPLE_VIDEOS.find(s => s.id === sampleId) || SAMPLE_VIDEOS[0];
      const videoId = `sample_${sampleId}_${Date.now()}`;

      // Create or locate synthetic video
      const filePath = await createSyntheticSampleVideo(sampleId, sampleMeta.title, sampleMeta.duration);
      const meta = await getVideoMetadata(filePath);

      // Generate thumbnail
      let thumbUrl = '';
      try {
        thumbUrl = await generateThumbnail(filePath, 2, `thumb_${videoId}`);
      } catch (e) {
        console.warn('Sample thumbnail warning:', e);
      }

      const videoData: VideoMetadata = {
        id: videoId,
        originalName: `${sampleMeta.title}.mp4`,
        size: meta.size,
        duration: meta.duration,
        width: meta.width,
        height: meta.height,
        fps: meta.fps,
        hasAudio: meta.hasAudio,
        format: meta.format,
        uploadedAt: new Date().toISOString(),
        filePath,
        thumbnailUrl: thumbUrl || '/api/storage/thumbs/default.jpg',
      };

      videosStore.set(videoId, videoData);
      res.json({ success: true, video: videoData });
    } catch (err: any) {
      console.error('Failed to load sample video:', err);
      res.status(500).json({ error: err.message || 'Failed to load sample video' });
    }
  });

  // Upload Video Endpoint
  app.post('/api/upload', upload.single('video'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      const filePath = req.file.path;
      const videoId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // Probe metadata using real FFprobe
      const meta = await getVideoMetadata(filePath);

      // Generate thumbnail at 2 seconds
      let thumbUrl = '';
      try {
        const thumbTime = Math.min(2, Math.floor(meta.duration / 2));
        thumbUrl = await generateThumbnail(filePath, thumbTime, `thumb_${videoId}`);
      } catch (err) {
        console.warn('Could not generate thumbnail:', err);
      }

      const videoData: VideoMetadata = {
        id: videoId,
        originalName: req.file.originalname,
        size: req.file.size,
        duration: meta.duration,
        width: meta.width,
        height: meta.height,
        fps: meta.fps,
        hasAudio: meta.hasAudio,
        format: meta.format,
        uploadedAt: new Date().toISOString(),
        filePath,
        thumbnailUrl: thumbUrl || '',
      };

      videosStore.set(videoId, videoData);
      res.json({ success: true, video: videoData });
    } catch (err: any) {
      console.error('Upload processing error:', err);
      res.status(500).json({ error: err.message || 'Failed to process uploaded video' });
    }
  });

  // Get Video Details
  app.get('/api/videos/:videoId', (req: Request, res: Response) => {
    const { videoId } = req.params;
    const video = videosStore.get(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json({ video });
  });

  // AI Analysis: Extract Audio + Gemini Moment Detection
  app.post('/api/analyze/:videoId', async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const video = videosStore.get(videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Return cached analysis if available
    if (analysisStore.has(videoId)) {
      return res.json({ success: true, analysis: analysisStore.get(videoId) });
    }

    const jobId = `job_ana_${Date.now()}`;
    const job: ProcessingJob = {
      id: jobId,
      type: 'analysis',
      status: 'processing',
      progress: 10,
      stage: 'Extracting high-fidelity audio track with FFmpeg...',
      detail: 'Isolating dialogue and vocal track for Gemini AI transcription',
    };
    jobsStore.set(jobId, job);

    // Run asynchronous analysis
    (async () => {
      try {
        // Step 1: Extract Audio
        job.progress = 25;
        job.stage = 'Extracting audio with FFmpeg...';
        const audioPath = await extractAudio(video.filePath, `audio_${videoId}`);

        // Step 2: Gemini AI Analysis
        job.progress = 55;
        job.stage = 'Gemini AI is analyzing transcript and hooks...';
        job.detail = 'Detecting viral hooks, emotional peaks, retention curves & AI Content Scores';

        const result = await analyzeVideoWithGemini(audioPath, video.duration, video.originalName);
        result.videoId = videoId;

        // Generate clip thumbnails for each detected moment
        job.progress = 85;
        job.stage = 'Generating preview frames for detected moments...';
        for (let i = 0; i < result.moments.length; i++) {
          const moment = result.moments[i];
          try {
            const thumbUrl = await generateThumbnail(
              video.filePath,
              moment.startTime + 1,
              `thumb_${videoId}_${moment.id}`
            );
            moment.thumbnailTime = moment.startTime + 1;
            (moment as any).thumbnailUrl = thumbUrl;
          } catch (e) {
            console.warn(`Failed thumb for moment ${moment.id}:`, e);
          }
        }

        job.progress = 100;
        job.status = 'completed';
        job.stage = 'Analysis complete!';
        job.result = result;

        analysisStore.set(videoId, result);
      } catch (err: any) {
        console.error('Async analysis error:', err);
        job.status = 'failed';
        job.error = err.message || 'AI analysis failed';
      }
    })();

    res.json({ success: true, jobId });
  });

  // Generate 9:16 Vertical Clip with FFmpeg
  app.post('/api/generate-clip', async (req: Request, res: Response) => {
    const {
      videoId,
      momentId,
      cropStyle = 'blurred-backdrop',
      addHeadline = false,
      headlineText = '',
      burnCaptions = false,
      accentColor = '#6366F1',
    } = req.body as ClipGenerationOptions & { videoId: string };

    const video = videosStore.get(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const analysis = analysisStore.get(videoId);
    const moment = analysis?.moments.find(m => m.id === momentId);

    if (!moment) {
      return res.status(404).json({ error: 'Moment not found in analysis' });
    }

    const clipId = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const jobId = `job_gen_${clipId}`;

    const job: ProcessingJob = {
      id: jobId,
      type: 'generate_clip',
      status: 'processing',
      progress: 5,
      stage: 'Initializing FFmpeg 9:16 rendering pipeline...',
      detail: `Applying ${cropStyle} vertical layout (1080x1920)`,
    };
    jobsStore.set(jobId, job);

    // Asynchronously perform video cutting and conversion
    (async () => {
      try {
        const renderResult = await cutAndConvert916(
          video.filePath,
          clipId,
          {
            startTime: moment.startTime,
            duration: moment.duration,
            cropStyle,
            headlineText: addHeadline ? (headlineText || moment.title) : undefined,
            addHeadline,
            accentColor,
          },
          (progressPercent) => {
            job.progress = Math.min(98, Math.max(5, progressPercent));
            job.stage = `Rendering 9:16 vertical video (${Math.round(job.progress)}%)...`;
            job.detail = `Cutting from ${moment.startTime}s to ${moment.endTime}s with libx264 high-quality encoding`;
          }
        );

        // Generate thumbnail for the final 9:16 clip
        let clipThumbUrl = '';
        try {
          clipThumbUrl = await generateThumbnail(renderResult.outputPath, 1, `thumb_${clipId}`);
        } catch (e) {
          console.warn('Clip thumbnail error:', e);
        }

        const generatedClip: GeneratedClip = {
          id: clipId,
          videoId,
          momentId: moment.id,
          title: moment.title,
          hook: moment.hook,
          startTime: moment.startTime,
          endTime: moment.endTime,
          duration: renderResult.duration,
          cropStyle,
          hasHeadline: addHeadline,
          headlineText: addHeadline ? headlineText : undefined,
          filePath: renderResult.outputPath,
          streamUrl: `/api/clips/${clipId}/stream`,
          downloadUrl: `/api/clips/${clipId}/download`,
          thumbnailUrl: clipThumbUrl || '',
          fileSize: renderResult.fileSize,
          resolution: '1080x1920 (9:16)',
          score: moment.score,
          suggestedCaption: moment.suggestedCaption,
          hashtags: moment.hashtags,
          createdAt: new Date().toISOString(),
        };

        clipsStore.set(clipId, generatedClip);

        job.progress = 100;
        job.status = 'completed';
        job.stage = '9:16 Clip Generated Successfully!';
        job.result = generatedClip;
      } catch (err: any) {
        console.error('Async clip generation error:', err);
        job.status = 'failed';
        job.error = err.message || 'FFmpeg clip generation failed';
      }
    })();

    res.json({ success: true, jobId, clipId });
  });

  // Check Job Status Endpoint (for progress bar & error states)
  app.get('/api/jobs/:jobId', (req: Request, res: Response) => {
    const { jobId } = req.params;
    const job = jobsStore.get(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ job });
  });

  // Get Generated Clip Details
  app.get('/api/clips/:clipId', (req: Request, res: Response) => {
    const { clipId } = req.params;
    const clip = clipsStore.get(clipId);
    if (!clip) {
      return res.status(404).json({ error: 'Clip not found' });
    }
    res.json({ clip });
  });

  // Stream Video with HTTP 206 Partial Content (critical for smooth HTML5 video player scrubbing)
  app.get('/api/clips/:clipId/stream', (req: Request, res: Response) => {
    const { clipId } = req.params;
    const clip = clipsStore.get(clipId);
    if (!clip || !fs.existsSync(clip.filePath)) {
      return res.status(404).json({ error: 'Clip video file not found' });
    }

    const videoPath = clip.filePath;
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  });

  // Stream Original Video
  app.get('/api/videos/:videoId/stream', (req: Request, res: Response) => {
    const { videoId } = req.params;
    const video = videosStore.get(videoId);
    if (!video || !fs.existsSync(video.filePath)) {
      return res.status(404).json({ error: 'Source video file not found' });
    }

    const videoPath = video.filePath;
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  });

  // Download Generated 9:16 Video
  app.get('/api/clips/:clipId/download', (req: Request, res: Response) => {
    const { clipId } = req.params;
    const clip = clipsStore.get(clipId);
    if (!clip || !fs.existsSync(clip.filePath)) {
      return res.status(404).json({ error: 'Clip file not found' });
    }

    const sanitizedTitle = clip.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const downloadFilename = `ClipForge_${sanitizedTitle}_9x16.mp4`;

    res.download(clip.filePath, downloadFilename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(rootDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClipForge AI backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
