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
  getAllPlans,
  getUserSubscription,
  changeUserPlan,
  recordUsage,
  resetUsage,
  updateBrandKit,
} from './server/subscription-service.js';
import {
  importVideoFromUrl,
  detectUrlPlatform,
  POPULAR_PRESET_LINKS,
} from './server/url-importer.js';
import {
  VideoMetadata,
  AnalysisResult,
  GeneratedClip,
  ProcessingJob,
  ClipGenerationOptions,
  PlanId,
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

  // ==========================================
  // SUBSCRIPTION & PRICING PLAN ENDPOINTS
  // ==========================================

  // Get all subscription plans configuration (backend-driven)
  app.get('/api/subscription/plans', (req: Request, res: Response) => {
    res.json({ plans: getAllPlans() });
  });

  // Get current user subscription, minutes remaining and usage
  app.get('/api/subscription/user', (req: Request, res: Response) => {
    const subscription = getUserSubscription();
    res.json({ subscription });
  });

  // Change / Upgrade Plan (Simulated activation mode)
  app.post('/api/subscription/change-plan', (req: Request, res: Response) => {
    try {
      const { planId, billingCycle = 'monthly' } = req.body as { planId: PlanId; billingCycle?: 'monthly' | 'annual' };
      if (!planId || !['free', 'starter', 'creator', 'pro'].includes(planId)) {
        return res.status(400).json({ error: 'Invalid plan ID provided' });
      }

      const updated = changeUserPlan(planId, billingCycle);
      res.json({
        success: true,
        message: `Subscription successfully switched to ${updated.plan.name} plan!`,
        subscription: updated,
      });
    } catch (err: any) {
      console.error('Plan change error:', err);
      res.status(500).json({ error: err.message || 'Failed to update plan' });
    }
  });

  // Reset monthly usage (testing / demo convenience)
  app.post('/api/subscription/reset-usage', (req: Request, res: Response) => {
    const updated = resetUsage();
    res.json({ success: true, subscription: updated, message: 'Monthly usage minutes reset to 0.' });
  });

  // Update Creator/Pro Brand Kit
  app.post('/api/subscription/update-brand-kit', (req: Request, res: Response) => {
    const sub = getUserSubscription();
    if (!sub.plan.hasBrandKit) {
      return res.status(403).json({
        error: 'Brand Kit is available on CREATOR (₹249/mo) and PRO (₹699/mo) plans. Please upgrade to customize branding.',
        requiresUpgrade: true,
        recommendedPlan: 'creator',
      });
    }

    const { brandName, handle, primaryColor, showBrandWatermark } = req.body;
    const updated = updateBrandKit({
      brandName: brandName ?? sub.brandKit.brandName,
      handle: handle ?? sub.brandKit.handle,
      primaryColor: primaryColor ?? sub.brandKit.primaryColor,
      showBrandWatermark: showBrandWatermark ?? sub.brandKit.showBrandWatermark,
    });

    res.json({ success: true, subscription: updated, message: 'Brand Kit settings saved.' });
  });

  // Batch Generation of All Moments (Pro Plan Feature)
  app.post('/api/subscription/batch-generate', async (req: Request, res: Response) => {
    const sub = getUserSubscription();
    const { videoId, cropStyle = 'blurred-backdrop', addHeadline = true } = req.body;

    if (!sub.plan.hasBatchGeneration) {
      return res.status(403).json({
        error: '1-Click Batch Generation is exclusive to the PRO plan (₹699/mo). Please upgrade to unlock.',
        requiresUpgrade: true,
        recommendedPlan: 'pro',
      });
    }

    const video = videosStore.get(videoId);
    const analysis = analysisStore.get(videoId);
    if (!video || !analysis || !analysis.moments.length) {
      return res.status(404).json({ error: 'Video or moments not found for batch generation' });
    }

    // Calculate total duration
    const totalBatchDuration = analysis.moments.reduce((acc, m) => acc + m.duration, 0);
    const totalMinutesNeeded = Math.ceil((totalBatchDuration / 60) * 10) / 10;

    if (sub.minutesRemaining < totalMinutesNeeded) {
      return res.status(402).json({
        error: `Insufficient minutes remaining for batch generation (${totalMinutesNeeded} mins required, ${sub.minutesRemaining} mins remaining).`,
        minutesNeeded: totalMinutesNeeded,
        minutesRemaining: sub.minutesRemaining,
      });
    }

    const batchJobId = `job_batch_${Date.now()}`;
    const generatedClipIds: string[] = [];

    // Trigger batch generation asynchronously
    (async () => {
      for (let i = 0; i < analysis.moments.length; i++) {
        const moment = analysis.moments[i];
        const clipId = `clip_batch_${Date.now()}_${i}`;
        try {
          const renderResult = await cutAndConvert916(video.filePath, clipId, {
            startTime: moment.startTime,
            duration: moment.duration,
            cropStyle,
            headlineText: addHeadline ? moment.title : undefined,
            addHeadline,
            resolution: sub.plan.maxResolution,
            watermark: sub.plan.watermark,
            brandWatermark: sub.brandKit.showBrandWatermark ? sub.brandKit.handle : undefined,
          });

          let clipThumbUrl = '';
          try {
            clipThumbUrl = await generateThumbnail(renderResult.outputPath, 1, `thumb_${clipId}`);
          } catch (e) {
            console.warn('Clip thumbnail error:', e);
          }

          const clip: GeneratedClip = {
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
            headlineText: addHeadline ? moment.title : undefined,
            filePath: renderResult.outputPath,
            streamUrl: `/api/clips/${clipId}/stream`,
            downloadUrl: `/api/clips/${clipId}/download`,
            thumbnailUrl: clipThumbUrl || '',
            fileSize: renderResult.fileSize,
            resolution: renderResult.resolution,
            score: moment.score,
            suggestedCaption: moment.suggestedCaption,
            hashtags: moment.hashtags,
            createdAt: new Date().toISOString(),
          };

          clipsStore.set(clipId, clip);
          generatedClipIds.push(clipId);
        } catch (err) {
          console.error(`Batch render failed for moment ${moment.id}:`, err);
        }
      }

      recordUsage('batch_render', totalBatchDuration, `Batch Render: ${analysis.moments.length} Clips (${video.originalName})`);
    })();

    res.json({
      success: true,
      batchJobId,
      totalMoments: analysis.moments.length,
      estimatedMinutes: totalMinutesNeeded,
      message: `Batch rendering ${analysis.moments.length} vertical clips in background...`,
    });
  });

  // Get available sample demo videos
  app.get('/api/samples', (req: Request, res: Response) => {
    res.json({ samples: SAMPLE_VIDEOS });
  });

  // Get Popular Preset Links for 1-Click URL Testing
  app.get('/api/url-presets', (req: Request, res: Response) => {
    res.json({ presets: POPULAR_PRESET_LINKS });
  });

  // Import Video from Any URL (YouTube, Direct MP4, Google Drive, Loom, Vimeo, etc.)
  app.post('/api/import-url', async (req: Request, res: Response) => {
    try {
      const { url } = req.body as { url?: string };
      if (!url || typeof url !== 'string' || !url.trim()) {
        return res.status(400).json({ error: 'Please provide a valid video URL or YouTube link.' });
      }

      const rawUrl = url.trim();
      const jobId = `job_import_${Date.now()}`;
      const { type } = detectUrlPlatform(rawUrl);

      const job: ProcessingJob = {
        id: jobId,
        type: 'upload',
        status: 'processing',
        progress: 10,
        stage: `Connecting to ${type.toUpperCase()} stream...`,
        detail: `Analyzing video link: ${rawUrl.slice(0, 60)}...`,
      };
      jobsStore.set(jobId, job);

      // Perform import
      try {
        const importResult = await importVideoFromUrl(rawUrl, (prog) => {
          job.progress = prog.progress;
          job.stage = prog.stage;
          job.detail = prog.message;
        });

        const videoData = importResult.video;
        videosStore.set(videoData.id, videoData);

        job.progress = 100;
        job.status = 'completed';
        job.stage = 'Video imported successfully!';
        job.result = videoData;

        return res.json({
          success: true,
          jobId,
          video: videoData,
          sourceType: importResult.sourceType,
          title: importResult.title,
        });
      } catch (importErr: any) {
        job.status = 'failed';
        job.error = importErr.message || 'Failed to download or import video from URL';
        console.error('URL import error:', importErr);
        return res.status(500).json({ error: importErr.message || 'Failed to import video from link' });
      }
    } catch (err: any) {
      console.error('URL import handler error:', err);
      res.status(500).json({ error: err.message || 'Server error during URL import' });
    }
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

    const sub = getUserSubscription();
    const minutesNeeded = Math.max(0.1, Number((video.duration / 60).toFixed(1)));
    if (sub.minutesRemaining < minutesNeeded) {
      return res.status(402).json({
        error: `Insufficient processing credits. This video requires ${minutesNeeded} minutes of processing, but you only have ${sub.minutesRemaining} minutes remaining on your ${sub.plan.name} plan.`,
        minutesNeeded,
        minutesRemaining: sub.minutesRemaining,
        currentPlan: sub.plan.name,
      });
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

        // Record audio analysis usage
        recordUsage('analysis', video.duration, `AI Analysis: ${video.originalName}`, `Extracted audio and detected ${result.moments.length} viral clips`);
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

    const sub = getUserSubscription();
    const clipMinutesNeeded = Math.max(0.1, Number((moment.duration / 60).toFixed(1)));
    if (sub.minutesRemaining < clipMinutesNeeded) {
      return res.status(402).json({
        error: `Insufficient processing credits to render this clip (${clipMinutesNeeded} mins required, ${sub.minutesRemaining} mins remaining on ${sub.plan.name} plan). Please upgrade your plan.`,
        minutesNeeded: clipMinutesNeeded,
        minutesRemaining: sub.minutesRemaining,
      });
    }

    const clipId = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const jobId = `job_gen_${clipId}`;

    const renderResolution = sub.plan.maxResolution;
    const shouldWatermark = sub.plan.watermark;
    const brandWatermarkText = sub.plan.hasBrandKit && sub.brandKit.showBrandWatermark ? sub.brandKit.handle : undefined;

    const job: ProcessingJob = {
      id: jobId,
      type: 'generate_clip',
      status: 'processing',
      progress: 5,
      stage: 'Initializing FFmpeg 9:16 rendering pipeline...',
      detail: `Applying ${cropStyle} vertical layout (${renderResolution.toUpperCase()})`,
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
            accentColor: sub.plan.hasBrandKit && sub.brandKit.primaryColor ? sub.brandKit.primaryColor : accentColor,
            resolution: renderResolution,
            watermark: shouldWatermark,
            brandWatermark: brandWatermarkText,
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
          resolution: renderResult.resolution,
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

        // Record clip render usage
        recordUsage('clip_render', moment.duration, `Render Clip: ${moment.title}`, `Rendered 9:16 at ${renderResult.resolution}${shouldWatermark ? ' (Watermarked)' : ''}`);
      } catch (err: any) {
        console.error('Async clip generation error:', err);
        job.status = 'failed';
        job.error = err.message || 'FFmpeg clip generation failed';
      }
    })();

    res.json({ success: true, jobId, clipId });
  });

  // Check Job Status Endpoint (supports both /api/jobs/:jobId and /api/job/:jobId)
  const getJobHandler = (req: Request, res: Response) => {
    const { jobId } = req.params;
    const job = jobsStore.get(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found', jobId });
    }
    res.json({ success: true, job });
  };
  app.get('/api/jobs/:jobId', getJobHandler);
  app.get('/api/job/:jobId', getJobHandler);

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

  // Express Centralized API Error Handling Middleware
  app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Unhandled Express Error:', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      timestamp: new Date().toISOString(),
    });
  });

  // Background Cleanup for Temp Files older than 4 hours
  setInterval(() => {
    try {
      const now = Date.now();
      const maxAgeMs = 4 * 60 * 60 * 1000; // 4 hours
      [uploadsDir, clipsDir].forEach((folder) => {
        if (!fs.existsSync(folder)) return;
        const files = fs.readdirSync(folder);
        files.forEach((file) => {
          if (file.startsWith('sample_')) return; // Keep demo files
          const filePath = path.join(folder, file);
          try {
            const stat = fs.statSync(filePath);
            if (now - stat.mtimeMs > maxAgeMs) {
              fs.unlinkSync(filePath);
            }
          } catch {}
        });
      });
    } catch (e) {
      console.warn('Storage cleanup non-critical error:', e);
    }
  }, 30 * 60 * 1000);

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

// Global Process Crash Prevention
process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled Promise Rejection caught safely:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception caught safely:', err);
});

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
