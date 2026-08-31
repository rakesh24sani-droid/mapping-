import React, { useState, useEffect, useRef } from 'react';
import {
  WorkflowStep,
  VideoMetadata,
  AnalysisResult,
  BestMoment,
  GeneratedClip,
  ProcessingJob,
  SampleVideoItem,
  ClipGenerationOptions,
  SubscriptionPlan,
  UserSubscription,
  BrandKitSettings,
  VideoCropStyle,
  PlanId,
  UserProfile,
  AuthMode,
} from './types.js';
import { Header } from './components/Header.js';
import { UploadStep } from './components/UploadStep.js';
import { LandingPage } from './components/LandingPage.js';
import { AnalysisStep } from './components/AnalysisStep.js';
import { MomentsStep } from './components/MomentsStep.js';
import { GenerateModal } from './components/GenerateModal.js';
import { PreviewStep } from './components/PreviewStep.js';
import { PricingModal } from './components/PricingModal.js';
import { UsageModal } from './components/UsageModal.js';
import { BrandKitModal } from './components/BrandKitModal.js';
import { BatchGenerateModal } from './components/BatchGenerateModal.js';
import { AuthModal } from './components/AuthModal.js';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  // Core Workflow State
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [samples, setSamples] = useState<SampleVideoItem[]>([]);
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<BestMoment | null>(null);
  const [generatedClip, setGeneratedClip] = useState<GeneratedClip | null>(null);

  // Subscription System State
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  // Job & Processing State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Polling ref
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Restore or Initialize User Session
  useEffect(() => {
    const savedToken = localStorage.getItem('clipforge_token');
    const savedUser = localStorage.getItem('clipforge_user');

    if (savedToken && savedUser) {
      try {
        setAuthToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.warn('Error reading stored user session:', e);
      }

      // Verify session with server
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) {
            setCurrentUser(data.user);
            localStorage.setItem('clipforge_user', JSON.stringify(data.user));
          }
        })
        .catch((err) => console.warn('Failed to verify session token:', err));
    } else {
      // Default to Alex Morgan Demo Creator for immediate preview convenience
      const defaultUser: UserProfile = {
        id: 'user_alex_creator',
        name: 'Alex Morgan',
        email: 'alex.creator@clipforge.ai',
        role: 'creator',
        createdAt: '2026-01-15T10:00:00.000Z',
        planId: 'creator',
      };
      setCurrentUser(defaultUser);
      setAuthToken('tok_user_alex_creator_demo');
      localStorage.setItem('clipforge_user', JSON.stringify(defaultUser));
      localStorage.setItem('clipforge_token', 'tok_user_alex_creator_demo');
    }
  }, []);

  const handleAuthSuccess = (user: UserProfile, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('clipforge_user', JSON.stringify(user));
    localStorage.setItem('clipforge_token', token);
    setIsAuthOpen(false);
    fetchSubscription();
  };

  const handleSignOut = async () => {
    if (authToken) {
      try {
        await fetch('/api/auth/signout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: authToken }),
        });
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('clipforge_user');
    localStorage.removeItem('clipforge_token');
  };

  // Fetch subscription info
  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription/user');
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.warn('Could not load user subscription:', err);
    }
  };

  // Fetch plans list
  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/subscription/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (err) {
      console.warn('Could not load subscription plans:', err);
    }
  };

  // Load sample videos and subscription on startup
  useEffect(() => {
    fetch('/api/samples')
      .then((res) => res.json())
      .then((data) => {
        if (data.samples) setSamples(data.samples);
      })
      .catch((err) => console.warn('Could not load samples list:', err));

    fetchSubscription();
    fetchPlans();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Handle Plan Upgrade / Switch
  const handleSelectPlan = async (planId: PlanId, billingCycle: 'monthly' | 'annual') => {
    try {
      const res = await fetch('/api/subscription/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update plan');
      }
      const data = await res.json();
      setSubscription(data.subscription);
      setIsPricingOpen(false);
    } catch (err: any) {
      alert(`Error updating plan: ${err.message}`);
    }
  };

  // Handle Reset Usage
  const handleResetUsage = async () => {
    try {
      const res = await fetch('/api/subscription/reset-usage', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.warn('Could not reset usage:', err);
    }
  };

  // Handle Save Brand Kit
  const handleSaveBrandKit = async (settings: Partial<BrandKitSettings>) => {
    const res = await fetch('/api/subscription/update-brand-kit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save Brand Kit');
    }
    const data = await res.json();
    setSubscription(data.subscription);
  };

  // Handle Batch Generation Trigger
  const handleTriggerBatch = async (cropStyle: VideoCropStyle, addHeadline: boolean) => {
    if (!video) return;
    const res = await fetch('/api/subscription/batch-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: video.id,
        cropStyle,
        addHeadline,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Batch generation failed');
    }
    await fetchSubscription();
  };

  // Handler: User uploads a video file
  const handleVideoSelected = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(10);
      setErrorMessage(undefined);

      const formData = new FormData();
      formData.append('video', file);

      // Smooth progress indicator
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 300);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      const videoData: VideoMetadata = data.video;

      setVideo(videoData);
      setIsUploading(false);

      // Automatically trigger AI Analysis step
      startAnalysis(videoData.id);
    } catch (err: any) {
      console.error('Upload error:', err);
      setIsUploading(false);
      setErrorMessage(err.message || 'Failed to upload video');
    }
  };

  // Handler: User imports a video from URL (YouTube, MP4, Drive, Loom, Vimeo, etc.)
  const handleUrlSelected = async (url: string) => {
    try {
      setIsUploading(true);
      setUploadProgress(15);
      setErrorMessage(undefined);

      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 12 : prev));
      }, 400);

      const response = await fetch('/api/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import video from link');
      }

      const data = await response.json();
      const videoData: VideoMetadata = data.video;

      setVideo(videoData);
      setIsUploading(false);

      // Automatically trigger AI Analysis step
      startAnalysis(videoData.id);
    } catch (err: any) {
      console.error('URL import error:', err);
      setIsUploading(false);
      setErrorMessage(err.message || 'Failed to import video from link');
    }
  };

  // Handler: User clicks a demo sample video
  const handleSampleSelected = async (sampleId: string) => {
    try {
      setIsUploading(true);
      setUploadProgress(40);
      setErrorMessage(undefined);

      const response = await fetch(`/api/samples/${sampleId}/load`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load sample video');
      }

      const data = await response.json();
      const videoData: VideoMetadata = data.video;

      setUploadProgress(100);
      setVideo(videoData);
      setIsUploading(false);

      // Start Analysis
      startAnalysis(videoData.id);
    } catch (err: any) {
      console.error('Sample loading error:', err);
      setIsUploading(false);
      setErrorMessage(err.message || 'Failed to load demo video');
    }
  };

  // Trigger Backend AI Analysis & Poll Job
  const startAnalysis = async (videoId: string) => {
    try {
      setCurrentStep('analysis');
      setAnalysis(null);
      setErrorMessage(undefined);

      const response = await fetch(`/api/analyze/${videoId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        if (response.status === 402) {
          // Out of minutes
          const errData = await response.json();
          setIsPricingOpen(true);
          throw new Error(errData.error || 'Processing limit exceeded. Please upgrade your plan.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate AI analysis');
      }

      const data = await response.json();
      const jobId = data.jobId;

      pollJobStatus(
        jobId,
        (completedJob) => {
          const result: AnalysisResult = completedJob.result;
          setAnalysis(result);
          setCurrentStep('moments');
          fetchSubscription(); // Refresh minutes balance
        },
        (error) => {
          setErrorMessage(`Analysis failed: ${error}`);
        }
      );
    } catch (err: any) {
      console.error('Analysis trigger error:', err);
      setErrorMessage(err.message || 'Could not start AI analysis');
    }
  };

  // Poll Job Status
  const pollJobStatus = (
    jobId: string,
    onComplete: (job: ProcessingJob) => void,
    onError: (errorMsg: string) => void
  ) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    let errorCount = 0;
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          errorCount++;
          if (errorCount > 10) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            onError('Processing status timed out. Please retry.');
          }
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return;
        }

        const data = await response.json();
        const job: ProcessingJob = data.job;
        if (!job) return;

        errorCount = 0;
        setCurrentJob(job);

        if (job.status === 'completed') {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          onComplete(job);
        } else if (job.status === 'failed') {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          onError(job.error || 'Processing encountered an unexpected error');
        }
      } catch (err: any) {
        console.warn('Job polling transient error:', err);
      }
    }, 800);
  };

  // User selects a moment to customize & generate
  const handleSelectMoment = (moment: BestMoment) => {
    setSelectedMoment(moment);
    setIsModalOpen(true);
  };

  // Quick generate default style
  const handleQuickGenerate = (moment: BestMoment) => {
    setSelectedMoment(moment);
    handleStartRender({
      momentId: moment.id,
      cropStyle: 'blurred-backdrop',
      addHeadline: false,
      headlineText: moment.title,
      burnCaptions: false,
      accentColor: '#6366F1',
    });
  };

  // Start FFmpeg 9:16 Render
  const handleStartRender = async (options: ClipGenerationOptions) => {
    if (!video || !selectedMoment) return;

    try {
      setIsRendering(true);
      const response = await fetch('/api/generate-clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...options,
          videoId: video.id,
        }),
      });

      if (!response.ok) {
        if (response.status === 402) {
          setIsRendering(false);
          setIsModalOpen(false);
          setIsPricingOpen(true);
          const errData = await response.json();
          throw new Error(errData.error || 'Minutes limit exceeded. Please upgrade your plan.');
        }
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to start clip rendering');
      }

      const data = await response.json();
      const jobId = data.jobId;

      pollJobStatus(
        jobId,
        (completedJob) => {
          setIsRendering(false);
          setIsModalOpen(false);
          const clip: GeneratedClip = completedJob.result;
          setGeneratedClip(clip);
          setCurrentStep('preview');
          fetchSubscription(); // Update minutes remaining
        },
        (error) => {
          setIsRendering(false);
          alert(`Rendering failed: ${error}`);
        }
      );
    } catch (err: any) {
      console.error('Start render error:', err);
      setIsRendering(false);
      alert(`Could not start render: ${err.message}`);
    }
  };

  // Reset session
  const handleReset = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setCurrentStep('upload');
    setVideo(null);
    setAnalysis(null);
    setSelectedMoment(null);
    setGeneratedClip(null);
    setCurrentJob(null);
    setIsModalOpen(false);
    setIsRendering(false);
    setErrorMessage(undefined);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 flex flex-col font-sans">
      {currentStep !== 'upload' && (
        <Header
          currentStep={currentStep}
          onReset={handleReset}
          hasVideo={!!video}
          subscription={subscription}
          currentUser={currentUser}
          onOpenPricing={() => setIsPricingOpen(true)}
          onOpenUsage={() => setIsUsageOpen(true)}
          onOpenBrandKit={() => setIsBrandKitOpen(true)}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setIsAuthOpen(true);
          }}
          onSignOut={handleSignOut}
        />
      )}

      <main className="flex-1 flex flex-col justify-center">
        {currentStep === 'upload' && (
          <LandingPage
            onVideoSelected={handleVideoSelected}
            onUrlSelected={handleUrlSelected}
            onSampleSelected={handleSampleSelected}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(undefined)}
            samples={samples}
            subscription={subscription}
            currentUser={currentUser}
            onOpenPricing={() => setIsPricingOpen(true)}
            onOpenAuth={(mode) => {
              setAuthMode(mode);
              setIsAuthOpen(true);
            }}
            onSignOut={handleSignOut}
            onOpenStudio={() => {
              if (samples.length > 0) {
                handleSampleSelected(samples[0].id);
              }
            }}
          />
        )}

        {currentStep === 'analysis' && video && (
          <AnalysisStep
            video={video}
            job={currentJob}
            onRetry={() => startAnalysis(video.id)}
          />
        )}

        {currentStep === 'moments' && analysis && video && (
          <MomentsStep
            analysis={analysis}
            video={video}
            subscription={subscription}
            onSelectMoment={handleSelectMoment}
            onQuickGenerate={handleQuickGenerate}
            onOpenPricing={() => setIsPricingOpen(true)}
            onOpenBatchGenerate={() => setIsBatchOpen(true)}
            onOpenBrandKit={() => setIsBrandKitOpen(true)}
          />
        )}

        {currentStep === 'preview' && generatedClip && video && (
          <PreviewStep
            clip={generatedClip}
            video={video}
            onBackToMoments={() => setCurrentStep('moments')}
            onReconfigureStyle={() => {
              const mom = analysis?.moments.find((m) => m.id === generatedClip.momentId);
              if (mom) {
                setSelectedMoment(mom);
                setIsModalOpen(true);
              }
            }}
          />
        )}
      </main>

      {/* Generate Customizer Modal */}
      {selectedMoment && video && (
        <GenerateModal
          moment={selectedMoment}
          video={video}
          isOpen={isModalOpen}
          onClose={() => !isRendering && setIsModalOpen(false)}
          onStartRender={handleStartRender}
          isRendering={isRendering}
          subscription={subscription}
          onOpenPricing={() => {
            setIsModalOpen(false);
            setIsPricingOpen(true);
          }}
        />
      )}

      {/* User Authentication Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Subscription Pricing Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        plans={plans}
        currentSubscription={subscription}
        onSelectPlan={handleSelectPlan}
      />

      {/* Usage & Credit History Modal */}
      {subscription && (
        <UsageModal
          isOpen={isUsageOpen}
          onClose={() => setIsUsageOpen(false)}
          subscription={subscription}
          onOpenPricing={() => {
            setIsUsageOpen(false);
            setIsPricingOpen(true);
          }}
          onResetUsage={handleResetUsage}
        />
      )}

      {/* Brand Kit Customization Modal */}
      {subscription && (
        <BrandKitModal
          isOpen={isBrandKitOpen}
          onClose={() => setIsBrandKitOpen(false)}
          subscription={subscription}
          onSaveBrandKit={handleSaveBrandKit}
          onOpenPricing={() => {
            setIsBrandKitOpen(false);
            setIsPricingOpen(true);
          }}
        />
      )}

      {/* 1-Click Batch Generate Modal */}
      {analysis && video && subscription && (
        <BatchGenerateModal
          isOpen={isBatchOpen}
          onClose={() => setIsBatchOpen(false)}
          moments={analysis.moments}
          video={video}
          subscription={subscription}
          onOpenPricing={() => {
            setIsBatchOpen(false);
            setIsPricingOpen(true);
          }}
          onTriggerBatch={handleTriggerBatch}
        />
      )}

      {/* Persistent Theme Footer with Plan Indicators */}
      <footer className="h-16 bg-[#1e293b] border-t border-slate-800 flex items-center justify-between px-6 sm:px-8 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-500">Output Quality</span>
            <span className="text-xs font-medium text-slate-300">
              {subscription?.plan.maxResolution.toUpperCase()} • 9:16 Vertical •{' '}
              {subscription?.plan.watermark ? 'Watermarked' : 'Clean (No Watermark)'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
          <span>ClipForge AI Engine • Plan: <strong className="text-indigo-400 font-semibold uppercase">{subscription?.plan.name || 'FREE'}</strong></span>
        </div>
      </footer>
    </div>
  );
}
