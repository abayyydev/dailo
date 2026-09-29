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

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type?: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  browserPermission: NotificationPermission;
  isDrawerOpen: boolean;
  isSettingsOpen: boolean;
  isLoading: boolean;
  activeToast: ToastNotification | null;
  dismissToast: () => void;
  showInAppToast: (item: { id?: string; title: string; message: string; type?: string }) => void;
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
  const { user, token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<ToastNotification | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const checkDueIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const showInAppToast = useCallback(
    (item: { id?: string; title: string; message: string; type?: string }) => {
      setActiveToast({
        id: item.id || String(Date.now()),
        title: item.title,
        message: item.message,
        type: item.type,
      });
    },
    []
  );

  // Play synthesized chime using Web Audio API
  const playChime = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Note 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
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
      gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (err) {
      console.warn('Audio chime playback omitted or blocked:', err);
    }
  }, []);

  // Check initial permission (Web + Native Capacitor)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setBrowserPermission(Notification.permission);
      }
      import('@capacitor/core')
        .then(({ Capacitor }) => {
          if (Capacitor.isNativePlatform()) {
            import('@capacitor/local-notifications')
              .then(({ LocalNotifications }) => {
                LocalNotifications.checkPermissions()
                  .then((status) => {
                    if (status.display === 'granted') {
                      setBrowserPermission('granted');
                    }
                  })
                  .catch(() => {});
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, []);

  // Request browser & mobile permission
  const requestBrowserPermission = async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined') return 'denied';

    // 1. Capacitor Native Platform (Android / iOS)
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const res = await LocalNotifications.requestPermissions();
        try {
          await LocalNotifications.createChannel({
            id: 'dailo-reminders',
            name: 'Pengingat Dailo',
            description: 'Notifikasi pengingat jadwal dan deadline tugas',
            importance: 5,
            visibility: 1,
            vibration: true,
          });
        } catch (_) {}
        const perm: NotificationPermission = res.display === 'granted' ? 'granted' : 'denied';
        setBrowserPermission(perm);
        return perm;
      }
    } catch (e) {
      console.warn('Capacitor permission request fallback:', e);
    }

    // 2. Web Browser
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setBrowserPermission(permission);
        return permission;
      } catch (err) {
        console.error('Error requesting notification permission:', err);
        return 'denied';
      }
    }

    return 'denied';
  };

  // Trigger universal notification (In-App Toast + Audio + Mobile Native + Web Push)
  const triggerNotification = useCallback(
    async (title: string, body: string, id?: string) => {
      // 1. ALWAYS trigger In-App Toast (visual feedback for user in web & mobile view)
      setActiveToast({
        id: id || String(Date.now()),
        title,
        message: body,
      });

      // 2. Play Audio Chime
      if (preferences?.sound_enabled ?? true) {
        playChime();
      }

      // 3. Native Android / Capacitor Status Bar Notification
      try {
        if (typeof window !== 'undefined') {
          const { Capacitor } = await import('@capacitor/core');
          if (Capacitor.isNativePlatform()) {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            const perm = await LocalNotifications.checkPermissions();
            if (perm.display !== 'granted') {
              await LocalNotifications.requestPermissions();
            }
            try {
              await LocalNotifications.createChannel({
                id: 'dailo-reminders',
                name: 'Pengingat Dailo',
                description: 'Notifikasi pengingat jadwal dan deadline tugas',
                importance: 5,
                visibility: 1,
                vibration: true,
              });
            } catch (_) {}

            await LocalNotifications.schedule({
              notifications: [
                {
                  id: Math.floor(Math.random() * 1000000) + 1,
                  title,
                  body,
                  channelId: 'dailo-reminders',
                  schedule: { at: new Date(Date.now() + 100) },
                  sound: undefined,
                  actionTypeId: '',
                  extra: null,
                },
              ],
            });
            return;
          }
        }
      } catch (capErr) {
        console.warn('Capacitor native notification skipped:', capErr);
      }

      // 4. Web Browser Desktop / Mobile PWA Notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted' && (preferences?.browser_enabled ?? true)) {
          try {
            let swReg: ServiceWorkerRegistration | null = null;
            if ('serviceWorker' in navigator) {
              try {
                swReg = await Promise.race([
                  navigator.serviceWorker.ready,
                  new Promise<null>((resolve) => setTimeout(() => resolve(null), 800)),
                ]);
              } catch (_) {}
            }

            if (swReg && typeof swReg.showNotification === 'function') {
              await swReg.showNotification(title, {
                body,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                tag: id || 'dailo-notif',
              });
              return;
            }

            if (typeof Notification === 'function') {
              new Notification(title, {
                body,
                icon: '/icons/icon-192.png',
              });
            }
          } catch (e) {
            console.warn('Browser notification error:', e);
          }
        }
      }
    },
    [preferences?.browser_enabled, preferences?.sound_enabled, playChime]
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
    // If browser permission is still default, prompt user (allowed on user click)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      try {
        await requestBrowserPermission();
      } catch (e) {
        console.warn('Failed to prompt for notification permission:', e);
      }
    }

    let createdNotif: NotificationItem | null = null;

    if (token) {
      try {
        const res = await fetch(`${apiUrl}/api/notifications/test`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.notification) {
            createdNotif = data.notification;
          }
        }
      } catch (err) {
        console.warn('Backend test notification endpoint unreachable, using client fallback:', err);
      }
    }

    if (!createdNotif) {
      createdNotif = {
        id: 'test-' + Date.now(),
        user_id: user?.id || 'demo-user',
        title: '🔔 Uji Coba Notifikasi Dailo',
        message: 'Pengingat jadwal dan deadline tugas Anda akan tampil seperti ini.',
        type: 'system',
        reference_id: null,
        reference_type: 'system',
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
      };
    }

    setNotifications((prev) => [createdNotif!, ...prev]);
    setUnreadCount((c) => c + 1);

    await triggerNotification(
      createdNotif.title,
      createdNotif.message,
      createdNotif.id
    );
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

        for (const due of data.due_reminders) {
          await triggerNotification(due.title, due.message, due.id);
        }
      }
    } catch (err) {
      console.warn('Error checking due reminders:', err);
    }
  }, [token, isAuthenticated, apiUrl, fetchNotifications, triggerNotification]);

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
        activeToast,
        dismissToast,
        showInAppToast,
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
