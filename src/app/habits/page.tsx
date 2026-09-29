'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { HabitModal } from '@/components/habits/HabitModal';
import {
  Flame,
  Plus,
  Check,
  Calendar as CalendarIcon,
  Trash2,
  Edit2,
  Sunrise,
  Sun,
  Moon,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Habit {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  category_name?: string | null;
  category_color?: string | null;
  frequency_type: string;
  repeat_days: string;
  time_of_day: string;
  current_streak: number;
  longest_streak: number;
  is_completed_today: boolean;
  weekly_progress: { date: string; completed: boolean }[];
}

export default function HabitsPage() {
  const { token, isAuthenticated } = useAuth();
  const { playChime } = useNotifications();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState({
    total_habits: 0,
    completed_today: 0,
    highest_streak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchHabits = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/habits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setHabits(data.habits || []);
      setSummary(data.summary || { total_habits: 0, completed_today: 0, highest_streak: 0 });
    } catch (err) {
      console.error('Failed to fetch habits:', err);
    }
  }, [token, apiUrl]);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, [token, apiUrl]);

  useEffect(() => {
    if (isAuthenticated && token) {
      Promise.all([fetchHabits(), fetchCategories()]).then(() => {
        setLoading(false);
      });
    }
  }, [isAuthenticated, token, fetchHabits, fetchCategories]);

  const handleToggleCheckIn = async (habitId: string) => {
    if (!token) return;

    // Optimistic UI update
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const nextState = !h.is_completed_today;
          return {
            ...h,
            is_completed_today: nextState,
            current_streak: nextState ? h.current_streak + 1 : Math.max(0, h.current_streak - 1),
          };
        }
        return h;
      })
    );

    try {
      const res = await fetch(`${apiUrl}/api/habits/${habitId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.is_completed) {
          playChime();
        }
        fetchHabits();
      } else {
        fetchHabits();
      }
    } catch (err) {
      console.error('Failed to toggle check-in:', err);
      fetchHabits();
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!token) return;
    if (!confirm('Hapus kebiasaan ini beserta seluruh riwayatnya?')) return;

    try {
      await fetch(`${apiUrl}/api/habits/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHabits();
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  };

  const getTimeIcon = (tod: string) => {
    switch (tod) {
      case 'morning':
        return <Sunrise className="w-3.5 h-3.5 text-amber-500" />;
      case 'afternoon':
        return <Sun className="w-3.5 h-3.5 text-orange-500" />;
      case 'evening':
        return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getTimeLabel = (tod: string) => {
    switch (tod) {
      case 'morning':
        return 'Pagi';
      case 'afternoon':
        return 'Siang';
      case 'evening':
        return 'Malam';
      default:
        return 'Kapan Saja';
    }
  };

  const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 md:pb-0">
        <Header />

        <main className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <Flame className="w-7 h-7 text-orange-500" />
                <span>Habits & Rutinitas</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Bangun konsistensi hidup harian dengan pelacakan streak dan check-in teratur.
              </p>
            </div>

            <button
              onClick={() => {
                setHabitToEdit(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs shadow-orange-200 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Kebiasaan Baru</span>
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Kebiasaan Aktif</p>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {summary.total_habits} Rutinitas
                </h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Selesai Hari Ini</p>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {summary.completed_today} dari {summary.total_habits}
                </h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Streak Tertinggi</p>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  🔥 {summary.highest_streak} Hari
                </h3>
              </div>
            </div>
          </div>

          {/* Habits Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto text-orange-500 mb-3">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Belum ada kebiasaan yang dibuat</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Mulailah dengan kebiasaan kecil seperti membaca 15 menit atau olahraga pagi.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Buat Kebiasaan Pertama
                </button>
              </div>
            ) : (
              habits.map((habit) => (
                <div
                  key={habit.id}
                  className={`p-5 rounded-2xl bg-white border transition-all hover:shadow-md flex flex-col justify-between gap-4 ${
                    habit.is_completed_today
                      ? 'border-emerald-200/80 bg-emerald-50/20'
                      : 'border-slate-200/80'
                  }`}
                >
                  {/* Top: Title & Controls */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm font-bold truncate ${
                            habit.is_completed_today ? 'text-emerald-950' : 'text-slate-900'
                          }`}
                        >
                          {habit.title}
                        </h3>

                        {habit.category_name && (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                            style={{
                              backgroundColor: `${habit.category_color}15`,
                              borderColor: `${habit.category_color}30`,
                              color: habit.category_color || '#F97316',
                            }}
                          >
                            {habit.category_name}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {getTimeIcon(habit.time_of_day)}
                          <span>{getTimeLabel(habit.time_of_day)}</span>
                        </span>
                      </div>

                      {habit.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {habit.description}
                        </p>
                      )}
                    </div>

                    {/* Big Check-in Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleCheckIn(habit.id)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs ${
                        habit.is_completed_today
                          ? 'bg-emerald-500 text-white shadow-emerald-200 scale-105'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                      }`}
                      title={habit.is_completed_today ? 'Sudah selesai hari ini' : 'Klik untuk check-in hari ini'}
                    >
                      <Check className={`w-5 h-5 stroke-[3] ${habit.is_completed_today ? 'animate-in zoom-in-50 duration-150' : ''}`} />
                    </button>
                  </div>

                  {/* Middle: 7-Day Mini Tracker Dots */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">7 Hari Terakhir:</span>
                    <div className="flex items-center gap-1.5">
                      {habit.weekly_progress.map((day, idx) => {
                        const dObj = new Date(day.date);
                        const dayName = dayLabels[dObj.getDay()];
                        return (
                          <div key={day.date} className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-slate-400 font-medium">
                              {dayName}
                            </span>
                            <div
                              title={`${day.date}: ${day.completed ? 'Selesai' : 'Belum'}`}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                day.completed
                                  ? 'bg-emerald-500 text-white shadow-2xs'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              {day.completed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom: Streak Badges & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                        <Flame className="w-3.5 h-3.5 fill-current text-orange-500" />
                        <span>{habit.current_streak} Hari Streak</span>
                      </span>

                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        Rekor: {habit.longest_streak} Hari
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setHabitToEdit(habit);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Edit kebiasaan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus kebiasaan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Habit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onHabitSaved={fetchHabits}
        habitToEdit={habitToEdit}
        categories={categories}
      />
    </div>
  );
}
