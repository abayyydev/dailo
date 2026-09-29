'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Flame,
  Tag,
  Calendar as CalendarIcon,
  Sun,
  Sunrise,
  Moon,
  Clock,
  Save,
  AlertCircle,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitSaved: () => void;
  habitToEdit?: any | null;
  categories: Category[];
}

const DAYS = [
  { id: '1', label: 'Sen' },
  { id: '2', label: 'Sel' },
  { id: '3', label: 'Rab' },
  { id: '4', label: 'Kam' },
  { id: '5', label: 'Jum' },
  { id: '6', label: 'Sab' },
  { id: '7', label: 'Min' },
];

export function HabitModal({
  isOpen,
  onClose,
  onHabitSaved,
  habitToEdit,
  categories,
}: HabitModalProps) {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<string[]>(['1', '2', '3', '4', '5', '6', '7']);
  const [timeOfDay, setTimeOfDay] = useState<'anytime' | 'morning' | 'afternoon' | 'evening'>('anytime');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (habitToEdit) {
        setTitle(habitToEdit.title || '');
        setDescription(habitToEdit.description || '');
        setCategoryId(habitToEdit.category_id || '');
        setFrequencyType(habitToEdit.frequency_type || 'daily');
        setSelectedDays(habitToEdit.repeat_days ? habitToEdit.repeat_days.split(',') : ['1', '2', '3', '4', '5', '6', '7']);
        setTimeOfDay(habitToEdit.time_of_day || 'anytime');
      } else {
        setTitle('');
        setDescription('');
        setCategoryId(categories.length > 0 ? categories[0].id : '');
        setFrequencyType('daily');
        setSelectedDays(['1', '2', '3', '4', '5', '6', '7']);
        setTimeOfDay('anytime');
      }
      setError(null);
    }
  }, [isOpen, habitToEdit, categories]);

  if (!isOpen) return null;

  const toggleDay = (dayId: string) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayId));
      }
    } else {
      setSelectedDays([...selectedDays, dayId].sort());
    }
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
      frequency_type: frequencyType,
      repeat_days: selectedDays.join(','),
      time_of_day: timeOfDay,
    };

    try {
      const url = habitToEdit
        ? `${apiUrl}/api/habits/${habitToEdit.id}`
        : `${apiUrl}/api/habits`;
      const method = habitToEdit ? 'PUT' : 'POST';

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
        throw new Error(data.error || 'Gagal menyimpan kebiasaan');
      }

      onHabitSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan kebiasaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {habitToEdit ? 'Edit Kebiasaan' : 'Kebiasaan Baru'}
              </h2>
              <p className="text-[11px] text-slate-500">Bangun rutinitas positif dengan pelacakan streak</p>
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
            <label className="text-xs font-semibold text-slate-700">Nama Kebiasaan</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Olahraga Pagi 20 Menit..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Kategori
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

          {/* Repeat Days */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Hari Pengulangan</label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((d) => {
                const isSelected = selectedDays.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.id)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time of Day */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Waktu Rutinitas</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'anytime', label: 'Kapan Saja', icon: Clock },
                { id: 'morning', label: 'Pagi', icon: Sunrise },
                { id: 'afternoon', label: 'Siang', icon: Sun },
                { id: 'evening', label: 'Malam', icon: Moon },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = timeOfDay === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTimeOfDay(t.id as any)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
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

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Catatan / Alasan (Opsional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tujuan membangun kebiasaan ini..."
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
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Kebiasaan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
