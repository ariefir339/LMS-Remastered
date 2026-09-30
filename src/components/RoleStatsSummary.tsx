import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useApp } from '../context/AppContext';
import { Asesmen } from '../types';
import { AcademicCalendar } from './AcademicCalendar';
import { FileDown, CheckCircle2, BarChart3 } from 'lucide-react';

interface RoleStatsSummaryProps {
  onSelectKelas?: (kelasId: string) => void;
  onSelectAsesmen?: (asesmen: Asesmen) => void;
  onNavigateTab?: (tabId: string) => void;
}

export const RoleStatsSummary: React.FC<RoleStatsSummaryProps> = ({
  onSelectKelas,
  onSelectAsesmen,
  onNavigateTab,
}) => {
  const {
    currentUser,
    kelasList,
    users,
    asesmenList,
    jawabanList,
    materiList,
    tugasList,
    mapelList,
  } = useApp();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!currentUser) return null;

  const role = currentUser.role;
  const totalStudentsAll = users.filter((u) => u.role === 'SISWA').length;
  const totalTeachersAll = users.filter((u) => u.role === 'GURU').length;

  // Compute role-specific subsets
  const guruClasses = kelasList.filter(
    (k) => k.walasId === currentUser.id || k.guruIds.includes(currentUser.id)
  );
  const guruWalasCount = kelasList.filter((k) => k.walasId === currentUser.id).length;
  const guruStudentIds = new Set<string>();
  guruClasses.forEach((k) => k.siswaIds.forEach((id) => guruStudentIds.add(id)));

  const siswaClasses = kelasList.filter((k) => k.siswaIds.includes(currentUser.id));
  const siswaClassIds = siswaClasses.map((k) => k.id);
  const siswaClassmateIds = new Set<string>();
  siswaClasses.forEach((k) => k.siswaIds.forEach((id) => siswaClassmateIds.add(id)));

  // Active published assessments (Jadwal Ujian Hari Ini)
  const publishedAsesmen = asesmenList.filter((a) => a.status === 'SELESAI');
  const todayExams =
    role === 'GURU'
      ? publishedAsesmen.filter(
          (a) =>
            a.guruId === currentUser.id ||
            (a.kelasId && guruClasses.some((k) => k.id === a.kelasId))
        )
      : role === 'SISWA'
      ? publishedAsesmen.filter((a) => !a.kelasId || siswaClassIds.includes(a.kelasId))
      : publishedAsesmen;

  // Role-filtered tasks
  const relevantTugas =
    role === 'GURU'
      ? tugasList.filter(
          (t) =>
            t.guruId === currentUser.id ||
            (t.kelasId && guruClasses.some((k) => k.id === t.kelasId))
        )
      : role === 'SISWA'
      ? tugasList.filter((t) => !t.kelasId || siswaClassIds.includes(t.kelasId))
      : tugasList;

  // Role-filtered classes
  const relevantClasses =
    role === 'GURU'
      ? guruClasses
      : role === 'SISWA'
      ? siswaClasses
      : kelasList;

  // Student submission status for today's exams
  const mySubmissions = jawabanList.filter((j) => j.siswaId === currentUser.id);
  const mySubmittedIds = new Set(mySubmissions.map((j) => j.asesmenId));

  // Build 4 KPI cards according to role
  const kpiCards = (() => {
    if (role === 'GURU') {
      const myDrafts = asesmenList.filter(
        (a) => a.guruId === currentUser.id && a.status === 'PROSES'
      ).length;
      const myMateri = materiList.filter((m) => m.guruId === currentUser.id).length;
      const myTugas = tugasList.filter((t) => t.guruId === currentUser.id).length;

      return [
        {
          label: 'Jumlah Kelas Diampu',
          value: `${guruClasses.length} Kelas`,
          sub: `${guruWalasCount} Wali Kelas · ${Math.max(0, guruClasses.length - guruWalasCount)} Kelas Pengajar`,
          accent: 'text-slate-900',
          subAccent: 'text-[#069494]',
        },
        {
          label: 'Total Siswa Aktif Diampu',
          value: `${guruStudentIds.size || totalStudentsAll} Siswa`,
          sub: `Tersebar di ${guruClasses.length || kelasList.length} rombel kelas`,
          accent: 'text-[#069494]',
          subAccent: 'text-slate-500',
        },
        {
          label: 'Jadwal Ujian Hari Ini',
          value: `${todayExams.length} Sesi`,
          sub: `${myDrafts} Draft soal sedang disusun`,
          accent: 'text-slate-900',
          subAccent: 'text-[#FF69B4]',
        },
        {
          label: 'Modul & Tugas Projek',
          value: `${myMateri + myTugas} Bahan`,
          sub: `${myMateri} Modul PDF/Link · ${myTugas} Projek`,
          accent: 'text-slate-900',
          subAccent: 'text-slate-500',
        },
      ];
    }

    if (role === 'SISWA') {
      const pendingCount = todayExams.filter((a) => !mySubmittedIds.has(a.id)).length;
      const completedCount = todayExams.filter((a) => mySubmittedIds.has(a.id)).length;
      const avgScore =
        mySubmissions.length > 0
          ? (
              mySubmissions.reduce((acc, curr) => acc + curr.totalNilai, 0) /
              mySubmissions.length
            ).toFixed(1)
          : '0.0';

      return [
        {
          label: 'Jumlah Kelas Diikuti',
          value: `${siswaClasses.length} Kelas`,
          sub: `Jurusan: ${currentUser.jurusanAsal || 'Rombel Aktif'}`,
          accent: 'text-slate-900',
          subAccent: 'text-[#069494]',
        },
        {
          label: 'Total Siswa Aktif Sekelas',
          value: `${siswaClassmateIds.size || totalStudentsAll} Siswa`,
          sub: `${totalStudentsAll} Total siswa aktif se-sekolah`,
          accent: 'text-[#069494]',
          subAccent: 'text-slate-500',
        },
        {
          label: 'Jadwal Ujian Hari Ini',
          value: `${todayExams.length} Ujian`,
          sub:
            pendingCount > 0
              ? `${pendingCount} Belum dikerjakan · ${completedCount} Selesai`
              : `Semua (${completedCount}) ujian telah selesai`,
          accent: 'text-slate-900',
          subAccent: pendingCount > 0 ? 'text-[#FF69B4]' : 'text-emerald-600',
        },
        {
          label: 'Rata-Rata Nilai Anda',
          value: `${avgScore}`,
          sub: `Dari ${mySubmissions.length} asesmen yang dikumpulkan`,
          accent: 'text-[#069494]',
          subAccent: 'text-slate-500',
        },
      ];
    }

    if (role === 'KURIKULUM') {
      const avgKkm =
        mapelList.length > 0
          ? (mapelList.reduce((acc, m) => acc + m.kkm, 0) / mapelList.length).toFixed(1)
          : '75.0';

      return [
        {
          label: 'Jumlah Kelas Aktif',
          value: `${kelasList.length} Kelas`,
          sub: `60+ Jurusan · Kurikulum Merdeka`,
          accent: 'text-slate-900',
          subAccent: 'text-[#069494]',
        },
        {
          label: 'Total Siswa & Guru Aktif',
          value: `${totalStudentsAll} Siswa`,
          sub: `Didampingi ${totalTeachersAll} Guru Pengampu`,
          accent: 'text-[#069494]',
          subAccent: 'text-slate-500',
        },
        {
          label: 'Jadwal Ujian Hari Ini',
          value: `${todayExams.length} Sesi`,
          sub: `${asesmenList.length - todayExams.length} Asesmen berstatus draft`,
          accent: 'text-slate-900',
          subAccent: 'text-[#FF69B4]',
        },
        {
          label: 'Total Mata Pelajaran',
          value: `${mapelList.length} Mapel`,
          sub: `Rata-rata KKM Sekolah: ${avgKkm}`,
          accent: 'text-slate-900',
          subAccent: 'text-[#069494]',
        },
      ];
    }

    // Default for ADMIN and KEPSEK
    return [
      {
        label: 'Jumlah Kelas Aktif',
        value: `${kelasList.length} Kelas`,
        sub: `Rombel belajar aktif tahun ajaran ini`,
        accent: 'text-slate-900',
        subAccent: 'text-[#069494]',
      },
      {
        label: 'Total Siswa Aktif',
        value: `${totalStudentsAll} Siswa`,
        sub: `${totalTeachersAll} Tenaga pendidik & guru aktif`,
        accent: 'text-[#069494]',
        subAccent: 'text-slate-500',
      },
      {
        label: 'Jadwal Ujian Hari Ini',
        value: `${todayExams.length} Sesi`,
        sub: `${jawabanList.length} Lembar jawaban siswa masuk`,
        accent: 'text-slate-900',
        subAccent: 'text-[#FF69B4]',
      },
      {
        label: 'Modul Materi & Projek',
        value: `${materiList.length + tugasList.length} Item`,
        sub: `${materiList.length} Modul Materi · ${tugasList.length} Tugas Projek`,
        accent: 'text-slate-900',
        subAccent: 'text-slate-500',
      },
    ];
  })();

  const handleDownloadPdfReport = () => {
    setIsDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      let y = 14;

      const nowStr = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // Top Header Banner (Teal #069494)
      doc.setFillColor(6, 148, 148);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 26, 3, 3, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('CNC EDUCATION NEXUS — LAPORAN STATISTIK DASHBOARD', margin + 6, y + 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const idLabel =
        role === 'SISWA'
          ? `NISN: ${currentUser.nisn || '-'}`
          : `NIK: ${currentUser.nik || '-'}`;
      doc.text(
        `Nama: ${currentUser.nama}  |  Role: ${role}  |  ${idLabel}`,
        margin + 6,
        y + 16
      );
      doc.text(`Email: ${currentUser.email}  |  Dicetak: ${nowStr} WIB`, margin + 6, y + 21.5);

      y += 33;

      // Section 1: Ringkasan Statistik Utama (4 KPI Cards in 2x2 Grid)
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('1. Ringkasan Statistik Utama (KPI Role)', margin, y);
      y += 4;

      const cardWidth = (pageWidth - margin * 2 - 6) / 2;
      const cardHeight = 20;

      kpiCards.forEach((card, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const cardX = margin + col * (cardWidth + 6);
        const cardY = y + row * (cardHeight + 4);

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(card.label, cardX + 4, cardY + 5.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(6, 148, 148);
        doc.text(card.value, cardX + 4, cardY + 12.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        const cleanSub = card.sub.replace(/·/g, '-');
        doc.text(cleanSub.substring(0, 52), cardX + 4, cardY + 17.5);
      });

      y += cardHeight * 2 + 12;

      // Section 2: Jadwal Ujian & Asesmen Hari Ini / Aktif
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text(`2. Daftar Jadwal Ujian & Asesmen Aktif (${todayExams.length} Sesi)`, margin, y);
      y += 4;

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, y, pageWidth - margin * 2, 7.5, 'FD');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text('No', margin + 2.5, y + 5);
      doc.text('Judul Asesmen', margin + 10, y + 5);
      doc.text('Mata Pelajaran', margin + 76, y + 5);
      doc.text('Kelas', margin + 124, y + 5);
      doc.text('Tipe & Soal', margin + 150, y + 5);
      y += 7.5;

      if (todayExams.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.rect(margin, y, pageWidth - margin * 2, 8, 'D');
        doc.text('Tidak ada jadwal ujian aktif untuk ditampilkan.', margin + 4, y + 5.3);
        y += 8;
      } else {
        todayExams.slice(0, 8).forEach((exam, index) => {
          const targetKelas = kelasList.find((k) => k.id === exam.kelasId);
          const kelasNama = targetKelas ? targetKelas.judul : 'Semua Kelas';
          const tipeStr = `${exam.tipe === 'QUIZ' ? 'Quiz' : 'Ujian'} (${exam.soalList.length} Soal)`;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(30, 41, 59);
          doc.setDrawColor(226, 232, 240);
          doc.rect(margin, y, pageWidth - margin * 2, 7.5, 'D');

          doc.text(`${index + 1}`, margin + 2.5, y + 5);
          doc.text(exam.judul.substring(0, 36), margin + 10, y + 5);
          doc.text(exam.mapel.substring(0, 26), margin + 76, y + 5);
          doc.text(kelasNama.substring(0, 14), margin + 124, y + 5);
          doc.text(tipeStr, margin + 150, y + 5);
          y += 7.5;
        });
      }

      y += 8;

      // Section 3: Daftar Deadline Tugas Projek Mendatang
      if (y > pageHeight - 55) {
        doc.addPage();
        y = 16;
      }

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text(`3. Daftar Tugas Projek & Deadline (${relevantTugas.length} Tugas)`, margin, y);
      y += 4;

      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, y, pageWidth - margin * 2, 7.5, 'FD');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text('No', margin + 2.5, y + 5);
      doc.text('Judul Tugas Projek', margin + 10, y + 5);
      doc.text('Mata Pelajaran', margin + 80, y + 5);
      doc.text('Kelas', margin + 128, y + 5);
      doc.text('Tenggat Waktu', margin + 152, y + 5);
      y += 7.5;

      if (relevantTugas.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.rect(margin, y, pageWidth - margin * 2, 8, 'D');
        doc.text('Belum ada tugas projek aktif.', margin + 4, y + 5.3);
        y += 8;
      } else {
        relevantTugas.slice(0, 8).forEach((t, idx) => {
          const targetKelas = kelasList.find((k) => k.id === t.kelasId);
          const kelasNama = targetKelas ? targetKelas.judul : 'Semua Kelas';
          const deadlineFormatted = new Date(t.tenggatWaktu).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(30, 41, 59);
          doc.setDrawColor(226, 232, 240);
          doc.rect(margin, y, pageWidth - margin * 2, 7.5, 'D');

          doc.text(`${idx + 1}`, margin + 2.5, y + 5);
          doc.text(t.judul.substring(0, 38), margin + 10, y + 5);
          doc.text(t.mapel.substring(0, 25), margin + 80, y + 5);
          doc.text(kelasNama.substring(0, 13), margin + 128, y + 5);
          doc.text(deadlineFormatted, margin + 152, y + 5);
          y += 7.5;
        });
      }

      y += 8;

      // Section 4: Daftar Rombel Kelas Aktif
      if (y > pageHeight - 50) {
        doc.addPage();
        y = 16;
      }

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text(`4. Ringkasan Rombel Kelas Terdaftar (${relevantClasses.length} Kelas)`, margin, y);
      y += 4;

      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, y, pageWidth - margin * 2, 7.5, 'FD');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text('No', margin + 2.5, y + 5);
      doc.text('Nama Kelas / Rombel', margin + 10, y + 5);
      doc.text('Jurusan', margin + 65, y + 5);
      doc.text('Kode Gabung', margin + 115, y + 5);
      doc.text('Populasi', margin + 148, y + 5);
      y += 7.5;

      relevantClasses.slice(0, 8).forEach((k, idx) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, y, pageWidth - margin * 2, 7.5, 'D');

        doc.text(`${idx + 1}`, margin + 2.5, y + 5);
        doc.text(k.judul.substring(0, 28), margin + 10, y + 5);
        doc.text((k.jurusan || '-').substring(0, 25), margin + 65, y + 5);
        doc.text(k.kodeGabung, margin + 115, y + 5);
        doc.text(`${k.siswaIds.length} Siswa / ${k.guruIds.length} Guru`, margin + 148, y + 5);
        y += 7.5;
      });

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Dokumen Resmi CNC Education Nexus LMS — Dicetak otomatis oleh ${currentUser.nama} (${role})`,
        margin,
        pageHeight - 10
      );

      const dateSlug = new Date().toISOString().slice(0, 10);
      doc.save(`Laporan_Statistik_${role}_${dateSlug}.pdf`);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar for Statistics Summary & Download PDF Report Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-[#069494] flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900">
              Ringkasan Statistik Akademik &amp; Aktivitas Harian ({role})
            </h2>
            <p className="text-[11px] text-slate-500">
              Metrik real-time jumlah kelas, siswa aktif, dan jadwal ujian hari ini.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadPdfReport}
          disabled={isDownloading}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            downloadSuccess
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-[#069494] hover:bg-[#057c7c] text-white shadow-sm shadow-[#069494]/20'
          }`}
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Laporan PDF Terunduh</span>
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              <span>{isDownloading ? 'Menyiapkan PDF...' : 'Download Laporan (PDF)'}</span>
            </>
          )}
        </button>
      </div>

      {/* Row 1: 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <span className="text-xs font-semibold text-slate-500">{card.label}</span>
            <p className={`text-2xl font-extrabold mt-1 font-mono tabular-nums ${card.accent}`}>
              {card.value}
            </p>
            <span className={`text-[11px] font-semibold mt-1.5 block truncate ${card.subAccent}`}>
              {card.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Row 2: Interactive Academic Calendar (Upcoming Exams & Task Deadlines) */}
      <AcademicCalendar
        onSelectKelas={onSelectKelas}
        onSelectAsesmen={onSelectAsesmen}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
