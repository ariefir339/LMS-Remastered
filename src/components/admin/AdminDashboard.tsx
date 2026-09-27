import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LIST_JURUSAN, Kelas, User } from '../../types';
import {
  School,
  Plus,
  Edit3,
  Trash2,
  Users,
  GraduationCap,
  FileSpreadsheet,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Shield,
  Download,
  AlertCircle,
  Eye,
  Building,
} from 'lucide-react';
import { ModalBuatKelas } from '../ModalBuatKelas';
import { ModalBuatAkun } from '../ModalBuatAkun';
import { KelasDetailView } from './KelasDetailView';

export const AdminDashboard: React.FC = () => {
  const {
    kelasList,
    deleteKelas,
    selectedKelasId,
    setSelectedKelasId,
    users,
    deleteUser,
    setViewingProfileUser,
    asesmenList,
    generateNilai,
    exportToExcel,
    deleteNilaiRekap,
    nilaiRekapList,
  } = useApp();

  // Navigation tabs for Admin
  const [adminTab, setAdminTab] = useState<'KELAS' | 'AKUN_GURU' | 'AKUN_SISWA' | 'ASESMEN'>('KELAS');

  // Modals state
  const [isModalBuatKelasOpen, setIsModalBuatKelasOpen] = useState(false);
  const [kelasToEdit, setKelasToEdit] = useState<Kelas | null>(null);
  const [isModalBuatAkunOpen, setIsModalBuatAkunOpen] = useState(false);
  const [akunRoleToCreate, setAkunRoleToCreate] = useState<'GURU' | 'SISWA'>('GURU');

  // Filters
  const [searchKelas, setSearchKelas] = useState('');
  const [selectedJurusanKelasFilter, setSelectedJurusanKelasFilter] = useState('');
  const [selectedJurusanSiswaFilter, setSelectedJurusanSiswaFilter] = useState('12 PPLG 2');
  const [searchGuru, setSearchGuru] = useState('');
  const [searchSiswa, setSearchSiswa] = useState('');

  // If a class is currently opened, display KelasDetailView
  if (selectedKelasId) {
    return (
      <KelasDetailView
        kelasId={selectedKelasId}
        onBack={() => setSelectedKelasId(null)}
        canManageClass={true}
      />
    );
  }

  // Filtered Class List
  const filteredKelas = kelasList.filter((k) => {
    const matchSearch =
      k.judul.toLowerCase().includes(searchKelas.toLowerCase()) ||
      (k.jurusan && k.jurusan.toLowerCase().includes(searchKelas.toLowerCase()));
    const matchJurusan = selectedJurusanKelasFilter ? k.jurusan === selectedJurusanKelasFilter : true;
    return matchSearch && matchJurusan;
  });

  // Filtered Teachers
  const teachers = users.filter(
    (u) =>
      u.role === 'GURU' &&
      (u.nama.toLowerCase().includes(searchGuru.toLowerCase()) ||
        (u.nik && u.nik.includes(searchGuru)) ||
        (u.email && u.email.toLowerCase().includes(searchGuru.toLowerCase())))
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

  return (
    <div className="space-y-6">
      {/* Top Welcome & Stats Bar with Figma Palette Gradient */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-50 via-white to-cyan-50 border border-teal-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-100/80 border border-teal-200 text-[#069494] text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Dashboard Administrator CNC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pusat Kendali Akademik &amp; Manajemen Data
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola kelas, rombel jurusan, akun guru &amp; siswa, serta ekspor nilai asesmen.
          </p>
        </div>

        {/* Action Buttons using Figma Teal #069494 and Pink #FF69B4 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setKelasToEdit(null);
              setIsModalBuatKelasOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold shadow-md shadow-[#069494]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Kelas</span>
          </button>

          <button
            onClick={() => {
              setAkunRoleToCreate('GURU');
              setIsModalBuatAkunOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-teal-50 text-[#069494] border border-teal-200 text-xs font-bold shadow-xs transition-all"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Tambah Guru</span>
          </button>

          <button
            onClick={() => {
              setAkunRoleToCreate('SISWA');
              setIsModalBuatAkunOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#FF69B4] hover:bg-[#fa52a3] text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Main Admin Tab Navigator */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-bold pb-1">
        {[
          { id: 'KELAS', label: 'Manajemen Kelas', icon: School, count: kelasList.length },
          { id: 'AKUN_GURU', label: 'Data Akun Guru (CRUD)', icon: GraduationCap, count: teachers.length },
          { id: 'AKUN_SISWA', label: 'Data Akun Siswa (Per Jurusan)', icon: Users, count: users.filter((u) => u.role === 'SISWA').length },
          { id: 'ASESMEN', label: 'Monitor Asesmen & Nilai Excel', icon: FileSpreadsheet, count: asesmenList.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#069494] text-white shadow-md shadow-[#069494]/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/15 text-[10px] font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MANAJEMEN KELAS */}
      {adminTab === 'KELAS' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
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

          {/* Classes Grid */}
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
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-[#069494] border border-teal-200">
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

                      {/* Class Title */}
                      <h3
                        onClick={() => setSelectedKelasId(k.id)}
                        className="text-lg font-extrabold text-slate-900 group-hover:text-[#069494] cursor-pointer transition-colors"
                      >
                        {k.judul}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {k.deskripsi || 'Ruang kelas akademik SMK/SMA CNC.'}
                      </p>

                      {/* Walas Info */}
                      <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                        <GraduationCap className="w-4 h-4 text-[#069494] shrink-0" />
                        <div className="text-xs truncate">
                          <span className="text-[10px] text-slate-400 block font-medium">Wali Kelas:</span>
                          <span className="font-bold text-slate-800">
                            {walas ? walas.nama : <span className="italic text-slate-400 font-normal">Belum disetel</span>}
                          </span>
                        </div>
                      </div>

                      {/* Members Count */}
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-semibold text-[#069494]">
                          <Users className="w-3.5 h-3.5" />
                          <span>{k.siswaIds.length} Siswa</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 font-medium">
                          Kode: {k.kodeGabung}
                        </span>
                      </div>
                    </div>

                    {/* Enter Class Button */}
                    <button
                      onClick={() => setSelectedKelasId(k.id)}
                      className="mt-4 w-full py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-[#069494] text-[#069494] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Buka Kelas &amp; Kelola Siswa</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DATA AKUN GURU (CRUD LANGSUNG) */}
      {adminTab === 'AKUN_GURU' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Daftar Akun Guru &amp; Petugas</h3>
              <p className="text-xs text-slate-500">Guru ditampilkan langsung dengan aksi CRUD penuh</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchGuru}
                  onChange={(e) => setSearchGuru(e.target.value)}
                  placeholder="Cari nama, NIK, email..."
                  className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white"
                />
              </div>
              <button
                onClick={() => {
                  setAkunRoleToCreate('GURU');
                  setIsModalBuatAkunOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Guru</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {teachers.map((guru) => (
              <div
                key={guru.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#069494] hover:shadow-sm transition-all flex items-start justify-between gap-3"
              >
                <div
                  onClick={() => setViewingProfileUser(guru)}
                  className="flex items-start gap-3 cursor-pointer min-w-0 flex-1"
                >
                  <img
                    src={guru.foto}
                    alt={guru.nama}
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 hover:text-[#069494] transition-colors truncate">
                      {guru.nama}
                    </p>
                    <p className="text-[10px] font-mono text-[#069494] font-semibold">NIK: {guru.nik || '-'}</p>
                    <p className="text-[11px] text-slate-600 truncate mt-0.5 font-medium">
                      {guru.mapelUtama || 'Guru Mapel'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{guru.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setViewingProfileUser(guru)}
                    className="p-1.5 text-slate-400 hover:text-[#069494] hover:bg-teal-50 rounded-lg transition-colors"
                    title="Edit Profil Guru"
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
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DATA AKUN SISWA (DIKELOMPOKKAN BERDASARKAN KELAS / JURUSAN) */}
      {adminTab === 'AKUN_SISWA' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Data Akun Siswa Per Jurusan</h3>
              <p className="text-xs text-slate-500">
                Pilih jurusan di bawah untuk menampilkan data siswa terkait, edit data siswa, atau hapus siswa
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Dropdown Jurusan */}
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

              {/* Search input */}
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
                className="px-3.5 py-2 rounded-xl bg-[#FF69B4] hover:bg-[#fa52a3] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Siswa</span>
              </button>
            </div>
          </div>

          {/* Student Cards */}
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
                      className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 hover:text-[#FF69B4] transition-colors truncate">
                        {siswa.nama}
                      </p>
                      <p className="text-[10px] font-mono text-[#FF69B4] font-bold">NISN: {siswa.nisn || '-'}</p>
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

      {/* TAB 4: ASESMEN & GENERATE NILAI */}
      {adminTab === 'ASESMEN' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-[#069494] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#069494] shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Ketentuan Hak Akses Admin Terhadap Asesmen Guru:</strong>
              <p className="text-slate-600 mt-0.5">
                Admin <strong>tidak bisa</strong> mengedit atau menghapus asesmen milik guru. Admin memiliki wewenang untuk memantau status ujian, melihat jawaban yang telah dikumpulkan siswa, serta men-generate dan mengunduh berkas Rekap Nilai ke format Excel (.csv).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {asesmenList.map((asesmen) => {
              const guruPembuat = users.find((u) => u.id === asesmen.guruId);
              const kelas = kelasList.find((k) => k.id === asesmen.kelasId);

              return (
                <div
                  key={asesmen.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-[#069494] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#069494] border border-teal-200">
                        {asesmen.tipe}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          asesmen.status === 'SELESAI'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {asesmen.status === 'SELESAI' ? 'Dipublikasikan' : 'Sedang Diproses (Draft)'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">{asesmen.judul}</h3>
                    <p className="text-xs text-[#069494] mt-0.5 font-bold">{asesmen.mapel}</p>
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
                        <span>Total Soal:</span>
                        <span className="font-bold text-[#069494]">
                          {asesmen.soalList.length} Soal
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions */}
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

      {/* Modals */}
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
