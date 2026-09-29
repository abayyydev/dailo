'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  CheckSquare,
  Calendar,
  Clock,
  Tag,
  Flag,
  FileText,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskSaved: (task: any) => void;
  taskToEdit?: any | null;
  categories: Category[];
}

export function TaskModal({
  isOpen,
  onClose,
  onTaskSaved,
  taskToEdit,
  categories,
}: TaskModalProps) {
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; parent_id?: string | null; title: string; is_completed: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setNotes(taskToEdit.notes || '');
      setCategoryId(taskToEdit.category_id || '');
      setPriority(taskToEdit.priority || 'medium');
      setDueDate(taskToEdit.due_date ? taskToEdit.due_date.slice(0, 10) : '');
      setStartTime(taskToEdit.start_time || '');
      setEndTime(taskToEdit.end_time || '');
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setNotes('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setPriority('medium');
      setDueDate(new Date().toISOString().slice(0, 10)); // Default today
      setStartTime('');
      setEndTime('');
      setSubtasks([]);
    }
    setError(null);
  }, [taskToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'sub_' + Math.random().toString(36).substr(2, 9);
    setSubtasks([
      ...subtasks,
      {
        id: newId,
        parent_id: selectedParentId || null,
        title: newSubtaskTitle.trim(),
        is_completed: false,
      },
    ]);
    setNewSubtaskTitle('');
    setSelectedParentId(null);
  };

  const handleRemoveSubtask = (idToRemove: string) => {
    // Remove the subtask and any child subtasks that reference it as parent
    setSubtasks(subtasks.filter((s) => s.id !== idToRemove && s.parent_id !== idToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const payload = {
      title: title.trim(),
      notes: notes.trim() || null,
      category_id: categoryId || null,
      priority,
      due_date: dueDate || null,
      start_time: startTime || null,
      end_time: endTime || null,
      subtasks: subtasks.map((s) => ({
        id: s.id,
        parent_id: s.parent_id || null,
        title: s.title,
        is_completed: s.is_completed,
      })),
    };

    try {
      const url = taskToEdit ? `${apiUrl}/api/tasks/${taskToEdit.id}` : `${apiUrl}/api/tasks`;
      const method = taskToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save task');
      }

      onTaskSaved(data.task);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const setDatePreset = (preset: 'today' | 'tomorrow' | 'clear') => {
    if (preset === 'today') {
      setDueDate(new Date().toISOString().slice(0, 10));
    } else if (preset === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().slice(0, 10));
    } else {
      setDueDate('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">
                {taskToEdit ? 'Edit Task' : 'Tambah Task Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                {taskToEdit ? 'Perbarui informasi dan checklist tugas' : 'Buat to-do terjadwal atau tanpa batas waktu'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Judul Task *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Selesaikan desain PRD modul Schedule..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Kategori
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
              >
                <option value="">Tanpa Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 capitalize"
              >
                <option value="low">Low (Rendah)</option>
                <option value="medium">Medium (Sedang)</option>
                <option value="high">High (Tinggi)</option>
                <option value="urgent">Urgent (Mendesak)</option>
              </select>
            </div>
          </div>

          {/* Due Date & Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Batas Waktu (Due Date)
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDatePreset('today')}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('tomorrow')}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  Besok
                </button>
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDatePreset('clear')}
                    className="text-[11px] px-2 py-0.5 rounded-md hover:bg-rose-50 text-rose-600 transition-colors"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
            />
          </div>

          {/* Time Block (Start & End Time) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Jam Mulai (Opsional)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Jam Selesai (Opsional)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
              />
            </div>
          </div>

          {/* Multi-Level Checklist / Subtasks Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Subtask Bertingkat (Hierarchical Subtasks)</label>
              {selectedParentId && (
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span>Menambahkan Child Subtask</span>
                  <button
                    type="button"
                    onClick={() => setSelectedParentId(null)}
                    className="text-indigo-400 hover:text-indigo-700"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {subtasks.filter((s) => !s.parent_id).length === 0 ? (
                <div className="py-2 text-center text-[11px] text-slate-400">
                  Belum ada subtask. Tambahkan di bawah.
                </div>
              ) : (
                subtasks
                  .filter((s) => !s.parent_id)
                  .map((parent) => {
                    const children = subtasks.filter((c) => c.parent_id === parent.id);
                    return (
                      <div key={parent.id} className="space-y-1">
                        {/* Parent Subtask */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                            <span className="text-slate-800 font-medium truncate">{parent.title}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedParentId(parent.id)}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                              title="Tambah Subtask di bawah item ini"
                            >
                              + Sub-item
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubtask(parent.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Children Subtasks (Indented) */}
                        {children.map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center justify-between p-1.5 pl-6 pr-2 rounded-xl bg-indigo-50/40 border border-indigo-100/70 text-xs ml-4"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-indigo-400 font-bold">↳</span>
                              <span className="text-slate-700 truncate text-[11px]">{child.title}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSubtask(child.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })
              )}
            </div>

            {/* Subtask Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder={
                  selectedParentId
                    ? 'Ketikkan nama child subtask...'
                    : 'Tambahkan subtask baru (Tekan Enter)...'
                }
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{selectedParentId ? 'Tambah Sub-item' : 'Tambah'}</span>
              </button>
            </div>
          </div>

          {/* Notes / Description */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Catatan / Detail
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan, link referensi, konteks pekerjaan..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-200 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{taskToEdit ? 'Simpan Perubahan' : 'Buat Task'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
