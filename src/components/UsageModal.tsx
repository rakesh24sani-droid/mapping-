import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Clock,
  Zap,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Flame,
  ArrowUpRight,
  Activity,
  Layers,
  Crown,
  History,
  Scissors,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserSubscription, UsageRecord } from '../types.js';

interface UsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onOpenPricing: () => void;
  onResetUsage: () => Promise<void>;
}

export const UsageModal: React.FC<UsageModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onOpenPricing,
  onResetUsage,
}) => {
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const { plan, minutesUsed, minutesRemaining, usageHistory } = subscription;
  const totalMinutes = plan.monthlyMinutes;
  const usagePercentage = Math.min(100, Math.round((minutesUsed / totalMinutes) * 100));

  const handleResetClick = async () => {
    try {
      setIsResetting(true);
      await onResetUsage();
      setIsResetting(false);
    } catch (e: any) {
      setIsResetting(false);
      alert(`Could not reset usage: ${e.message}`);
    }
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500 text-red-400';
    if (percent >= 70) return 'bg-amber-500 text-amber-400';
    return 'bg-indigo-500 text-indigo-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#1e293b]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Processing Usage & Credits
                <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {plan.name} Plan
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Track your monthly processing minutes, FFmpeg cuts, and AI usage.
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Meter Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-4 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Available Credits
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-white">
                    {minutesRemaining}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    / {totalMinutes} minutes remaining
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  id="upgrade-from-usage-modal-btn"
                  onClick={() => {
                    onClose();
                    onOpenPricing();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>Upgrade Plan</span>
                </button>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getUsageColor(usagePercentage).split(' ')[0]}`}
                  style={{ width: `${Math.max(3, usagePercentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{minutesUsed} mins consumed ({usagePercentage}%)</span>
                <span>Renews: {new Date(subscription.renewalDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Plan Perks Summary */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Max Quality</span>
                <div className="text-xs font-bold text-white mt-0.5 uppercase">{plan.maxResolution}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Watermark</span>
                <div className={`text-xs font-bold mt-0.5 ${plan.watermark ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {plan.watermark ? 'Enabled' : 'No Watermark'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Brand Kit</span>
                <div className={`text-xs font-bold mt-0.5 ${plan.hasBrandKit ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {plan.hasBrandKit ? 'Unlocked' : 'Locked'}
                </div>
              </div>
            </div>
          </div>

          {/* Usage History Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-400" />
                <span>Monthly Activity Log</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {usageHistory.length} total operations
              </span>
            </div>

            {usageHistory.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                No processing activity recorded yet this cycle.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {usageHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                        {item.type === 'analysis' ? (
                          <Sparkles className="w-3.5 h-3.5" />
                        ) : (
                          <Scissors className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white truncate">
                          {item.title}
                        </div>
                        {item.details && (
                          <div className="text-[11px] text-slate-400 truncate">
                            {item.details}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.secondsProcessed}s audio/video
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right font-mono">
                      <span className="font-bold text-amber-400">
                        -{item.minutesUsed}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test & Demo Utilities */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-300">Developer / Demo Utility</span>
              <p className="text-[11px] text-slate-500">Reset processing minutes to 0 for instant testing.</p>
            </div>
            <button
              onClick={handleResetClick}
              disabled={isResetting}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Usage</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
