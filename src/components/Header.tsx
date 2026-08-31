import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Cpu,
  User,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  Shield,
  Crown,
  Palette,
  Activity
} from 'lucide-react';
import { WorkflowStep, UserSubscription, UserProfile } from '../types.js';
import { SubscriptionBar } from './SubscriptionBar.js';

interface HeaderProps {
  currentStep: WorkflowStep;
  onReset: () => void;
  hasVideo: boolean;
  subscription: UserSubscription | null;
  currentUser: UserProfile | null;
  onOpenPricing: () => void;
  onOpenUsage: () => void;
  onOpenBrandKit: () => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onReset,
  hasVideo,
  subscription,
  currentUser,
  onOpenPricing,
  onOpenUsage,
  onOpenBrandKit,
  onOpenAuth,
  onSignOut,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#1e293b] border-b border-slate-800 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={onReset}>
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
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium h-full">
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

        {/* Right Section: Subscription Widget, Auth Controls & Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Subscription Credits Bar */}
          <SubscriptionBar
            subscription={subscription}
            onOpenPricing={onOpenPricing}
            onOpenUsage={onOpenUsage}
            onOpenBrandKit={onOpenBrandKit}
          />

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* User Authentication Menu / Sign In Buttons */}
          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                id="user-profile-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 py-1 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all cursor-pointer shadow-sm"
                title="Account Settings & Profile"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-lg object-cover border border-indigo-500/40"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-[10px]">
                    {getUserInitials(currentUser.name)}
                  </div>
                )}
                <span className="text-xs font-semibold text-white hidden md:inline max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-2xl p-2 z-50 text-slate-200 divide-y divide-slate-800/80">
                  <div className="p-3">
                    <div className="flex items-center gap-2.5">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-9 h-9 rounded-xl object-cover border border-indigo-500/40"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-xs">
                          {getUserInitials(currentUser.name)}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                      <span className="text-slate-400">Current Plan:</span>
                      <span className="font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                        {subscription?.plan.name || 'FREE'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenPricing();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-850 hover:text-white flex items-center gap-2 transition-colors cursor-pointer text-slate-300"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upgrade & Plans</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenUsage();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-850 hover:text-white flex items-center gap-2 transition-colors cursor-pointer text-slate-300"
                    >
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Usage & Minutes</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenBrandKit();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-850 hover:text-white flex items-center gap-2 transition-colors cursor-pointer text-slate-300"
                    >
                      <Palette className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Brand Kit Settings</span>
                    </button>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="sign-in-btn"
                onClick={() => onOpenAuth('signin')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                id="sign-up-btn"
                onClick={() => onOpenAuth('signup')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}

          {hasVideo && (
            <button
              id="reset-project-btn"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:text-white transition-all cursor-pointer shadow-sm ml-1"
              title="Start a new clip project"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">New</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
