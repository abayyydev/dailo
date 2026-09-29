'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

export interface ActiveTimer {
  user_id: string;
  schedule_id: string | null;
  task_id: string | null;
  category_id: string | null;
  title: string;
  start_time: string;
  last_resumed_at: string;
  accumulated_seconds: number;
  is_running: boolean;
  current_elapsed_seconds?: number;
  category_name?: string | null;
  category_color?: string | null;
  category_icon?: string | null;
  schedule_title?: string | null;
  task_title?: string | null;
}

export interface TimeLog {
  id: string;
  user_id: string;
  schedule_id: string | null;
  task_id: string | null;
  category_id: string | null;
  title: string;
  notes: string | null;
  log_date: string;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  is_manual: boolean;
  category_name?: string | null;
  category_color?: string | null;
  category_icon?: string | null;
  schedule_title?: string | null;
  task_title?: string | null;
}

interface TrackingContextType {
  activeTimer: ActiveTimer | null;
  elapsedSeconds: number;
  isRunning: boolean;
  isLoading: boolean;
  isWidgetVisible: boolean;
  setWidgetVisible: (visible: boolean) => void;
  fetchActiveTimer: () => Promise<void>;
  startTimer: (params: {
    title: string;
    category_id?: string | null;
    schedule_id?: string | null;
    task_id?: string | null;
  }) => Promise<boolean>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  stopTimer: () => Promise<TimeLog | null>;
  discardTimer: () => Promise<void>;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWidgetVisible, setWidgetVisible] = useState<boolean>(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch active timer from backend
  const fetchActiveTimer = useCallback(async () => {
    if (!token || !isAuthenticated) return;
    try {
      const res = await fetch(`${apiUrl}/api/tracking/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.active_timer) {
        setActiveTimer(data.active_timer);
        setElapsedSeconds(data.active_timer.current_elapsed_seconds || 0);
      } else {
        setActiveTimer(null);
        setElapsedSeconds(0);
      }
    } catch (err) {
      console.error('Failed to fetch active timer:', err);
    }
  }, [token, isAuthenticated, apiUrl]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchActiveTimer();
    } else {
      setActiveTimer(null);
      setElapsedSeconds(0);
    }
  }, [isAuthenticated, token, fetchActiveTimer]);

  // Ticking logic
  useEffect(() => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }

    if (activeTimer && activeTimer.is_running) {
      tickIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, [activeTimer]);

  // Start timer
  const startTimer = async (params: {
    title: string;
    category_id?: string | null;
    schedule_id?: string | null;
    task_id?: string | null;
  }): Promise<boolean> => {
    if (!token) return false;
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/tracking/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal memulai timer');
      }

      const data = await res.json();
      setActiveTimer(data.active_timer);
      setElapsedSeconds(0);
      setWidgetVisible(true);
      return true;
    } catch (err) {
      console.error('Failed to start timer:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Pause timer
  const pauseTimer = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/tracking/pause`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveTimer(data.active_timer);
        setElapsedSeconds(data.active_timer.accumulated_seconds || elapsedSeconds);
      }
    } catch (err) {
      console.error('Failed to pause timer:', err);
    }
  };

  // Resume timer
  const resumeTimer = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl}/api/tracking/resume`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveTimer(data.active_timer);
      }
    } catch (err) {
      console.error('Failed to resume timer:', err);
    }
  };

  // Stop timer & save to log
  const stopTimer = async (): Promise<TimeLog | null> => {
    if (!token) return null;
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/tracking/stop`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveTimer(null);
        setElapsedSeconds(0);
        return data.time_log || null;
      }
      return null;
    } catch (err) {
      console.error('Failed to stop timer:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Discard active timer
  const discardTimer = async () => {
    if (!token) return;
    try {
      await fetch(`${apiUrl}/api/tracking/active`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveTimer(null);
      setElapsedSeconds(0);
    } catch (err) {
      console.error('Failed to discard timer:', err);
    }
  };

  return (
    <TrackingContext.Provider
      value={{
        activeTimer,
        elapsedSeconds,
        isRunning: Boolean(activeTimer?.is_running),
        isLoading,
        isWidgetVisible,
        setWidgetVisible,
        fetchActiveTimer,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        discardTimer,
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
}
