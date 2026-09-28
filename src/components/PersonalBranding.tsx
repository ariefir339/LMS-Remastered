import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Shield,
  GraduationCap,
  Users,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Database,
  Laptop,
  BookOpen,
  Layers,
  Award,
  Terminal,
  ChevronRight,
  CheckSquare,
  FileText,
  UserCheck,
} from 'lucide-react';
import { UserRole } from '../types';

export const PersonalBranding: React.FC = () => {
  const { setCurrentView, quickLogin, setIsDbDocsOpen } = useApp();

  const demoRoles: { role: UserRole; title: string; desc: string; icon: any; color: string; bgBadge: string }[] = [
    {
      role: 'ADMIN',
      title: 'Administrator',
      desc: 'Kelola kelas, walas, akun guru (NIK) & siswa (NISN), pantau asesmen & generate nilai.',
      icon: Shield,
      color: 'bg-[#069494] text-white',
      bgBadge: 'bg-teal-50 text-[#069494] border-teal-200',
    },
    {
      role: 'GURU',
      title: 'Petugas / Guru',
      desc: 'Tab Kelas (Walas & Pengajar), materi PDF & Link, buat Ujian & Quiz, koreksi tugas.',
      icon: GraduationCap,
      color: 'bg-[#069494] text-white',
      bgBadge: 'bg-teal-50 text-[#069494] border-teal-200',
    },
    {
      role: 'SISWA',
      title: 'Siswa Siswi',
      desc: 'Tab Kelas, baca materi modul, kirim tugas upload PDF, kerjakan ujian online & nilai.',
      icon: Users,
      color: 'bg-[#FF69B4] text-white',
      bgBadge: 'bg-pink-50 text-[#FF69B4] border-pink-200',
    },
    {
      role: 'KEPSEK',
      title: 'Kepala Sekolah',
      desc: 'Audit guru pemberi tugas & ujian, pemantauan seluruh kelas, dan unduh nilai.',
      icon: Award,
      color: 'bg-[#069494] text-white',
      bgBadge: 'bg-teal-50 text-[#069494] border-teal-200',
    },
    {
      role: 'KURIKULUM',
      title: 'Tim Kurikulum',
      desc: 'Kelola standar kurikulum, mata pelajaran (mapel), kelas, guru pengampu & nilai.',
      icon: BookOpen,
      color: 'bg-[#069494] text-white',
      bgBadge: 'bg-teal-50 text-[#069494] border-teal-200',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Gradient based on Figma palette */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-100/60 via-pink-50/40 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-teal-200 shadow-xs text-[#069494] text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#FF69B4]" />
          <span>CNC Education Nexus • Versi Web PC LMS</span>
          <span className="w-2 h-2 rounded-full bg-[#069494]" />
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Sistem Terpadu Manajemen Kelas &amp;{' '}
          <span className="bg-gradient-to-r from-[#069494] via-[#069494] to-[#FF69B4] bg-clip-text text-transparent">
            Asesmen Akademik Modern
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Platform LMS sekelas Google Classroom berbasis Web PC. Menghubungkan peran Admin, Guru, Siswa, Kurikulum, dan Kepala Sekolah dalam satu alur kerja yang rapi dan terstruktur.
        </p>

        {/* Action CTAs using Figma palette */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => setCurrentView('LOGIN')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#069494] hover:bg-[#047777] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#069494]/30 hover:scale-[1.02] transition-all"
          >
            <span>Masuk ke Akun Anda</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsDbDocsOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#069494] border border-teal-200 shadow-xs font-semibold text-xs sm:text-sm transition-all"
          >
            <Database className="w-4 h-4 text-[#069494]" />
            <span>Lihat Skema Database &amp; Prisma</span>
          </button>
        </div>

        {/* Quick 1-Click Role Login Bar */}
        <div className="mt-10 p-6 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-200/50 max-w-5xl mx-auto text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#069494]">
                Uji Coba Langsung (1-Click Instant Demo)
              </span>
              <p className="text-xs text-slate-500">
                Pilih peran untuk langsung menjelajah tanpa repot input kredensial manual:
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-pink-50 text-[#FF69B4] border border-pink-200 font-bold font-mono">
              Live Interactive Simulation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {demoRoles.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  onClick={() => quickLogin(item.role)}
                  className="group p-3.5 rounded-xl bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-[#069494] text-left transition-all hover:shadow-md hover:scale-[1.02] flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center mb-2 shadow-xs`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-[#069494] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#069494] group-hover:text-[#FF69B4] transition-colors">
                    <span>Masuk {item.role}</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Pillars in Clean White Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Fitur Inti Sesuai Spesifikasi Alur Sistem
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Diselaraskan dengan kebutuhan alur Admin, Guru, Siswa, dan Pimpinan Sekolah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#069494] hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-[#069494] flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Dukungan 60+ Kelas &amp; Jurusan
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Mencakup SMP, SMA, serta seluruh spektrum kejuruan seperti 10-12 DKV, TJKT, PPLG, Pemasaran, dan MPLB.
            </p>
            <div className="text-[11px] font-mono text-[#069494] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Filter Siswa &amp; Kelas Presisi</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#FF69B4] hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-200 text-[#FF69B4] flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Soal PG, Kotak Centang &amp; Essay
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Formulir soal fleksibel dengan opsi Kotak Centang multi-jawaban, Pilihan Ganda standar, Essay komprehensif, dan lampiran berkas.
            </p>
            <div className="text-[11px] font-mono text-[#FF69B4] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Koreksi &amp; Penilaian Fleksibel</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#069494] hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-[#069494] flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Generate &amp; Export Nilai ke Excel
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Kompilasi nilai otomatis menghasilkan berkas format spreadsheet (.csv dengan encoding UTF-8 BOM) per mapel, kelas, dan jurusan.
            </p>
            <div className="text-[11px] font-mono text-[#069494] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Siap Olah di Microsoft Excel</span>
            </div>
          </div>
        </div>
      </section>

      {/* Developer & Architecture Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-teal-50 via-white to-pink-50 border border-teal-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#069494] text-white flex items-center justify-center shadow-sm">
              <Terminal className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Developer &amp; System Engineer Note
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-100 text-[#069494] border border-teal-200">
                  Ready-to-Deploy
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Aplikasi ini dilengkapi simulasi database relasional lokal dengan integritas data tinggi, aturan RBAC ketat, filter jurusan 60+ pilihan, dan generator Excel langsung.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDbDocsOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-[#069494] border border-teal-200 shadow-xs transition-all flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5 text-[#069494]" />
              <span>Buka Skema &amp; Blueprint DB</span>
            </button>
            <button
              onClick={() => setCurrentView('LOGIN')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#FF69B4] hover:bg-[#fa55a4] text-white shadow-md shadow-pink-500/20 transition-all"
            >
              Mulai Eksplorasi
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
