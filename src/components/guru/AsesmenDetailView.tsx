import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Asesmen, Soal, TipeSoal, OpsiPilihan } from '../../types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  CheckSquare,
  FileText,
  Image as ImageIcon,
  Clock,
  Send,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface AsesmenDetailViewProps {
  asesmenId: string;
  onBack: () => void;
}

export const AsesmenDetailView: React.FC<AsesmenDetailViewProps> = ({ asesmenId, onBack }) => {
  const {
    asesmenList,
    currentUser,
    kelasList,
    users,
    updateAsesmen,
    addSoal,
    updateSoal,
    deleteSoal,
    jawabanList,
    nilaiRekapList,
    generateNilai,
    deleteNilaiRekap,
    exportToExcel,
    setViewingProfileUser,
  } = useApp();

  const asesmen = asesmenList.find((a) => a.id === asesmenId);

  const [activeTab, setActiveTab] = useState<'SOAL' | 'JAWABAN_SISWA' | 'REKAP_NILAI'>('SOAL');

  // Modal / Form state for creating / editing Soal
  const [isModalSoalOpen, setIsModalSoalOpen] = useState(false);
  const [editingSoalId, setEditingSoalId] = useState<string | null>(null);

  const [tipeSoal, setTipeSoal] = useState<TipeSoal>('PILIHAN_GANDA');
  const [pertanyaan, setPertanyaan] = useState('');
  const [gambarUrl, setGambarUrl] = useState('');
  const [poin, setPoin] = useState(25);
  const [opsiList, setOpsiList] = useState<OpsiPilihan[]>([
    { id: 'opt-1', label: '', isBenar: true },
    { id: 'opt-2', label: '', isBenar: false },
    { id: 'opt-3', label: '', isBenar: false },
    { id: 'opt-4', label: '', isBenar: false },
  ]);
  const [kunciEssay, setKunciEssay] = useState('');

  if (!asesmen) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        Asesmen tidak ditemukan.
        <button onClick={onBack} className="block mx-auto mt-3 text-[#069494] font-bold text-xs">
          Kembali
        </button>
      </div>
    );
  }

  const isOwner = currentUser?.id === asesmen.guruId;
  const canEdit = isOwner;
  const kelas = kelasList.find((k) => k.id === asesmen.kelasId);
  const submissions = jawabanList.filter((j) => j.asesmenId === asesmen.id);
  const rekapNilai = nilaiRekapList.filter((r) => r.asesmenId === asesmen.id);

  const handleOpenAddSoal = () => {
    setEditingSoalId(null);
    setTipeSoal('PILIHAN_GANDA');
    setPertanyaan('');
    setGambarUrl('');
    setPoin(25);
    setOpsiList([
      { id: `opt-${Date.now()}-1`, label: '', isBenar: true },
      { id: `opt-${Date.now()}-2`, label: '', isBenar: false },
      { id: `opt-${Date.now()}-3`, label: '', isBenar: false },
      { id: `opt-${Date.now()}-4`, label: '', isBenar: false },
    ]);
    setKunciEssay('');
    setIsModalSoalOpen(true);
  };

  const handleOpenEditSoal = (soal: Soal) => {
    setEditingSoalId(soal.id);
    setTipeSoal(soal.tipe);
    setPertanyaan(soal.pertanyaan);
    setGambarUrl(soal.gambarUrl || '');
    setPoin(soal.poin);
    if (soal.opsi) {
      setOpsiList(soal.opsi);
    }
    setKunciEssay(soal.kunciJawaban?.[0] || '');
    setIsModalSoalOpen(true);
  };

  const handleSaveSoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pertanyaan.trim()) return;

    let finalKunci: string[] = [];
    let finalOpsi: OpsiPilihan[] | undefined = undefined;

    if (tipeSoal === 'PILIHAN_GANDA' || tipeSoal === 'KOTAK_CENTANG') {
      finalOpsi = opsiList.filter((o) => o.label.trim() !== '');
      finalKunci = finalOpsi.filter((o) => o.isBenar).map((o) => o.id);
    } else {
      finalKunci = [kunciEssay.trim()];
    }

    if (editingSoalId) {
      updateSoal(asesmen.id, editingSoalId, {
        tipe: tipeSoal,
        pertanyaan: pertanyaan.trim(),
        gambarUrl: gambarUrl.trim() || undefined,
        poin: Number(poin) || 10,
        opsi: finalOpsi,
        kunciJawaban: finalKunci,
      });
    } else {
      addSoal(asesmen.id, {
        tipe: tipeSoal,
        pertanyaan: pertanyaan.trim(),
        gambarUrl: gambarUrl.trim() || undefined,
        poin: Number(poin) || 10,
        opsi: finalOpsi,
        kunciJawaban: finalKunci,
      });
    }

    setIsModalSoalOpen(false);
  };

  const toggleStatusPublish = () => {
    const nextStatus = asesmen.status === 'PROSES' ? 'SELESAI' : 'PROSES';
    updateAsesmen(asesmen.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#069494] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Asesmen</span>
        </button>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleStatusPublish}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
                asesmen.status === 'PROSES'
                  ? 'bg-[#069494] hover:bg-[#057c7c] text-white shadow-[#069494]/20'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {asesmen.status === 'PROSES'
                  ? 'Publikasikan ke Kelas (Selesai)'
                  : 'Kembalikan ke Draft (Sedang Diproses)'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Info Banner with Figma theme */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-50 via-white to-pink-50 border border-teal-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-teal-100 text-[#069494] border border-teal-200">
                {asesmen.tipe}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  asesmen.status === 'SELESAI'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {asesmen.status === 'SELESAI' ? 'Status: Selesai (Aktif di Kelas)' : 'Status: Sedang Diproses (Draft)'}
              </span>
              {asesmen.durasiMenit && (
                <span className="text-xs font-mono font-bold text-[#069494] flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Durasi: {asesmen.durasiMenit} Menit</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {asesmen.judul}
            </h1>
            <p className="text-xs sm:text-sm text-[#069494] font-bold mt-1">
              Mata Pelajaran: {asesmen.mapel}
            </p>
            <p className="text-xs text-slate-500 mt-2 max-w-2xl font-medium">
              {asesmen.deskripsi || 'Tidak ada deskripsi tambahan.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 space-y-1.5 min-w-[200px] shadow-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-medium">Target Kelas:</span>
              <span className="font-bold text-slate-800">{kelas ? kelas.judul : 'Draft (Belum Ditentukan)'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-medium">Total Soal Dibuat:</span>
              <span className="font-bold text-[#069494]">{asesmen.soalList.length} Butir Soal</span>
            </div>
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-slate-200/80 text-xs font-bold">
          {[
            { id: 'SOAL', label: 'Daftar Bank Soal', count: asesmen.soalList.length },
            { id: 'JAWABAN_SISWA', label: 'Jawaban Siswa Masuk', count: submissions.length },
            { id: 'REKAP_NILAI', label: 'Rekap Nilai & Export Excel', count: rekapNilai.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#069494] text-white shadow-md shadow-[#069494]/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: BANK SOAL */}
      {activeTab === 'SOAL' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Butir Soal Asesmen ({asesmen.soalList.length})</h3>
              <p className="text-xs text-slate-500">
                Pilihan Ganda biasa, Kotak Centang bergaya Google Forms, dan Soal Essay
              </p>
            </div>

            {canEdit && (
              <button
                onClick={handleOpenAddSoal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold shadow-md shadow-[#069494]/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Soal</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {asesmen.soalList.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                Belum ada butir soal. Klik tombol "Tambah Soal" untuk mulai menyusun soal.
              </div>
            ) : (
              asesmen.soalList.map((soal, idx) => (
                <div
                  key={soal.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-[#069494] transition-all space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-teal-50 text-[#069494] font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {soal.tipe === 'KOTAK_CENTANG'
                          ? 'Kotak Centang (Multi-Answer)'
                          : soal.tipe === 'PILIHAN_GANDA'
                          ? 'Pilihan Ganda (Single)'
                          : 'Essay'}
                      </span>
                      <span className="text-xs font-mono text-[#069494] font-bold">
                        {soal.poin} Poin
                      </span>
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditSoal(soal)}
                          className="p-1.5 text-slate-400 hover:text-[#069494] hover:bg-teal-50 rounded-lg transition-colors"
                          title="Edit Soal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Hapus butir soal ini?')) {
                              deleteSoal(asesmen.id, soal.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Soal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Pertanyaan & Foto */}
                  <p className="text-sm text-slate-900 font-semibold whitespace-pre-line">
                    {soal.pertanyaan}
                  </p>

                  {soal.gambarUrl && (
                    <div className="max-w-md rounded-2xl overflow-hidden border border-slate-200">
                      <img
                        src={soal.gambarUrl}
                        alt="Gambar Soal"
                        className="w-full h-auto max-h-56 object-cover"
                      />
                    </div>
                  )}

                  {/* Opsi Jawaban */}
                  {(soal.tipe === 'PILIHAN_GANDA' || soal.tipe === 'KOTAK_CENTANG') && soal.opsi && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {soal.opsi.map((opsi, oIdx) => {
                        const isKunci = soal.kunciJawaban?.includes(opsi.id) || opsi.isBenar;
                        return (
                          <div
                            key={opsi.id}
                            className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                              isKunci
                                ? 'bg-teal-50 border-teal-300 text-[#069494] font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                isKunci
                                  ? 'bg-[#069494] text-white'
                                  : 'bg-white text-slate-600 border border-slate-200'
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1">{opsi.label}</span>
                            {isKunci && (
                              <span className="text-[10px] font-bold text-[#069494]">
                                (Kunci)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {soal.tipe === 'ESSAY' && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <span className="text-[#069494] font-bold text-[10px] uppercase">
                        Pedoman / Acuan Kunci Jawaban:
                      </span>
                      <p className="text-slate-600 italic">
                        {soal.kunciJawaban?.[0] || 'Tidak ada referensi kunci essay tertulis.'}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: JAWABAN SISWA */}
      {activeTab === 'JAWABAN_SISWA' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Jawaban Siswa Masuk ({submissions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Daftar pengumpulan jawaban lengkap dari siswa yang telah menyelesaikan asesmen
              </p>
            </div>

            <button
              onClick={() => {
                generateNilai(asesmen.id);
                setActiveTab('REKAP_NILAI');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold shadow-md shadow-[#069494]/20 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Generate Nilai ke Excel</span>
            </button>
          </div>

          <div className="space-y-3">
            {submissions.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                Belum ada siswa yang mengumpulkan jawaban untuk asesmen ini.
              </div>
            ) : (
              submissions.map((sub) => {
                const siswa = users.find((u) => u.id === sub.siswaId);

                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#069494] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={siswa?.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={siswa?.nama}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p
                          onClick={() => siswa && setViewingProfileUser(siswa)}
                          className="text-xs font-bold text-slate-900 hover:text-[#069494] cursor-pointer"
                        >
                          {siswa?.nama}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500">
                          NISN: {siswa?.nisn || '-'} • Jurusan: {siswa?.jurusanAsal || 'Umum'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Submit: {new Date(sub.waktuSubmit).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Skor / Nilai:</span>
                        <span className="text-lg font-extrabold text-[#069494] font-mono">
                          {sub.totalNilai} / 100
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-[#069494] border border-teal-200">
                        {sub.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: REKAP NILAI EXCEL */}
      {activeTab === 'REKAP_NILAI' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Tabel Rekapitulasi Nilai Asesmen</h3>
              <p className="text-xs text-slate-500">
                Format tabel siap download langsung ke file spreadsheet Microsoft Excel (.csv UTF-8 BOM)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => generateNilai(asesmen.id)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#069494] text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Perbarui Nilai</span>
              </button>

              <button
                onClick={() => exportToExcel(asesmen.id)}
                className="px-4 py-2 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#069494]/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Excel</span>
              </button>
            </div>
          </div>

          {rekapNilai.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
              Belum ada data nilai yang di-generate. Klik tombol "Perbarui Nilai" atau "Generate Nilai ke Excel".
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">No</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Kelas &amp; Jurusan</th>
                    <th className="p-3">Mata Pelajaran</th>
                    <th className="p-3">Email</th>
                    <th className="p-3 text-center">Nilai</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rekapNilai.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{item.namaSiswa}</td>
                      <td className="p-3">{item.kelasJurusan}</td>
                      <td className="p-3 text-[#069494] font-semibold">{item.mapel}</td>
                      <td className="p-3 text-slate-500">{item.email}</td>
                      <td className="p-3 text-center font-extrabold text-[#069494] text-sm">
                        {item.nilai}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Hapus entri nilai ${item.namaSiswa}?`)) {
                              deleteNilaiRekap(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Nilai"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL BUAT / EDIT SOAL */}
      {isModalSoalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingSoalId ? 'Edit Butir Soal' : 'Tambah Butir Soal Baru'}
              </h3>
              <button
                onClick={() => setIsModalSoalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSoal} className="space-y-4">
              {/* Tipe Soal Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipe Format Soal:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'PILIHAN_GANDA', label: 'Pilihan Ganda', icon: CheckCircle2 },
                    { id: 'KOTAK_CENTANG', label: 'Kotak Centang', icon: CheckSquare },
                    { id: 'ESSAY', label: 'Essay / Uraian', icon: FileText },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSel = tipeSoal === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTipeSoal(t.id as TipeSoal)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isSel
                            ? 'bg-[#069494] border-[#069494] text-white shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pertanyaan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pertanyaan Soal:
                </label>
                <textarea
                  rows={3}
                  required
                  value={pertanyaan}
                  onChange={(e) => setPertanyaan(e.target.value)}
                  placeholder="Tuliskan butir pertanyaan secara jelas..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white"
                />
              </div>

              {/* URL Foto / Gambar Soal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#069494]" />
                    URL Gambar / Foto Soal (Opsional)
                  </label>
                  <input
                    type="url"
                    value={gambarUrl}
                    onChange={(e) => setGambarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bobot Poin Soal:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={poin}
                    onChange={(e) => setPoin(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494]"
                  />
                </div>
              </div>

              {/* Options for Pilihan Ganda & Kotak Centang */}
              {(tipeSoal === 'PILIHAN_GANDA' || tipeSoal === 'KOTAK_CENTANG') && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Opsi Pilihan ({tipeSoal === 'KOTAK_CENTANG' ? 'Centang semua jawaban benar' : 'Pilih satu jawaban benar'}):
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setOpsiList((prev) => [
                          ...prev,
                          { id: `opt-${Date.now()}`, label: '', isBenar: false },
                        ])
                      }
                      className="text-[11px] text-[#069494] hover:text-[#057c7c] font-bold"
                    >
                      + Tambah Opsi
                    </button>
                  </div>

                  <div className="space-y-2">
                    {opsiList.map((opsi, oIdx) => (
                      <div key={opsi.id} className="flex items-center gap-2">
                        <input
                          type={tipeSoal === 'KOTAK_CENTANG' ? 'checkbox' : 'radio'}
                          name="kunci-jawaban"
                          checked={opsi.isBenar}
                          onChange={(e) => {
                            if (tipeSoal === 'PILIHAN_GANDA') {
                              setOpsiList((prev) =>
                                prev.map((item, idx) => ({ ...item, isBenar: idx === oIdx }))
                              );
                            } else {
                              setOpsiList((prev) =>
                                prev.map((item, idx) =>
                                  idx === oIdx ? { ...item, isBenar: e.target.checked } : item
                                )
                              );
                            }
                          }}
                          className="w-4 h-4 rounded text-[#069494] focus:ring-0"
                          title="Tandai sebagai kunci jawaban"
                        />
                        <span className="text-xs font-bold text-slate-500 w-4">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <input
                          type="text"
                          required
                          value={opsi.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOpsiList((prev) =>
                              prev.map((item, idx) => (idx === oIdx ? { ...item, label: val } : item))
                            );
                          }}
                          placeholder={`Teks pilihan ${String.fromCharCode(65 + oIdx)}...`}
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494]"
                        />
                        {opsiList.length > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              setOpsiList((prev) => prev.filter((_, idx) => idx !== oIdx))
                            }
                            className="p-1 text-slate-400 hover:text-rose-500"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Essay Guide */}
              {tipeSoal === 'ESSAY' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pedoman / Kunci Jawaban Essay (Untuk Acuan Koreksi):
                  </label>
                  <textarea
                    rows={2}
                    value={kunciEssay}
                    onChange={(e) => setKunciEssay(e.target.value)}
                    placeholder="Tuliskan kata kunci atau kriteria jawaban yang diharapkan..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalSoalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold shadow-md shadow-[#069494]/20"
                >
                  Simpan Butir Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
