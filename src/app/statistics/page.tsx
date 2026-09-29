'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart3,
  Timer,
  Target,
  CheckCircle2,
  Flame,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Calendar as CalendarIcon,
  Clock,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ArrowUpRight,
  Info,
  CalendarDays,
} from 'lucide-react';

interface StatsSummary {
  total_tracked_seconds: number;
  total_tracked_formatted: string;
  total_planned_seconds: number;
  total_planned_formatted: string;
  variance_seconds: number;
  variance_formatted: string;
  accuracy_percent: number;
  total_sessions: number;
  timer_tracked_seconds: number;
  manual_tracked_seconds: number;
  schedule_completion_rate: number;
  task_completion_rate: number;
  total_tasks: number;
  completed_tasks: number;
  total_schedules: number;
  completed_schedules: number;
  total_habits: number;
  max_habit_streak: number;
  total_habit_checkins: number;
  total_goals: number;
  completed_goals: number;
  in_progress_goals: number;
  avg_goal_progress: number;
}

interface CategoryDistItem {
  category_id: string | null;
  category_name: string;
  category_color: string;
  category_icon: string;
  duration_seconds: number;
  duration_formatted: string;
  percentage: number;
  log_count: number;
}

interface TimelineItem {
  date: string;
  day_name: string;
  day_number: number;
  planned_minutes: number;
  actual_minutes: number;
  variance_minutes: number;
  planned_formatted: string;
  actual_formatted: string;
}

interface BusiestHourItem {
  hour: string;
  hour_number: number;
  duration_seconds: number;
  duration_minutes: number;
  session_count: number;
  intensity: number;
}

interface HabitItem {
  id: string;
  title: string;
  current_streak: number;
  longest_streak: number;
  category_name: string | null;
  category_color: string | null;
  checkin_count: number;
}

interface GoalItem {
  id: string;
  title: string;
  target_type: string;
  target_value: number;
  current_value: number;
  unit: string;
  status: string;
  category_name: string | null;
  category_color: string | null;
  progress_percent: number;
}

