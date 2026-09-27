import { User, Kelas, Pengumuman, Asesmen, JawabanSiswa, NilaiRekap, Materi, TugasProjek } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin-1',
    nama: 'Administrator Utama (CNC)',
    email: 'admin@cnc.sch.id',
    role: 'ADMIN',
    password: 'password123',
    nik: '197501012000031001',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    deskripsi: 'Kepala Administrator Sistem & Database Akademik CNC School',
  },
  {
    id: 'u-guru-1',
    nama: 'Budi Santoso, S.Kom',
    email: 'budi.santoso@guru.cnc.sch.id',
    role: 'GURU',
    nik: '198501012010011001',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    deskripsi: 'Guru Kejuruan PPLG & Walas 12 PPLG 2. Fokus pada Web & Mobile Development.',
    mapelUtama: 'Pemrograman Web & Perangkat Bergerak',
    jurusanList: ['12 PPLG 2', '11 PPLG 1'],
    kelasList: ['kelas-1'],
  },
  {
    id: 'u-guru-2',
    nama: 'Siti Rahmawati, S.Pd',
    email: 'siti.rahma@guru.cnc.sch.id',
    role: 'GURU',
    nik: '199004052015022002',
    foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    deskripsi: 'Guru Jaringan Komputer TJKT & Walas 10 TJKT 1. Spesialis Mikrotik & Cloud.',
    mapelUtama: 'Administrasi Infrastruktur Jaringan',
    jurusanList: ['10 TJKT 1'],
    kelasList: ['kelas-2'],
  },
  {
    id: 'u-guru-3',
    nama: 'Dewi Lestari, M.Ds',
    email: 'dewi.lestari@guru.cnc.sch.id',
    role: 'GURU',
    nik: '198709122012032003',
    foto: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
    deskripsi: 'Guru Desain Komunikasi Visual & Kreatif Digital 11 DKV 1.',
    mapelUtama: 'Desain Grafis Percetakan & UI/UX',
    jurusanList: ['11 DKV 1', '12 PPLG 2'],
    kelasList: ['kelas-3', 'kelas-1'],
  },
  {
    id: 'u-siswa-1',
    nama: 'Ahmad Fauzan',
    email: 'ahmad.fauzan@siswa.cnc.sch.id',
    role: 'SISWA',
    nisn: '0061234561',
    nik: '3201012345670001',
    foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    deskripsi: 'Siswa 12 PPLG 2. Tertarik di bidang Fullstack JavaScript & Cloud Architecture.',
    jurusanAsal: '12 PPLG 2',
    kelasId: 'kelas-1',
  },
  {
    id: 'u-siswa-2',
    nama: 'Putri Maharani',
    email: 'putri.maharani@siswa.cnc.sch.id',
    role: 'SISWA',
    nisn: '0061234562',
    nik: '3201012345670002',
    foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    deskripsi: 'Siswa 12 PPLG 2. Passionate di UI/UX Design & Frontend React.',
    jurusanAsal: '12 PPLG 2',
    kelasId: 'kelas-1',
  },
  {
    id: 'u-siswa-3',
    nama: 'Rizky Pratama',
    email: 'rizky.pratama@siswa.cnc.sch.id',
    role: 'SISWA',
    nisn: '0061234563',
    nik: '3201012345670003',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    deskripsi: 'Siswa 12 PPLG 2. Suka Backend Node.js & Game Programming.',
    jurusanAsal: '12 PPLG 2',
    kelasId: 'kelas-1',
  },
  {
    id: 'u-siswa-4',
    nama: 'Nabila Zahra',
    email: 'nabila.zahra@siswa.cnc.sch.id',
    role: 'SISWA',
    nisn: '0061234564',
    nik: '3201012345670004',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    deskripsi: 'Siswa 10 TJKT 1. Aktif dalam kegiatan Cyber Security & Robotika.',
    jurusanAsal: '10 TJKT 1',
    kelasId: 'kelas-2',
  },
  {
    id: 'u-siswa-5',
    nama: 'Dimas Aditya',
    email: 'dimas.aditya@siswa.cnc.sch.id',
    role: 'SISWA',
    nisn: '0061234565',
    nik: '3201012345670005',
    foto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    deskripsi: 'Siswa 11 DKV 1. Portofolio 3D Blender & Motion Graphics.',
    jurusanAsal: '11 DKV 1',
    kelasId: 'kelas-3',
  },
  {
    id: 'u-kepsek-1',
    nama: 'Drs. H. Mulyadi, M.Pd',
    email: 'kepsek@cnc.sch.id',
    role: 'KEPSEK',
    nik: '196803151994121001',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    deskripsi: 'Kepala Sekolah SMK Pusat Keunggulan CNC Digital Academy.',
  },
  {
    id: 'u-kurikulum-1',
    nama: 'Sri Wahyuni, M.Kom',
    email: 'kurikulum@cnc.sch.id',
    role: 'KURIKULUM',
    nik: '198205102008012005',
    foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    deskripsi: 'Wakil Kepala Sekolah Bidang Kurikulum & Penjaminan Mutu Asesmen.',
  },
];

