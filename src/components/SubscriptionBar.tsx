import React from 'react';
import { Crown, Zap, Activity, Palette, Sparkles } from 'lucide-react';
import { UserSubscription } from '../types.js';

interface SubscriptionBarProps {
  subscription: UserSubscription | null;
  onOpenPricing: () => void;
  onOpenUsage: () => void;
  onOpenBrandKit: () => void;
}

export const SubscriptionBar: React.FC<SubscriptionBarProps> = ({
  subscription,
  onOpenPricing,
  onOpenUsage,
  onOpenBrandKit,
}) => {
  if (!subscription) return null;

  const { plan, minutesRemaining, minutesUsed } = subscription;
  const isFree = plan.id === 'free';
  const isCreator = plan.id === 'creator';
  const isPro = plan.id === 'pro';

  const getPlanBadgeStyle = () => {
    if (isPro) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    if (isCreator) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    if (plan.id === 'starter') return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Brand Kit Quick Trigger (if unlocked or promo) */}
      <button
        id="brand-kit-header-btn"
        onClick={onOpenBrandKit}
        className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all cursor-pointer shadow-sm"
        title="Custom Brand Kit Settings"
      >
        <Palette className="w-3.5 h-3.5 text-amber-400" />
        <span>Brand Kit</span>
      </button>

      {/* Usage & Minutes Balance Button */}
      <button
        id="usage-balance-btn"
        onClick={onOpenUsage}
        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-all cursor-pointer shadow-sm"
        title="View Processing Minutes and Usage History"
      >
        <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded border ${getPlanBadgeStyle()}`}>
          {plan.name}
        </span>
        <div className="flex items-center gap-1">
          <span className="font-bold text-white font-mono">{minutesRemaining}m</span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">left</span>
        </div>
      </button>

      {/* Upgrade CTA Button */}
      <button
        id="upgrade-header-btn"
        onClick={onOpenPricing}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
          isFree
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
            : isPro
            ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
        }`}
      >
        <Crown className={`w-3.5 h-3.5 ${isFree ? 'fill-slate-950' : 'text-amber-300'}`} />
        <span>{isFree ? 'Upgrade' : 'Plans'}</span>
      </button>
    </div>
  );
};
