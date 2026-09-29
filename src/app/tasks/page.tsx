'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { TaskModal } from '@/components/tasks/TaskModal';
import { CategoryModal } from '@/components/categories/CategoryModal';
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  Tag,
  Flag,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  FolderPlus,
  Loader2,
  CheckCircle2,
  Circle,
  Inbox,
  Sparkles,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  task_count?: number;
}

interface Task {
  id: string;
  title: string;
  notes?: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  completed_at?: string | null;
  created_at: string;
  category_id?: string | null;
  category_name?: string | null;
  category_color?: string | null;
  category_icon?: string | null;
  total_subtasks: number;
  completed_subtasks: number;
}

export default function TasksPage() {
  const { token, isAuthenticated, isLoading: authLoading, openAuthModal } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'unscheduled'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Add State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('');
  const [quickPriority, setQuickPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [quickLoading, setQuickLoading] = useState(false);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (activeTab === 'today') params.append('filter', 'today');
      else if (activeTab === 'upcoming') params.append('filter', 'upcoming');
      else if (activeTab === 'overdue') params.append('filter', 'overdue');
      else if (activeTab === 'unscheduled') params.append('filter', 'unscheduled');
      else if (activeTab === 'completed') params.append('status', 'completed');

      if (selectedCategory !== 'all') params.append('category_id', selectedCategory);
      if (selectedPriority !== 'all') params.append('priority', selectedPriority);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`${apiUrl}/api/tasks?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token, activeTab, selectedCategory, selectedPriority, searchQuery]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchTasks();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchCategories, fetchTasks]);

  // Toggle Task Completion
  const handleToggleTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: t.status === 'completed' ? 'pending' : 'completed',
              completed_at: t.status === 'completed' ? null : new Date().toISOString(),
            }
          : t
      )
    );

    try {
      const res = await fetch(`${apiUrl}/api/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // Revert on failure
        fetchTasks();
      }
    } catch {
      fetchTasks();
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    if (!confirm('Apakah Anda yakin ingin menghapus task ini?')) return;

    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await fetch(`${apiUrl}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch {
      fetchTasks();
    }
  };

  // Quick Add Submit
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !token) return;

    setQuickLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: quickTitle.trim(),
          category_id: quickCategory || null,
          priority: quickPriority,
          due_date: new Date().toISOString().slice(0, 10),
        }),
      });

      if (res.ok) {
        setQuickTitle('');
        fetchTasks();
        fetchCategories();
      }
    } catch (err) {
      console.error('Failed to quick-add task:', err);
    } finally {
      setQuickLoading(false);
    }
  };

  // Open Edit Modal
  const handleEditClick = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

    try {
      const res = await fetch(`${apiUrl}/api/tasks/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTaskToEdit(data.task);
        setIsTaskModalOpen(true);
      }
    } catch {
      setTaskToEdit(task);
      setIsTaskModalOpen(true);
    }
  };

  // Priority styling helper
  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Metrics calculations
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status !== 'completed').length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 md:pb-0">
        <Header />

        <main className="p-3.5 sm:p-6 md:p-8 max-w-6xl w-full mx-auto space-y-5 sm:space-y-6">
          {/* Header section with Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100 mb-1">
                <Sparkles className="w-3 h-3" />
                Phase 2 — Core Tasks & Categories
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Tasks & To-Do Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola to-do harian, checklist prioritas, dan kategorisasi aktivitas secara fleksibel.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-indigo-600" />
                <span>+ Kategori</span>
              </button>
              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-200 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Task</span>
              </button>
            </div>
          </div>

          {!isAuthenticated && !authLoading ? (
            <div className="p-8 rounded-3xl bg-indigo-900 text-white text-center space-y-3 shadow-xl">
              <CheckSquare className="w-10 h-10 text-indigo-300 mx-auto" />
              <h3 className="text-xl font-bold">Masuk untuk Mengelola Task Anda</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Silakan masuk dengan akun Anda atau gunakan akun demo 1-klik untuk mencoba fitur manajemen tugas.
              </p>
              <Link
                href="/login"
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 text-xs font-semibold shadow-md hover:bg-indigo-50 transition-all cursor-pointer"
              >
                Sign In / Demo Login
              </Link>
            </div>
          ) : (
            <>
              {/* Quick Add Bar */}
              <form
                onSubmit={handleQuickAdd}
                className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-2.5"
              >
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder="Tambah task cepat (contoh: Review dokumen implementasi)..."
                    className="w-full pl-3.5 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="flex-1 sm:flex-initial px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden"
                  >
                    <option value="">Kategori...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={quickPriority}
                    onChange={(e: any) => setQuickPriority(e.target.value)}
                    className="flex-1 sm:flex-initial px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>

                  <button
                    type="submit"
                    disabled={quickLoading || !quickTitle.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-2xs disabled:opacity-50 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    {quickLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Status Tabs Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                  {[
                    { id: 'all', label: 'All Tasks', count: totalCount },
                    { id: 'today', label: 'Hari Ini' },
                    { id: 'upcoming', label: 'Upcoming' },
                    { id: 'overdue', label: 'Overdue' },
                    { id: 'unscheduled', label: 'Tanpa Jadwal' },
                    { id: 'completed', label: 'Selesai', count: completedCount },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        activeTab === tab.id
                          ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                      {tab.count !== undefined && (
                        <span
                          className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                            activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Priority & Search */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="flex-1 sm:flex-initial px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden"
                  >
                    <option value="all">Semua Prioritas</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari task..."
                      className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Category Pills Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Semua Kategori
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === c.id
                        ? 'border-indigo-600 text-indigo-700 bg-indigo-50 font-semibold shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span>{c.name}</span>
                    {c.task_count !== undefined && (
                      <span className="text-[10px] text-slate-400 font-mono">({c.task_count})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Task List */}
              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <p className="text-xs">Memuat daftar task...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="py-16 bg-white rounded-2xl border border-slate-200 text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-base">Tidak Ada Task Ditemukan</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {searchQuery || selectedCategory !== 'all' || activeTab !== 'all'
                      ? 'Tidak ada task yang sesuai dengan filter yang aktif.'
                      : 'Belum ada task. Tambahkan task pertama Anda melalui bar di atas.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tasks.map((task) => {
                    const isCompleted = task.status === 'completed';

                    return (
                      <div
                        key={task.id}
                        onClick={(e) => handleEditClick(task, e)}
                        className={`group bg-white p-4 rounded-2xl border transition-all hover:shadow-xs flex items-center justify-between gap-4 cursor-pointer ${
                          isCompleted
                            ? 'border-slate-100 bg-slate-50/50 opacity-75'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Checkbox and Title */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={(e) => handleToggleTask(task.id, e)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                              isCompleted
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300 hover:border-indigo-500 bg-white'
                            }`}
                          >
                            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-sm font-medium leading-tight text-slate-900 ${
                                  isCompleted ? 'line-through text-slate-400' : ''
                                }`}
                              >
                                {task.title}
                              </span>

                              {/* Priority Badge */}
                              <span
                                className={`inline-flex items-center px-2 py-0.2 rounded-md text-[10px] font-semibold border uppercase tracking-wider ${getPriorityBadge(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>

                              {/* Category Badge */}
                              {task.category_name && (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md text-[10px] font-medium border"
                                  style={{
                                    borderColor: `${task.category_color}40`,
                                    backgroundColor: `${task.category_color}10`,
                                    color: task.category_color || '#4F46E5',
                                  }}
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: task.category_color || '#4F46E5' }}
                                  />
                                  <span>{task.category_name}</span>
                                </span>
                              )}
                            </div>

                            {/* Meta info row */}
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              {task.due_date ? (
                                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span>{task.due_date}</span>
                                  {task.start_time && (
                                    <span className="text-slate-400">
                                      ({task.start_time.slice(0, 5)}
                                      {task.end_time ? ` - ${task.end_time.slice(0, 5)}` : ''})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400">Tanpa jadwal</span>
                              )}

                              {task.total_subtasks > 0 && (
                                <div className="flex items-center gap-1 text-[11px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                                  <CheckSquare className="w-3 h-3" />
                                  <span>
                                    {task.completed_subtasks}/{task.total_subtasks}
                                  </span>
                                </div>
                              )}

                              {task.notes && (
                                <p className="text-[11px] text-slate-400 truncate max-w-xs hidden sm:block">
                                  {task.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleEditClick(task, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteTask(task.id, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Modals */}
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onTaskSaved={() => {
              fetchTasks();
              fetchCategories();
            }}
            taskToEdit={taskToEdit}
            categories={categories}
          />

          <CategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            onCategoryCreated={() => {
              fetchCategories();
            }}
          />
        </main>
        <Footer />
      </div>
    </div>
  );
}