export const INITIAL_KELAS: Kelas[] = [
  {
    id: 'kelas-1',
    judul: '12 PPLG 2',
    jurusan: '12 PPLG 2',
    walasId: 'u-guru-1',
    deskripsi: 'Kelas Unggulan Pengembangan Perangkat Lunak dan Gim Angkatan 2024/2025.',
    kodeGabung: 'PPLG2-2025',
    siswaIds: ['u-siswa-1', 'u-siswa-2', 'u-siswa-3'],
    guruIds: ['u-guru-1', 'u-guru-3'],
    createdAt: '2026-07-15T08:00:00.000Z',
    updatedAt: '2026-09-01T10:30:00.000Z',
  },
  {
    id: 'kelas-2',
    judul: '10 TJKT 1',
    jurusan: '10 TJKT 1',
    walasId: 'u-guru-2',
    deskripsi: 'Kelas Teknik Jaringan Komputer dan Telekomunikasi Ruang Lab Cisco.',
    kodeGabung: 'TJKT1-NEW',
    siswaIds: ['u-siswa-4'],
    guruIds: ['u-guru-2'],
    createdAt: '2026-07-16T09:00:00.000Z',
    updatedAt: '2026-09-02T11:00:00.000Z',
  },
  {
    id: 'kelas-3',
    judul: '11 DKV 1',
    jurusan: '11 DKV 1',
    walasId: 'u-guru-3',
    deskripsi: 'Desain Komunikasi Visual Studio Multimedia & Brand Identity.',
    kodeGabung: 'DKV1-CREATIVE',
    siswaIds: ['u-siswa-5'],
    guruIds: ['u-guru-3'],
    createdAt: '2026-07-17T09:00:00.000Z',
    updatedAt: '2026-09-03T14:00:00.000Z',
  },
];

export const INITIAL_MATERI: Materi[] = [
  {
    id: 'mat-1',
    guruId: 'u-guru-1',
    kelasId: 'kelas-1',
    jurusan: '12 PPLG 2',
    mapel: 'Pemrograman Web & Perangkat Bergerak',
    judul: 'Modul 01: Arsitektur RESTful API & Express.js Modern',
    deskripsi: 'Panduan lengkap pembuatan endpoint REST API, middleware otentikasi JWT, dan koneksi ke PostgreSQL.',
    tipe: 'PDF',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Modul_01_REST_API_ExpressJS.pdf',
    createdAt: '2026-09-10T08:00:00.000Z',
  },
  {
    id: 'mat-2',
    guruId: 'u-guru-1',
    kelasId: 'kelas-1',
    jurusan: '12 PPLG 2',
    mapel: 'Pemrograman Web & Perangkat Bergerak',
    judul: 'Dokumentasi Resmi React 19 & Next.js App Router',
    deskripsi: 'Tautan referensi fundamental Server Components, Server Actions, dan Client Hydration.',
    tipe: 'LINK',
    linkUrl: 'https://react.dev/reference/react',
    createdAt: '2026-09-12T09:30:00.000Z',
  },
  {
    id: 'mat-3',
    guruId: 'u-guru-2',
    kelasId: 'kelas-2',
    jurusan: '10 TJKT 1',
    mapel: 'Administrasi Infrastruktur Jaringan',
    judul: 'Modul Pengantar Subnetting IPv4 & Konfigurasi VLAN MikroTik',
    deskripsi: 'Cara menghitung Netmask, Host IP, Broadcast, serta implementasi Trunk & Access Port.',
    tipe: 'PDF',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Modul_Subnetting_VLAN_TJKT.pdf',
    createdAt: '2026-09-14T10:00:00.000Z',
  }
];

