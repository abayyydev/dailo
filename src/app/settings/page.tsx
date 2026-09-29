'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Lock,
  Palette,
  Bell,
  Database,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Globe,
  Clock,
  Shield,
  FileJson,
  FileText,
  ArrowRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'appearance' | 'notifications' | 'data';

interface NotificationPrefs {
  browser_enabled: boolean;
  in_app_enabled: boolean;
  sound_enabled: boolean;
  default_reminder_offset: number;
  remind_at_start: boolean;
  remind_before_end: boolean;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

// ─── Toast Component ──────────────────────────────────────────────────────────

function ToastNotification({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-medium animate-slide-up ${
        toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
      }`}
    >
      {toast.type === 'success' ? (
        <CheckCircle className="w-5 h-5 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 shrink-0" />
      )}
      {toast.message}
    </div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────

function TabBtn({
  id,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={`settings-tab-${id}`}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${
        active
          ? 'bg-indigo-50 text-indigo-700 shadow-xs'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
      {label}
    </button>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({ apiUrl, token, onToast }: { apiUrl: string; token: string; onToast: (t: Toast) => void }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'Asia/Jakarta');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [saving, setSaving] = useState(false);

  // Change password
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const timezones = [
    'Asia/Jakarta', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Shanghai',
    'Asia/Dubai', 'Asia/Kolkata', 'Europe/London', 'Europe/Paris',
    'Europe/Berlin', 'America/New_York', 'America/Chicago',
    'America/Denver', 'America/Los_Angeles', 'UTC',
  ];

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateProfile({ name, timezone });
      onToast({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err: any) {
      onToast({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      onToast({ type: 'error', message: 'Please fill in all password fields' });
      return;
    }
    if (newPw !== confirmPw) {
      onToast({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (newPw.length < 6) {
      onToast({ type: 'error', message: 'New password must be at least 6 characters' });
      return;
    }

    try {
      setChangingPw(true);
      const res = await fetch(`${apiUrl}/api/settings/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      onToast({ type: 'success', message: 'Password changed successfully!' });
    } catch (err: any) {
      onToast({ type: 'error', message: err.message });
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Info */}
      <div>
        <SectionHeader
          title="Profile Information"
          subtitle="Update your personal details and preferences"
        />

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-200 shrink-0">
            {name ? name.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-indigo-600 mt-1 font-medium">
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="profile-name">
              Display Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="profile-email">
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1 ml-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="profile-timezone">
              <Globe className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
              Timezone
            </label>
            <select
              id="profile-timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            id="save-profile-btn"
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-indigo-200"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Change Password */}
      <div>
        <SectionHeader
          title="Change Password"
          subtitle="Use a strong password that you don't use elsewhere"
        />
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="current-password">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="current-password"
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="new-password">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="confirm-password">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                className={`w-full px-3 py-2.5 rounded-xl border text-slate-800 text-sm focus:outline-none focus:ring-2 transition ${
                  confirmPw && newPw !== confirmPw
                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                    : 'border-slate-200 focus:ring-indigo-300 bg-white'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            id="change-password-btn"
            onClick={handleChangePassword}
            disabled={changingPw}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition"
          >
            {changingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {changingPw ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────

function AppearanceTab({ onToast }: { onToast: (t: Toast) => void }) {
  const { user, updateProfile } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(user?.theme || 'system');
  const [saving, setSaving] = useState(false);

  const themes = [
    { value: 'light' as const, label: 'Light', desc: 'Clean white interface', icon: Sun },
    { value: 'dark' as const, label: 'Dark', desc: 'Easy on the eyes', icon: Moon },
    { value: 'system' as const, label: 'System', desc: 'Follow OS setting', icon: Monitor },
  ];

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile({ theme });
      onToast({ type: 'success', message: 'Appearance settings saved!' });
    } catch (err: any) {
      onToast({ type: 'error', message: err.message || 'Failed to save appearance' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Appearance"
        subtitle="Customize how Time Planner looks on your device"
      />

      {/* Theme Selection */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-slate-700 mb-3">Color Theme</p>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              id={`theme-${value}-btn`}
              onClick={() => setTheme(value)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                theme === value
                  ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                theme === value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className={`font-semibold text-sm ${theme === value ? 'text-indigo-700' : 'text-slate-800'}`}>
                {label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              {theme === value && (
                <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Active
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-8 p-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Preview</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">Time Planner</p>
            <p className="text-xs text-slate-400">Web Edition · {theme === 'light' ? '☀️ Light' : theme === 'dark' ? '🌙 Dark' : '💻 System'} Mode</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {['Tasks', 'Schedule', 'Habits', 'Goals'].map((item) => (
            <div key={item} className="bg-white rounded-lg px-2 py-1.5 text-center border border-slate-100">
              <p className="text-xs font-medium text-slate-600">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          id="save-appearance-btn"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-indigo-200"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Appearance'}
        </button>
      </div>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab({ apiUrl, token, onToast }: { apiUrl: string; token: string; onToast: (t: Toast) => void }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    browser_enabled: true,
    in_app_enabled: true,
    sound_enabled: true,
    default_reminder_offset: 15,
    remind_at_start: true,
    remind_before_end: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/notifications/preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.preferences) setPrefs(data.preferences);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiUrl, token]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${apiUrl}/api/notifications/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(prefs),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      onToast({ type: 'success', message: 'Notification preferences saved!' });
    } catch (err: any) {
      onToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
      </div>
    );
  }

  const Toggle = ({ id, checked, onChange }: { id: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div>
      <SectionHeader
        title="Notification Preferences"
        subtitle="Control when and how you receive reminders"
      />

      <div className="space-y-4">
        {/* Browser */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Globe className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Browser Notifications</p>
              <p className="text-xs text-slate-400">Show native OS notifications</p>
            </div>
          </div>
          <Toggle
            id="toggle-browser"
            checked={prefs.browser_enabled}
            onChange={(v) => setPrefs({ ...prefs, browser_enabled: v })}
          />
        </div>

        {/* In-App */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">In-App Notifications</p>
              <p className="text-xs text-slate-400">Show alerts inside the app</p>
            </div>
          </div>
          <Toggle
            id="toggle-inapp"
            checked={prefs.in_app_enabled}
            onChange={(v) => setPrefs({ ...prefs, in_app_enabled: v })}
          />
        </div>

        {/* Sound */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Sound Effects</p>
              <p className="text-xs text-slate-400">Play audio on reminders</p>
            </div>
          </div>
          <Toggle
            id="toggle-sound"
            checked={prefs.sound_enabled}
            onChange={(v) => setPrefs({ ...prefs, sound_enabled: v })}
          />
        </div>

        {/* Remind At Start */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Remind at Start</p>
              <p className="text-xs text-slate-400">Notify when an activity begins</p>
            </div>
          </div>
          <Toggle
            id="toggle-at-start"
            checked={prefs.remind_at_start}
            onChange={(v) => setPrefs({ ...prefs, remind_at_start: v })}
          />
        </div>

        {/* Default Offset */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-sm font-semibold text-slate-800 mb-1">Default Reminder Offset</p>
          <p className="text-xs text-slate-400 mb-3">How many minutes before an activity to send reminder</p>
          <div className="flex items-center gap-3">
            <input
              id="reminder-offset"
              type="range"
              min="0"
              max="60"
              step="5"
              value={prefs.default_reminder_offset}
              onChange={(e) => setPrefs({ ...prefs, default_reminder_offset: parseInt(e.target.value) })}
              className="flex-1 accent-indigo-600"
            />
            <span className="w-16 text-center text-sm font-bold text-indigo-600 bg-indigo-50 py-1 rounded-lg border border-indigo-100">
              {prefs.default_reminder_offset} min
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-300 mt-1 px-0.5">
            <span>0</span><span>15</span><span>30</span><span>45</span><span>60</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          id="save-notifications-btn"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-indigo-200"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

// ─── Data Tab ─────────────────────────────────────────────────────────────────

function DataTab({ apiUrl, token, onToast }: { apiUrl: string; token: string; onToast: (t: Toast) => void }) {
  const [exporting, setExporting] = useState<'json' | 'csv' | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setExporting(format);
      const res = await fetch(`${apiUrl}/api/settings/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const contentDisposition = res.headers.get('content-disposition') || '';
      const match = contentDisposition.match(/filename="(.+)"/);
      const filename = match ? match[1] : `timeplanner_export.${format}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      onToast({ type: 'success', message: `${format.toUpperCase()} export downloaded successfully!` });
    } catch (err: any) {
      onToast({ type: 'error', message: err.message || 'Export failed' });
    } finally {
      setExporting(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setImportResult(null);

      const text = await file.text();
      let payload: any;

      try {
        payload = JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON file. Please upload a valid Time Planner backup file.');
      }

      const res = await fetch(`${apiUrl}/api/settings/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      setImportResult(data.summary);
      onToast({ type: 'success', message: 'Data imported successfully!' });
    } catch (err: any) {
      onToast({ type: 'error', message: err.message });
    } finally {
      setImporting(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div>
      <SectionHeader
        title="Data Management"
        subtitle="Export your data for backup or move it to another device"
      />

      {/* Export Section */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Download className="w-4 h-4 text-slate-400" />
          Export Your Data
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* JSON Export */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
              <FileJson className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="font-bold text-slate-800 mb-1">Full Backup (JSON)</p>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Export all your data including tasks, schedules, habits, goals, notes, and categories in a complete JSON backup.
            </p>
            <button
              id="export-json-btn"
              onClick={() => handleExport('json')}
              disabled={exporting !== null}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition"
            >
              {exporting === 'json' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
              ) : (
                <><Download className="w-4 h-4" /> Export JSON</>
              )}
            </button>
          </div>

          {/* CSV Export */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="font-bold text-slate-800 mb-1">Tasks (CSV)</p>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Export your tasks as a spreadsheet-compatible CSV file. Ideal for analysis in Excel or Google Sheets.
            </p>
            <button
              id="export-csv-btn"
              onClick={() => handleExport('csv')}
              disabled={exporting !== null}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition"
            >
              {exporting === 'csv' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
              ) : (
                <><Download className="w-4 h-4" /> Export CSV</>
              )}
            </button>
          </div>
        </div>
      </div>

      <hr className="border-slate-100 mb-8" />

      {/* Import Section */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
          <Upload className="w-4 h-4 text-slate-400" />
          Import Data
        </p>
        <p className="text-xs text-slate-400 mb-4">
          Restore from a previously exported JSON backup. Existing records will be updated, no duplicates created.
        </p>

        <label
          htmlFor="import-file"
          className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
            importing
              ? 'border-indigo-300 bg-indigo-50'
              : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40'
          }`}
        >
          {importing ? (
            <>
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm font-medium text-indigo-600">Importing data...</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                <Upload className="w-7 h-7 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">Click to upload backup file</p>
                <p className="text-xs text-slate-400 mt-0.5">Supports .json files only</p>
              </div>
            </>
          )}
        </label>
        <input
          id="import-file"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
          disabled={importing}
        />

        {/* Import Result */}
        {importResult && (
          <div className="mt-5 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Import completed successfully
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Categories', count: importResult.categories_imported },
                { label: 'Tasks', count: importResult.tasks_imported },
                { label: 'Notes', count: importResult.notes_imported },
                { label: 'Habits', count: importResult.habits_imported },
                { label: 'Goals', count: importResult.goals_imported },
              ].map(({ label, count }) => (
                <div key={label} className="bg-white rounded-xl p-2.5 text-center border border-emerald-100">
                  <p className="text-lg font-bold text-emerald-700">{count}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            {importResult.errors?.length > 0 && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs font-semibold text-amber-700 mb-1">{importResult.errors.length} item(s) skipped:</p>
                {importResult.errors.slice(0, 3).map((err: string, i: number) => (
                  <p key={i} className="text-xs text-amber-600">• {err}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <hr className="border-slate-100 my-8" />

        {/* Legal & Policy Section */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            Legal & Kebijakan Layanan
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Pelajari komitmen privasi keamanan data Anda dan syarat ketentuan penggunaan dailo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Privacy Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="font-bold text-slate-800 mb-1">Kebijakan Privasi</p>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Pelajari bagaimana kami mengumpulkan, mengenkripsi, dan melindungi data pribadi Anda tanpa pernah menjualnya ke pihak ketiga.
                </p>
              </div>
              <Link
                href="/privacy"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 hover:border-indigo-200 transition"
              >
                <span>Buka Dokumen Privasi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Terms Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-slate-200/80 transition-colors">
                  <FileText className="w-6 h-6 text-slate-700" />
                </div>
                <p className="font-bold text-slate-800 mb-1">Syarat & Ketentuan (T&C)</p>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Ketahui hak, tanggung jawab akun, integritas penggunaan wajar (fair use), dan batasan layanan aplikasi dailo.
                </p>
              </div>
              <Link
                href="/terms"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 hover:border-indigo-200 transition"
              >
                <span>Buka Dokumen T&C</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, token, isAuthenticated, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [toast, setToast] = useState<Toast | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const onToast = useCallback((t: Toast) => {
    setToast(t);
  }, []);

  if (!isAuthenticated || !user || !token) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Sign In Required</h2>
          <p className="text-slate-500 text-sm mb-5">You need to be logged in to access settings.</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Backup', icon: Database },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 md:pb-0">
        <Header />

        <div className="flex-1 bg-slate-50">
          {/* Page Header */}
          <div className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 sm:py-5">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
              <p className="text-slate-400 text-sm mt-0.5">Manage your account, appearance, and data</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-3 sm:px-8 py-4 sm:py-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
              {/* Sidebar Nav */}
              <aside className="w-full md:w-52 shrink-0">
                <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 sticky top-8">
                  {tabs.map((tab) => (
                    <TabBtn
                      key={tab.id}
                      id={tab.id}
                      label={tab.label}
                      icon={tab.icon}
                      active={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                    />
                  ))}

                  <div className="hidden md:block my-2 border-t border-slate-100" />

                  <Link
                    href="/privacy"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>Kebijakan Privasi</span>
                  </Link>

                  <Link
                    href="/terms"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Syarat & Ketentuan</span>
                  </Link>
                </nav>
              </aside>

              {/* Content Area */}
              <main className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-7">
                {activeTab === 'profile' && (
                  <ProfileTab apiUrl={apiUrl} token={token} onToast={onToast} />
                )}
                {activeTab === 'appearance' && (
                  <AppearanceTab onToast={onToast} />
                )}
                {activeTab === 'notifications' && (
                  <NotificationsTab apiUrl={apiUrl} token={token} onToast={onToast} />
                )}
                {activeTab === 'data' && (
                  <DataTab apiUrl={apiUrl} token={token} onToast={onToast} />
                )}
              </main>
            </div>
          </div>

          {/* Toast */}
          {toast && (
            <ToastNotification
              toast={toast}
              onDismiss={() => setToast(null)}
            />
          )}

          {/* Slide-up animation */}
          <style>{`
            @keyframes slide-up {
              from { transform: translateY(16px); opacity: 0; }
              to   { transform: translateY(0);   opacity: 1; }
            }
            .animate-slide-up { animation: slide-up 0.25s ease-out forwards; }
          `}</style>
        </div>
        <Footer />
      </div>
    </div>
  );
}
