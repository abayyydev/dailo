'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Tag,
  Flag,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  Link as LinkIcon,
  Trash2,
  Bell,
  Repeat,
  Check,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface UnscheduledTask {
  id: string;
  title: string;
  category_id?: string | null;
  priority: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleSaved: () => void;
  scheduleToEdit?: any | null;
  categories: Category[];
  unscheduledTasks: UnscheduledTask[];
  initialDate?: string;
  initialStartTime?: string;
}

export function ScheduleModal({
  isOpen,
  onClose,
  onScheduleSaved,
  scheduleToEdit,
  categories,
  unscheduledTasks,
  initialDate,
  initialStartTime,
}: ScheduleModalProps) {
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [taskId, setTaskId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [status, setStatus] = useState<'planned' | 'ongoing' | 'completed' | 'skipped' | 'cancelled'>('planned');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [reminderOffset, setReminderOffset] = useState<number | null>(15);

  // Recurrence states
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFreq, setRecurrenceFreq] = useState<'weekly' | 'weekdays' | 'daily' | 'monthly'>('weekly');
  const [selectedDays, setSelectedDays] = useState<number[]>([1]); // default: Monday
  const [repeatDurationType, setRepeatDurationType] = useState<'16weeks' | '8weeks' | '4weeks' | 'custom'>('16weeks');
  const [customRepeatUntil, setCustomRepeatUntil] = useState('');

  // Confirmation modal states for recurring edit/delete
  const [showConfirmModal, setShowConfirmModal] = useState<'edit' | 'delete' | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scheduleToEdit) {
      setTitle(scheduleToEdit.title || '');
      setNotes(scheduleToEdit.notes || '');
      setTaskId(scheduleToEdit.task_id || '');
      setCategoryId(scheduleToEdit.category_id || '');
      setScheduleDate(scheduleToEdit.schedule_date || '');
      setStartTime(scheduleToEdit.start_time ? scheduleToEdit.start_time.slice(0, 5) : '09:00');
      setEndTime(scheduleToEdit.end_time ? scheduleToEdit.end_time.slice(0, 5) : '10:00');
      setStatus(scheduleToEdit.status || 'planned');
      setPriority(scheduleToEdit.priority || 'medium');
      setIsRecurring(Boolean(scheduleToEdit.recurrence_id));
    } else {
      setTitle('');
      setNotes('');
      setTaskId('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      const initDate = initialDate || new Date().toISOString().slice(0, 10);
      setScheduleDate(initDate);

      const dayIndex = new Date(`${initDate}T12:00:00`).getDay();
      setSelectedDays([dayIndex === 0 ? 0 : dayIndex]); // match initial date day

      const start = initialStartTime || '09:00';
      setStartTime(start);
      // Auto end time = start + 1 hour
      const [sh, sm] = start.split(':').map(Number);
      const nextH = (sh + 1) % 24;
      setEndTime(`${String(nextH).padStart(2, '0')}:${String(sm).padStart(2, '0')}`);

      setStatus('planned');
      setPriority('medium');
      setIsRecurring(false);
      setRecurrenceFreq('weekly');
      setRepeatDurationType('16weeks');
      setCustomRepeatUntil('');
    }
    setError(null);
    setShowConfirmModal(null);
  }, [scheduleToEdit, isOpen, initialDate, initialStartTime, categories]);

  if (!isOpen) return null;

  // Handle task selection from unscheduled inbox
  const handleTaskSelect = (selectedTaskId: string) => {
    setTaskId(selectedTaskId);
    const selected = unscheduledTasks.find((t) => t.id === selectedTaskId);
    if (selected) {
      if (!title) setTitle(selected.title);
      if (selected.category_id) setCategoryId(selected.category_id);
      if (selected.priority) setPriority(selected.priority as any);
    }
  };

  // Add Duration Helper (+30m, +1h, etc.)
  const addDuration = (minutes: number) => {
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + minutes;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
  };

  // Human-readable smart preview for recurrence
  const getPreviewText = () => {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    if (recurrenceFreq === 'weekly') {
      const names = selectedDays.map((d) => dayNames[d]).join(' & ');
      let countStr = '';
      if (repeatDurationType === '16weeks') countStr = `${selectedDays.length * 16} sesi (1 Semester Penuh / ~4 Bulan)`;
      else if (repeatDurationType === '8weeks') countStr = `${selectedDays.length * 8} sesi (~2 Bulan / Tengah Semester)`;
      else if (repeatDurationType === '4weeks') countStr = `${selectedDays.length * 4} sesi (1 Bulan)`;
      else if (customRepeatUntil) countStr = `sampai tanggal ${customRepeatUntil}`;
      else countStr = 'berulang berkala';

      return `Jadwal ini akan otomatis dibuat setiap hari ${names || 'terpilih'} pukul ${startTime} - ${endTime} sebanyak ${countStr}.`;
    }
    if (recurrenceFreq === 'weekdays') {
      return `Jadwal ini akan dibuat setiap hari kerja (Senin - Jumat) pukul ${startTime} - ${endTime} selama ${repeatDurationType === '16weeks' ? '16 minggu' : repeatDurationType === '8weeks' ? '8 minggu' : '4 minggu'}.`;
    }
    if (recurrenceFreq === 'daily') {
      return `Jadwal ini akan dibuat setiap hari tanpa jeda pukul ${startTime} - ${endTime}.`;
    }
    return `Jadwal ini akan dibuat setiap bulan pada tanggal yang sama pukul ${startTime} - ${endTime}.`;
  };

  const executeSave = async (scope: 'single' | 'all' = 'single') => {
    setLoading(true);
    setError(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    let count: number | undefined;
    if (isRecurring && repeatDurationType !== 'custom') {
      const multiplier = recurrenceFreq === 'weekly' ? selectedDays.length : 1;
      if (repeatDurationType === '16weeks') count = multiplier * 16;
      else if (repeatDurationType === '8weeks') count = multiplier * 8;
      else count = multiplier * 4;
    }

    const payload: any = {
      title: title.trim(),
      notes: notes.trim() || null,
      task_id: taskId || null,
      category_id: categoryId || null,
      schedule_date: scheduleDate,
      start_time: startTime.length === 5 ? `${startTime}:00` : startTime,
      end_time: endTime.length === 5 ? `${endTime}:00` : endTime,
      status,
      priority,
      reminder_offset: reminderOffset,
    };

    if (!scheduleToEdit && isRecurring) {
      payload.recurrence = {
        frequency: recurrenceFreq,
        days_of_week: recurrenceFreq === 'weekly' ? selectedDays : undefined,
        count: count,
        repeat_until: repeatDurationType === 'custom' && customRepeatUntil ? customRepeatUntil : undefined,
      };
    }

    try {
      const url = scheduleToEdit
        ? `${apiUrl}/api/schedules/${scheduleToEdit.id}?scope=${scope}`
        : `${apiUrl}/api/schedules`;
      const method = scheduleToEdit ? 'PUT' : 'POST';

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
        throw new Error(data.message || 'Gagal menyimpan jadwal');
      }

      onScheduleSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan jadwal');
    } finally {
      setLoading(false);
      setShowConfirmModal(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (startTime >= endTime) {
      setError('Jam mulai harus lebih awal dari jam selesai.');
      return;
    }

    // If editing a recurring schedule, prompt for scope
    if (scheduleToEdit && scheduleToEdit.recurrence_id) {
      setShowConfirmModal('edit');
      return;
    }

    await executeSave('single');
  };

  const executeDelete = async (scope: 'single' | 'all' = 'single') => {
    if (!scheduleToEdit || !token) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/schedules/${scheduleToEdit.id}?scope=${scope}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal menghapus jadwal');
      }
      onScheduleSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus jadwal');
    } finally {
      setLoading(false);
      setShowConfirmModal(null);
    }
  };

  const handleDelete = () => {
    if (!scheduleToEdit || !token) return;

    if (scheduleToEdit.recurrence_id) {
      setShowConfirmModal('delete');
    } else {
      if (confirm('Hapus jadwal ini dari timeline?')) {
        executeDelete('single');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">
                {scheduleToEdit ? 'Edit Aktivitas Terjadwal' : 'Jadwalkan Blok Waktu Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                {scheduleToEdit?.recurrence_id
                  ? 'Jadwal ini merupakan bagian dari jadwal rutin berulang'
                  : 'Atur blok waktu aktivitas pada timeline harian'}
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

          {/* Recurring indicator banner when editing */}
          {scheduleToEdit?.recurrence_id && (
            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Jadwal Rutin:</strong> {scheduleToEdit.recurrence_rule || 'Berulang'}
                </span>
              </div>
              <span className="text-[10px] bg-indigo-200/70 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                Rutin
              </span>
            </div>
          )}

          {/* Link to Unscheduled Task */}
          {!scheduleToEdit && unscheduledTasks.length > 0 && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <label className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                Hubungkan dari Unscheduled Inbox (Opsional)
              </label>
              <select
                value={taskId}
                onChange={(e) => handleTaskSelect(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-indigo-200 bg-white text-slate-900 focus:outline-hidden"
              >
                <option value="">-- Buat Jadwal Mandiri (Tanpa Task) --</option>
                {unscheduledTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.priority})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Judul Aktivitas / Jadwal *</label>
            <input
              type="text"
              required
              id="input-schedule-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Mengajar Algoritma & Pemrograman, Rapat Tim..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-600 text-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Mulai
              </label>
              <input
                type="date"
                required
                id="input-schedule-date"
                value={scheduleDate}
                onChange={(e) => {
                  setScheduleDate(e.target.value);
                  if (!scheduleToEdit) {
                    const dayIdx = new Date(`${e.target.value}T12:00:00`).getDay();
                    setSelectedDays([dayIdx]);
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Jam Mulai
              </label>
              <input
                type="time"
                required
                id="input-schedule-start-time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Jam Selesai
              </label>
              <input
                type="time"
                required
                id="input-schedule-end-time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          {/* Quick Duration Preset Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Durasi Cepat:</span>
            {[
              { label: '+30m', mins: 30 },
              { label: '+1j', mins: 60 },
              { label: '+1.5j', mins: 90 },
              { label: '+2j', mins: 120 },
              { label: '+3j', mins: 180 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => addDuration(p.mins)}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* RECURRING SCHEDULE SETTINGS (When creating fresh schedule) */}
          {!scheduleToEdit && (
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                  <Repeat className="w-4 h-4 text-indigo-600" />
                  <span>Jadwal Berulang / Rutinitas (misal: Mengajar)</span>
                </label>
                <button
                  type="button"
                  id="btn-toggle-recurring"
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isRecurring ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                  aria-pressed={isRecurring}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isRecurring ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {isRecurring && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3.5 animate-in fade-in zoom-in-95">
                  {/* Frequency Type */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-600 block">Pola Pengulangan:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: 'weekly', label: 'Setiap Minggu' },
                        { id: 'weekdays', label: 'Hari Kerja (Sen-Jum)' },
                        { id: 'daily', label: 'Setiap Hari' },
                        { id: 'monthly', label: 'Setiap Bulan' },
                      ].map((freq) => (
                        <button
                          key={freq.id}
                          type="button"
                          id={`freq-${freq.id}`}
                          onClick={() => setRecurrenceFreq(freq.id as any)}
                          className={`text-xs py-2 px-2 rounded-xl font-medium border text-center transition-all cursor-pointer ${
                            recurrenceFreq === freq.id
                              ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {freq.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Day Selector (for weekly) */}
                  {recurrenceFreq === 'weekly' && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-600 block">
                        Pilih Hari Mengajar / Rutinitas (Bisa lebih dari 1 hari):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { day: 1, label: 'Senin' },
                          { day: 2, label: 'Selasa' },
                          { day: 3, label: 'Rabu' },
                          { day: 4, label: 'Kamis' },
                          { day: 5, label: 'Jumat' },
                          { day: 6, label: 'Sabtu' },
                          { day: 0, label: 'Minggu' },
                        ].map((d) => {
                          const isSelected = selectedDays.includes(d.day);
                          return (
                            <button
                              key={d.day}
                              type="button"
                              id={`day-btn-${d.day}`}
                              onClick={() => {
                                if (isSelected) {
                                  if (selectedDays.length > 1) {
                                    setSelectedDays(selectedDays.filter((x) => x !== d.day));
                                  }
                                } else {
                                  setSelectedDays([...selectedDays, d.day].sort());
                                }
                              }}
                              className={`flex-1 min-w-[42px] py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Repeat Duration Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-600 block">Batas Pengulangan Jadwal:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: '16weeks', label: '16 Minggu (1 Semester)' },
                        { id: '8weeks', label: '8 Minggu (~2 Bulan)' },
                        { id: '4weeks', label: '4 Minggu (1 Bulan)' },
                        { id: 'custom', label: 'Pilih Tanggal' },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          id={`duration-${preset.id}`}
                          onClick={() => setRepeatDurationType(preset.id as any)}
                          className={`text-[11px] py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                            repeatDurationType === preset.id
                              ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {repeatDurationType === 'custom' && (
                      <div className="pt-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                          Berulang sampai tanggal:
                        </label>
                        <input
                          type="date"
                          value={customRepeatUntil}
                          onChange={(e) => setCustomRepeatUntil(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900"
                        />
                      </div>
                    )}
                  </div>

                  {/* Smart Preview */}
                  <div className="p-3 rounded-xl bg-white border border-indigo-100 text-[11px] text-indigo-950 flex items-start gap-2.5 shadow-2xs">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-indigo-700">Ringkasan Jadwal Otomatis:</p>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{getPreviewText()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Category, Priority, and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
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
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 capitalize"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 capitalize"
              >
                <option value="planned">Planned</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="skipped">Skipped</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Reminder Selector */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-indigo-600" />
              Pengingat (Reminder)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Tanpa Pengingat', value: null },
                { label: 'Saat Mulai', value: 0 },
                { label: '5 Mnt Sebelum', value: 5 },
                { label: '15 Mnt Sebelum', value: 15 },
                { label: '30 Mnt Sebelum', value: 30 },
                { label: '1 Jam Sebelum', value: 60 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setReminderOffset(opt.value)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    reminderOffset === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Catatan / Info Ruang / Link
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Ruang Lab 3, Gedung B, bawa modul praktikum..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-900 resize-none"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {scheduleToEdit ? (
              <button
                type="button"
                id="btn-delete-schedule"
                onClick={handleDelete}
                className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Jadwal</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                id="btn-save-schedule"
                disabled={loading || !title.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-200 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>{scheduleToEdit ? 'Simpan Perubahan' : 'Jadwalkan Blok Waktu'}</span>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* DIALOG KONFIRMASI RANGKAIAN BERULANG (EDIT / DELETE) */}
        {showConfirmModal && (
          <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${showConfirmModal === 'delete' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {showConfirmModal === 'delete' ? <Trash2 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {showConfirmModal === 'delete' ? 'Hapus Jadwal Berulang' : 'Perbarui Jadwal Berulang'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Jadwal ini merupakan bagian dari rangkaian rutin
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {showConfirmModal === 'delete'
                  ? 'Apakah Anda ingin menghapus hanya sesi tanggal ini saja, atau menghapus seluruh jadwal mengajar/rutin dalam rangkaian ini?'
                  : 'Apakah Anda ingin menerapkan perubahan jam & detail hanya untuk sesi ini, atau untuk seluruh jadwal dalam rangkaian?'}
              </p>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  id="btn-confirm-all"
                  onClick={() => {
                    if (showConfirmModal === 'delete') executeDelete('all');
                    else executeSave('all');
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
                    showConfirmModal === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {showConfirmModal === 'delete' ? 'Hapus Seluruh Rangkaian Jadwal' : 'Terapkan ke Seluruh Rangkaian'}
                </button>

                <button
                  type="button"
                  id="btn-confirm-single"
                  onClick={() => {
                    if (showConfirmModal === 'delete') executeDelete('single');
                    else executeSave('single');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                >
                  {showConfirmModal === 'delete' ? 'Hanya Sesi Ini Saja' : 'Hanya Sesi Ini Saja'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfirmModal(null)}
                  className="w-full py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
