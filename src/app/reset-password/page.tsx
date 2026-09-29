'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!token) {
      setError('Link reset tidak valid atau sudah kadaluarsa.');
    }
  }, [token]);

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { label: '', color: '' };
    if (pwd.length < 6) return { label: 'Terlalu pendek', color: 'text-rose-400' };
    if (pwd.length < 8) return { label: 'Lemah', color: 'text-amber-400' };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { label: 'Kuat', color: 'text-emerald-400' };
    return { label: 'Sedang', color: 'text-yellow-400' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi tidak cocok.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (!token) {
      setError('Token tidak valid.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal mereset password.');
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">dailo</span>
          </div>

          {success ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Password Berhasil Diubah!</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Password Anda telah berhasil diperbarui. Anda akan diarahkan ke halaman login dalam 3 detik...
                </p>
              </div>
              <Link
                href="/login"
                className="inline-block w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm text-center transition-all hover:bg-indigo-500"
              >
                Masuk Sekarang
              </Link>
            </div>
          ) : !token ? (
            /* Invalid Token State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Link Tidak Valid</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Link reset password ini tidak valid atau sudah kadaluarsa (berlaku 1 jam).
                  Silakan minta link baru.
                </p>
              </div>
              <Link
                href="/forgot-password"
                className="inline-block w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm text-center transition-all hover:bg-indigo-500"
              >
                Minta Link Baru
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-extrabold text-white mb-1.5">Buat Password Baru</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Masukkan password baru untuk akun Anda.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <p className={`text-[11px] mt-1 font-medium ${strength.color}`}>
                      Kekuatan: {strength.label}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      className={`w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        confirmPassword && confirmPassword !== password
                          ? 'border-rose-500/50 focus:ring-rose-500'
                          : 'border-white/15 focus:ring-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-[11px] mt-1 font-medium text-rose-400">
                      Password tidak cocok
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  id="reset-password-btn"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Password Baru'
                  )}
                </button>
              </form>
            </>
          )}

          {/* Back to login */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke halaman login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