export default function StatisticsPage() {
  const { token, isAuthenticated } = useAuth();

  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [activeDate, setActiveDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [formattedLabel, setFormattedLabel] = useState<string>('');
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [categories, setCategories] = useState<CategoryDistItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [busiestHours, setBusiestHours] = useState<BusiestHourItem[]>([]);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredDay, setHoveredDay] = useState<TimelineItem | null>(null);
  const [hoveredHour, setHoveredHour] = useState<BusiestHourItem | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchStatistics = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/statistics?period=${period}&date=${activeDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal mengambil data statistik');
      const data = await res.json();
      setSummary(data.summary);
      setCategories(data.category_distribution || []);
      setTimeline(data.planned_vs_actual || []);
      setBusiestHours(data.busiest_hours || []);
      setHabits(data.habits || []);
      setGoals(data.goals || []);
      setFormattedLabel(data.formattedLabel || '');
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  }, [token, period, activeDate, apiUrl]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStatistics();
    }
  }, [isAuthenticated, fetchStatistics]);

  const handlePrev = () => {
    const d = new Date(activeDate + 'T12:00:00Z');
    if (period === 'daily') {
      d.setUTCDate(d.getUTCDate() - 1);
    } else if (period === 'weekly') {
      d.setUTCDate(d.getUTCDate() - 7);
    } else if (period === 'monthly') {
      d.setUTCMonth(d.getUTCMonth() - 1);
    }
    setActiveDate(d.toISOString().slice(0, 10));
  };

  const handleNext = () => {
    const d = new Date(activeDate + 'T12:00:00Z');
    if (period === 'daily') {
      d.setUTCDate(d.getUTCDate() + 1);
    } else if (period === 'weekly') {
      d.setUTCDate(d.getUTCDate() + 7);
    } else if (period === 'monthly') {
      d.setUTCMonth(d.getUTCMonth() + 1);
    }
    setActiveDate(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    setActiveDate(new Date().toISOString().slice(0, 10));
  };

  // Max minutes for Bar Chart scaling
  const maxTimelineMinutes = Math.max(
    1,
    ...timeline.map((item) => Math.max(item.planned_minutes, item.actual_minutes))
  );

  // SVG Donut Math
  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let accumulatedPercent = 0;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 md:pb-0">
        <Header />

        <main className="p-3.5 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
          {/* Top Page Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Statistik & Produktivitas
                  </h1>
                  <p className="text-sm text-slate-500">
                    Analisis alokasi waktu kerja, evaluasi target rencana, dan konsistensi kebiasaan
                  </p>
                </div>
              </div>
            </div>

            {/* Filter and Date Navigator */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Period Selector Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                <button
                  id="tab-period-daily"
                  onClick={() => setPeriod('daily')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    period === 'daily'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Harian
                </button>
                <button
                  id="tab-period-weekly"
                  onClick={() => setPeriod('weekly')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    period === 'weekly'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mingguan
                </button>
                <button
                  id="tab-period-monthly"
                  onClick={() => setPeriod('monthly')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    period === 'monthly'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bulanan
                </button>
              </div>

              {/* Date Navigator */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm px-2 py-1 gap-1">
                <button
                  id="btn-prev-date"
                  onClick={handlePrev}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                  title="Periode Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-2 text-xs font-semibold text-slate-700 min-w-[130px] text-center flex items-center justify-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{formattedLabel || activeDate}</span>
                </div>
                <button
                  id="btn-next-date"
                  onClick={handleNext}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
                  title="Periode Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Reset to Today button */}
              <button
                id="btn-reset-today"
                onClick={handleToday}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200/60 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Hari Ini
              </button>
            </div>
          </div>

          {/* Top 4 KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1: Waktu Fokus */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Waktu Fokus
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Timer className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                {summary ? summary.total_tracked_formatted : '0j 0m'}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{summary?.total_sessions || 0} sesi tercatat</span>
                <span className="text-slate-300">•</span>
                <span>{Math.round((summary?.timer_tracked_seconds || 0) / 3600)}j timer</span>
              </div>
            </div>

            {/* KPI 2: Planned vs Actual */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-sky-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Akurasi Rencana
                </span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                {summary ? `${summary.accuracy_percent}%` : '0%'}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <span>Rencana: <strong>{summary?.total_planned_formatted || '0j'}</strong></span>
                <span className="text-slate-300">•</span>
                <span className={summary && summary.variance_seconds >= 0 ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                  {summary ? summary.variance_formatted : '0m'}
                </span>
              </div>
            </div>

            {/* KPI 3: Tingkat Penyelesaian */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tingkat Penyelesaian
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                {summary ? `${summary.schedule_completion_rate}%` : '0%'}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>{summary?.completed_schedules || 0}/{summary?.total_schedules || 0} agenda selesai</span>
                <span className="text-slate-300">•</span>
                <span>{summary?.completed_tasks || 0} tugas tuntas</span>
              </div>
            </div>

            {/* KPI 4: Kebiasaan & Sasaran */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Streak & Capaian
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-center gap-1.5">
                <span>{summary?.max_habit_streak || 0}</span>
                <span className="text-sm font-semibold text-amber-600">Hari Beruntun</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>{summary?.total_habit_checkins || 0} check-in</span>
                <span className="text-slate-300">•</span>
                <span>Sasaran {summary?.avg_goal_progress || 0}%</span>
              </div>
            </div>
          </div>

          {/* Main Visualizations Row 1: Planned vs Actual Bar Chart & Category Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Planned vs Actual Double-Bar Chart (2 Cols) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      Perbandingan Waktu: Rencana vs Aktual
                    </h2>
                    <p className="text-xs text-slate-500">
                      Evaluasi keselarasan jadwal terencana dan durasi eksekusi nyata
                    </p>
                  </div>
                  {/* Chart Legend */}
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block"></span>
                      <span className="text-slate-600">Rencana</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-indigo-600 inline-block"></span>
                      <span className="text-slate-600">Aktual</span>
                    </div>
                  </div>
                </div>

                {/* SVG & HTML Double-Bar Chart Area */}
                {timeline.length > 0 ? (
                  <div className="relative pt-4 pb-2">
                    {/* Hover Info Tooltip Bar */}
                    <div className="h-7 mb-2 flex items-center justify-between px-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      {hoveredDay ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold text-slate-800">
                            {hoveredDay.day_name}, {hoveredDay.date}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600">
                              Rencana: <strong>{hoveredDay.planned_formatted}</strong>
                            </span>
                            <span className="text-indigo-600 font-semibold">
                              Aktual: <strong>{hoveredDay.actual_formatted}</strong>
                            </span>
                            <span
                              className={`font-semibold ${
                                hoveredDay.variance_minutes >= 0 ? 'text-emerald-600' : 'text-amber-600'
                              }`}
                            >
                              Selisih: {hoveredDay.variance_minutes >= 0 ? '+' : ''}
                              {hoveredDay.variance_minutes}m
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">
                          Arahkan kursor pada batang grafik untuk rincian tanggal...
                        </span>
                      )}
                    </div>

                    {/* Bars Grid */}
                    <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2 pt-6 border-b border-slate-200">
                      {timeline.map((item, idx) => {
                        const plannedPercent = (item.planned_minutes / maxTimelineMinutes) * 100;
                        const actualPercent = (item.actual_minutes / maxTimelineMinutes) * 100;

                        return (
                          <div
                            key={idx}
                            className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                            onMouseEnter={() => setHoveredDay(item)}
                            onMouseLeave={() => setHoveredDay(null)}
                          >
                            <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full max-w-[60px]">
                              {/* Planned Bar */}
                              <div
                                style={{ height: `${Math.max(4, plannedPercent)}%` }}
                                className="w-1/2 bg-slate-200 group-hover:bg-slate-300 rounded-t transition-all"
                              />
                              {/* Actual Bar */}
                              <div
                                style={{ height: `${Math.max(4, actualPercent)}%` }}
                                className="w-1/2 bg-indigo-600 group-hover:bg-indigo-500 rounded-t shadow-sm transition-all"
                              />
                            </div>
                            <span className="text-[11px] font-medium text-slate-500 mt-2 block">
                              {item.day_name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {item.day_number}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                    <CalendarIcon className="w-10 h-10 stroke-[1.5] mb-2 opacity-50" />
                    <p className="text-sm">Tidak ada catatan waktu pada periode ini</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  Rata-rata akurasi jadwal Anda adalah <strong>{summary?.accuracy_percent || 0}%</strong>
                </span>
                <Link
                  href="/schedule"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-0.5"
                >
                  Buka Timeline Jadwal <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Category Distribution Donut Chart (1 Col) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Alokasi Waktu Kategori
                  </h2>
                  <p className="text-xs text-slate-500">
                    Proporsi fokus kerja berdasarkan kategori aktivitas
                  </p>
                </div>

                {categories.length > 0 ? (
                  <div>
                    {/* SVG Donut */}
                    <div className="flex justify-center my-2">
                      <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                          {/* Background Track */}
                          <circle
                            cx="80"
                            cy="80"
                            r={donutRadius}
                            className="stroke-slate-100"
                            strokeWidth="20"
                            fill="transparent"
                          />
                          {/* Category Slices */}
                          {categories.map((cat, idx) => {
                            const strokeDasharray = `${(cat.percentage / 100) * donutCircumference} ${donutCircumference}`;
                            const strokeDashoffset = -((accumulatedPercent / 100) * donutCircumference);
                            accumulatedPercent += cat.percentage;

                            return (
                              <circle
                                key={idx}
                                cx="80"
                                cy="80"
                                r={donutRadius}
                                stroke={cat.category_color || '#6366f1'}
                                strokeWidth="20"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                fill="transparent"
                                className="transition-all hover:opacity-80"
                              />
                            );
                          })}
                        </svg>

                        {/* Center Hole Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-xs text-slate-400 font-medium">Total Fokus</span>
                          <span className="text-lg font-extrabold text-slate-900 leading-tight">
                            {summary?.total_tracked_formatted || '0j'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category Legend List */}
                    <div className="space-y-2.5 mt-4 max-h-48 overflow-y-auto pr-1">
                      {categories.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: cat.category_color || '#6366f1' }}
                            />
                            <span className="font-medium text-slate-700 truncate">
                              {cat.category_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-slate-500 font-mono">
                              {cat.duration_formatted}
                            </span>
                            <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                              {cat.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                    <Layers className="w-10 h-10 stroke-[1.5] mb-2 opacity-50" />
                    <p className="text-sm">Belum ada distribusi kategori</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                <span>{categories.length} kategori aktif</span>
                <Link href="/tracking" className="text-indigo-600 font-semibold hover:underline">
                  Catat Waktu Baru &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Secondary Row 2: Busiest Hours Activity & Habits/Goals Momentum */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Busiest Hours Activity Heatmap/Bars */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Peta Jam Paling Produktif (Busiest Hours)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Konsentrasi alokasi kerja harian sepanjang rentang 06:00 – 22:00
                    </p>
                  </div>
                  {hoveredHour && (
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                      {hoveredHour.hour}: {hoveredHour.duration_minutes}m ({hoveredHour.session_count} sesi)
                    </span>
                  )}
                </div>

                {/* Hourly Visual Bars */}
                <div className="pt-4 pb-2">
                  <div className="h-44 flex items-end justify-between gap-1.5 px-2 border-b border-slate-200">
                    {busiestHours.map((hourItem, idx) => {
                      // Intensity styles
                      let barClass = 'bg-slate-100 hover:bg-slate-200';
                      if (hourItem.intensity === 1) barClass = 'bg-indigo-200 hover:bg-indigo-300';
                      else if (hourItem.intensity === 2) barClass = 'bg-indigo-400 hover:bg-indigo-500';
                      else if (hourItem.intensity === 3) barClass = 'bg-indigo-600 hover:bg-indigo-700';
                      else if (hourItem.intensity === 4) barClass = 'bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-200';

                      const heightPercent = Math.max(8, (hourItem.duration_minutes / 120) * 100);

                      return (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                          onMouseEnter={() => setHoveredHour(hourItem)}
                          onMouseLeave={() => setHoveredHour(null)}
                        >
                          <div
                            style={{ height: `${Math.min(100, heightPercent)}%` }}
                            className={`w-full rounded-t transition-all ${barClass}`}
                          />
                          <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                            {hourItem.hour_number % 2 === 0 ? String(hourItem.hour_number).padStart(2, '0') : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center justify-between text-xs text-slate-500 mt-4 px-2">
                  <span className="text-[11px] text-slate-400">06:00 Pagi</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Rendah</span>
                    <span className="w-2.5 h-2.5 rounded bg-slate-100 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded bg-indigo-200 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded bg-indigo-400 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded bg-violet-600 inline-block"></span>
                    <span className="text-[10px] text-slate-400">Puncak</span>
                  </div>
                  <span className="text-[11px] text-slate-400">22:00 Malam</span>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                  ⚡ Jam Paling Produktif: 09:00–12:00 & 14:00–16:00
                </span>
                <span className="text-slate-400">Berdasarkan data time log</span>
              </div>
            </div>

            {/* Habits & Goals Momentum */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Konsistensi Kebiasaan & Sasaran
                    </h2>
                    <p className="text-xs text-slate-500">
                      Pemantauan streak rutinitas dan kemajuan target sasaran
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/habits"
                      className="text-xs font-semibold text-slate-600 hover:text-indigo-600 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors"
                    >
                      Kebiasaan
                    </Link>
                    <Link
                      href="/goals"
                      className="text-xs font-semibold text-slate-600 hover:text-indigo-600 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors"
                    >
                      Sasaran
                    </Link>
                  </div>
                </div>

                {/* Top Habits Streak List */}
                <div className="space-y-3 mb-5">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Streak Kebiasaan Aktif
                  </div>
                  {habits.length > 0 ? (
                    habits.slice(0, 3).map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: habit.category_color || '#6366f1' }}
                          />
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {habit.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-slate-500">
                            {habit.checkin_count} check-in
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                            🔥 {habit.current_streak} Hari
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">Belum ada kebiasaan aktif</div>
                  )}
                </div>

                {/* Top Goals Progress Bars */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Kemajuan Sasaran Target
                  </div>
                  {goals.length > 0 ? (
                    goals.slice(0, 2).map((goal) => (
                      <div key={goal.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 truncate">
                            {goal.title}
                          </span>
                          <span className="font-bold text-indigo-600 font-mono">
                            {goal.progress_percent}%
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, goal.progress_percent)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>
                            {goal.current_value} / {goal.target_value} {goal.unit}
                          </span>
                          <span className="capitalize">{goal.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">Belum ada target sasaran aktif</div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Rata-rata kemajuan sasaran: <strong>{summary?.avg_goal_progress || 0}%</strong></span>
                <span className="text-indigo-600 font-semibold">Tepat Sasaran</span>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
