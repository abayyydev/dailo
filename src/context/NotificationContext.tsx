'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'schedule_reminder' | 'task_deadline' | 'conflict_alert' | 'system';
  reference_id: string | null;
  reference_type: 'schedule' | 'task' | 'system' | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  browser_enabled: boolean;
  in_app_enabled: boolean;
  sound_enabled: boolean;
  default_reminder_offset: number;
  remind_at_start: boolean;
  remind_before_end: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  browserPermission: NotificationPermission;
  isDrawerOpen: boolean;
  isSettingsOpen: boolean;
  isLoading: boolean;
  toggleDrawer: (open?: boolean) => void;
  toggleSettings: (open?: boolean) => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearReadNotifications: () => Promise<void>;
  updatePreferences: (newPrefs: Partial<NotificationPreferences>) => Promise<void>;
  sendTestNotification: () => Promise<void>;
  requestBrowserPermission: () => Promise<NotificationPermission>;
  playChime: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const checkDueIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play synthesized chime using Web Audio API
  const playChime = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Note 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.35);

      // Note 2: B5 (987.77 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (err) {
      console.warn('Audio chime playback omitted or blocked:', err);
    }
  }, []);

  // Check initial browser permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  // Request browser permission
  const requestBrowserPermission = async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      return permission;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return 'denied';
    }
  };

  // Trigger native browser notification
  const triggerBrowserNotification = useCallback(
    (title: string, body: string) => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission === 'granted' && (preferences?.browser_enabled ?? true)) {
        try {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
          });
        } catch (e) {
          console.warn('Browser notification error:', e);
        }
      }
    },
    [preferences?.browser_enabled]
  );

  // Fetch notifications list
  const fetchNotifications = useCallback(async () => {
    if (!token || !isAuthenticated) return;
    try {
      const res = await fetch(`${apiUrl}/api/notifications?limit=40`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [token, isAuthenticated, apiUrl]);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!token || !isAuthenticated) return;
    try {
      const res = await fetch(`${apiUrl}/api/notifications/preferences`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPreferences(data.preferences || null);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  }, [token, isAuthenticated, apiUrl]);

  // Mark single notification as read
  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));

      await fetch(`${apiUrl}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      fetchNotifications();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);

      await fetch(`${apiUrl}/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      fetchNotifications();
    }
  };

  // Delete single notification
  const deleteNotification = async (id: string) => {
    if (!token) return;
    try {
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.is_read) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }

      await fetch(`${apiUrl}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
      fetchNotifications();
    }
  };

  // Clear all read notifications
  const clearReadNotifications = async () => {
    if (!token) return;
    try {
      setNotifications((prev) => prev.filter((n) => !n.is_read));

      await fetch(`${apiUrl}/api/notifications`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to clear read notifications:', err);
      fetchNotifications();
    }
  };

  // Update preferences
  const updatePreferences = async (newPrefs: Partial<NotificationPreferences>) => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPrefs),
      });
      if (!res.ok) return;
      const data = await res.json();
      setPreferences(data.preferences);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/notifications/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notification) {
          setNotifications((prev) => [data.notification, ...prev]);
          setUnreadCount((c) => c + 1);

          // Play sound if enabled
          if (preferences?.sound_enabled ?? true) {
            playChime();
          }

          // Trigger native notification
          triggerBrowserNotification(
            data.notification.title,
            data.notification.message
          );
        }
      }
    } catch (err) {
      console.error('Failed to send test notification:', err);
    }
  };

  // Check due reminders (polling)
  const checkDueReminders = useCallback(async () => {
    if (!token || !isAuthenticated) return;
    try {
      const res = await fetch(`${apiUrl}/api/reminders/check-due`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.due_reminders && data.due_reminders.length > 0) {
        fetchNotifications();

        if (preferences?.sound_enabled ?? true) {
          playChime();
        }

        for (const due of data.due_reminders) {
          triggerBrowserNotification(due.title, due.message);
        }
      }
    } catch (err) {
      console.warn('Error checking due reminders:', err);
    }
  }, [token, isAuthenticated, apiUrl, fetchNotifications, preferences?.sound_enabled, playChime, triggerBrowserNotification]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchNotifications();
      fetchPreferences();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setPreferences(null);
    }
  }, [isAuthenticated, token, fetchNotifications, fetchPreferences]);

  // Polling interval every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Run first check after 3s
    const firstTimer = setTimeout(() => {
      checkDueReminders();
    }, 3000);

    checkDueIntervalRef.current = setInterval(() => {
      checkDueReminders();
    }, 30000);

    return () => {
      clearTimeout(firstTimer);
      if (checkDueIntervalRef.current) {
        clearInterval(checkDueIntervalRef.current);
      }
    };
  }, [isAuthenticated, token, checkDueReminders]);

  const toggleDrawer = (open?: boolean) => {
    setIsDrawerOpen((prev) => (open !== undefined ? open : !prev));
  };

  const toggleSettings = (open?: boolean) => {
    setIsSettingsOpen((prev) => (open !== undefined ? open : !prev));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        browserPermission,
        isDrawerOpen,
        isSettingsOpen,
        isLoading,
        toggleDrawer,
        toggleSettings,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearReadNotifications,
        updatePreferences,
        sendTestNotification,
        requestBrowserPermission,
        playChime,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
