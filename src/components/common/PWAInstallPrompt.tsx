'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after small delay
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div
      role="banner"
      aria-label="Install Time Planner app"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 animate-slide-up"
    >
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 p-4 flex items-center gap-4">
        {/* App Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-tight">Install Time Planner</p>
          <p className="text-xs text-slate-500 mt-0.5">Add to home screen for quick access</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="pwa-install-btn"
            onClick={handleInstall}
            aria-label="Install app"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
            Install
          </button>
          <button
            id="pwa-dismiss-btn"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
