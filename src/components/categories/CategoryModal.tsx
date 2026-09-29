'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Tag, Plus, Loader2, Sparkles, Folder, Briefcase, BookOpen, HeartPulse, User, Flame, ShoppingBag, Code2 } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: (category: any) => void;
}

const COLOR_PRESETS = [
  { label: 'Indigo', value: '#4F46E5' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Sky', value: '#0EA5E9' },
  { label: 'Teal', value: '#14B8A6' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Rose', value: '#F43F5E' },
  { label: 'Purple', value: '#A855F7' },
];

const ICON_PRESETS = [
  { name: 'folder', Icon: Folder },
  { name: 'briefcase', Icon: Briefcase },
  { name: 'book-open', Icon: BookOpen },
  { name: 'heart-pulse', Icon: HeartPulse },
  { name: 'user', Icon: User },
  { name: 'flame', Icon: Flame },
  { name: 'shopping-bag', Icon: ShoppingBag },
  { name: 'code', Icon: Code2 },
];

export function CategoryModal({ isOpen, onClose, onCategoryCreated }: CategoryModalProps) {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [icon, setIcon] = useState('folder');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${apiUrl}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), color, icon }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create category');
      }

      onCategoryCreated(data.category);
      setName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Tambah Kategori Baru</h3>
              <p className="text-xs text-slate-500">Kelompokkan task dan jadwal berdasarkan topik</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Nama Kategori</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Project Alpha, Keuangan, dsb."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
            />
          </div>

          {/* Color Picker Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Pilih Warna</label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setColor(p.value)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                    color === p.value ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: p.value }}
                  title={p.label}
                />
              ))}
            </div>
          </div>

          {/* Icon Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Pilih Ikon</label>
            <div className="grid grid-cols-4 gap-2">
              {ICON_PRESETS.map(({ name: iconName, Icon }) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    icon === iconName
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] capitalize">{iconName.replace('-', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-200 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Simpan Kategori</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
