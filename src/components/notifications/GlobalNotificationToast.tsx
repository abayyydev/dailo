'use client';

import React, { useEffect, useState } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Bell, X, ArrowRight, Sparkles } from 'lucide-react';

export function GlobalNotificationToast() {
  const { activeToast, dismissToast, toggleDrawer } = useNotifications();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!activeToast) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const duration = 6000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          dismissToast();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  return (
    <aside
      aria-label="Notification Popup"
      className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-[9999] animate-in slide-in-from-top-4 fade-in duration-300"
    >
      <div className="relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border border-indigo-200/80 shadow-2xl shadow-indigo-900/15 p-4">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-start gap-3 pt-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs relative">
            <Bell className="w-5 h-5 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-1.5 right-1.5" />
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Pemberitahuan
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
              {activeToast.title}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
              {activeToast.message}
            </p>

            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  dismissToast();
                  toggleDrawer(true);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
              >
                <span>Lihat di Notifikasi</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={dismissToast}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup pemberitahuan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
