import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Cpu,
  Video,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Volume2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { VideoMetadata, ProcessingJob } from '../types.js';
import { ProgressBar } from './ProgressBar.js';

interface AnalysisStepProps {
  video: VideoMetadata;
  job: ProcessingJob | null;
  onRetry: () => void;
}

export const AnalysisStep: React.FC<AnalysisStepProps> = ({ video, job, onRetry }) => {
  const progress = job?.progress ?? 15;
  const stage = job?.stage ?? 'Initializing AI pipeline...';
  const detail = job?.detail ?? 'Preparing audio and video stream for analysis';
  const isFailed = job?.status === 'failed';

  const pipelineStages = [
    {
      id: 'audio',
      title: 'FFmpeg Audio Extraction',
      description: 'Extracting and normalising high-clarity vocal audio stream',
      icon: Volume2,
      isDone: progress > 30,
      isActive: progress <= 30 && !isFailed,
    },
    {
      id: 'gemini',
      title: 'Gemini AI Transcript & Dialogue Analysis',
      description: 'Parsing speech, understanding topics, and identifying speech peaks',
      icon: FileText,
      isDone: progress > 65,
      isActive: progress > 30 && progress <= 65 && !isFailed,
    },
    {
      id: 'scoring',
      title: 'Viral Hook & Content Scoring',
      description: 'Calculating hook strength, retention curve, and social media virality',
      icon: TrendingUp,
      isDone: progress >= 95,
      isActive: progress > 65 && progress < 95 && !isFailed,
    },
    {
      id: 'moments',
      title: 'Segment Keyframing',
      description: 'Extracting preview thumbnails for every suggested clip moment',
      icon: Sparkles,
      isDone: progress === 100,
      isActive: progress >= 95 && progress < 100 && !isFailed,
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
          <Cpu className="w-3.5 h-3.5" />
          <span>Stage 2: Real-time AI Analysis</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Analyzing Dialogue & Finding Best Moments
        </h2>
        <p className="text-sm text-slate-400">
          Our AI engine is listening to the video, detecting emotional hooks, and calculating virality scores.
        </p>
      </div>

      {/* Video Summary Card */}
      <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            <Video className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 line-clamp-1">{video.originalName}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
              <span>{Math.round(video.duration)}s duration</span>
              <span>•</span>
              <span>{video.width}x{video.height}</span>
              <span>•</span>
              <span>{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4" />
          <span>Ready for Processing</span>
        </div>
      </div>

      {/* Main Processing Status Box */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
        {isFailed ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-red-300">Analysis Encountered an Issue</h3>
              <p className="text-xs text-red-400 font-mono">{job?.error || 'Unknown error occurred'}</p>
            </div>
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Retry Analysis
            </button>
          </div>
        ) : (
          <>
            <ProgressBar progress={progress} stage={stage} detail={detail} />

            {/* Audio Wave Visualizer Animation */}
            <div className="h-14 w-full rounded-xl bg-[#020617] border border-slate-800 flex items-center justify-center gap-1 px-4 overflow-hidden">
              {Array.from({ length: 32 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full bg-indigo-500/80"
                  animate={{
                    height: [
                      8,
                      Math.max(10, Math.sin(i * 0.5 + Date.now() * 0.003) * 36 + 18),
                      12,
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8 + (i % 5) * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Pipeline Stage Items */}
            <div className="space-y-3 pt-2">
              {pipelineStages.map((stg) => {
                const Icon = stg.icon;
                return (
                  <div
                    key={stg.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      stg.isDone
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-300'
                        : stg.isActive
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        stg.isDone
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : stg.isActive
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {stg.isDone ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : stg.isActive ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${stg.isActive ? 'text-indigo-300' : 'text-slate-200'}`}>
                          {stg.title}
                        </span>
                        {stg.isDone && (
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold">Done</span>
                        )}
                        {stg.isActive && (
                          <span className="text-[10px] font-mono text-indigo-400 font-semibold animate-pulse">
                            Processing...
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{stg.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
