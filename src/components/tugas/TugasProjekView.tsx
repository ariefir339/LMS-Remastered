import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TugasProjek, TugasSubmission } from '../../types';
import {
  Briefcase,
  FileText,
  Link as LinkIcon,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Upload,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Check,
  Award,
  Search,
  Send,
  Download,
} from 'lucide-react';

interface TugasProjekViewProps {
  canManage?: boolean; // True for Guru, False for Siswa / Kurikulum / Kepsek
  filterKelasId?: string;
}

export const TugasProjekView: React.FC<TugasProjekViewProps> = ({
  canManage = false,
  filterKelasId,
}) => {
  const {
    currentUser,
    tugasList,
    addTugas,
    updateTugas,
    deleteTugas,
    submitTugas,
    gradeTugasSubmission,
    kelasList,
    users,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  // Submissions inspector modal (Guru)
  const [selectedTugasForInspect, setSelectedTugasForInspect] = useState<TugasProjek | null>(null);
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

  // Student upload submission modal
  const [selectedTugasForSubmit, setSelectedTugasForSubmit] = useState<TugasProjek | null>(null);
  const [uploadPdfUrl, setUploadPdfUrl] = useState(
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  );
  const [uploadFileName, setUploadFileName] = useState('Laporan_Projek_Tugas_Siswa.pdf');
  const [catatanSiswa, setCatatanSiswa] = useState('');

  // Teacher Create/Edit modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTugasId, setEditingTugasId] = useState<string | null>(null);
  const [formKelasId, setFormKelasId] = useState(filterKelasId || (kelasList[0]?.id || ''));
  const [formMapel, setFormMapel] = useState(currentUser?.mapelUtama || 'Pemrograman Web');
  const [formJudul, setFormJudul] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formTipeLampiran, setFormTipeLampiran] = useState<'PDF' | 'LINK' | 'KEDUANYA'>('PDF');
  const [formPdfUrl, setFormPdfUrl] = useState('');
  const [formFileName, setFormFileName] = useState('');
  const [formLinkUrl, setFormLinkUrl] = useState('');
  const [formTenggat, setFormTenggat] = useState('2026-10-15T23:59');

  const filteredTugas = tugasList.filter((t) => {
    if (filterKelasId && t.kelasId !== filterKelasId) return false;
    return (
      t.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.mapel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenCreate = () => {
    setEditingTugasId(null);
    setFormKelasId(filterKelasId || (kelasList[0]?.id || ''));
    setFormMapel(currentUser?.mapelUtama || 'Pemrograman Web');
    setFormJudul('');
    setFormDeskripsi('');
    setFormTipeLampiran('PDF');
    setFormPdfUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    setFormFileName('Panduan_Projek_Tugas.pdf');
    setFormLinkUrl('');
    setFormTenggat('2026-10-15T23:59');
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (t: TugasProjek) => {
    setEditingTugasId(t.id);
    setFormKelasId(t.kelasId);
    setFormMapel(t.mapel);
    setFormJudul(t.judul);
    setFormDeskripsi(t.deskripsi);
    setFormTipeLampiran(t.tipeLampiran);
    setFormPdfUrl(t.filePdfUrl || '');
    setFormFileName(t.fileName || '');
    setFormLinkUrl(t.linkUrl || '');
    setFormTenggat(t.tenggatWaktu ? t.tenggatWaktu.slice(0, 16) : '2026-10-15T23:59');
    setIsCreateModalOpen(true);
  };

  const handleSaveTugas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const kelas = kelasList.find((k) => k.id === formKelasId);

    if (editingTugasId) {
      updateTugas(editingTugasId, {
        kelasId: formKelasId,
        jurusan: kelas?.jurusan || 'Umum',
        mapel: formMapel,
        judul: formJudul,
        deskripsi: formDeskripsi,
        tipeLampiran: formTipeLampiran,
        filePdfUrl: formPdfUrl || undefined,
        fileName: formFileName || undefined,
        linkUrl: formLinkUrl || undefined,
        tenggatWaktu: new Date(formTenggat).toISOString(),
      });
    } else {
      addTugas({
        guruId: currentUser.id,
        kelasId: formKelasId,
        jurusan: kelas?.jurusan || 'Umum',
        mapel: formMapel,
        judul: formJudul,
        deskripsi: formDeskripsi,
        tipeLampiran: formTipeLampiran,
        filePdfUrl: formPdfUrl || undefined,
        fileName: formFileName || undefined,
        linkUrl: formLinkUrl || undefined,
        tenggatWaktu: new Date(formTenggat).toISOString(),
      });
    }

    setIsCreateModalOpen(false);
  };

  const handleDeleteTugas = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus penugasan projek ini?')) {
      deleteTugas(id);
    }
  };

  // Student upload execution
  const handleExecuteStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTugasForSubmit || !currentUser) return;

    submitTugas(selectedTugasForSubmit.id, {
      tugasId: selectedTugasForSubmit.id,
      siswaId: currentUser.id,
      filePdfUrl: uploadPdfUrl,
      fileName: uploadFileName || 'Laporan_Tugas.pdf',
      catatanSiswa: catatanSiswa.trim() || 'Tugas telah selesai dikerjakan sesuai petunjuk.',
    });

    alert('Tugas projek berhasil dikirim via PDF!');
    setSelectedTugasForSubmit(null);
  };

  // Guru grading submission
  const handleSaveGrade = (tugasId: string, subId: string) => {
    gradeTugasSubmission(tugasId, subId, Number(gradeScore), gradeFeedback);
    setGradingSubId(null);
    // Refresh modal target
    const updated = tugasList.find((t) => t.id === tugasId);
    if (updated) setSelectedTugasForInspect(updated);
  };

  return (
    <div className="space-y-6">
      {/* Action / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Tugas &amp; Projek Siswa CNC</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {canManage
              ? 'Rancang tugas, instruksi projek berbasis PDF/link, dan periksa berkas pengumpulan siswa.'
              : 'Selesaikan penugasan projek dan kumpulkan berkas portofolio PDF Anda sebelum tenggat waktu.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-full sm:w-60"
            />
          </div>

          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-amber-600/30 whitespace-nowrap transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Bikin Tugas Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTugas.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            Belum ada tugas atau projek yang tercatat.
          </div>
        ) : (
          filteredTugas.map((t) => {
            const kelas = kelasList.find((k) => k.id === t.kelasId);
            const mySubmission = t.submissions.find((s) => s.siswaId === currentUser?.id);
            const isCompleted = !!mySubmission;

            return (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {t.mapel}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {kelas?.judul || 'Semua Kelas'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{t.judul}</h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {t.deskripsi}
                  </p>

                  {/* Deadline & Submissions info */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Tenggat Pengumpulan:</span>
                      </span>
                      <span className="font-mono text-slate-200 font-semibold">
                        {new Date(t.tenggatWaktu).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Teacher perspective: show submission count */}
                    {canManage && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-slate-400">
                        <span>Pengumpulan Siswa:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {t.submissions.length} Berkas Masuk
                        </span>
                      </div>
                    )}

                    {/* Student perspective: show own submission status */}
                    {!canManage && currentUser?.role === 'SISWA' && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400">Status Tugas Anda:</span>
                        {isCompleted ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {mySubmission.status === 'GRADED'
                                ? `Nilai: ${mySubmission.nilai}/100`
                                : 'Sudah Dikirim (PDF)'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Belum Dikumpulkan</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Teacher Attachments */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {t.filePdfUrl && (
                      <a
                        href={t.filePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-800/40 text-[11px] text-rose-300 flex items-center gap-1 hover:bg-rose-900/40 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        <span>{t.fileName || 'Lampiran Petunjuk PDF'}</span>
                      </a>
                    )}
                    {t.linkUrl && (
                      <a
                        href={t.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300 flex items-center gap-1 hover:bg-cyan-900/40 transition-colors"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Link Referensi</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  {canManage ? (
                    <>
                      <button
                        onClick={() => setSelectedTugasForInspect(t)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Lihat Tugas Masuk ({t.submissions.length})</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Edit Tugas"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTugas(t.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-400"
                          title="Hapus Tugas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : currentUser?.role === 'SISWA' ? (
                    <button
                      onClick={() => setSelectedTugasForSubmit(t)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                        isCompleted
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isCompleted ? 'Kirim Ulang / Edit PDF' : 'Kirim Tugas (Upload PDF)'}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Pengumpulan: {t.submissions.length} siswa
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL GURU: INSPECT SUBMISSIONS & GRADE */}
      {selectedTugasForInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Pengumpulan Berkas: {selectedTugasForInspect.judul}
                </h3>
                <p className="text-xs text-slate-400">
                  Total {selectedTugasForInspect.submissions.length} Siswa telah mengumpulkan tugas projek.
                </p>
              </div>
              <button
                onClick={() => setSelectedTugasForInspect(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedTugasForInspect.submissions.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                  Belum ada siswa yang mengumpulkan berkas untuk tugas ini.
                </div>
              ) : (
                selectedTugasForInspect.submissions.map((sub) => {
                  const student = users.find((u) => u.id === sub.siswaId);
                  const isGradingThis = gradingSubId === sub.id;

                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              student?.foto ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                            }
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover bg-slate-800"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-white">{student?.nama}</h4>
                            <span className="text-[11px] font-mono text-slate-400">
                              NISN: {student?.nisn} • {student?.jurusanAsal}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              sub.status === 'GRADED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {sub.status === 'GRADED' ? `Nilai: ${sub.nilai}/100` : 'Menunggu Penilaian'}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                            {new Date(sub.submittedAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* PDF File Link */}
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-rose-400" />
                          <span>{sub.fileName || 'Berkas_Projek.pdf'}</span>
                        </span>
                        <a
                          href={sub.filePdfUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Buka PDF</span>
                        </a>
                      </div>

                      {/* Catatan Siswa */}
                      {sub.catatanSiswa && (
                        <p className="text-xs text-slate-400 italic bg-slate-900/50 p-2 rounded-lg">
                          &ldquo;{sub.catatanSiswa}&rdquo;
                        </p>
                      )}

                      {/* Grade Input Form */}
                      {isGradingThis ? (
                        <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl space-y-2">
                          <div className="flex items-center gap-3">
                            <label className="text-xs font-semibold text-slate-300">
                              Berikan Nilai (0-100):
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={gradeScore}
                              onChange={(e) => setGradeScore(Number(e.target.value))}
                              className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono text-center font-bold"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Komentar / masukan guru untuk siswa..."
                              value={gradeFeedback}
                              onChange={(e) => setGradeFeedback(e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setGradingSubId(null)}
                              className="px-2.5 py-1 text-xs text-slate-400"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleSaveGrade(selectedTugasForInspect.id, sub.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                            >
                              Simpan Nilai
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-1">
                          {sub.catatanGuru && (
                            <span className="text-[11px] text-emerald-400">
                              Feedback: {sub.catatanGuru}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setGradingSubId(sub.id);
                              setGradeScore(sub.nilai || 90);
                              setGradeFeedback(sub.catatanGuru || '');
                            }}
                            className="ml-auto px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                            <span>{sub.status === 'GRADED' ? 'Edit Nilai' : 'Beri Nilai Siswa'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL SISWA: UPLOAD PROJEK VIA PDF */}
      {selectedTugasForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Kirim Tugas &amp; Projek</h3>
                <p className="text-xs text-slate-400">{selectedTugasForSubmit.judul}</p>
              </div>
              <button
                onClick={() => setSelectedTugasForSubmit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Berkas PDF:
                </label>
                <input
                  type="text"
                  required
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL / Simpan Dokumen PDF:
                </label>
                <input
                  type="url"
                  required
                  value={uploadPdfUrl}
                  onChange={(e) => setUploadPdfUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan untuk Guru (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={catatanSiswa}
                  onChange={(e) => setCatatanSiswa(e.target.value)}
                  placeholder="Catatan mengenai proses pengerjaan atau kendala..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTugasForSubmit(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Berkas PDF</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GURU: CREATE / EDIT TUGAS */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingTugasId ? 'Edit Tugas Projek' : 'Bikin Tugas Baru'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTugas} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Rombel Kelas:
                </label>
                <select
                  value={formKelasId}
                  onChange={(e) => setFormKelasId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.judul} ({k.jurusan || 'Umum'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mata Pelajaran:
                </label>
                <input
                  type="text"
                  required
                  value={formMapel}
                  onChange={(e) => setFormMapel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul Penugasan / Projek:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Projek Pembuatan Prototype Aplikasi Perpustakaan"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Instruksi Lengkap Tugas:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan panduan pengerjaan, ketentuan laporan PDF, dan kriteria penilaian..."
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tenggat Waktu Pengumpulan (Deadline):
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formTenggat}
                  onChange={(e) => setFormTenggat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              {/* Attachments */}
              <div className="space-y-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Lampiran Petunjuk dari Guru (PDF / Link):
                </span>
                <div>
                  <input
                    type="url"
                    placeholder="URL Lampiran PDF Petunjuk (Opsional)"
                    value={formPdfUrl}
                    onChange={(e) => setFormPdfUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white mb-2"
                  />
                  <input
                    type="url"
                    placeholder="Tautan Link Figma / GitHub / Referensi (Opsional)"
                    value={formLinkUrl}
                    onChange={(e) => setFormLinkUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-md shadow-amber-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Penugasan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
