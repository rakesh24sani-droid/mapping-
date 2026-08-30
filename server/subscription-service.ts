import fs from 'fs';
import path from 'path';
import { SubscriptionPlan, UserSubscription, PlanId, BrandKitSettings, UsageRecord } from '../src/types.js';

const rootDir = process.cwd();
const storageDir = path.join(rootDir, 'storage');
const subscriptionFile = path.join(storageDir, 'subscription.json');

// Ensure storage directory exists
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Configurable Subscription Plans database
export const SUBSCRIPTION_PLANS: Record<PlanId, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'FREE',
    tagline: 'Ideal for trying out AI short-form clipping',
    priceMonthlyINR: 0,
    priceAnnualINR: 0,
    minutesPerMonth: 30,
    maxResolution: '720p',
    resolutionLabel: '720p HD',
    watermark: true,
    features: [
      '30 processing minutes/month',
      '720p Export Resolution',
      'ClipForge AI Watermark',
      'Basic AI Moment Detection',
      'Standard Processing Queue',
      'Single Clip Downloads',
    ],
    featureHighlights: {
      minutes: '30 processing mins/mo',
      resolution: '720p Export',
      watermark: 'ClipForge Watermark',
      aiFeatures: 'Basic AI Features',
    },
    hasAiContentScore: false,
    hasAiTitlesHooks: false,
    hasBrandKit: false,
    hasPriorityProcessing: false,
    hasBatchGeneration: false,
    hasMultiLanguage: false,
    hasAutoReframe: false,
    hasAiCaptions: false,
  },
  starter: {
    id: 'starter',
    name: 'STARTER',
    tagline: 'Pocket-friendly plan for emerging creators & reels editors',
    priceMonthlyINR: 49,
    priceAnnualINR: 470,
    minutesPerMonth: 120,
    maxResolution: '1080p',
    resolutionLabel: '1080p Full HD',
    watermark: false,
    badge: '🔥 ₹49 Starting Plan',
    features: [
      '120 processing minutes/month',
      '1080p Full HD Export',
      'No Watermark (Clean Output)',
      'AI Auto-Reframe (3 vertical styles)',
      'AI Captions & Subtitles Engine',
      'Standard Turbo Queue',
    ],
    featureHighlights: {
      minutes: '120 processing mins/mo',
      resolution: '1080p Full HD',
      watermark: 'No Watermark',
      aiFeatures: 'AI Captions & Auto-Reframe',
    },
    hasAiContentScore: false,
    hasAiTitlesHooks: true,
    hasBrandKit: false,
    hasPriorityProcessing: false,
    hasBatchGeneration: false,
    hasMultiLanguage: false,
    hasAutoReframe: true,
    hasAiCaptions: true,
  },
  creator: {
    id: 'creator',
    name: 'CREATOR',
    tagline: 'Best for active YouTubers, podcasters & shorts creators',
    priceMonthlyINR: 149,
    priceAnnualINR: 1430,
    minutesPerMonth: 450,
    maxResolution: '1080p',
    resolutionLabel: '1080p Full HD (60fps)',
    watermark: false,
    isPopular: true,
    badge: '⭐ Most Popular',
    features: [
      '450 processing minutes/month',
      '1080p Full HD Studio Export',
      'No Watermark (Clean Output)',
      'Advanced AI Viral Moments Engine',
      'AI Content Score Breakdown (Hook, Retention, Flow)',
      'AI Viral Titles & Emojis Suggestions',
      'Custom Brand Kit (Handle, Watermark & Accents)',
      'Priority Turbo Rendering Speed',
    ],
    featureHighlights: {
      minutes: '450 processing mins/mo',
      resolution: '1080p Full HD',
      watermark: 'No Watermark',
      aiFeatures: 'Advanced AI + Content Scores',
      extras: 'Brand Kit & Priority Queue',
    },
    hasAiContentScore: true,
    hasAiTitlesHooks: true,
    hasBrandKit: true,
    hasPriorityProcessing: true,
    hasBatchGeneration: false,
    hasMultiLanguage: false,
    hasAutoReframe: true,
    hasAiCaptions: true,
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    tagline: 'For professional agencies, studios & high-volume creators',
    priceMonthlyINR: 399,
    priceAnnualINR: 3830,
    minutesPerMonth: 1500,
    maxResolution: '4k',
    resolutionLabel: '4K Ultra HD & 1080p',
    watermark: false,
    badge: '🚀 Max Power',
    features: [
      '1500 processing minutes/month',
      '4K Ultra HD & 1080p High-Bitrate Export',
      'No Watermark',
      'All AI Models & Score Analytics',
      '1-Click Batch Generation of All Moments',
      'Multi-Language Captions (Hindi, English, etc.)',
      'VIP Dedicated Turbo Render Node',
      'Unlimited Brand Kit Presets & Cloud Sync',
    ],
    featureHighlights: {
      minutes: '1500 processing mins/mo',
      resolution: '4K Ultra HD / 1080p',
      watermark: 'No Watermark',
      aiFeatures: 'Batch Generation & Multi-Language',
      extras: 'VIP Priority & Max Limits',
    },
    hasAiContentScore: true,
    hasAiTitlesHooks: true,
    hasBrandKit: true,
    hasPriorityProcessing: true,
    hasBatchGeneration: true,
    hasMultiLanguage: true,
    hasAutoReframe: true,
    hasAiCaptions: true,
  },
};

// Initial default user state (Free Plan with 0 used minutes)
const defaultBrandKit: BrandKitSettings = {
  brandName: 'ClipForge Studio',
  handle: '@clipforge_ai',
  primaryColor: '#6366F1',
  showBrandWatermark: false,
};

function getNextRenewalDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

