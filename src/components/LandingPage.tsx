import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Link as LinkIcon,
  Upload,
  Zap,
  Play,
  CheckCircle2,
  Crown,
  Share2,
  Lock,
  Cloud,
  Cpu,
  Tv,
  Film,
  ArrowRight,
  Youtube,
  Instagram,
  Heart,
  MessageCircle,
  Bookmark,
  Smartphone,
  Check,
  Video,
  Layers,
  Flame,
  Shield,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Subtitles,
  Activity,
  HardDrive
} from 'lucide-react';
import { SampleVideoItem, UserSubscription, UserProfile } from '../types.js';

interface LandingPageProps {
  onUrlSelected: (url: string) => Promise<void>;
  onVideoSelected: (file: File) => Promise<void>;
  onSampleSelected: (sampleId: string) => Promise<void>;
  onOpenPricing: () => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  samples: SampleVideoItem[];
  subscription: UserSubscription | null;
  currentUser: UserProfile | null;
  isUploading: boolean;
  uploadProgress?: number;
  errorMessage?: string;
  onClearError?: () => void;
  onSignOut: () => void;
  onOpenStudio?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onUrlSelected,
  onVideoSelected,
  onSampleSelected,
  onOpenPricing,
  onOpenAuth,
  samples,
  subscription,
  currentUser,
  isUploading,
  uploadProgress = 0,
  errorMessage,
  onClearError,
  onSignOut,
  onOpenStudio,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'home' | 'features' | 'how-it-works' | 'pricing' | 'blog'>('home');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [isPlayingMockVideo, setIsPlayingMockVideo] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick preset links for 1-click test
  const quickPresets = [
    {
      name: 'Huberman Lab',
      badge: '🎙️ Podcast',
      url: 'https://www.youtube.com/watch?v=QmOF0crdyRU',
      sampleId: 'huberman_focus',
    },
    {
      name: 'Sam Altman & Lex',
      badge: '🤖 AI & Tech',
      url: 'https://www.youtube.com/watch?v=L_Guz73G6QY',
      sampleId: 'lex_ai',
    },
    {
      name: 'MrBeast Viral',
      badge: '⚡ Creator',
      url: 'https://www.youtube.com/watch?v=0e3GPea1Tyg',
      sampleId: 'mrbeast_viral',
    },
    {
      name: 'Finance & Wealth',
      badge: '💰 Money',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      sampleId: 'finance_wealth',
    },
  ];

