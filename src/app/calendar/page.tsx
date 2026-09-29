'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckSquare,
  ArrowRight,
  X,
  Sparkles,
  Loader2,
  AlertTriangle,
  CalendarDays,
  CalendarRange,
  Repeat,
} from 'lucide-react';

interface DaySummary {
  schedules: any[];
  tasks: any[];
  categories: { name: string; color: string }[];
  total_events: number;
}

const WEEKDAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const WEEKDAYS_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 56; // px per hour in week view

export default function CalendarPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading, openAuthModal } = useAuth();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [monthData, setMonthData] = useState<Record<string, DaySummary>>({});
  const [weekSchedules, setWeekSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Day Quick Drawer
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);

  const weekTimelineRef = useRef<HTMLDivElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Format date helper: YYYY-MM-DD
  const formatDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayKey = formatDateKey(new Date());

  // Calculate Monday of the current week
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    return date;
  };

  const currentMonday = getMonday(currentDate);

  // Generate 7 days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + i);
    return d;
  });

  const weekStartStr = formatDateKey(weekDays[0]);
  const weekEndStr = formatDateKey(weekDays[6]);

  // Fetch Month Summary
  const fetchMonthSummary = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/calendar/month-summary?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMonthData(data.days || {});
      }
    } catch (err) {
      console.error('Failed to fetch month summary:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token, year, month]);

  // Fetch Week View Data
  const fetchWeekData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/api/calendar/week-view?start_date=${weekStartStr}&end_date=${weekEndStr}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setWeekSchedules(data.schedules || []);
      }
    } catch (err) {
      console.error('Failed to fetch week view:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token, weekStartStr, weekEndStr]);

  useEffect(() => {
    if (isAuthenticated) {
      if (viewMode === 'month') {
        fetchMonthSummary();
      } else {
        fetchWeekData();
      }
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, viewMode, fetchMonthSummary, fetchWeekData]);

  // Auto-scroll week view to 07:00
  useEffect(() => {
    if (viewMode === 'week' && weekTimelineRef.current) {
      weekTimelineRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, [viewMode]);

  // Navigation Handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() - 1);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() + 1);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Convert time "HH:mm:ss" to minutes
  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Build Calendar Grid Days (Month View)
  const buildMonthGrid = () => {
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);

    // Monday-based index: Mon=0, Tue=1, ..., Sun=6
    let startingDay = firstDayOfMonth.getDay() - 1;
    if (startingDay === -1) startingDay = 6;

    const daysInMonth = lastDayOfMonth.getDate();

    // Trailing days from previous month
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    const prevDays = [];
    for (let i = startingDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 2, prevMonthLastDay - i);
      prevDays.push({ date: d, isCurrentMonth: false, dateKey: formatDateKey(d) });
    }

    // Days in current month
    const currentDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month - 1, i);
      currentDays.push({ date: d, isCurrentMonth: true, dateKey: formatDateKey(d) });
    }

    // Trailing days from next month to complete 35 or 42 grid cells
    const totalFilled = prevDays.length + currentDays.length;
    const remainingDays = totalFilled > 35 ? 42 - totalFilled : 35 - totalFilled;
    const nextDays = [];
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month, i);
      nextDays.push({ date: d, isCurrentMonth: false, dateKey: formatDateKey(d) });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  };

  const monthGridDays = buildMonthGrid();

  // Jump directly to schedule for a day
  const handleJumpToSchedule = (dateStr: string) => {
    router.push(`/schedule`);
  };

  // Selected Day summary data for quick drawer
  const selectedDayData = selectedDayString ? monthData[selectedDayString] : null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 md:pb-0">
        <Header />

        <main className="p-3.5 sm:p-6 max-w-6xl w-full mx-auto space-y-5">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            {/* Period Title & Navigator */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Periode Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Hari Ini
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                title="Periode Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <h2 className="text-base font-bold text-slate-900 ml-2">
                {viewMode === 'month'
                  ? new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(
                      currentDate
                    )
                  : `${weekDays[0].getDate()} - ${new Intl.DateTimeFormat('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }).format(weekDays[6])}`}
              </h2>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => setViewMode('month')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    viewMode === 'month'
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Bulan (Month)</span>
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    viewMode === 'week'
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarRange className="w-3.5 h-3.5" />
                  <span>Minggu (Week)</span>
                </button>
              </div>
            </div>
          </div>

          {!isAuthenticated && !authLoading ? (
            <div className="p-8 rounded-3xl bg-indigo-900 text-white text-center space-y-3 shadow-xl">
              <CalendarIcon className="w-10 h-10 text-indigo-300 mx-auto" />
              <h3 className="text-xl font-bold">Masuk untuk Melihat Kalender Aktivitas</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Lihat ringkasan jadwal bulanan dan mingguan dengan sinkronisasi langsung ke to-do dan timeline.
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
              {/* Main Calendar View Area */}
              <div className="flex-1 min-w-0 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                {viewMode === 'month' ? (
                  /* MONTH VIEW (7-Column Grid) */
                  <div className="p-4 sm:p-6">
                    {/* Weekday Labels Header */}
                    <div className="grid grid-cols-7 mb-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {WEEKDAYS.map((day) => (
                        <div key={day} className="py-2">
                          <span className="hidden sm:inline">{day}</span>
                          <span className="sm:hidden">{day.slice(0, 3)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Month Grid Cells */}
                    <div className="grid grid-cols-7 border-t border-l border-slate-100 bg-slate-50/40">
                      {monthGridDays.map((cell, idx) => {
                        const isCurrentDay = cell.dateKey === todayKey;
                        const daySummary = monthData[cell.dateKey];
                        const hasEvents = daySummary && daySummary.total_events > 0;
                        const isSelected = cell.dateKey === selectedDayString;

                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedDayString(cell.dateKey)}
                            className={`min-h-[105px] sm:min-h-[115px] p-2 border-r border-b border-slate-100 flex flex-col justify-between transition-all cursor-pointer ${
                              cell.isCurrentMonth
                                ? 'bg-white hover:bg-slate-50/80'
                                : 'bg-slate-50/50 opacity-40 hover:opacity-75'
                            } ${
                              isSelected
                                ? 'ring-2 ring-indigo-600 ring-inset bg-indigo-50/20'
                                : ''
                            }`}
                          >
                            {/* Day Header & Count */}
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                                  isCurrentDay
                                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                                    : 'text-slate-700'
                                }`}
                              >
                                {cell.date.getDate()}
                              </span>

                              {hasEvents && (
                                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  {daySummary.total_events}
                                </span>
                              )}
                            </div>

                            {/* Event Previews & Category Dots */}
                            <div className="space-y-1 my-1 overflow-hidden">
                              {daySummary?.schedules?.slice(0, 2).map((s: any) => (
                                <div
                                  key={s.id}
                                  className="text-[10px] font-medium truncate px-1.5 py-0.5 rounded flex items-center gap-1 leading-tight"
                                  style={{
                                    backgroundColor: `${s.category_color || '#4F46E5'}15`,
                                    color: s.category_color || '#4F46E5',
                                  }}
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: s.category_color || '#4F46E5' }}
                                  />
                                  <span className="truncate">{s.title}</span>
                                </div>
                              ))}

                              {/* Category Dots Bar */}
                              {daySummary?.categories && daySummary.categories.length > 0 && (
                                <div className="flex items-center gap-1 pt-0.5">
                                  {daySummary.categories.slice(0, 4).map((c, i) => (
                                    <span
                                      key={i}
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: c.color }}
                                      title={c.name}
                                    />
                                  ))}
                                  {daySummary.total_events > 2 && (
                                    <span className="text-[9px] text-slate-400 font-mono">
                                      +{daySummary.total_events - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* WEEK VIEW (7-Day Multi-Column Timeline) */
                  <div className="flex flex-col max-h-[720px]">
                    {/* 7-Day Column Header */}
                    <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
                      <div className="p-3 text-right text-xs font-mono text-slate-400 pr-4">
                        WAKTU
                      </div>
                      {weekDays.map((d, i) => {
                        const k = formatDateKey(d);
                        const isCur = k === todayKey;
                        return (
                          <div
                            key={i}
                            className={`p-3 text-center border-l border-slate-100 ${
                              isCur ? 'bg-indigo-50/60' : ''
                            }`}
                          >
                            <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                              {WEEKDAYS_SHORT[i]}
                            </span>
                            <span
                              className={`text-sm font-bold inline-block px-2 py-0.5 rounded-lg mt-0.5 ${
                                isCur
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'text-slate-800'
                              }`}
                            >
                              {d.getDate()}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Timeline Scroll Area */}
                    <div
                      ref={weekTimelineRef}
                      className="overflow-y-auto relative select-none"
                      style={{ height: '620px' }}
                    >
                      <div
                        className="grid grid-cols-8 relative"
                        style={{ height: `${24 * HOUR_HEIGHT}px` }}
                      >
                        {/* Hours Column on the left */}
                        <div className="border-r border-slate-100">
                          {HOURS.map((h) => (
                            <div
                              key={h}
                              className="text-right pr-3 -mt-2.5 text-xs font-mono text-slate-400 border-b border-slate-100 select-none"
                              style={{ height: `${HOUR_HEIGHT}px` }}
                            >
                              {String(h).padStart(2, '0')}:00
                            </div>
                          ))}
                        </div>

                        {/* 7 Day Columns */}
                        {weekDays.map((dayDate, dayIdx) => {
                          const dateKey = formatDateKey(dayDate);
                          const dayEvents = weekSchedules.filter(
                            (s) => s.schedule_date === dateKey
                          );

                          return (
                            <div
                              key={dayIdx}
                              className="relative border-r border-slate-100"
                            >
                              {/* Background hour slot lines */}
                              {HOURS.map((h) => (
                                <div
                                  key={h}
                                  className="border-b border-slate-100/70 hover:bg-slate-50/50 transition-colors"
                                  style={{ height: `${HOUR_HEIGHT}px` }}
                                />
                              ))}

                              {/* Day Events positioned vertically */}
                              {dayEvents.map((event) => {
                                const startM = timeToMinutes(event.start_time);
                                const endM = timeToMinutes(event.end_time);
                                const durationM = Math.max(20, endM - startM);

                                const topPx = (startM / 60) * HOUR_HEIGHT;
                                const heightPx = Math.max(26, (durationM / 60) * HOUR_HEIGHT);
                                const color = event.category_color || '#4F46E5';

                                return (
                                  <div
                                    key={event.id}
                                    onClick={() => setSelectedDayString(dateKey)}
                                    className={`absolute left-1 right-1 rounded-lg p-1.5 shadow-2xs border text-left overflow-hidden transition-all hover:shadow-xs cursor-pointer ${
                                      event.has_conflict
                                        ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-300'
                                        : 'border-slate-200/90'
                                    }`}
                                    style={{
                                      top: `${topPx}px`,
                                      height: `${heightPx}px`,
                                      backgroundColor: event.has_conflict
                                        ? undefined
                                        : `${color}18`,
                                      borderLeftWidth: '3px',
                                      borderLeftColor: event.has_conflict ? '#F59E0B' : color,
                                    }}
                                  >
                                    <div className="text-[11px] font-semibold truncate leading-tight text-slate-900">
                                      {event.title}
                                    </div>
                                    {heightPx > 40 && (
                                      <div className="text-[9px] font-mono text-slate-500 mt-0.5">
                                        {event.start_time.slice(0, 5)} -{' '}
                                        {event.end_time.slice(0, 5)}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Day Quick Drawer (Selected Date Agenda) */}
              {selectedDayString && (
                <div className="w-80 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs shrink-0 space-y-4 animate-in slide-in-from-right-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                        Agenda Harian
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {new Intl.DateTimeFormat('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }).format(new Date(selectedDayString))}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedDayString(null)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Jump to Schedule Timeline CTA */}
                  <button
                    onClick={() => handleJumpToSchedule(selectedDayString)}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Buka di Schedule Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Scheduled Items List */}
                  <div className="space-y-3 max-h-[480px] overflow-y-auto">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        Jadwal Aktivitas ({selectedDayData?.schedules?.length || 0})
                      </h4>

                      {!selectedDayData || selectedDayData.schedules.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3 bg-slate-50 rounded-xl text-center">
                          Tidak ada jadwal waktu untuk tanggal ini.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selectedDayData.schedules.map((s: any) => (
                            <div
                              key={s.id}
                              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-xs font-semibold text-slate-900 truncate">
                                    {s.title}
                                  </span>
                                  {s.recurrence_id && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700 shrink-0" title="Jadwal Rutin / Berulang">
                                      <Repeat className="w-2.5 h-2.5" />
                                      Rutin
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                  {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px]">
                                {s.category_name && (
                                  <span
                                    className="inline-flex items-center gap-1 font-medium"
                                    style={{ color: s.category_color || '#4F46E5' }}
                                  >
                                    <span
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: s.category_color || '#4F46E5' }}
                                    />
                                    {s.category_name}
                                  </span>
                                )}
                                <span className="uppercase text-slate-400">
                                  • {s.priority}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tasks Due List */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                        Task Jatuh Tempo ({selectedDayData?.tasks?.length || 0})
                      </h4>

                      {!selectedDayData || selectedDayData.tasks.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3 bg-slate-50 rounded-xl text-center">
                          Tidak ada task deadline untuk tanggal ini.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selectedDayData.tasks.map((t: any) => (
                            <div
                              key={t.id}
                              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                            >
                              <span className="text-xs font-medium text-slate-800">
                                {t.title}
                              </span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                                {t.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
