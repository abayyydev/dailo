import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  message?: string;
}

export function LoadingSpinner({ size = 'md', fullPage = false, message }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  }[size];

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <Loader2 className={`${sizeClass} text-indigo-500 animate-spin`} />
      {message && (
        <p className="text-sm text-slate-400 font-medium animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12" role="status" aria-label="Loading">
      {spinner}
    </div>
  );
}