export const INITIAL_TUGAS: TugasProjek[] = [
  {
    id: 'tugas-1',
    guruId: 'u-guru-1',
    kelasId: 'kelas-1',
    jurusan: '12 PPLG 2',
    mapel: 'Pemrograman Web & Perangkat Bergerak',
    judul: 'Tugas Projek 01: Rancang Bangun API Manajemen Toko Online',
    deskripsi: 'Buatlah RESTful API menggunakan Express.js/Next.js dengan endpoint CRUD Produk, User, dan Transaksi. Lampirkan laporan teknis berformat PDF serta tautan repository GitHub.',
    tipeLampiran: 'KEDUANYA',
    filePdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'Petunjuk_Projek_Toko_Online.pdf',
    linkUrl: 'https://github.com/topics/lms-template',
    tenggatWaktu: '2026-10-05T23:59:00.000Z',
    submissions: [
      {
        id: 'sub-1',
        tugasId: 'tugas-1',
        siswaId: 'u-siswa-1',
        filePdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'Laporan_Projek_Ahmad_Fauzan.pdf',
        catatanSiswa: 'Sudah selesai pak, endpoint sudah diuji coba lewat Postman dan terhubung ke database.',
        submittedAt: '2026-09-22T14:30:00.000Z',
        nilai: 92,
        catatanGuru: 'Struktur kode rapi, arsitektur RESTful diterapkan dengan sangat baik!',
        status: 'GRADED'
      }
    ],
    createdAt: '2026-09-15T08:00:00.000Z'
  },
  {
    id: 'tugas-2',
    guruId: 'u-guru-3',
    kelasId: 'kelas-1',
    jurusan: '12 PPLG 2',
    mapel: 'Desain Grafis Percetakan & UI/UX',
    judul: 'Projek Desain: High-Fidelity Prototype Aplikasi Mobile Sekolah CNC',
    deskripsi: 'Buat prototype Figma interaktif dengan minimal 8 screen mencakup login, beranda, daftar kelas, dan form pengumpulan tugas.',
    tipeLampiran: 'LINK',
    linkUrl: 'https://www.figma.com',
    tenggatWaktu: '2026-10-10T23:59:00.000Z',
    submissions: [],
    createdAt: '2026-09-16T11:00:00.000Z'
  }
];

export const INITIAL_PENGUMUMAN: Pengumuman[] = [
  {
    id: 'peng-1',
    kelasId: 'kelas-1',
    authorId: 'u-guru-1',
    judul: 'Jadwal Ujian Online Pemrograman Web & Pengumpulan Portofolio',
    konten: 'Selamat pagi siswa 12 PPLG 2. Ujian Online sesi 1 akan dibuka besok pukul 08:00 WIB. Harap persiapkan laptop, koneksi internet stabil, dan pastikan sudah mempelajari materi Express API & React State.',
    createdAt: '2026-09-20T07:30:00.000Z',
    komentar: [
      {
        id: 'kom-1',
        pengumumanId: 'peng-1',
        authorId: 'u-siswa-1',
        konten: 'Siap pak! Apakah ada format khusus untuk submission tugas portfolio?',
        createdAt: '2026-09-20T08:15:00.000Z',
      },
      {
        id: 'kom-2',
        pengumumanId: 'peng-1',
        authorId: 'u-guru-1',
        konten: 'Cukup cantumkan link repository GitHub dan URL live demo ya Ahmad.',
        createdAt: '2026-09-20T08:20:00.000Z',
      }
    ]
  },
  {
    id: 'peng-2',
    kelasId: 'kelas-1',
    authorId: 'u-siswa-2',
    judul: 'Diskusi Kelompok Capstone Project Frontend',
    konten: 'Halo teman-teman 12 PPLG 2, untuk kelompok desain UI sistem perpustakaan nanti siang kumpul di Lab PPLG 2 ya!',
    createdAt: '2026-09-21T10:00:00.000Z',
    komentar: []
  }
];

