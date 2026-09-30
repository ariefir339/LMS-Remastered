export type UserRole = 'ADMIN' | 'GURU' | 'SISWA' | 'KEPSEK' | 'KURIKULUM';

export interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  password?: string;
  nik?: string;          // Untuk Guru / Admin / Kepsek / Kurikulum
  nisn?: string;         // Untuk Siswa
  foto: string;
  deskripsi?: string;
  jurusanAsal?: string;  // Jurusan default siswa (misal: '12 PPLG 2')
  kelasId?: string;      // Kelas spesifik tempat siswa didaftarkan
  jurusanList?: string[]; // Guru bisa memegang beberapa jurusan
  kelasList?: string[];   // Guru bisa memegang beberapa kelas
  mapelUtama?: string;   // Mapel yang diampu guru
  createdAt?: string;
}

export interface Kelas {
  id: string;
  judul: string;         // e.g. "12 PPLG 2" atau "Kelas Pemrograman Web"
  jurusan?: string;      // Dari list 60+ jurusan/tingkat
  walasId?: string;      // ID Guru yang jadi walas (opsional)
  deskripsi?: string;    // Opsional
  kodeGabung: string;    // Token join via link
  siswaIds: string[];    // Array User ID siswa
  guruIds: string[];     // Array User ID guru pengajar
  createdAt: string;
  updatedAt: string;
}

export interface Komentar {
  id: string;
  pengumumanId: string;
  authorId: string;
  konten: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Pengumuman {
  id: string;
  kelasId: string;
  authorId: string;
  judul?: string;
  konten: string;
  fileUrl?: string;
  komentar: Komentar[];
  createdAt: string;
  updatedAt?: string;
}

export interface Materi {
  id: string;
  guruId: string;
  kelasId: string;
  jurusan?: string;
  mapel: string;
  judul: string;
  deskripsi?: string;
  tipe: 'PDF' | 'LINK';
  fileUrl?: string;     // PDF URL or document URL
  fileName?: string;
  linkUrl?: string;     // Reference link
  createdAt: string;
  updatedAt?: string;
}

export interface TugasSubmission {
  id: string;
  tugasId: string;
  siswaId: string;
  filePdfUrl?: string;
  fileName?: string;
  catatanSiswa?: string;
  submittedAt: string;
  nilai?: number;
  catatanGuru?: string;
  status: 'SUBMITTED' | 'GRADED';
}

export interface TugasProjek {
  id: string;
  guruId: string;
  kelasId: string;
  jurusan?: string;
  mapel: string;
  judul: string;
  deskripsi: string;
  tipeLampiran: 'PDF' | 'LINK' | 'KEDUANYA';
  filePdfUrl?: string;
  fileName?: string;
  linkUrl?: string;
  tenggatWaktu: string;
  submissions: TugasSubmission[];
  createdAt: string;
  updatedAt?: string;
}

export type TipeAsesmen = 'UJIAN_ONLINE' | 'QUIZ';
export type StatusAsesmen = 'PROSES' | 'SELESAI'; // PROSES = Draft, SELESAI = Published to class
export type TipeSoal = 'PILIHAN_GANDA' | 'KOTAK_CENTANG' | 'ESSAY';

export interface OpsiPilihan {
  id: string;
  label: string;
  isBenar?: boolean;
}

export interface Soal {
  id: string;
  asesmenId: string;
  tipe: TipeSoal;
  pertanyaan: string;
  gambarUrl?: string;
  opsi?: OpsiPilihan[];       // Untuk PILIHAN_GANDA & KOTAK_CENTANG
  kunciJawaban?: string[];   // Array ID opsi yang benar atau teks acuan essay
  poin: number;
}

export interface JawabanItem {
  soalId: string;
  jawabanOpsiIds?: string[]; // Untuk PG dan Kotak Centang
  jawabanEssay?: string;     // Untuk Essay
  nilaiDidapat?: number;
}

export interface JawabanSiswa {
  id: string;
  asesmenId: string;
  siswaId: string;
  waktuSubmit: string;
  jawabanList: JawabanItem[];
  totalNilai: number;
  status: 'SUBMITTED' | 'GRADED';
}

export interface NilaiRekap {
  id: string;
  asesmenId: string;
  siswaId: string;
  namaSiswa: string;
  kelasJurusan: string;
  mapel: string;
  email: string;
  nilai: number;
  tanggalGenerate: string;
}

export interface Asesmen {
  id: string;
  guruId: string;            // Pembuat asesmen
  kelasId?: string;          // Target kelas jika sudah di-assign
  tipe: TipeAsesmen;         // UJIAN_ONLINE atau QUIZ
  judul: string;
  mapel: string;
  deskripsi?: string;
  durasiMenit?: number;      // Wajib untuk QUIZ, opsional untuk Ujian
  tanggalPelaksanaan?: string; // Tanggal & jam jadwal pelaksanaan ujian
  status: StatusAsesmen;     // PROSES (draft) vs SELESAI (published)
  soalList: Soal[];
  createdAt: string;
  updatedAt: string;
}

export type KategoriMapel = 'KEJURUAN' | 'UMUM' | 'PILIHAN' | 'MUATAN_LOKAL';

export interface MataPelajaran {
  id: string;
  kode: string;
  nama: string;
  kategori: KategoriMapel;
  kurikulum: string;
  kkm: number;
  jamPelajaran: number;
  jurusanTarget: string[];
  guruPengampuIds: string[];
  capaianPembelajaran?: string;
  createdAt: string;
  updatedAt: string;
}

export const LIST_JURUSAN: string[] = [
  'SMP',
  'SMA',
  '10 DKV PLUS', '10 DKV 1', '10 DKV 2',
  '10 TJKT PLUS', '10 TJKT 1', '10 TJKT 2', '10 TJKT 3', '10 TJKT 4', '10 TJKT 5',
  '10 PPLG 1', '10 PPLG 2',
  '10 PEMASARAN 1', '10 PEMASARAN 2',
  '10 MPLB PLUS', '10 MPLB 1', '10 MPLB 2', '10 MPLB 3', '10 MPLB 4', '10 MPLB 5',
  '11 DKV PLUS', '11 DKV 1', '11 DKV 2',
  '11 TJKT PLUS', '11 TJKT 1', '11 TJKT 2', '11 TJKT 3', '11 TJKT 4', '11 TJKT 5', '11 TJKT 6', '11 TJKT 7',
  '11 PPLG 1', '11 PPLG 2',
  '11 PEMASARAN 1', '11 PEMASARAN 2', '11 PEMASARAN 3',
  '11 MPLB PLUS', '11 MPLB 1', '11 MPLB 2', '11 MPLB 3', '11 MPLB 4', '11 MPLB 5',
  '12 DKV PLUS', '12 DKV 1', '12 DKV 2',
  '12 TJKT PLUS', '12 TJKT 1', '12 TJKT 2', '12 TJKT 3', '12 TJKT 4', '12 TJKT 5', '12 TJKT 6', '12 TJKT 7',
  '12 PPLG 1', '12 PPLG 2',
  '12 PEMASARAN 1', '12 PEMASARAN 2', '12 PEMASARAN 3',
  '12 MPLB PLUS', '12 MPLB 1', '12 MPLB 2', '12 MPLB 3', '12 MPLB 4', '12 MPLB 5'
];
