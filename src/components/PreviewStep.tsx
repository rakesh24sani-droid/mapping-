import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  Scissors,
  ArrowLeft,
  Flame,
  CheckCircle2,
  Smartphone,
  Video,
  Layers,
  FileCheck,
  TrendingUp
} from 'lucide-react';
import { GeneratedClip, VideoMetadata } from '../types.js';
import { VideoPlayer916 } from './VideoPlayer916.js';

interface PreviewStepProps {
  clip: GeneratedClip;
  video: VideoMetadata;
  onBackToMoments: () => void;
  onReconfigureStyle: () => void;
}

export const PreviewStep: React.FC<PreviewStepProps> = ({
  clip,
  video,
  onBackToMoments,
  onReconfigureStyle,
}) => {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [activeTab, setActiveTab] = useState<'9:16' | 'compare'>('9:16');

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#A855F7', '#F59E0B', '#10B981'],
      });
    } catch (e) {
      // Ignore if canvas confetti not available
    }
  }, []);

  const handleCopyCaption = () => {
    const fullText = `${clip.suggestedCaption}\n\n${clip.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const getStyleLabel = (style: string) => {
    switch (style) {
      case 'blurred-backdrop': return 'Blurred Backdrop (16:9 in 9:16)';
      case 'smart-crop': return 'Smart Center Crop (Full 9:16)';
      case 'fit-top-bottom': return 'Fit with Letterbox Bars';
      default: return style;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>9:16 Vertical Clip Rendered Successfully</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {clip.title}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {clip.resolution} • {Math.round(clip.duration)} seconds • {(clip.fileSize / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>

        <button
          onClick={onBackToMoments}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 self-start sm:self-auto cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Moments</span>
        </button>
      </div>

      {/* Main Grid: Player on left, Actions & Details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Vertical Player */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-4">
          <div className="w-full flex items-center justify-center">
            <VideoPlayer916
              src={clip.streamUrl}
              poster={clip.thumbnailUrl}
              title={clip.title}
              autoPlay={true}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Real FFmpeg rendered MP4 output</span>
          </div>
        </div>

        {/* Right Column: Download, Caption, Virality Analytics */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Action Card */}
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black text-2xl shadow-md">
                  <span>{clip.score}</span>
                  <span className="text-[8px] uppercase tracking-wider -mt-1 font-bold">Score</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Ready for Social Export</h3>
                  <p className="text-xs text-slate-400">Formatted for TikTok, Instagram Reels & YouTube Shorts</p>
                </div>
              </div>

              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                {getStyleLabel(clip.cropStyle)}
              </span>
            </div>

            {/* Direct Download Button */}
            <a
              id="download-clip-btn"
              href={clip.downloadUrl}
              download
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer text-center"
            >
              <Download className="w-5 h-5" />
              <span>Download 9:16 Video (.MP4)</span>
            </a>

            {/* Re-render or pick another style */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={onReconfigureStyle}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>Re-render in another layout</span>
              </button>

              <button
                onClick={onBackToMoments}
                className="text-slate-400 hover:text-slate-200 font-medium cursor-pointer"
              >
                Pick another moment ({Math.round(clip.duration)}s)
              </button>
            </div>
          </div>

          {/* Social Caption & Hashtag Box */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  AI-Generated Viral Caption
                </h4>
              </div>

              <button
                id="copy-caption-btn"
                onClick={handleCopyCaption}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700"
              >
                {copiedCaption ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Caption & Tags</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#020617] border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans space-y-2">
              <p>{clip.suggestedCaption}</p>
              <div className="flex flex-wrap gap-1.5 pt-1 text-xs text-indigo-400 font-mono">
                {clip.hashtags.map((tag, idx) => (
                  <span key={idx} className="hover:underline cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Render Specifications */}
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/40 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Clip Specifications
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-300">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Resolution</span>
                <span>1080x1920</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Aspect Ratio</span>
                <span>9:16 Portrait</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Codec</span>
                <span>H.264 / AAC</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Duration</span>
                <span>{Math.round(clip.duration)}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
