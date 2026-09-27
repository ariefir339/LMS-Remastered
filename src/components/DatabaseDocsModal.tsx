import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Database,
  Code2,
  GitBranch,
  Layers,
  ShieldCheck,
  FileSpreadsheet,
  Copy,
  Check,
  BookOpen,
  Server,
  FolderTree,
  Globe,
  Terminal,
} from 'lucide-react';

export const DatabaseDocsModal: React.FC = () => {
  const { isDbDocsOpen, setIsDbDocsOpen } = useApp();
  const [activeTab, setActiveTab] = useState<'RINGKASAN' | 'LARAGON' | 'VERCEL' | 'PRISMA' | 'ERD' | 'RBAC' | 'FOLDER' | 'API'>('RINGKASAN');
  const [copied, setCopied] = useState(false);

  if (!isDbDocsOpen) return null;

  const prismaSchemaCode = `// ==========================================
// CNC EDUCATION NEXUS - PRISMA SCHEMA DEFINITION
// Datasource: MySQL (Laragon Local) / PostgreSQL / Supabase
// ==========================================

datasource db {
  provider = "mysql" // Gunakan "mysql" untuk Laragon, atau "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  GURU
  SISWA
  KEPSEK
  KURIKULUM
}

enum TipeAsesmen {
  UJIAN_ONLINE
  QUIZ
}

enum StatusAsesmen {
  PROSES   // Draft oleh guru
  SELESAI  // Published dan bisa dikerjakan siswa
}

enum TipeSoal {
  PILIHAN_GANDA  // Single choice
  KOTAK_CENTANG  // Multiple answers (Google Forms style)
  ESSAY          // Uraian
}

enum StatusTugas {
  DRAFT
  DITUGASKAN
  SELESAI
}

// ------------------------------------------
// 1. PENGGUNA (USERS & ACCOUNTS)
// ------------------------------------------
model User {
  id           String    @id @default(uuid())
  nama         String
  email        String    @unique
  role         Role      @default(SISWA)
  password     String?   // Terenkripsi bcrypt
  nik          String?   @unique // Guru, Kepsek, Kurikulum
  nisn         String?   @unique // Siswa (NISN)
  foto         String?   @db.Text
  deskripsi    String?   @db.Text
  jurusanAsal  String?   // Misal "12 PPLG 2" untuk filter akun siswa
  mapelUtama   String?   // Guru (misal "Pemrograman Web")
  jurusanList  Json?     // Array jurusan yang dipegang guru
  kelasList    Json?     // Array ID kelas yang dipegang guru
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  // Relasi Kelas
  kelasWalas   Kelas[]   @relation("WaliKelas")
  kelasSiswa   KelasMember[] 
  kelasGuru    KelasGuru[]

  // Relasi Konten & LMS
  pengumuman   Pengumuman[]
  komentar     Komentar[]
  asesmenDibuat Asesmen[]  @relation("GuruPembuat")
  jawabanSiswa  JawabanSiswa[]
  nilaiRekap    NilaiRekap[]
  materiDibuat  Materi[]  @relation("GuruMateri")
  tugasDibuat   TugasProjek[] @relation("GuruTugas")
  pengumpulan   PengumpulanTugas[]

  @@index([role, jurusanAsal])
}

// ------------------------------------------
// 2. KELAS (ROOMS / CLASSES)
// ------------------------------------------
model Kelas {
  id          String        @id @default(uuid())
  judul       String        // Misal: "12 PPLG 2"
  jurusan     String?       // 60+ Jurusan (PPLG, DKV, TJKT, dsb)
  deskripsi   String?       @db.Text
  kodeGabung  String        @unique @default(cuid()) // Token link join siswa
  walasId     String?       // ID Guru Walas (opsional)
  walas       User?         @relation("WaliKelas", fields: [walasId], references: [id], onDelete: SetNull)
  
  anggotaSiswa KelasMember[]
  guruPengajar KelasGuru[]

  pengumuman  Pengumuman[]
  asesmenList Asesmen[]
  materiList  Materi[]
  tugasList   TugasProjek[]

  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model KelasMember {
  id        String   @id @default(uuid())
  kelasId   String
  siswaId   String
  kelas     Kelas    @relation(fields: [kelasId], references: [id], onDelete: Cascade)
  siswa     User     @relation(fields: [siswaId], references: [id], onDelete: Cascade)
  joinedAt  DateTime @default(now())

  @@unique([kelasId, siswaId])
}

model KelasGuru {
  id        String   @id @default(uuid())
  kelasId   String
  guruId    String
  kelas     Kelas    @relation(fields: [kelasId], references: [id], onDelete: Cascade)
  guru      User     @relation(fields: [guruId], references: [id], onDelete: Cascade)

  @@unique([kelasId, guruId])
}

// ------------------------------------------
// 3. MATERI MODUL (PDF & LINK)
// ------------------------------------------
model Materi {
  id          String   @id @default(uuid())
  guruId      String
  kelasId     String?
  judul       String
  mapel       String
  deskripsi   String?  @db.Text
  tipe        String   // "PDF" | "LINK"
  fileUrl     String?  @db.Text
  linkUrl     String?  @db.Text
  guru        User     @relation("GuruMateri", fields: [guruId], references: [id], onDelete: Cascade)
  kelas       Kelas?   @relation(fields: [kelasId], references: [id], onDelete: SetNull)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ------------------------------------------
// 4. TUGAS & PROJEK (SUBMISI PDF & LINK)
// ------------------------------------------
model TugasProjek {
  id          String   @id @default(uuid())
  guruId      String
  kelasId     String?
  judul       String
  mapel       String
  deskripsi   String?  @db.Text
  tipe        String   // "TUGAS" | "PROJEK"
  status      StatusTugas @default(DITUGASKAN)
  deadline    DateTime?
  lampiranUrl String?  @db.Text
  lampiranTipe String? // "PDF" | "LINK"
  guru        User     @relation("GuruTugas", fields: [guruId], references: [id], onDelete: Cascade)
  kelas       Kelas?   @relation(fields: [kelasId], references: [id], onDelete: SetNull)
  pengumpulan PengumpulanTugas[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model PengumpulanTugas {
  id          String      @id @default(uuid())
  tugasId     String
  siswaId     String
  pdfUrl      String?     @db.Text
  catatan     String?     @db.Text
  nilai       Float?
  feedback    String?     @db.Text
  dinilai     Boolean     @default(false)
  submittedAt DateTime    @default(now())
  tugas       TugasProjek @relation(fields: [tugasId], references: [id], onDelete: Cascade)
  siswa       User        @relation(fields: [siswaId], references: [id], onDelete: Cascade)

  @@unique([tugasId, siswaId])
}

// ------------------------------------------
// 5. ASESMEN, SOAL, DAN JAWABAN
// ------------------------------------------
model Asesmen {
  id          String        @id @default(uuid())
  guruId      String
  guru        User          @relation("GuruPembuat", fields: [guruId], references: [id], onDelete: Cascade)
  kelasId     String?
  kelas       Kelas?        @relation(fields: [kelasId], references: [id], onDelete: SetNull)
  tipe        TipeAsesmen   @default(UJIAN_ONLINE)
  judul       String
  mapel       String
  deskripsi   String?       @db.Text
  durasiMenit Int?          // Khusus Quiz
  status      StatusAsesmen @default(PROSES)
  soalList    Soal[]
  jawaban     JawabanSiswa[]
  nilaiRekap  NilaiRekap[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model Soal {
  id          String         @id @default(uuid())
  asesmenId   String
  asesmen     Asesmen        @relation(fields: [asesmenId], references: [id], onDelete: Cascade)
  tipe        TipeSoal
  pertanyaan  String         @db.Text
  gambarUrl   String?        @db.Text
  poin        Int            @default(10)
  opsi        OpsiPilihan[]
  kunciJawaban Json          // Array string
  createdAt   DateTime       @default(now())
}

model OpsiPilihan {
  id       String  @id @default(uuid())
  soalId   String
  soal     Soal    @relation(fields: [soalId], references: [id], onDelete: Cascade)
  label    String  @db.Text
  isBenar  Boolean @default(false)
}

model JawabanSiswa {
  id          String        @id @default(uuid())
  asesmenId   String
  siswaId     String
  asesmen     Asesmen       @relation(fields: [asesmenId], references: [id], onDelete: Cascade)
  siswa       User          @relation(fields: [siswaId], references: [id], onDelete: Cascade)
  waktuSubmit DateTime      @default(now())
  jawabanJson Json          
  totalNilai  Float         @default(0)
  status      String        @default("SUBMITTED")

  @@unique([asesmenId, siswaId])
}

// ------------------------------------------
// 6. REKAP NILAI EXCEL
// ------------------------------------------
model NilaiRekap {
  id              String   @id @default(uuid())
  asesmenId       String
  siswaId         String
  namaSiswa       String
  kelasJurusan    String
  mapel           String
  email           String
  nilai           Float
  tanggalGenerate DateTime @default(now())

  asesmen         Asesmen  @relation(fields: [asesmenId], references: [id], onDelete: Cascade)
  siswa           User     @relation(fields: [siswaId], references: [id], onDelete: Cascade)
}

// ------------------------------------------
// 7. PENGUMUMAN & KOMENTAR KELAS
// ------------------------------------------
model Pengumuman {
  id        String     @id @default(uuid())
  kelasId   String
  authorId  String
  judul     String?
  konten    String     @db.Text
  fileUrl   String?    @db.Text
  kelas     Kelas      @relation(fields: [kelasId], references: [id], onDelete: Cascade)
  author    User       @relation(fields: [authorId], references: [id], onDelete: Cascade)
  komentar  Komentar[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Komentar {
  id           String     @id @default(uuid())
  pengumumanId String
  authorId     String
  konten       String     @db.Text
  pengumuman   Pengumuman @relation(fields: [pengumumanId], references: [id], onDelete: Cascade)
  author       User       @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt    DateTime   @default(now())
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prismaSchemaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-teal-50/60 border-b border-teal-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#069494] text-white shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Panduan Database (Laragon/MySQL) &amp; Hosting Vercel (Next.js)
              </h2>
              <p className="text-xs text-slate-500">
                LMS CNC Education Nexus • Skema Prisma, Konfigurasi Laragon, Vercel, &amp; Arsitektur RBAC
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDbDocsOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 overflow-x-auto text-xs font-bold">
          {[
            { id: 'RINGKASAN', label: 'Ringkasan Alur & DB', icon: Layers },
            { id: 'LARAGON', label: 'Setup Laragon (MySQL)', icon: Terminal },
            { id: 'VERCEL', label: 'Hosting Vercel (Next.js)', icon: Globe },
            { id: 'PRISMA', label: 'Skema Prisma MySQL', icon: Code2 },
            { id: 'ERD', label: 'Diagram Relasi (ERD)', icon: GitBranch },
            { id: 'RBAC', label: 'Matriks Hak Akses (RBAC)', icon: ShieldCheck },
            { id: 'FOLDER', label: 'Struktur Folder Next.js', icon: FolderTree },
            { id: 'API', label: 'Rute API Backend', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#069494] text-[#069494] font-extrabold bg-teal-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* TAB 1: RINGKASAN */}
          {activeTab === 'RINGKASAN' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200">
                <h3 className="text-base font-extrabold text-[#069494] mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Konsep Inti Database LMS CNC Education Nexus
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Sistem dirancang dengan arsitektur 7 pilar: <strong>User (Multi-Role)</strong>, <strong>Kelas Rombel (60+ Jurusan)</strong>, <strong>Modul Materi (PDF/Link)</strong>, <strong>Tugas &amp; Projek (Upload PDF &amp; Penilaian Guru)</strong>, <strong>Asesmen &amp; Soal (Ujian &amp; Quiz)</strong>, <strong>Pengumuman &amp; Diskusi Kelas</strong>, serta <strong>Rekap Nilai Excel Otomatis</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-extrabold text-[#069494] text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#069494]"></span>
                    Peran ADMIN di Database
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li><strong>Kelola Kelas:</strong> Buat Kelas (Judul opsional/default nama jurusan, Walas opsional, deskripsi opsional), Edit &amp; Hapus kelas.</li>
                    <li><strong>Di dalam Kelas:</strong> Mengatur Wali Kelas, melihat deretan siswa &amp; guru, hapus siswa dari kelas, tambah siswa secara manual (pilih jurusan lalu scroll nama siswa) atau share join link.</li>
                    <li><strong>Data Akun:</strong> Guru tertampil langsung dengan CRUD penuh. Siswa dikelompokkan berdasarkan kelas/jurusan, dengan edit (email terkunci di profil siswa) &amp; hapus siswa.</li>
                    <li><strong>Batasan Asesmen:</strong> Admin <strong>tidak bisa</strong> mengedit atau menghapus asesmen milik guru. Admin hanya memantau dan generate rekap Excel.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-extrabold text-[#FF69B4] text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF69B4]"></span>
                    Peran GURU di Database
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li><strong>Tab Kelas:</strong> Menampilkan "Kelas Walas" dan "Kelas Mengajar".</li>
                    <li><strong>Materi:</strong> Upload modul bacaan via PDF &amp; Link materi online.</li>
                    <li><strong>Tugas &amp; Projek:</strong> Buat tugas/projek (lampiran PDF/link), cek berkas PDF kiriman siswa, beri nilai &amp; umpan balik.</li>
                    <li><strong>Asesmen:</strong> Buat kuis &amp; ujian online (PG, Kotak Centang, Essay).</li>
                    <li><strong>Rekap Nilai:</strong> Generate rekap nilai per mapel + per kelas + per jurusan dan download Excel.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SETUP LARAGON (MYSQL) */}
          {activeTab === 'LARAGON' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200">
                <h3 className="text-base font-extrabold text-[#069494] mb-1">
                  Langkah-Langkah Menjalankan Database di Laragon (MySQL Local)
                </h3>
                <p className="text-xs text-slate-600">
                  Ikuti panduan berikut saat Anda memindahkan proyek ini ke laptop/komputer Anda dengan Laragon.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-[#069494] block mb-1">Langkah 1: Start Service Laragon</span>
                  <p className="text-xs text-slate-600">
                    Buka aplikasi <strong>Laragon</strong> di komputer Anda, lalu klik tombol <strong>Start All</strong> (memastikan MySQL &amp; Apache/Nginx aktif di port 3306).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-[#069494] block mb-1">Langkah 2: Buat Database di phpMyAdmin / HeidiSQL</span>
                  <p className="text-xs text-slate-600 mb-2">
                    Buka <code>http://localhost/phpmyadmin</code> atau klik tombol <strong>Database</strong> di Laragon (HeidiSQL). Buat database baru dengan nama:
                  </p>
                  <code className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800">
                    cnc_lms_db
                  </code>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-[#069494] block mb-1">Langkah 3: Konfigurasi .env Proyek Next.js</span>
                  <p className="text-xs text-slate-600 mb-2">
                    Buka file <code>.env</code> di root proyek Next.js Anda dan sesuaikan koneksi database MySQL Laragon:
                  </p>
                  <pre className="p-3 bg-slate-900 text-teal-300 rounded-xl text-xs font-mono">
{`DATABASE_URL="mysql://root:@localhost:3306/cnc_lms_db"
NEXTAUTH_SECRET="cnc_education_nexus_secret_key"
NEXTAUTH_URL="http://localhost:3000"`}
                  </pre>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-[#069494] block mb-1">Langkah 4: Jalankan Prisma Migrate</span>
                  <p className="text-xs text-slate-600 mb-2">
                    Buka terminal di folder proyek Anda dan jalankan perintah:
                  </p>
                  <pre className="p-3 bg-slate-900 text-teal-300 rounded-xl text-xs font-mono">
{`# 1. Generate Prisma Client
npx prisma generate

# 2. Push / Migrasi skema ke MySQL Laragon
npx prisma db push

# 3. (Opsional) Buka GUI database di browser
npx prisma studio`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOSTING VERCEL */}
          {activeTab === 'VERCEL' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200">
                <h3 className="text-base font-extrabold text-[#FF69B4] mb-1">
                  Panduan Deploy ke Vercel (Next.js Production)
                </h3>
                <p className="text-xs text-slate-600">
                  Karena Vercel berjalan di cloud (serverless), database lokal Laragon tidak bisa diakses dari internet secara langsung. Gunakan database cloud gratis (seperti PlanetScale MySQL, Supabase, Neon PostgreSQL, atau Aiven).
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-[#069494] block mb-1">Langkah 1: Push Kode ke GitHub</span>
                  <pre className="p-3 bg-slate-900 text-teal-300 rounded-xl text-xs font-mono">
{`git init
git add .
git commit -m "feat: complete CNC LMS Next.js with Figma theme"
git branch -M main
git remote add origin https://github.com/username/cnc-lms.git
git push -u origin main`}
                  </pre>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-[#069494] block mb-1">Langkah 2: Siapkan Database Cloud untuk Vercel</span>
                  <p className="text-xs text-slate-600">
                    Buat akun gratis di <strong>Aiven MySQL</strong> atau <strong>Supabase / Neon</strong> untuk mendapatkan <code>DATABASE_URL</code> publik cloud.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-[#069494] block mb-1">Langkah 3: Deploy di Vercel Dashboard</span>
                  <ol className="text-xs text-slate-600 list-decimal pl-4 space-y-1 mt-1">
                    <li>Buka <code>vercel.com</code> dan login dengan GitHub Anda.</li>
                    <li>Pilih <strong>Add New Project</strong> lalu import repositori <code>cnc-lms</code>.</li>
                    <li>Di bagian <strong>Environment Variables</strong>, tambahkan variabel:
                      <ul className="list-disc pl-4 mt-1 font-mono text-slate-800">
                        <li><code>DATABASE_URL</code> = koneksi cloud database Anda</li>
                        <li><code>NEXTAUTH_SECRET</code> = string acak aman</li>
                        <li><code>NEXTAUTH_URL</code> = URL domain Vercel Anda</li>
                      </ul>
                    </li>
                    <li>Klik <strong>Deploy</strong>. Selesai dalam waktu &lt; 2 menit!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRISMA CODE */}
          {activeTab === 'PRISMA' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">prisma/schema.prisma (MySQL Compatible)</h4>
                  <p className="text-xs text-slate-500">Skema relational lengkap mencakup User, Kelas, Materi, Tugas/Projek, Asesmen, dan Nilai Rekap.</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#069494] hover:bg-[#057c7c] text-white transition-all shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Kode Prisma'}</span>
                </button>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs overflow-x-auto max-h-[480px]">
                <pre className="text-teal-300 leading-relaxed">{prismaSchemaCode}</pre>
              </div>
            </div>
          )}

          {/* TAB 5: ERD */}
          {activeTab === 'ERD' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm">Entity Relationship Diagram (ERD Relational Overview)</h4>
              <p className="text-xs text-slate-500">
                Peta relasi database MySQL untuk modul Materi, Tugas, Asesmen, dan Rekap Nilai:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-mono text-xs font-bold text-[#069494] block mb-1">User</span>
                  <div className="text-[11px] font-mono text-slate-600 space-y-0.5">
                    <div className="text-emerald-600 font-bold">PK: id (UUID)</div>
                    <div>email, nama, foto</div>
                    <div>role: ADMIN | GURU | SISWA...</div>
                    <div>nik (Guru), nisn (Siswa)</div>
                    <div>jurusanAsal, mapelUtama</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-mono text-xs font-bold text-[#069494] block mb-1">Kelas</span>
                  <div className="text-[11px] font-mono text-slate-600 space-y-0.5">
                    <div className="text-emerald-600 font-bold">PK: id (UUID)</div>
                    <div>judul (e.g. 12 PPLG 2)</div>
                    <div>jurusan, deskripsi</div>
                    <div>kodeGabung (token join)</div>
                    <div className="text-amber-600 font-bold">FK: walasId -&gt; User.id</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-mono text-xs font-bold text-[#FF69B4] block mb-1">Materi &amp; TugasProjek</span>
                  <div className="text-[11px] font-mono text-slate-600 space-y-0.5">
                    <div className="text-emerald-600 font-bold">PK: id</div>
                    <div className="text-amber-600 font-bold">FK: guruId, kelasId</div>
                    <div>tipe: PDF | LINK</div>
                    <div>lampiranUrl, deadline</div>
                    <div>pengumpulan: Submisi PDF Siswa</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-mono text-xs font-bold text-[#069494] block mb-1">Asesmen &amp; Soal</span>
                  <div className="text-[11px] font-mono text-slate-600 space-y-0.5">
                    <div className="text-emerald-600 font-bold">PK: id</div>
                    <div className="text-amber-600 font-bold">FK: guruId, kelasId</div>
                    <div>tipe: UJIAN_ONLINE | QUIZ</div>
                    <div>status: PROSES | SELESAI</div>
                    <div>soal: PG, Centang, Essay</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-mono text-xs font-bold text-[#FF69B4] block mb-1">NilaiRekap</span>
                  <div className="text-[11px] font-mono text-slate-600 space-y-0.5">
                    <div className="text-emerald-600 font-bold">PK: id</div>
                    <div className="text-amber-600 font-bold">FK: asesmenId, siswaId</div>
                    <div>namaSiswa, kelasJurusan, mapel</div>
                    <div>nilai (0 - 100)</div>
                    <div className="text-teal-600 font-bold">Export: CSV / Excel UTF-8</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: RBAC */}
          {activeTab === 'RBAC' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm">Matriks Otorisasi &amp; Hak Akses (Role-Based Access Control)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-2xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Fitur / Tindakan</th>
                      <th className="p-3 text-[#069494]">ADMIN</th>
                      <th className="p-3 text-[#FF69B4]">GURU</th>
                      <th className="p-3 text-slate-700">SISWA</th>
                      <th className="p-3 text-purple-700">KEPSEK / KURIKULUM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-semibold">Buat, Edit, Hapus Kelas</td>
                      <td className="p-3 text-emerald-600 font-bold">YA (Penuh)</td>
                      <td className="p-3 text-rose-500 font-medium">TIDAK</td>
                      <td className="p-3 text-rose-500 font-medium">TIDAK</td>
                      <td className="p-3 text-slate-400">Lihat saja</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Kelola Akun Guru &amp; Siswa</td>
                      <td className="p-3 text-emerald-600 font-bold">YA (CRUD)</td>
                      <td className="p-3 text-rose-500 font-medium">TIDAK</td>
                      <td className="p-3 text-rose-500 font-medium">TIDAK</td>
                      <td className="p-3 text-slate-400">Lihat saja</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Upload Materi &amp; Buat Tugas</td>
                      <td className="p-3 text-rose-500 font-medium">TIDAK</td>
                      <td className="p-3 text-emerald-600 font-bold">YA (CRUD)</td>
                      <td className="p-3 text-rose-500 font-medium">TIDAK (Akses Baca)</td>
                      <td className="p-3 text-slate-400">Lihat saja</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Kirim Tugas / Projek (PDF)</td>
                      <td className="p-3 text-rose-500 font-medium">TIDAK</td>
                      <td className="p-3 text-slate-400">Menilai Submisi</td>
                      <td className="p-3 text-emerald-600 font-bold">YA (Upload PDF)</td>
                      <td className="p-3 text-slate-400">Lihat saja</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Buat Asesmen / Soal Ujian</td>
                      <td className="p-3 text-rose-500 font-medium">TIDAK BISA</td>
                      <td className="p-3 text-emerald-600 font-bold">YA (Milik Sendiri)</td>
                      <td className="p-3 text-rose-500 font-medium">TIDAK</td>
                      <td className="p-3 text-rose-500 font-medium">TIDAK</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Export Rekap Nilai Excel</td>
                      <td className="p-3 text-emerald-600 font-bold">YA</td>
                      <td className="p-3 text-emerald-600 font-bold">YA</td>
                      <td className="p-3 text-rose-500 font-medium">TIDAK</td>
                      <td className="p-3 text-emerald-600 font-bold">YA (Download)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: FOLDER */}
          {activeTab === 'FOLDER' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm">Struktur Folder Next.js 14+ (App Router)</h4>
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-teal-300 overflow-x-auto">
{`CNC/
├── prisma/
│   ├── schema.prisma          # Skema database MySQL
│   └── seed.ts                # Seeding 60+ Jurusan & Akun Dummy
│
├── app/                       # Next.js App Router
│   ├── page.tsx               # Personal Branding / Landing
│   ├── login/page.tsx         # Multi-role Login (Admin, Guru, Siswa)
│   ├── admin/page.tsx         # Dashboard Admin (Kelas & Akun)
│   ├── guru/page.tsx          # Dashboard Guru (Kelas, Materi, Tugas, Asesmen)
│   ├── siswa/page.tsx         # Dashboard Siswa (Kelas, Materi, Tugas, Asesmen)
│   ├── kepsek/page.tsx        # Audit & Export Nilai
│   └── api/                   # Route Handlers Next.js
│       ├── materi/route.ts
│       ├── tugas/route.ts
│       ├── asesmen/route.ts
│       └── nilai/route.ts
│
├── components/
│   ├── materi/                # MateriModuleView.tsx
│   ├── tugas/                 # TugasProjekView.tsx
│   ├── nilai/                 # RekapNilaiView.tsx
│   └── admin/                 # AdminDashboard.tsx
└── lib/
    ├── prisma.ts              # Prisma Client Instance
    └── excel.ts               # Generator Excel`}
              </div>
            </div>
          )}

          {/* TAB 8: API */}
          {activeTab === 'API' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm">Contoh Implementasi Backend API Route (Next.js)</h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-[#069494]">Proteksi Hak Akses Asesmen Guru</span>
                <pre className="p-3 bg-slate-900 text-teal-300 rounded-xl text-xs font-mono">
{`export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getAuthSession(req);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const asesmen = await prisma.asesmen.findUnique({ where: { id: params.id } });
  if (!asesmen) return Response.json({ error: "Not Found" }, { status: 404 });

  // STRICT: Admin tidak bisa menghapus asesmen buatan guru
  if (session.user.role === 'ADMIN' && asesmen.guruId !== session.user.id) {
    return Response.json(
      { error: "Admin tidak berwenang menghapus asesmen guru!" },
      { status: 403 }
    );
  }

  await prisma.asesmen.delete({ where: { id: params.id } });
  return Response.json({ success: true });
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Arsitektur siap diproduksi dan di-deploy ke Laragon MySQL &amp; Vercel Next.js
          </span>
          <button
            onClick={() => setIsDbDocsOpen(false)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
          >
            Tutup Dokumentasi
          </button>
        </div>
      </div>
    </div>
  );
};
