'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Brain, Sparkles, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AntiProcrastinationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  actionTitle: string;
  taskId?: string;
}

export function AntiProcrastinationModal({
  isOpen,
  onConfirm,
  onCancel,
  actionTitle,
  taskId,
}: AntiProcrastinationModalProps) {
  const { token } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const [challengeType, setChallengeType] = useState<'math' | 'mindful_quote' | 'hold_confirm'>('math');
  const [mathProblem, setMathProblem] = useState({ q: '24 + 17', a: 41 });
  const [mathInput, setMathInput] = useState('');
  const [quoteInput, setQuoteInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Hold-to-confirm timer
  const [holdProgress, setHoldProgress] = useState(0);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const TARGET_QUOTE = 'Saya sadar dan bertanggung jawab atas waktu saya.';

  // Generate random problem on open
  useEffect(() => {
    if (isOpen) {
      const a = Math.floor(Math.random() * 40) + 12;
      const b = Math.floor(Math.random() * 40) + 12;
      setMathProblem({ q: `${a} + ${b}`, a: a + b });
      setMathInput('');
      setQuoteInput('');
      setErrorMsg('');
      setHoldProgress(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Math Submission
  const handleMathSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(mathInput.trim(), 10) !== mathProblem.a) {
      setErrorMsg('Jawaban belum tepat. Pikirkan sejenak dan coba lagi.');
      return;
    }

    await logAndProceed('math', mathInput.trim(), String(mathProblem.a));
  };

  // Handle Quote Submission
  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteInput.trim().toLowerCase() !== TARGET_QUOTE.toLowerCase()) {
      setErrorMsg('Ketikkan kalimat komitmen di atas dengan tepat.');
      return;
    }

    await logAndProceed('mindful_quote', quoteInput.trim(), TARGET_QUOTE);
  };

  // Handle Hold-to-confirm mouse/touch down
  const startHold = () => {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setHoldProgress(0);

    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds hold

    holdIntervalRef.current = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        await logAndProceed('hold_confirm', 'held_2.5s', 'held_2.5s');
      }
    }, 50);
  };

  const cancelHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldProgress(0);
  };

  const logAndProceed = async (type: string, answer: string, expected: string) => {
    setVerifying(true);
    setErrorMsg('');
    try {
      if (token) {
        await fetch(`${apiUrl}/api/focus/anti-procrastination/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            challenge_type: type,
            action: actionTitle,
            task_id: taskId || null,
            answer,
            expected_answer: expected,
          }),
        });
      }
      onConfirm();
    } catch (err) {
      onConfirm(); // Proceed even if log network fails
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-md w-full p-6 sm:p-7 relative overflow-hidden">
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
          Konfirmasi Anti-Prokrastinasi
        </h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Tindakan ini memerlukan kesadaran penuh sebelum melanjutkan: <span className="font-semibold text-slate-800">&quot;{actionTitle}&quot;</span>. Selesaikan tantangan singkat di bawah ini.
        </p>

        {/* Challenge Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setChallengeType('math');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              challengeType === 'math'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Matematika
          </button>
          <button
            type="button"
            onClick={() => {
              setChallengeType('mindful_quote');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              challengeType === 'mindful_quote'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Komitmen
          </button>
          <button
            type="button"
            onClick={() => {
              setChallengeType('hold_confirm');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              challengeType === 'hold_confirm'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tahan 3 Detik
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-100">
            {errorMsg}
          </div>
        )}

        {/* Challenge 1: Math */}
        {challengeType === 'math' && (
          <form onSubmit={handleMathSubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs text-slate-500 block mb-1">Hitung hasil penjumlahan:</span>
              <div className="text-2xl font-black text-slate-900 tracking-wider">
                {mathProblem.q} = ?
              </div>
            </div>

            <input
              type="number"
              value={mathInput}
              onChange={(e) => setMathInput(e.target.value)}
              placeholder="Ketikkan jawaban angka..."
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-center focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batalkan &amp; Tetap Fokus
              </button>
              <button
                type="submit"
                disabled={verifying || !mathInput}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shadow-sm transition-all disabled:opacity-50"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Verifikasi Jawaban'}
              </button>
            </div>
          </form>
        )}

        {/* Challenge 2: Mindful Quote */}
        {challengeType === 'mindful_quote' && (
          <form onSubmit={handleQuoteSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 font-medium leading-relaxed italic text-center">
              &quot;{TARGET_QUOTE}&quot;
            </div>

            <input
              type="text"
              value={quoteInput}
              onChange={(e) => setQuoteInput(e.target.value)}
              placeholder="Ketik ulang kalimat di atas..."
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Kembali Fokus
              </button>
              <button
                type="submit"
                disabled={verifying || !quoteInput}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shadow-sm transition-all disabled:opacity-50"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Konfirmasi Komitmen'}
              </button>
            </div>
          </form>
        )}

        {/* Challenge 3: Hold to confirm */}
        {challengeType === 'hold_confirm' && (
          <div className="space-y-4 text-center">
            <p className="text-xs text-slate-500">
              Tekan dan tahan tombol di bawah selama 3 detik tanpa dilepas untuk mengonfirmasi pilihan Anda.
            </p>

            <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500 bg-amber-50 select-none">
              <div
                className="absolute inset-y-0 left-0 bg-amber-500 transition-all duration-75"
                style={{ width: `${holdProgress}%` }}
              />
              <button
                type="button"
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
                onTouchStart={startHold}
                onTouchEnd={cancelHold}
                className="relative z-10 w-full py-4 font-bold text-sm text-amber-950 transition-all cursor-pointer"
              >
                {holdProgress > 0
                  ? `Menahan... ${Math.round(holdProgress)}%`
                  : 'Tekan & Tahan di Sini (3 Detik)'}
              </button>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batalkan (Kembali Bekerja)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
