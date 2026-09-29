'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { NoteModal, NoteData } from '@/components/notes/NoteModal';
import {
  StickyNote,
  Plus,
  Search,
  Pin,
  Tag,
  Folder,
  Calendar,
  Trash2,
  Edit2,
  CheckSquare,
  Clock,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface NoteItem {
  id: string;
  user_id: string;
  category_id: string | null;
  task_id: string | null;
  schedule_id: string | null;
  title: string;
  content: string;
  color: string;
  is_pinned: boolean;
  tags: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string | null;
  category_color?: string | null;
  category_icon?: string | null;
  task_title?: string | null;
  schedule_title?: string | null;
}

export default function NotesPage() {
  const { token, isAuthenticated } = useAuth();

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<{ id: string; title: string }[]>([]);
  const [schedules, setSchedules] = useState<{ id: string; title: string }[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<'updated_at' | 'created_at' | 'title'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Fetch categories, tasks, schedules for forms
  const fetchMeta = useCallback(async () => {
    if (!token) return;
    try {
      const [catRes, taskRes, schedRes] = await Promise.all([
        fetch(`${apiUrl}/api/categories`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/api/schedules`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
      if (taskRes.ok) {
        const taskData = await taskRes.json();
        setTasks((taskData.tasks || []).map((t: any) => ({ id: t.id, title: t.title })));
      }
      if (schedRes.ok) {
        const schedData = await schedRes.json();
        setSchedules((schedData.schedules || []).map((s: any) => ({ id: s.id, title: s.title })));
      }
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  }, [token, apiUrl]);

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      let url = `${apiUrl}/api/notes?sort_by=${sortBy}&order=${sortOrder}`;
      if (selectedCategory) url += `&category_id=${encodeURIComponent(selectedCategory)}`;
      if (selectedTag) url += `&tag=${encodeURIComponent(selectedTag)}`;
      if (searchTerm.trim()) url += `&search=${encodeURIComponent(searchTerm.trim())}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal mengambil daftar catatan');
      const data = await res.json();
      setNotes(data.notes || []);
      setTags(data.tags || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, [token, sortBy, sortOrder, selectedCategory, selectedTag, searchTerm, apiUrl]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMeta();
      fetchNotes();
    }
  }, [isAuthenticated, fetchMeta, fetchNotes]);

  const handleSaveNote = async (noteData: NoteData) => {
    if (!token) return;
    const isEdit = !!noteData.id;
    const url = isEdit
      ? `${apiUrl}/api/notes/${noteData.id}`
      : `${apiUrl}/api/notes`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(noteData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal menyimpan catatan');
    }

    fetchNotes();
  };

  const handleTogglePin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/notes/${id}/pin`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchNotes();
      }
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    if (!window.confirm('Yakin ingin menghapus catatan ini?')) return;
    try {
      const res = await fetch(`${apiUrl}/api/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchNotes();
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const openEditModal = (note: NoteItem) => {
    setEditingNote({
      id: note.id,
      title: note.title,
      content: note.content,
      category_id: note.category_id,
      task_id: note.task_id,
      schedule_id: note.schedule_id,
      color: note.color,
      is_pinned: note.is_pinned,
      tags: note.tags,
    });
    setModalOpen(true);
  };

  // Group notes into Pinned and Other
  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const otherNotes = notes.filter((n) => !n.is_pinned);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 md:pb-0">
        <Header />

        <main className="p-3.5 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
          {/* Top Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-amber-100">
                <StickyNote className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Catatan & Gagasan
                </h1>
                <p className="text-sm text-slate-500">
                  Dokumentasikan ringkasan meeting, arsitektur teknis, dan ide produktivitas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="btn-create-note"
                onClick={openCreateModal}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                Catatan Baru
              </button>
            </div>
          </div>

          {/* Advanced Filter & Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="input-search-notes"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari dalam judul, teks, atau tag..."
                className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Filters Group */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                <Folder className="w-3.5 h-3.5 text-slate-400" />
                <select
                  id="filter-note-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-hidden text-xs"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorting Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  id="select-sort-notes"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [col, dir] = e.target.value.split('-');
                    setSortBy(col as any);
                    setSortOrder(dir as any);
                  }}
                  className="bg-transparent text-slate-700 font-medium focus:outline-hidden text-xs"
                >
                  <option value="updated_at-desc">Terakhir Diperbarui</option>
                  <option value="created_at-desc">Terbaru Dibuat</option>
                  <option value="title-asc">Judul (A–Z)</option>
                  <option value="title-desc">Judul (Z–A)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tag Chips Bar */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                Tag:
              </span>
              <button
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1 rounded-lg transition-all font-medium shrink-0 ${
                  selectedTag === ''
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Semua ({notes.length})
              </button>
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(selectedTag === t ? '' : t)}
                  className={`px-3 py-1 rounded-lg transition-all font-medium shrink-0 flex items-center gap-1 ${
                    selectedTag === t
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}

          {/* Section 1: Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                Catatan Tersemat ({pinnedNotes.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pinnedNotes.map((n) => (
                  <NoteCard
                    key={n.id}
                    note={n}
                    onEdit={() => openEditModal(n)}
                    onTogglePin={(e) => handleTogglePin(n.id, e)}
                    onDelete={(e) => handleDeleteNote(n.id, e)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Other Notes */}
          <div className="space-y-4">
            {pinnedNotes.length > 0 && otherNotes.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Catatan Lainnya ({otherNotes.length})
              </div>
            )}
            {otherNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherNotes.map((n) => (
                  <NoteCard
                    key={n.id}
                    note={n}
                    onEdit={() => openEditModal(n)}
                    onTogglePin={(e) => handleTogglePin(n.id, e)}
                    onDelete={(e) => handleDeleteNote(n.id, e)}
                  />
                ))}
              </div>
            ) : pinnedNotes.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                <StickyNote className="w-12 h-12 text-slate-300 stroke-[1.5] mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  {searchTerm || selectedCategory || selectedTag
                    ? 'Tidak ada catatan yang cocok dengan filter'
                    : 'Belum ada catatan'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Catat ide, notula rapat, atau rangkuman bacaan untuk mendukung produktivitas kerja Anda.
                </p>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Buat Catatan Pertama
                </button>
              </div>
            ) : null}
          </div>
        </main>
        <Footer />
      </div>

      {/* Note Modal Dialog */}
      <NoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveNote}
        note={editingNote}
        categories={categories}
        tasks={tasks}
        schedules={schedules}
      />
    </div>
  );
}

function NoteCard({
  note,
  onEdit,
  onTogglePin,
  onDelete,
}: {
  note: NoteItem;
  onEdit: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const cardBg = note.color && note.color !== '#ffffff' ? note.color : '#ffffff';

  return (
    <div
      onClick={onEdit}
      style={{ backgroundColor: cardBg }}
      className="p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative min-h-[200px]"
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          {note.category_name ? (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-[150px]"
              style={{
                backgroundColor: `${note.category_color || '#4f46e5'}20`,
                color: note.category_color || '#4f46e5',
              }}
            >
              {note.category_name}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              Umum
            </span>
          )}

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onTogglePin}
              className={`p-1 rounded-lg transition-colors ${
                note.is_pinned
                  ? 'text-amber-600 hover:bg-amber-100/60'
                  : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100/60 opacity-0 group-hover:opacity-100'
              }`}
              title={note.is_pinned ? 'Lepas Sematan' : 'Sematkan'}
            >
              <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'fill-amber-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100/60 opacity-0 group-hover:opacity-100 transition-all"
              title="Edit Catatan"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50/60 opacity-0 group-hover:opacity-100 transition-all"
              title="Hapus Catatan"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {note.title}
        </h3>

        {/* Content Snippet */}
        <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed whitespace-pre-line font-sans">
          {note.content}
        </p>
      </div>

      {/* Card Footer */}
      <div className="pt-4 mt-3 border-t border-slate-900/5 flex flex-col gap-2">
        {/* Linked Task / Schedule */}
        {(note.task_title || note.schedule_title) && (
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            {note.task_title && (
              <span className="flex items-center gap-1 bg-white/70 px-2 py-0.5 rounded border border-slate-200/50 truncate">
                <CheckSquare className="w-3 h-3 text-indigo-500 shrink-0" />
                {note.task_title}
              </span>
            )}
            {note.schedule_title && (
              <span className="flex items-center gap-1 bg-white/70 px-2 py-0.5 rounded border border-slate-200/50 truncate">
                <Clock className="w-3 h-3 text-sky-500 shrink-0" />
                {note.schedule_title}
              </span>
            )}
          </div>
        )}

        {/* Tags and Date */}
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1 flex-wrap">
            {note.tags &&
              note.tags.split(',').slice(0, 3).map((t, idx) => (
                <span
                  key={idx}
                  className="bg-white/70 border border-slate-200/60 px-1.5 py-0.2 rounded text-slate-600"
                >
                  #{t.trim()}
                </span>
              ))}
          </div>
          <span>
            {new Date(note.updated_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
