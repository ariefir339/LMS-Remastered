import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LIST_JURUSAN, User } from '../../types';
import {
  ArrowLeft,
  School,
  UserCheck,
  Users,
  GraduationCap,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  Share2,
  MessageSquare,
  Send,
  UserPlus,
  Search,
  BookOpen,
} from 'lucide-react';

interface KelasDetailViewProps {
  kelasId: string;
  onBack: () => void;
  canManageClass?: boolean; // True for admin, false for guru/siswa
}

export const KelasDetailView: React.FC<KelasDetailViewProps> = ({
  kelasId,
  onBack,
  canManageClass = true,
}) => {
  const {
    kelasList,
    users,
    currentUser,
    addSiswaToKelas,
    removeSiswaFromKelas,
    setViewingProfileUser,
    pengumumanList,
    addPengumuman,
    updatePengumuman,
    deletePengumuman,
    addKomentar,
    deleteKomentar,
  } = useApp();

  const kelas = kelasList.find((k) => k.id === kelasId);

  const [activeSubTab, setActiveSubTab] = useState<'STREAM' | 'SISWA' | 'GURU'>('STREAM');
  const [copiedLink, setCopiedLink] = useState(false);

  // Manual Add Student Modal State
  const [isAddSiswaModalOpen, setIsAddSiswaModalOpen] = useState(false);
  const [filterJurusan, setFilterJurusan] = useState(kelas?.jurusan || LIST_JURUSAN[0]);
  const [searchSiswaQuery, setSearchSiswaQuery] = useState('');

  // Announcement State
  const [judulPengumuman, setJudulPengumuman] = useState('');
  const [kontenPengumuman, setKontenPengumuman] = useState('');
  const [editingPengumumanId, setEditingPengumumanId] = useState<string | null>(null);
  const [editJudul, setEditJudul] = useState('');
  const [editKonten, setEditKonten] = useState('');
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  if (!kelas) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">Kelas tidak ditemukan.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-xl bg-[#069494] text-white text-xs font-bold shadow-xs"
        >
          Kembali ke Daftar Kelas
        </button>
      </div>
    );
  }

  const walas = users.find((u) => u.id === kelas.walasId);
  const siswaMembers = users.filter((u) => u.role === 'SISWA' && kelas.siswaIds.includes(u.id));
  const guruMembers = users.filter((u) => u.role === 'GURU' && kelas.guruIds.includes(u.id));

  // Available students for manual addition
  const availableStudents = users.filter(
    (u) =>
      u.role === 'SISWA' &&
      !kelas.siswaIds.includes(u.id) &&
      (filterJurusan ? u.jurusanAsal === filterJurusan : true) &&
      (searchSiswaQuery
        ? u.nama.toLowerCase().includes(searchSiswaQuery.toLowerCase()) ||
          (u.nisn && u.nisn.includes(searchSiswaQuery))
        : true)
  );

  const announcements = pengumumanList.filter((p) => p.kelasId === kelas.id);

  const copyJoinLink = () => {
    const link = `${window.location.origin}/join/${kelas.kodeGabung}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreatePengumuman = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kontenPengumuman.trim()) return;
    addPengumuman(kelas.id, judulPengumuman.trim(), kontenPengumuman.trim());
    setJudulPengumuman('');
    setKontenPengumuman('');
  };

  const handleSaveEditPengumuman = (id: string) => {
    if (!editKonten.trim()) return;
    updatePengumuman(id, editJudul.trim(), editKonten.trim());
    setEditingPengumumanId(null);
  };

  const handleAddComment = (pengumumanId: string) => {
    const text = commentInputs[pengumumanId]?.trim();
    if (!text) return;
    addKomentar(pengumumanId, text);
    setCommentInputs((prev) => ({ ...prev, [pengumumanId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#069494] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Kelas</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={copyJoinLink}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-[#069494] border border-teal-200 transition-all shadow-xs"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Tersalin!' : 'Salin Link Gabung Siswa'}</span>
          </button>
        </div>
      </div>

      {/* Class Banner Card with Figma Gradient #069494 to #00F0FF */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#069494] via-[#058a8a] to-[#00b9c7] text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                {kelas.jurusan || 'Kejuruan'}
              </span>
              <span className="text-xs font-mono font-bold text-teal-100">
                Kode Kelas: {kelas.kodeGabung}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {kelas.judul}
            </h1>
            <p className="text-xs sm:text-sm text-teal-50 mt-1 max-w-2xl font-medium">
              {kelas.deskripsi || 'Ruang kelas kolaboratif untuk pengumuman, daftar siswa, dan aktivitas materi.'}
            </p>
          </div>

          {/* Walas Card */}
          <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center gap-3 min-w-[240px]">
            {walas ? (
              <>
                <img
                  src={walas.foto}
                  alt={walas.nama}
                  className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/40"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#00F0FF] tracking-wider block">
                    Wali Kelas (Walas)
                  </span>
                  <p
                    onClick={() => setViewingProfileUser(walas)}
                    className="text-xs font-bold text-white hover:underline cursor-pointer"
                  >
                    {walas.nama}
                  </p>
                  <p className="text-[10px] text-teal-100 font-mono">NIK: {walas.nik || '-'}</p>
                </div>
              </>
            ) : (
              <div className="text-xs text-teal-100">
                <span className="text-[10px] uppercase font-bold text-teal-200">Wali Kelas</span>
                <p className="text-white italic">Belum ditentukan</p>
              </div>
            )}
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-white/20 text-xs font-bold">
          {[
            { id: 'STREAM', label: 'Pengumuman & Diskusi', count: announcements.length },
            { id: 'SISWA', label: 'Deretan Siswa', count: siswaMembers.length },
            { id: 'GURU', label: 'Deretan Guru Pengajar', count: guruMembers.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                activeSubTab === tab.id
                  ? 'bg-white text-[#069494] shadow-md font-bold'
                  : 'bg-black/10 text-white hover:bg-white/15 font-semibold'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SUBTAB 1: PENGUMUMAN & DISKUSI */}
      {activeSubTab === 'STREAM' && (
        <div className="space-y-6">
          {/* Create Announcement Form */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#069494]" />
              <span>Buat Pengumuman untuk Kelas {kelas.judul}</span>
            </h3>
            <form onSubmit={handleCreatePengumuman} className="space-y-3">
              <input
                type="text"
                value={judulPengumuman}
                onChange={(e) => setJudulPengumuman(e.target.value)}
                placeholder="Judul Pengumuman (Opsional)..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white transition-all"
              />
              <textarea
                rows={3}
                required
                value={kontenPengumuman}
                onChange={(e) => setKontenPengumuman(e.target.value)}
                placeholder="Bagikan informasi tugas, materi, atau instruksi kelas hari ini..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white transition-all"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold shadow-md shadow-[#069494]/20 flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Posting Pengumuman</span>
                </button>
              </div>
            </form>
          </div>

          {/* Announcements Feed */}
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                Belum ada pengumuman di kelas ini. Jadilah yang pertama memposting informasi!
              </div>
            ) : (
              announcements.map((p) => {
                const author = users.find((u) => u.id === p.authorId);
                const isAuthor = currentUser?.id === p.authorId;
                const canEditDelete = isAuthor || currentUser?.role === 'ADMIN';

                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3"
                  >
                    {/* Post Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={author?.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={author?.nama || 'Author'}
                          onClick={() => author && setViewingProfileUser(author)}
                          className="w-9 h-9 rounded-xl object-cover cursor-pointer hover:ring-2 hover:ring-[#069494] transition-all"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => author && setViewingProfileUser(author)}
                              className="text-xs font-bold text-slate-900 hover:text-[#069494] cursor-pointer transition-colors"
                            >
                              {author?.nama || 'Pengguna'}
                            </span>
                            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              {author?.role}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(p.createdAt).toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      </div>

                      {canEditDelete && (
                        <div className="flex items-center gap-1">
                          {isAuthor && (
                            <button
                              onClick={() => {
                                setEditingPengumumanId(p.id);
                                setEditJudul(p.judul || '');
                                setEditKonten(p.konten);
                              }}
                              className="p-1.5 text-slate-400 hover:text-[#069494] hover:bg-teal-50 rounded-lg transition-colors"
                              title="Edit Pengumuman"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('Hapus pengumuman ini?')) {
                                deletePengumuman(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Pengumuman"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    {editingPengumumanId === p.id ? (
                      <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                        <input
                          type="text"
                          value={editJudul}
                          onChange={(e) => setEditJudul(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                        />
                        <textarea
                          rows={3}
                          value={editKonten}
                          onChange={(e) => setEditKonten(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingPengumumanId(null)}
                            className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleSaveEditPengumuman(p.id)}
                            className="px-3 py-1 rounded-lg bg-[#069494] text-white text-xs font-bold shadow-xs"
                          >
                            Simpan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {p.judul && <h4 className="text-sm font-bold text-slate-900">{p.judul}</h4>}
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                          {p.konten}
                        </p>
                      </div>
                    )}

                    {/* Comments Section */}
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      <span className="text-[11px] font-bold text-slate-600">
                        Komentar ({p.komentar.length})
                      </span>

                      {/* Comment list */}
                      {p.komentar.map((kom) => {
                        const komAuthor = users.find((u) => u.id === kom.authorId);
                        const isKomAuthor = currentUser?.id === kom.authorId;

                        return (
                          <div
                            key={kom.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-2"
                          >
                            <div className="flex items-start gap-2.5">
                              <img
                                src={komAuthor?.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                                alt={komAuthor?.nama}
                                onClick={() => komAuthor && setViewingProfileUser(komAuthor)}
                                className="w-6 h-6 rounded-lg object-cover cursor-pointer hover:ring-1 hover:ring-[#069494] mt-0.5"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    onClick={() => komAuthor && setViewingProfileUser(komAuthor)}
                                    className="text-xs font-bold text-slate-800 hover:text-[#069494] cursor-pointer"
                                  >
                                    {komAuthor?.nama}
                                  </span>
                                  <span className="text-[9px] text-slate-400">
                                    {new Date(kom.createdAt).toLocaleTimeString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5">{kom.konten}</p>
                              </div>
                            </div>

                            {isKomAuthor && (
                              <button
                                onClick={() => deleteKomentar(p.id, kom.id)}
                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {/* Comment Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={commentInputs[p.id] || ''}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [p.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddComment(p.id);
                            }
                          }}
                          placeholder="Tulis balasan atau komentar..."
                          className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white transition-all"
                        />
                        <button
                          onClick={() => handleAddComment(p.id)}
                          className="p-2 rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white transition-colors shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: DERETAN SISWA */}
      {activeSubTab === 'SISWA' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Deretan Siswa Kelas ({siswaMembers.length})</h3>
              <p className="text-xs text-slate-500">
                Siswa yang terdaftar aktif dalam kelas {kelas.judul}
              </p>
            </div>

            {canManageClass && (
              <button
                onClick={() => setIsAddSiswaModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF69B4] hover:bg-[#fa52a3] text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all self-start"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Siswa Manual</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {siswaMembers.length === 0 ? (
              <div className="col-span-full p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                Belum ada siswa di kelas ini. Klik "Tambah Siswa Manual" atau bagikan Link Gabung.
              </div>
            ) : (
              siswaMembers.map((siswa) => (
                <div
                  key={siswa.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#FF69B4] hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
                >
                  <div
                    onClick={() => setViewingProfileUser(siswa)}
                    className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                  >
                    <img
                      src={siswa.foto}
                      alt={siswa.nama}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 group-hover:ring-[#FF69B4] transition-all shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#FF69B4] transition-colors truncate">
                        {siswa.nama}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">NISN: {siswa.nisn || '-'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{siswa.email}</p>
                    </div>
                  </div>

                  {canManageClass && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setViewingProfileUser(siswa)}
                        className="p-1.5 text-slate-400 hover:text-[#069494] hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit Akun Siswa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Keluarkan siswa ${siswa.nama} dari kelas ini?`)) {
                            removeSiswaFromKelas(kelas.id, siswa.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Keluarkan dari Kelas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: DERETAN GURU */}
      {activeSubTab === 'GURU' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Deretan Guru Pengajar ({guruMembers.length})</h3>
            <p className="text-xs text-slate-500">Guru yang bertugas mengampu mata pelajaran di kelas ini</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {guruMembers.length === 0 ? (
              <div className="col-span-full p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
                Belum ada guru pengajar selain wali kelas.
              </div>
            ) : (
              guruMembers.map((guru) => (
                <div
                  key={guru.id}
                  onClick={() => setViewingProfileUser(guru)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#069494] hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src={guru.foto}
                    alt={guru.nama}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 group-hover:ring-[#069494] transition-all"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-[#069494] transition-colors truncate">
                      {guru.nama}
                    </p>
                    <p className="text-[10px] text-[#069494] font-bold truncate">
                      {guru.mapelUtama || 'Pengajar'}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">NIK: {guru.nik || '-'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MANUAL ADD STUDENT MODAL */}
      {isAddSiswaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-[#069494]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Tambah Siswa Secara Manual</h3>
              </div>
              <button
                onClick={() => setIsAddSiswaModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            {/* Filter Jurusan Selector */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Pilih Jurusan / Kelas Asal Siswa:
                </label>
                <select
                  value={filterJurusan}
                  onChange={(e) => setFilterJurusan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#069494] font-semibold"
                >
                  <option value="">-- Tampilkan Semua Jurusan --</option>
                  {LIST_JURUSAN.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchSiswaQuery}
                  onChange={(e) => setSearchSiswaQuery(e.target.value)}
                  placeholder="Cari nama siswa atau NISN..."
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494]"
                />
              </div>
            </div>

            {/* Scrollable Student List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">
                  2. Deretan Nama Siswa ({availableStudents.length} tersedia):
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Scroll untuk memilih</span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5 p-1 border border-slate-200 rounded-2xl bg-slate-50/70 divide-y divide-slate-100">
                {availableStudents.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Tidak ada siswa yang cocok atau semua siswa di jurusan ini sudah masuk ke kelas {kelas.judul}.
                  </div>
                ) : (
                  availableStudents.map((siswa) => (
                    <div
                      key={siswa.id}
                      className="p-2.5 flex items-center justify-between gap-3 hover:bg-white rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={siswa.foto}
                          alt={siswa.nama}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{siswa.nama}</p>
                          <p className="text-[10px] font-mono text-slate-500">
                            NISN: {siswa.nisn || '-'} • Asal: {siswa.jurusanAsal || 'Umum'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addSiswaToKelas(kelas.id, siswa.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#069494] hover:bg-[#057c7c] text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsAddSiswaModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Selesai Menambah Siswa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
