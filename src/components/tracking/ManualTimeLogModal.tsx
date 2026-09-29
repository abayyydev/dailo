'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Clock,
  Calendar as CalendarIcon,
  Tag,
  FileText,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface ManualTimeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogSaved: () => void;
  categories: Category[];
}

export function ManualTimeLogModal({
  isOpen,
  onClose,
  onLogSaved,
  categories,
}: ManualTimeLogModalProps) {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setLogDate(new Date().toISOString().slice(0, 10));
      setStartTime('09:00');
      setEndTime('10:00');
      setNotes('');
      setError(null);
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  // Calculate duration display
  const getDurationMinutes = () => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const s = sh * 60 + sm;
    const e = eh * 60 + em;
    return Math.max(0, e - s);
  };

  const durationMins = getDurationMinutes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (startTime >= endTime) {
      setError('Jam mulai harus lebih awal dari jam selesai');
      return;
    }

    setLoading(true);
    setError(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${apiUrl}/api/tracking/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          category_id: categoryId || null,
          log_date: logDate,
          start_time: startTime,
          end_time: endTime,
          duration_seconds: durationMins * 60,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mencatat waktu manual');
      }

      onLogSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan catatan waktu');
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
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Catat Waktu Manual</h2>
              <p className="text-[11px] text-slate-500">Input sesi kerja yang sudah dilakukan di masa lampau</p>
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
            <label className="text-xs font-semibold text-slate-700">Judul Aktivitas</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Riset arsitektur backend..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-2 gap-3">
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                Tanggal
              </label>
              <input
                type="date"
                required
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          {/* Start Time & End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Jam Mulai</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Jam Selesai</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          {/* Computed Duration Banner */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Durasi Terhitung:</span>
            <span className="font-bold text-indigo-600">
              {Math.floor(durationMins / 60)} Jam {durationMins % 60} Menit ({durationMins} mnt)
            </span>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Catatan (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail pengerjaan sesi..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 resize-none"
            />
          </div>

          {/* Actions */}
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
              <span>{loading ? 'Menyimpan...' : 'Simpan Log'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
