'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { GoalModal } from '@/components/goals/GoalModal';
import {
  Target,
  Plus,
  Clock,
  CheckSquare,
  Hash,
  CheckCircle2,
  Calendar as CalendarIcon,
  Trash2,
  Edit2,
  Trophy,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  category_name?: string | null;
  category_color?: string | null;
  target_type: 'duration' | 'tasks' | 'numeric';
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  deadline: string | null;
  status: 'in_progress' | 'completed' | 'cancelled';
  progress_percentage: number;
  days_remaining: number | null;
}

export default function GoalsPage() {
  const { token, isAuthenticated } = useAuth();
  const { playChime } = useNotifications();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [summary, setSummary] = useState({
    total_goals: 0,
    completed_goals: 0,
    average_progress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchGoals = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setGoals(data.goals || []);
      setSummary(data.summary || { total_goals: 0, completed_goals: 0, average_progress: 0 });
    } catch (err) {
      console.error('Failed to fetch goals:', err);
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
      Promise.all([fetchGoals(), fetchCategories()]).then(() => {
        setLoading(false);
      });
    }
  }, [isAuthenticated, token, fetchGoals, fetchCategories]);

  const handleUpdateProgress = async (goalId: string, delta: number) => {
    if (!token) return;

    // Optimistic UI update
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const nextVal = Math.max(0, g.current_value + delta);
          const nextPct = Math.min(100, Math.round((nextVal / g.target_value) * 100));
          return {
            ...g,
            current_value: nextVal,
            progress_percentage: nextPct,
            status: nextVal >= g.target_value ? 'completed' : 'in_progress',
          };
        }
        return g;
      })
    );

    try {
      const res = await fetch(`${apiUrl}/api/goals/${goalId}/progress`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ delta }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.goal?.progress_percentage >= 100) {
          playChime();
        }
        fetchGoals();
      } else {
        fetchGoals();
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
      fetchGoals();
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!token) return;
    if (!confirm('Hapus target sasaran ini?')) return;

    try {
      await fetch(`${apiUrl}/api/goals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGoals();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const filteredGoals = goals.filter((g) => {
    if (activeFilter === 'in_progress') return g.status === 'in_progress' && g.progress_percentage < 100;
    if (activeFilter === 'completed') return g.status === 'completed' || g.progress_percentage >= 100;
    return true;
  });

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case 'duration':
        return <Clock className="w-3.5 h-3.5 text-indigo-600" />;
      case 'tasks':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Hash className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 md:pb-0">
        <Header />

        <main className="p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <Target className="w-7 h-7 text-indigo-600" />
                <span>Target & Goals</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Capai sasaran jangka menengah-panjang dengan pelacakan durasi, jumlah tugas, dan target terukur.
              </p>
            </div>

            <button
              onClick={() => {
                setGoalToEdit(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-200 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Target Sasaran</span>
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Target Sasaran</p>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {summary.total_goals} Goals
                </h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Sasaran Tercapai</p>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {summary.completed_goals} Tercapai
                </h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Rata-rata Progres</p>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {summary.average_progress}%
                </h3>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Semua ({goals.length})
            </button>
            <button
              onClick={() => setActiveFilter('in_progress')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'in_progress'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Sedang Berjalan ({goals.filter((g) => g.progress_percentage < 100).length})
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'completed'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Tercapai ({goals.filter((g) => g.progress_percentage >= 100).length})
            </button>
          </div>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGoals.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto text-indigo-600 mb-3">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Tidak ada sasaran dalam kategori ini</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Buat sasaran baru dengan deadline dan metrik terukur untuk memantau kemajuan Anda.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Buat Target Sasaran
                </button>
              </div>
            ) : (
              filteredGoals.map((goal) => {
                const isCompleted = goal.progress_percentage >= 100 || goal.status === 'completed';

                return (
                  <div
                    key={goal.id}
                    className={`p-5 rounded-2xl bg-white border transition-all hover:shadow-md flex flex-col justify-between gap-4 ${
                      isCompleted ? 'border-emerald-200 bg-emerald-50/15' : 'border-slate-200/80'
                    }`}
                  >
                    {/* Top: Title & Badges */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`text-sm font-bold truncate ${
                                isCompleted ? 'text-emerald-950' : 'text-slate-900'
                              }`}
                            >
                              {goal.title}
                            </h3>

                            {goal.category_name && (
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                                style={{
                                  backgroundColor: `${goal.category_color}15`,
                                  borderColor: `${goal.category_color}30`,
                                  color: goal.category_color || '#4F46E5',
                                }}
                              >
                                {goal.category_name}
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                              {getTargetTypeIcon(goal.target_type)}
                              <span className="capitalize">{goal.unit}</span>
                            </span>
                          </div>

                          {goal.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                              {goal.description}
                            </p>
                          )}
                        </div>

                        {/* Status Icon */}
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                            <Trophy className="w-3 h-3 text-emerald-600" />
                            <span>Tercapai</span>
                          </span>
                        ) : (
                          goal.days_remaining !== null && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${
                                goal.days_remaining < 0
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : goal.days_remaining <= 3
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>
                                {goal.days_remaining < 0
                                  ? 'Lewat Deadline'
                                  : `${goal.days_remaining} Hari Lagi`}
                              </span>
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Middle: Progress Bar & Current Value */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-600">
                          {goal.current_value} / {goal.target_value} {goal.unit}
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            isCompleted ? 'text-emerald-600' : 'text-indigo-600'
                          }`}
                        >
                          {goal.progress_percentage}%
                        </span>
                      </div>

                      {/* Progress bar container */}
                      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60 p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                          }`}
                          style={{ width: `${goal.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom: Quick Increment Buttons & Edit Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      {/* Quick +1 / -1 Buttons */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400 font-medium">Update:</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateProgress(goal.id, -1)}
                          disabled={goal.current_value <= 0}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateProgress(goal.id, 1)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors cursor-pointer"
                        >
                          +1
                        </button>
                        {goal.target_type === 'duration' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateProgress(goal.id, 5)}
                            className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors cursor-pointer"
                          >
                            +5 Jam
                          </button>
                        )}
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setGoalToEdit(goal);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Edit target"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus target"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGoalSaved={fetchGoals}
        goalToEdit={goalToEdit}
        categories={categories}
      />
    </div>
  );
}
