import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { TrackingProvider } from '@/context/TrackingContext';
import { FloatingTimerWidget } from '@/components/tracking/FloatingTimerWidget';
import { GlobalNotificationToast } from '@/components/notifications/GlobalNotificationToast';
import { AuthModal } from '@/components/auth/AuthModal';
import { MobileNav } from '@/components/layout/MobileNav';
import { PWAInstallPrompt } from '@/components/common/PWAInstallPrompt';
import { ThemeProvider } from '@/components/common/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const BASE_URL = 'https://dailo-amber.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'dailo — your personal flow',
    template: '%s — dailo',
  },
  description:
    'Timeline schedule, task management, habit & goal tracking, and productivity statistics in one unified platform. Organize your day, build better habits, and reach your goals.',
  keywords: [
    'productivity app',
    'task manager',
    'habit tracker',
    'time tracker',
    'schedule planner',
    'goal tracking',
    'daily planner',
    'dailo',
    'personal productivity',
  ],
  authors: [{ name: 'abayyydev', url: 'https://github.com/abayyydev' }],
  creator: 'abayyydev',
  publisher: 'dailo',
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: BASE_URL,
    siteName: 'dailo',
    title: 'dailo — your personal flow',
    description:
      'Satukan tugas, jadwal harian, pelacakan waktu, pembentukan kebiasaan, dan ruang fokus dalam satu platform produktivitas yang intuitif.',
    images: [
      {
        url: '/icons/og-image.png',
        width: 1200,
        height: 630,
        alt: 'dailo — your personal flow',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@dailo_app',
    creator: '@abayyydev',
    title: 'dailo — your personal flow',
    description:
      'Satukan tugas, jadwal harian, pelacakan waktu, kebiasaan, dan ruang fokus dalam satu platform.',
    images: ['/icons/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'dailo',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
    shortcut: '/icons/icon-192.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-style': 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="h-full font-sans antialiased bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-xl focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>

        <AuthProvider>
          <ThemeProvider />
          <NotificationProvider>
            <TrackingProvider>
              <main id="main-content">
                {children}
              </main>
              {/* Global Floating In-App Notification Toast */}
              <GlobalNotificationToast />
              {/* Floating Active Timer Widget */}
              <FloatingTimerWidget />
              {/* Global Auth Modal */}
              <AuthModal />
              {/* Mobile bottom navigation and 12-menu slide-over drawer */}
              <MobileNav />
              {/* PWA install prompt banner */}
              <PWAInstallPrompt />
            </TrackingProvider>
          </NotificationProvider>
        </AuthProvider>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      reg.update();
                      console.log('[SW] Registered & updated. Scope:', reg.scope);
                    })
                    .catch(function(err) {
                      console.warn('[SW] Registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
