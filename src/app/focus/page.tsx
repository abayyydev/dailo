'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { useAuth } from '@/context/AuthContext';
import { soundSynthesizer } from '@/utils/soundSynthesis';
import { AntiProcrastinationModal } from '@/components/productivity/AntiProcrastinationModal';
import {
  Zap,
  Clock,
  Timer,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Save,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  CloudRain,
  Wind,
  Waves,
  CheckSquare,
  Square,
  ListTodo,
  TrendingUp,
  Award,
  Flame,
  ChevronRight,
  Loader2,
} from 'lucide-react';

interface LapItem {
  lap: number;
  splitTime: number; // total centiseconds
  duration: number; // centiseconds for this lap
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface TaskItem {
  id: string;
  title: string;
  total_subtasks: number;
  completed_subtasks: number;
  subtasks?: { id: string; parent_id?: string | null; title: string; is_completed: boolean }[];
}

function FocusHubContent() {
  const { token, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Active Tab
  const initialMode = searchParams?.get('mode');
  const initialTab = searchParams?.get('tab');
  const [activeTab, setActiveTab] = useState<'stopwatch' | 'countdown' | 'zen' | 'analytics'>(
    initialTab === 'analytics'
      ? 'analytics'
      : initialMode === 'stopwatch'
      ? 'stopwatch'
      : initialMode === 'focus'
      ? 'zen'
      : 'countdown'
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // ─── STOPWATCH STATE ──────────────────────────────────────────────────────────
  const [swCentiseconds, setSwCentiseconds] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [swLaps, setSwLaps] = useState<LapItem[]>([]);
  const swTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSavingSwModal, setIsSavingSwModal] = useState(false);
  const [swTitle, setSwTitle] = useState('Sesi Stopwatch');
  const [swCategoryId, setSwCategoryId] = useState('');

  // ─── COUNTDOWN / POMODORO STATE ──────────────────────────────────────────────
  const [cdTargetSeconds, setCdTargetSeconds] = useState(1500); // 25m default
  const [cdRemainingSeconds, setCdRemainingSeconds] = useState(1500);
  const [cdRunning, setCdRunning] = useState(false);
  const cdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── ZEN FOCUS MODE & AMBIENT AUDIO STATE ────────────────────────────────────
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'white' | 'brown'>('none');
  const [ambientVolume, setAmbientVolume] = useState(0.2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const zenContainerRef = useRef<HTMLDivElement>(null);

  // ─── ANTI-PROCRASTINATION MODAL ──────────────────────────────────────────────
  const [isAntiProcOpen, setIsAntiProcOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [antiProcTitle, setAntiProcTitle] = useState('');

  // ─── ANALYTICS STATE ─────────────────────────────────────────────────────────
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Categories & Tasks
  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [catRes, taskRes] = await Promise.all([
        fetch(`${apiUrl}/api/categories`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/tasks?status=pending`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
      if (taskRes.ok) {
        const taskData = await taskRes.json();
        setTasks(taskData.tasks || []);
        if (taskData.tasks?.length > 0) {
          setSelectedTask(taskData.tasks[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load tasks/categories:', err);
    }
  }, [token, apiUrl]);

  // Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/focus/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Failed to load focus analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [token, apiUrl]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchData();
      if (activeTab === 'analytics') {
        fetchAnalytics();
      }
    }
  }, [isAuthenticated, token, fetchData, fetchAnalytics, activeTab]);

  // ─── STOPWATCH LOGIC ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (swRunning) {
      swTimerRef.current = setInterval(() => {
        setSwCentiseconds((prev) => prev + 1);
      }, 10);
    } else if (swTimerRef.current) {
      clearInterval(swTimerRef.current);
    }
    return () => {
      if (swTimerRef.current) clearInterval(swTimerRef.current);
    };
  }, [swRunning]);

  const handleSwStart = () => {
    soundSynthesizer.playClick();
    setSwRunning(true);
  };
  const handleSwPause = () => {
    soundSynthesizer.playClick();
    setSwRunning(false);
  };
  const handleSwReset = () => {
    soundSynthesizer.playClick();
    setSwRunning(false);
    setSwCentiseconds(0);
    setSwLaps([]);
  };

  const handleSwLap = () => {
    soundSynthesizer.playClick();
    const prevSplit = swLaps.length > 0 ? swLaps[0].splitTime : 0;
    const duration = swCentiseconds - prevSplit;
    const newLap: LapItem = {
      lap: swLaps.length + 1,
      splitTime: swCentiseconds,
      duration,
    };
    setSwLaps([newLap, ...swLaps]);
  };

  const handleSaveSwLog = async () => {
    if (!token || swCentiseconds < 100) return;
    const seconds = Math.floor(swCentiseconds / 100);
    try {
      const res = await fetch(`${apiUrl}/api/focus/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mode: 'stopwatch',
          actual_duration_seconds: seconds,
          title: swTitle,
          category_id: swCategoryId || null,
          laps: swLaps,
          auto_log_time: true,
        }),
      });
      if (res.ok) {
        showToast('Sesi stopwatch berhasil disimpan ke Catatan Waktu!', 'success');
        setIsSavingSwModal(false);
        handleSwReset();
      } else {
        showToast('Gagal menyimpan catatan waktu.', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan koneksi.', 'error');
    }
  };

  // ─── COUNTDOWN & POMODORO LOGIC ───────────────────────────────────────────────
  useEffect(() => {
    if (cdRunning) {
      cdTimerRef.current = setInterval(() => {
        setCdRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(cdTimerRef.current!);
            setCdRunning(false);
            soundSynthesizer.playCompletionChime();
            showToast('Sesi Pomodoro selesai! Waktunya istirahat atau lanjut ke sesi berikutnya.', 'success');
            // Log session
            if (token) {
              fetch(`${apiUrl}/api/focus/sessions`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  mode: 'pomodoro',
                  target_duration_seconds: cdTargetSeconds,
                  actual_duration_seconds: cdTargetSeconds,
                  status: 'completed',
                  task_id: selectedTask?.id || null,
                  auto_log_time: true,
                }),
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (cdTimerRef.current) {
      clearInterval(cdTimerRef.current);
    }
    return () => {
      if (cdTimerRef.current) clearInterval(cdTimerRef.current);
    };
  }, [cdRunning, cdTargetSeconds, token, apiUrl, selectedTask]);

  const handleCdPreset = (seconds: number) => {
    soundSynthesizer.playClick();
    setCdRunning(false);
    setCdTargetSeconds(seconds);
    setCdRemainingSeconds(seconds);
  };

  // ─── ZEN / FOCUS MODE CONTROLS ───────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleAmbientChange = (type: 'none' | 'rain' | 'white' | 'brown') => {
    setAmbientSound(type);
    if (type === 'none') {
      soundSynthesizer.stopAmbientNoise();
    } else {
      soundSynthesizer.startAmbientNoise(type, ambientVolume);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    soundSynthesizer.setAmbientVolume(vol);
  };

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      soundSynthesizer.stopAmbientNoise();
    };
  }, []);

  // Format Helper: centiseconds to 00:00:00.00
  const formatSwDigits = (cs: number) => {
    const hours = Math.floor(cs / 360000);
    const minutes = Math.floor((cs % 360000) / 6000);
    const seconds = Math.floor((cs % 6000) / 100);
    const centis = cs % 100;
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds),
      centis: pad(centis),
      timeStr: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    };
  };

  // Format countdown seconds to MM:SS or HH:MM:SS
  const formatCdDigits = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    if (hrs > 0) return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    return `${pad(mins)}:${pad(secs)}`;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-medium animate-slide-up ${
                toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              {toast.message}
            </div>
          )}

