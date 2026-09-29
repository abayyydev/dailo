'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTracking } from '@/context/TrackingContext';
import {
  Play,
  Pause,
  Square,
  X,
  Timer,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export function FloatingTimerWidget() {
  const {
    activeTimer,
    elapsedSeconds,
    isRunning,
    pauseTimer,
    resumeTimer,
    stopTimer,
    discardTimer,
    isWidgetVisible,
    setWidgetVisible,
  } = useTracking();

  const [minimized, setMinimized] = useState(false);

  if (!activeTimer || !isWidgetVisible) return null;

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  return (
    <aside aria-label="Active Timer" className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-5 duration-200">
      {minimized ? (
        // Minimized Pill
        <div className="bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl border border-slate-700 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isRunning ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="font-mono font-bold text-sm text-emerald-400">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <button
            onClick={() => setMinimized(false)}
            className="p-1 rounded-md hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Perluas widget"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Expanded Card
        <div className="w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 text-slate-900 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {isRunning && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isRunning ? 'bg-indigo-600' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {isRunning ? 'Sedang Dilacak' : 'Timer Dijeda'}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Minimalkan"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => discardTimer()}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Batalkan timer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Activity Info */}
          <div className="mb-3">
            <h4 className="text-xs font-bold text-slate-800 truncate" title={activeTimer.title}>
              {activeTimer.title}
            </h4>
            {activeTimer.category_name && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 border"
                style={{
                  backgroundColor: `${activeTimer.category_color}15`,
                  borderColor: `${activeTimer.category_color}30`,
                  color: activeTimer.category_color || '#4F46E5',
                }}
              >
                {activeTimer.category_name}
              </span>
            )}
          </div>

          {/* Digital Timer Counter */}
          <div className="flex items-center justify-between bg-slate-900 text-white rounded-xl px-4 py-2.5 mb-3 shadow-inner">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xl font-bold text-emerald-400 tracking-wider">
                {formatTime(elapsedSeconds)}
              </span>
            </div>

            <Link
              href="/tracking"
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              <span>Detail</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {isRunning ? (
              <button
                onClick={() => pauseTimer()}
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl border border-amber-200 transition-colors cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Jeda</span>
              </button>
            ) : (
              <button
                onClick={() => resumeTimer()}
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Lanjutkan</span>
              </button>
            )}

            <button
              onClick={() => stopTimer()}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Selesai & Simpan</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