function loadPersistedSubscription(): UserSubscription {
  try {
    if (fs.existsSync(subscriptionFile)) {
      const raw = fs.readFileSync(subscriptionFile, 'utf-8');
      const data = JSON.parse(raw);
      const plan = SUBSCRIPTION_PLANS[data.planId as PlanId] || SUBSCRIPTION_PLANS.free;
      return {
        ...data,
        plan,
        minutesTotal: plan.minutesPerMonth,
        minutesRemaining: Math.max(0, plan.minutesPerMonth - (data.minutesUsed || 0)),
      };
    }
  } catch (err) {
    console.error('Error loading subscription state:', err);
  }

  // Fallback initial Free subscription
  const initialPlan = SUBSCRIPTION_PLANS.free;
  return {
    planId: 'free',
    plan: initialPlan,
    billingCycle: 'monthly',
    minutesTotal: initialPlan.minutesPerMonth,
    minutesUsed: 0,
    minutesRemaining: initialPlan.minutesPerMonth,
    renewalDate: getNextRenewalDate(),
    isActive: true,
    brandKit: defaultBrandKit,
    usageHistory: [
      {
        id: 'usage_init',
        timestamp: new Date().toISOString(),
        type: 'analysis',
        durationMinutes: 0,
        title: 'Account Initialized (FREE Plan 30 mins)',
        details: 'Welcome to ClipForge AI! 30 minutes monthly credit loaded.',
      },
    ],
  };
}

let currentSubscription: UserSubscription = loadPersistedSubscription();

function saveSubscription(): void {
  try {
    fs.writeFileSync(subscriptionFile, JSON.stringify(currentSubscription, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving subscription state:', err);
  }
}

export function getAllPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS);
}

export function getPlan(planId: PlanId): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;
}

export function getUserSubscription(): UserSubscription {
  // Recalculate remaining minutes dynamically
  const plan = getPlan(currentSubscription.planId);
  currentSubscription.plan = plan;
  currentSubscription.minutesTotal = plan.minutesPerMonth;
  currentSubscription.minutesRemaining = Math.max(0, currentSubscription.minutesTotal - currentSubscription.minutesUsed);
  return currentSubscription;
}

export function changeUserPlan(planId: PlanId, billingCycle: 'monthly' | 'annual' = 'monthly'): UserSubscription {
  const newPlan = getPlan(planId);
  
  currentSubscription.planId = planId;
  currentSubscription.plan = newPlan;
  currentSubscription.billingCycle = billingCycle;
  currentSubscription.minutesTotal = newPlan.minutesPerMonth;
  // If upgrading, ensure minutesUsed does not exceed new limit
  currentSubscription.minutesRemaining = Math.max(0, currentSubscription.minutesTotal - currentSubscription.minutesUsed);
  currentSubscription.renewalDate = getNextRenewalDate();
  currentSubscription.isActive = true;

  const usageRecord: UsageRecord = {
    id: `plan_change_${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'analysis',
    durationMinutes: 0,
    title: `Plan Changed to ${newPlan.name} (₹${billingCycle === 'annual' ? newPlan.priceAnnualINR + '/yr' : newPlan.priceMonthlyINR + '/mo'})`,
    details: `Allocated ${newPlan.minutesPerMonth} minutes/month • Max resolution: ${newPlan.resolutionLabel}`,
  };

  currentSubscription.usageHistory.unshift(usageRecord);
  saveSubscription();
  return getUserSubscription();
}

export function recordUsage(
  type: 'analysis' | 'clip_render' | 'batch_render',
  durationSeconds: number,
  title: string,
  details?: string
): { success: boolean; subscription: UserSubscription; error?: string } {
  const minutes = Math.ceil((durationSeconds / 60) * 10) / 10; // 1 decimal place, minimum 0.1 min
  const effectiveMinutes = Math.max(0.1, Number(minutes.toFixed(1)));

  if (currentSubscription.minutesRemaining < effectiveMinutes) {
    return {
      success: false,
      subscription: getUserSubscription(),
      error: `Insufficient processing minutes remaining (${currentSubscription.minutesRemaining} mins left, but ${effectiveMinutes} mins required). Please upgrade your plan.`,
    };
  }

  currentSubscription.minutesUsed = Number((currentSubscription.minutesUsed + effectiveMinutes).toFixed(1));
  currentSubscription.minutesRemaining = Math.max(0, Number((currentSubscription.minutesTotal - currentSubscription.minutesUsed).toFixed(1)));

  const usageRecord: UsageRecord = {
    id: `usage_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    type,
    durationMinutes: effectiveMinutes,
    title,
    details: details || `Processed ${Math.round(durationSeconds)}s of video content`,
  };

  currentSubscription.usageHistory.unshift(usageRecord);
  // Keep last 30 records
  if (currentSubscription.usageHistory.length > 30) {
    currentSubscription.usageHistory = currentSubscription.usageHistory.slice(0, 30);
  }

  saveSubscription();
  return {
    success: true,
    subscription: getUserSubscription(),
  };
}

export function resetUsage(): UserSubscription {
  currentSubscription.minutesUsed = 0;
  currentSubscription.minutesRemaining = currentSubscription.minutesTotal;
  
  currentSubscription.usageHistory.unshift({
    id: `usage_reset_${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'analysis',
    durationMinutes: 0,
    title: 'Monthly Usage Reset to 0 Minutes',
    details: 'Testing reset executed successfully.',
  });

  saveSubscription();
  return getUserSubscription();
}

export function updateBrandKit(settings: Partial<BrandKitSettings>): UserSubscription {
  currentSubscription.brandKit = {
    ...currentSubscription.brandKit,
    ...settings,
  };
  saveSubscription();
  return getUserSubscription();
}