export const INITIAL_ASESMEN: Asesmen[] = [
  {
    id: 'asesmen-1',
    guruId: 'u-guru-1',
    kelasId: 'kelas-1',
    tipe: 'UJIAN_ONLINE',
    judul: 'Ujian Akhir Semester: Fullstack Web Development',
    mapel: 'Pemrograman Web & Perangkat Bergerak',
    deskripsi: 'Evaluasi pemahaman arsitektur RESTful API, Database Prisma/SQL, dan React Hooks.',
    status: 'SELESAI', // Published to class
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
    soalList: [
      {
        id: 's-1',
        asesmenId: 'asesmen-1',
        tipe: 'PILIHAN_GANDA',
        pertanyaan: 'Manakah HTTP Method yang paling tepat digunakan untuk memperbarui sebagian (partial update) data sebuah entitas pada arsitektur REST API?',
        poin: 25,
        opsi: [
          { id: 'opt-1', label: 'POST', isBenar: false },
          { id: 'opt-2', label: 'PUT', isBenar: false },
          { id: 'opt-3', label: 'PATCH', isBenar: true },
          { id: 'opt-4', label: 'OPTIONS', isBenar: false },
        ],
        kunciJawaban: ['opt-3']
      },
      {
        id: 's-2',
        asesmenId: 'asesmen-1',
        tipe: 'KOTAK_CENTANG',
        pertanyaan: 'Pilihlah semua pernyataan yang BENAR mengenai perbedaan antara Relational Database (SQL) dan Non-Relational (NoSQL) di bawah ini:',
        gambarUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
        poin: 35,
        opsi: [
          { id: 'opt-5', label: 'SQL memiliki skema tabel yang ketat (strictly structured schema) dengan dukungan ACID transactions penuh.', isBenar: true },
          { id: 'opt-6', label: 'NoSQL tidak mendukung query apapun.', isBenar: false },
          { id: 'opt-7', label: 'SQL biasanya diskalakan secara vertikal sedangkan NoSQL mudah diskalakan secara horizontal.', isBenar: true },
          { id: 'opt-8', label: 'PostgreSQL dan MySQL adalah contoh database relational (RDBMS).', isBenar: true },
        ],
        kunciJawaban: ['opt-5', 'opt-7', 'opt-8']
      },
      {
        id: 's-3',
        asesmenId: 'asesmen-1',
        tipe: 'ESSAY',
        pertanyaan: 'Jelaskan bagaimana konsep Role-Based Access Control (RBAC) diterapkan antara peran Admin, Guru, dan Siswa dalam sistem sekolah, serta berikan contoh perlindungan endpoint di backend!',
        poin: 40,
        kunciJawaban: ['RBAC membatasi hak akses berdasarkan role token JWT atau session. Admin dapat mengelola user & kelas, Guru mengelola asesmen & nilai, Siswa hanya mengerjakan ujian.']
      }
    ]
  },
  {
    id: 'asesmen-2',
    guruId: 'u-guru-1',
    kelasId: 'kelas-1',
    tipe: 'QUIZ',
    judul: 'Quiz Kilat: Konsep Algoritma & State Management',
    mapel: 'Pemrograman Berorientasi Objek',
    deskripsi: 'Quiz interaktif berdurasi 30 menit untuk mereview materi sprint mingguan.',
    durasiMenit: 30,
    status: 'SELESAI',
    createdAt: '2026-09-19T09:00:00.000Z',
    updatedAt: '2026-09-19T09:30:00.000Z',
    soalList: [
      {
        id: 'sq-1',
        asesmenId: 'asesmen-2',
        tipe: 'PILIHAN_GANDA',
        pertanyaan: 'Apa kompleksitas waktu rata-rata (average time complexity) dari algoritma QuickSort?',
        poin: 50,
        opsi: [
          { id: 'qo-1', label: 'O(n)', isBenar: false },
          { id: 'qo-2', label: 'O(n log n)', isBenar: true },
          { id: 'qo-3', label: 'O(n^2)', isBenar: false },
          { id: 'qo-4', label: 'O(1)', isBenar: false },
        ],
        kunciJawaban: ['qo-2']
      },
      {
        id: 'sq-2',
        asesmenId: 'asesmen-2',
        tipe: 'ESSAY',
        pertanyaan: 'Tuliskan keuntungan menggunakan unidirectional data flow pada React application state!',
        poin: 50,
        kunciJawaban: ['Mempermudah debugging, data flow dapat diprediksi (predictable), dan mengurangi resiko side-effect yang tidak disengaja.']
      }
    ]
  },
  {
    id: 'asesmen-3',
    guruId: 'u-guru-1',
    tipe: 'UJIAN_ONLINE',
    judul: 'Draft: Ujian Modul Arsitektur Cloud & Docker (Draft)',
    mapel: 'Komputasi Awan',
    deskripsi: 'Asesmen ini masih dalam tahap penyusunan bank soal.',
    status: 'PROSES', // Draft / Masih di proses
    createdAt: '2026-09-22T14:00:00.000Z',
    updatedAt: '2026-09-22T14:30:00.000Z',
    soalList: [
      {
        id: 's-draft-1',
        asesmenId: 'asesmen-3',
        tipe: 'PILIHAN_GANDA',
        pertanyaan: 'Perintah Docker apa yang digunakan untuk membuat image dari Dockerfile?',
        poin: 50,
        opsi: [
          { id: 'do-1', label: 'docker run', isBenar: false },
          { id: 'do-2', label: 'docker build -t nama-image .', isBenar: true },
          { id: 'do-3', label: 'docker compose up', isBenar: false },
        ],
        kunciJawaban: ['do-2']
      }
    ]
  }
];

