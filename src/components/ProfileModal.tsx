import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import {
  X,
  User as UserIcon,
  Mail,
  CreditCard,
  BookOpen,
  Edit3,
  Check,
  Camera,
  Lock,
  Building,
  ShieldCheck,
} from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const {
    currentUser,
    viewingProfileUser,
    setViewingProfileUser,
    updateCurrentUserProfile,
    updateUser,
    kelasList,
  } = useApp();

  const isOwnProfile = currentUser && viewingProfileUser && currentUser.id === viewingProfileUser.id;
  const canEditProfile =
    isOwnProfile || currentUser?.role === 'ADMIN' || currentUser?.role === 'KURIKULUM';

  const [isEditing, setIsEditing] = useState(false);
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [foto, setFoto] = useState('');
  const [mapelUtama, setMapelUtama] = useState('');

  useEffect(() => {
    if (viewingProfileUser) {
      setNama(viewingProfileUser.nama || '');
      setDeskripsi(viewingProfileUser.deskripsi || '');
      setFoto(viewingProfileUser.foto || '');
      setMapelUtama(viewingProfileUser.mapelUtama || '');
      setIsEditing(false);
    }
  }, [viewingProfileUser]);

  if (!viewingProfileUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingProfileUser) return;

    // Allowed updates: nama, foto, deskripsi, mapelUtama (for Guru)
    // Email is strictly locked as specified by user requirements
    const payload: Partial<User> = {
      nama: nama.trim(),
      deskripsi: deskripsi.trim(),
      foto: foto.trim(),
      ...(viewingProfileUser.role === 'GURU' ? { mapelUtama: mapelUtama.trim() } : {}),
    };

    if (isOwnProfile) {
      updateCurrentUserProfile(payload);
    } else {
      updateUser(viewingProfileUser.id, payload);
    }

    setViewingProfileUser({ ...viewingProfileUser, ...payload });
    setIsEditing(false);
  };

  // Find user's classes
  const userClasses = kelasList.filter((k) =>
    viewingProfileUser.role === 'SISWA'
      ? k.siswaIds.includes(viewingProfileUser.id)
      : k.walasId === viewingProfileUser.id || k.guruIds.includes(viewingProfileUser.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Cover Banner using main #069494 */}
        <div className="h-28 bg-gradient-to-r from-[#069494] via-[#058282] to-[#046e6e] relative">
          <div className="absolute top-3 left-4 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/90 text-[#069494] shadow-xs">
              CNC Identity Session
            </span>
          </div>
          <button
            onClick={() => setViewingProfileUser(null)}
            className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Content */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar and Action button */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative group">
              <img
                src={foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={nama}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-xl bg-slate-100"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white">
                  <Camera className="w-5 h-5" />
                </div>
              )}
            </div>

            {canEditProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isEditing
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-[#FF69B4] hover:bg-[#fa55a4] text-white shadow-sm'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Batal Edit' : 'Edit Profil'}</span>
              </button>
            )}
          </div>

          {!isEditing ? (
            /* VIEW MODE */
            <div className="space-y-4">
              {/* 1. Nama & Role */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-slate-900">{viewingProfileUser.nama}</h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    viewingProfileUser.role === 'SISWA'
                      ? 'bg-pink-50 text-[#FF69B4] border border-pink-200'
                      : 'bg-teal-50 text-[#069494] border border-teal-200'
                  }`}>
                    {viewingProfileUser.role}
                  </span>
                </div>
              </div>

              {/* 2. LOCKED EMAIL: DIBAWAH SETELAH FOTO PROFIL DAN NAMA, SEBELUM DESKRIPSI */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-teal-50 text-[#069494]">
                    <Mail className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 block font-medium">Email Akun (Terkunci Sistem)</span>
                    <span className="font-mono text-slate-900 font-bold truncate block">
                      {viewingProfileUser.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700 shrink-0">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Locked</span>
                </div>
              </div>

              {/* 3. Deskripsi Profil */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-1">Biodata / Deskripsi:</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {viewingProfileUser.deskripsi || 'Belum ada biodata profil yang ditulis.'}
                </p>
              </div>

              {/* Other Info Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <CreditCard className="w-3.5 h-3.5 text-[#069494]" />
                    {viewingProfileUser.role === 'SISWA' ? 'NIS / NISN' : 'NIK'}
                  </span>
                  <p className="text-slate-900 font-mono font-bold">
                    {viewingProfileUser.nisn || viewingProfileUser.nik || '-'}
                  </p>
                </div>

                {viewingProfileUser.role === 'GURU' && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-[#069494]" />
                      Mata Pelajaran
                    </span>
                    <p className="text-slate-900 font-bold truncate">
                      {viewingProfileUser.mapelUtama || 'Pengampu Kejuruan'}
                    </p>
                  </div>
                )}

                {viewingProfileUser.role === 'SISWA' && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1 shadow-2xs">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Building className="w-3.5 h-3.5 text-[#FF69B4]" />
                      Jurusan Asal
                    </span>
                    <p className="text-slate-900 font-bold">{viewingProfileUser.jurusanAsal || 'Umum'}</p>
                  </div>
                )}
              </div>

              {/* Class association badge */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Kelas Terkait di CNC:</h4>
                {userClasses.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {userClasses.map((k) => (
                      <span
                        key={k.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-[#069494] border border-teal-200 flex items-center gap-1"
                      >
                        <span>{k.judul}</span>
                        {k.walasId === viewingProfileUser.id && (
                          <span className="text-[10px] text-[#FF69B4] font-bold">(Wali Kelas)</span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Belum terdaftar di kelas manapun.</p>
                )}
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap (Bisa Diubah)
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                />
              </div>

              {viewingProfileUser.role === 'GURU' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mata Pelajaran Utama yang Diampu
                  </label>
                  <input
                    type="text"
                    value={mapelUtama}
                    onChange={(e) => setMapelUtama(e.target.value)}
                    placeholder="Contoh: Pemrograman Web & Perangkat Bergerak"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                  />
                </div>
              )}

              {/* LOCKED EMAIL */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#069494]" />
                    <span>Email Pengguna</span>
                  </label>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Lock className="w-3 h-3" />
                    <span>Terkunci</span>
                  </span>
                </div>
                <input
                  type="email"
                  disabled
                  value={viewingProfileUser.email}
                  className="w-full px-3 py-2 bg-slate-200/70 border border-slate-300 rounded-xl text-xs font-mono text-slate-600 cursor-not-allowed select-none"
                  title="Email tidak dapat diubah sesuai aturan sistem CNC."
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Email telah diverifikasi oleh Administrator CNC dan bersifat permanen.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Foto Profil (Bisa Diubah)
                </label>
                <input
                  type="url"
                  value={foto}
                  onChange={(e) => setFoto(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Biodata / Deskripsi Profil (Bisa Diubah)
                </label>
                <textarea
                  rows={3}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Tuliskan bio, minat keahlian, atau catatan Anda..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#069494] hover:bg-[#057c7c] text-white flex items-center gap-1.5 shadow-md shadow-[#069494]/20 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
