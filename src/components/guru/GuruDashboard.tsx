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
  X,
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
      {/* Header Banner matching Admin & Kurikulum Light Theme */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-50 via-white to-pink-50/60 border border-teal-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-100/80 border border-teal-200 text-[#069494] text-xs font-bold mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Portal Tenaga Pendidik &amp; Guru</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Selamat Datang, {currentUser?.nama}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Mata Pelajaran: <span className="text-[#069494] font-bold">{currentUser?.mapelUtama || 'Semua Bidang'}</span> • Kelola kelas pengajaran, modul materi, penugasan projek &amp; asesmen.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateFromClassId(null);
            setSourceDraftId('');
            setIsModalCreateAsesmenOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold shadow-md shadow-[#069494]/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Asesmen Baru</span>
        </button>
      </div>

      {/* Modern LMS Desktop PC Tab Navigation Bar */}
      <div className="flex border-b border-slate-200 gap-1 pb-1 overflow-x-auto text-xs font-bold">
        {[
          { id: 'KELAS', label: 'Kelas Saya', icon: School, count: kelasWalas.length + kelasPengajar.length },
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

      {/* TAB 1: KELAS */}
      {guruTab === 'KELAS' && (
        <div className="space-y-8">
          {/* Section 1: Kelas yang Dipegang (Walas) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#069494]" />
              <h3 className="text-base font-extrabold text-slate-900">Kelas yang Dipegang (Wali Kelas)</h3>
            </div>
            <p className="text-xs text-slate-500">
              Kelas yang menjadi tanggung jawab perwalian Anda. Klik card kelas untuk membuka stream pengumuman &amp; daftar siswa.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kelasWalas.length === 0 ? (
                <div className="col-span-full p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                  Anda belum ditugaskan sebagai wali kelas di rombel manapun.
                </div>
              ) : (
                kelasWalas.map((k) => (
                  <div
                    key={k.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-[#069494] hover:shadow-md transition-all flex flex-col justify-between shadow-xs group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#069494]">
                          Wali Kelas • {k.jurusan || 'Kejuruan'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Kode: {k.kodeGabung}</span>
                      </div>
                      <h4
                        onClick={() => setSelectedKelasId(k.id)}
                        className="text-lg font-extrabold text-slate-900 group-hover:text-[#069494] cursor-pointer transition-colors"
                      >
                        {k.judul}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {k.deskripsi || 'Kelas perwalian akademik CNC.'}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-[#069494] tabular-nums">
                          <Users className="w-3.5 h-3.5" />
                          <span>{k.siswaIds.length} Siswa</span>
                        </span>
                        <span className="tabular-nums">{k.guruIds.length} Guru Pengajar</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <button
                        onClick={() => setSelectedKelasId(k.id)}
                        className="w-full py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-[#069494] text-[#069494] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>Buka Kelas</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openModalForClass(k.id, 'UJIAN_ONLINE')}
                          className="py-2 px-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-slate-700 hover:text-[#069494] text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Ujian Online</span>
                        </button>
                        <button
                          onClick={() => openModalForClass(k.id, 'QUIZ')}
                          className="py-2 px-2 rounded-xl bg-pink-50/70 hover:bg-pink-100/80 border border-pink-200 text-[#FF69B4] text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
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
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF69B4]" />
              <h3 className="text-base font-extrabold text-slate-900">Deretan Kelas yang Masuk (Guru Pengajar)</h3>
            </div>
            <p className="text-xs text-slate-500">
              Kelas-kelas di mana Anda bertugas memberikan materi dan asesmen mata pelajaran.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kelasPengajar.length === 0 ? (
                <div className="col-span-full p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                  Belum ada kelas pengajar tambahan yang ditugaskan.
                </div>
              ) : (
                kelasPengajar.map((k) => (
                  <div
                    key={k.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-[#069494] hover:shadow-md transition-all flex flex-col justify-between shadow-xs group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#FF69B4]">
                          Guru Pengajar • {k.jurusan || 'Kejuruan'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Kode: {k.kodeGabung}</span>
                      </div>
                      <h4
                        onClick={() => setSelectedKelasId(k.id)}
                        className="text-lg font-extrabold text-slate-900 group-hover:text-[#069494] cursor-pointer transition-colors"
                      >
                        {k.judul}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {k.deskripsi || 'Kelas akademik CNC.'}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-[#069494] tabular-nums">
                          <Users className="w-3.5 h-3.5" />
                          <span>{k.siswaIds.length} Siswa</span>
                        </span>
                        <span className="tabular-nums">{k.guruIds.length} Guru</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <button
                        onClick={() => setSelectedKelasId(k.id)}
                        className="w-full py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-[#069494] text-[#069494] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>Buka Kelas</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openModalForClass(k.id, 'UJIAN_ONLINE')}
                          className="py-2 px-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 text-slate-700 hover:text-[#069494] text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Ujian Online</span>
                        </button>
                        <button
                          onClick={() => openModalForClass(k.id, 'QUIZ')}
                          className="py-2 px-2 rounded-xl bg-pink-50/70 hover:bg-pink-100/80 border border-pink-200 text-[#FF69B4] text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
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
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-base font-extrabold text-slate-900">
                Sedang Diproses (Draft Asesmen) ({asesmenDiproses.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Asesmen yang masih dalam tahap pembuatan/draft butir soal. Tidak akan terlihat oleh siswa sampai status diubah menjadi selesai.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {asesmenDiproses.length === 0 ? (
                <div className="col-span-full p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                  Tidak ada asesmen dalam tahap draft. Klik tombol "Buat Asesmen Baru" untuk memulai.
                </div>
              ) : (
                asesmenDiproses.map((a) => (
                  <div
                    key={a.id}
                    className="p-5 rounded-3xl bg-white border border-amber-200 hover:border-amber-400 transition-all flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-amber-700">
                          {a.tipe} • Draft
                        </span>
                        <span className="text-xs text-slate-500 font-mono tabular-nums">
                          {a.soalList.length} Soal
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">{a.judul}</h4>
                      <p className="text-xs text-[#069494] mt-0.5 font-bold">{a.mapel}</p>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                        {a.deskripsi || 'Draft persiapan ujian/quiz CNC.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedAsesmenId(a.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs"
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
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 transition-colors"
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
              <span className="w-2.5 h-2.5 rounded-full bg-[#069494]" />
              <h3 className="text-base font-extrabold text-slate-900">
                Sudah Selesai (Telah Dipublikasikan) ({asesmenSelesai.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Asesmen yang telah selesai disusun dan sudah aktif untuk dikerjakan siswa.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {asesmenSelesai.length === 0 ? (
                <div className="col-span-full p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                  Belum ada asesmen yang dipublikasikan.
                </div>
              ) : (
                asesmenSelesai.map((a) => {
                  const targetKelas = kelasList.find((k) => k.id === a.kelasId);

                  return (
                    <div
                      key={a.id}
                      className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-[#069494] transition-all flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-[#069494]">
                            {a.tipe} • Aktif
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {targetKelas ? targetKelas.judul : 'Semua Kelas'}
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900">{a.judul}</h4>
                        <p className="text-xs text-[#069494] mt-0.5 font-bold">{a.mapel}</p>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                          {a.deskripsi || 'Asesmen akademik CNC.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedAsesmenId(a.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-teal-50 hover:bg-[#069494] text-[#069494] hover:text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
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
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {createFromClassId
                    ? `Buat Asesmen untuk Kelas ${kelasList.find((k) => k.id === createFromClassId)?.judul}`
                    : 'Buat Asesmen Baru (Draft / Bank Soal)'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Konsep asesmen CNC: Draft tidak langsung masuk ke kelas sampai Anda mempublikasikannya.
                </p>
              </div>
              <button
                onClick={() => setIsModalCreateAsesmenOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsesmenSubmit} className="space-y-4">
              {/* Opsi: "Kirim dari asesmen" */}
              {createFromClassId && asesmenDiproses.length > 0 && (
                <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#069494]">
                    <FolderSync className="w-4 h-4" />
                    <span>Opsi: Kirim dari Bank Asesmen yang Sudah Ada</span>
                  </div>
                  <select
                    value={sourceDraftId}
                    onChange={(e) => setSourceDraftId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-[#069494]"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipe Asesmen
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTipe('UJIAN_ONLINE')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                          tipe === 'UJIAN_ONLINE'
                            ? 'bg-[#069494] border-[#069494] text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Ujian Online
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipe('QUIZ')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                          tipe === 'QUIZ'
                            ? 'bg-[#FF69B4] border-[#FF69B4] text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Quiz Kilat
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul Asesmen
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ujian Tengah Semester Pemrograman Web"
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mata Pelajaran
                      </label>
                      <input
                        type="text"
                        required
                        value={mapel}
                        onChange={(e) => setMapel(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                      />
                    </div>

                    {tipe === 'QUIZ' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Durasi (Menit)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="180"
                          value={durasiMenit}
                          onChange={(e) => setDurasiMenit(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-[#069494] focus:bg-white"
                        />
                      </div>
                    )}
                  </div>

                  {!createFromClassId && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Target Kelas (Opsional, bisa diatur nanti)
                      </label>
                      <select
                        value={targetKelasForExam}
                        onChange={(e) => setTargetKelasForExam(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Deskripsi Asesmen (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      placeholder="Petunjuk pengerjaan..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalCreateAsesmenOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#069494] hover:bg-[#057c7c] text-white shadow-md shadow-[#069494]/20 transition-all"
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
