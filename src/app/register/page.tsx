'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  User as UserIcon,
  Mail,
  Lock,
  UserPlus,
  Sparkles,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, login, isAuthenticated, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError('Anda harus mencentang dan menyetujui Syarat & Ketentuan (Terms of Service) sebelum mendaftar.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }

    setSubmitting(true);

    try {
      await register(name, email, password);
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Pendaftaran gagal. Silakan periksa kembali data Anda.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      await login('demo@timeplanner.com', 'Password123!');
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan akun demo.');
    } finally {
      setDemoLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 animate-pulse">
            d
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Memeriksa sesi...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Brand Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            d
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 tracking-tight text-xl leading-tight">
              dailo
            </span>
            <span className="text-xs font-medium text-slate-400 tracking-normal leading-tight">
              your personal flow
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1 transition-colors"
        >
          <span>Sudah punya akun? Masuk</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side Presentation */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-semibold w-fit border border-emerald-200/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mulai Dalam 30 Detik • Gratis</span>
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Rancang Hari Anda, Bangun Kebiasaan Baik Anda.
          </h1>

          <p className="text-slate-600 text-sm leading-relaxed">
            Bergabunglah dengan ekosistem produktivitas dailo. Buat akun pribadi Anda untuk menyimpan jadwal, kategori, catatan, dan statistik kemajuan tanpa batas.
          </p>

          <div className="p-5 rounded-2xl bg-white/70 border border-slate-200/80 backdrop-blur-xs space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Apa yang Anda Dapatkan:
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Pelacakan waktu cerdas dengan widget timer melayang</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Manajemen tugas &amp; checklist prioritas terstruktur</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Sesi fokus Zen Pomodoro dengan sound synthesizer</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Analitik produktivitas harian dan mingguan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side Register Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Buat Akun dailo
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Daftarkan akun baru atau masuk instan dengan akun demo.
              </p>
            </div>

            {/* Quick Demo Option */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-indigo-50/60 to-purple-50/40 border border-indigo-150">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Mau Mencoba Dulu?
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  1-Klik
                </span>
              </div>
              <button
                type="button"
                id="btn-register-demo-login"
                onClick={handleQuickDemoLogin}
                disabled={demoLoading || submitting}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-75"
              >
                {demoLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghubungkan Demo...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Masuk Langsung dengan Akun Demo</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                atau isi formulir
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="input-register-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Muhammad Akbar"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="input-register-email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password (Minimal 6 Karakter)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="input-register-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms of Service Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    id="checkbox-terms"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (e.target.checked && error?.includes('Syarat & Ketentuan')) {
                        setError(null);
                      }
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
                  />
                  <span className="text-xs text-slate-600 leading-snug">
                    Saya telah membaca dan menyetujui{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Syarat & Ketentuan (T&C)
                    </Link>{' '}
                    serta{' '}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Kebijakan Privasi
                    </Link>{' '}
                    dailo.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                id="btn-register-submit"
                disabled={submitting || demoLoading || !agreedToTerms}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Daftar Akun Baru</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer switcher */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Sudah memiliki akun?{' '}
                <Link
                  href="/login"
                  className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Masuk ke Akun Saya
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <div className="max-w-6xl w-full mx-auto text-center py-4 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-2">
        <span>&copy; {new Date().getFullYear()} dailo &bull; your personal flow</span>
        <span className="hidden sm:inline">&bull;</span>
        <Link href="/privacy" className="text-slate-500 hover:text-indigo-600 font-medium underline underline-offset-2">
          Kebijakan Privasi
        </Link>
        <span className="hidden sm:inline">&bull;</span>
        <Link href="/terms" className="text-slate-500 hover:text-indigo-600 font-medium underline underline-offset-2">
          Syarat & Ketentuan (T&C)
        </Link>
        <span className="hidden sm:inline">&bull;</span>
        <span>Dibuat oleh <a href="https://github.com/abayyydev" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-600 hover:text-indigo-600 hover:underline">abayyydev</a></span>
      </div>
    </div>
  );
}
