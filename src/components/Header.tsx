import React from 'react';
import { Sparkles, CheckCircle2, RotateCcw, Cpu } from 'lucide-react';
import { WorkflowStep } from '../types.js';

interface HeaderProps {
  currentStep: WorkflowStep;
  onReset: () => void;
  hasVideo: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentStep, onReset, hasVideo }) => {
  const steps: { id: WorkflowStep; label: string; number: number }[] = [
    { id: 'upload', label: 'Upload', number: 1 },
    { id: 'analysis', label: 'Analyze', number: 2 },
    { id: 'moments', label: 'Edit & Generate', number: 3 },
    { id: 'preview', label: 'Export', number: 4 },
  ];

  const getStepIndex = (step: WorkflowStep) => {
    switch (step) {
      case 'upload': return 0;
      case 'analysis': return 1;
      case 'moments': return 2;
      case 'preview': return 3;
    }
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#1e293b] border-b border-slate-800 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 text-sm tracking-tighter">
            CF
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white flex items-center gap-2">
              ClipForge <span className="text-indigo-400">AI</span>
            </h1>
          </div>
        </div>

        {/* Workflow Progression Breadcrumb Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium h-full">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 h-full transition-colors ${
                  isCurrent
                    ? 'text-indigo-400 border-b-2 border-indigo-400 font-semibold'
                    : isCompleted
                    ? 'text-emerald-400'
                    : 'text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {step.number}
                  </span>
                )}
                <span>{step.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Engine Status & Reset Action */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Engine Status</span>
              <span className="text-xs text-emerald-400 font-medium">FFmpeg Ready</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          </div>

          {hasVideo && (
            <button
              id="reset-project-btn"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:text-white transition-all cursor-pointer shadow-sm"
              title="Start a new clip project"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
