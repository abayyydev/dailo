'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer';
import { NotificationSettingsModal } from '@/components/notifications/NotificationSettingsModal';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';
import { User as UserIcon, LogOut, ChevronDown, Bell, Search, Menu } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { unreadCount, isDrawerOpen, toggleDrawer } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-[4.5rem] bg-white border-b border-slate-200/80 px-6 sm:px-8 lg:px-10 flex items-center justify-between sticky top-0 z-20 shadow-2xs backdrop-blur-md bg-white/95">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Hamburger Menu Button */}
        <button
          id="btn-mobile-hamburger"
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-mobile-drawer'))}
          className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors cursor-pointer"
          aria-label="Buka Semua Menu"
          title="Buka Semua Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            dailo
          </span>
          <span className="text-[11px] font-medium text-slate-400 tracking-normal leading-tight">
            your personal flow
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 md:gap-5 text-sm text-slate-500">
        {/* Global Search Shortcut Button */}
        {isAuthenticated && (
          <button
            id="btn-global-search-trigger"
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/80 text-xs text-slate-500 hover:text-slate-900 transition-all cursor-pointer group shadow-2xs"
            title="Pencarian Cepat Universal (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <span>Cari apa saja...</span>
            <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-colors">
              Ctrl K
            </kbd>
          </button>
        )}

        {/* Notification Bell Button with Drawer */}
        {isAuthenticated && (
          <div className="relative">
            <button
              onClick={() => toggleDrawer()}
              title="Notifikasi & Pengingat"
              className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${isDrawerOpen
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-xs'
                : 'hover:bg-slate-50 border-slate-200/80 text-slate-600'
                }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <NotificationDrawer />
          </div>
        )}

        {isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 pl-2 pr-3.5 py-1.5 rounded-xl hover:bg-slate-50 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-400 leading-tight truncate max-w-[130px]">{user.email}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-md">
                    <span>Timezone: {user.timezone}</span>
                  </div>
                </div>

                <div className="p-1">
                  <button
                    onClick={async () => {
                      setDropdownOpen(false);
                      await logout();
                      router.replace('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-200 transition-all cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </Link>
          </div>
        )}
      </div>

      <NotificationSettingsModal />
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