export const INITIAL_JAWABAN: JawabanSiswa[] = [
  {
    id: 'jwb-1',
    asesmenId: 'asesmen-1',
    siswaId: 'u-siswa-1',
    waktuSubmit: '2026-09-18T11:20:00.000Z',
    totalNilai: 95,
    status: 'GRADED',
    jawabanList: [
      { soalId: 's-1', jawabanOpsiIds: ['opt-3'], nilaiDidapat: 25 },
      { soalId: 's-2', jawabanOpsiIds: ['opt-5', 'opt-7', 'opt-8'], nilaiDidapat: 35 },
      { soalId: 's-3', jawabanEssay: 'RBAC memisahkan akses dengan middleware JWT. Admin punya privilege user & class crud, guru membuat soal & nilai, siswa menjawab soal. Endpoint dilindungi dengan pengecekan req.user.role.', nilaiDidapat: 35 }
    ]
  },
  {
    id: 'jwb-2',
    asesmenId: 'asesmen-1',
    siswaId: 'u-siswa-2',
    waktuSubmit: '2026-09-18T11:45:00.000Z',
    totalNilai: 88,
    status: 'GRADED',
    jawabanList: [
      { soalId: 's-1', jawabanOpsiIds: ['opt-3'], nilaiDidapat: 25 },
      { soalId: 's-2', jawabanOpsiIds: ['opt-5', 'opt-8'], nilaiDidapat: 25 },
      { soalId: 's-3', jawabanEssay: 'RBAC membagi hak akses ke tiap role. Admin mengatur sistem sekolah, guru memberi asesmen, siswa hanya mengisi formulir ujian. Di backend pakai auth guard.', nilaiDidapat: 38 }
    ]
  }
];

export const INITIAL_NILAI_REKAP: NilaiRekap[] = [
  {
    id: 'nr-1',
    asesmenId: 'asesmen-1',
    siswaId: 'u-siswa-1',
    namaSiswa: 'Ahmad Fauzan',
    kelasJurusan: '12 PPLG 2',
    mapel: 'Pemrograman Web & Perangkat Bergerak',
    email: 'ahmad.fauzan@siswa.cnc.sch.id',
    nilai: 95,
    tanggalGenerate: '2026-09-18T14:00:00.000Z'
  },
  {
    id: 'nr-2',
    asesmenId: 'asesmen-1',
    siswaId: 'u-siswa-2',
    namaSiswa: 'Putri Maharani',
    kelasJurusan: '12 PPLG 2',
    mapel: 'Pemrograman Web & Perangkat Bergerak',
    email: 'putri.maharani@siswa.cnc.sch.id',
    nilai: 88,
    tanggalGenerate: '2026-09-18T14:00:00.000Z'
  }
];
