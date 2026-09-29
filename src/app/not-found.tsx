'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="relative inline-block mb-6">
          <span
            className="text-[9rem] font-black leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              opacity: 0.15,
            }}
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-200">
              <Search className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Page Not Found
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved to a different URL.
        </p>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Quick Links
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'Dashboard', href: '/' },
              { name: 'Tasks', href: '/tasks' },
              { name: 'Schedule', href: '/schedule' },
              { name: 'Statistics', href: '/statistics' },
            ].map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 text-sm font-medium transition"
              >
                <span className="text-slate-300 hover:text-indigo-400">→</span>
                {page.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-indigo-200"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
