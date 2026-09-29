import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, Mail, Globe, ArrowLeft, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — dailo',
  description:
    'How dailo collects, uses, and protects your personal data. Read our complete privacy policy.',
};

const sections = [
  {
    id: 'data-collected',
    icon: Database,
    title: '1. Data yang Kami Kumpulkan',
    color: 'indigo',
    content: [
      {
        subtitle: 'Data Akun',
        text: 'Nama lengkap, alamat email, dan password terenkripsi (bcrypt) yang Anda berikan saat mendaftar.',
      },
      {
        subtitle: 'Data Produktivitas',
        text: 'Tasks, jadwal harian (schedule), catatan (notes), kebiasaan (habits), goals, sesi time tracking, dan statistik produktivitas yang Anda buat di dalam aplikasi.',
      },
      {
        subtitle: 'Data Preferensi',
        text: 'Zona waktu, preferensi tampilan (dark/light mode), dan pengaturan notifikasi.',
      },
      {
        subtitle: 'Data Teknis',
        text: 'Token autentikasi (disimpan di localStorage), informasi perangkat umum untuk keperluan debugging, dan log error anonim.',
      },
    ],
  },
  {
    id: 'data-use',
    icon: Eye,
    title: '2. Penggunaan Data',
    color: 'emerald',
    content: [
      {
        subtitle: 'Menyediakan Layanan',
        text: 'Data Anda digunakan untuk menjalankan fitur-fitur aplikasi dailo seperti manajemen tugas, jadwal, kebiasaan, dan laporan statistik.',
      },
      {
        subtitle: 'Personalisasi',
        text: 'Menyesuaikan tampilan, notifikasi, dan rekomendasi berdasarkan preferensi dan pola penggunaan Anda.',
      },
      {
        subtitle: 'Keamanan',
        text: 'Mendeteksi aktivitas mencurigakan, mencegah penyalahgunaan akun, dan menjaga integritas data.',
      },
      {
        subtitle: 'Peningkatan Layanan',
        text: 'Data agregat dan anonim digunakan untuk memahami penggunaan fitur dan meningkatkan pengalaman pengguna.',
      },
    ],
  },
  {
    id: 'data-security',
    icon: Lock,
    title: '3. Keamanan Data',
    color: 'violet',
    content: [
      {
        subtitle: 'Enkripsi Password',
        text: 'Password Anda tidak pernah disimpan dalam bentuk plain-text. Kami menggunakan algoritma bcrypt dengan salt round 10 untuk hashing.',
      },
      {
        subtitle: 'JWT Token',
        text: 'Autentikasi menggunakan JSON Web Token (JWT) yang expire dalam 7 hari dan disimpan hanya di localStorage perangkat Anda.',
      },
      {
        subtitle: 'HTTPS',
        text: 'Seluruh komunikasi antara aplikasi dan server menggunakan enkripsi HTTPS/TLS.',
      },
      {
        subtitle: 'Akses Terbatas',
        text: 'Data Anda hanya dapat diakses oleh akun Anda sendiri melalui token autentikasi yang valid.',
      },
    ],
  },
  {
    id: 'data-sharing',
    icon: Globe,
    title: '4. Pembagian Data',
    color: 'amber',
    content: [
      {
        subtitle: 'Tidak Dijual',
        text: 'Kami tidak pernah menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga manapun.',
      },
      {
        subtitle: 'Integrasi Pihak Ketiga',
        text: 'Jika Anda menghubungkan akun Google Calendar, hanya data yang Anda izinkan yang diakses. Kami tidak menyimpan credential Google Anda.',
      },
      {
        subtitle: 'Kewajiban Hukum',
        text: 'Kami dapat mengungkapkan data jika diwajibkan oleh hukum yang berlaku di Indonesia atau perintah pengadilan yang sah.',
      },
    ],
  },
  {
    id: 'user-rights',
    icon: Shield,
    title: '5. Hak Pengguna',
    color: 'rose',
    content: [
      {
        subtitle: 'Akses Data',
        text: 'Anda dapat melihat semua data Anda melalui halaman Settings di aplikasi.',
      },
      {
        subtitle: 'Koreksi Data',
        text: 'Anda dapat mengubah nama, email, dan preferensi kapan saja melalui halaman Settings > Profile.',
      },
      {
        subtitle: 'Hapus Data',
        text: 'Anda berhak meminta penghapusan seluruh data akun Anda. Hubungi kami melalui email dan kami akan memproses dalam 30 hari.',
      },
      {
        subtitle: 'Ekspor Data',
        text: 'Kami sedang mengembangkan fitur ekspor data. Hubungi kami jika membutuhkan salinan data Anda sebelum fitur ini tersedia.',
      },
    ],
  },
  {
    id: 'contact',
    icon: Mail,
    title: '6. Kontak',
    color: 'sky',
    content: [
      {
        subtitle: 'Email',
        text: 'Untuk pertanyaan terkait privasi, permintaan hapus data, atau pelaporan insiden keamanan, hubungi: privacy@dailo.app',
      },
      {
        subtitle: 'Respons',
        text: 'Kami berkomitmen untuk merespons pertanyaan privasi dalam waktu 7 hari kerja.',
      },
    ],
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-100',
    icon: 'text-indigo-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-100',
    icon: 'text-emerald-600',
  },
  violet: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-100',
    icon: 'text-violet-600',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-100',
    icon: 'text-amber-600',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-100',
    icon: 'text-rose-600',
  },
  sky: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-100',
    icon: 'text-sky-600',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = '29 September 2026';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      {/* Top Nav Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke dailo</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-800">dailo</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            Kebijakan Privasi
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Privasi Anda adalah
            <span className="text-indigo-600"> Prioritas Kami</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Dokumen ini menjelaskan bagaimana dailo mengumpulkan, menggunakan, dan melindungi
            informasi pribadi Anda saat menggunakan layanan kami.
          </p>
          <p className="text-xs text-slate-400">
            Terakhir diperbarui: <span className="font-semibold text-slate-600">{lastUpdated}</span>
          </p>
        </div>

        {/* Quick Summary Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Ringkasan Cepat
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🔒', title: 'Data Aman', desc: 'Password dienkripsi bcrypt, komunikasi via HTTPS' },
              { icon: '🚫', title: 'Tidak Dijual', desc: 'Data Anda tidak pernah dijual ke pihak ketiga' },
              { icon: '🗑️', title: 'Hak Hapus', desc: 'Anda bisa minta hapus akun kapan saja' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-xs font-bold text-slate-800">{item.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-5">
          {sections.map((section) => {
            const colors = colorMap[section.color];
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                id={section.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* Section Header */}
                <div className={`px-6 py-4 ${colors.bg} border-b ${colors.border} flex items-center gap-3`}>
                  <div className={`w-9 h-9 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <h2 className={`text-sm font-bold ${colors.text}`}>{section.title}</h2>
                </div>

                {/* Section Content */}
                <div className="p-6 space-y-4">
                  {section.content.map((item) => (
                    <div key={item.subtitle} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{item.subtitle}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cookie Notice */}
        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6">
          <h2 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
            🍪 Penggunaan Penyimpanan Lokal (localStorage)
          </h2>
          <p className="text-xs text-amber-700 leading-relaxed">
            dailo menggunakan <strong>localStorage</strong> browser Anda untuk menyimpan token autentikasi (sesi login).
            Data ini tidak dikirim ke pihak ketiga dan hanya digunakan untuk mempertahankan sesi Anda.
            Anda dapat menghapusnya kapan saja melalui pengaturan browser atau dengan melakukan logout dari aplikasi.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-slate-100 space-y-3">
          <p className="text-xs text-slate-400">
            Dengan menggunakan dailo, Anda menyetujui kebijakan privasi ini.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <Link href="/terms" className="text-indigo-600 hover:underline font-medium">
              Syarat & Ketentuan
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/login" className="text-slate-500 hover:text-slate-700">
              Masuk ke Akun
            </Link>
            <span className="text-slate-300">•</span>
            <a href="mailto:privacy@dailo.app" className="text-slate-500 hover:text-slate-700">
              Hubungi Kami
            </a>
          </div>
          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} dailo. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
