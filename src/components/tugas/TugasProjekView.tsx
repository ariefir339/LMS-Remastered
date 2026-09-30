import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TugasProjek } from '../../types';
import {
  Briefcase,
  FileText,
  Link as LinkIcon,
  Plus,
  Trash2,
  Edit2,
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
    const updated = tugasList.find((t) => t.id === tugasId);
    if (updated) setSelectedTugasForInspect(updated);
  };

  return (
    <div className="space-y-6">
      {/* Action / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#069494]" />
            <h2 className="text-base font-extrabold text-slate-900">Tugas &amp; Projek Siswa CNC</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
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
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white w-full sm:w-60"
            />
          </div>

          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#069494]/20 whitespace-nowrap transition-all"
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
          <div className="col-span-full p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
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
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-[#069494] hover:shadow-md transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#069494]">
                      {t.mapel}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {kelas?.judul || 'Semua Kelas'}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">{t.judul}</h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {t.deskripsi}
                  </p>

                  {/* Deadline & Submissions info */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#069494]" />
                        <span>Tenggat Pengumpulan:</span>
                      </span>
                      <span className="font-mono text-slate-800 font-bold tabular-nums">
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
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/70 text-slate-500">
                        <span>Pengumpulan Siswa:</span>
                        <span className="font-mono font-bold text-[#069494] tabular-nums">
                          {t.submissions.length} Berkas Masuk
                        </span>
                      </div>
                    )}

                    {/* Student perspective: show own submission status */}
                    {!canManage && currentUser?.role === 'SISWA' && (
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/70">
                        <span className="text-slate-500">Status Tugas Anda:</span>
                        {isCompleted ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {mySubmission.status === 'GRADED'
                                ? `Nilai: ${mySubmission.nilai}/100`
                                : 'Sudah Dikirim (PDF)'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[#FF69B4] font-bold flex items-center gap-1">
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
                        className="px-2.5 py-1 rounded-lg bg-pink-50 border border-pink-200 text-[11px] font-bold text-[#FF69B4] flex items-center gap-1 hover:bg-pink-100 transition-colors"
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
                        className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-[11px] font-bold text-[#069494] flex items-center gap-1 hover:bg-teal-100 transition-colors"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Link Referensi</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {canManage ? (
                    <>
                      <button
                        onClick={() => setSelectedTugasForInspect(t)}
                        className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-[#069494] text-[#069494] hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Tugas Masuk ({t.submissions.length})</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#069494] hover:bg-teal-50 transition-colors"
                          title="Edit Tugas"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTugas(t.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Hapus Tugas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  ) : currentUser?.role === 'SISWA' ? (
                    <button
                      onClick={() => setSelectedTugasForSubmit(t)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        isCompleted
                          ? 'bg-teal-50 hover:bg-teal-100 text-[#069494]'
                          : 'bg-[#069494] hover:bg-[#057c7c] text-white shadow-md shadow-[#069494]/20'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isCompleted ? 'Kirim Ulang / Edit PDF' : 'Kirim Tugas (Upload PDF)'}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Pengumpulan Berkas: {selectedTugasForInspect.judul}
                </h3>
                <p className="text-xs text-slate-500">
                  Total {selectedTugasForInspect.submissions.length} Siswa telah mengumpulkan tugas projek.
                </p>
              </div>
              <button
                onClick={() => setSelectedTugasForInspect(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedTugasForInspect.submissions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                  Belum ada siswa yang mengumpulkan berkas untuk tugas ini.
                </div>
              ) : (
                selectedTugasForInspect.submissions.map((sub) => {
                  const student = users.find((u) => u.id === sub.siswaId);
                  const isGradingThis = gradingSubId === sub.id;

                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              student?.foto ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                            }
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 bg-white"
                          />
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900">{student?.nama}</h4>
                            <span className="text-[11px] font-mono text-slate-500">
                              NISN: {student?.nisn} • {student?.jurusanAsal}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-[11px] font-bold ${
                              sub.status === 'GRADED'
                                ? 'text-[#069494]'
                                : 'text-amber-600'
                            }`}
                          >
                            {sub.status === 'GRADED' ? `Nilai: ${sub.nilai}/100` : 'Menunggu Penilaian'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                            {new Date(sub.submittedAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* PDF File Link */}
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#FF69B4]" />
                          <span>{sub.fileName || 'Berkas_Projek.pdf'}</span>
                        </span>
                        <a
                          href={sub.filePdfUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#069494] font-bold flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Buka PDF</span>
                        </a>
                      </div>

                      {/* Catatan Siswa */}
                      {sub.catatanSiswa && (
                        <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200/70">
                          &ldquo;{sub.catatanSiswa}&rdquo;
                        </p>
                      )}

                      {/* Grade Input Form */}
                      {isGradingThis ? (
                        <div className="p-3.5 bg-white border border-teal-200 rounded-xl space-y-2.5">
                          <div className="flex items-center gap-3">
                            <label className="text-xs font-bold text-slate-700">
                              Berikan Nilai (0-100):
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={gradeScore}
                              onChange={(e) => setGradeScore(Number(e.target.value))}
                              className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono text-center font-bold focus:outline-none focus:border-[#069494]"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Komentar / masukan guru untuk siswa..."
                              value={gradeFeedback}
                              onChange={(e) => setGradeFeedback(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#069494]"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setGradingSubId(null)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-800"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleSaveGrade(selectedTugasForInspect.id, sub.id)}
                              className="px-3.5 py-1.5 bg-[#069494] hover:bg-[#057c7c] text-white rounded-lg text-xs font-bold shadow-xs"
                            >
                              Simpan Nilai
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-1">
                          {sub.catatanGuru && (
                            <span className="text-[11px] font-semibold text-[#069494]">
                              Feedback: {sub.catatanGuru}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setGradingSubId(sub.id);
                              setGradeScore(sub.nilai || 90);
                              setGradeFeedback(sub.catatanGuru || '');
                            }}
                            className="ml-auto px-3 py-1.5 rounded-lg bg-white hover:bg-teal-50 border border-slate-200 text-slate-800 hover:text-[#069494] text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Award className="w-3.5 h-3.5 text-[#FF69B4]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Kirim Tugas &amp; Projek</h3>
                <p className="text-xs text-[#069494] font-semibold">{selectedTugasForSubmit.judul}</p>
              </div>
              <button
                onClick={() => setSelectedTugasForSubmit(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Berkas PDF:
                </label>
                <input
                  type="text"
                  required
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL / Simpan Dokumen PDF:
                </label>
                <input
                  type="url"
                  required
                  value={uploadPdfUrl}
                  onChange={(e) => setUploadPdfUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:border-[#069494] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan untuk Guru (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={catatanSiswa}
                  onChange={(e) => setCatatanSiswa(e.target.value)}
                  placeholder="Catatan mengenai proses pengerjaan atau kendala..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTugasForSubmit(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#069494] hover:bg-[#057c7c] text-white flex items-center gap-1.5 shadow-md shadow-[#069494]/20"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingTugasId ? 'Edit Tugas Projek' : 'Bikin Tugas Baru'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTugas} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Rombel Kelas:
                </label>
                <select
                  value={formKelasId}
                  onChange={(e) => setFormKelasId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                >
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.judul} ({k.jurusan || 'Umum'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mata Pelajaran:
                </label>
                <input
                  type="text"
                  required
                  value={formMapel}
                  onChange={(e) => setFormMapel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Penugasan / Projek:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Projek Pembuatan Prototype Aplikasi Perpustakaan"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instruksi Lengkap Tugas:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan panduan pengerjaan, ketentuan laporan PDF, dan kriteria penilaian..."
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tenggat Waktu Pengumpulan (Deadline):
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formTenggat}
                  onChange={(e) => setFormTenggat(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                />
              </div>

              {/* Attachments */}
              <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Lampiran Petunjuk dari Guru (PDF / Link):
                </span>
                <div>
                  <input
                    type="url"
                    placeholder="URL Lampiran PDF Petunjuk (Opsional)"
                    value={formPdfUrl}
                    onChange={(e) => setFormPdfUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 mb-2"
                  />
                  <input
                    type="url"
                    placeholder="Tautan Link Figma / GitHub / Referensi (Opsional)"
                    value={formLinkUrl}
                    onChange={(e) => setFormLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#069494] hover:bg-[#057c7c] text-white flex items-center gap-1.5 shadow-md shadow-[#069494]/20"
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
