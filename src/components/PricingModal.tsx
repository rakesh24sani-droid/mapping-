import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Tag,
  QrCode,
  Smartphone,
  Building2,
  Gift,
  Lock,
  ChevronRight,
  TrendingUp,
  Clock,
  Palette
} from 'lucide-react';
import { SubscriptionPlan, UserSubscription, PlanId } from '../types.js';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription: UserSubscription | null;
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
  
  // Checkout & Upgrade Flow State
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'review' | 'processing' | 'success'>('review');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'paypal'>('upi');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('creator@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');

  // Flash Sale Timer simulation
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 59 });

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };
        return { minutes: 15, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPlanId = currentSubscription?.planId || 'free';

  const handlePlanClick = (plan: SubscriptionPlan) => {
    if (plan.id === currentPlanId) return;
    setSelectedPlanToConfirm(plan);
    setPaymentStep('review');
    setCouponCode('');
    setAppliedDiscount(0);
    setCouponMessage(null);
    setCouponError(null);
  };

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    setCouponError(null);
    setCouponMessage(null);

    if (!code) return;

    if (code === 'START49') {
      setAppliedDiscount(15);
      setCouponMessage('🎉 START49 applied: ₹15 extra discount added!');
      setCouponCode('START49');
    } else if (code === 'CREATOR50') {
      setAppliedDiscount(50); // 50% discount
      setCouponMessage('🔥 CREATOR50 applied: 50% instant discount!');
      setCouponCode('CREATOR50');
    } else if (code === 'VIRAL20' || code === 'SAVE20') {
      setAppliedDiscount(20);
      setCouponMessage('✨ SAVE20 applied: 20% instant creator discount!');
      setCouponCode('SAVE20');
    } else {
      setCouponError('Invalid coupon code. Try START49 or CREATOR50.');
    }
  };

  // Calculate final pricing for the selected plan
  const getSelectedPlanCalculation = () => {
    if (!selectedPlanToConfirm) return { base: 0, discount: 0, total: 0 };
    const base = billingCycle === 'annual'
      ? selectedPlanToConfirm.priceAnnualINR
      : selectedPlanToConfirm.priceMonthlyINR;

    if (base === 0) return { base: 0, discount: 0, total: 0 };

    let discountAmount = 0;
    if (appliedDiscount === 50) {
      discountAmount = Math.round(base * 0.5);
    } else if (appliedDiscount === 20) {
      discountAmount = Math.round(base * 0.2);
    } else if (appliedDiscount === 15) {
      discountAmount = Math.min(base - 1, 15);
    }

    const total = Math.max(0, base - discountAmount);
    return { base, discount: discountAmount, total };
  };

  const { base: calcBase, discount: calcDiscount, total: calcTotal } = getSelectedPlanCalculation();

  const handleConfirmUpgrade = async () => {
    if (!selectedPlanToConfirm) return;
    try {
      setIsUpgrading(true);
      setPaymentStep('processing');

      // Simulate payment network verification delay
      await new Promise((res) => setTimeout(res, 1200));

      await onSelectPlan(selectedPlanToConfirm.id, billingCycle);
      setIsUpgrading(false);
      setPaymentStep('success');
    } catch (err: any) {
      setIsUpgrading(false);
      setPaymentStep('review');
      alert(`Could not change plan: ${err.message || err}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-5xl bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]"
      >
        {/* Top Flash Offer Banner */}
        <div className="bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-amber-900/90 border-b border-indigo-500/30 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold shrink-0">
          <div className="flex items-center gap-2 text-white">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>
              ⚡ <strong className="text-amber-300">Creator Launch Offer:</strong> Get STARTER for just <strong>₹49/mo</strong>. Use code <code className="bg-slate-900/80 px-1.5 py-0.5 rounded text-amber-300 border border-amber-400/40">START49</code> for extra savings!
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px] bg-slate-950/60 px-2 py-0.5 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Offer expires in {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Modal Main Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-[#1e293b]/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-indigo-500/25">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  ClipForge AI Plans & Pricing
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Starting at ₹49/mo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Unlock viral AI clipping, high-definition 1080p/4K exports, zero watermark, and Brand Kits.
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
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
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
              Plan Overview (₹49+)
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
            <span className={billingCycle === 'monthly' ? 'text-white font-bold' : 'text-slate-400'}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                billingCycle === 'annual' ? 'bg-emerald-600' : 'bg-indigo-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={billingCycle === 'annual' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                Annual Billing
              </span>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const isCurrent = currentPlanId === plan.id;
                const isPopular = plan.isPopular;
                const isStarter = plan.id === 'starter';
                const isPro = plan.id === 'pro';

                const monthlyPrice = plan.priceMonthlyINR;
                const annualEquivalentMonthly = Math.round(plan.priceAnnualINR / 12);
                const displayPrice = billingCycle === 'annual' ? annualEquivalentMonthly : monthlyPrice;

                return (
                  <motion.div
                    key={plan.id}
                    id={`plan-card-${plan.id}`}
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`rounded-2xl border transition-all relative flex flex-col justify-between overflow-hidden ${
                      isCurrent
                        ? 'border-indigo-500 bg-slate-900/90 shadow-lg shadow-indigo-950/40 ring-2 ring-indigo-500/50'
                        : isPopular
                        ? 'border-amber-500/60 bg-gradient-to-b from-slate-900/90 to-slate-950/90 hover:border-amber-400 shadow-xl shadow-amber-950/30'
                        : isStarter
                        ? 'border-cyan-500/50 bg-slate-900/80 hover:border-cyan-400 shadow-lg shadow-cyan-950/20'
                        : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900/90 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Tag Header */}
                    {isPopular && (
                      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider py-1 px-3 text-center flex items-center justify-center gap-1 shadow-sm">
                        <Flame className="w-3.5 h-3.5 fill-slate-950" /> Most Popular Choice
                      </div>
                    )}
                    {isStarter && !isPopular && (
                      <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 text-center flex items-center justify-center gap-1 shadow-sm">
                        <Zap className="w-3.5 h-3.5 fill-white" /> Pocket Friendly • ₹49/mo
                      </div>
                    )}
                    {isPro && (
                      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 text-center flex items-center justify-center gap-1 shadow-sm">
                        <Crown className="w-3.5 h-3.5" /> 4K Ultra HD & Batch Turbo
                      </div>
                    )}

                    <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
                      {/* Plan Title & Price */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-black text-white uppercase tracking-wider">
                            {plan.name}
                          </h3>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 min-h-[32px] leading-snug">
                          {plan.tagline}
                        </p>

                        {/* Price Tag */}
                        <div className="flex items-baseline gap-1 mt-3">
                          <span className="text-3xl font-black text-white tracking-tight">
                            ₹{displayPrice}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            / month
                          </span>
                        </div>

                        {billingCycle === 'annual' && plan.priceMonthlyINR > 0 && (
                          <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                            Billed ₹{plan.priceAnnualINR}/year (Save ₹{(plan.priceMonthlyINR * 12) - plan.priceAnnualINR})
                          </div>
                        )}

                        {/* Processing Minutes Badge */}
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                          <div className="text-xs font-bold text-indigo-300 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span>{plan.minutesPerMonth} Processing Mins</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {plan.maxResolution.toUpperCase()} • {plan.watermark ? 'Watermarked' : 'No Watermark'}
                          </div>
                        </div>
                      </div>

                      {/* Feature Checklist */}
                      <div className="space-y-2 py-2 border-t border-slate-800/80 text-xs">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Included Perks:
                        </div>
                        {plan.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-slate-300 leading-snug">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Plan Action CTA Button */}
                      <div className="pt-2">
                        {isCurrent ? (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-xl bg-slate-800/90 text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-700"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Current Active Plan</span>
                          </button>
                        ) : (
                          <button
                            id={`select-plan-${plan.id}`}
                            onClick={() => handlePlanClick(plan)}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                              isPopular
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                                : isStarter
                                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/25'
                                : plan.priceMonthlyINR === 0
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
                            }`}
                          >
                            <span>
                              {plan.priceMonthlyINR === 0
                                ? 'Downgrade to Free'
                                : `Upgrade for ₹${displayPrice}/mo`}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Comparison Matrix View */
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#1e293b] text-slate-200 border-b border-slate-800">
                    <tr>
                      <th className="p-4 font-bold uppercase tracking-wider text-slate-400">Feature</th>
                      <th className="p-4 font-bold text-center">FREE (₹0)</th>
                      <th className="p-4 font-bold text-center text-cyan-400">STARTER (₹49) 🔥</th>
                      <th className="p-4 font-bold text-center text-amber-400">CREATOR (₹149) ⭐</th>
                      <th className="p-4 font-bold text-center text-indigo-400">PRO (₹399) 🚀</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="p-3.5 font-medium text-white">Monthly Processing Quota</td>
                      <td className="p-3.5 text-center font-bold">30 Mins</td>
                      <td className="p-3.5 text-center font-bold text-cyan-300">120 Mins</td>
                      <td className="p-3.5 text-center font-bold text-amber-300">450 Mins</td>
                      <td className="p-3.5 text-center font-bold text-indigo-300">1500 Mins</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">Maximum Export Resolution</td>
                      <td className="p-3.5 text-center text-slate-400">720p HD</td>
                      <td className="p-3.5 text-center text-emerald-400 font-semibold">1080p Full HD</td>
                      <td className="p-3.5 text-center text-emerald-400 font-semibold">1080p FHD (60fps)</td>
                      <td className="p-3.5 text-center text-indigo-300 font-bold">4K Ultra HD</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">Watermark Removal</td>
                      <td className="p-3.5 text-center text-amber-400 font-semibold">Watermarked</td>
                      <td className="p-3.5 text-center text-emerald-400 font-semibold">Clean (No Watermark)</td>
                      <td className="p-3.5 text-center text-emerald-400 font-semibold">Clean (No Watermark)</td>
                      <td className="p-3.5 text-center text-emerald-400 font-semibold">Clean (No Watermark)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">AI Content Score & Viral Hooks</td>
                      <td className="p-3.5 text-center text-slate-500">Basic Score</td>
                      <td className="p-3.5 text-center text-slate-400">Standard Hooks</td>
                      <td className="p-3.5 text-center text-emerald-400 font-semibold">✓ Full Breakdown (Hook, Flow)</td>
                      <td className="p-3.5 text-center text-emerald-400 font-semibold">✓ Full Breakdown (Hook, Flow)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">Custom Brand Kit (Handle & Accent)</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-emerald-400 font-semibold">✓ Custom Overlay</td>
                      <td className="p-3.5 text-center text-emerald-400 font-semibold">✓ Unlimited Presets</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">1-Click Batch Moment Generation</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-indigo-400 font-bold">✓ 1-Click All Moments</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">Multi-Language Captions</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-center text-indigo-400 font-bold">✓ Hindi, English & More</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-medium text-white">Processing Queue Priority</td>
                      <td className="p-3.5 text-center text-slate-400">Standard</td>
                      <td className="p-3.5 text-center text-cyan-300 font-semibold">Turbo Fast</td>
                      <td className="p-3.5 text-center text-amber-300 font-semibold">Priority Turbo</td>
                      <td className="p-3.5 text-center text-indigo-300 font-bold">VIP Dedicated Node</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick FAQ / Guarantees */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Instant Activation</strong>
                <span>All minutes and features unlock immediately upon selection.</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
              <RotateCcw className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Cancel or Switch Anytime</strong>
                <span>No long-term lock-in. Switch or reset plans whenever you want.</span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Safe & Verified Simulator</strong>
                <span>Full UPI/Card checkout testing environment with zero real charges.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Upgrade & Checkout Drawer Modal */}
        <AnimatePresence>
          {selectedPlanToConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="p-5 bg-[#020617] border-t border-slate-800 flex flex-col gap-4 shrink-0 shadow-2xl"
            >
              {paymentStep === 'review' && (
                <div className="space-y-4">
                  {/* Top Bar: Plan summary & price */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white uppercase tracking-wider">
                          Upgrade to {selectedPlanToConfirm.name} Plan
                        </span>
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                          {selectedPlanToConfirm.minutesPerMonth} mins/mo • {selectedPlanToConfirm.resolutionLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {billingCycle === 'annual' ? 'Annual subscription (billed yearly)' : 'Monthly recurring subscription'}
                      </p>
                    </div>

                    <div className="text-right flex items-baseline gap-2 self-end sm:self-auto">
                      {calcDiscount > 0 && (
                        <span className="text-xs text-slate-500 line-through">₹{calcBase}</span>
                      )}
                      <span className="text-2xl font-black text-emerald-400">₹{calcTotal}</span>
                      <span className="text-xs text-slate-400">{billingCycle === 'annual' ? '/yr' : '/mo'}</span>
                    </div>
                  </div>

                  {/* Two-Column Checkout Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Payment Method Simulation */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Select Payment Method (Simulation)</span>
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('upi')}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                            paymentMethod === 'upi'
                              ? 'bg-indigo-600/20 border-indigo-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                          <span>UPI / GPay / Paytm</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                            paymentMethod === 'card'
                              ? 'bg-indigo-600/20 border-indigo-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <CreditCard className="w-4 h-4 text-cyan-400" />
                          <span>Cards (Visa/RuPay)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('netbanking')}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                            paymentMethod === 'netbanking'
                              ? 'bg-indigo-600/20 border-indigo-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Building2 className="w-4 h-4 text-amber-400" />
                          <span>Net Banking</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('paypal')}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                            paymentMethod === 'paypal'
                              ? 'bg-indigo-600/20 border-indigo-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Globe className="w-4 h-4 text-indigo-400" />
                          <span>PayPal / Global</span>
                        </button>
                      </div>

                      {/* Payment Method Details Simulation */}
                      {paymentMethod === 'upi' && (
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                          <label className="text-[11px] text-slate-400 font-medium">Virtual Payment Address (VPA / UPI ID)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                            />
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-lg flex items-center">
                              Auto-Verified
                            </span>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'card' && (
                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                          <label className="text-[11px] text-slate-400 font-medium">Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Right: Coupon Code & Final Breakdown */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Discount Voucher / Coupon Code</span>
                      </label>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="e.g. START49 or CREATOR50"
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-sm"
                        >
                          Apply
                        </button>
                      </div>

                      {/* Quick Coupon Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400">Try codes:</span>
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon('START49')}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 cursor-pointer"
                        >
                          START49 (-₹15)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon('CREATOR50')}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer"
                        >
                          CREATOR50 (50% OFF)
                        </button>
                      </div>

                      {couponMessage && (
                        <p className="text-xs text-emerald-400 font-semibold">{couponMessage}</p>
                      )}
                      {couponError && (
                        <p className="text-xs text-rose-400 font-semibold">{couponError}</p>
                      )}

                      {/* Summary Breakdown */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Base Plan Price:</span>
                          <span className="text-white font-mono">₹{calcBase}</span>
                        </div>
                        {calcDiscount > 0 && (
                          <div className="flex justify-between text-emerald-400 font-semibold">
                            <span>Coupon Discount:</span>
                            <span className="font-mono">-₹{calcDiscount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-400">
                          <span>Taxes & GST (18% Included):</span>
                          <span className="text-white font-mono">₹0 (Waived)</span>
                        </div>
                        <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800 text-sm">
                          <span>Total Amount Payable:</span>
                          <span className="text-emerald-400 font-mono font-black">₹{calcTotal}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanToConfirm(null)}
                      disabled={isUpgrading}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      id="confirm-plan-change-btn"
                      onClick={handleConfirmUpgrade}
                      disabled={isUpgrading}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {selectedPlanToConfirm.priceMonthlyINR === 0
                          ? 'Activate Free Plan'
                          : `Complete Upgrade for ₹${calcTotal}`}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h3 className="text-base font-bold text-white">
                    Activating {selectedPlanToConfirm.name} Plan...
                  </h3>
                  <p className="text-xs text-slate-400">
                    Allocating {selectedPlanToConfirm.minutesPerMonth} processing minutes and configuring rendering nodes.
                  </p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">
                      🎉 Plan Successfully Upgraded to {selectedPlanToConfirm.name}!
                    </h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Your account now has <strong>{selectedPlanToConfirm.minutesPerMonth} minutes</strong> and <strong>{selectedPlanToConfirm.resolutionLabel}</strong> export quality unlocked!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlanToConfirm(null);
                      onClose();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
                  >
                    <span>Start Creating Viral Clips Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
