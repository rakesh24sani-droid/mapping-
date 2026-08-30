import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Sparkles,
  Layers,
  Crown,
  Check,
  Zap,
  ArrowRight,
  Clock,
  Scissors,
  CheckCircle2,
  Film
} from 'lucide-react';
import { UserSubscription, BestMoment, VideoMetadata, VideoCropStyle } from '../types.js';

interface BatchGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  moments: BestMoment[];
  video: VideoMetadata;
  subscription: UserSubscription;
  onOpenPricing: () => void;
  onTriggerBatch: (cropStyle: VideoCropStyle, addHeadline: boolean) => Promise<void>;
}

export const BatchGenerateModal: React.FC<BatchGenerateModalProps> = ({
  isOpen,
  onClose,
  moments,
  video,
  subscription,
  onOpenPricing,
  onTriggerBatch,
}) => {
  const isPro = subscription.plan.hasBatchGeneration;
  const [cropStyle, setCropStyle] = useState<VideoCropStyle>('blurred-backdrop');
  const [addHeadline, setAddHeadline] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const totalDuration = moments.reduce((acc, m) => acc + m.duration, 0);
  const minutesNeeded = Math.ceil((totalDuration / 60) * 10) / 10;

  const handleStartBatch = async () => {
    try {
      setIsSubmitting(true);
      await onTriggerBatch(cropStyle, addHeadline);
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setIsSubmitting(false);
      alert(`Batch Generation Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#1e293b]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                1-Click Batch Generator
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Pro Feature
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate all {moments.length} viral 9:16 clips simultaneously.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {!isPro ? (
            /* Locked Banner for Free, Starter & Creator */
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-indigo-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                <Crown className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Batch Generation is exclusive to the PRO Plan
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Export all viral moments with 1 click, unlock 4K rendering, 1500 processing minutes, and VIP Turbo speed on <strong className="text-indigo-300 font-semibold">PRO (₹699/mo)</strong>.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenPricing();
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
              >
                <span>Upgrade to PRO (₹699/mo)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Unlocked Pro Batch Controls */
            <div className="space-y-5">
              {/* Batch Summary */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Viral Clips to Render:</span>
                  <span className="font-bold text-white">{moments.length} clips</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Est. Processing Minutes Required:</span>
                  <span className="font-bold text-indigo-300">{minutesNeeded} mins</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Your Remaining Minutes:</span>
                  <span className="font-bold text-emerald-400">{subscription.minutesRemaining} mins</span>
                </div>
              </div>

              {/* Crop Style Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Global 9:16 Aspect Layout
                </label>
                <select
                  value={cropStyle}
                  onChange={(e) => setCropStyle(e.target.value as VideoCropStyle)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="blurred-backdrop">Blurred Backdrop (Recommended for podcasts & talks)</option>
                  <option value="smart-crop">Smart Center Crop (Full vertical fill)</option>
                  <option value="fit-top-bottom">Fit with Letterbox Header Bars</option>
                </select>
              </div>

              {/* Add Headline Checkbox */}
              <label className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white">Auto-generate AI Hook Headers</span>
                  <p className="text-[11px] text-slate-400">Places the AI-detected viral title on each 9:16 clip.</p>
                </div>
                <input
                  type="checkbox"
                  checked={addHeadline}
                  onChange={(e) => setAddHeadline(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                />
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartBatch}
                  disabled={isSubmitting || subscription.minutesRemaining < minutesNeeded}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Queuing Batch Renders...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Batch Processing Started!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Start Batch Generation ({moments.length} Clips)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
