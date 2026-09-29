'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { X, Mail, Lock, User as UserIcon, LogIn, UserPlus, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, login, register } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTab(authModalTab);
    setError(null);
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login('demo@timeplanner.com', 'Password123!');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-1.5 rounded-full text-indigo-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-100 text-xs font-medium mb-2 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            Time Planner Account
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            {tab === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
          </h3>
          <p className="text-xs text-indigo-100 mt-1">
            {tab === 'login'
              ? 'Masuk untuk mengakses jadwal dan produktivitas Anda.'
              : 'Daftar untuk mulai mengelola waktu dan rencana harian.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'login'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Akbar Pratama"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : tab === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Sekarang</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Helper */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              className="w-full py-2 px-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 text-indigo-700 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quick Demo Login (demo@timeplanner.com)</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Password default demo: <span className="font-mono text-slate-600">Password123!</span>
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
              <Link
                href="/privacy"
                onClick={closeAuthModal}
                className="text-[11px] text-slate-400 hover:text-indigo-600 underline underline-offset-2 transition-colors"
              >
                Kebijakan Privasi dailo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
