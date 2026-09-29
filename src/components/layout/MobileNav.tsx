'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  Calendar,
  Timer,
  Zap,
  Flame,
  Target,
  BarChart3,
  StickyNote,
  Settings,
  Menu,
  X,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface AllNavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  group: 'MAIN' | 'FOCUS' | 'INSIGHTS';
  badge?: string;
}

const allNavItems: AllNavItem[] = [
  // MAIN
  { name: 'Dashboard', icon: LayoutDashboard, href: '/', group: 'MAIN' },
  { name: 'Tasks', icon: CheckSquare, href: '/tasks', group: 'MAIN' },
  { name: 'Schedule', icon: Clock, href: '/schedule', group: 'MAIN' },
  { name: 'Calendar', icon: Calendar, href: '/calendar', group: 'MAIN' },
  { name: 'Time Tracking', icon: Timer, href: '/tracking', group: 'MAIN' },

  // FOCUS
  { name: 'Focus Mode', icon: Zap, href: '/focus', group: 'FOCUS' },
  { name: 'Habits', icon: Flame, href: '/habits', group: 'FOCUS' },
  { name: 'Goals', icon: Target, href: '/goals', group: 'FOCUS' },

  // INSIGHTS
  { name: 'Statistics', icon: BarChart3, href: '/statistics', group: 'INSIGHTS' },
  { name: 'Notes', icon: StickyNote, href: '/notes', group: 'INSIGHTS' },
  { name: 'Settings', icon: Settings, href: '/settings', group: 'INSIGHTS' },
];

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Listen to global events dispatched from Header hamburger button
  useEffect(() => {
    const handleToggle = () => setIsDrawerOpen((prev) => !prev);
    const handleOpen = () => setIsDrawerOpen(true);
    const handleClose = () => setIsDrawerOpen(false);

    window.addEventListener('toggle-mobile-drawer', handleToggle);
    window.addEventListener('open-mobile-drawer', handleOpen);
    window.addEventListener('close-mobile-drawer', handleClose);

    return () => {
      window.removeEventListener('toggle-mobile-drawer', handleToggle);
      window.removeEventListener('open-mobile-drawer', handleOpen);
      window.removeEventListener('close-mobile-drawer', handleClose);
    };
  }, []);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    if (isDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Do not render mobile bottom navbar on authentication pages (login & register)
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register')
  ) {
    return null;
  }

  // Bottom navigation quick items
  const bottomBarItems = [
    { name: 'Home', icon: LayoutDashboard, href: '/' },
    { name: 'Tasks', icon: CheckSquare, href: '/tasks' },
    { name: 'Schedule', icon: Clock, href: '/schedule' },
    { name: 'Focus', icon: Zap, href: '/focus' },
  ];

  return (
    <>
      {/* 1. Mobile Bottom Bar (Always pinned on small screens) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl shadow-slate-900/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {bottomBarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              id={`mobile-nav-${item.name.toLowerCase()}`}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[10px] font-semibold transition-all ${
                isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-indigo-50' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : ''}`} />
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-600 border-2 border-white" />
                )}
              </div>
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* 5th button: "Semua Menu" drawer toggle */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          id="btn-mobile-all-menus"
          aria-label="Buka Semua Menu"
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[10px] font-semibold transition-all cursor-pointer ${
            isDrawerOpen ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              isDrawerOpen ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Menu className="w-5 h-5" />
          </div>
          <span>Menu (12)</span>
        </button>
      </nav>

      {/* 2. Full Mobile Slide-Over Navigation Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer content panel */}
          <aside className="relative flex flex-col w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-250 ease-out select-none">
            {/* Drawer Header */}
            <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
                  <span className="text-sm font-extrabold tracking-tight">d</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-sm block leading-tight">
                    dailo
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 tracking-normal leading-tight">
                    your personal flow
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card */}
            {isAuthenticated && user && (
              <div className="p-4 mx-3 my-2 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {user.name?.slice(0, 2).toUpperCase() || 'DU'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{user.email}</p>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Online" />
              </div>
            )}

            {!isAuthenticated && (
              <div className="p-3 mx-3 my-2 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between">
                <div className="text-xs text-slate-700 font-medium">Belum masuk akun?</div>
                <Link
                  href="/login"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xs hover:bg-indigo-700 transition-colors"
                >
                  Masuk
                </Link>
              </div>
            )}

            {/* Search Quick Action */}
            <div className="px-3 pt-1">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  window.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })
                  );
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs text-slate-500 font-medium transition-all"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cari apa saja...</span>
                </div>
                <kbd className="font-mono text-[9px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-400">
                  Ctrl K
                </kbd>
              </button>
            </div>

            {/* Scrollable List of ALL 12 Menu Items */}
            <div className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
              {(['MAIN', 'FOCUS', 'INSIGHTS'] as const).map((groupName) => {
                const groupItems = allNavItems.filter((item) => item.group === groupName);

                return (
                  <div key={groupName} className="space-y-1">
                    <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {groupName}
                    </div>
                    {groupItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsDrawerOpen(false)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
                              : 'text-slate-700 hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`w-4 h-4 ${
                                isActive ? 'text-white' : 'text-slate-400'
                              }`}
                            />
                            <span>{item.name}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          {!item.badge && isActive && (
                            <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 pb-8 border-t border-slate-100 bg-slate-50/70 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px]">
                  <Link
                    href="/privacy"
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-slate-600 hover:text-indigo-600 font-medium transition-colors"
                  >
                    Privasi
                  </Link>
                  <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" aria-hidden="true" />
                  <Link
                    href="/terms"
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-slate-600 hover:text-indigo-600 font-medium transition-colors"
                  >
                    Ketentuan
                  </Link>
                </div>
                {isAuthenticated && (
                  <button
                    onClick={async () => {
                      setIsDrawerOpen(false);
                      await logout();
                      router.replace('/login');
                    }}
                    className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold cursor-pointer text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px] pt-2 border-t border-slate-200/60">
                <span>dailo &bull; personal flow</span>
                <span className="inline-flex items-center gap-1 shrink-0">
                  <span>Dibuat oleh</span>
                  <a
                    href="https://github.com/abayyydev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    abayyydev
                  </a>
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
