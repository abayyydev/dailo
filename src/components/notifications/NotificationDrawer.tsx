'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications, NotificationItem } from '@/context/NotificationContext';
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  Settings,
  Clock,
  CheckSquare,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Volume2,
  X,
} from 'lucide-react';

export function NotificationDrawer() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isDrawerOpen,
    toggleDrawer,
    toggleSettings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    sendTestNotification,
    browserPermission,
    requestBrowserPermission,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [testing, setTesting] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        toggleDrawer(false);
      }
    };
    if (isDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDrawerOpen, toggleDrawer]);

  if (!isDrawerOpen) return null;

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'unread') return !item.is_read;
    return true;
  });

  const formatRelativeTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} mnt lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return 'Kemarin';
      return `${diffDays} hari lalu`;
    } catch {
      return '';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'schedule_reminder':
        return <Clock className="w-4 h-4 text-indigo-600" />;
      case 'task_deadline':
        return <CheckSquare className="w-4 h-4 text-amber-600" />;
      case 'conflict_alert':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'schedule_reminder':
        return 'bg-indigo-50 border-indigo-100';
      case 'task_deadline':
        return 'bg-amber-50 border-amber-100';
      case 'conflict_alert':
        return 'bg-rose-50 border-rose-100';
      default:
        return 'bg-emerald-50 border-emerald-100';
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
    toggleDrawer(false);

    if (item.reference_type === 'schedule') {
      router.push('/schedule');
    } else if (item.reference_type === 'task') {
      router.push('/tasks');
    }
  };

  const handleTest = async () => {
    setTesting(true);
    await sendTestNotification();
    setTimeout(() => setTesting(false), 500);
  };

  return (
    <div
      ref={drawerRef}
      className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-900">Notifikasi</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white">
              {unreadCount} baru
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              title="Tandai semua dibaca"
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center gap-1 font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Tandai Dibaca</span>
            </button>
          )}

          <button
            onClick={() => {
              toggleDrawer(false);
              toggleSettings(true);
            }}
            title="Pengaturan Notifikasi"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleDrawer(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Browser Permission Alert Banner */}
      {browserPermission === 'default' && (
        <div className="bg-amber-50 border-b border-amber-100 p-3 flex items-start gap-2.5">
          <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-amber-900">
              Aktifkan Notifikasi Browser
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Dapatkan peringatan tepat waktu saat tab sedang di latar belakang.
            </p>
            <button
              onClick={() => requestBrowserPermission()}
              className="mt-1.5 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              Izinkan Notifikasi
            </button>
          </div>
        </div>
      )}

      {/* Tabs Filter */}
      <div className="flex border-b border-slate-100 px-3 pt-2 bg-white">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Semua ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'unread'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Belum Dibaca ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <BellOff className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              {activeTab === 'unread' ? 'Tidak ada notifikasi belum dibaca' : 'Belum ada notifikasi'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto">
              Semua jadwal dan tugas terpantau rapi. Pengingat akan muncul di sini.
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative ${
                !item.is_read ? 'bg-indigo-50/35 hover:bg-indigo-50/60' : 'hover:bg-slate-50'
              }`}
            >
              {/* Category/Type Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${getIconBg(
                  item.type
                )}`}
              >
                {getIcon(item.type)}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-1.5">
                  <p
                    className={`text-xs leading-snug truncate ${
                      !item.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                    }`}
                  >
                    {item.title}
                  </p>
                  {!item.is_read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatRelativeTime(item.created_at)}
                  </span>
                  {item.reference_type && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                      <ExternalLink className="w-2.5 h-2.5" />
                      {item.reference_type === 'schedule' ? 'Jadwal' : 'Task'}
                    </span>
                  )}
                </div>
              </div>

              {/* Delete Button on Hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(item.id);
                }}
                title="Hapus notifikasi"
                className="opacity-0 group-hover:opacity-100 absolute right-2.5 top-3.5 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={handleTest}
          disabled={testing}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{testing ? 'Menguji...' : 'Uji Coba Suara'}</span>
        </button>

        {notifications.some((n) => n.is_read) && (
          <button
            onClick={() => clearReadNotifications()}
            className="text-[11px] font-medium text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Bersihkan Terbaca
          </button>
        )}
      </div>
    </div>
  );
}
