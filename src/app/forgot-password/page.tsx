'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Always show success to prevent email enumeration
      setSent(true);
    } catch (err: any) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
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
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">dailo</span>
          </div>

          {!sent ? (
            <>
              {/* Header */}
              <div className="mb-7">
                <h1 className="text-2xl font-extrabold text-white mb-1.5">Lupa Password?</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Masukkan email akun Anda dan kami akan mengirimkan link untuk reset password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  id="send-reset-btn"
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    'Kirim Link Reset'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Email Terkirim!</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Jika email <span className="text-white font-medium">{email}</span> terdaftar di dailo,
                  Anda akan menerima link reset password dalam beberapa menit.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-2">
                <p className="text-xs font-semibold text-slate-300">Tips:</p>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li>• Cek folder Spam/Junk jika email tidak muncul</li>
                  <li>• Link reset berlaku selama 1 jam</li>
                  <li>• Hubungi kami jika masih tidak bisa masuk</li>
                </ul>
              </div>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Kirim ulang ke email lain
              </button>
            </div>
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
