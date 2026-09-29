'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications, NotificationPreferences } from '@/context/NotificationContext';
import {
  X,
  Bell,
  Volume2,
  Clock,
  Shield,
  Save,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export function NotificationSettingsModal() {
  const {
    preferences,
    isSettingsOpen,
    toggleSettings,
    updatePreferences,
    browserPermission,
    requestBrowserPermission,
    playChime,
    sendTestNotification,
  } = useNotifications();

  const [formData, setFormData] = useState<Partial<NotificationPreferences>>({
    browser_enabled: true,
    in_app_enabled: true,
    sound_enabled: true,
    default_reminder_offset: 15,
    remind_at_start: true,
    remind_before_end: false,
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormData({
        browser_enabled: Boolean(preferences.browser_enabled),
        in_app_enabled: Boolean(preferences.in_app_enabled),
        sound_enabled: Boolean(preferences.sound_enabled),
        default_reminder_offset: Number(preferences.default_reminder_offset) || 15,
        remind_at_start: Boolean(preferences.remind_at_start),
        remind_before_end: Boolean(preferences.remind_before_end),
      });
    }
  }, [preferences]);

  if (!isSettingsOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updatePreferences(formData);
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      toggleSettings(false);
    }, 800);
  };

  const offsetOptions = [
    { value: 5, label: '5 Menit' },
    { value: 10, label: '10 Menit' },
    { value: 15, label: '15 Menit (Standar)' },
    { value: 30, label: '30 Menit' },
    { value: 60, label: '1 Jam' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pengaturan Notifikasi & Pengingat</h2>
              <p className="text-[11px] text-slate-500">Sesuaikan waktu dan cara Anda menerima pengingat</p>
            </div>
          </div>

          <button
            onClick={() => toggleSettings(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Section 1: Browser Push Notifications */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Notifikasi Browser Desktop</h4>
                  <p className="text-[11px] text-slate-500">Peringatan sistem saat tab berada di latar belakang</p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  browserPermission === 'granted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : browserPermission === 'denied'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {browserPermission === 'granted'
                  ? 'Diizinkan'
                  : browserPermission === 'denied'
                  ? 'Diblokir Browser'
                  : 'Belum Diizinkan'}
              </span>
            </div>

            {browserPermission !== 'granted' && (
              <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                <span className="text-[11px] text-slate-600">Perlu izin browser:</span>
                <button
                  type="button"
                  onClick={() => requestBrowserPermission()}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Minta Izin Browser
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-700 font-medium">Aktifkan Notifikasi Desktop</span>
              <input
                type="checkbox"
                checked={Boolean(formData.browser_enabled)}
                onChange={(e) =>
                  setFormData({ ...formData, browser_enabled: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 2: Audio Chime */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Efek Suara Audio Lonceng</h4>
                  <p className="text-[11px] text-slate-500">Bunyi lonceng lembut saat ada pengingat baru</p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={Boolean(formData.sound_enabled)}
                onChange={(e) =>
                  setFormData({ ...formData, sound_enabled: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
              <span className="text-[11px] text-slate-500">Pratinjau nada lonceng:</span>
              <button
                type="button"
                onClick={() => playChime()}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <Volume2 className="w-3 h-3" />
                <span>Tes Bunyi Suara</span>
              </button>
            </div>
          </div>

          {/* Section 3: Default Reminder Offset */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <label className="text-xs font-bold text-slate-800">
                Waktu Pengingat Standar (Sebelum Aktivitas Mulai)
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {offsetOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, default_reminder_offset: opt.value })
                  }
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                    formData.default_reminder_offset === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Automatic Triggers */}
          <div className="space-y-2.5 pt-1">
            <label className="text-xs font-bold text-slate-800 block">
              Pemicu Pengingat Tambahan
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(formData.remind_at_start)}
                onChange={(e) =>
                  setFormData({ ...formData, remind_at_start: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Ingatkan tepat saat waktu aktivitas dimulai</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(formData.remind_before_end)}
                onChange={(e) =>
                  setFormData({ ...formData, remind_before_end: e.target.checked })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Ingatkan 10 menit sebelum aktivitas selesai (persiapan wrap-up)</span>
            </label>
          </div>

          {/* Test Trigger */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Uji coba simulasi lengkap:</span>
            <button
              type="button"
              onClick={() => sendTestNotification()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kirim Notifikasi Uji Coba</span>
            </button>
          </div>

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => toggleSettings(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
