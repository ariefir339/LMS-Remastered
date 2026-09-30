import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NilaiRekap, LIST_JURUSAN } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Trash2,
  Edit3,
  Check,
  X,
  RefreshCw,
  Search,
} from 'lucide-react';

interface RekapNilaiViewProps {
  canManage?: boolean; // True for Guru / Admin, False for Read-only
}

export const RekapNilaiView: React.FC<RekapNilaiViewProps> = ({ canManage = false }) => {
  const {
    nilaiRekapList,
    updateNilaiRekap,
    deleteNilaiRekap,
    asesmenList,
    generateNilai,
    exportNilaiFiltered,
    kelasList,
  } = useApp();

  // Filters: Per Mapel + Per Kelas + Per Jurusan
  const [filterMapel, setFilterMapel] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');
  const [searchSiswa, setSearchSiswa] = useState('');

  // Inline Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<number>(0);

  // Extract unique Mapels for filter dropdown
  const availableMapels = Array.from(
    new Set([
      ...nilaiRekapList.map((n) => n.mapel),
      ...asesmenList.map((a) => a.mapel),
    ])
  ).filter(Boolean);

  // Extract unique Kelas names
  const availableKelasNames = Array.from(
    new Set([
      ...nilaiRekapList.map((n) => n.kelasJurusan),
      ...kelasList.map((k) => k.judul),
    ])
  ).filter(Boolean);

  // Filtered rows
  const filteredNilai = nilaiRekapList.filter((row) => {
    const matchMapel = filterMapel ? row.mapel === filterMapel : true;
    const matchKelas = filterKelas ? row.kelasJurusan === filterKelas : true;
    const matchJurusan = filterJurusan
      ? row.kelasJurusan.toLowerCase().includes(filterJurusan.toLowerCase())
      : true;
    const matchSearch =
      row.namaSiswa.toLowerCase().includes(searchSiswa.toLowerCase()) ||
      row.email.toLowerCase().includes(searchSiswa.toLowerCase());

    return matchMapel && matchKelas && matchJurusan && matchSearch;
  });

  const handleGenerateAll = () => {
    asesmenList.forEach((a) => {
      generateNilai(a.id);
    });
    alert('Seluruh nilai dari asesmen dan jawaban siswa telah disinkronisasi!');
  };

  const handleStartEdit = (row: NilaiRekap) => {
    setEditingId(row.id);
    setEditScore(row.nilai);
  };

  const handleSaveEdit = (id: string) => {
    updateNilaiRekap(id, Number(editScore));
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Control & Export Bar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#069494]" />
              <h2 className="text-base font-extrabold text-slate-900">
                Pusat Rekapitulasi Nilai &amp; Export Excel
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Filter nilai berdasarkan Mata Pelajaran, Rombel Kelas, atau Jurusan, lalu unduh laporan Excel (.csv).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateAll}
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#069494] border border-teal-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sinkronkan Semua Nilai Asesmen</span>
            </button>

            <button
              onClick={() =>
                exportNilaiFiltered(
                  filteredNilai,
                  `Rekap_Nilai_${filterMapel || 'SemuaMapel'}_${filterKelas || 'SemuaKelas'}`
                )
              }
              className="px-4 py-2 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#069494]/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Filter ke Excel ({filteredNilai.length})</span>
            </button>
          </div>
        </div>

        {/* Multi-Filter Bar: Mapel, Kelas, Jurusan, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Filter Mapel */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
              Filter Mata Pelajaran:
            </label>
            <select
              value={filterMapel}
              onChange={(e) => setFilterMapel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white font-medium"
            >
              <option value="">-- Semua Mata Pelajaran --</option>
              {availableMapels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kelas */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
              Filter Rombel Kelas:
            </label>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white font-medium"
            >
              <option value="">-- Semua Kelas --</option>
              {availableKelasNames.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Jurusan */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
              Filter 60+ Jurusan:
            </label>
            <select
              value={filterJurusan}
              onChange={(e) => setFilterJurusan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white font-medium"
            >
              <option value="">-- Semua Jurusan --</option>
              {LIST_JURUSAN.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          {/* Search Nama / Email */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
              Cari Nama / Email Siswa:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ketik nama siswa..."
                value={searchSiswa}
                onChange={(e) => setSearchSiswa(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">No</th>
                <th className="p-3.5">Nama Siswa</th>
                <th className="p-3.5">Kelas &amp; Jurusan</th>
                <th className="p-3.5">Mata Pelajaran</th>
                <th className="p-3.5">Email Siswa</th>
                <th className="p-3.5 text-center">Nilai Akhir</th>
                {canManage && <th className="p-3.5 text-right">Kelola Nilai</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNilai.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="p-10 text-center text-slate-400">
                    Tidak ada data nilai yang cocok dengan filter di atas. Klik &ldquo;Sinkronkan Semua Nilai Asesmen&rdquo; jika baru saja ada ujian selesai.
                  </td>
                </tr>
              ) : (
                filteredNilai.map((row, index) => {
                  const isEditing = editingId === row.id;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400 tabular-nums">{index + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900">{row.namaSiswa}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-[#069494]">
                          {row.kelasJurusan}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700 font-semibold">{row.mapel}</td>
                      <td className="p-3.5 font-mono text-slate-500">{row.email}</td>
                      <td className="p-3.5 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editScore}
                            onChange={(e) => setEditScore(Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-white border border-[#069494] rounded-lg text-center font-mono text-slate-900 font-bold"
                          />
                        ) : (
                          <span
                            className={`text-sm font-mono font-extrabold tabular-nums ${
                              row.nilai >= 75 ? 'text-[#069494]' : 'text-amber-600'
                            }`}
                          >
                            {row.nilai}
                          </span>
                        )}
                      </td>

                      {canManage && (
                        <td className="p-3.5 text-right">
                          {isEditing ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleSaveEdit(row.id)}
                                className="p-1.5 rounded-lg bg-[#069494] text-white hover:bg-[#057c7c]"
                                title="Simpan Nilai"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                                title="Batal"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleStartEdit(row)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#069494] hover:bg-teal-50 transition-colors"
                                title="Edit Nilai"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus nilai ${row.namaSiswa} untuk mapel ${row.mapel}?`)) {
                                    deleteNilaiRekap(row.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                title="Hapus Nilai"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
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