          {/* Anti-Procrastination Modal */}
          <AntiProcrastinationModal
            isOpen={isAntiProcOpen}
            actionTitle={antiProcTitle}
            taskId={selectedTask?.id}
            onCancel={() => {
              setIsAntiProcOpen(false);
              setPendingAction(null);
            }}
            onConfirm={() => {
              setIsAntiProcOpen(false);
              if (pendingAction) {
                pendingAction();
                setPendingAction(null);
              }
            }}
          />

          {/* Hero Banner */}
          <div className="max-w-5xl mx-auto mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-orange-950/10 relative overflow-hidden">
              <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Zap className="w-4 h-4" />
                  <span>Advanced Productivity &bull; Phase 13</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                  Focus Mode &amp; Productivity Center
                </h1>
                <p className="text-amber-100/90 text-sm md:text-base max-w-xl">
                  Tingkatkan efisiensi kerja dengan Stopwatch presisi, Pomodoro countdown, ruang kerja imersif dengan audio ambient, dan pencegah prokrastinasi.
                </p>
              </div>

              <div className="flex items-center gap-2 relative z-10 shrink-0">
                <button
                  onClick={() => {
                    setActiveTab('zen');
                    toggleFullscreen();
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-orange-700 font-bold text-sm hover:bg-orange-50 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Masuk Focus Mode Zen</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="max-w-5xl mx-auto mb-6">
            <div className="flex border-b border-slate-200 space-x-2 md:space-x-6">
              <button
                onClick={() => setActiveTab('countdown')}
                className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'countdown'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Timer className="w-4 h-4" />
                <span>Countdown / Pomodoro</span>
              </button>

              <button
                onClick={() => setActiveTab('stopwatch')}
                className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'stopwatch'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Stopwatch &amp; Lap</span>
              </button>

              <button
                onClick={() => setActiveTab('zen')}
                className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'zen'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Ruang Zen (Ambient)</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('analytics');
                  fetchAnalytics();
                }}
                className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analisis Energi &amp; Produktivitas</span>
              </button>
            </div>
          </div>

