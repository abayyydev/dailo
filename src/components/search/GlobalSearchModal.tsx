'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  X,
  StickyNote,
  CheckSquare,
  Clock,
  Flame,
  Target,
  ArrowRight,
  Sparkles,
  Command,
} from 'lucide-react';

interface SearchResultItem {
  id: string;
  type: 'note' | 'task' | 'schedule' | 'habit' | 'goal';
  type_label: string;
  title: string;
  snippet: string;
  category_name?: string | null;
  category_color?: string | null;
  badge: string;
  url: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'notes', label: 'Catatan' },
  { id: 'tasks', label: 'Tugas' },
  { id: 'schedules', label: 'Jadwal' },
  { id: 'habits', label: 'Kebiasaan' },
  { id: 'goals', label: 'Sasaran' },
];

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!token || !isOpen) return;

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `${apiUrl}/api/search?q=${encodeURIComponent(query.trim())}&type=${selectedType}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data.items || []);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Error during global search:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query, selectedType, token, isOpen, apiUrl]);

  if (!isOpen) return null;

  const handleSelect = (item: SearchResultItem) => {
    onClose();
    router.push(item.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <StickyNote className="w-4 h-4 text-amber-500" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-indigo-500" />;
      case 'schedule':
        return <Clock className="w-4 h-4 text-sky-500" />;
      case 'habit':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'goal':
        return <Target className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200/80 gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="input-global-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tugas, agenda jadwal, catatan, habit, atau target sasaran..."
            className="w-full text-base text-slate-900 placeholder:text-slate-400 bg-transparent border-none focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 bg-white overflow-x-auto text-xs">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedType === tab.id
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 flex-1 max-h-96 divide-y divide-slate-50">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <span className="inline-block animate-spin mr-2">⏳</span>
              Mencari di seluruh database Time Planner...
            </div>
          ) : query.trim() === '' ? (
            <div className="p-8 text-center text-slate-400 space-y-1">
              <Command className="w-8 h-8 stroke-[1.5] mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-600">Pencarian Universal Cepat</p>
              <p className="text-[11px] text-slate-400">
                Ketikkan kata kunci (misal: &lsquo;sprint&rsquo;, &lsquo;arsitektur&rsquo;, &lsquo;buku&rsquo;, &lsquo;review&rsquo;)
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs text-slate-600">
                Tidak ada hasil ditemukan untuk &ldquo;<strong>{query}</strong>&rdquo;
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Coba gunakan kata kunci lain atau pilih tab &ldquo;Semua&rdquo;
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3.5 py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/90 border border-indigo-100 shadow-xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </span>
                        {item.category_name && (
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md"
                            style={{
                              backgroundColor: `${item.category_color}18`,
                              color: item.category_color || '#4f46e5',
                            }}
                          >
                            {item.category_name}
                          </span>
                        )}
                      </div>
                      {item.snippet && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.snippet}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                      {item.badge}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer / Shortcut Helper */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 mr-1">
                ↑↓
              </kbd>
              Pilih item
            </span>
            <span>
              <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 mr-1">
                ↵
              </kbd>
              Buka navigasi
            </span>
          </div>
          <span>Total {results.length} hasil</span>
        </div>
      </div>
    </div>
  );
}
