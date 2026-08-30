import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { VideoMetadata, BestMoment, VideoCropStyle, ClipGenerationOptions } from '../src/types.js';

const rootDir = process.cwd();

const uploadsDir = path.join(rootDir, 'storage', 'uploads');
const audioDir = path.join(rootDir, 'storage', 'audio');
const clipsDir = path.join(rootDir, 'storage', 'clips');
const thumbsDir = path.join(rootDir, 'storage', 'thumbs');

// Ensure storage directories exist
[uploadsDir, audioDir, clipsDir, thumbsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure ffmpeg & ffprobe binary paths
try {
  if (ffmpegInstaller && (ffmpegInstaller as any).path) {
    ffmpeg.setFfmpegPath((ffmpegInstaller as any).path);
  }
  if (ffprobeInstaller && (ffprobeInstaller as any).path) {
    ffmpeg.setFfprobePath((ffprobeInstaller as any).path);
  }
} catch (err) {
  console.log('Using system ffmpeg / ffprobe path if available:', err);
}

/**
 * Get accurate video metadata using FFprobe
 */
export function getVideoMetadata(filePath: string): Promise<{
  duration: number;
  width: number;
  height: number;
  fps: number;
  hasAudio: boolean;
  format: string;
  size: number;
}> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(new Error(`FFprobe failed: ${err.message}`));
      }

      const videoStream = metadata.streams?.find(s => s.codec_type === 'video');
      const audioStream = metadata.streams?.find(s => s.codec_type === 'audio');

      let fps = 30;
      if (videoStream?.r_frame_rate) {
        const parts = videoStream.r_frame_rate.split('/');
        if (parts.length === 2 && Number(parts[1]) > 0) {
          fps = Math.round(Number(parts[0]) / Number(parts[1]));
        }
      }

      const duration = Number(metadata.format?.duration || videoStream?.duration || 0);
      const width = Number(videoStream?.width || 1920);
      const height = Number(videoStream?.height || 1080);
      const size = Number(metadata.format?.size || fs.statSync(filePath).size);
      const format = metadata.format?.format_name || 'mp4';

      resolve({
        duration,
        width,
        height,
        fps: fps || 30,
        hasAudio: !!audioStream,
        format,
        size,
      });
    });
  });
}

/**
 * Generate a thumbnail frame from video at given timestamp
 */
export function generateThumbnail(videoPath: string, timestampSeconds: number, outputName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const filename = `${outputName}.jpg`;
    const outputPath = path.join(thumbsDir, filename);

    ffmpeg(videoPath)
      .screenshots({
        timestamps: [Math.max(0, timestampSeconds)],
        filename: filename,
        folder: thumbsDir,
        size: '640x?'
      })
      .on('end', () => {
        resolve(`/api/storage/thumbs/${filename}`);
      })
      .on('error', (err) => {
        console.error('Thumbnail generation error:', err);
        // If specific timestamp fails, fallback to 0
        ffmpeg(videoPath)
          .screenshots({
            timestamps: [0],
            filename: filename,
            folder: thumbsDir,
            size: '640x?'
          })
          .on('end', () => resolve(`/api/storage/thumbs/${filename}`))
          .on('error', (err2) => reject(err2));
      });
  });
}

/**
 * Extract audio track to lightweight MP3/WAV for fast Gemini transcript analysis
 */
export function extractAudio(videoPath: string, outputName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(audioDir, `${outputName}.mp3`);

    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .audioBitrate(96)
      .audioChannels(1)
      .audioFrequency(22050)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => {
        console.error('Audio extraction error:', err);
        reject(new Error(`Failed to extract audio: ${err.message}`));
      })
      .run();
  });
}

/**
 * Cut and convert video to 9:16 vertical format (1080x1920)
 * with real FFmpeg video filters and progress callbacks
 */