          {/* TAB 1: COUNTDOWN / POMODORO */}
          {activeTab === 'countdown' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs text-center relative overflow-hidden">
                {/* Preset Chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                  {[
                    { label: '15 Min', secs: 900 },
                    { label: '25 Min (Pomodoro)', secs: 1500 },
                    { label: '30 Min', secs: 1800 },
                    { label: '45 Min (Deep)', secs: 2700 },
                    { label: '60 Min (Power)', secs: 3600 },
                  ].map((preset) => (
                    <button
                      key={preset.secs}
                      onClick={() => handleCdPreset(preset.secs)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        cdTargetSeconds === preset.secs
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Circular Progress Ring Timer */}
                <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      className="stroke-slate-100"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      className="stroke-orange-500 transition-all duration-500 ease-linear"
                      strokeWidth="6"
                      strokeDasharray="276.46"
                      strokeDashoffset={
                        276.46 * (1 - (cdTargetSeconds - cdRemainingSeconds) / cdTargetSeconds)
                      }
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
                      {formatCdDigits(cdRemainingSeconds)}
                    </span>
                    <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
                      {cdRunning ? 'Sedang Berjalan' : 'Jeda / Siap'}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => handleCdPreset(cdTargetSeconds)}
                    className="p-3.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                    title="Ulangi dari awal"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      soundSynthesizer.playClick();
                      setCdRunning(!cdRunning);
                    }}
                    className={`flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base shadow-md transition-all active:scale-95 cursor-pointer text-white ${
                      cdRunning
                        ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                        : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
                    }`}
                  >
                    {cdRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    <span>{cdRunning ? 'Jeda Pomodoro' : 'Mulai Pomodoro'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STOPWATCH & LAP */}
          {activeTab === 'stopwatch' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs text-center">
                {/* Digital Display */}
                <div className="my-6">
                  {(() => {
                    const d = formatSwDigits(swCentiseconds);
                    return (
                      <div className="font-mono text-5xl sm:text-7xl font-black text-slate-900 tracking-tight">
                        <span>{d.hours}</span>
                        <span className="text-slate-300">:</span>
                        <span>{d.minutes}</span>
                        <span className="text-slate-300">:</span>
                        <span>{d.seconds}</span>
                        <span className="text-2xl sm:text-3xl text-orange-500 font-bold ml-2">
                          .{d.centis}
                        </span>
                      </div>
                    );
                  })()}
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mt-2">
                    {swRunning ? 'Stopwatch Aktif' : 'Berhenti'}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                  {!swRunning ? (
                    <button
                      onClick={handleSwStart}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-100 transition-all cursor-pointer"
                    >
                      <Play className="w-5 h-5 ml-0.5" />
                      <span>Mulai</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSwPause}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-100 transition-all cursor-pointer"
                    >
                      <Pause className="w-5 h-5" />
                      <span>Jeda</span>
                    </button>
                  )}

                  <button
                    onClick={handleSwLap}
                    disabled={!swRunning}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Catat Lap</span>
                  </button>

                  <button
                    onClick={handleSwReset}
                    disabled={swCentiseconds === 0}
                    className="p-3.5 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all disabled:opacity-40 cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {swCentiseconds >= 6000 && (
                    <button
                      onClick={() => setIsSavingSwModal(true)}
                      className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-100 transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan ke Time Log</span>
                    </button>
                  )}
                </div>

                {/* Lap Times Table */}
                {swLaps.length > 0 && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-w-xl mx-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4">Lap</th>
                          <th className="py-2.5 px-4">Waktu Lap</th>
                          <th className="py-2.5 px-4">Total Waktu (Split)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {swLaps.map((lp) => (
                          <tr key={lp.lap} className="hover:bg-slate-50">
                            <td className="py-2 px-4 font-semibold text-slate-800">#{lp.lap}</td>
                            <td className="py-2 px-4 text-orange-600 font-bold">
                              +{formatSwDigits(lp.duration).timeStr}.{formatSwDigits(lp.duration).centis}
                            </td>
                            <td className="py-2 px-4 text-slate-600">
                              {formatSwDigits(lp.splitTime).timeStr}.{formatSwDigits(lp.splitTime).centis}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Save Modal */}
              {isSavingSwModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                  <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                    <h3 className="text-base font-bold text-slate-900">Simpan Stopwatch ke Catatan Waktu</h3>
                    <p className="text-xs text-slate-500">
                      Total durasi: <span className="font-bold text-slate-800">{formatSwDigits(swCentiseconds).timeStr}</span>
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Aktivitas</label>
                      <input
                        type="text"
                        value={swTitle}
                        onChange={(e) => setSwTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                      <select
                        value={swCategoryId}
                        onChange={(e) => setSwCategoryId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                      >
                        <option value="">-- Tanpa Kategori --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => setIsSavingSwModal(false)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSaveSwLog}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700"
                      >
                        Simpan Catatan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ZEN FOCUS MODE (AMBIENT SOUND) */}
          {activeTab === 'zen' && (
            <div
              ref={zenContainerRef}
              className="max-w-5xl mx-auto bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-8"
            >
              {/* Top Bar inside Zen Mode */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Ruang Fokus Zen</h2>
                    <p className="text-xs text-slate-400">Bebas gangguan dengan generator audio ambient lokal.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (Fullscreen)'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      setAntiProcTitle('Keluar dari Ruang Zen');
                      setPendingAction(() => () => setActiveTab('countdown'));
                      setIsAntiProcOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                  >
                    Keluar Sesi
                  </button>
                </div>
              </div>

              {/* Ambient Noise Selector */}
              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Suara Latar (Ambient Soundscapes)
                  </span>
                  <p className="text-xs text-slate-400">
                    Sintesis gelombang audio riil berbasis Web Audio API lokal.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    { id: 'none', label: 'Hening', icon: VolumeX },
                    { id: 'rain', label: 'Hujan', icon: CloudRain },
                    { id: 'brown', label: 'Deep Brown', icon: Waves },
                    { id: 'white', label: 'White Noise', icon: Wind },
                  ].map((s) => {
                    const Icon = s.icon;
                    const isSelected = ambientSound === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleAmbientChange(s.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Focus Task & Multi-level Subtasks display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckSquare className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold uppercase text-slate-300">Tugas yang Sedang Dikerjakan</span>
                  </div>

                  <select
                    value={selectedTask?.id || ''}
                    onChange={(e) => {
                      const t = tasks.find((tk) => tk.id === e.target.value);
                      setSelectedTask(t || null);
                    }}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white focus:ring-2 focus:ring-orange-500"
                  >
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>

                  <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs leading-relaxed text-slate-300 italic text-center">
                    &quot;Bekerjalah dengan pikiran tunggal. Hilangkan distraksi, fokus pada satu tindakan saat ini.&quot;
                  </div>
                </div>

                {/* Subtask checklist */}
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <ListTodo className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase text-slate-300">Subtask &amp; Checklist</span>
                  </div>

                  {selectedTask?.subtasks && selectedTask.subtasks.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedTask.subtasks.map((sub) => (
                        <div
                          key={sub.id}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs transition-colors ${
                            sub.parent_id ? 'pl-6 bg-slate-900/30' : 'bg-slate-900/60'
                          }`}
                        >
                          {sub.is_completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                          <span
                            className={
                              sub.is_completed ? 'line-through text-slate-500' : 'text-slate-200'
                            }
                          >
                            {sub.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500">
                      Tugas ini belum memiliki subtask checklist.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADVANCED PRODUCTIVITY ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="max-w-5xl mx-auto space-y-6">
              {analyticsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
                  <span className="text-xs font-medium">Menganalisis data kurva energi produktivitas...</span>
                </div>
              ) : analyticsData ? (
                <>
                  {/* Peak Productivity Banner */}
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs uppercase font-semibold text-orange-100">
                          Puncak Energi Produktivitas Anda
                        </div>
                        <div className="text-xl font-black">
                          {analyticsData.energy_curve?.peak_energy_time}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black">
                        {analyticsData.efficiency?.completion_rate_percentage}%
                      </div>
                      <div className="text-xs text-orange-100">Tingkat Penyelesaian Sesi</div>
                    </div>
                  </div>

                  {/* Hourly Energy Curve Chart */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Kurva Energi Produktivitas 24-Jam (Hourly Curve)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Distribusi menit fokus dan aktivitas yang diselesaikan berdasarkan jam sepanjang hari.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-end gap-1 sm:gap-2 h-48 pt-8 border-b border-slate-100">
                      {analyticsData.energy_curve?.hourly.map((h: any) => {
                        const maxMin = Math.max(
                          ...analyticsData.energy_curve.hourly.map((x: any) => x.total_minutes),
                          60
                        );
                        const heightPct = Math.max(4, Math.round((h.total_minutes / maxMin) * 100));

                        return (
                          <div
                            key={h.hour}
                            className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                          >
                            {/* Hover Tooltip */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-10">
                              {h.hour_label}: {h.total_minutes} menit ({h.sessions_count} sesi)
                            </div>

                            <div
                              style={{ height: `${heightPct}%` }}
                              className={`w-full rounded-t-sm transition-all duration-300 ${
                                h.total_minutes > 0
                                  ? 'bg-orange-500 hover:bg-orange-600'
                                  : 'bg-slate-100'
                              }`}
                            />
                            <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">
                              {h.hour % 3 === 0 ? h.hour : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-1">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>Sesi Selesai</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {analyticsData.efficiency?.completed_sessions}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Rata-rata {analyticsData.efficiency?.average_session_minutes} menit / sesi
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-1">
                        <Flame className="w-4 h-4 text-orange-600" />
                        <span>Total Jam Fokus</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {analyticsData.efficiency?.total_focus_hours}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Akumulasi sesi 30 hari terakhir</div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-1">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span>Anti-Prokrastinasi</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {analyticsData.anti_procrastination?.passed} / {analyticsData.anti_procrastination?.total}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Tantangan berhasil dilalui</div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </main>
        <Footer />

        <MobileNav />
      </div>
    </div>
  );
}

export default function FocusHubPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      }
    >
      <FocusHubContent />
    </React.Suspense>
  );
}
