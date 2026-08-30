import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  stage: string;
  detail?: string;
  accentColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  stage,
  detail,
  accentColor = 'bg-indigo-500',
}) => {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-medium text-slate-200 truncate">
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
          <span className="truncate">{stage}</span>
        </div>
        <span className="font-mono font-bold text-indigo-400 text-xs px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30">
          {Math.round(safeProgress)}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative h-2 w-full rounded-full bg-slate-700 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${accentColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      {detail && (
        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          {detail}
        </p>
      )}
    </div>
  );
};
