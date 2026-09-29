'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Target,
  Tag,
  Calendar as CalendarIcon,
  Clock,
  CheckSquare,
  Hash,
  Save,
  AlertCircle,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalSaved: () => void;
  goalToEdit?: any | null;
  categories: Category[];
}

export function GoalModal({
  isOpen,
  onClose,
  onGoalSaved,
  goalToEdit,
  categories,
}: GoalModalProps) {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [targetType, setTargetType] = useState<'tasks' | 'duration' | 'numeric'>('tasks');
  const [targetValue, setTargetValue] = useState<number | string>(10);
  const [currentValue, setCurrentValue] = useState<number | string>(0);
  const [unit, setUnit] = useState('tugas');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        setTitle(goalToEdit.title || '');
        setDescription(goalToEdit.description || '');
        setCategoryId(goalToEdit.category_id || '');
        setTargetType(goalToEdit.target_type || 'tasks');
        setTargetValue(goalToEdit.target_value ?? 10);
        setCurrentValue(goalToEdit.current_value ?? 0);
        setUnit(goalToEdit.unit || 'tugas');
        setStartDate(goalToEdit.start_date || new Date().toISOString().slice(0, 10));
        setDeadline(goalToEdit.deadline || '');
      } else {
        setTitle('');
        setDescription('');
        setCategoryId(categories.length > 0 ? categories[0].id : '');
        setTargetType('tasks');
        setTargetValue(10);
        setCurrentValue(0);
        setUnit('tugas');
        setStartDate(new Date().toISOString().slice(0, 10));
        setDeadline('');
      }
      setError(null);
    }
  }, [isOpen, goalToEdit, categories]);

  if (!isOpen) return null;

  const handleTargetTypeChange = (type: 'tasks' | 'duration' | 'numeric') => {
    setTargetType(type);
    if (type === 'duration') setUnit('jam');
    else if (type === 'tasks') setUnit('tugas');
    else setUnit('satuan');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      category_id: categoryId || null,
      target_type: targetType,
      target_value: parseFloat(String(targetValue)) || 10,
      current_value: parseFloat(String(currentValue)) || 0,
      unit: unit.trim() || 'satuan',
      start_date: startDate,
      deadline: deadline || null,
    };

    try {
      const url = goalToEdit
        ? `${apiUrl}/api/goals/${goalToEdit.id}`
        : `${apiUrl}/api/goals`;
      const method = goalToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan target');
      }

      onGoalSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan target');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {goalToEdit ? 'Edit Target Sasaran' : 'Target Sasaran Baru'}
              </h2>
              <p className="text-[11px] text-slate-500">Tetapkan target capaian terukur jangka menengah</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Nama Target Sasaran</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Selesaikan 30 Modul Proyek..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
            />
          </div>

          {/* Target Type Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Tipe Pengukuran Target</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'tasks', label: 'Jumlah Tugas', icon: CheckSquare },
                { id: 'duration', label: 'Total Jam', icon: Clock },
                { id: 'numeric', label: 'Metrik Angka', icon: Hash },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = targetType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTargetTypeChange(t.id as any)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px]">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Value & Current Value & Unit */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Nilai Target</label>
              <input
                type="number"
                step="any"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Capaian Saat Ini</label>
              <input
                type="number"
                step="any"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Satuan / Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="misal: tugas"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Kategori Terkait
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900"
            >
              <option value="">Tanpa Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date & Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Mulai
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                Tenggat (Deadline)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Keterangan Tambahan</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan atau milestone pencapaian..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Target'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
