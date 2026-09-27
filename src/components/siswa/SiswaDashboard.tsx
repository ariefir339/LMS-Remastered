import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Asesmen, Soal, JawabanItem } from '../../types';
import {
  Users,
  School,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  FileCheck,
  ChevronRight,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import { KelasDetailView } from '../admin/KelasDetailView';
import { MateriModuleView } from '../materi/MateriModuleView';
import { TugasProjekView } from '../tugas/TugasProjekView';

export const SiswaDashboard: React.FC = () => {
  const {
    currentUser,
    kelasList,
    asesmenList,
    jawabanList,
    submitJawaban,
    selectedKelasId,
    setSelectedKelasId,
  } = useApp();

  const [siswaTab, setSiswaTab] = useState<'KELAS' | 'MATERI' | 'TUGAS' | 'ASESMEN'>('KELAS');

  // Exam taker state
  const [activeAsesmenToTake, setActiveAsesmenToTake] = useState<Asesmen | null>(null);
  const [answers, setAnswers] = useState<{ [soalId: string]: { opsiIds: string[]; essay: string } }>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If inside a class detail view
  if (selectedKelasId) {
    return (
      <KelasDetailView
        kelasId={selectedKelasId}
        onBack={() => setSelectedKelasId(null)}
        canManageClass={false} // Student can only post announcements, comment, and share link
      />
    );
  }

  // Classes the student belongs to
  const myClasses = kelasList.filter((k) => k.siswaIds.includes(currentUser?.id || ''));
  const myClassIds = myClasses.map((k) => k.id);

  // Published assessments for student's classes (status: SELESAI)
  const availableAssessments = asesmenList.filter(
    (a) => a.status === 'SELESAI' && (!a.kelasId || myClassIds.includes(a.kelasId))
  );

  // Student's submitted answers
  const mySubmissions = jawabanList.filter((j) => j.siswaId === currentUser?.id);
  const submittedAsesmenIds = mySubmissions.map((j) => j.asesmenId);

  const pendingAssessments = availableAssessments.filter((a) => !submittedAsesmenIds.includes(a.id));
  const completedAssessments = availableAssessments.filter((a) => submittedAsesmenIds.includes(a.id));

  // Timer countdown when taking quiz
  useEffect(() => {
    if (!activeAsesmenToTake || !activeAsesmenToTake.durasiMenit) return;

    setTimeLeft(activeAsesmenToTake.durasiMenit * 60);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeAsesmenToTake]);

  const handleStartExam = (asesmen: Asesmen) => {
    setActiveAsesmenToTake(asesmen);
    const initialAns: { [key: string]: { opsiIds: string[]; essay: string } } = {};
    asesmen.soalList.forEach((s) => {
      initialAns[s.id] = { opsiIds: [], essay: '' };
    });
    setAnswers(initialAns);
  };

  const handleToggleOption = (soal: Soal, opsiId: string) => {
    setAnswers((prev) => {
      const curr = prev[soal.id] || { opsiIds: [], essay: '' };
      if (soal.tipe === 'PILIHAN_GANDA') {
        return {
          ...prev,
          [soal.id]: { ...curr, opsiIds: [opsiId] },
        };
      } else {
        const exists = curr.opsiIds.includes(opsiId);
        const newIds = exists ? curr.opsiIds.filter((id) => id !== opsiId) : [...curr.opsiIds, opsiId];
        return {
          ...prev,
          [soal.id]: { ...curr, opsiIds: newIds },
        };
      }
    });
  };

  const handleEssayChange = (soalId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [soalId]: { ...(prev[soalId] || { opsiIds: [] }), essay: text },
    }));
  };

  const handleAutoSubmit = () => {
    if (!activeAsesmenToTake || !currentUser) return;
    executeSubmit();
  };

  const handleSubmitExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsesmenToTake || !currentUser) return;
    if (confirm('Apakah Anda yakin ingin menyelesaikan dan mengumpulkan jawaban asesmen ini?')) {
      executeSubmit();
    }
  };

  const executeSubmit = () => {
    if (!activeAsesmenToTake || !currentUser) return;
    setIsSubmitting(true);

    const formattedItems: JawabanItem[] = activeAsesmenToTake.soalList.map((s) => {
      const userAns = answers[s.id] || { opsiIds: [], essay: '' };
      return {
        soalId: s.id,
        jawabanOpsiIds: userAns.opsiIds,
        jawabanEssay: userAns.essay,
      };
    });

    submitJawaban(activeAsesmenToTake.id, currentUser.id, formattedItems);
    setIsSubmitting(false);
    setActiveAsesmenToTake(null);
    setSiswaTab('ASESMEN');
    alert('Jawaban berhasil dikirim! Nilai Anda telah tercatat.');
  };

  const formatTimer = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // IF CURRENTLY TAKING EXAM
  if (activeAsesmenToTake) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Exam Header Bar with Timer */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/40 sticky top-20 z-30 shadow-xl flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              Sedang Mengerjakan {activeAsesmenToTake.tipe}
            </span>
            <h2 className="text-base font-bold text-white mt-1">{activeAsesmenToTake.judul}</h2>
            <p className="text-xs text-cyan-400 font-medium">{activeAsesmenToTake.mapel}</p>
          </div>

          <div className="flex items-center gap-3">
            {activeAsesmenToTake.durasiMenit && (
              <div className="p-2 px-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-sm font-mono font-bold text-amber-300">
                  {formatTimer(timeLeft)}
                </span>
              </div>
            )}
            <button
              onClick={() => {
                if (confirm('Batalkan ujian? Jawaban saat ini belum tersimpan.')) {
                  setActiveAsesmenToTake(null);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* Questions Form */}
        <form onSubmit={handleSubmitExam} className="space-y-5">
          {activeAsesmenToTake.soalList.map((soal, idx) => {
            const currentAns = answers[soal.id] || { opsiIds: [], essay: '' };

            return (
              <div
                key={soal.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {soal.tipe === 'KOTAK_CENTANG'
                        ? 'Kotak Centang (Pilih Semua Jawaban Benar)'
                        : soal.tipe === 'PILIHAN_GANDA'
                        ? 'Pilihan Ganda (Pilih Satu)'
                        : 'Essay Uraian'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    {soal.poin} Poin
                  </span>
                </div>

                <p className="text-sm text-slate-100 font-medium whitespace-pre-line leading-relaxed">
                  {soal.pertanyaan}
                </p>

                {soal.gambarUrl && (
                  <div className="max-w-md rounded-xl overflow-hidden border border-slate-700">
                    <img
                      src={soal.gambarUrl}
                      alt="Gambar Soal"
                      className="w-full h-auto max-h-60 object-cover"
                    />
                  </div>
                )}

                {/* Multiple choice / checkbox options */}
                {(soal.tipe === 'PILIHAN_GANDA' || soal.tipe === 'KOTAK_CENTANG') && soal.opsi && (
                  <div className="space-y-2 pt-2">
                    {soal.opsi.map((opsi, oIdx) => {
                      const isSelected = currentAns.opsiIds.includes(opsi.id);
                      return (
                        <div
                          key={opsi.id}
                          onClick={() => handleToggleOption(soal, opsi.id)}
                          className={`p-3 rounded-xl border text-xs flex items-center gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="flex-1">{opsi.label}</span>
                          <div
                            className={`w-4 h-4 rounded ${
                              soal.tipe === 'KOTAK_CENTANG' ? 'rounded' : 'rounded-full'
                            } border flex items-center justify-center ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Essay textarea */}
                {soal.tipe === 'ESSAY' && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tuliskan Jawaban Uraian Anda:
                    </label>
                    <textarea
                      rows={4}
                      value={currentAns.essay}
                      onChange={(e) => handleEssayChange(soal.id, e.target.value)}
                      placeholder="Ketik uraian jawaban secara terperinci..."
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Submit Action */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Pastikan semua pertanyaan telah dijawab sebelum mengirimkan hasil.
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Kirim &amp; Selesaikan Ujian</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Portal Siswa CNC Academy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hai, {currentUser?.nama}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            NISN: <span className="font-mono text-amber-300">{currentUser?.nisn || '-'}</span> • Kelas Asal: <span className="text-slate-200 font-semibold">{currentUser?.jurusanAsal || 'Umum'}</span>
          </p>
        </div>
      </div>

      {/* 4 Tabs: KELAS, MATERI, TUGAS, ASESMEN */}
      <div className="flex border-b border-slate-800 gap-1 pb-1 overflow-x-auto">
        {[
          { id: 'KELAS', label: 'Kelas yang Didapat', icon: School, count: myClasses.length },
          { id: 'MATERI', label: 'Materi Belajar', icon: BookOpen },
          { id: 'TUGAS', label: 'Tugas & Projek (Upload PDF)', icon: Briefcase },
          { id: 'ASESMEN', label: 'Asesmen & Ujian Online', icon: FileSpreadsheet, badge: pendingAssessments.length > 0 ? `${pendingAssessments.length} Baru` : undefined },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = siswaTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSiswaTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: KELAS YANG DIDAPAT */}
      {siswaTab === 'KELAS' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Kelas yang Didapat ({myClasses.length})</h3>
            <p className="text-xs text-slate-400">
              Daftar kelas aktif tempat Anda terdaftar. Masuk untuk membaca pengumuman kelas, berdiskusi, atau menyalin tautan gabung.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClasses.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                Anda belum terdaftar di kelas manapun. Hubungi Admin atau Wali Kelas untuk dimasukkan ke rombel kelas.
              </div>
            ) : (
              myClasses.map((k) => (
                <div
                  key={k.id}
                  onClick={() => setSelectedKelasId(k.id)}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-lg cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {k.jurusan || 'Kejuruan'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Kode: {k.kodeGabung}</span>
                    </div>
                    <h4 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {k.judul}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {k.deskripsi || 'Ruang kelas kolaboratif CNC.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>{k.siswaIds.length} Siswa</span>
                    <span className="text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Buka Kelas</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MATERI PEMBELAJARAN (READ-ONLY) */}
      {siswaTab === 'MATERI' && <MateriModuleView canManage={false} />}

      {/* TAB 3: TUGAS & PROJEK (UPLOAD PDF) */}
      {siswaTab === 'TUGAS' && <TugasProjekView canManage={false} />}

      {/* TAB 4: ASESMEN */}
      {siswaTab === 'ASESMEN' && (
        <div className="space-y-6">
          {/* Section: Belum Dikerjakan */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <h3 className="text-sm font-bold text-white">
                Ujian &amp; Quiz yang Belum Dikerjakan ({pendingAssessments.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingAssessments.length === 0 ? (
                <div className="col-span-full p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                  Semua tugas dan asesmen telah selesai Anda kerjakan. Luar biasa!
                </div>
              ) : (
                pendingAssessments.map((a) => (
                  <div
                    key={a.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-rose-500/30 hover:border-rose-400 transition-all flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {a.tipe}
                        </span>
                        {a.durasiMenit && (
                          <span className="text-xs font-mono text-cyan-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{a.durasiMenit} Menit</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-white">{a.judul}</h4>
                      <p className="text-xs text-cyan-400 mt-0.5 font-medium">{a.mapel}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {a.deskripsi || 'Silakan kerjakan asesmen ini dengan teliti.'}
                      </p>
                      <span className="inline-block mt-3 text-[11px] font-mono text-slate-400">
                        {a.soalList.length} Soal (Pilihan Ganda, Kotak Centang, Essay)
                      </span>
                    </div>

                    <button
                      onClick={() => handleStartExam(a)}
                      className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Mulai Kerjakan Asesmen</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Sudah Dikerjakan */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Riwayat Ujian yang Sudah Dikerjakan ({completedAssessments.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedAssessments.length === 0 ? (
                <div className="col-span-full p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                  Belum ada riwayat pengerjaan asesmen.
                </div>
              ) : (
                completedAssessments.map((a) => {
                  const submission = mySubmissions.find((j) => j.asesmenId === a.id);

                  return (
                    <div
                      key={a.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-500/50 transition-all flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {a.tipe}
                          </span>
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selesai</span>
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white">{a.judul}</h4>
                        <p className="text-xs text-cyan-400 mt-0.5 font-medium">{a.mapel}</p>

                        <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Waktu Pengumpulan:</span>
                            <span className="text-xs font-mono text-slate-300">
                              {submission ? new Date(submission.waktuSubmit).toLocaleString('id-ID') : '-'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block">Nilai Perolehan:</span>
                            <span className="text-lg font-mono font-extrabold text-emerald-400">
                              {submission ? submission.totalNilai : 0} / 100
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
        </div>
      )}
    </div>
  );
};
