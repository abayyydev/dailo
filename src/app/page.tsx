'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { TaskModal } from '@/components/tasks/TaskModal';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Zap,
  Target,
  Flame,
  ArrowRight,
  Plus,
  Play,
  RotateCw,
  Sparkles,
  AlertTriangle,
  Check,
  ChevronRight,
  Loader2,
  CalendarDays,
  ListTodo,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface DashboardData {
  date: string;
  user: {
    name: string;
    greeting: string;
    quote: string;
  };
  kpi: {
    tasks: {
      total: number;
      completed: number;
      pending: number;
      due_today: number;
      overdue: number;
    };
    schedules: {
      total_items: number;
      total_minutes: number;
      total_hours_formatted: string;
      next_event: any | null;
    };
    focus: {
      total_focus_minutes: number;
      total_focus_hours_formatted: string;
      sessions_count: number;
    };
    habits: {
      total: number;
      completed_today: number;
      completion_rate: number;
      best_streak: number;
    };
  };
  today_agenda: any[];
  priority_tasks: any[];
  today_habits: any[];
  active_goals: any[];
}

export default function HomePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, openAuthModal } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const [togglingHabitId, setTogglingHabitId] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [dashRes, catRes] = await Promise.all([
        fetch(`${apiUrl}/api/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!dashRes.ok) {
        throw new Error(`Gagal memuat dashboard (${dashRes.status})`);
      }

      const dashJson = await dashRes.json();
      setData(dashJson.data);

      if (catRes.ok) {
        const catJson = await catRes.json();
        setCategories(catJson.categories || []);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Terjadi kesalahan saat memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  }, [token, apiUrl]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token, fetchDashboardData]);

  // Handle toggling task completion from dashboard
  const handleToggleTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token || togglingTaskId) return;
    setTogglingTaskId(taskId);

    try {
      const res = await fetch(`${apiUrl}/api/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Optimistic UI update
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            priority_tasks: prev.priority_tasks.filter((t) => t.id !== taskId),
            kpi: {
              ...prev.kpi,
              tasks: {
                ...prev.kpi.tasks,
                completed: prev.kpi.tasks.completed + 1,
                pending: Math.max(0, prev.kpi.tasks.pending - 1),
              },
            },
          };
        });
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    } finally {
      setTogglingTaskId(null);
    }
  };

  // Handle toggling habit checkin from dashboard
  const handleToggleHabit = async (habitId: string, currentCompleted: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token || togglingHabitId) return;
    setTogglingHabitId(habitId);

    try {
      const res = await fetch(`${apiUrl}/api/habits/${habitId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: !currentCompleted,
        }),
      });

      if (res.ok) {
        // Optimistic update
        setData((prev) => {
          if (!prev) return prev;
          const updatedHabits = prev.today_habits.map((h) => {
            if (h.id === habitId) {
              const newStatus = !currentCompleted;
              return {
                ...h,
                is_completed_today: newStatus ? 1 : 0,
                current_streak: newStatus ? h.current_streak + 1 : Math.max(0, h.current_streak - 1),
              };
            }
            return h;
          });
          const completedCount = updatedHabits.filter((h) => h.is_completed_today === 1).length;
          const totalHabits = updatedHabits.length;
          return {
            ...prev,
            today_habits: updatedHabits,
            kpi: {
              ...prev.kpi,
              habits: {
                ...prev.kpi.habits,
                completed_today: completedCount,
                completion_rate: totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0,
              },
            },
          };
        });
      }
    } catch (err) {
      console.error('Error toggling habit:', err);
    } finally {
      setTogglingHabitId(null);
    }
  };

  // Redirect to /login if user is not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 animate-pulse">
            d
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Memeriksa sesi akun...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 md:pb-0">
        <Header />

        <main className="p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
          {/* Executive Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 sm:p-7 md:p-8 shadow-lg">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-medium border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Produktivitas Aktif
                      </span>
                      <span className="text-xs text-indigo-200/80 font-mono">
                        {new Intl.DateTimeFormat('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }).format(new Date())}
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                      {data?.user?.greeting || `Selamat Datang, ${user?.name || 'Teman Produktif'}!`}
                    </h2>
                    <p className="text-slate-300 text-sm italic leading-relaxed">
                      &ldquo;{data?.user?.quote || 'Konsistensi dan fokus hari ini adalah kunci pencapaian masa depan.'}&rdquo;
                    </p>
                  </div>

                  {/* Quick Dashboard Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setIsTaskModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-slate-100 text-xs font-bold shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <Plus className="w-4 h-4 text-indigo-600" />
                      Tugas Baru
                    </button>
                    <Link
                      href="/focus"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold border border-indigo-400/30 backdrop-blur-md shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <Zap className="w-4 h-4 text-amber-300" />
                      Focus Mode
                    </Link>
                    <button
                      onClick={fetchDashboardData}
                      disabled={loading}
                      title="Perbarui data"
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                    >
                      <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Ambient glow decoration */}
                <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
              </div>

              {/* 4 Real KPI Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Tugas Hari Ini */}
                <Link
                  href="/tasks"
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tugas</span>
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ListTodo className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-slate-900">
                      {data?.kpi?.tasks?.completed ?? 0}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / {data?.kpi?.tasks?.total ?? 0} selesai
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 my-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          data?.kpi?.tasks?.total
                            ? Math.round((data.kpi.tasks.completed / data.kpi.tasks.total) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>{data?.kpi?.tasks?.pending ?? 0} menunggu</span>
                    {(data?.kpi?.tasks?.overdue ?? 0) > 0 && (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {data?.kpi?.tasks?.overdue} terlambat
                      </span>
                    )}
                  </div>
                </Link>

                {/* 2. Jadwal & Agenda */}
                <Link
                  href="/schedule"
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jadwal Hari Ini</span>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-slate-900">
                      {data?.kpi?.schedules?.total_hours_formatted ?? '0.0'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">jam teralokasi</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 my-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-3/4" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>{data?.kpi?.schedules?.total_items ?? 0} blok kegiatan</span>
                    <span className="text-emerald-700 font-medium">Lihat timeline &rarr;</span>
                  </div>
                </Link>

                {/* 3. Waktu Terfokus */}
                <Link
                  href="/focus"
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fokus Produktif</span>
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-slate-900">
                      {data?.kpi?.focus?.total_focus_minutes ?? 0}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">menit hari ini</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 my-2 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full w-2/3" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>{data?.kpi?.focus?.sessions_count ?? 0} sesi selesai</span>
                    <span className="text-amber-700 font-medium">Pomodoro &rarr;</span>
                  </div>
                </Link>

                {/* 4. Kebiasaan (Habits) */}
                <Link
                  href="/habits"
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-rose-300 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kebiasaan</span>
                    <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-all">
                      <Flame className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-slate-900">
                      {data?.kpi?.habits?.completion_rate ?? 0}%
                    </span>
                    <span className="text-xs text-slate-400 font-medium">kepatuhan</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 my-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${data?.kpi?.habits?.completion_rate ?? 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>
                      {data?.kpi?.habits?.completed_today ?? 0} / {data?.kpi?.habits?.total ?? 0} cek
                    </span>
                    <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                      <Flame className="w-3 h-3" />
                      {data?.kpi?.habits?.best_streak ?? 0} hari
                    </span>
                  </div>
                </Link>
              </div>

              {/* Main Content Two-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2 Cols wide on desktop) */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Today's Agenda & Timeline Widget */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Agenda Hari Ini</h3>
                          <p className="text-xs text-slate-500">Jadwal berbasis blok waktu hari ini</p>
                        </div>
                      </div>
                      <Link
                        href="/schedule"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 group"
                      >
                        Buka Timeline
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>

                    {data?.today_agenda && data.today_agenda.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {data.today_agenda.map((item) => (
                          <div
                            key={item.id}
                            className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-3 rounded-xl transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-2.5 h-10 rounded-full"
                                style={{ backgroundColor: item.category_color || '#6366F1' }}
                              />
                              <div>
                                <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                  <span className="font-mono text-[11px] font-medium text-indigo-600">
                                    {item.start_time?.slice(0, 5)} – {item.end_time?.slice(0, 5)}
                                  </span>
                                  {item.category_name && (
                                    <>
                                      <span>•</span>
                                      <span>{item.category_name}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                                item.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : item.status === 'ongoing'
                                  ? 'bg-amber-50 text-amber-700 animate-pulse'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.status === 'completed'
                                ? 'Selesai'
                                : item.status === 'ongoing'
                                ? 'Sedang Berjalan'
                                : 'Terencana'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-700">Belum ada blok jadwal hari ini</p>
                          <p className="text-xs text-slate-400">Rencanakan agenda hari Anda untuk alokasi waktu optimal</p>
                        </div>
                        <Link
                          href="/schedule"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Buat Jadwal Sekarang
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Priority & Due Tasks Widget */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                          <Target className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Tugas Prioritas &amp; Jatuh Tempo</h3>
                          <p className="text-xs text-slate-500">Centang langsung untuk menyelesaikan tugas</p>
                        </div>
                      </div>
                      <Link
                        href="/tasks"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 group"
                      >
                        Semua Tugas ({data?.kpi?.tasks?.pending ?? 0})
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>

                    {data?.priority_tasks && data.priority_tasks.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {data.priority_tasks.map((task) => (
                          <div
                            key={task.id}
                            className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-3 rounded-xl transition-all group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={(e) => handleToggleTask(task.id, e)}
                                disabled={togglingTaskId === task.id}
                                className="text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                              >
                                {togglingTaskId === task.id ? (
                                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{task.title}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                                  {task.category_name && (
                                    <span
                                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium"
                                      style={{
                                        backgroundColor: `${task.category_color}15` || '#EEF2FF',
                                        color: task.category_color || '#4F46E5',
                                      }}
                                    >
                                      {task.category_name}
                                    </span>
                                  )}
                                  {task.due_date && (
                                    <span className="text-[11px] text-slate-400">
                                      Batas: {task.due_date}
                                    </span>
                                  )}
                                  {task.subtask_count > 0 && (
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {task.completed_subtask_count}/{task.subtask_count} subtask
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                                task.priority === 'urgent'
                                  ? 'bg-rose-100 text-rose-700'
                                  : task.priority === 'high'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center space-y-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">Semua prioritas beres!</p>
                        <p className="text-xs text-slate-400">Tidak ada tugas mendesak yang tertunda saat ini.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column (1 Col on desktop) */}
                <div className="space-y-8">
                  {/* Daily Habits Checklist Widget */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                          <Flame className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Kebiasaan Hari Ini</h3>
                          <p className="text-xs text-slate-500">Check-in harian langsung</p>
                        </div>
                      </div>
                      <Link
                        href="/habits"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 group"
                      >
                        Kelola
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>

                    {data?.today_habits && data.today_habits.length > 0 ? (
                      <div className="space-y-2.5">
                        {data.today_habits.map((habit) => {
                          const isCompleted = habit.is_completed_today === 1;
                          return (
                            <div
                              key={habit.id}
                              onClick={(e) => handleToggleHabit(habit.id, isCompleted, e)}
                              className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                                isCompleted
                                  ? 'bg-emerald-50/60 border-emerald-200 text-slate-900'
                                  : 'bg-slate-50/60 border-slate-200 hover:border-indigo-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                    isCompleted
                                      ? 'bg-emerald-600 text-white'
                                      : 'border border-slate-300 bg-white text-transparent hover:border-indigo-400'
                                  }`}
                                >
                                  {togglingHabitId === habit.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  )}
                                </div>
                                <div>
                                  <p
                                    className={`text-xs font-semibold ${
                                      isCompleted ? 'line-through text-slate-500' : 'text-slate-800'
                                    }`}
                                  >
                                    {habit.title}
                                  </p>
                                  <span className="text-[10px] text-slate-400 capitalize">
                                    {habit.frequency_type || 'Setiap Hari'}
                                  </span>
                                </div>
                              </div>

                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 px-2 py-0.5 rounded-full bg-amber-50">
                                <Flame className="w-3 h-3" />
                                {habit.current_streak || 0}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-6 text-center space-y-2">
                        <p className="text-xs text-slate-400">Belum ada kebiasaan yang dibuat</p>
                        <Link
                          href="/habits"
                          className="inline-flex text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          + Tambah Kebiasaan Pertama
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Active Goals Widget */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                          <Target className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Sasaran &amp; Target</h3>
                          <p className="text-xs text-slate-500">Progres capaian jangka panjang</p>
                        </div>
                      </div>
                      <Link
                        href="/goals"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 group"
                      >
                        Detail
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>

                    {data?.active_goals && data.active_goals.length > 0 ? (
                      <div className="space-y-3.5">
                        {data.active_goals.map((goal) => (
                          <div key={goal.id} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800">{goal.title}</span>
                              <span className="font-bold text-indigo-600">{goal.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, goal.progress || 0))}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>
                                {goal.current_value || 0} / {goal.target_value} {goal.unit}
                              </span>
                              {goal.deadline && <span>Batas: {goal.deadline}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center space-y-2">
                        <p className="text-xs text-slate-400">Belum ada sasaran aktif</p>
                        <Link
                          href="/goals"
                          className="inline-flex text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          + Tetapkan Target Baru
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Focus Mode Fast Launcher Widget */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                        <Zap className="w-5 h-5 text-white" />
                      </span>
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-black/20">
                        Web Audio Synth
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">Butuh Konsentrasi Penuh?</h4>
                    <p className="text-xs text-amber-100 leading-relaxed">
                      Aktifkan ruang kerja imersif dengan pemutar audio ambient lokal (Hujan, White Noise, Deep Brown) dan Stopwatch presisi.
                    </p>
                    <Link
                      href="/focus"
                      className="w-full py-2.5 rounded-xl bg-white text-amber-700 hover:bg-amber-50 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Buka Ruang Fokus Zen
                    </Link>
                  </div>
                </div>
              </div>
        </main>
        <Footer />
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskSaved={() => {
          setIsTaskModalOpen(false);
          fetchDashboardData();
        }}
        categories={categories}
      />
    </div>
  );
}
