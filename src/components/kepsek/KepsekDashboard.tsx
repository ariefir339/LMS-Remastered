import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LIST_JURUSAN } from '../../types';
import {
  Award,
  BookOpen,
  School,
  FileSpreadsheet,
  Download,
  Users,
  Search,
  Eye,
  CheckCircle,
  FileCheck,
  TrendingUp,
  Briefcase,
  Calendar,
  Lock,
} from 'lucide-react';
import { KelasDetailView } from '../admin/KelasDetailView';
import { RekapNilaiView } from '../nilai/RekapNilaiView';

export const KepsekDashboard: React.FC = () => {
  const {
    currentUser,
    kelasList,
    users,
    asesmenList,
    tugasList,
    exportToExcel,
    selectedKelasId,
    setSelectedKelasId,
    setViewingProfileUser,
  } = useApp();

  const [kepsekTab, setKepsekTab] = useState<'RINGKASAN' | 'AUDIT_TUGAS' | 'AUDIT_UJIAN' | 'REKAP_NILAI' | 'KELAS'>('RINGKASAN');
  const [searchKelas, setSearchKelas] = useState('');
  const [selectedGuruFilter, setSelectedGuruFilter] = useState('');

  if (selectedKelasId) {
    return (
      <KelasDetailView
        kelasId={selectedKelasId}
        onBack={() => setSelectedKelasId(null)}
        canManageClass={false} // Kepsek & Kurikulum are strictly read-only
      />
    );
  }

  const isKurikulum = currentUser?.role === 'KURIKULUM';
  const teachers = users.filter((u) => u.role === 'GURU');
  const students = users.filter((u) => u.role === 'SISWA');
  const publishedExams = asesmenList.filter((a) => a.status === 'SELESAI');

  // Filter tasks and exams by teacher if selected
  const filteredTugas = tugasList.filter((t) => {
    if (selectedGuruFilter && t.guruId !== selectedGuruFilter) return false;
    return true;
  });

  const filteredExams = publishedExams.filter((a) => {
    if (selectedGuruFilter && a.guruId !== selectedGuruFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            {isKurikulum ? <BookOpen className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
            <span>{isKurikulum ? 'Panel Monitoring Tim Kurikulum' : 'Panel Pengawasan Kepala Sekolah'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Monitoring &amp; Audit Pembelajaran CNC
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audit aktivitas guru dalam memberikan tugas &amp; ujian, monitoring mutu pembelajaran, dan unduh nilai per mapel &amp; guru (Hak akses read-only).
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-1 pb-1 overflow-x-auto">
        {[
          { id: 'RINGKASAN', label: 'Ringkasan Eksekutif', icon: TrendingUp },
          { id: 'AUDIT_TUGAS', label: 'Audit Guru Pemberi Tugas', icon: Briefcase, count: tugasList.length },
          { id: 'AUDIT_UJIAN', label: 'Audit Guru Pemberi Ujian', icon: FileCheck, count: publishedExams.length },
          { id: 'REKAP_NILAI', label: 'Unduh Nilai Per Mapel & Guru', icon: FileSpreadsheet },
          { id: 'KELAS', label: 'Daftar Seluruh Kelas', icon: School, count: kelasList.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = kepsekTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setKepsekTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-bold whitespace-nowrap ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: RINGKASAN */}
      {kepsekTab === 'RINGKASAN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-xs font-semibold text-slate-400">Total Rombel Kelas</span>
              <p className="text-3xl font-extrabold text-white mt-1">{kelasList.length}</p>
              <span className="text-[11px] text-purple-300 mt-2 block">Mencakup 60+ Jurusan SMK/SMA</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-xs font-semibold text-slate-400">Tenaga Pendidik (Guru)</span>
              <p className="text-3xl font-extrabold text-emerald-400 mt-1">{teachers.length}</p>
              <span className="text-[11px] text-slate-400 mt-2 block">Guru Terdata NIK</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-xs font-semibold text-slate-400">Tugas / Projek Aktif</span>
              <p className="text-3xl font-extrabold text-amber-400 mt-1">{tugasList.length}</p>
              <span className="text-[11px] text-slate-400 mt-2 block">Diberikan oleh Guru Pengampu</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <span className="text-xs font-semibold text-slate-400">Asesmen Ujian Aktif</span>
              <p className="text-3xl font-extrabold text-cyan-400 mt-1">{publishedExams.length}</p>
              <span className="text-[11px] text-slate-400 mt-2 block">Ujian &amp; Quiz Selesai</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-bold text-white">Prinsip Hak Akses Kepsek &amp; Kurikulum CNC</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sesuai dengan ketentuan operasional sistem CNC: Peran Kepala Sekolah dan Tim Kurikulum difokuskan pada pengawasan mutu, memantau guru-guru mana yang aktif memberikan tugas projek serta mengadakan ujian online, dan mengunduh rekap nilai per mapel dan guru dalam format Excel. Hak cipta edit dan hapus (CRUD) berada sepenuhnya pada masing-masing guru pengampu.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT GURU PEMBERI TUGAS */}
      {kepsekTab === 'AUDIT_TUGAS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Audit Guru yang Memberikan Tugas / Projek</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Memantau penugasan berbasis PDF/Link oleh guru untuk para siswa.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <select
                value={selectedGuruFilter}
                onChange={(e) => setSelectedGuruFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="">Semua Guru Pengampu</option>
                {teachers.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama} ({g.mapelUtama || 'Pengampu'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTugas.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                Tidak ada data penugasan untuk filter guru yang dipilih.
              </div>
            ) : (
              filteredTugas.map((t) => {
                const guru = users.find((u) => u.id === t.guruId);
                const kelas = kelasList.find((k) => k.id === t.kelasId);

                return (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          {t.mapel}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {kelas?.judul || 'Semua Kelas'}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">{t.judul}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{t.deskripsi}</p>

                      <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1 text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Guru Pemberi Tugas:</span>
                          <span className="font-semibold text-white">{guru?.nama || 'Guru CNC'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">NIK Guru:</span>
                          <span className="font-mono text-cyan-300">{guru?.nik || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tenggat Waktu:</span>
                          <span className="font-mono text-slate-300">
                            {new Date(t.tenggatWaktu).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Siswa Mengumpulkan:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {t.submissions.length} Berkas PDF
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT GURU PEMBERI UJIAN */}
      {kepsekTab === 'AUDIT_UJIAN' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Audit Guru yang Memberikan Ujian / Quiz</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Memantau kegiatan asesmen online yang telah selesai dipublikasikan oleh para pendidik.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <select
                value={selectedGuruFilter}
                onChange={(e) => setSelectedGuruFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="">Semua Guru Pengampu</option>
                {teachers.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama} ({g.mapelUtama || 'Pengampu'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExams.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                Tidak ada data asesmen untuk filter guru yang dipilih.
              </div>
            ) : (
              filteredExams.map((a) => {
                const guru = users.find((u) => u.id === a.guruId);
                const kelas = kelasList.find((k) => k.id === a.kelasId);

                return (
                  <div
                    key={a.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          {a.tipe}
                        </span>
                        <span className="text-xs text-cyan-400 font-semibold">{a.mapel}</span>
                      </div>

                      <h4 className="text-base font-bold text-white">{a.judul}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {a.deskripsi || 'Tidak ada deskripsi'}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Guru Pembuat Ujian:</span>
                          <span className="font-semibold text-slate-200">{guru?.nama || 'Guru CNC'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rombel Kelas:</span>
                          <span className="font-semibold text-slate-200">{kelas?.judul || 'Semua Kelas'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Jumlah Butir Soal:</span>
                          <span className="font-semibold text-emerald-400">{a.soalList.length} Soal</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => exportToExcel(a.id)}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Rekap Nilai Ujian Excel (.csv)</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REKAP & UNDUH NILAI (FILTER PER MAPEL & GURU, NO CRUD) */}
      {kepsekTab === 'REKAP_NILAI' && <RekapNilaiView canManage={false} />}

      {/* TAB 5: AUDIT SELURUH KELAS */}
      {kepsekTab === 'KELAS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKelas}
                onChange={(e) => setSearchKelas(e.target.value)}
                placeholder="Cari kelas untuk audit..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kelasList
              .filter((k) => k.judul.toLowerCase().includes(searchKelas.toLowerCase()))
              .map((k) => {
                const walas = users.find((u) => u.id === k.walasId);

                return (
                  <div
                    key={k.id}
                    onClick={() => setSelectedKelasId(k.id)}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between shadow-lg cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {k.jurusan || 'Kejuruan'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Kode: {k.kodeGabung}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                        {k.judul}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {k.deskripsi || 'Kelas akademik CNC.'}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Wali Kelas:</span>
                          <span className="font-semibold text-slate-200">
                            {walas ? walas.nama : 'Belum Ditentukan'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Siswa:</span>
                          <span className="font-semibold text-cyan-400">{k.siswaIds.length} Siswa</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end text-xs font-semibold text-purple-400">
                      <span>Tinjau Kelas &rarr;</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
