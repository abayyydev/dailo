'use client';

import React, { useState, useEffect } from 'react';
import { X, Pin, Tag, Folder, CheckSquare, Clock, Palette } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface TaskOption {
  id: string;
  title: string;
}

interface ScheduleOption {
  id: string;
  title: string;
}

export interface NoteData {
  id?: string;
  title: string;
  content: string;
  category_id: string | null;
  task_id: string | null;
  schedule_id: string | null;
  color: string;
  is_pinned: boolean;
  tags: string | null;
}

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: NoteData) => Promise<void>;
  note?: NoteData | null;
  categories: Category[];
  tasks?: TaskOption[];
  schedules?: ScheduleOption[];
}

const COLOR_OPTIONS = [
  { label: 'Putih', value: '#ffffff', border: 'border-slate-200' },
  { label: 'Amber', value: '#fef3c7', border: 'border-amber-200' },
  { label: 'Emerald', value: '#ecfdf5', border: 'border-emerald-200' },
  { label: 'Sky', value: '#f0f9ff', border: 'border-sky-200' },
  { label: 'Violet', value: '#f5f3ff', border: 'border-violet-200' },
  { label: 'Rose', value: '#fff1f2', border: 'border-rose-200' },
  { label: 'Slate', value: '#f8fafc', border: 'border-slate-300' },
];

export function NoteModal({
  isOpen,
  onClose,
  onSave,
  note,
  categories,
  tasks = [],
  schedules = [],
}: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [taskId, setTaskId] = useState<string>('');
  const [scheduleId, setScheduleId] = useState<string>('');
  const [color, setColor] = useState('#ffffff');
  const [isPinned, setIsPinned] = useState(false);
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setCategoryId(note.category_id || '');
      setTaskId(note.task_id || '');
      setScheduleId(note.schedule_id || '');
      setColor(note.color || '#ffffff');
      setIsPinned(!!note.is_pinned);
      setTags(note.tags || '');
    } else {
      setTitle('');
      setContent('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setTaskId('');
      setScheduleId('');
      setColor('#ffffff');
      setIsPinned(false);
      setTags('');
    }
    setError('');
  }, [note, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul catatan wajib diisi');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave({
        id: note?.id,
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId || null,
        task_id: taskId || null,
        schedule_id: scheduleId || null,
        color,
        is_pinned: isPinned,
        tags: tags.trim() || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan catatan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] transition-all"
        style={{ backgroundColor: color !== '#ffffff' ? color : '#ffffff' }}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between bg-white/60 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900">
              {note ? 'Edit Catatan' : 'Tambah Catatan Baru'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-xl border transition-all ${
                isPinned
                  ? 'bg-amber-100/90 text-amber-700 border-amber-300 shadow-xs'
                  : 'bg-white/80 text-slate-400 border-slate-200 hover:text-slate-700'
              }`}
              title={isPinned ? 'Lepas Sematan' : 'Sematkan ke Atas (Pin)'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-amber-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Title Input */}
          <div>
            <input
              type="text"
              id="input-note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul Catatan..."
              className="w-full text-lg font-bold text-slate-900 placeholder:text-slate-400 bg-white/80 border border-slate-200/80 rounded-xl px-4 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              required
            />
          </div>

          {/* Content Textarea */}
          <div>
            <textarea
              id="input-note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan catatan, riset, atau ide di sini (mendukung format markdown seperti bullet, checklist, heading)..."
              rows={8}
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 bg-white/80 border border-slate-200/80 rounded-xl p-4 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans leading-relaxed resize-y"
            />
          </div>

          {/* Category & Tags Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-indigo-500" />
                Kategori
              </label>
              <select
                id="select-note-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs text-slate-800 bg-white/80 border border-slate-200/80 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Tanpa Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                Tag (pisahkan koma)
              </label>
              <input
                type="text"
                id="input-note-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="misal: sprint, arsitektur, riset"
                className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-white/80 border border-slate-200/80 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-500" />
              Warna Kartu Catatan
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                    color === c.value ? 'scale-110 border-indigo-600 ring-2 ring-indigo-200' : c.border
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Optional Task / Schedule Linking */}
          {(tasks.length > 0 || schedules.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {tasks.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                    Tautkan ke Tugas (Opsional)
                  </label>
                  <select
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    className="w-full text-xs text-slate-800 bg-white/80 border border-slate-200/80 rounded-xl px-3 py-2"
                  >
                    <option value="">Tidak ada tautan tugas</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {schedules.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Tautkan ke Jadwal (Opsional)
                  </label>
                  <select
                    value={scheduleId}
                    onChange={(e) => setScheduleId(e.target.value)}
                    className="w-full text-xs text-slate-800 bg-white/80 border border-slate-200/80 rounded-xl px-3 py-2"
                  >
                    <option value="">Tidak ada tautan jadwal</option>
                    {schedules.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              id="btn-save-note"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : note ? 'Simpan Perubahan' : 'Buat Catatan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
