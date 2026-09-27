import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Asesmen, Kelas, TipeAsesmen } from '../../types';
import {
  GraduationCap,
  School,
  FileSpreadsheet,
  Plus,
  Clock,
  ChevronRight,
  BookOpen,
  Send,
  Trash2,
  Users,
  AlertCircle,
  FileCheck,
  FolderSync,
  Briefcase,
} from 'lucide-react';
import { KelasDetailView } from '../admin/KelasDetailView';
import { AsesmenDetailView } from './AsesmenDetailView';
import { MateriModuleView } from '../materi/MateriModuleView';
import { TugasProjekView } from '../tugas/TugasProjekView';
import { RekapNilaiView } from '../nilai/RekapNilaiView';

export const GuruDashboard: React.FC = () => {
  const {
    currentUser,
    kelasList,
    asesmenList,
    createAsesmen,
    deleteAsesmen,
    selectedKelasId,
    setSelectedKelasId,
    selectedAsesmenId,
    setSelectedAsesmenId,
  } = useApp();

  const [guruTab, setGuruTab] = useState<'KELAS' | 'MATERI' | 'TUGAS' | 'ASESMEN' | 'NILAI'>('KELAS');

  // Modal create assessment state
  const [isModalCreateAsesmenOpen, setIsModalCreateAsesmenOpen] = useState(false);
  const [targetKelasForExam, setTargetKelasForExam] = useState<string>('');
  const [createFromClassId, setCreateFromClassId] = useState<string | null>(null);

  // Form values
  const [judul, setJudul] = useState('');
  const [tipe, setTipe] = useState<TipeAsesmen>('UJIAN_ONLINE');
  const [mapel, setMapel] = useState(currentUser?.mapelUtama || 'Pemrograman Web');
  const [durasiMenit, setDurasiMenit] = useState<number>(30);
  const [deskripsi, setDeskripsi] = useState('');
  const [sourceDraftId, setSourceDraftId] = useState<string>(''); // For "Kirim dari asesmen"

  // If viewing a class detail
  if (selectedKelasId) {
    return (
      <KelasDetailView
        kelasId={selectedKelasId}
        onBack={() => setSelectedKelasId(null)}
        canManageClass={false} // Guru cannot edit/delete class or manipulate other admin functions
      />
    );
  }

  // If viewing an assessment builder
  if (selectedAsesmenId) {
    return (
      <AsesmenDetailView
        asesmenId={selectedAsesmenId}
        onBack={() => setSelectedAsesmenId(null)}
      />
    );
  }

  // Classes where this teacher is Wali Kelas
  const kelasWalas = kelasList.filter((k) => k.walasId === currentUser?.id);
  // Classes where this teacher teaches
  const kelasPengajar = kelasList.filter(
    (k) => k.guruIds.includes(currentUser?.id || '') && k.walasId !== currentUser?.id
  );

  // Teacher's assessments
  const myAssessments = asesmenList.filter((a) => a.guruId === currentUser?.id);
  const asesmenDiproses = myAssessments.filter((a) => a.status === 'PROSES');
  const asesmenSelesai = myAssessments.filter((a) => a.status === 'SELESAI');

  const handleCreateAsesmenSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If "Kirim dari asesmen" was selected
    if (sourceDraftId) {
      const source = asesmenList.find((a) => a.id === sourceDraftId);
      if (source && createFromClassId) {
        const newAssigned = createAsesmen({
          ...source,
          id: undefined,
          judul: `${source.judul} (${kelasList.find((k) => k.id === createFromClassId)?.judul || 'Kelas'})`,
          kelasId: createFromClassId,
          status: 'SELESAI',
        });
        setIsModalCreateAsesmenOpen(false);
        setSelectedAsesmenId(newAssigned.id);
        return;
      }
    }

    const newCreated = createAsesmen({
      judul: judul.trim() || `${tipe === 'QUIZ' ? 'Quiz' : 'Ujian'} ${mapel}`,
      tipe,
      mapel: mapel.trim(),
      deskripsi: deskripsi.trim(),
      durasiMenit: tipe === 'QUIZ' ? durasiMenit : undefined,
      kelasId: createFromClassId || (targetKelasForExam || undefined),
      status: 'PROSES', // Default draft/proses unless finished
    });

    setIsModalCreateAsesmenOpen(false);
    // Reset
    setJudul('');
    setDeskripsi('');
    setSourceDraftId('');
    setSelectedAsesmenId(newCreated.id);
  };

  const openModalForClass = (kelasId: string, examType: TipeAsesmen) => {
    setCreateFromClassId(kelasId);
    setTipe(examType);
    setSourceDraftId('');
    setIsModalCreateAsesmenOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Portal Tenaga Pendidik &amp; Guru</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Selamat Datang, {currentUser?.nama}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mata Pelajaran: <span className="text-cyan-400 font-semibold">{currentUser?.mapelUtama || 'Semua Bidang'}</span> • Kelola kelas pengajaran, modul materi, penugasan projek &amp; asesmen.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateFromClassId(null);
            setSourceDraftId('');
            setIsModalCreateAsesmenOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Asesmen Baru</span>
        </button>
      </div>

      {/* Modern LMS Desktop PC Tab Navigation Bar */}
      <div className="flex border-b border-slate-800 gap-1 pb-1 overflow-x-auto">
        {[
          { id: 'KELAS', label: 'Kelas Saya', icon: School },
          { id: 'MATERI', label: 'Upload Materi (PDF & Link)', icon: BookOpen },
          { id: 'TUGAS', label: 'Tugas & Projek Siswa', icon: Briefcase },
          { id: 'ASESMEN', label: 'Asesmen & Bank Soal', icon: FileCheck, count: myAssessments.length },
          { id: 'NILAI', label: 'Rekap & Generate Nilai', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = guruTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setGuruTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
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

      {/* TAB 1: KELAS */}
      {guruTab === 'KELAS' && (
        <div className="space-y-8">
          {/* Section 1: Kelas yang Dipegang (Walas) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-base font-bold text-white">Kelas yang Dipegang (Wali Kelas)</h3>
            </div>
            <p className="text-xs text-slate-400">
              Kelas yang menjadi tanggung jawab perwalian Anda. Klik card kelas untuk membuka stream pengumuman &amp; daftar siswa.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kelasWalas.length === 0 ? (
                <div className="col-span-full p-6 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                  Anda belum ditugaskan sebagai wali kelas di rombel manapun.
                </div>
              ) : (
                kelasWalas.map((k) => (
                  <div
                    key={k.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 transition-all flex flex-col justify-between shadow-lg group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          Wali Kelas
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Kode: {k.kodeGabung}</span>
                      </div>
                      <h4
                        onClick={() => setSelectedKelasId(k.id)}
                        className="text-lg font-bold text-white group-hover:text-emerald-300 cursor-pointer transition-colors"
                      >
                        {k.judul}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {k.deskripsi || 'Kelas perwalian akademik CNC.'}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{k.siswaIds.length} Siswa</span>
                        </span>
                        <span>{k.guruIds.length} Guru Pengajar</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                      <button
                        onClick={() => setSelectedKelasId(k.id)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                      >
                        <span>Buka Kelas</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openModalForClass(k.id, 'UJIAN_ONLINE')}
                          className="py-1.5 px-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Ujian Online</span>
                        </button>
                        <button
                          onClick={() => openModalForClass(k.id, 'QUIZ')}
                          className="py-1.5 px-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Quiz Kilat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 2: Deretan Kelas yang Masuk (Guru Pengajar) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-base font-bold text-white">Deretan Kelas yang Masuk (Guru Pengajar)</h3>
            </div>
            <p className="text-xs text-slate-400">
              Kelas-kelas di mana Anda bertugas memberikan materi dan asesmen mata pelajaran.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kelasPengajar.length === 0 ? (
                <div className="col-span-full p-6 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                  Belum ada kelas pengajar tambahan yang ditugaskan.
                </div>
              ) : (
                kelasPengajar.map((k) => (
                  <div
                    key={k.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          Guru Pengajar
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Kode: {k.kodeGabung}</span>
                      </div>
                      <h4
                        onClick={() => setSelectedKelasId(k.id)}
                        className="text-lg font-bold text-white group-hover:text-cyan-300 cursor-pointer transition-colors"
                      >
                        {k.judul}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {k.deskripsi || 'Kelas akademik CNC.'}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{k.siswaIds.length} Siswa</span>
                        </span>
                        <span>{k.guruIds.length} Guru</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                      <button
                        onClick={() => setSelectedKelasId(k.id)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                      >
                        <span>Buka Kelas</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openModalForClass(k.id, 'UJIAN_ONLINE')}
                          className="py-1.5 px-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Ujian Online</span>
                        </button>
                        <button
                          onClick={() => openModalForClass(k.id, 'QUIZ')}
                          className="py-1.5 px-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Quiz Kilat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATERI PEMBELAJARAN (PDF & LINK) */}
      {guruTab === 'MATERI' && <MateriModuleView canManage={true} />}

      {/* TAB 3: TUGAS & PROJEK SISWA */}
      {guruTab === 'TUGAS' && <TugasProjekView canManage={true} />}

      {/* TAB 4: ASESMEN */}
      {guruTab === 'ASESMEN' && (
        <div className="space-y-8">
          {/* History 1: Sedang Diproses (Draft) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="text-base font-bold text-white">
                Sedang Diproses (Draft Asesmen) ({asesmenDiproses.length})
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Asesmen yang masih dalam tahap pembuatan/draft butir soal. Tidak akan terlihat oleh siswa sampai status diubah menjadi selesai.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {asesmenDiproses.length === 0 ? (
                <div className="col-span-full p-6 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                  Tidak ada asesmen dalam tahap draft. Klik tombol "Buat Asesmen Baru" untuk memulai.
                </div>
              ) : (
                asesmenDiproses.map((a) => (
                  <div
                    key={a.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 hover:border-amber-400 transition-all flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {a.tipe} (Draft)
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {a.soalList.length} Soal
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{a.judul}</h4>
                      <p className="text-xs text-cyan-400 mt-0.5 font-medium">{a.mapel}</p>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                        {a.deskripsi || 'Draft persiapan ujian/quiz CNC.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedAsesmenId(a.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                      >
                        <span>Lanjutkan Edit Soal</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Hapus draft asesmen ini?')) {
                            deleteAsesmen(a.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                        title="Hapus Draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* History 2: Sudah Selesai (Dipublikasikan) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Sudah Selesai (Telah Dipublikasikan) ({asesmenSelesai.length})
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Asesmen yang telah selesai disusun dan sudah aktif untuk dikerjakan siswa.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {asesmenSelesai.length === 0 ? (
                <div className="col-span-full p-6 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                  Belum ada asesmen yang dipublikasikan.
                </div>
              ) : (
                asesmenSelesai.map((a) => {
                  const targetKelas = kelasList.find((k) => k.id === a.kelasId);

                  return (
                    <div
                      key={a.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 transition-all flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {a.tipe} (Selesai)
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {targetKelas ? targetKelas.judul : 'Semua Kelas'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white">{a.judul}</h4>
                        <p className="text-xs text-cyan-400 mt-0.5 font-medium">{a.mapel}</p>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                          {a.deskripsi || 'Asesmen akademik CNC.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedAsesmenId(a.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                        >
                          <span>Kelola Soal &amp; Nilai</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('Hapus asesmen ini beserta data nilainya?')) {
                              deleteAsesmen(a.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                          title="Hapus Asesmen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REKAPITULASI NILAI (CRUD + FILTER PER MAPEL + KELAS + JURUSAN) */}
      {guruTab === 'NILAI' && <RekapNilaiView canManage={true} />}

      {/* MODAL BUAT ASESMEN / PILIH DARI BANK SOAL */}
      {isModalCreateAsesmenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">
              {createFromClassId
                ? `Buat Asesmen untuk Kelas ${kelasList.find((k) => k.id === createFromClassId)?.judul}`
                : 'Buat Asesmen Baru (Draft / Bank Soal)'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Konsep asesmen CNC: Draft tidak langsung otomatis masuk ke kelas saat dibatalkan di tengah jalan, tetap aman di tab asesmen sampai selesai.
            </p>

            <form onSubmit={handleCreateAsesmenSubmit} className="space-y-4">
              {/* Opsi: "Kirim dari asesmen" */}
              {createFromClassId && asesmenDiproses.length > 0 && (
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                    <FolderSync className="w-4 h-4" />
                    <span>Opsi: Kirim dari Bank Asesmen yang Sudah Ada</span>
                  </div>
                  <select
                    value={sourceDraftId}
                    onChange={(e) => setSourceDraftId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="">-- Buat Asesmen Baru dari Awal --</option>
                    {asesmenDiproses.map((d) => (
                      <option key={d.id} value={d.id}>
                        Gunakan Draft: {d.judul} ({d.soalList.length} Soal)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!sourceDraftId && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tipe Asesmen
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTipe('UJIAN_ONLINE')}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                          tipe === 'UJIAN_ONLINE'
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Ujian Online
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipe('QUIZ')}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                          tipe === 'QUIZ'
                            ? 'bg-cyan-600 border-cyan-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        Quiz Kilat
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Judul Asesmen
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ujian Tengah Semester Pemrograman Web"
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Mata Pelajaran
                      </label>
                      <input
                        type="text"
                        required
                        value={mapel}
                        onChange={(e) => setMapel(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    {tipe === 'QUIZ' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Durasi (Menit)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="180"
                          value={durasiMenit}
                          onChange={(e) => setDurasiMenit(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {!createFromClassId && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Target Kelas (Opsional, bisa diatur nanti)
                      </label>
                      <select
                        value={targetKelasForExam}
                        onChange={(e) => setTargetKelasForExam(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      >
                        <option value="">Simpan ke Bank Soal Pribadi (Tanpa Kelas)</option>
                        {kelasList.map((k) => (
                          <option key={k.id} value={k.id}>
                            {k.judul}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Deskripsi Asesmen (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      placeholder="Petunjuk pengerjaan..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalCreateAsesmenOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                >
                  {sourceDraftId ? 'Kirim ke Kelas' : 'Lanjut ke Editor Soal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
