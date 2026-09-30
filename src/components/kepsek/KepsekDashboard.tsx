import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LIST_JURUSAN } from '../../types';
import {
  Award,
  BookOpen,
  School,
  FileSpreadsheet,
  Users,
  GraduationCap,
  Download,
  ChevronRight,
  Search,
  Eye,
  Briefcase,
  FileCheck,
} from 'lucide-react';
import { KelasDetailView } from '../admin/KelasDetailView';
import { AsesmenDetailView } from '../guru/AsesmenDetailView';
import { MateriModuleView } from '../materi/MateriModuleView';
import { TugasProjekView } from '../tugas/TugasProjekView';
import { RekapNilaiView } from '../nilai/RekapNilaiView';
import { RoleStatsSummary } from '../RoleStatsSummary';

export const KepsekDashboard: React.FC = () => {
  const {
    currentUser,
    kelasList,
    users,
    asesmenList,
    materiList,
    tugasList,
    selectedKelasId,
    setSelectedKelasId,
    selectedAsesmenId,
    setSelectedAsesmenId,
    setViewingProfileUser,
    generateNilai,
    exportToExcel,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'KELAS' | 'MATERI' | 'TUGAS' | 'ASESMEN' | 'NILAI' | 'GURU' | 'SISWA'>('KELAS');
  const [selectedJurusanSiswaFilter, setSelectedJurusanSiswaFilter] = useState('12 PPLG 2');
  const [searchQuery, setSearchQuery] = useState('');

  if (selectedKelasId) {
    return (
      <KelasDetailView
        kelasId={selectedKelasId}
        onBack={() => setSelectedKelasId(null)}
        canManageClass={false} // Kepsek only views, posts announcements, comments, shares links
      />
    );
  }

  if (selectedAsesmenId) {
    return (
      <AsesmenDetailView
        asesmenId={selectedAsesmenId}
        onBack={() => setSelectedAsesmenId(null)}
      />
    );
  }

  const teachers = users.filter(
    (u) =>
      u.role === 'GURU' &&
      (u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.nik && u.nik.includes(searchQuery)))
  );

  const studentsInJurusan = users.filter(
    (u) =>
      u.role === 'SISWA' &&
      (selectedJurusanSiswaFilter ? u.jurusanAsal === selectedJurusanSiswaFilter : true)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner matching Admin & Kurikulum Light Theme */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-50 via-white to-pink-50/60 border border-teal-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-100/80 border border-teal-200 text-[#069494] text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Dashboard Eksekutif Kepala Sekolah</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Selamat Datang, {currentUser?.nama}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            NIK: <span className="font-mono text-[#069494] font-bold">{currentUser?.nik || '-'}</span> • Akses pemantauan penuh terhadap seluruh kelas, materi, tugas projek, hasil asesmen, dan laporan nilai Excel.
          </p>
        </div>
      </div>

      {/* Ringkasan Statistik & Jadwal Ujian Hari Ini */}
      <RoleStatsSummary
        onSelectKelas={(id) => setSelectedKelasId(id)}
        onNavigateTab={(tab) => setActiveTab(tab as any)}
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 pb-1 overflow-x-auto text-xs font-bold">
        {[
          { id: 'KELAS', label: 'Semua Kelas', icon: School, count: kelasList.length },
          { id: 'MATERI', label: 'Pantau Materi', icon: BookOpen, count: materiList.length },
          { id: 'TUGAS', label: 'Pantau Tugas Projek', icon: Briefcase, count: tugasList.length },
          { id: 'ASESMEN', label: 'Pantau Asesmen', icon: FileCheck, count: asesmenList.length },
          { id: 'NILAI', label: 'Rekap Nilai & Excel', icon: FileSpreadsheet },
          { id: 'GURU', label: 'Data Guru', icon: GraduationCap, count: users.filter((u) => u.role === 'GURU').length },
          { id: 'SISWA', label: 'Data Siswa (Per Jurusan)', icon: Users, count: users.filter((u) => u.role === 'SISWA').length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#069494] text-white shadow-md shadow-[#069494]/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full bg-black/15 text-[10px] font-mono tabular-nums">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SEMUA KELAS */}
      {activeTab === 'KELAS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kelasList.map((k) => {
            const walas = users.find((u) => u.id === k.walasId);

            return (
              <div
                key={k.id}
                onClick={() => setSelectedKelasId(k.id)}
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-[#069494] hover:shadow-md transition-all flex flex-col justify-between shadow-xs cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#069494]">
                      {k.jurusan || 'Kejuruan'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Kode: {k.kodeGabung}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#069494] transition-colors">
                    {k.judul}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {k.deskripsi || 'Ruang kelas akademik CNC.'}
                  </p>

                  <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                    <span className="text-[10px] text-slate-400 block font-medium">Wali Kelas:</span>
                    <span className="font-bold text-slate-800">
                      {walas ? walas.nama : 'Belum ditentukan'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-[#069494] tabular-nums">{k.siswaIds.length} Siswa</span>
                  <span className="text-[#069494] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Tinjau Kelas</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: PANTAU MATERI (READ ONLY) */}
      {activeTab === 'MATERI' && <MateriModuleView canManage={false} />}

      {/* TAB 3: PANTAU TUGAS PROJEK (READ ONLY) */}
      {activeTab === 'TUGAS' && <TugasProjekView canManage={false} />}

      {/* TAB 4: PANTAU ASESMEN */}
      {activeTab === 'ASESMEN' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900">
              Pemantauan Asesmen &amp; Ujian Guru
            </h3>
            <p className="text-xs text-slate-500">
              Anda dapat melihat isi soal, melihat jawaban siswa, dan mengunduh rekapitulasi nilai Excel (.csv) tanpa mengubah soal guru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {asesmenList.map((a) => {
              const guru = users.find((u) => u.id === a.guruId);
              const kelas = kelasList.find((k) => k.id === a.kelasId);

              return (
                <div
                  key={a.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-[#069494] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                      <span className="font-bold text-[#069494]">
                        {a.tipe}
                      </span>
                      <span
                        className={`font-bold ${
                          a.status === 'SELESAI'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {a.status === 'SELESAI' ? 'Dipublikasikan' : 'Sedang Diproses (Draft)'}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900">{a.judul}</h4>
                    <p className="text-xs text-[#069494] mt-0.5 font-bold">Mapel: {a.mapel}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.deskripsi}</p>

                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Guru Pembuat:</span>
                        <span className="text-slate-800 font-bold">{guru?.nama || 'Guru'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Kelas:</span>
                        <span className="text-slate-800 font-bold">{kelas?.judul || 'Semua Kelas'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jumlah Butir Soal:</span>
                        <span className="text-[#069494] font-mono font-bold tabular-nums">{a.soalList.length} Soal</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAsesmenId(a.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-teal-50 hover:bg-[#069494] text-[#069494] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Tinjau Soal &amp; Nilai</span>
                    </button>

                    <button
                      onClick={() => {
                        generateNilai(a.id);
                        exportToExcel(a.id);
                      }}
                      className="py-2 px-3 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#069494]/20 transition-all"
                      title="Export Excel"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Excel</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: REKAP NILAI & EXCEL (READ & EXPORT) */}
      {activeTab === 'NILAI' && <RekapNilaiView canManage={false} />}

      {/* TAB 6: DATA GURU */}
      {activeTab === 'GURU' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Direktori Guru &amp; Tenaga Pendidik</h3>
              <p className="text-xs text-slate-500">Klik profil guru untuk melihat detail informasi pengajaran</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau NIK..."
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teachers.map((guru) => (
              <div
                key={guru.id}
                onClick={() => setViewingProfileUser(guru)}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#069494] hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={guru.foto}
                  alt={guru.nama}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 group-hover:ring-[#069494]"
                />
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#069494] truncate">
                    {guru.nama}
                  </p>
                  <p className="text-[10px] font-mono text-[#069494] font-semibold">NIK: {guru.nik || '-'}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    Mapel: {guru.mapelUtama || 'Umum'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: DATA SISWA PER JURUSAN */}
      {activeTab === 'SISWA' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Direktori Siswa Berdasarkan Jurusan</h3>
              <p className="text-xs text-slate-500">Pilih jurusan untuk menampilkan daftar siswa terkait</p>
            </div>

            <select
              value={selectedJurusanSiswaFilter}
              onChange={(e) => setSelectedJurusanSiswaFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] font-bold"
            >
              <option value="">-- Tampilkan Semua Jurusan --</option>
              {LIST_JURUSAN.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentsInJurusan.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                Tidak ada data siswa pada jurusan ini.
              </div>
            ) : (
              studentsInJurusan.map((siswa) => (
                <div
                  key={siswa.id}
                  onClick={() => setViewingProfileUser(siswa)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#FF69B4] hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src={siswa.foto}
                    alt={siswa.nama}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 group-hover:ring-[#FF69B4]"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-[#FF69B4] truncate">
                      {siswa.nama}
                    </p>
                    <p className="text-[10px] font-mono text-[#FF69B4] font-bold">NISN: {siswa.nisn || '-'}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      Jurusan: {siswa.jurusanAsal || 'Umum'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
