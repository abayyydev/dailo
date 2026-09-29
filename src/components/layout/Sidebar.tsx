'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  CheckSquare,
  Calendar,
  Flame,
  Target,
  Timer,
  BarChart3,
  StickyNote,
  Settings,
  Zap,
} from 'lucide-react';

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'MAIN',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
      { name: 'Tasks', icon: CheckSquare, href: '/tasks' },
      { name: 'Schedule', icon: Clock, href: '/schedule' },
      { name: 'Calendar', icon: Calendar, href: '/calendar' },
      { name: 'Time Tracking', icon: Timer, href: '/tracking' },
    ],
  },
  {
    title: 'FOCUS',
    items: [
      { name: 'Focus Mode', icon: Zap, href: '/focus' },
      { name: 'Habits', icon: Flame, href: '/habits' },
      { name: 'Goals', icon: Target, href: '/goals' },
    ],
  },
  {
    title: 'INSIGHTS',
    items: [
      { name: 'Statistics', icon: BarChart3, href: '/statistics' },
      { name: 'Notes', icon: StickyNote, href: '/notes' },
      { name: 'Settings', icon: Settings, href: '/settings' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <Link
        href="/"
        className="h-16 sm:h-[4.25rem] flex items-center px-6 border-b border-slate-100 gap-3 group transition-colors hover:bg-slate-50/50"
      >
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
          <span className="text-base font-extrabold tracking-tight">d</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 tracking-tight text-lg leading-tight">
            dailo
          </span>
          <span className="text-[11px] font-medium text-slate-400 tracking-normal leading-tight">
            your personal flow
          </span>
        </div>
      </Link>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
