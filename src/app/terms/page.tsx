import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText,
  UserCheck,
  ShieldAlert,
  Copyright,
  AlertTriangle,
  UserX,
  Scale,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — dailo',
  description:
    'Ketentuan dan syarat penggunaan layanan dailo. Pelajari hak, kewajiban, dan ketentuan penggunaan platform kami.',
};

const sections = [
  {
    id: 'general-terms',
    icon: FileText,
    title: '1. Ketentuan Umum & Penerimaan Layanan',
    color: 'indigo',
    content: [
      {
        subtitle: 'Penerimaan Ketentuan',
        text: 'Dengan mendaftar, mengakses, atau menggunakan aplikasi dailo, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat dengan seluruh Syarat & Ketentuan ini.',
      },
      {
        subtitle: 'Batasan Usia',
        text: 'Layanan dailo ditujukan untuk pengguna berusia minimal 13 tahun atau usia legal yang berlaku di yurisdiksi Anda. Jika Anda di bawah usia tersebut, Anda memerlukan izin dari orang tua atau wali hukum.',
      },
      {
        subtitle: 'Pembaruan Ketentuan',
        text: 'Kami berhak memperbarui atau memodifikasi Syarat & Ketentuan ini sewaktu-waktu. Perubahan material akan diumumkan melalui aplikasi atau email Anda.',
      },
    ],
  },
  {
    id: 'user-account',
    icon: UserCheck,
    title: '2. Akun Pengguna & Tanggung Jawab',
    color: 'emerald',
    content: [
      {
        subtitle: 'Keakuratan Informasi',
        text: 'Anda wajib memberikan informasi yang akurat dan terkini saat melakukan registrasi akun (nama lengkap dan alamat email yang valid).',
      },
      {
        subtitle: 'Keamanan Kredensial',
        text: 'Anda bertanggung jawab penuh untuk menjaga kerahasiaan password dan aktivitas yang terjadi di bawah akun Anda. Jangan pernah membagikan password kepada pihak lain.',
      },
      {
        subtitle: 'Pemberitahuan Pelanggaran',
        text: 'Segera beri tahu kami jika Anda mencurigai adanya akses tidak sah atau pelanggaran keamanan terhadap akun dailo Anda.',
      },
    ],
  },
  {
    id: 'fair-use',
    icon: ShieldAlert,
    title: '3. Penggunaan yang Diizinkan & Batasan',
    color: 'amber',
    content: [
      {
        subtitle: 'Tujuan Penggunaan',
        text: 'dailo disediakan sebagai platform produktivitas pribadi dan kolaborasi (tugas, jadwal, kalender, catatan, pelacakan waktu, dan kebiasaan).',
      },
      {
        subtitle: 'Larangan Penyalahgunaan',
        text: 'Dilarang menggunakan aplikasi untuk aktivitas ilegal, menyebarkan malware, melakukan serangan denial of service (DoS), web scraping otomatis tanpa izin, atau merekayasa balik (reverse engineering) sistem.',
      },
      {
        subtitle: 'Integritas Sistem',
        text: 'Anda tidak diperkenankan mencoba menerobos batasan akses, mengeksploitasi celah keamanan (vulnerability), atau mengganggu operasional server backend dailo.',
      },
    ],
  },
  {
    id: 'intellectual-property',
    icon: Copyright,
    title: '4. Hak Kekayaan Intelektual & Konten Anda',
    color: 'violet',
    content: [
      {
        subtitle: 'Kepemilikan Konten Anda',
        text: 'Semua data produktivitas yang Anda buat (tugas, jadwal, catatan, habit, dan data tracking) tetap menjadi hak milik Anda sepenuhnya. dailo tidak mengklaim kepemilikan atas konten yang Anda buat.',
      },
      {
        subtitle: 'Hak Cipta Platform',
        text: 'Desain antarmuka, logo, kode sumber frontend dan backend, serta materi grafis dailo dilindungi oleh hak cipta dan hukum kekayaan intelektual.',
      },
      {
        subtitle: 'Lisensi Penggunaan',
        text: 'Kami memberikan lisensi terbatas, non-eksklusif, dan tidak dapat dipindahtangankan kepada Anda untuk mengakses dan menggunakan aplikasi dailo sesuai peruntukannya.',
      },
    ],
  },
  {
    id: 'liability-warranty',
    icon: AlertTriangle,
    title: '5. Batasan Tanggung Jawab & Jaminan',
    color: 'rose',
    content: [
      {
        subtitle: 'Penyediaan "As-Is"',
        text: 'Layanan dailo disediakan "sebagaimana adanya" (as is) dan "sebagaimana tersedia" (as available). Kami berusaha semaksimal mungkin menjaga keandalan dan ketersediaan sistem tanpa henti.',
      },
      {
        subtitle: 'Batasan Kerugian',
        text: 'dailo tidak bertanggung jawab atas kerugian tidak langsung, kehilangan keuntungan, gangguan bisnis, atau kehilangan data akibat gangguan jaringan internet, bencana alam, atau faktor di luar kendali wajar kami.',
      },
      {
        subtitle: 'Backup Mandiri',
        text: 'Meskipun kami menerapkan proteksi data, pengguna disarankan untuk memanfaatkan fitur Export Data secara berkala untuk mencadangkan catatan dan data penting Anda.',
      },
    ],
  },
  {
    id: 'termination',
    icon: UserX,
    title: '6. Penghentian Layanan & Penutupan Akun',
    color: 'sky',
    content: [
      {
        subtitle: 'Penutupan oleh Pengguna',
        text: 'Anda dapat berhenti menggunakan layanan dan meminta penghapusan akun serta seluruh data terkait kapan saja.',
      },
      {
        subtitle: 'Penangguhan Akun oleh dailo',
        text: 'Kami berhak menangguhkan atau menghentikan akun sementara maupun permanen jika ditemukan pelanggaran berat terhadap Syarat & Ketentuan ini.',
      },
    ],
  },
  {
    id: 'governing-law',
    icon: Scale,
    title: '7. Hukum yang Berlaku & Kontak',
    color: 'indigo',
    content: [
      {
        subtitle: 'Yurisdiksi Hukum',
        text: 'Syarat & Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum yang berlaku di Negara Kesatuan Republik Indonesia.',
      },
      {
        subtitle: 'Penyelesaian Sengketa',
        text: 'Segala perselisihan yang timbul sehubungan dengan layanan akan diutamakan diselesaikan secara musyawarah untuk mencapai mufakat.',
      },
      {
        subtitle: 'Pertanyaan & Bantuan',
        text: 'Jika ada pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi tim kami melalui support@dailo.app.',
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

export default function TermsOfServicePage() {
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
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-800">dailo</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            Terms of Service
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            Syarat & Ketentuan
            <span className="text-indigo-600"> Penggunaan Layanan</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Harap membaca syarat dan ketentuan ini secara saksama sebelum menggunakan aplikasi dailo.
            Dengan menggunakan layanan, Anda menyetujui seluruh ketentuan yang tercantum.
          </p>
          <p className="text-xs text-slate-400">
            Terakhir diperbarui: <span className="font-semibold text-slate-600">{lastUpdated}</span>
          </p>
        </div>

        {/* Quick Highlights Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Poin Penting untuk Pengguna
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: '📋',
                title: 'Data Anda Milik Anda',
                desc: 'Seluruh catatan, task, dan goals Anda 100% milik Anda.',
              },
              {
                icon: '🛡️',
                title: 'Jaga Akun Anda',
                desc: 'Simpan password dengan aman dan jangan berbagi akses.',
              },
              {
                icon: '🤝',
                title: 'Penggunaan Positif',
                desc: 'Gunakan dailo untuk produktivitas secara adil dan sah.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-xs font-bold text-slate-800">{item.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms Sections */}
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
                  <div
                    className={`w-9 h-9 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}
                  >
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

        {/* Footer */}
        <div className="text-center py-6 border-t border-slate-100 space-y-3">
          <p className="text-xs text-slate-400">
            Terima kasih telah mempercayakan alur produktivitas harian Anda bersama dailo.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <Link href="/privacy" className="text-indigo-600 hover:underline font-medium">
              Kebijakan Privasi
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/login" className="text-slate-500 hover:text-slate-700">
              Masuk ke Akun
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/register" className="text-slate-500 hover:text-slate-700">
              Daftar Baru
            </Link>
          </div>
          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} dailo. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
