import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Flame,
  Clock,
  Scissors,
  TrendingUp,
  Share2,
  Copy,
  Check,
  Play,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  Info,
  Sliders,
  CheckCircle2,
  Crown,
  Palette,
  Zap,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { AnalysisResult, BestMoment, VideoMetadata, UserSubscription } from '../types.js';

interface MomentsStepProps {
  analysis: AnalysisResult;
  video: VideoMetadata;
  subscription: UserSubscription | null;
  onSelectMoment: (moment: BestMoment) => void;
  onQuickGenerate: (moment: BestMoment) => void;
  onOpenPricing: () => void;
  onOpenBatchGenerate: () => void;
  onOpenBrandKit: () => void;
}

export const MomentsStep: React.FC<MomentsStepProps> = ({
  analysis,
  video,
  subscription,
  onSelectMoment,
  onQuickGenerate,
  onOpenPricing,
  onOpenBatchGenerate,
  onOpenBrandKit,
}) => {
  const [expandedMomentId, setExpandedMomentId] = useState<string | null>(analysis.moments[0]?.id || null);
  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null);

  const handleCopyCaption = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaptionId(id);
    setTimeout(() => setCopiedCaptionId(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 93) return 'from-emerald-500 to-teal-400 border-emerald-500/40 text-emerald-300';
    if (score >= 85) return 'from-amber-500 to-yellow-400 border-amber-500/40 text-amber-300';
    return 'from-indigo-500 to-violet-400 border-indigo-500/40 text-indigo-300';
  };

  const isFreePlan = subscription?.plan.id === 'free';
  const isProPlan = subscription?.plan.id === 'pro';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner / Summary */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>AI Analysis Complete • {analysis.moments.length} Viral Moments Found</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Select a Viral Moment to Convert to 9:16
            </h2>
          </div>

          {/* Quick Actions Toolbar (Batch & Brand Kit) */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            <button
              id="batch-generate-top-btn"
              onClick={onOpenBatchGenerate}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isProPlan
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
                  : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>1-Click Batch Generate All</span>
              {!isProPlan && (
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-indigo-500/20 rounded text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              )}
            </button>

            <button
              id="brand-kit-moments-btn"
              onClick={onOpenBrandKit}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Brand Kit</span>
            </button>
          </div>
        </div>

        {/* Free Plan Watermark / Upgrade Notice */}
        {isFreePlan && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-300">
              <Crown className="w-4 h-4 shrink-0 fill-amber-400 text-amber-400" />
              <span>
                <strong>Free Plan Active:</strong> Clips export in <strong>720p HD with ClipForge Watermark</strong>. Upgrade for 1080p clean exports, no watermark, and up to 1500 mins.
              </span>
            </div>
            <button
              onClick={onOpenPricing}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-md"
            >
              Upgrade (from ₹49/mo)
            </button>
          </div>
        )}

        {/* Video Summary & Detected Topics */}
        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/40 space-y-3">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">Summary: </span>
            {analysis.summary}
          </p>

          {analysis.detectedTopics && analysis.detectedTopics.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" /> Topics:
              </span>
              {analysis.detectedTopics.map((topic, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Moments List */}
      <div className="space-y-4">
        {analysis.moments.map((moment, idx) => {
          const isExpanded = expandedMomentId === moment.id;
          const scoreGradient = getScoreColor(moment.score);

          return (
            <motion.div
              key={moment.id}
              id={`moment-card-${moment.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'border-indigo-500/50 bg-slate-900/90 shadow-xl shadow-slate-950/40'
                  : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              {/* Header row */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                  {/* AI Content Score Badge */}
                  <div
                    className={`flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-b ${scoreGradient} border p-1 shrink-0 shadow-inner`}
                    title="AI Virality Score based on Hook, Pacing, and Retention"
                  >
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                      {moment.score}
                    </span>
                    <span className="text-[9px] uppercase font-extrabold tracking-wider mt-0.5 text-white/90">
                      AI Score
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                        {moment.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{moment.durationFormatted}</span>
                        <span className="text-slate-500">({moment.startTime}s - {moment.endTime}s)</span>
                      </span>
                      {moment.score >= 93 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded-full">
                          <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span>Top Viral Pick</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                      {moment.title}
                    </h3>

                    {/* Opening Hook Quote */}
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-300 italic flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        <span className="font-semibold text-slate-400 not-italic mr-1">Hook:</span>
                        {moment.hook}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex sm:flex-row md:flex-col items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <button
                    id={`generate-clip-btn-${moment.id}`}
                    onClick={() => onSelectMoment(moment)}
                    className="flex-1 md:flex-initial w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all cursor-pointer"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>Generate 9:16</span>
                  </button>

                  <button
                    onClick={() => setExpandedMomentId(isExpanded ? null : moment.id)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  >
                    <span>{isExpanded ? 'Less' : 'Details'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Details Drawer */}
              {isExpanded && (
                <div className="p-4 sm:p-5 bg-[#020617] border-t border-slate-800 space-y-4">
                  {/* Score Breakdown Bar */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                      AI Content Score Breakdown
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Hook Strength</span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-white">{moment.scoreBreakdown.hookStrength}/100</span>
                          <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${moment.scoreBreakdown.hookStrength}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Clarity & Value</span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-white">{moment.scoreBreakdown.clarityAndValue}/100</span>
                          <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${moment.scoreBreakdown.clarityAndValue}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Pacing & Flow</span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-white">{moment.scoreBreakdown.pacingAndFlow}/100</span>
                          <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${moment.scoreBreakdown.pacingAndFlow}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Virality Potential</span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-white">{moment.scoreBreakdown.viralityPotential}/100</span>
                          <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${moment.scoreBreakdown.viralityPotential}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Virality Rationale & Caption */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        Why This Clip Performs on TikTok & Shorts
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {moment.viralityReason}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                          Suggested Social Caption
                        </span>
                        <button
                          onClick={() => handleCopyCaption(moment.id, `${moment.suggestedCaption}\n\n${moment.hashtags.join(' ')}`)}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          {copiedCaptionId === moment.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {moment.suggestedCaption}
                      </p>
                      <div className="flex flex-wrap gap-1 text-[10px] text-indigo-400 font-mono">
                        {moment.hashtags.map((tag, tIdx) => (
                          <span key={tIdx}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
