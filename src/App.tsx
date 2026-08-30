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
} from './types.js';
import { Header } from './components/Header.js';
import { UploadStep } from './components/UploadStep.js';
import { AnalysisStep } from './components/AnalysisStep.js';
import { MomentsStep } from './components/MomentsStep.js';
import { GenerateModal } from './components/GenerateModal.js';
import { PreviewStep } from './components/PreviewStep.js';

export default function App() {
  // State Machine
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [samples, setSamples] = useState<SampleVideoItem[]>([]);
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<BestMoment | null>(null);
  const [generatedClip, setGeneratedClip] = useState<GeneratedClip | null>(null);

  // Job & Processing State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Polling ref
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load sample videos on startup
  useEffect(() => {
    fetch('/api/samples')
      .then((res) => res.json())
      .then((data) => {
        if (data.samples) setSamples(data.samples);
      })
      .catch((err) => console.warn('Could not load samples list:', err));
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Handler: User uploads a video file
  const handleVideoSelected = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(10);
      setErrorMessage(undefined);

      const formData = new FormData();
      formData.append('video', file);

      // Simulated smooth upload progress while waiting for real HTTP request
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

      // Automatically trigger AI Analysis step
      startAnalysis(videoData.id);
    } catch (err: any) {
      console.error('Sample loading error:', err);
      setIsUploading(false);
      setErrorMessage(err.message || 'Failed to load sample demo video');
    }
  };

  // Start AI Analysis & Polling Job
  const startAnalysis = async (videoId: string) => {
    setCurrentStep('analysis');
    setErrorMessage(undefined);

    try {
      const response = await fetch(`/api/analyze/${videoId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to trigger AI analysis');
      }

      const data = await response.json();

      // If cached analysis was returned immediately
      if (data.analysis) {
        setAnalysis(data.analysis);
        setCurrentStep('moments');
        return;
      }

      const jobId = data.jobId;
      pollJobStatus(jobId, (completedJob) => {
        const analysisResult: AnalysisResult = completedJob.result;
        setAnalysis(analysisResult);
        setCurrentStep('moments');
      });
    } catch (err: any) {
      console.error('Analysis trigger error:', err);
      setCurrentJob({
        id: 'error_job',
        type: 'analysis',
        status: 'failed',
        progress: 0,
        stage: 'Analysis Error',
        error: err.message,
      });
    }
  };

  // Poll Job Status for real-time FFmpeg & AI Progress updates
  const pollJobStatus = (
    jobId: string,
    onSuccess: (job: ProcessingJob) => void,
    onFail?: (error: string) => void
  ) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) return;

        const data = await res.json();
        const job: ProcessingJob = data.job;
        setCurrentJob(job);

        if (job.status === 'completed') {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          onSuccess(job);
        } else if (job.status === 'failed') {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          if (onFail) onFail(job.error || 'Job failed');
        }
      } catch (e) {
        console.warn('Job polling tick warning:', e);
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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col font-sans">
      <Header
        currentStep={currentStep}
        onReset={handleReset}
        hasVideo={!!video}
      />

      <main className="flex-1 flex flex-col justify-center">
        {currentStep === 'upload' && (
          <UploadStep
            onVideoSelected={handleVideoSelected}
            onSampleSelected={handleSampleSelected}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            errorMessage={errorMessage}
            samples={samples}
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
            onSelectMoment={handleSelectMoment}
            onQuickGenerate={handleQuickGenerate}
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
        />
      )}

      {/* Persistent Polish Theme Footer */}
      <footer className="h-16 bg-[#1e293b] border-t border-slate-800 flex items-center justify-between px-6 sm:px-8 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-500">Output Format</span>
            <span className="text-xs font-medium text-slate-300">MP4 • Vertical (9:16) • 1080x1920</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
          <span>ClipForge AI • FFmpeg 9:16 Video Engine</span>
        </div>
      </footer>
    </div>
  );
}
