import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Upload,
  FileVideo,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Flame,
  Crown,
  Smartphone,
  Video,
  Radio,
  Tv
} from 'lucide-react';
import { SampleVideoItem } from '../types.js';

interface UploadStepProps {
  onVideoSelected: (file: File) => Promise<void>;
  onSampleSelected: (sampleId: string) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  errorMessage?: string;
  samples: SampleVideoItem[];
  onOpenPricing?: () => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  onVideoSelected,
  onSampleSelected,
  isUploading,
  uploadProgress,
  errorMessage,
  samples,
  onOpenPricing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateVideoFile(file)) {
        onVideoSelected(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateVideoFile(file)) {
        onVideoSelected(file);
      }
    }
  };

  const validateVideoFile = (file: File): boolean => {
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm', 'video/avi'];
    const validExtensions = ['.mp4', '.mov', '.mkv', '.webm', '.avi', '.m4v'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExt) {
      alert('Please select a valid video file (MP4, MOV, MKV, WEBM, AVI)');
      return false;
    }
    return true;
  };

  const handleSampleClick = async (sampleId: string) => {
    try {
      setLoadingSampleId(sampleId);
      await onSampleSelected(sampleId);
    } finally {
      setLoadingSampleId(null);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-8 space-y-10 overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Title Section with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3 max-w-3xl mx-auto relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Next-Gen AI Short-Form Video Studio</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Turn Any Video Into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Viral 9:16 Shorts
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Upload long-form podcasts, webinars, or streams. AI isolates dialogue peaks, computes viral hook scores, and FFmpeg renders 1080p vertical clips formatted for Reels, Shorts & TikTok.
        </p>

        {/* Social Platforms Target Badges */}
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>YouTube Shorts</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-500" />
            <span>Instagram Reels</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>TikTok (9:16)</span>
          </span>
          {onOpenPricing && (
            <button
              onClick={onOpenPricing}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 text-amber-300 font-bold hover:bg-indigo-600/40 transition-colors cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Plans from ₹49/mo</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Error Alert Display */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 flex items-start gap-3 text-sm shadow-lg"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Processing Error</p>
            <p className="text-xs text-red-400/90 mt-0.5">{errorMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Main Drag & Drop Card with Dynamic Glow Animation */}
      <motion.div
        id="video-dropzone"
        whileHover={{ scale: isUploading ? 1 : 1.008 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center transition-all cursor-pointer overflow-hidden shadow-2xl ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/15 ring-4 ring-indigo-500/20'
            : 'border-slate-700/80 hover:border-indigo-500/60 bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-950/80 hover:bg-slate-900/90'
        } ${isUploading ? 'pointer-events-none opacity-85' : ''}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/mp4,video/quicktime,video/x-matroska,video/webm,video/avi"
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4 relative z-10">
          {/* Pulsing Upload Icon Bubble */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center mx-auto shadow-xl text-indigo-300 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-indigo-400 animate-bounce" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Drag & Drop your long-form video here
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              or <span className="text-indigo-400 font-bold underline underline-offset-4 decoration-indigo-500 hover:text-indigo-300">click to browse files</span>
            </p>
          </div>

          {/* Supported format pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 font-mono text-slate-300">MP4</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 font-mono text-slate-300">MOV</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 font-mono text-slate-300">MKV</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 font-mono text-slate-300">WEBM</span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-emerald-400 font-semibold">Max 500MB</span>
          </div>
        </div>

        {/* Uploading Status Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-4 z-20">
            <div className="w-14 h-14 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin shadow-lg shadow-indigo-500/20" />
            <div className="space-y-1 text-center">
              <p className="text-base font-bold text-white">Uploading & Probing Video with FFprobe...</p>
              <p className="text-xs text-indigo-400 font-mono font-bold">{uploadProgress}% Complete</p>
            </div>
            <div className="w-56 h-2 rounded-full bg-slate-800 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Ready-to-Test Sample Videos Section */}
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Or Try With Instant Demo Videos
            </h2>
          </div>
          <span className="text-xs text-indigo-400 font-semibold">1-Click Instant AI Demo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {samples.map((sample, sIdx) => {
            const isLoading = loadingSampleId === sample.id;
            return (
              <motion.div
                key={sample.id}
                id={`sample-card-${sample.id}`}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => !isUploading && !isLoading && handleSampleClick(sample.id)}
                className={`group p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-lg ${
                  isLoading ? 'opacity-70 pointer-events-none' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/30">
                      {sample.category}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" /> {sample.duration}s
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {sample.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>
                </div>

                <button
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800 group-hover:bg-indigo-600 text-slate-200 group-hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-md border border-slate-700 group-hover:border-indigo-500 cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Loading Sample...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Use This Video</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Feature Guarantee & Pipeline Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400 relative z-10">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="font-bold text-white block">Real FFmpeg Engine</span>
            <span className="text-[11px] text-slate-400">Server-side video cutting, audio extraction and 1080x1920 encoding.</span>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="font-bold text-white block">AI Virality Scoring</span>
            <span className="text-[11px] text-slate-400">Gemini analyzes hook retention, clarity, flow, and virality potential (70-99).</span>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="font-bold text-white block">3 Auto-Reframe Styles</span>
            <span className="text-[11px] text-slate-400">Blurred backdrop, smart center crop, and top/bottom banner formats.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
