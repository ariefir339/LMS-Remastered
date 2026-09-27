import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Materi } from '../../types';
import {
  BookOpen,
  FileText,
  Link as LinkIcon,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Download,
  Search,
  Check,
  X,
  FileCheck,
} from 'lucide-react';

interface MateriModuleViewProps {
  canManage?: boolean; // True for Guru, False for Siswa / Kurikulum / Kepsek
  filterKelasId?: string;
}

export const MateriModuleView: React.FC<MateriModuleViewProps> = ({
  canManage = false,
  filterKelasId,
}) => {
  const { currentUser, materiList, addMateri, updateMateri, deleteMateri, kelasList } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMateriForPreview, setSelectedMateriForPreview] = useState<Materi | null>(null);

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMateriId, setEditingMateriId] = useState<string | null>(null);
  const [formKelasId, setFormKelasId] = useState(filterKelasId || (kelasList[0]?.id || ''));
  const [formMapel, setFormMapel] = useState(currentUser?.mapelUtama || 'Pemrograman Web');
  const [formJudul, setFormJudul] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formTipe, setFormTipe] = useState<'PDF' | 'LINK'>('PDF');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formFileName, setFormFileName] = useState('');
  const [formLinkUrl, setFormLinkUrl] = useState('');

  // Filtered materi
  const filteredMateri = materiList.filter((m) => {
    if (filterKelasId && m.kelasId !== filterKelasId) return false;
    const matchSearch =
      m.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mapel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const handleOpenCreate = () => {
    setEditingMateriId(null);
    setFormKelasId(filterKelasId || (kelasList[0]?.id || ''));
    setFormMapel(currentUser?.mapelUtama || 'Pemrograman Web');
    setFormJudul('');
    setFormDeskripsi('');
    setFormTipe('PDF');
    setFormFileUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    setFormFileName('Modul_Pembelajaran_CNC.pdf');
    setFormLinkUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Materi) => {
    setEditingMateriId(m.id);
    setFormKelasId(m.kelasId);
    setFormMapel(m.mapel);
    setFormJudul(m.judul);
    setFormDeskripsi(m.deskripsi || '');
    setFormTipe(m.tipe);
    setFormFileUrl(m.fileUrl || '');
    setFormFileName(m.fileName || '');
    setFormLinkUrl(m.linkUrl || '');
    setIsModalOpen(true);
  };

  const handleSaveMateri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const kelas = kelasList.find((k) => k.id === formKelasId);

    if (editingMateriId) {
      updateMateri(editingMateriId, {
        kelasId: formKelasId,
        jurusan: kelas?.jurusan || 'Umum',
        mapel: formMapel,
        judul: formJudul,
        deskripsi: formDeskripsi,
        tipe: formTipe,
        fileUrl: formTipe === 'PDF' ? formFileUrl : undefined,
        fileName: formTipe === 'PDF' ? formFileName || 'Dokumen_Materi.pdf' : undefined,
        linkUrl: formTipe === 'LINK' ? formLinkUrl : undefined,
      });
    } else {
      addMateri({
        guruId: currentUser.id,
        kelasId: formKelasId,
        jurusan: kelas?.jurusan || 'Umum',
        mapel: formMapel,
        judul: formJudul,
        deskripsi: formDeskripsi,
        tipe: formTipe,
        fileUrl: formTipe === 'PDF' ? formFileUrl : undefined,
        fileName: formTipe === 'PDF' ? formFileName || 'Dokumen_Materi.pdf' : undefined,
        linkUrl: formTipe === 'LINK' ? formLinkUrl : undefined,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus materi pembelajaran ini?')) {
      deleteMateri(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Materi Pembelajaran CNC</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {canManage
              ? 'Kelola publikasi modul bahan ajar berupa PDF digital dan tautan referensi web.'
              : 'Baca dan pelajari materi modul bahan ajar yang diberikan oleh bapak/ibu guru.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari materi atau mapel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-60"
            />
          </div>

          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 whitespace-nowrap transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Materi</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMateri.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            Belum ada materi pembelajaran yang diunggah.
          </div>
        ) : (
          filteredMateri.map((m) => {
            const kelas = kelasList.find((k) => k.id === m.kelasId);

            return (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        m.tipe === 'PDF'
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      }`}
                    >
                      {m.tipe === 'PDF' ? <FileText className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                      <span>{m.tipe === 'PDF' ? 'Modul PDF' : 'Tautan Link'}</span>
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 font-mono">
                      {kelas?.judul || 'Umum'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{m.judul}</h3>
                  <span className="text-xs text-indigo-400 font-medium block mt-1">{m.mapel}</span>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                    {m.deskripsi || 'Tidak ada deskripsi tambahan.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  {/* Action buttons */}
                  {m.tipe === 'PDF' && (
                    <button
                      onClick={() => setSelectedMateriForPreview(m)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-rose-400" />
                      <span>Baca Modul ({m.fileName || 'PDF Dokumen'})</span>
                    </button>
                  )}

                  {m.tipe === 'LINK' && m.linkUrl && (
                    <a
                      href={m.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Referensi Web</span>
                    </a>
                  )}

                  {canManage && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Edit Materi"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-400 transition-colors"
                        title="Hapus Materi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL PREVIEW PDF */}
      {selectedMateriForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedMateriForPreview.judul}</h4>
                  <p className="text-xs text-slate-400">{selectedMateriForPreview.mapel}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMateriForPreview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <p className="font-semibold text-white mb-1">Keterangan Modul:</p>
                <p>{selectedMateriForPreview.deskripsi || 'Silakan pelajari dokumen terlampir berikut.'}</p>
              </div>

              {/* PDF Viewer simulation / iframe */}
              <div className="w-full h-96 rounded-xl border border-slate-800 overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <FileText className="w-12 h-12 text-rose-500 animate-bounce" />
                <h5 className="text-sm font-bold text-white">
                  {selectedMateriForPreview.fileName || 'Modul_Pembelajaran_CNC.pdf'}
                </h5>
                <p className="text-xs text-slate-400 max-w-md">
                  Dokumen PDF resmi pembelajaran CNC Academy siap dibaca atau diunduh untuk pembelajaran daring.
                </p>
                <a
                  href={selectedMateriForPreview.fileUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Buka / Unduh Berkas PDF Lengkap</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREATE / EDIT MATERI (GURU ONLY) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">
                {editingMateriId ? 'Edit Materi Pembelajaran' : 'Upload Materi Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMateri} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Rombel Kelas:
                </label>
                <select
                  value={formKelasId}
                  onChange={(e) => setFormKelasId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
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
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul Materi Pembelajaran:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modul 02 - State Management & Context API"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deskripsi / Petunjuk Baca:
                </label>
                <textarea
                  rows={2}
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  placeholder="Instruksi belajar atau ringkasan topik materi..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Format Tipe: PDF vs Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tipe Lampiran Materi:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormTipe('PDF')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border ${
                      formTipe === 'PDF'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Upload PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTipe('LINK')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border ${
                      formTipe === 'LINK'
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>Tautan Link</span>
                  </button>
                </div>
              </div>

              {formTipe === 'PDF' ? (
                <div className="space-y-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nama File PDF:</label>
                    <input
                      type="text"
                      placeholder="Modul_01_Dasar_Web.pdf"
                      value={formFileName}
                      onChange={(e) => setFormFileName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">URL File PDF:</label>
                    <input
                      type="url"
                      placeholder="https://.../materi.pdf"
                      value={formFileUrl}
                      onChange={(e) => setFormFileUrl(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Tautan Web Referensi:
                  </label>
                  <input
                    type="url"
                    placeholder="https://react.dev/reference/..."
                    value={formLinkUrl}
                    onChange={(e) => setFormLinkUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Materi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
