export type WorkflowStep = 'upload' | 'analysis' | 'moments' | 'preview';

export interface VideoMetadata {
  id: string;
  originalName: string;
  size: number;
  duration: number; // in seconds
  width: number;
  height: number;
  fps: number;
  hasAudio: boolean;
  format: string;
  uploadedAt: string;
  filePath: string;
  thumbnailUrl: string;
}

export interface ScoreBreakdown {
  hookStrength: number; // 1-100
  clarityAndValue: number; // 1-100
  pacingAndFlow: number; // 1-100
  viralityPotential: number; // 1-100
}

export interface BestMoment {
  id: string;
  title: string;
  hook: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  duration: number; // in seconds
  durationFormatted: string; // e.g. "0:35"
  score: number; // 1-100
  scoreBreakdown: ScoreBreakdown;
  viralityReason: string;
  suggestedCaption: string;
  hashtags: string[];
  category: 'Insight' | 'Story' | 'Hot Take' | 'How-To' | 'Humor' | 'Key Takeaway';
  thumbnailTime?: number;
}

export interface AnalysisResult {
  videoId: string;
  summary: string;
  transcript: string;
  totalMomentsFound: number;
  moments: BestMoment[];
  detectedTopics: string[];
  keySpeakers?: string[];
}

export type VideoCropStyle = 'blurred-backdrop' | 'smart-crop' | 'fit-top-bottom';

export interface ClipGenerationOptions {
  momentId: string;
  cropStyle: VideoCropStyle;
  addHeadline: boolean;
  headlineText: string;
  burnCaptions: boolean;
  accentColor: string; // e.g., '#F59E0B'
}

export interface GeneratedClip {
  id: string;
  videoId: string;
  momentId: string;
  title: string;
  hook: string;
  startTime: number;
  endTime: number;
  duration: number;
  cropStyle: VideoCropStyle;
  hasHeadline: boolean;
  headlineText?: string;
  filePath: string;
  streamUrl: string;
  downloadUrl: string;
  thumbnailUrl: string;
  fileSize: number;
  resolution: string; // e.g. "1080x1920 (9:16)"
  score: number;
  suggestedCaption: string;
  hashtags: string[];
  createdAt: string;
}

export interface ProcessingJob {
  id: string;
  type: 'upload' | 'analysis' | 'generate_clip';
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number; // 0 to 100
  stage: string;
  detail?: string;
  error?: string;
  result?: any;
}

export interface SampleVideoItem {
  id: string;
  title: string;
  category: string;
  duration: number;
  description: string;
  thumbnailColor: string;
}

export type PlanId = 'free' | 'starter' | 'creator' | 'pro';

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthlyINR: number;
  priceAnnualINR: number;
  minutesPerMonth: number;
  maxResolution: '720p' | '1080p' | '4k';
  resolutionLabel: string;
  watermark: boolean;
  isPopular?: boolean;
  badge?: string;
  features: string[];
  featureHighlights: {
    minutes: string;
    resolution: string;
    watermark: string;
    aiFeatures: string;
    extras?: string;
  };
  hasAiContentScore: boolean;
  hasAiTitlesHooks: boolean;
  hasBrandKit: boolean;
  hasPriorityProcessing: boolean;
  hasBatchGeneration: boolean;
  hasMultiLanguage: boolean;
  hasAutoReframe: boolean;
  hasAiCaptions: boolean;
}

export interface BrandKitSettings {
  brandName: string;
  handle: string;
  primaryColor: string;
  showBrandWatermark: boolean;
}

export interface UsageRecord {
  id: string;
  timestamp: string;
  type: 'analysis' | 'clip_render' | 'batch_render';
  durationMinutes: number;
  title: string;
  details?: string;
}

export interface UserSubscription {
  planId: PlanId;
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'annual';
  minutesTotal: number;
  minutesUsed: number;
  minutesRemaining: number;
  renewalDate: string;
  isActive: boolean;
  brandKit: BrandKitSettings;
  usageHistory: UsageRecord[];
}
