import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Palette,
  Crown,
  Check,
  Sparkles,
  Type,
  AtSign,
  ShieldAlert,
  ArrowRight,
  Eye,
  Sliders
} from 'lucide-react';
import { UserSubscription, BrandKitSettings } from '../types.js';

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onOpenPricing: () => void;
  onSaveBrandKit: (settings: Partial<BrandKitSettings>) => Promise<void>;
}

export const BrandKitModal: React.FC<BrandKitModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onOpenPricing,
  onSaveBrandKit,
}) => {
  const isUnlocked = subscription.plan.hasBrandKit;
  const currentBrandKit = subscription.brandKit || {
    brandName: 'My Channel',
    handle: '@creator',
    primaryColor: '#6366F1',
    showBrandWatermark: true,
  };

  const [brandName, setBrandName] = useState(currentBrandKit.brandName);
  const [handle, setHandle] = useState(currentBrandKit.handle);
  const [primaryColor, setPrimaryColor] = useState(currentBrandKit.primaryColor);
  const [showBrandWatermark, setShowBrandWatermark] = useState(currentBrandKit.showBrandWatermark);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const colorPresets = [
    { label: 'Indigo', color: '#6366F1' },
    { label: 'Emerald', color: '#10B981' },
    { label: 'Amber', color: '#F59E0B' },
    { label: 'Rose', color: '#F43F5E' },
    { label: 'Cyan', color: '#06B6D4' },
    { label: 'Purple', color: '#A855F7' },
  ];

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSaveBrandKit({
        brandName,
        handle: handle.startsWith('@') ? handle : `@${handle}`,
        primaryColor,
        showBrandWatermark,
      });
      setIsSaving(false);
      onClose();
    } catch (err: any) {
      setIsSaving(false);
      alert(`Could not save Brand Kit: ${err.message}`);
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Brand Kit Customizer
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Creator & Pro
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Personalize your viral 9:16 vertical clips with custom handles & brand colors.
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
          {!isUnlocked ? (
            /* Locked Banner for Free / Starter */
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Crown className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Brand Kit is locked on {subscription.plan.name} Plan
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Upgrade to the <strong className="text-amber-300 font-semibold">CREATOR (₹249/mo)</strong> or <strong className="text-indigo-300 font-semibold">PRO</strong> plan to add your custom handle watermark, accent colors, and 500 processing minutes.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenPricing();
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25"
              >
                <span>Upgrade to Creator (₹249/mo)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Unlocked Form */
            <div className="space-y-4">
              {/* Channel / Brand Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Brand / Channel Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Nexus Tech, Sarah Talks"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Social Handle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Social Handle (Watermark Tag)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-500">@</span>
                  <input
                    type="text"
                    value={handle.replace(/^@/, '')}
                    onChange={(e) => setHandle(`@${e.target.value}`)}
                    placeholder="yourhandle"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Custom Headline Accent Color */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Headline Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => setPrimaryColor(preset.color)}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${
                          primaryColor === preset.color
                            ? 'scale-110 border-white shadow-md'
                            : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: preset.color }}
                        title={preset.label}
                      />
                    ))}
                  </div>

                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                  />
                  <span className="text-xs font-mono text-slate-400">{primaryColor}</span>
                </div>
              </div>

              {/* Show Custom Watermark Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">Overlay Brand Watermark on 9:16 Videos</span>
                  <p className="text-[11px] text-slate-400">Renders your custom {handle} tag cleanly in the video corner.</p>
                </div>
                <button
                  onClick={() => setShowBrandWatermark(!showBrandWatermark)}
                  className={`w-11 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                    showBrandWatermark ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      showBrandWatermark ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Live Preview Output</span>
                <div className="w-32 h-44 mx-auto rounded-lg bg-slate-900 border border-slate-800 relative flex flex-col justify-between p-2 shadow-inner">
                  <div
                    className="text-[9px] font-bold text-center px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {brandName || 'BRAND'}
                  </div>
                  {showBrandWatermark && (
                    <div className="text-[8px] font-mono text-slate-400 text-right">
                      {handle}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/25"
                >
                  {isSaving ? 'Saving...' : 'Save Brand Kit'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