  // Handle Convert Now
  const handleConvertSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onClearError) onClearError();
    const cleanUrl = inputUrl.trim();
    if (!cleanUrl) {
      // If empty, prompt with default preset or first sample
      if (samples.length > 0) {
        await onSampleSelected(samples[0].id);
      }
      return;
    }
    await onUrlSelected(cleanUrl);
  };

  // Handle preset pill click
  const handlePresetClick = async (preset: typeof quickPresets[0]) => {
    if (onClearError) onClearError();
    setInputUrl(preset.url);
    await onUrlSelected(preset.url);
  };

  // Handle Upload File button click
  const handleUploadClick = () => {
    if (onClearError) onClearError();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (onClearError) onClearError();
      onVideoSelected(file);
    }
  };

  // Drag & drop handlers
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
    if (onClearError) onClearError();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onVideoSelected(file);
    }
  };

  // Handle Try Demo button click
  const handleTryDemoClick = () => {
    if (samples.length > 0) {
      // Pick first sample or open quick selector
      setIsDemoModalOpen(true);
    }
  };

  // Smooth scroll helper
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-indigo-900/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[1600px] left-0 w-[600px] h-[600px] bg-purple-900/10 blur-3xl pointer-events-none -z-10" />

      {/* Hidden File Input for Direct Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/x-matroska,video/webm,video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-[#090d1a]/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/30 text-sm tracking-tight group-hover:scale-105 transition-transform">
              CF
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              ClipForge <span className="text-indigo-400">AI</span>
            </span>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <button
              onClick={() => {
                setActiveTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`transition-colors hover:text-white cursor-pointer pb-1 relative ${
                activeTab === 'home' ? 'text-white font-semibold' : 'text-slate-400'
              }`}
            >
              Home
              {activeTab === 'home' && (
                <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('features');
                scrollToSection('features-section');
              }}
              className={`transition-colors hover:text-white cursor-pointer pb-1 relative ${
                activeTab === 'features' ? 'text-white font-semibold' : 'text-slate-400'
              }`}
            >
              Features
            </button>

            <button
              onClick={() => {
                setActiveTab('how-it-works');
                scrollToSection('how-it-works-section');
              }}
              className={`transition-colors hover:text-white cursor-pointer pb-1 relative ${
                activeTab === 'how-it-works' ? 'text-white font-semibold' : 'text-slate-400'
              }`}
            >
              How It Works
            </button>

            <button
              onClick={() => {
                onOpenPricing();
              }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Pricing
            </button>

            <button
              onClick={() => setIsBlogModalOpen(true)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Blog
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="w-5 h-5 rounded-md bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-white max-w-[120px] truncate hidden sm:inline">
                    {currentUser.name}
                  </span>
                </div>
                {onOpenStudio && (
                  <button
                    onClick={onOpenStudio}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <span>Open Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <button
                  id="nav-login-btn"
                  onClick={() => onOpenAuth('signin')}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button
                  id="nav-get-started-btn"
                  onClick={() => onOpenAuth('signup')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Input bar, Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI-Powered • Fast • Accurate</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
              Turn Any Video Link <br />
              Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Viral 9:16 Shorts</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Paste any YouTube, Drive, or video link. Our AI finds the best moments, adds captions, and delivers ready-to-post Shorts.
            </p>

            {/* Feature Bullets Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>AI Scene Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-[10px]">
                  CC
                </div>
                <span>Smart Captions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <span>1080p Vertical Export</span>
              </div>
            </div>

            {/* Interactive Link Input & Convert Bar */}
            <div className="pt-3 space-y-4">
              {/* Error Alert if any */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-900/60 text-rose-400 flex items-center justify-center shrink-0">
                      ⚠️
                    </div>
                    <p className="font-medium text-rose-100">{errorMessage}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleTryDemoClick}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow"
                    >
                      Try Demo Video
                    </button>
                    {onClearError && (
                      <button
                        onClick={onClearError}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-800/60 text-rose-300 text-xs cursor-pointer"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Form Input Bar with Drag & Drop */}
              <form
                onSubmit={handleConvertSubmit}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0 p-1.5 rounded-2xl bg-slate-900/90 border transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-950/30 scale-[1.01] shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500/50'
                    : 'border-slate-700/80 shadow-2xl focus-within:border-indigo-500'
                }`}
              >
                <div className="flex items-center gap-3 pl-3.5 pr-2 py-2 flex-1">
                  <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="url"
                    id="hero-video-url-input"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      if (errorMessage && onClearError) onClearError();
                    }}
                    placeholder="Paste YouTube / Drive / Direct Video link here..."
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  id="hero-convert-btn"
                  disabled={isUploading}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-98 shrink-0 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Convert Now</span>
                </button>
              </form>

              {/* Quick 1-Click Preset Test Links */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Quick Test:</span>
                </span>
                {quickPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    disabled={isUploading}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                  >
                    <span>{preset.badge}</span>
                    <span className="font-medium">{preset.name}</span>
                  </button>
                ))}
              </div>

              {/* Divider 'or' */}
              <div className="relative flex items-center justify-center my-2">
                <div className="w-full border-t border-slate-800/80" />
                <span className="absolute bg-[#070b14] px-4 text-xs font-semibold text-slate-500 lowercase tracking-wider">
                  or upload directly
                </span>
              </div>

              {/* Two Secondary Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="hero-upload-file-btn"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>Upload File (MP4/MOV)</span>
                </button>

                <button
                  type="button"
                  id="hero-try-demo-btn"
                  onClick={handleTryDemoClick}
                  disabled={isUploading}
                  className="py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Try Demo Studio</span>
                </button>
              </div>

              {/* Microcopy & Pricing Link */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
                <span>No credit card required</span>
                <button
                  onClick={onOpenPricing}
                  className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1.5 cursor-pointer hover:underline"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Plans from ₹49/mo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 9:16 Interactive Mockup & Scrubber Filmstrip */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            
            {/* Top Floating Badge: AI Generated */}
            <div className="relative w-full max-w-[340px] flex flex-col items-center">
              <div className="z-20 -mb-3 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/40 border border-indigo-400/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Generated</span>
              </div>

              {/* Left Floating Tooltip: AI Finds Best Moments */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute -left-12 sm:-left-20 top-24 z-30 p-2.5 rounded-xl bg-slate-900/95 border border-indigo-500/40 shadow-xl backdrop-blur-md text-left hidden sm:flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white leading-tight">AI Finds</div>
                  <div className="text-[9px] text-indigo-300 font-semibold">Best Moments</div>
                </div>
              </motion.div>

              {/* Right Floating Tooltip: Auto Captions & Emojis */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute -right-12 sm:-right-24 top-16 z-30 p-2.5 rounded-xl bg-slate-900/95 border border-indigo-500/40 shadow-xl backdrop-blur-md text-left hidden sm:flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                  CC
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white leading-tight">Auto Captions</div>
                  <div className="text-[9px] text-indigo-300 font-semibold">& Emojis</div>
                </div>
              </motion.div>

              {/* Bottom Right Tooltip: Vertical 9:16 Export */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -right-10 sm:-right-20 bottom-24 z-30 p-2.5 rounded-xl bg-slate-900/95 border border-indigo-500/40 shadow-xl backdrop-blur-md text-left hidden sm:flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white leading-tight">Vertical 9:16</div>
                  <div className="text-[9px] text-indigo-300 font-semibold">Export</div>
                </div>
              </motion.div>

              {/* Vertical Phone Screen Device Frame */}
              <div className="w-full aspect-[9/16] rounded-3xl bg-slate-950 border-4 border-slate-800 shadow-[0_0_50px_rgba(79,70,229,0.25)] overflow-hidden relative group">
                
                {/* Simulated Speaker Image / Video Background */}
                <div className="absolute inset-0 bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                    alt="AI Video Short Preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Dark vignette gradient for social icons & captions readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
                </div>

                {/* Right Engagement Actions (TikTok / Reels style) */}
                <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 z-20">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-rose-500 hover:scale-110 transition-transform">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    </div>
                    <span className="text-[10px] font-bold text-white drop-shadow">10.4K</span>
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-white drop-shadow">512</span>
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-white drop-shadow">512</span>
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-white drop-shadow">1.2K</span>
                  </div>
                </div>

                {/* Overlaid Captions */}
                <div className="absolute inset-x-4 bottom-24 z-20 text-center">
                  <div className="inline-block px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-sm border border-white/10 shadow-lg">
                    <p className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-md">
                      The secret to building <span className="text-amber-400 underline decoration-amber-400 decoration-2">wealth</span>
                    </p>
                  </div>
                </div>

                {/* Bottom Timeline Play Bar */}
                <div className="absolute inset-x-3 bottom-3 z-20 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/90 px-1">
                    <span className="flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-white text-white" /> 0:12 / 0:45
                    </span>
                    <span className="text-emerald-400 font-bold">1080p 60fps</span>
                  </div>
                  <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="w-[30%] h-full bg-indigo-500 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Multi-Frame Video Filmstrip Scrubbing Bar Below Phone */}
              <div className="w-full mt-3 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
                <div className="flex items-center gap-1 relative h-10 rounded-lg overflow-hidden bg-slate-950">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                    <div key={idx} className="flex-1 h-full relative overflow-hidden opacity-60">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"
                        alt="Frame thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}

                  {/* Active Highlight Selected Range */}
                  <div className="absolute left-[25%] width-[45%] h-full border-2 border-indigo-400 bg-indigo-500/25 rounded flex items-center justify-between px-1 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    <div className="w-1.5 h-6 bg-white rounded-full" />
                    <span className="text-[9px] font-black text-white bg-indigo-600 px-1 rounded shadow">
                      BEST MOMENT (98)
                    </span>
                    <div className="w-1.5 h-6 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TRUSTED BY 10,000+ CREATORS & TEAMS */}
      {/* ========================================================================= */}
      <section className="py-10 border-y border-slate-800/60 bg-[#090e1c]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
            Trusted by 10,000+ creators & teams
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all text-slate-300">
            {/* YouTube */}
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base hover:text-rose-500 transition-colors">
              <Youtube className="w-5 h-5 text-rose-500" />
              <span>YouTube</span>
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base hover:text-pink-500 transition-colors">
              <Instagram className="w-5 h-5 text-pink-500" />
              <span>Instagram</span>
            </div>

            {/* TikTok */}
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base hover:text-cyan-400 transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
              <span>TikTok</span>
            </div>

            {/* Google Drive */}
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base hover:text-emerald-400 transition-colors">
              <HardDrive className="w-5 h-5 text-emerald-400" />
              <span>Google Drive</span>
            </div>

            {/* Dropbox */}
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base hover:text-blue-400 transition-colors">
              <Cloud className="w-5 h-5 text-blue-400" />
              <span>Dropbox</span>
            </div>

            {/* Vimeo */}
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base hover:text-cyan-400 transition-colors">
              <Tv className="w-5 h-5 text-cyan-400" />
              <span>Vimeo</span>
            </div>

            {/* Loom */}
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base hover:text-indigo-400 transition-colors">
              <Video className="w-5 h-5 text-indigo-400" />
              <span>Loom</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS SECTION */}
      {/* ========================================================================= */}
      <section id="how-it-works-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-black uppercase tracking-widest">
            HOW IT WORKS
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            3 Simple Steps to Viral Shorts
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            From long videos to viral content in minutes.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative items-stretch">
          
          {/* Step 1 */}
          <div className="relative p-8 rounded-3xl bg-[#0d1424] border border-slate-800/80 shadow-xl flex flex-col items-center text-center space-y-4 hover:border-indigo-500/40 transition-colors group">
            <div className="absolute -top-3.5 w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-indigo-600/30">
              1
            </div>

            <div className="w-14 h-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <LinkIcon className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Paste or Upload</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Paste any video link (YouTube, Drive, Vimeo) or upload your file.
            </p>
          </div>

          {/* Arrow 1 */}
          <div className="hidden md:flex absolute left-[32%] top-1/2 -translate-y-1/2 z-10 text-slate-600">
            <ArrowRight className="w-6 h-6" />
          </div>

          {/* Step 2 */}
          <div className="relative p-8 rounded-3xl bg-[#0d1424] border border-slate-800/80 shadow-xl flex flex-col items-center text-center space-y-4 hover:border-indigo-500/40 transition-colors group">
            <div className="absolute -top-3.5 w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-indigo-600/30">
              2
            </div>

            <div className="w-14 h-14 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">AI Analyzes</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Our AI detects the best moments, scores them & adds captions.
            </p>
          </div>

          {/* Arrow 2 */}
          <div className="hidden md:flex absolute left-[65%] top-1/2 -translate-y-1/2 z-10 text-slate-600">
            <ArrowRight className="w-6 h-6" />
          </div>

          {/* Step 3 */}
          <div className="relative p-8 rounded-3xl bg-[#0d1424] border border-slate-800/80 shadow-xl flex flex-col items-center text-center space-y-4 hover:border-indigo-500/40 transition-colors group">
            <div className="absolute -top-3.5 w-7 h-7 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-indigo-600/30">
              3
            </div>

            <div className="w-14 h-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Get Your Shorts</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Download vertical 9:16 shorts ready to post & go viral.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. POWERFUL FEATURES SECTION */}
      {/* ========================================================================= */}
      <section id="features-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-black uppercase tracking-widest">
            POWERFUL FEATURES
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Everything You Need to Create Viral Shorts
          </h2>
        </div>

        {/* 8 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          
          {/* 1. AI Scene Detection */}
          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">AI Scene Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Finds the most engaging moments automatically.
            </p>
          </div>

          {/* 2. Smart Captions */}
          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
              CC
            </div>
            <h3 className="font-bold text-sm text-white">Smart Captions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-generate captions with emojis & highlight keywords.
            </p>
          </div>

          {/* 3. 9:16 Vertical Export */}
          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">9:16 Vertical Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Perfect vertical format for Reels, Shorts & TikTok.
            </p>
          </div>

          {/* 4. 1080p Quality */}
          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xs">
              HD
            </div>
            <h3 className="font-bold text-sm text-white">1080p Quality</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export in high quality for professional results.
            </p>
          </div>

          {/* 5. Multi-Platform Ready */}
          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Multi-Platform Ready</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optimized for YouTube Shorts, Instagram Reels & TikTok.
            </p>
          </div>

          {/* 6. Lightning Fast */}
          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <h3 className="font-bold text-sm text-white">Lightning Fast</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get your shorts in minutes, not hours.
            </p>
          </div>

          {/* 7. Secure & Private */}
          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Secure & Private</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your videos are secure and never shared.
            </p>
          </div>

          {/* 8. Cloud Storage */}
          <div className="p-6 rounded-2xl bg-[#0d1424] border border-slate-800/80 hover:border-indigo-500/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Cloud Storage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All your projects saved in the cloud.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION (CTA) BANNER */}
      {/* ========================================================================= */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-fuchsia-700 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Subtle glow decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Left Text */}
          <div className="flex items-center gap-5 z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Crown className="w-7 h-7" />
            </div>
            <div className="space-y-1 text-left">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Start Creating Viral Shorts Today
              </h3>
              <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
                Join thousands of creators who are growing their audience with AI-powered shorts.
              </p>
            </div>
          </div>

          {/* Right Action */}
          <div className="flex flex-col items-center md:items-end gap-2 z-10 shrink-0">
            <button
              onClick={onOpenPricing}
              className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105 active:scale-95"
            >
              <span>View Plans</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
            <span className="text-xs text-indigo-200 font-medium">
              Plans from ₹49/month
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER SECTION */}
      {/* ========================================================================= */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#060912] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Top 5 Column Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-left">
            
            {/* Col 1: Brand Info & Socials */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">
                  CF
                </div>
                <span className="text-lg font-bold text-white tracking-tight">ClipForge AI</span>
              </div>

              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                AI-powered platform to turn long videos into viral 9:16 shorts in minutes.
              </p>

              <div className="flex items-center gap-3 pt-2 text-slate-400">
                <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors">
                  <span className="font-black text-xs">𝕏</span>
                </a>
              </div>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => scrollToSection('features-section')} className="hover:text-white transition-colors cursor-pointer">Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works-section')} className="hover:text-white transition-colors cursor-pointer">How It Works</button></li>
                <li><button onClick={onOpenPricing} className="hover:text-white transition-colors cursor-pointer">Pricing</button></li>
                <li><button onClick={() => setIsBlogModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">Blog</button></li>
                <li><span className="text-slate-500">Changelog</span></li>
              </ul>
            </div>

            {/* Col 3: Company */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><span className="hover:text-white cursor-pointer">About Us</span></li>
                <li><span className="hover:text-white cursor-pointer">Contact</span></li>
                <li><span className="hover:text-white cursor-pointer">Careers</span></li>
                <li><span className="hover:text-white cursor-pointer">Affiliate Program</span></li>
                <li><span className="hover:text-white cursor-pointer">Privacy Policy</span></li>
              </ul>
            </div>

            {/* Col 4: Resources */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><span className="hover:text-white cursor-pointer">Help Center</span></li>
                <li><span className="hover:text-white cursor-pointer">Tutorials</span></li>
                <li><span className="hover:text-white cursor-pointer">API Docs</span></li>
                <li><span className="hover:text-white cursor-pointer">Status</span></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Made with Heart */}
          <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2025 ClipForge AI. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <span className="text-rose-500">❤️</span> for creators
            </p>
          </div>

        </div>
      </footer>

      {/* ========================================================================= */}
      {/* DEMO VIDEO SELECTOR MODAL (When clicking Try Demo) */}
      {/* ========================================================================= */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Choose a Demo Video</h3>
                  <p className="text-xs text-slate-400">Select any video to test instant AI viral short extraction</p>
                </div>
              </div>
              <button
                onClick={() => setIsDemoModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => {
                    setIsDemoModalOpen(false);
                    onSampleSelected(sample.id);
                  }}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {sample.category}
                    </span>
                    <h4 className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {sample.title}
                    </h4>
                  </div>
                  <button className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md">
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run Demo</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BLOG / ARTICLES MODAL */}
      {/* ========================================================================= */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">ClipForge AI Creator Blog</h3>
                  <p className="text-xs text-slate-400">Viral Short-Form Video Strategy, Tips & Trends</p>
                </div>
              </div>
              <button
                onClick={() => setIsBlogModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-indigo-400">Algorithm Secrets</span>
                <h4 className="text-sm font-bold text-white">How The 3-Second Hook Rule Drives 10M+ Views</h4>
                <p className="text-xs text-slate-400">
                  Learn how our AI isolates opening suspense spikes and emotional contrast to maximize TikTok & Reels retention.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-amber-400">Captions & Fonts</span>
                <h4 className="text-sm font-bold text-white">Why Kinetic Word-by-Word Highlight Boosts Watch Time</h4>
                <p className="text-xs text-slate-400">
                  Data shows auto-highlighted colored words increase viewer comprehension by over 78% on mute playback.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Repurposing Guide</span>
                <h4 className="text-sm font-bold text-white">Transforming 1 Podcast Episode into 15 Viral Clips</h4>
                <p className="text-xs text-slate-400">
                  Complete step-by-step blueprint for podcasters, educators, and livestreamers to dominate all platforms.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-cyan-400">Creator Monetization</span>
                <h4 className="text-sm font-bold text-white">Scaling YouTube Shorts & Reels Sponsorships</h4>
                <p className="text-xs text-slate-400">
                  How high-frequency viral posting opens lucrative brand deals and community conversion funnels.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. UPLOADING / STREAM IMPORTING OVERLAY MODAL */}
      {/* ========================================================================= */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#0f172a] border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            
            {/* Spinning Glow Icon */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 animate-spin blur-md opacity-70" />
              <div className="relative w-16 h-16 rounded-full bg-slate-900 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shadow-xl">
                <Sparkles className="w-8 h-8 animate-pulse text-indigo-400" />
              </div>
            </div>

            {/* Header & Status */}
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white tracking-tight">
                Importing & Reading Video...
              </h3>
              <p className="text-xs text-slate-300">
                {uploadProgress < 30
                  ? 'Connecting to video stream and fetching metadata...'
                  : uploadProgress < 75
                  ? 'Processing audio track and analyzing video bitrate...'
                  : 'Finalizing video streams and transferring to AI engine...'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Progress</span>
                <span className="text-indigo-400 font-bold">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${Math.max(10, Math.min(100, uploadProgress))}%` }}
                />
              </div>
            </div>

            {/* Feature Note */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>AI will automatically detect top viral moments in next step</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
