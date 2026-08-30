import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Zap,
  Sparkles,
  Crown,
  ShieldCheck,
  Flame,
  ArrowRight,
  RotateCcw,
  Sliders,
  Layers,
  Globe,
  Film,
  Video,
  Award,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SubscriptionPlan, UserSubscription, PlanId } from '../types.js';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription: UserSubscription;
  plans: SubscriptionPlan[];
  onSelectPlan: (planId: PlanId, billingCycle: 'monthly' | 'annual') => Promise<void>;
  isLoading?: boolean;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentSubscription,
  plans,
  onSelectPlan,
  isLoading = false,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlanToConfirm, setSelectedPlanToConfirm] = useState<SubscriptionPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'cards' | 'comparison'>('cards');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlanClick = (plan: SubscriptionPlan) => {
    if (plan.id === currentSubscription.plan.id) {
      return; // Already on this plan
    }
    setSelectedPlanToConfirm(plan);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlanToConfirm) return;
    try {
      setIsUpgrading(true);
      await onSelectPlan(selectedPlanToConfirm.id, billingCycle);
      setIsUpgrading(false);
      setSuccessMessage(`Successfully switched to the ${selectedPlanToConfirm.name} plan!`);
      setTimeout(() => {
        setSuccessMessage(null);
        setSelectedPlanToConfirm(null);
        onClose();
      }, 1600);
    } catch (err: any) {
      setIsUpgrading(false);
      alert(`Could not change plan: ${err.message || err}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-5xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-[#1e293b]/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  ClipForge AI Subscription Plans
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Instant Activation
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Unlock higher processing minutes, 1080p/4K resolution, zero watermarks, and viral AI tools.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Header: Billing Toggle & Tab Selector */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          {/* View Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Plan Overview
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'comparison'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Feature Matrix
            </button>
          </div>

          {/* Monthly / Annual Billing Toggle */}
          <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
            <span className={billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-11 h-6 rounded-full bg-indigo-600 p-0.5 flex items-center transition-colors cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={billingCycle === 'annual' ? 'text-white' : 'text-slate-400'}>
                Annual
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const isCurrent = currentSubscription.plan.id === plan.id;
                const isPopular = plan.isPopular;
                const displayPrice = billingCycle === 'annual'
                  ? Math.round(plan.priceINR * 0.8)
                  : plan.priceINR;

                return (
                  <div
                    key={plan.id}
                    id={`plan-card-${plan.id}`}
                    className={`rounded-2xl border transition-all relative flex flex-col justify-between overflow-hidden ${
                      isCurrent
                        ? 'border-indigo-500 bg-slate-900/90 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500'
                        : isPopular
                        ? 'border-amber-500/50 bg-slate-900/60 hover:bg-slate-900 hover:border-amber-400 shadow-lg shadow-amber-950/20'
                        : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Popular / Recommended Tag */}
                    {isPopular && (
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase tracking-wider py-1 px-3 text-center flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 fill-slate-950" /> Most Popular Choice
                      </div>
                    )}

                    <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
                      {/* Plan Header */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-bold text-white uppercase tracking-wider">
                            {plan.name}
                          </h3>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 rounded-full">
                              Active Plan
                            </span>
                          )}
                        </div>

                        {/* Price Display */}
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-3xl font-black text-white">
                            ₹{displayPrice}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            / month
                          </span>
                        </div>

                        {billingCycle === 'annual' && plan.priceINR > 0 && (
                          <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                            Billed annually (₹{displayPrice * 12}/yr)
                          </div>
                        )}

                        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
                          <div className="text-xs font-bold text-indigo-300">
                            {plan.monthlyMinutes} Processing Mins
                          </div>
                          <div className="text-[10px] text-slate-400">
                            per calendar month
                          </div>
                        </div>
                      </div>

                      {/* Feature Checklist */}
                      <div className="space-y-2 py-2 border-t border-slate-800/70 text-xs">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Included Features:
                        </div>
                        {plan.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-slate-300 leading-snug">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Plan Action CTA */}
                      <div className="pt-2">
                        {isCurrent ? (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-700"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Current Plan</span>
                          </button>
                        ) : (
                          <button
                            id={`select-plan-${plan.id}`}
                            onClick={() => handlePlanClick(plan)}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                              isPopular
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
                            }`}
                          >
                            <span>{plan.priceINR === 0 ? 'Switch to Free' : `Upgrade to ${plan.name}`}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Comparison Matrix View */
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#1e293b] text-slate-200 border-b border-slate-800">
                    <tr>
                      <th className="p-4 font-bold uppercase tracking-wider text-slate-400">Feature</th>
                      <th className="p-4 font-bold text-center">FREE (₹0)</th>
                      <th className="p-4 font-bold text-center">STARTER (₹99)</th>
                      <th className="p-4 font-bold text-center text-amber-400">CREATOR (₹249) ⭐</th>
                      <th className="p-4 font-bold text-center text-indigo-400">PRO (₹699)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="p-3.5 font-medium text-white">Monthly Processing Minutes</td>
                      <td className="p-3.5 text-center font-bold">30 Mins</td>
                      <td className="p-3.5 text-center font-bold">150 Mins</td>
                      <td className="p-3.5 text-center font-bold text-amber-300">500 Mins</td>
                      <td className="p-3.5 text-center font-bold text-indigo-300">1500 Mins</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">Maximum Export Resolution</td>
                      <td className="p-3.5 text-center text-slate-400">720p HD</td>
                      <td className="p-3.5 text-center">1080p FHD</td>
                      <td className="p-3.5 text-center">1080p FHD</td>
                      <td className="p-3.5 text-center text-indigo-300 font-bold">4K Ultra HD</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">Video Watermark</td>
                      <td className="p-3.5 text-center text-amber-400 font-semibold">ClipForge Watermark</td>
                      <td className="p-3.5 text-center text-emerald-400 font-semibold">None (Clean)</td>
                      <td className="p-3.5 text-center text-emerald-400 font-semibold">None (Clean)</td>
                      <td className="p-3.5 text-center text-emerald-400 font-semibold">None (Clean)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">AI Content Score & Breakdown</td>
                      <td className="p-3.5 text-center text-slate-500">Basic Score</td>
                      <td className="p-3.5 text-center text-slate-500">Basic Score</td>
                      <td className="p-3.5 text-center text-emerald-400">✓ Full Breakdown</td>
                      <td className="p-3.5 text-center text-emerald-400">✓ Full Breakdown</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">Custom Brand Kit (Handle & Colors)</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-emerald-400">✓ Included</td>
                      <td className="p-3.5 text-center text-emerald-400">✓ Included</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">1-Click Batch Moment Generation</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-indigo-400 font-bold">✓ 1-Click All</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">Multi-Language Captions</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-indigo-400 font-bold">✓ Multi-Language</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">Processing Queue Priority</td>
                      <td className="p-3.5 text-center text-slate-400">Standard</td>
                      <td className="p-3.5 text-center">Fast</td>
                      <td className="p-3.5 text-center text-amber-300 font-semibold">Priority</td>
                      <td className="p-3.5 text-center text-indigo-300 font-bold">VIP Turbo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Security & Guarantee Note */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Simulated Instant Activation mode enabled. Full payment gateway will be attached in a subsequent release.</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">ClipForge Subscription Core v1.2</span>
          </div>
        </div>

        {/* Confirmation Modal Drawer */}
        <AnimatePresence>
          {selectedPlanToConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="p-5 bg-[#020617] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0"
            >
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-sm font-bold text-white">
                    Confirm change to {selectedPlanToConfirm.name} Plan?
                  </span>
                  <span className="text-xs font-black text-indigo-400">
                    ₹{billingCycle === 'annual' ? Math.round(selectedPlanToConfirm.priceINR * 0.8) : selectedPlanToConfirm.priceINR}/mo
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  You will get {selectedPlanToConfirm.monthlyMinutes} minutes/month and {selectedPlanToConfirm.maxResolution.toUpperCase()} resolution.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedPlanToConfirm(null)}
                  disabled={isUpgrading}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-plan-change-btn"
                  onClick={handleConfirmUpgrade}
                  disabled={isUpgrading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  {isUpgrading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Activating Plan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Activate {selectedPlanToConfirm.name} Now</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Toast */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-4 bg-emerald-950 border-t border-emerald-600 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
