'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useTracking } from '@/context/TrackingContext';
import { ScheduleModal } from '@/components/schedule/ScheduleModal';
import {
  Clock,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Inbox,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  ListFilter,
  Sparkles,
  Loader2,
  Tag,
  ArrowRight,
  Check,
  Flag,
  ArrowUp,
  ArrowDown,
  Play,
  Repeat,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  notes?: string | null;
  task_id?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  category_color?: string | null;
  category_icon?: string | null;
  schedule_date: string;
  start_time: string;
  end_time: string;
  status: 'planned' | 'ongoing' | 'completed' | 'skipped' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recurrence_id?: string | null;
  recurrence_rule?: string | null;
  has_conflict?: boolean;
  conflicting_with?: string[];
  linked_task_title?: string | null;
}

interface UnscheduledTask {
  id: string;
  title: string;
  priority: string;
  due_date?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  category_color?: string | null;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 64; // px per hour (approx 1.066 px/minute)

export default function SchedulePage() {
  const { token, isAuthenticated, isLoading: authLoading, openAuthModal } = useAuth();
  const { startTimer } = useTracking();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [viewMode, setViewMode] = useState<'timeline' | 'agenda'>('timeline');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [unscheduledTasks, setUnscheduledTasks] = useState<UnscheduledTask[]>([]);
  const [showInbox, setShowInbox] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<ScheduleItem | null>(null);
  const [initialStartTime, setInitialStartTime] = useState<string>('09:00');

  // Live Current Time
  const [currentMinutes, setCurrentMinutes] = useState<number>(0);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Calculate live current time in minutes from midnight
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll timeline to 07:00 on mount
  useEffect(() => {
    if (timelineScrollRef.current) {
      // 7 hours * 64px = ~448px
      timelineScrollRef.current.scrollTop = 448;
    }
  }, [viewMode]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, [apiUrl, token]);

  // Fetch Schedules for Selected Date
  const fetchSchedules = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/schedules?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token, selectedDate]);

  // Fetch Unscheduled Tasks
  const fetchUnscheduled = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/schedules/unscheduled`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnscheduledTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to fetch unscheduled tasks:', err);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchSchedules();
      fetchUnscheduled();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, selectedDate, fetchCategories, fetchSchedules, fetchUnscheduled]);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  // Convert time "HH:mm:ss" to minutes
  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Shift block by +/- 15 minutes
  const handleShiftTime = async (schedule: ScheduleItem, deltaMinutes: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

    const startM = timeToMinutes(schedule.start_time) + deltaMinutes;
    const endM = timeToMinutes(schedule.end_time) + deltaMinutes;

    if (startM < 0 || endM > 1440) return;

    const newStart = `${String(Math.floor(startM / 60)).padStart(2, '0')}:${String(startM % 60).padStart(2, '0')}:00`;
    const newEnd = `${String(Math.floor(endM / 60)).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}:00`;

    // Optimistic update
    setSchedules((prev) =>
      prev.map((s) => (s.id === schedule.id ? { ...s, start_time: newStart, end_time: newEnd } : s))
    );

    try {
      await fetch(`${apiUrl}/api/schedules/${schedule.id}/time`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ start_time: newStart, end_time: newEnd }),
      });
      fetchSchedules();
    } catch {
      fetchSchedules();
    }
  };

  // Click on empty hour row to schedule
  const handleSlotClick = (hour: number) => {
    const start = `${String(hour).padStart(2, '0')}:00`;
    setInitialStartTime(start);
    setScheduleToEdit(null);
    setIsModalOpen(true);
  };

  // Quick schedule an unscheduled task
  const handleScheduleTask = (task: UnscheduledTask) => {
    setScheduleToEdit(null);
    setInitialStartTime('10:00');
    setIsModalOpen(true);
  };

  // Check if selected date is today
  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  // Formatted date string
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(selectedDate));

  const hasAnyConflict = schedules.some((s) => s.has_conflict);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 md:pb-0">
        <Header />

        <main className="p-6 max-w-6xl w-full mx-auto space-y-5">
          {/* Top Control Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            {/* Date Navigator */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Hari Kemarin"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isToday
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={handleNextDay}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Hari Esok"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 ml-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-700 focus:outline-hidden"
                />
                <span className="text-sm font-bold text-slate-900 capitalize hidden sm:inline">
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* View Switcher & Action Buttons */}
            <div className="flex items-center gap-2.5">
              {/* View switcher */}
              <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    viewMode === 'timeline'
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Day Timeline
                </button>
                <button
                  onClick={() => setViewMode('agenda')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    viewMode === 'agenda'
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Agenda View
                </button>
              </div>

              {/* Toggle Inbox Button */}
              <button
                onClick={() => setShowInbox(!showInbox)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                  showInbox
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Inbox ({unscheduledTasks.length})</span>
              </button>

              {/* Add Activity Button */}
              <button
                onClick={() => {
                  setScheduleToEdit(null);
                  setInitialStartTime('09:00');
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-200 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Jadwal</span>
              </button>
            </div>
          </div>

          {/* Conflict Alert Banner if any conflict exists */}
          {hasAnyConflict && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Peringatan Konflik Waktu:</strong> Ditemukan jadwal aktivitas yang tumpang
                  tindih pada timeline hari ini.
                </span>
              </div>
              <span className="text-[11px] font-medium text-amber-700 underline">
                Periksa blok bergaris merah di bawah
              </span>
            </div>
          )}

          {!isAuthenticated && !authLoading ? (
            <div className="p-8 rounded-3xl bg-indigo-900 text-white text-center space-y-3 shadow-xl">
              <Clock className="w-10 h-10 text-indigo-300 mx-auto" />
              <h3 className="text-xl font-bold">Masuk untuk Mengakses Schedule Timeline</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Kelola jadwal blok waktu dan deteksi konflik secara visual dengan masuk menggunakan akun Anda.
              </p>
              <Link
                href="/login"
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 text-xs font-semibold shadow-md hover:bg-indigo-50 transition-all cursor-pointer"
              >
                Sign In / Demo Login
              </Link>
            </div>
          ) : (
            <div className="flex gap-6 items-start">
              {/* Main Timeline / Agenda Area */}
              <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {viewMode === 'timeline' ? (
                  /* 24-Hour Vertical Day Timeline */
                  <div
                    ref={timelineScrollRef}
                    className="relative overflow-y-auto max-h-[720px] select-none"
                  >
                    <div className="relative w-full" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
                      {/* Live Current-Time Indicator Line */}
                      {isToday && currentMinutes >= 0 && currentMinutes <= 1440 && (
                        <div
                          className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                          style={{ top: `${(currentMinutes / 60) * HOUR_HEIGHT}px` }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm ml-14 -mr-1" />
                          <div className="flex-1 h-0.5 bg-rose-500 shadow-xs" />
                          <span className="text-[10px] font-bold text-rose-600 bg-white px-1.5 py-0.5 rounded border border-rose-200 mr-4 shadow-2xs">
                            NOW
                          </span>
                        </div>
                      )}

                      {/* Hour Grid Rows */}
                      {HOURS.map((hour) => {
                        const timeLabel = `${String(hour).padStart(2, '0')}:00`;
                        return (
                          <div
                            key={hour}
                            onClick={() => handleSlotClick(hour)}
                            className="absolute left-0 right-0 border-b border-slate-100 flex items-start group hover:bg-slate-50/70 transition-colors cursor-pointer"
                            style={{
                              top: `${hour * HOUR_HEIGHT}px`,
                              height: `${HOUR_HEIGHT}px`,
                            }}
                          >
                            {/* Time Label */}
                            <div className="w-16 text-right pr-3 -mt-2.5 text-xs font-medium text-slate-400 font-mono select-none">
                              {timeLabel}
                            </div>
                            {/* Horizontal slot line */}
                            <div className="flex-1 border-t border-slate-100/80 h-full relative">
                              {/* Half-hour dashed line */}
                              <div className="absolute left-0 right-0 top-1/2 border-b border-dashed border-slate-100 pointer-events-none" />
                            </div>
                          </div>
                        );
                      })}

                      {/* Schedule Activity Blocks Overlay */}
                      <div className="absolute left-16 right-4 top-0 bottom-0 pointer-events-none">
                        {schedules.map((item) => {
                          const startM = timeToMinutes(item.start_time);
                          const endM = timeToMinutes(item.end_time);
                          const durationM = Math.max(15, endM - startM);

                          const topPx = (startM / 60) * HOUR_HEIGHT;
                          const heightPx = Math.max(32, (durationM / 60) * HOUR_HEIGHT);

                          const color = item.category_color || '#4F46E5';

                          return (
                            <div
                              key={item.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setScheduleToEdit(item);
                                setIsModalOpen(true);
                              }}
                              className={`absolute left-2 right-2 rounded-xl p-2.5 pointer-events-auto shadow-xs border transition-all hover:shadow-md cursor-pointer flex flex-col justify-between overflow-hidden group ${
                                item.has_conflict
                                  ? 'border-amber-400 bg-amber-50/90 ring-1 ring-amber-400'
                                  : 'border-slate-200/80'
                              }`}
                              style={{
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                                backgroundColor: item.has_conflict
                                  ? undefined
                                  : `${color}12`,
                                borderLeftWidth: '4px',
                                borderLeftColor: item.has_conflict ? '#F59E0B' : color,
                              }}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span
                                      className={`text-xs font-semibold leading-tight truncate ${
                                        item.status === 'completed'
                                          ? 'line-through text-slate-400'
                                          : 'text-slate-900'
                                      }`}
                                    >
                                      {item.title}
                                    </span>
                                    {item.recurrence_id && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700 shrink-0" title="Jadwal Rutin / Berulang">
                                        <Repeat className="w-2.5 h-2.5" />
                                        Rutin
                                      </span>
                                    )}
                                    {item.has_conflict && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 text-amber-900 shrink-0">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        Konflik
                                      </span>
                                    )}
                                  </div>

                                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                    {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                                  </span>
                                </div>

                                {heightPx > 48 && (
                                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                                    {item.category_name && (
                                      <span className="inline-flex items-center gap-1 font-medium">
                                        <span
                                          className="w-1.5 h-1.5 rounded-full"
                                          style={{ backgroundColor: color }}
                                        />
                                        <span>{item.category_name}</span>
                                      </span>
                                    )}
                                    <span className="uppercase text-[9px] font-semibold px-1 rounded bg-slate-100 text-slate-600">
                                      {item.priority}
                                    </span>
                                    {item.notes && (
                                      <span className="truncate max-w-xs text-slate-400">
                                        • {item.notes}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Quick Move +/- 15 min and Track Timer on hover */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 pt-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startTimer({
                                      title: item.title,
                                      schedule_id: item.id,
                                      category_id: item.category_id,
                                    });
                                  }}
                                  className="p-1 px-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold flex items-center gap-1 shadow-2xs"
                                  title="Mulai stopwatch untuk jadwal ini"
                                >
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                  <span className="text-[9px]">Lacak</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleShiftTime(item, -15, e)}
                                  className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-mono"
                                  title="Geser 15 menit ke atas"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleShiftTime(item, 15, e)}
                                  className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-mono"
                                  title="Geser 15 menit ke bawah"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Agenda View (Chronological List) */
                  <div className="p-6 divide-y divide-slate-100">
                    {schedules.length === 0 ? (
                      <div className="py-16 text-center text-slate-400 space-y-2">
                        <CalendarDays className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs">Tidak ada jadwal aktivitas untuk hari ini.</p>
                      </div>
                    ) : (
                      schedules.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setScheduleToEdit(item);
                            setIsModalOpen(true);
                          }}
                          className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-3 rounded-xl transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-24 text-xs font-mono font-medium text-slate-600">
                              {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900">
                                  {item.title}
                                </span>
                                {item.recurrence_id && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700 shrink-0" title="Jadwal Rutin / Berulang">
                                    <Repeat className="w-2.5 h-2.5" />
                                    Rutin
                                  </span>
                                )}
                                {item.has_conflict && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                                    <AlertTriangle className="w-2.5 h-2.5" /> Overlap
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                {item.category_name && (
                                  <span
                                    className="inline-flex items-center gap-1 font-medium"
                                    style={{ color: item.category_color || '#4F46E5' }}
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: item.category_color || '#4F46E5' }}
                                    />
                                    {item.category_name}
                                  </span>
                                )}
                                <span>• {item.priority.toUpperCase()}</span>
                              </div>
                            </div>
                          </div>

                          <span className="text-xs font-medium capitalize text-slate-500 px-2.5 py-1 rounded-lg bg-slate-100">
                            {item.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Unscheduled Tasks Inbox Drawer */}
              {showInbox && (
                <div className="w-80 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs shrink-0 space-y-4 animate-in slide-in-from-right-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-indigo-600" />
                      <h3 className="font-semibold text-slate-900 text-sm">Unscheduled Tasks</h3>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {unscheduledTasks.length}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Task berikut belum memiliki jam terjadwal. Klik tombol Jadwalkan untuk menempatkannya pada timeline.
                  </p>

                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                    {unscheduledTasks.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">
                        Semua task sudah terjadwal!
                      </p>
                    ) : (
                      unscheduledTasks.map((t) => (
                        <div
                          key={t.id}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-medium text-slate-800 leading-snug">
                              {t.title}
                            </span>
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                              {t.priority}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                            <span>{t.category_name || 'Uncategorized'}</span>
                            <button
                              type="button"
                              onClick={() => handleScheduleTask(t)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>Jadwalkan</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Schedule Modal */}
          <ScheduleModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onScheduleSaved={() => {
              fetchSchedules();
              fetchUnscheduled();
            }}
            scheduleToEdit={scheduleToEdit}
            categories={categories}
            unscheduledTasks={unscheduledTasks}
            initialDate={selectedDate}
            initialStartTime={initialStartTime}
          />
        </main>
        <Footer />
      </div>
    </div>
  );
}
