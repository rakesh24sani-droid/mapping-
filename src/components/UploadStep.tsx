import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Link as LinkIcon,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  Clock,
  Layers,
  ArrowRight,
  Cpu,
  Crown,
  Youtube,
  Globe,
  HardDrive,
  Copy,
  ClipboardPaste,
  Share2,
  Tv,
  Check,
  Video,
  FileVideo
} from 'lucide-react';
import { SampleVideoItem } from '../types.js';

interface UploadStepProps {
  onVideoSelected: (file: File) => Promise<void>;
  onUrlSelected: (url: string) => Promise<void>;
  onSampleSelected: (sampleId: string) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
  errorMessage?: string;
  samples: SampleVideoItem[];
  onOpenPricing?: () => void;
}

interface PresetUrlItem {
  title: string;
  category: string;
  url: string;
  duration: number;
  sampleId: string;
  badge: string;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  onVideoSelected,
  onUrlSelected,
  onSampleSelected,
  isUploading,
  uploadProgress,
  errorMessage,
  samples,
  onOpenPricing,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'samples'>('url');
  const [inputUrl, setInputUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const [presets, setPresets] = useState<PresetUrlItem[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch URL presets from backend
  useEffect(() => {
    fetch('/api/url-presets')
      .then((res) => res.json())
      .then((data) => {
        if (data.presets) setPresets(data.presets);
      })
      .catch((err) => console.warn('Could not load URL presets:', err));
  }, []);

  // Detect platform from entered URL
  const detectedPlatform = React.useMemo(() => {
    const u = inputUrl.trim().toLowerCase();
    if (!u) return null;
    if (u.includes('youtube.com') || u.includes('youtu.be')) {
      return { name: 'YouTube Video', icon: Youtube, color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30' };
    }
    if (u.includes('drive.google.com')) {
      return { name: 'Google Drive Video', icon: HardDrive, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' };
    }
    if (u.includes('loom.com')) {
      return { name: 'Loom Video', icon: Video, color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30' };
    }
    if (u.includes('vimeo.com')) {
      return { name: 'Vimeo Video', icon: Tv, color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' };
    }
    if (/\.(mp4|mov|webm|mkv|avi|m4v)(\?.*)?$/i.test(u)) {
      return { name: 'Direct Video Stream (MP4/WebM)', icon: FileVideo, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' };
    }
    return { name: 'Web Video URL', icon: Globe, color: 'text-indigo-300', bg: 'bg-indigo-500/15 border-indigo-500/30' };
  }, [inputUrl]);

  // Handle URL Form Submit
  const handleUrlSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputUrl.trim();
    if (!clean) return;
    await onUrlSelected(clean);
  };

  // Paste from clipboard
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputUrl(text.trim());
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  // Click on a preset link
  const handlePresetClick = (preset: PresetUrlItem) => {
    setInputUrl(preset.url);
    onUrlSelected(preset.url);
  };

  // Drag and drop handlers
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
          <span>Next-Gen AI Video to 9:16 Shorts Converter</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Turn Any Video Link Into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Viral 9:16 Shorts
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Paste any YouTube, Drive, or video link. AI detects dialogue peaks, computes viral hook retention scores, and FFmpeg renders 1080p vertical clips for Reels, Shorts & TikTok.
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

      {/* Tabs Navigation: URL Link vs File Upload vs Demo Videos */}
      <div className="flex items-center justify-center relative z-10">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
          <button
            id="tab-link-import"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Paste Video Link / URL</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/20 text-[10px] uppercase font-mono tracking-wider">
              Popular
            </span>
          </button>

          <button
            id="tab-file-upload"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>

          <button
            id="tab-demo-samples"
            onClick={() => setActiveTab('samples')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'samples'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Instant Demos</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT: 1. Paste Video Link / URL */}
      {activeTab === 'url' && (
        <motion.div
          key="tab-url-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-8 relative z-10"
        >
          {/* Main URL Input Card */}
          <div className="relative border border-slate-700/80 rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 shadow-2xl space-y-6">
            <div className="text-center space-y-1.5 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 mb-2">
                <LinkIcon className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Convert Any Video Link to 9:16 Shorts
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Paste a YouTube URL, Google Drive share link, Loom, Vimeo, or direct MP4 link
              </p>
            </div>

            {/* Input & Convert Bar */}
            <form onSubmit={handleUrlSubmit} className="space-y-3">
              <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5 p-2 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                <div className="flex items-center flex-1 px-3 gap-2">
                  <Globe className="w-5 h-5 text-slate-500 shrink-0" />
                  <input
                    id="video-url-input"
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=...) or MP4 URL"
                    disabled={isUploading}
                    className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 outline-none border-none py-2 font-normal"
                  />
                  {inputUrl && (
                    <button
                      type="button"
                      onClick={() => setInputUrl('')}
                      className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded-md hover:bg-slate-800"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    title="Paste from clipboard"
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-300 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer hover:border-slate-700 transition-colors"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Paste</span>
                  </button>
                </div>

                <button
                  id="btn-convert-link"
                  type="submit"
                  disabled={!inputUrl.trim() || isUploading}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Importing & Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>Convert Link to Shorts</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Detected Platform Tag */}
              {detectedPlatform && (
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${detectedPlatform.bg} ${detectedPlatform.color}`}>
                    <detectedPlatform.icon className="w-3.5 h-3.5" />
                    <span>Detected: <strong>{detectedPlatform.name}</strong></span>
                  </span>
                  <span className="text-slate-500 text-[11px]">Ready for automated AI viral clip isolation</span>
                </div>
              )}
            </form>

            {/* Supported Source Platform Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800">
                <Youtube className="w-3.5 h-3.5 text-rose-500" />
                <span>YouTube & Shorts</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Drive / Dropbox</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800">
                <Video className="w-3.5 h-3.5 text-indigo-400" />
                <span>Loom / Vimeo</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800">
                <FileVideo className="w-3.5 h-3.5 text-amber-400" />
                <span>Direct MP4 / WebM Link</span>
              </span>
            </div>

            {/* Uploading Status Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 space-y-4 z-20">
                <div className="w-14 h-14 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin shadow-lg shadow-indigo-500/20" />
                <div className="space-y-1 text-center">
                  <p className="text-base font-bold text-white">Importing Video Stream & Probing Metadata...</p>
                  <p className="text-xs text-indigo-400 font-mono font-bold">{uploadProgress}% Complete</p>
                </div>
                <div className="w-64 h-2 rounded-full bg-slate-800 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 text-center max-w-sm">
                  Extracting audio tracks, analyzing speech cadence, and preparing AI moment scoring...
                </p>
              </div>
            )}
          </div>

          {/* Quick-Try 1-Click Popular Video Presets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Try 1-Click Viral Video Links (Instant Test)
                </h3>
              </div>
              <span className="text-xs text-indigo-400 font-semibold">Click to test link conversion</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {(presets.length > 0 ? presets : [
                {
                  title: 'Huberman Lab: Dopamine & Focus Protocol',
                  category: 'Science & Health',
                  url: 'https://www.youtube.com/watch?v=QmOF0crdyRU',
                  duration: 55,
                  sampleId: 'huberman_focus',
                  badge: 'Popular Podcast',
                },
                {
                  title: 'Lex Fridman & Sam Altman: Future of AGI',
                  category: 'AI & Tech',
                  url: 'https://www.youtube.com/watch?v=L_Guz73G6QY',
                  duration: 60,
                  sampleId: 'lex_ai',
                  badge: 'Tech Hot Take',
                },
                {
                  title: 'MrBeast: How To Make Viral Videos',
                  category: 'Creator Strategy',
                  url: 'https://www.youtube.com/watch?v=0e3GPea1Tyg',
                  duration: 48,
                  sampleId: 'mrbeast_viral',
                  badge: 'Viral Secrets',
                },
                {
                  title: 'Finance & Investing: Building Wealth',
                  category: 'Finance & Money',
                  url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                  duration: 45,
                  sampleId: 'finance_wealth',
                  badge: 'High Retention',
                },
              ]).map((preset, idx) => (
                <motion.div
                  key={idx}
                  id={`preset-link-${idx}`}
                  whileHover={{ y: -3 }}
                  onClick={() => !isUploading && handlePresetClick(preset as any)}
                  className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-md"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20">
                        {preset.badge || preset.category}
                      </span>
                      <span className="text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {preset.duration}s
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {preset.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono truncate">
                      {preset.url}
                    </p>
                  </div>

                  <button
                    disabled={isUploading}
                    className="w-full py-2 px-2.5 rounded-xl text-xs font-bold bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white transition-all flex items-center justify-center gap-1.5 border border-slate-700 group-hover:border-indigo-500 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Convert This Link</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB CONTENT: 2. Drag & Drop File Upload */}
      {activeTab === 'upload' && (
        <motion.div
          key="tab-upload-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          id="video-dropzone"
          whileHover={{ scale: isUploading ? 1 : 1.006 }}
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center mx-auto shadow-xl text-indigo-300 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-indigo-400 animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Drag & Drop your long-form video here
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                or <span className="text-indigo-400 font-bold underline underline-offset-4 decoration-indigo-500 hover:text-indigo-300">click to browse local files</span>
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
      )}

      {/* TAB CONTENT: 3. Instant Demo Videos */}
      {activeTab === 'samples' && (
        <motion.div
          key="tab-samples-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4 relative z-10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Preloaded Studio Demo Videos
              </h2>
            </div>
            <span className="text-xs text-indigo-400 font-semibold">Instant AI Moment Isolation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {samples.map((sample) => {
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
                        <span>Loading Demo...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Use This Demo</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

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
