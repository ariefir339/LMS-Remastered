import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LIST_JURUSAN, NilaiRekap } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Sparkles,
  School,
  Building,
  BookOpen,
} from 'lucide-react';

interface RekapNilaiViewProps {
  canManage?: boolean; // True for Guru, False for Kurikulum / Kepsek
}

export const RekapNilaiView: React.FC<RekapNilaiViewProps> = ({ canManage = false }) => {
  const {
    currentUser,
    nilaiRekapList,
    generateNilaiPerFilter,
    deleteNilaiRekap,
    exportNilaiFiltered,
    kelasList,
    users,
  } = useApp();

  // Filters
  const [filterMapel, setFilterMapel] = useState<string>('');
  const [filterKelasId, setFilterKelasId] = useState<string>('');
  const [filterJurusan, setFilterJurusan] = useState<string>('');
  const [searchStudent, setSearchStudent] = useState<string>('');

  // Edit in-line score
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNilai, setEditingNilai] = useState<number>(0);

  // Apply filters to current state
  const displayedNilai = nilaiRekapList.filter((r) => {
    if (filterMapel && !r.mapel.toLowerCase().includes(filterMapel.toLowerCase())) return false;
    if (filterJurusan && !r.kelasJurusan.includes(filterJurusan)) return false;
    if (searchStudent && !r.namaSiswa.toLowerCase().includes(searchStudent.toLowerCase()))
      return false;
    return true;
  });

  const handleGenerateClick = () => {
    const results = generateNilaiPerFilter(
      filterMapel || undefined,
      filterKelasId || undefined,
      filterJurusan || undefined
    );
    alert(`Berhasil merekap ${results.length} data perolehan nilai siswa.`);
  };

  const handleDownloadExcel = () => {
    const label = `Rekap_Nilai_${filterMapel || 'SemuaMapel'}_${filterJurusan || 'SemuaJurusan'}`;
    exportNilaiFiltered(displayedNilai, label);
  };

  const handleSaveEdit = (item: NilaiRekap) => {
    item.nilai = Number(editingNilai);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">
              Rekapitulasi Nilai Akademik CNC
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {canManage
              ? 'Generate rekapitulasi nilai evaluasi per mata pelajaran, rombel kelas, dan jurusan kejuruan.'
              : 'Audit hasil pembelajaran dan unduh berkas rekap nilai resmi per mapel dan guru.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={handleGenerateClick}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Generate Nilai Otomatis</span>
            </button>
          )}

          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Excel (.csv)</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR: Per Mapel + Per Kelas + Per Jurusan */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Filter Mapel */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filter Mata Pelajaran:</span>
          </label>
          <input
            type="text"
            placeholder="Ketik mapel..."
            value={filterMapel}
            onChange={(e) => setFilterMapel(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Kelas */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
            <School className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filter Rombel Kelas:</span>
          </label>
          <select
            value={filterKelasId}
            onChange={(e) => setFilterKelasId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.judul}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Jurusan */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-amber-400" />
            <span>Filter Jurusan:</span>
          </label>
          <select
            value={filterJurusan}
            onChange={(e) => setFilterJurusan(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">Semua Jurusan</option>
            {LIST_JURUSAN.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        {/* Search Siswa */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cari Nama Siswa:</span>
          </label>
          <input
            type="text"
            placeholder="Nama siswa..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Kelas &amp; Jurusan</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Email Akun</th>
                <th className="py-3 px-4 text-center">Nilai Akhir</th>
                <th className="py-3 px-4">Waktu Generate</th>
                {canManage && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {displayedNilai.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="py-8 text-center text-slate-500">
                    Tidak ada data rekap nilai yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                displayedNilai.map((item, idx) => {
                  const isEditingThis = editingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-white">{item.namaSiswa}</td>
                      <td className="py-3 px-4 font-mono text-cyan-300">{item.kelasJurusan}</td>
                      <td className="py-3 px-4 text-slate-200">{item.mapel}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{item.email}</td>
                      <td className="py-3 px-4 text-center">
                        {isEditingThis ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editingNilai}
                            onChange={(e) => setEditingNilai(Number(e.target.value))}
                            className="w-16 px-2 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-xs text-emerald-400 font-bold font-mono"
                          />
                        ) : (
                          <span
                            className={`font-mono font-extrabold px-2 py-0.5 rounded ${
                              item.nilai >= 75
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {item.nilai}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(item.tanggalGenerate).toLocaleString('id-ID')}
                      </td>
                      {canManage && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditingThis ? (
                              <button
                                onClick={() => handleSaveEdit(item)}
                                className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                                title="Simpan Nilai"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditingNilai(item.nilai);
                                }}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                title="Edit Nilai"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => deleteNilaiRekap(item.id)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400"
                              title="Hapus Rekap"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