export function cutAndConvert916(
  inputVideoPath: string,
  outputClipId: string,
  options: {
    startTime: number;
    duration: number;
    cropStyle: VideoCropStyle;
    headlineText?: string;
    addHeadline?: boolean;
    accentColor?: string;
    resolution?: '720p' | '1080p' | '4k';
    watermark?: boolean;
    brandWatermark?: string;
  },
  onProgress?: (progressPercent: number) => void
): Promise<{ outputPath: string; fileSize: number; duration: number; resolution: string }> {
  return new Promise((resolve, reject) => {
    const outputFilename = `clip_${outputClipId}.mp4`;
    const outputPath = path.join(clipsDir, outputFilename);
    const {
      startTime,
      duration,
      cropStyle,
      headlineText,
      addHeadline,
      resolution = '1080p',
      watermark = false,
      brandWatermark,
    } = options;

    const outWidth = resolution === '720p' ? 720 : resolution === '4k' ? 2160 : 1080;
    const outHeight = resolution === '720p' ? 1280 : resolution === '4k' ? 3840 : 1920;
    const resString = `${outWidth}x${outHeight} (9:16)`;

    let filterComplex = '';

    // Choose 9:16 filter graph based on style
    if (cropStyle === 'smart-crop') {
      // Direct center 9:16 crop scaled to resolution
      filterComplex = `[0:v]crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=${outWidth}:${outHeight}:flags=lanczos,setsar=1[v_crop]`;
    } else if (cropStyle === 'fit-top-bottom') {
      // Fit video centered with sleek dark top/bottom bars (pad)
      filterComplex = `[0:v]scale=${outWidth}:-2,pad=${outWidth}:${outHeight}:(ow-iw)/2:(oh-ih)/2:color=black@1.0,setsar=1[v_crop]`;
    } else {
      // 'blurred-backdrop' (Default & standard for viral podcasts/interviews)
      // Background: scale to 9:16 cropped + boxblur
      // Foreground: scaled to output width, centered over blurred background
      filterComplex = [
        `[0:v]scale=${outWidth}:${outHeight}:force_original_aspect_ratio=increase,crop=${outWidth}:${outHeight},boxblur=25:5[bg]`,
        `[0:v]scale=${outWidth}:-2[fg]`,
        `[bg][fg]overlay=(W-w)/2:(H-h)/2:shortest=1,setsar=1[v_crop]`
      ].join(';');
    }

    let currentVideoMap = '[v_crop]';

    // Optional Headline overlay banner
    if (addHeadline && headlineText && headlineText.trim().length > 0) {
      const sanitizedText = headlineText.replace(/[:\\']/g, ' ');
      const bannerY = Math.round(outHeight * 0.06);
      const bannerH = Math.round(outHeight * 0.065);
      const fontSize = Math.round(outWidth * 0.034);
      filterComplex += `;${currentVideoMap}drawbox=x=30:y=${bannerY}:w=${outWidth - 60}:h=${bannerH}:color=black@0.85:t=fill,drawtext=text='${sanitizedText}':fontcolor=white:fontsize=${fontSize}:x=(w-text_w)/2:y=${bannerY + Math.round(bannerH * 0.3)}:shadowcolor=black@0.6:shadowx=2:shadowy=2[v_headline]`;
      currentVideoMap = '[v_headline]';
    }

    // Watermark overlay for Free plan or custom Brand watermark
    if (watermark) {
      const wmText = 'Made with ClipForge AI (Free Plan)';
      const wmFontSize = Math.round(outWidth * 0.024);
      const wmY = outHeight - Math.round(outHeight * 0.06);
      filterComplex += `;${currentVideoMap}drawbox=x=20:y=${wmY - 8}:w=${outWidth - 40}:h=${wmFontSize + 20}:color=black@0.7:t=fill,drawtext=text='${wmText}':fontcolor=white@0.9:fontsize=${wmFontSize}:x=(w-text_w)/2:y=${wmY}:shadowcolor=black:shadowx=1:shadowy=1[v_watermark]`;
      currentVideoMap = '[v_watermark]';
    } else if (brandWatermark && brandWatermark.trim().length > 0) {
      const brandSanitized = brandWatermark.replace(/[:\\']/g, ' ');
      const bmFontSize = Math.round(outWidth * 0.022);
      const bmY = outHeight - Math.round(outHeight * 0.05);
      filterComplex += `;${currentVideoMap}drawtext=text='${brandSanitized}':fontcolor=white@0.85:fontsize=${bmFontSize}:x=w-text_w-30:y=${bmY}:shadowcolor=black@0.8:shadowx=1:shadowy=1[v_brand]`;
      currentVideoMap = '[v_brand]';
    }

    const command = ffmpeg(inputVideoPath)
      .setStartTime(Math.max(0, startTime))
      .setDuration(duration)
      .complexFilter(filterComplex)
      .outputOptions([
        `-map ${currentVideoMap}`,
        '-map 0:a?', // copy audio if available
        '-c:v libx264',
        '-preset fast',
        '-crf 22',
        '-pix_fmt yuv420p',
        '-c:a aac',
        '-b:a 128k',
        '-movflags +faststart'
      ])
      .output(outputPath);

    command
      .on('start', (cmdline) => {
        console.log('Started FFmpeg clip generation:', cmdline);
      })
      .on('progress', (progress) => {
        if (progress && duration > 0) {
          // Calculate percentage based on timemark
          let percent = progress.percent;
          if (!percent && progress.timemark) {
            const timeParts = progress.timemark.split(':');
            if (timeParts.length === 3) {
              const currentSec = (+timeParts[0]) * 3600 + (+timeParts[1]) * 60 + (+timeParts[2]);
              percent = Math.min(99, Math.round((currentSec / duration) * 100));
            }
          }
          if (onProgress && typeof percent === 'number' && !isNaN(percent)) {
            onProgress(Math.min(99, Math.max(1, percent)));
          }
        }
      })
      .on('end', () => {
        if (onProgress) onProgress(100);
        try {
          const stats = fs.statSync(outputPath);
          resolve({
            outputPath,
            fileSize: stats.size,
            duration,
            resolution: resString,
          });
        } catch (err) {
          resolve({
            outputPath,
            fileSize: 0,
            duration,
            resolution: resString,
          });
        }
      })
      .on('error', (err, stdout, stderr) => {
        console.error('FFmpeg clip render failed:', err.message, stderr);
        reject(new Error(`FFmpeg error: ${err.message}`));
      });

    command.run();
  });
}

/**
 * Generate a rich, cinematic test sample video if user wants to test without uploading a huge file
 */
export function createSyntheticSampleVideo(sampleId: string, title: string, durationSec: number = 45): Promise<string> {
  return new Promise((resolve, reject) => {
    const filename = `sample_${sampleId}.mp4`;
    const outputPath = path.join(uploadsDir, filename);

    if (fs.existsSync(outputPath)) {
      return resolve(outputPath);
    }

    console.log(`Generating synthetic demo video: ${title}...`);
    // Create an animated 16:9 HD test video with title cards and audio tones/voice patterns
    ffmpeg()
      .input(`testsrc=duration=${durationSec}:size=1920x1080:rate=30`)
      .inputFormat('lavfi')
      .input(`sine=frequency=440:beep_factor=4:duration=${durationSec}`)
      .inputFormat('lavfi')
      .complexFilter([
        `[0:v]drawbox=x=100:y=100:w=1720:h=880:color=indigo@0.6:t=fill,` +
        `drawtext=text='ClipForge AI Demo':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=300:shadowcolor=black:shadowx=3:shadowy=3,` +
        `drawtext=text='${title}':fontcolor=yellow:fontsize=48:x=(w-text_w)/2:y=420,` +
        `drawtext=text='Time\\: %{pts\\:hms}':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=540[v]`
      ])
      .outputOptions([
        '-map [v]',
        '-map 1:a',
        '-c:v libx264',
        '-pix_fmt yuv420p',
        '-preset ultrafast',
        '-c:a aac',
        '-shortest'
      ])
      .output(outputPath)
      .on('end', () => {
        console.log(`Created sample video: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Failed to create sample video:', err);
        reject(err);
      })
      .run();
  });
}
