'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, Home, Clock } from 'lucide-react';

const cachedPages = [
  { name: 'Dashboard', href: '/' },
  { name: 'Tasks', href: '/tasks' },
  { name: 'Schedule', href: '/schedule' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Statistics', href: '/statistics' },
];

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="relative inline-flex mb-8">
          <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center backdrop-blur-sm">
            <WifiOff className="w-12 h-12 text-indigo-400" />
          </div>
          <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 border-4 border-slate-900 flex items-center justify-center">
            <span className="text-[10px] font-black text-amber-900">!</span>
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
          You&apos;re Offline
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          No internet connection detected. Some pages may still be available from your cache.
        </p>

        {/* Cached Pages */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Available Offline
          </p>
          <div className="space-y-2">
            {cachedPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition text-slate-300 hover:text-white"
              >
                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-sm font-medium">{page.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-indigo-900/40"
          >
            Try Reconnecting
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-sm rounded-xl transition"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
