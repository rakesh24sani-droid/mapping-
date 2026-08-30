import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Scissors,
  Layers,
  Sparkles,
  Type,
  Clock,
  Check,
  Smartphone,
  Cpu,
  AlertCircle
} from 'lucide-react';
import { BestMoment, VideoCropStyle, ClipGenerationOptions, VideoMetadata } from '../types.js';

interface GenerateModalProps {
  moment: BestMoment;
  video: VideoMetadata;
  isOpen: boolean;
  onClose: () => void;
  onStartRender: (options: ClipGenerationOptions) => void;
  isRendering: boolean;
}

export const GenerateModal: React.FC<GenerateModalProps> = ({
  moment,
  video,
  isOpen,
  onClose,
  onStartRender,
  isRendering,
}) => {
  const [cropStyle, setCropStyle] = useState<VideoCropStyle>('blurred-backdrop');
  const [addHeadline, setAddHeadline] = useState(false);
  const [headlineText, setHeadlineText] = useState(moment.title);
  const [startTime, setStartTime] = useState(moment.startTime);
  const [endTime, setEndTime] = useState(moment.endTime);

  if (!isOpen) return null;

  const duration = Math.max(1, Math.round(endTime - startTime));

  const handleRenderSubmit = () => {
    onStartRender({
      momentId: moment.id,
      cropStyle,
      addHeadline,
      headlineText,
      burnCaptions: false,
      accentColor: '#6366F1',
    });
  };

  const cropStyles: { id: VideoCropStyle; title: string; subtitle: string; badge: string; icon: string }[] = [
    {
      id: 'blurred-backdrop',
      title: 'Blurred Backdrop (Recommended)',
      subtitle: 'Maintains full 16:9 widescreen view centered over a styled blurred background. Perfect for podcasts & talks.',
      badge: 'TikTok & Reels Standard',
      icon: '📱'
    },
    {
      id: 'smart-crop',
      title: 'Smart 9:16 Center Crop',
      subtitle: 'Crops directly to vertical center to fill the entire mobile screen. Ideal for single speakers.',
      badge: 'Full Screen Fill',
      icon: '🎯'
    },
    {
      id: 'fit-top-bottom',
      title: 'Fit with Top & Bottom Bars',
      subtitle: 'Fits widescreen video with clean, dark letterbox bars for a minimalist cinematic look.',
      badge: 'Classic Header Fit',
      icon: '🎬'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-[#1e293b] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0f172a]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Configure 9:16 Vertical Clip
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Moment: {moment.title} ({duration}s)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isRendering}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Style Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Select 9:16 Aspect Ratio Layout</span>
            </label>

            <div className="space-y-2.5">
              {cropStyles.map((style) => {
                const isSelected = cropStyle === style.id;
                return (
                  <div
                    key={style.id}
                    id={`crop-style-option-${style.id}`}
                    onClick={() => setCropStyle(style.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-500 shadow-md shadow-indigo-950/30 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-2xl mt-0.5">{style.icon}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
                          {style.title}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                          {style.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {style.subtitle}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'border-slate-700 bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Headline Banner Option */}
          <div className="p-4 rounded-xl bg-[#0f172a]/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer">
                <Type className="w-4 h-4 text-amber-400" />
                <span>Add Top Headline Overlay Banner</span>
              </label>
              <input
                type="checkbox"
                id="headline-toggle"
                checked={addHeadline}
                onChange={(e) => setAddHeadline(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>

            {addHeadline && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1.5 pt-1"
              >
                <input
                  type="text"
                  value={headlineText}
                  onChange={(e) => setHeadlineText(e.target.value)}
                  placeholder="e.g. The 1 Rule That Changed Everything 🔥"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  maxLength={65}
                />
                <p className="text-[11px] text-slate-400">
                  Will be burned into the top region of the 9:16 vertical render.
                </p>
              </motion.div>
            )}
          </div>

          {/* Technical Specs Guarantee */}
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>FFmpeg Output: <strong>1080x1920 @ 30FPS</strong> H.264 High Profile</span>
            </div>
            <span className="font-mono text-[11px] font-bold">~{duration}s</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 bg-[#0f172a]/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            disabled={isRendering}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="start-render-btn"
            onClick={handleRenderSubmit}
            disabled={isRendering}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer disabled:opacity-50"
          >
            <Scissors className="w-4 h-4" />
            <span>{isRendering ? 'Rendering...' : 'Render 9:16 Clip'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
