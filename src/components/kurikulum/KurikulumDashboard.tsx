import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LIST_JURUSAN, Kelas, MataPelajaran, KategoriMapel } from '../../types';
import {
  BookOpen,
  School,
  Plus,
  Edit3,
  Trash2,
  Users,
  GraduationCap,
  FileSpreadsheet,
  Search,
  ChevronRight,
  Download,
  AlertCircle,
  Check,
  X,
  Clock,
  Award,
  Layers,
  FileText,
  Briefcase,
} from 'lucide-react';
import { ModalBuatKelas } from '../ModalBuatKelas';
import { ModalBuatAkun } from '../ModalBuatAkun';
import { KelasDetailView } from '../admin/KelasDetailView';
import { RoleStatsSummary } from '../RoleStatsSummary';

export const KurikulumDashboard: React.FC = () => {
  const {
    mapelList,
    addMapel,
    updateMapel,
    deleteMapel,
    kelasList,
    deleteKelas,
    selectedKelasId,
    setSelectedKelasId,
    users,
    deleteUser,
    setViewingProfileUser,
    asesmenList,
    materiList,
    tugasList,
    generateNilai,
    exportToExcel,
  } = useApp();

  // Navigation tabs for Tim Kurikulum (Same capabilities as Admin + Kurikulum & Mapel focus)
  const [activeTab, setActiveTab] = useState<'MAPEL' | 'KELAS' | 'AKUN_GURU' | 'AKUN_SISWA' | 'ASESMEN'>('MAPEL');

  // Class & Account Modals state
  const [isModalBuatKelasOpen, setIsModalBuatKelasOpen] = useState(false);
  const [kelasToEdit, setKelasToEdit] = useState<Kelas | null>(null);
  const [isModalBuatAkunOpen, setIsModalBuatAkunOpen] = useState(false);
  const [akunRoleToCreate, setAkunRoleToCreate] = useState<'GURU' | 'SISWA'>('GURU');

  // Mapel Modal state
  const [isModalMapelOpen, setIsModalMapelOpen] = useState(false);
  const [mapelToEdit, setMapelToEdit] = useState<MataPelajaran | null>(null);
  const [kodeMapel, setKodeMapel] = useState('');
  const [namaMapel, setNamaMapel] = useState('');
  const [kategoriMapel, setKategoriMapel] = useState<KategoriMapel>('KEJURUAN');
  const [standarKurikulum, setStandarKurikulum] = useState('Kurikulum Merdeka SMK PK');
  const [kkmMapel, setKkmMapel] = useState<number>(75);
  const [jpMapel, setJpMapel] = useState<number>(6);
  const [capaianPembelajaran, setCapaianPembelajaran] = useState('');
  const [selectedJurusanTarget, setSelectedJurusanTarget] = useState<string[]>(['12 PPLG 2']);
  const [selectedGuruPengampu, setSelectedGuruPengampu] = useState<string[]>([]);

  // Filters
  const [searchMapel, setSearchMapel] = useState('');
  const [filterKategoriMapel, setFilterKategoriMapel] = useState<string>('');
  const [filterJurusanMapel, setFilterJurusanMapel] = useState<string>('');

  const [searchKelas, setSearchKelas] = useState('');
  const [selectedJurusanKelasFilter, setSelectedJurusanKelasFilter] = useState('');
  const [selectedJurusanSiswaFilter, setSelectedJurusanSiswaFilter] = useState('12 PPLG 2');
  const [searchGuru, setSearchGuru] = useState('');
  const [searchSiswa, setSearchSiswa] = useState('');
  const [filterAsesmenMapel, setFilterAsesmenMapel] = useState('');

  // If a class is currently opened, display KelasDetailView with full management capabilities
  if (selectedKelasId) {
    return (
      <KelasDetailView
        kelasId={selectedKelasId}
        onBack={() => setSelectedKelasId(null)}
        canManageClass={true}
      />
    );
  }

  // Open Modal Mapel (Add or Edit)
  const handleOpenModalMapel = (mapel?: MataPelajaran) => {
    if (mapel) {
      setMapelToEdit(mapel);
      setKodeMapel(mapel.kode);
      setNamaMapel(mapel.nama);
      setKategoriMapel(mapel.kategori);
      setStandarKurikulum(mapel.kurikulum);
      setKkmMapel(mapel.kkm);
      setJpMapel(mapel.jamPelajaran);
      setCapaianPembelajaran(mapel.capaianPembelajaran || '');
      setSelectedJurusanTarget(mapel.jurusanTarget || []);
      setSelectedGuruPengampu(mapel.guruPengampuIds || []);
    } else {
      setMapelToEdit(null);
      setKodeMapel(`MP-CNC-0${mapelList.length + 1}`);
      setNamaMapel('');
      setKategoriMapel('KEJURUAN');
      setStandarKurikulum('Kurikulum Merdeka SMK PK');
      setKkmMapel(75);
      setJpMapel(6);
      setCapaianPembelajaran('');
      setSelectedJurusanTarget(['12 PPLG 2']);
      setSelectedGuruPengampu([]);
    }
    setIsModalMapelOpen(true);
  };

  const handleSaveMapel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaMapel.trim()) return;

    const payload = {
      kode: kodeMapel.trim() || `MP-${Date.now().toString().slice(-4)}`,
      nama: namaMapel.trim(),
      kategori: kategoriMapel,
      kurikulum: standarKurikulum.trim() || 'Kurikulum Merdeka SMK PK',
      kkm: Number(kkmMapel) || 75,
      jamPelajaran: Number(jpMapel) || 4,
      capaianPembelajaran: capaianPembelajaran.trim(),
      jurusanTarget: selectedJurusanTarget.length > 0 ? selectedJurusanTarget : ['Semua Jurusan'],
      guruPengampuIds: selectedGuruPengampu,
    };

    if (mapelToEdit) {
      updateMapel(mapelToEdit.id, payload);
    } else {
      addMapel(payload);
    }

    setIsModalMapelOpen(false);
    setMapelToEdit(null);
  };

  const toggleJurusanTarget = (jur: string) => {
    setSelectedJurusanTarget((prev) =>
      prev.includes(jur) ? prev.filter((item) => item !== jur) : [...prev, jur]
    );
  };

  const toggleGuruPengampu = (guruId: string) => {
    setSelectedGuruPengampu((prev) =>
      prev.includes(guruId) ? prev.filter((id) => id !== guruId) : [...prev, guruId]
    );
  };

  // Filtered Mapel List
  const filteredMapel = mapelList.filter((m) => {
    const matchSearch =
      m.nama.toLowerCase().includes(searchMapel.toLowerCase()) ||
      m.kode.toLowerCase().includes(searchMapel.toLowerCase()) ||
      (m.capaianPembelajaran && m.capaianPembelajaran.toLowerCase().includes(searchMapel.toLowerCase()));
    const matchKategori = filterKategoriMapel ? m.kategori === filterKategoriMapel : true;
    const matchJurusan = filterJurusanMapel ? m.jurusanTarget.includes(filterJurusanMapel) : true;
    return matchSearch && matchKategori && matchJurusan;
  });

  // Filtered Class List
  const filteredKelas = kelasList.filter((k) => {
    const matchSearch =
      k.judul.toLowerCase().includes(searchKelas.toLowerCase()) ||
      (k.jurusan && k.jurusan.toLowerCase().includes(searchKelas.toLowerCase()));
    const matchJurusan = selectedJurusanKelasFilter ? k.jurusan === selectedJurusanKelasFilter : true;
    return matchSearch && matchJurusan;
  });

  // Filtered Teachers
  const allTeachers = users.filter((u) => u.role === 'GURU');
  const teachers = allTeachers.filter(
    (u) =>
      u.nama.toLowerCase().includes(searchGuru.toLowerCase()) ||
      (u.nik && u.nik.includes(searchGuru)) ||
      (u.mapelUtama && u.mapelUtama.toLowerCase().includes(searchGuru.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchGuru.toLowerCase()))
  );

  // Filtered Students grouped by Jurusan
  const studentsInSelectedJurusan = users.filter(
    (u) =>
      u.role === 'SISWA' &&
      (selectedJurusanSiswaFilter ? u.jurusanAsal === selectedJurusanSiswaFilter : true) &&
      (u.nama.toLowerCase().includes(searchSiswa.toLowerCase()) ||
        (u.nisn && u.nisn.includes(searchSiswa)) ||
        (u.email && u.email.toLowerCase().includes(searchSiswa.toLowerCase())))
  );

  // Filtered Assessments by Mapel
  const filteredAsesmen = asesmenList.filter((a) =>
    filterAsesmenMapel ? a.mapel.toLowerCase().includes(filterAsesmenMapel.toLowerCase()) : true
  );

  const avgKkm =
    mapelList.length > 0
      ? (mapelList.reduce((acc, m) => acc + m.kkm, 0) / mapelList.length).toFixed(1)
      : '75.0';

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar matching AdminDashboard style & main #069494 color */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-50 via-white to-teal-50/60 border border-teal-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-100/80 border border-teal-200 text-[#069494] text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dashboard Tim Kurikulum CNC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pusat Manajemen Kurikulum, Mapel &amp; Akademik
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola standar kurikulum, mata pelajaran (mapel), KKM, pembagian kelas &amp; guru pengampu, serta rekap nilai asesmen.
          </p>
        </div>

        {/* Action Buttons using main #069494 and Pink #FF69B4 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenModalMapel()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold shadow-md shadow-[#069494]/20 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mapel</span>
          </button>

          <button
            onClick={() => {
              setKelasToEdit(null);
              setIsModalBuatKelasOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-teal-50 text-[#069494] border border-teal-200 text-xs font-bold shadow-xs transition-all whitespace-nowrap"
          >
            <School className="w-4 h-4" />
            <span>Buat Kelas</span>
          </button>

          <button
            onClick={() => {
              setAkunRoleToCreate('GURU');
              setIsModalBuatAkunOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-teal-50 text-[#069494] border border-teal-200 text-xs font-bold shadow-xs transition-all whitespace-nowrap"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Tambah Guru</span>
          </button>

          <button
            onClick={() => {
              setAkunRoleToCreate('SISWA');
              setIsModalBuatAkunOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FF69B4] hover:bg-[#fa52a3] text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all whitespace-nowrap"
          >
            <Users className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Statistik & Jadwal Ujian Hari Ini */}
      <RoleStatsSummary
        onSelectKelas={(id) => setSelectedKelasId(id)}
        onNavigateTab={(tab) => setActiveTab(tab as any)}
      />

      {/* Main Kurikulum Tab Navigator */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-bold pb-1">
        {[
          { id: 'MAPEL', label: 'Kurikulum & Mata Pelajaran', icon: BookOpen, count: mapelList.length },
          { id: 'KELAS', label: 'Manajemen Kelas', icon: School, count: kelasList.length },
          { id: 'AKUN_GURU', label: 'Data Guru & Mapel', icon: GraduationCap, count: allTeachers.length },
          { id: 'AKUN_SISWA', label: 'Data Siswa (Per Jurusan)', icon: Users, count: users.filter((u) => u.role === 'SISWA').length },
          { id: 'ASESMEN', label: 'Monitor Asesmen & Nilai Excel', icon: FileSpreadsheet, count: asesmenList.length },
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
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/15 text-[10px] font-mono tabular-nums">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: KURIKULUM & MATA PELAJARAN (MAPEL) */}
      {activeTab === 'MAPEL' && (
        <div className="space-y-5">
          {/* Filter & Search Bar for Mapel */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchMapel}
                onChange={(e) => setSearchMapel(e.target.value)}
                placeholder="Cari nama mata pelajaran, kode mapel, atau capaian pembelajaran..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterKategoriMapel}
                onChange={(e) => setFilterKategoriMapel(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] font-medium"
              >
                <option value="">-- Semua Kelompok Mapel --</option>
                <option value="KEJURUAN">Kejuruan / Produktif</option>
                <option value="UMUM">Muatan Nasional / Umum</option>
                <option value="PILIHAN">Mapel Pilihan</option>
                <option value="MUATAN_LOKAL">Muatan Lokal</option>
              </select>

              <select
                value={filterJurusanMapel}
                onChange={(e) => setFilterJurusanMapel(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] font-medium"
              >
                <option value="">-- Filter Jurusan Target --</option>
                {LIST_JURUSAN.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleOpenModalMapel()}
                className="px-3.5 py-2 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Mapel</span>
              </button>
            </div>
          </div>

          {/* Mata Pelajaran Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMapel.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                Tidak ada mata pelajaran yang ditemukan. Klik tombol "Tambah Mapel" untuk menambahkan mata pelajaran baru.
              </div>
            ) : (
              filteredMapel.map((mapel) => {
                const guruPengampu = users.filter((u) => mapel.guruPengampuIds.includes(u.id));
                const relatedMateriCount = materiList.filter((m) =>
                  m.mapel.toLowerCase().includes(mapel.nama.toLowerCase()) ||
                  mapel.nama.toLowerCase().includes(m.mapel.toLowerCase())
                ).length;
                const relatedTugasCount = tugasList.filter((t) =>
                  t.mapel.toLowerCase().includes(mapel.nama.toLowerCase()) ||
                  mapel.nama.toLowerCase().includes(t.mapel.toLowerCase())
                ).length;
                const relatedAsesmenCount = asesmenList.filter((a) =>
                  a.mapel.toLowerCase().includes(mapel.nama.toLowerCase()) ||
                  mapel.nama.toLowerCase().includes(a.mapel.toLowerCase())
                ).length;

                return (
                  <div
                    key={mapel.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-[#069494] hover:shadow-md transition-all flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      {/* Top Header Metadata */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <span className="font-mono font-bold text-[#069494]">{mapel.kode}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-700">{mapel.kategori}</span>
                          <span aria-hidden="true">·</span>
                          <span>{mapel.kurikulum}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenModalMapel(mapel)}
                            className="p-1.5 text-slate-400 hover:text-[#069494] hover:bg-teal-50 rounded-lg transition-colors"
                            title="Edit Mata Pelajaran & KKM"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus mata pelajaran "${mapel.nama}" dari struktur kurikulum?`)) {
                                deleteMapel(mapel.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Mata Pelajaran"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Subject Title */}
                      <h3 className="text-lg font-extrabold text-slate-900">
                        {mapel.nama}
                      </h3>

                      {/* Capaian Pembelajaran */}
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                        {mapel.capaianPembelajaran || 'Capaian pembelajaran mengikuti standar Kurikulum Merdeka.'}
                      </p>

                      {/* KKM & JP Bar */}
                      <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Standar KKM</span>
                          <span className="font-mono font-bold text-[#069494] tabular-nums">{mapel.kkm} Poin</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Beban Belajar</span>
                          <span className="font-mono font-bold text-slate-800 tabular-nums">{mapel.jamPelajaran} JP / Minggu</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Aktivitas Mapel</span>
                          <span className="font-mono font-bold text-[#FF69B4] tabular-nums">
                            {relatedMateriCount} Modul · {relatedAsesmenCount} Ujian
                          </span>
                        </div>
                      </div>

                      {/* Guru Pengampu & Jurusan Target */}
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-slate-500 shrink-0">Guru Pengampu:</span>
                          <span className="font-bold text-slate-800 text-right">
                            {guruPengampu.length > 0
                              ? guruPengampu.map((g) => g.nama).join(', ')
                              : 'Belum ditugaskan'}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <span className="text-slate-500 shrink-0">Jurusan / Tingkat:</span>
                          <span className="text-slate-700 font-medium text-right">
                            {mapel.jurusanTarget.slice(0, 4).join(', ')}
                            {mapel.jurusanTarget.length > 4 && ` +${mapel.jurusanTarget.length - 4} lainnya`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>Penugasan Projek Aktif: {relatedTugasCount} Tugas</span>
                          <button
                            onClick={() => {
                              setFilterAsesmenMapel(mapel.nama);
                              setActiveTab('ASESMEN');
                            }}
                            className="font-bold text-[#069494] hover:underline flex items-center gap-1"
                          >
                            <span>Pantau Asesmen Mapel</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
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

      {/* TAB 2: MANAJEMEN KELAS (Sama seperti Admin) */}
      {activeTab === 'KELAS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKelas}
                onChange={(e) => setSearchKelas(e.target.value)}
                placeholder="Cari nama kelas atau jurusan..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white transition-all"
              />
            </div>

            <div className="w-full sm:w-64">
              <select
                value={selectedJurusanKelasFilter}
                onChange={(e) => setSelectedJurusanKelasFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white font-medium transition-all"
              >
                <option value="">-- Filter Semua Jurusan --</option>
                {LIST_JURUSAN.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKelas.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                Tidak ada kelas yang ditemukan. Klik tombol "Buat Kelas" untuk menambahkan kelas baru.
              </div>
            ) : (
              filteredKelas.map((k) => {
                const walas = users.find((u) => u.id === k.walasId);

                return (
                  <div
                    key={k.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-[#069494] hover:shadow-md transition-all flex flex-col justify-between group shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-[#069494]">
                          {k.jurusan || 'Kejuruan'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setKelasToEdit(k);
                              setIsModalBuatKelasOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#069494] hover:bg-teal-50 rounded-lg transition-colors"
                            title="Edit Kelas"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus kelas "${k.judul}"? Semua data di dalamnya akan terhapus.`)) {
                                deleteKelas(k.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Kelas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3
                        onClick={() => setSelectedKelasId(k.id)}
                        className="text-lg font-extrabold text-slate-900 group-hover:text-[#069494] cursor-pointer transition-colors"
                      >
                        {k.judul}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {k.deskripsi || 'Ruang kelas akademik SMK/SMA CNC.'}
                      </p>

                      <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                        <GraduationCap className="w-4 h-4 text-[#069494] shrink-0" />
                        <div className="text-xs truncate">
                          <span className="text-[10px] text-slate-400 block font-medium">Wali Kelas:</span>
                          <span className="font-bold text-slate-800">
                            {walas ? walas.nama : <span className="italic text-slate-400 font-normal">Belum disetel</span>}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-semibold text-[#069494] tabular-nums">
                          <Users className="w-3.5 h-3.5" />
                          <span>{k.siswaIds.length} Siswa</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 font-medium">
                          Kode: {k.kodeGabung}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedKelasId(k.id)}
                      className="mt-4 w-full py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-[#069494] text-[#069494] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Buka Kelas &amp; Kelola Akademik</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DATA AKUN GURU & PEMETAAN MAPEL */}
      {activeTab === 'AKUN_GURU' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Data Guru &amp; Pengampu Mata Pelajaran</h3>
              <p className="text-xs text-slate-500">Kelola penugasan mata pelajaran utama dan rombel kelas tiap guru</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchGuru}
                  onChange={(e) => setSearchGuru(e.target.value)}
                  placeholder="Cari nama, NIK, atau mapel..."
                  className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white"
                />
              </div>
              <button
                onClick={() => {
                  setAkunRoleToCreate('GURU');
                  setIsModalBuatAkunOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Guru</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teachers.map((guru) => {
              const guruMateriCount = materiList.filter((m) => m.guruId === guru.id).length;
              const guruAsesmenCount = asesmenList.filter((a) => a.guruId === guru.id).length;

              return (
                <div
                  key={guru.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#069494] hover:shadow-sm transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => setViewingProfileUser(guru)}
                      className="flex items-start gap-3 cursor-pointer min-w-0 flex-1"
                    >
                      <img
                        src={guru.foto}
                        alt={guru.nama}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 hover:text-[#069494] transition-colors truncate">
                          {guru.nama}
                        </p>
                        <p className="text-[10px] font-mono text-[#069494] font-semibold tabular-nums">
                          NIK: {guru.nik || '-'}
                        </p>
                        <p className="text-[11px] text-slate-700 truncate mt-0.5 font-semibold">
                          Mapel: {guru.mapelUtama || 'Guru Mapel Umum'}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{guru.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setViewingProfileUser(guru)}
                        className="p-1.5 text-slate-400 hover:text-[#069494] hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit Profil & Mapel Guru"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus akun guru ${guru.nama}?`)) {
                            deleteUser(guru.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Guru"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                    <span>{guruMateriCount} Modul Materi</span>
                    <span>·</span>
                    <span className="text-[#069494] font-semibold">{guruAsesmenCount} Asesmen Dibuat</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: DATA AKUN SISWA PER JURUSAN */}
      {activeTab === 'AKUN_SISWA' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Data Akun Siswa Per Jurusan</h3>
              <p className="text-xs text-slate-500">
                Pilih jurusan di bawah untuk menampilkan data siswa terkait, edit data siswa, atau hapus siswa
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="w-full sm:w-60">
                <select
                  value={selectedJurusanSiswaFilter}
                  onChange={(e) => setSelectedJurusanSiswaFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#FF69B4] font-bold"
                >
                  <option value="">-- Semua Jurusan --</option>
                  {LIST_JURUSAN.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchSiswa}
                  onChange={(e) => setSearchSiswa(e.target.value)}
                  placeholder="Cari siswa atau NISN..."
                  className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#FF69B4]"
                />
              </div>

              <button
                onClick={() => {
                  setAkunRoleToCreate('SISWA');
                  setIsModalBuatAkunOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#FF69B4] hover:bg-[#fa52a3] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Siswa</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentsInSelectedJurusan.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                Tidak ada siswa yang terdaftar di jurusan "{selectedJurusanSiswaFilter || 'Semua'}". Klik "Tambah Siswa" untuk mendaftarkan akun siswa baru.
              </div>
            ) : (
              studentsInSelectedJurusan.map((siswa) => (
                <div
                  key={siswa.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#FF69B4] hover:shadow-sm transition-all flex items-start justify-between gap-3"
                >
                  <div
                    onClick={() => setViewingProfileUser(siswa)}
                    className="flex items-start gap-3 cursor-pointer min-w-0 flex-1"
                  >
                    <img
                      src={siswa.foto}
                      alt={siswa.nama}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 hover:text-[#FF69B4] transition-colors truncate">
                        {siswa.nama}
                      </p>
                      <p className="text-[10px] font-mono text-[#FF69B4] font-bold tabular-nums">
                        NISN: {siswa.nisn || '-'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        Jurusan: {siswa.jurusanAsal || 'Umum'}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{siswa.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setViewingProfileUser(siswa)}
                      className="p-1.5 text-slate-400 hover:text-[#FF69B4] hover:bg-pink-50 rounded-lg transition-colors"
                      title="Edit Akun Siswa"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus akun siswa ${siswa.nama}?`)) {
                          deleteUser(siswa.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Siswa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: MONITOR ASESMEN PER MAPEL & GENERATE NILAI */}
      {activeTab === 'ASESMEN' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Monitor Asesmen per Mata Pelajaran &amp; Export Nilai Excel
              </h3>
              <p className="text-xs text-slate-500">
                Pantau kesesuaian soal ujian/quiz terhadap mata pelajaran dan unduh rekap nilai (.csv)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterAsesmenMapel}
                onChange={(e) => setFilterAsesmenMapel(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] font-semibold"
              >
                <option value="">-- Semua Mata Pelajaran --</option>
                {mapelList.map((m) => (
                  <option key={m.id} value={m.nama}>
                    {m.nama} ({m.kode})
                  </option>
                ))}
              </select>

              {filterAsesmenMapel && (
                <button
                  onClick={() => setFilterAsesmenMapel('')}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAsesmen.map((asesmen) => {
              const guruPembuat = users.find((u) => u.id === asesmen.guruId);
              const kelas = kelasList.find((k) => k.id === asesmen.kelasId);
              const matchedMapel = mapelList.find((m) =>
                m.nama.toLowerCase().includes(asesmen.mapel.toLowerCase()) ||
                asesmen.mapel.toLowerCase().includes(m.nama.toLowerCase())
              );

              return (
                <div
                  key={asesmen.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-[#069494] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                      <span className="font-bold text-[#069494]">
                        {asesmen.tipe} {matchedMapel ? `· ${matchedMapel.kode}` : ''}
                      </span>
                      <span
                        className={`font-bold ${
                          asesmen.status === 'SELESAI' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {asesmen.status === 'SELESAI' ? 'Dipublikasikan' : 'Sedang Diproses (Draft)'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">{asesmen.judul}</h3>
                    <p className="text-xs text-[#069494] mt-0.5 font-bold">
                      Mapel: {asesmen.mapel} {matchedMapel ? `(KKM: ${matchedMapel.kkm})` : ''}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {asesmen.deskripsi || 'Tidak ada deskripsi'}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Guru Pembuat:</span>
                        <span className="font-bold text-slate-800">
                          {guruPembuat ? guruPembuat.nama : 'Guru CNC'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Target Kelas:</span>
                        <span className="font-bold text-slate-800">
                          {kelas ? kelas.judul : 'Semua Kelas'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Total Butir Soal:</span>
                        <span className="font-bold text-[#069494] font-mono tabular-nums">
                          {asesmen.soalList.length} Soal
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => {
                        generateNilai(asesmen.id);
                        alert(`Nilai untuk asesmen "${asesmen.judul}" berhasil di-generate!`);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#069494] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Generate Nilai</span>
                    </button>

                    <button
                      onClick={() => exportToExcel(asesmen.id)}
                      className="py-2 px-3 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#069494]/20"
                      title="Download File Excel / CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Excel</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL BUAT / EDIT MATA PELAJARAN & KURIKULUM */}
      {isModalMapelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-50 border border-teal-200 text-[#069494]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {mapelToEdit ? 'Edit Mata Pelajaran & Standar Kurikulum' : 'Tambah Mata Pelajaran Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pengaturan kode mapel, standar KKM, beban JP, dan guru pengampu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalMapelOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMapel} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Mapel <span className="text-[#FF69B4]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={kodeMapel}
                    onChange={(e) => setKodeMapel(e.target.value)}
                    placeholder="MP-PPLG-01"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Mata Pelajaran <span className="text-[#FF69B4]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={namaMapel}
                    onChange={(e) => setNamaMapel(e.target.value)}
                    placeholder="Contoh: Pemrograman Web & Perangkat Bergerak"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelompok / Kategori Mapel
                  </label>
                  <select
                    value={kategoriMapel}
                    onChange={(e) => setKategoriMapel(e.target.value as KategoriMapel)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                  >
                    <option value="KEJURUAN">Kejuruan / Produktif</option>
                    <option value="UMUM">Muatan Nasional / Umum</option>
                    <option value="PILIHAN">Mata Pelajaran Pilihan</option>
                    <option value="MUATAN_LOKAL">Muatan Lokal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Standar Kurikulum
                  </label>
                  <input
                    type="text"
                    value={standarKurikulum}
                    onChange={(e) => setStandarKurikulum(e.target.value)}
                    placeholder="Kurikulum Merdeka SMK PK"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Standar KKM / SKM (0 - 100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={kkmMapel}
                    onChange={(e) => setKkmMapel(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Pelajaran (JP / Minggu)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={jpMapel}
                    onChange={(e) => setJpMapel(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Capaian Pembelajaran (CP) / Deskripsi Silabus
                </label>
                <textarea
                  rows={2}
                  value={capaianPembelajaran}
                  onChange={(e) => setCapaianPembelajaran(e.target.value)}
                  placeholder="Ringkasan kompetensi dasar atau capaian pembelajaran mata pelajaran ini..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                />
              </div>

              {/* Pilih Guru Pengampu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Guru Pengampu Mapel:
                </label>
                <div className="max-h-28 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                  {allTeachers.map((g) => {
                    const isChecked = selectedGuruPengampu.includes(g.id);
                    return (
                      <label
                        key={g.id}
                        onClick={() => toggleGuruPengampu(g.id)}
                        className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer select-none ${
                          isChecked ? 'bg-teal-50 text-[#069494] font-bold' : 'text-slate-600 hover:bg-white'
                        }`}
                      >
                        <span>
                          {g.nama} ({g.mapelUtama || 'Guru'})
                        </span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 text-[#069494] rounded"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Pilih Jurusan Target */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Tingkat / Jurusan:
                </label>
                <div className="max-h-28 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-1 text-[11px]">
                  {LIST_JURUSAN.slice(0, 24).map((jur) => {
                    const isChecked = selectedJurusanTarget.includes(jur);
                    return (
                      <label
                        key={jur}
                        onClick={() => toggleJurusanTarget(jur)}
                        className={`flex items-center gap-1.5 p-1 rounded-lg cursor-pointer select-none ${
                          isChecked ? 'bg-teal-50 text-[#069494] font-bold' : 'text-slate-600 hover:bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-3 h-3 text-[#069494] rounded"
                        />
                        <span className="truncate">{jur}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalMapelOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#069494] hover:bg-[#057c7c] text-white shadow-md shadow-[#069494]/20 flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{mapelToEdit ? 'Simpan Perubahan Mapel' : 'Simpan Mata Pelajaran'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Existing Modals for Kelas & Akun */}
      <ModalBuatKelas
        isOpen={isModalBuatKelasOpen}
        onClose={() => {
          setIsModalBuatKelasOpen(false);
          setKelasToEdit(null);
        }}
        kelasToEdit={kelasToEdit}
      />

      <ModalBuatAkun
        isOpen={isModalBuatAkunOpen}
        onClose={() => setIsModalBuatAkunOpen(false)}
        defaultRole={akunRoleToCreate}
        defaultJurusan={selectedJurusanSiswaFilter}
      />
    </div>
  );
};
