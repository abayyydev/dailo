import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center" role="alert">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-base font-bold text-slate-700 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition"
          aria-label="Retry"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
