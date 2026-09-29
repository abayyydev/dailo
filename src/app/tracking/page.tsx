'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useTracking, TimeLog } from '@/context/TrackingContext';
import { ManualTimeLogModal } from '@/components/tracking/ManualTimeLogModal';
import {
  Timer,
  Play,
  Pause,
  Square,
  X,
  Clock,
  Calendar as CalendarIcon,
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Flame,
  BarChart2,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface PlannedVsActualItem {
  schedule_id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  category_name?: string | null;
  category_color?: string | null;
  planned_seconds: number;
  actual_seconds: number;
  diff_seconds: number;
  variance_status: 'not_started' | 'on_track' | 'overrun' | 'underrun';
}

export default function TimeTrackingPage() {
  const { token, isAuthenticated } = useAuth();
  const {
    activeTimer,
    elapsedSeconds,
    isRunning,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    discardTimer,
  } = useTracking();

  const [titleInput, setTitleInput] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [totalSecondsTracked, setTotalSecondsTracked] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [pvaData, setPvaData] = useState<PlannedVsActualItem[]>([]);
  const [pvaDate, setPvaDate] = useState(new Date().toISOString().slice(0, 10));
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Format seconds to HH:MM:SS
  const formatTimerDigits = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      hours: pad(hrs),
      minutes: pad(mins),
      seconds: pad(secs),
      formatted: `${pad(hrs)}:${pad(mins)}:${pad(secs)}`,
    };
  };

  // Format duration into readable Indonesian text (e.g. 1 Jam 15 Menit)
  const formatDurationReadable = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs} Jam ${mins > 0 ? `${mins} Menit` : ''}`;
    }
    if (mins > 0) {
      return `${mins} Menit ${secs > 0 ? `${secs} dtk` : ''}`;
    }
    return `${secs} detik`;
  };

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data.categories || []);
      if (data.categories?.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data.categories[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, [token, apiUrl, selectedCategoryId]);

  // Fetch time logs
  const fetchLogs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/tracking/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setTimeLogs(data.logs || []);
      setTotalSecondsTracked(data.total_seconds || 0);
      setTotalSessions(data.total_sessions || 0);
    } catch (err) {
      console.error('Failed to fetch time logs:', err);
    }
  }, [token, apiUrl]);

  // Fetch Planned vs Actual
  const fetchPlannedVsActual = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/tracking/planned-vs-actual?date=${pvaDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPvaData(data.comparison || []);
    } catch (err) {
      console.error('Failed to fetch planned vs actual:', err);
    }
  }, [token, apiUrl, pvaDate]);

  useEffect(() => {
    if (isAuthenticated && token) {
      Promise.all([fetchCategories(), fetchLogs(), fetchPlannedVsActual()]).then(() => {
        setLoading(false);
      });
    }
  }, [isAuthenticated, token, fetchCategories, fetchLogs, fetchPlannedVsActual]);

  const handleStartNewTimer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    const success = await startTimer({
      title: titleInput.trim(),
      category_id: selectedCategoryId || null,
    });

    if (success) {
      setTitleInput('');
    }
  };

  const handleStartFromSchedule = async (item: PlannedVsActualItem) => {
    await startTimer({
      title: item.title,
      schedule_id: item.schedule_id,
    });
  };

  const handleStopTimer = async () => {
    const savedLog = await stopTimer();
    if (savedLog) {
      fetchLogs();
      fetchPlannedVsActual();
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!token) return;
    if (!confirm('Hapus log sesi waktu ini?')) return;

    try {
      await fetch(`${apiUrl}/api/tracking/logs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLogs();
      fetchPlannedVsActual();
    } catch (err) {
      console.error('Failed to delete time log:', err);
    }
  };

  const timerDigits = formatTimerDigits(elapsedSeconds);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 md:pb-0">
        <Header />

        <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Page Title & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <Timer className="w-7 h-7 text-indigo-600" />
                <span>Time Tracking</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Lacak durasi aktivitas secara real-time, bandingkan dengan rencana jadwal, dan evaluasi fokus harian Anda.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Catat Waktu Manual</span>
              </button>
            </div>
          </div>

          {/* 1. Hero Real-time Stopwatch Card */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 shadow-xl relative overflow-hidden">
            {/* Background Glow Accents */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Left: Stopwatch Display */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-3 w-3">
                    {activeTimer && isRunning && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-3 w-3 ${
                        activeTimer
                          ? isRunning
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                          : 'bg-slate-500'
                      }`}
                    />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                    {activeTimer
                      ? isRunning
                        ? 'Stopwatch Sedang Berjalan'
                        : 'Stopwatch Dijeda'
                      : 'Stopwatch Siap Digunakan'}
                  </span>
                </div>

                {/* Big Counter Digits */}
                <div className="font-mono text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white flex items-baseline">
                  <span className="text-emerald-400">{timerDigits.hours}</span>
                  <span className="text-slate-500 mx-1">:</span>
                  <span className="text-emerald-400">{timerDigits.minutes}</span>
                  <span className="text-slate-500 mx-1">:</span>
                  <span className="text-emerald-300">{timerDigits.seconds}</span>
                </div>

                {/* Active Activity Title */}
                {activeTimer ? (
                  <div className="mt-4 flex items-center gap-2">
                    <p className="text-sm font-semibold text-white/90">
                      Aktivitas: <span className="text-indigo-300">{activeTimer.title}</span>
                    </p>
                    {activeTimer.category_name && (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{
                          backgroundColor: `${activeTimer.category_color}20`,
                          borderColor: `${activeTimer.category_color}40`,
                          color: activeTimer.category_color || '#A5B4FC',
                        }}
                      >
                        {activeTimer.category_name}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-400 max-w-sm">
                    Mulai pelacakan waktu untuk sesi fokus pengerjaan tugas atau agenda terjadwal Anda.
                  </p>
                )}
              </div>

              {/* Right: Controls & Start Form */}
              <div className="w-full md:w-auto min-w-[320px]">
                {activeTimer ? (
                  /* Active Controls */
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3">
                    <p className="text-xs text-indigo-200 font-medium text-center">
                      Kendali Sesi Waktu Aktif
                    </p>

                    <div className="grid grid-cols-2 gap-2.5">
                      {isRunning ? (
                        <button
                          onClick={() => pauseTimer()}
                          className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          <Pause className="w-4 h-4" />
                          <span>Jeda Timer</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => resumeTimer()}
                          className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Lanjutkan</span>
                        </button>
                      )}

                      <button
                        onClick={handleStopTimer}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        <span>Selesai & Simpan</span>
                      </button>
                    </div>

                    <button
                      onClick={() => discardTimer()}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Batalkan tanpa menyimpan</span>
                    </button>
                  </div>
                ) : (
                  /* Start New Form */
                  <form
                    onSubmit={handleStartNewTimer}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-indigo-200">
                        Nama Aktivitas / Fokus
                      </label>
                      <input
                        type="text"
                        required
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        placeholder="Apa yang sedang Anda kerjakan?"
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/20 border border-white/20 placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-indigo-200">
                        Kategori
                      </label>
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-white/20 text-white focus:outline-none"
                      >
                        <option value="">Tanpa Kategori</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Mulai Lacak Waktu</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* 2. KPI Stats Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Waktu Dilacak</p>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {formatDurationReadable(totalSecondsTracked)}
                </h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Sesi Kerja</p>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {totalSessions} Sesi
                </h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Rata-rata Durasi Sesi</p>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {totalSessions > 0
                    ? formatDurationReadable(Math.floor(totalSecondsTracked / totalSessions))
                    : '0 Menit'}
                </h3>
              </div>
            </div>
          </div>

          {/* 3. Planned vs Actual Duration Analysis Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  <span>Perbandingan Durasi: Rencana (Planned) vs Realisasi (Actual)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mengevaluasi akurasi estimasi alokasi waktu pada jadwal timeline harian Anda.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={pvaDate}
                  onChange={(e) => setPvaDate(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-800 font-medium"
                />
              </div>
            </div>

            {pvaData.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tidak ada aktivitas terjadwal pada tanggal ini untuk diperbandingkan.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                {pvaData.map((item) => {
                  const plannedMins = Math.round(item.planned_seconds / 60);
                  const actualMins = Math.round(item.actual_seconds / 60);
                  const diffMins = Math.round(item.diff_seconds / 60);

                  return (
                    <div
                      key={item.schedule_id}
                      className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                    >
                      {/* Activity Title & Time */}
                      <div className="flex-1 min-w-[220px]">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                          {item.category_name && (
                            <span
                              className="px-2 py-0.5 rounded text-[9px] font-semibold border"
                              style={{
                                backgroundColor: `${item.category_color}15`,
                                borderColor: `${item.category_color}30`,
                                color: item.category_color || '#4F46E5',
                              }}
                            >
                              {item.category_name}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Jadwal: {item.start_time.slice(0, 5)} – {item.end_time.slice(0, 5)}
                        </p>
                      </div>

                      {/* Comparison Metrics */}
                      <div className="flex items-center gap-6 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Rencana</span>
                          <span className="font-semibold text-slate-700">{plannedMins} mnt</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block">Realisasi</span>
                          <span className="font-bold text-slate-900">
                            {actualMins > 0 ? `${actualMins} mnt` : '-'}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="min-w-[130px]">
                          {item.variance_status === 'on_track' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>On Track ({diffMins >= 0 ? `+${diffMins}m` : `${diffMins}m`})</span>
                            </span>
                          )}
                          {item.variance_status === 'overrun' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Overrun +{diffMins}m</span>
                            </span>
                          )}
                          {item.variance_status === 'underrun' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <TrendingUp className="w-3 h-3" />
                              <span>Cepat Selesai ({diffMins}m)</span>
                            </span>
                          )}
                          {item.variance_status === 'not_started' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              <span>Belum Dikerjakan</span>
                            </span>
                          )}
                        </div>

                        {/* 1-Click Start Button if not running */}
                        {(!activeTimer || activeTimer.schedule_id !== item.schedule_id) && (
                          <button
                            onClick={() => handleStartFromSchedule(item)}
                            title="Mulai stopwatch untuk aktivitas ini"
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Time Logs History Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Riwayat Sesi Waktu (Time Logs)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar seluruh sesi kerja yang tercatat secara otomatis maupun manual.
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-500">
                {timeLogs.length} Sesi Terdata
              </span>
            </div>

            {timeLogs.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Belum ada riwayat sesi waktu</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mulai stopwatch di atas atau tambahkan catatan manual untuk mulai merekam waktu kerja.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[11px]">
                      <th className="pb-2 font-medium">Aktivitas</th>
                      <th className="pb-2 font-medium">Kategori</th>
                      <th className="pb-2 font-medium">Tanggal & Waktu</th>
                      <th className="pb-2 font-medium">Metode</th>
                      <th className="pb-2 font-medium">Durasi</th>
                      <th className="pb-2 text-right font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {timeLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 group">
                        <td className="py-3 font-bold text-slate-800 max-w-[200px] truncate">
                          {log.title}
                          {log.notes && (
                            <span className="block text-[10px] text-slate-400 font-normal truncate">
                              {log.notes}
                            </span>
                          )}
                        </td>

                        <td className="py-3">
                          {log.category_name ? (
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                              style={{
                                backgroundColor: `${log.category_color}15`,
                                borderColor: `${log.category_color}30`,
                                color: log.category_color || '#4F46E5',
                              }}
                            >
                              {log.category_name}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3 text-slate-600 text-[11px]">
                          <div>{log.log_date}</div>
                          <div className="text-slate-400 text-[10px]">
                            {new Date(log.start_time).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            –{' '}
                            {new Date(log.end_time).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>

                        <td className="py-3">
                          {log.is_manual ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                              Manual
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-100">
                              Stopwatch
                            </span>
                          )}
                        </td>

                        <td className="py-3 font-mono font-bold text-slate-900">
                          {formatDurationReadable(log.duration_seconds)}
                        </td>

                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            title="Hapus sesi ini"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Manual Time Entry Modal */}
      <ManualTimeLogModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onLogSaved={() => {
          fetchLogs();
          fetchPlannedVsActual();
        }}
        categories={categories}
      />
    </div>
  );
}
