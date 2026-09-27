import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LIST_JURUSAN, Kelas } from '../types';
import { X, School, UserCheck, FileText, Check } from 'lucide-react';

interface ModalBuatKelasProps {
  isOpen: boolean;
  onClose: () => void;
  kelasToEdit?: Kelas | null;
}

export const ModalBuatKelas: React.FC<ModalBuatKelasProps> = ({
  isOpen,
  onClose,
  kelasToEdit,
}) => {
  const { createKelas, updateKelas, users } = useApp();

  const [judul, setJudul] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [walasId, setWalasId] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  const teachers = users.filter((u) => u.role === 'GURU');

  useEffect(() => {
    if (kelasToEdit) {
      setJudul(kelasToEdit.judul || '');
      setJurusan(kelasToEdit.jurusan || '');
      setWalasId(kelasToEdit.walasId || '');
      setDeskripsi(kelasToEdit.deskripsi || '');
    } else {
      setJudul('');
      setJurusan(LIST_JURUSAN[0]);
      setWalasId('');
      setDeskripsi('');
    }
  }, [kelasToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalJudul = judul.trim() || jurusan || 'Kelas Baru';

    if (kelasToEdit) {
      updateKelas(kelasToEdit.id, {
        judul: finalJudul,
        jurusan,
        walasId: walasId || undefined,
        deskripsi,
      });
    } else {
      createKelas({
        judul: finalJudul,
        jurusan,
        walasId: walasId || undefined,
        deskripsi,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 border border-teal-200 text-[#069494]">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {kelasToEdit ? 'Edit Data Rombel Kelas' : 'Buat Rombel Kelas Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Judul opsional, Walas opsional, dan Deskripsi opsional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Judul Kelas (Opsional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Judul Kelas
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Sifatnya Opsional</span>
            </div>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder={`Contoh: 12 PPLG 2 atau Kelas Pemrograman (Default: ${jurusan || 'Pilihan Jurusan'})`}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white transition-all"
            />
          </div>

          {/* Pilih Jurusan (Dropdown dari 60+ Jurusan) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Tingkat / Jurusan Terkait
              </label>
              <span className="text-[10px] text-[#069494] font-bold font-mono">60+ Jurusan CNC</span>
            </div>
            <select
              value={jurusan}
              onChange={(e) => {
                setJurusan(e.target.value);
                if (!judul) setJudul(e.target.value);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white transition-all"
            >
              <option value="">-- Pilih Jurusan / Tingkat --</option>
              {LIST_JURUSAN.map((j) => (
                <option key={j} value={j} className="text-slate-900">
                  {j}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Walas (Bukan wajib / opsional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#069494]" />
                Pilih Wali Kelas (Walas)
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Bukan Wajib / Opsional</span>
            </div>
            <select
              value={walasId}
              onChange={(e) => setWalasId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white transition-all"
            >
              <option value="">-- Belum Ditentukan (Kosongkan) --</option>
              {teachers.map((g) => (
                <option key={g.id} value={g.id} className="text-slate-900">
                  {g.nama} {g.nik ? `(NIK: ${g.nik})` : ''} - {g.mapelUtama || 'Guru'}
                </option>
              ))}
            </select>
          </div>

          {/* Deskripsi (Opsional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#069494]" />
                Deskripsi Kelas
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Opsional</span>
            </div>
            <textarea
              rows={3}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Keterangan singkat seputar ruangan, kurikulum, atau jadwal kelas..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#069494] hover:bg-[#057979] text-white shadow-md shadow-[#069494]/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{kelasToEdit ? 'Simpan Perubahan' : 'Buat Kelas Sekarang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
