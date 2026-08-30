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
  Cpu
} from 'lucide-react';
import { SampleVideoItem } from '../types.js';

interface UploadStepProps {
  onVideoSelected: (file: File) => Promise<void>;
  onSampleSelected: (sampleId: string) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  errorMessage?: string;
  samples: SampleVideoItem[];
}

export const UploadStep: React.FC<UploadStepProps> = ({
  onVideoSelected,
  onSampleSelected,
  isUploading,
  uploadProgress,
  errorMessage,
  samples,
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
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

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
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Title Section */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Full-Stack AI Video Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Turn Any Video Into <span className="text-indigo-400">Viral 9:16 Shorts</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Upload your podcast, interview, or talk. AI analyzes the dialogue, identifies peak viral moments with AI Content Scores, and FFmpeg renders studio-quality vertical clips.
        </p>
      </div>

      {/* Error Alert Display */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Processing Error</p>
            <p className="text-xs text-red-400/90 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Drag & Drop Card */}
      <div
        id="video-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/mp4,video/quicktime,video/x-matroska,video/webm,video/avi"
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-inner text-indigo-400 group-hover:scale-105 transition-transform">
            <Upload className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100">
              Drag and drop your video file here
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              or <span className="text-indigo-400 font-semibold underline underline-offset-2">browse from your computer</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">MP4</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">MOV</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">MKV</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">WEBM</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Up to 500MB</span>
          </div>
        </div>

        {/* Uploading Status Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-semibold text-slate-100">Uploading & Probing Video with FFprobe...</p>
              <p className="text-xs text-slate-400 font-mono">{uploadProgress}% complete</p>
            </div>
            <div className="w-48 h-1.5 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Ready-to-Test Sample Videos Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Or Try With Instant Demo Videos
            </h2>
          </div>
          <span className="text-xs text-slate-400">1-Click Test Workflow</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {samples.map((sample) => {
            const isLoading = loadingSampleId === sample.id;
            return (
              <div
                key={sample.id}
                id={`sample-card-${sample.id}`}
                onClick={() => !isUploading && !isLoading && handleSampleClick(sample.id)}
                className={`group p-4 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/70 hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isLoading ? 'opacity-70 pointer-events-none' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold border border-slate-700">
                      {sample.category}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" /> {sample.duration}s
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {sample.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {sample.description}
                  </p>
                </div>

                <button
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-700 group-hover:bg-indigo-500 text-slate-200 group-hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm border border-slate-600 group-hover:border-indigo-400/50"
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
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Guarantee & Pipeline Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200 block">Real FFmpeg Engine</span>
            <span>Server-side video cutting, audio extraction and 1080x1920 encoding.</span>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200 block">AI Virality Scoring</span>
            <span>Gemini evaluates hook retention, emotion, clarity, and pacing (70-99).</span>
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <Layers className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200 block">3 Conversion Styles</span>
            <span>Blurred backdrop, smart center crop, and top/bottom banner formats.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
