'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * ThemeProvider — watches the authenticated user's theme preference
 * and applies the correct class ('dark') to the <html> element.
 * Must be rendered inside <AuthProvider>.
 */
export function ThemeProvider() {
  const { user } = useAuth();

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(theme: 'light' | 'dark' | 'system') {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // system: follow OS preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }

    const theme = user?.theme ?? 'system';
    applyTheme(theme);

    // If 'system', also listen for OS changes
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [user?.theme]);

  return null; // purely side-effect component
}
