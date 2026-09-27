import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LIST_JURUSAN } from '../types';
import { X, UserPlus, GraduationCap, Users, Check, Building, BookOpen, Layers } from 'lucide-react';

interface ModalBuatAkunProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'GURU' | 'SISWA';
  defaultJurusan?: string;
}

export const ModalBuatAkun: React.FC<ModalBuatAkunProps> = ({
  isOpen,
  onClose,
  defaultRole = 'SISWA',
  defaultJurusan,
}) => {
  const { addUser, kelasList } = useApp();

  const [role, setRole] = useState<'GURU' | 'SISWA'>(defaultRole);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState(''); // NIK or NISN

  // Siswa specific
  const [siswaJurusan, setSiswaJurusan] = useState(defaultJurusan || LIST_JURUSAN[0]);
  const [siswaKelasId, setSiswaKelasId] = useState('');

  // Guru specific
  const [guruJurusanList, setGuruJurusanList] = useState<string[]>(['12 PPLG 2']);
  const [guruKelasList, setGuruKelasList] = useState<string[]>([]);
  const [mapelUtama, setMapelUtama] = useState('');

  // Optional fields for both
  const [deskripsi, setDeskripsi] = useState('');
  const [foto, setFoto] = useState('');

  if (!isOpen) return null;

  const handleToggleGuruJurusan = (jurusan: string) => {
    setGuruJurusanList((prev) =>
      prev.includes(jurusan) ? prev.filter((j) => j !== jurusan) : [...prev, jurusan]
    );
  };

  const handleToggleGuruKelas = (kelasId: string) => {
    setGuruKelasList((prev) =>
      prev.includes(kelasId) ? prev.filter((k) => k !== kelasId) : [...prev, kelasId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const defaultAvatar =
      role === 'GURU'
        ? `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80`
        : `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;

    if (role === 'SISWA') {
      addUser({
        nama: nama.trim(),
        email: email.trim().toLowerCase(),
        role: 'SISWA',
        nisn: identifier.trim(),
        nik: identifier.trim(),
        jurusanAsal: siswaJurusan,
        kelasId: siswaKelasId || undefined,
        deskripsi: deskripsi.trim() || undefined,
        foto: foto.trim() || defaultAvatar,
      });
    } else {
      addUser({
        nama: nama.trim(),
        email: email.trim().toLowerCase(),
        role: 'GURU',
        nik: identifier.trim(),
        mapelUtama: mapelUtama.trim() || 'Umum',
        jurusanList: guruJurusanList.length > 0 ? guruJurusanList : ['Umum'],
        kelasList: guruKelasList,
        deskripsi: deskripsi.trim() || undefined,
        foto: foto.trim() || defaultAvatar,
      });
    }

    onClose();
    // Reset form
    setNama('');
    setEmail('');
    setIdentifier('');
    setDeskripsi('');
    setFoto('');
    setMapelUtama('');
    setGuruKelasList([]);
  };

  // Filter classes matching student's jurusan
  const matchingClassesForStudent = kelasList.filter((k) => k.jurusan === siswaJurusan || k.judul.includes(siswaJurusan));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 border border-teal-200 text-[#069494]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Registrasi Pengguna CNC</h3>
              <p className="text-xs text-slate-500">Pendaftaran Siswa &amp; Guru oleh Administrator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setRole('SISWA')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'SISWA'
                ? 'bg-[#FF69B4] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Registrasi Siswa</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('GURU')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              role === 'GURU'
                ? 'bg-[#069494] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Registrasi Guru + Pelajaran</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap <span className="text-[#FF69B4]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={role === 'GURU' ? 'Budi Santoso, S.Kom' : 'Ahmad Fauzan'}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white transition-all"
            />
          </div>

          {/* 2. Email & NIK/NISN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Pengguna <span className="text-[#FF69B4]">*</span>
              </label>
              <input
                type="email"
                required
                placeholder={role === 'GURU' ? 'budi@guru.cnc.sch.id' : 'siswa@siswa.cnc.sch.id'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {role === 'GURU' ? 'NIK Guru' : 'NIK / NISN Siswa'} <span className="text-[#FF69B4]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={role === 'GURU' ? '198501012010011001' : '0061234561'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* SPECIFIC CONFIG FOR SISWA: Pilih Jurusan apa terus Kelasnya apa */}
          {role === 'SISWA' && (
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-200/70 space-y-3">
              <span className="text-xs font-bold text-[#FF69B4] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                <span>Penempatan Jurusan &amp; Kelas Siswa</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Pilih Jurusan Siswa:
                  </label>
                  <select
                    value={siswaJurusan}
                    onChange={(e) => {
                      setSiswaJurusan(e.target.value);
                      setSiswaKelasId('');
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#FF69B4]"
                  >
                    {LIST_JURUSAN.map((jur) => (
                      <option key={jur} value={jur}>
                        {jur}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Pilih Kelas Siswa:
                  </label>
                  <select
                    value={siswaKelasId}
                    onChange={(e) => setSiswaKelasId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#FF69B4]"
                  >
                    <option value="">-- Pilih Kelas Aktif --</option>
                    {matchingClassesForStudent.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.judul} ({k.siswaIds.length} Siswa)
                      </option>
                    ))}
                    {kelasList.filter((k) => !matchingClassesForStudent.includes(k)).map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.judul} (Lainnya)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SPECIFIC CONFIG FOR GURU: Megang Jurusan apa aja, Kelas apa aja, Mapel guru apa */}
          {role === 'GURU' && (
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/70 space-y-3">
              <span className="text-xs font-bold text-[#069494] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Penugasan Mata Pelajaran, Jurusan &amp; Kelas Guru</span>
              </span>

              {/* Mapel Guru */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Mata Pelajaran yang Diampu Guru: <span className="text-[#FF69B4]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemrograman Web & Perangkat Bergerak"
                  value={mapelUtama}
                  onChange={(e) => setMapelUtama(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494]"
                />
              </div>

              {/* Update Guru Akan Megang Jurusan Apa Aja */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Jurusan yang Dipegang Guru (Multi-Pilihan):
                </label>
                <div className="max-h-28 overflow-y-auto p-2 bg-white border border-slate-200 rounded-xl grid grid-cols-2 gap-1 text-[11px]">
                  {LIST_JURUSAN.slice(0, 20).map((jur) => {
                    const isChecked = guruJurusanList.includes(jur);
                    return (
                      <label
                        key={jur}
                        onClick={() => handleToggleGuruJurusan(jur)}
                        className={`flex items-center gap-1.5 p-1 rounded-lg cursor-pointer select-none ${
                          isChecked ? 'bg-teal-50 text-[#069494] font-bold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-3 h-3 text-[#069494] rounded"
                        />
                        <span className="truncate">{jur}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Kelas yang Dipegang Guru */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Rombel Kelas yang Dipegang Guru:
                </label>
                <div className="max-h-28 overflow-y-auto p-2 bg-white border border-slate-200 rounded-xl space-y-1 text-xs">
                  {kelasList.map((k) => {
                    const isChecked = guruKelasList.includes(k.id);
                    return (
                      <label
                        key={k.id}
                        onClick={() => handleToggleGuruKelas(k.id)}
                        className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer select-none ${
                          isChecked ? 'bg-teal-50 text-[#069494] font-bold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{k.judul} ({k.jurusan || 'Umum'})</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 text-[#069494] rounded"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* OPTIONAL: Foto Profil & Deskripsi */}
          <div className="space-y-3 pt-1">
            <span className="text-[11px] font-bold text-slate-500 block">
              Atribut Profil Tambahan (Opsional):
            </span>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                URL Foto Profil (Opsional):
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={foto}
                onChange={(e) => setFoto(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Deskripsi / Biodata Pengguna (Opsional):
              </label>
              <textarea
                rows={2}
                placeholder="Catatan keahlian, status siswa/guru, atau informasi kontak..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#069494] hover:bg-[#057c7c] text-white shadow-md shadow-[#069494]/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Simpan &amp; Daftarkan Akun</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
