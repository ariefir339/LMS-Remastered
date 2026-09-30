import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Asesmen, TugasProjek } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  School,
} from 'lucide-react';

export interface CalendarEventItem {
  id: string;
  title: string;
  mapel: string;
  kelasId?: string;
  kelasNama: string;
  dateIso: string;
  dateKey: string; // YYYY-MM-DD
  category: 'ASESMEN' | 'TUGAS';
  subType: string; // 'Ujian Online' | 'Quiz Kilat' | 'Deadline Tugas'
  durasiMenit?: number;
  soalCount?: number;
  isCompletedByStudent?: boolean;
  rawAsesmen?: Asesmen;
  rawTugas?: TugasProjek;
}

interface AcademicCalendarProps {
  onSelectKelas?: (kelasId: string) => void;
  onSelectAsesmen?: (asesmen: Asesmen) => void;
  onNavigateTab?: (tabId: string) => void;
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_HEADERS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function toDateKey(dateObj: Date): string {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({
  onSelectKelas,
  onSelectAsesmen,
  onNavigateTab,
}) => {
  const {
    currentUser,
    kelasList,
    asesmenList,
    tugasList,
    jawabanList,
    setSelectedKelasId,
    setSelectedAsesmenId,
  } = useApp();

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);

  const [currentMonth, setCurrentMonth] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ASESMEN' | 'TUGAS'>('ALL');
  const [viewMode, setViewMode] = useState<'UPCOMING' | 'SELECTED_DATE'>('UPCOMING');

  if (!currentUser) return null;

  const role = currentUser.role;

  // Determine relevant classes for current user
  const myClassIds = useMemo(() => {
    if (role === 'SISWA') {
      return kelasList.filter((k) => k.siswaIds.includes(currentUser.id)).map((k) => k.id);
    }
    if (role === 'GURU') {
      return kelasList
        .filter((k) => k.walasId === currentUser.id || k.guruIds.includes(currentUser.id))
        .map((k) => k.id);
    }
    return kelasList.map((k) => k.id);
  }, [role, kelasList, currentUser.id]);

  // Student's completed exams
  const submittedAsesmenIds = useMemo(() => {
    return new Set(
      jawabanList.filter((j) => j.siswaId === currentUser.id).map((j) => j.asesmenId)
    );
  }, [jawabanList, currentUser.id]);

  // Build unified calendar events from Asesmen & TugasProjek
  const allEvents: CalendarEventItem[] = useMemo(() => {
    const events: CalendarEventItem[] = [];

    // 1. Assessments (Published or Teacher's own)
    asesmenList.forEach((a, idx) => {
      if (role === 'SISWA') {
        if (a.status !== 'SELESAI') return;
        if (a.kelasId && !myClassIds.includes(a.kelasId)) return;
      } else if (role === 'GURU') {
        if (
          a.guruId !== currentUser.id &&
          a.kelasId &&
          !myClassIds.includes(a.kelasId)
        ) {
          return;
        }
      }

      // Use tanggalPelaksanaan if available, otherwise fallback to a deterministic date near today so existing localStorage data always appears on the calendar
      let eventDate: Date;
      if (a.tanggalPelaksanaan) {
        eventDate = new Date(a.tanggalPelaksanaan);
      } else {
        eventDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (idx * 2));
        eventDate.setHours(8 + idx, 0, 0, 0);
      }

      if (isNaN(eventDate.getTime())) {
        eventDate = new Date();
      }

      const targetKelas = kelasList.find((k) => k.id === a.kelasId);

      events.push({
        id: `exam-${a.id}`,
        title: a.judul,
        mapel: a.mapel,
        kelasId: a.kelasId,
        kelasNama: targetKelas ? targetKelas.judul : 'Semua Kelas',
        dateIso: eventDate.toISOString(),
        dateKey: toDateKey(eventDate),
        category: 'ASESMEN',
        subType: a.tipe === 'QUIZ' ? 'Quiz Kilat' : 'Ujian Online',
        durasiMenit: a.durasiMenit,
        soalCount: a.soalList.length,
        isCompletedByStudent: role === 'SISWA' ? submittedAsesmenIds.has(a.id) : false,
        rawAsesmen: a,
      });
    });

    // 2. Tasks / Projects (TugasProjek)
    tugasList.forEach((t) => {
      if (role === 'SISWA' && t.kelasId && !myClassIds.includes(t.kelasId)) {
        return;
      }
      if (
        role === 'GURU' &&
        t.guruId !== currentUser.id &&
        t.kelasId &&
        !myClassIds.includes(t.kelasId)
      ) {
        return;
      }

      let deadlineDate = new Date(t.tenggatWaktu);
      if (isNaN(deadlineDate.getTime())) {
        deadlineDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
      }

      const targetKelas = kelasList.find((k) => k.id === t.kelasId);
      const isSubmitted = t.submissions.some((s) => s.siswaId === currentUser.id);

      events.push({
        id: `task-${t.id}`,
        title: t.judul,
        mapel: t.mapel,
        kelasId: t.kelasId,
        kelasNama: targetKelas ? targetKelas.judul : 'Semua Kelas',
        dateIso: deadlineDate.toISOString(),
        dateKey: toDateKey(deadlineDate),
        category: 'TUGAS',
        subType: 'Deadline Tugas Projek',
        isCompletedByStudent: role === 'SISWA' ? isSubmitted : false,
        rawTugas: t,
      });
    });

    return events.sort(
      (a, b) => new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime()
    );
  }, [asesmenList, tugasList, role, myClassIds, currentUser.id, kelasList, submittedAsesmenIds, today]);

  // Filter events by selected category
  const filteredEvents = useMemo(() => {
    if (categoryFilter === 'ALL') return allEvents;
    return allEvents.filter((e) => e.category === categoryFilter);
  }, [allEvents, categoryFilter]);

  // Group events by YYYY-MM-DD for quick lookup in calendar cells
  const eventsByDateKey = useMemo(() => {
    const map: Record<string, CalendarEventItem[]> = {};
    filteredEvents.forEach((ev) => {
      if (!map[ev.dateKey]) map[ev.dateKey] = [];
      map[ev.dateKey].push(ev);
    });
    return map;
  }, [filteredEvents]);

  // Build calendar cells for currentMonth (Monday-first week)
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Convert Sunday (0) .. Saturday (6) into Monday (0) .. Sunday (6)
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = lastDayOfMonth.getDate();

    const cells: Array<{
      date: Date;
      dateKey: string;
      dayNumber: number;
      isCurrentMonth: boolean;
    }> = [];

    // Previous month trailing days
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      cells.push({
        date: d,
        dateKey: toDateKey(d),
        dayNumber: d.getDate(),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      cells.push({
        date: d,
        dateKey: toDateKey(d),
        dayNumber: day,
        isCurrentMonth: true,
      });
    }

    // Next month leading days to complete 35 or 42 grid cells
    const totalCells = cells.length <= 35 ? 35 : 42;
    const remaining = totalCells - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({
        date: d,
        dateKey: toDateKey(d),
        dayNumber: d.getDate(),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateKey(todayKey);
    setViewMode('SELECTED_DATE');
  };

  const handleClickDateCell = (dateKey: string, cellDate: Date) => {
    setSelectedDateKey(dateKey);
    setViewMode('SELECTED_DATE');
    if (
      cellDate.getMonth() !== currentMonth.getMonth() ||
      cellDate.getFullYear() !== currentMonth.getFullYear()
    ) {
      setCurrentMonth(new Date(cellDate.getFullYear(), cellDate.getMonth(), 1));
    }
  };

  // Displayed events on the right-hand panel
  const displayedPanelEvents = useMemo(() => {
    if (viewMode === 'SELECTED_DATE') {
      return eventsByDateKey[selectedDateKey] || [];
    }
    return filteredEvents;
  }, [viewMode, eventsByDateKey, selectedDateKey, filteredEvents]);

  const formatRelativeDays = (dateKey: string) => {
    if (dateKey === todayKey) return 'Hari Ini';
    const target = new Date(dateKey + 'T00:00:00');
    const base = new Date(todayKey + 'T00:00:00');
    const diffDays = Math.round((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Besok';
    if (diffDays === -1) return 'Kemarin';
    if (diffDays > 1) return `${diffDays} hari lagi`;
    return `${Math.abs(diffDays)} hari lalu`;
  };

  const handleEventAction = (ev: CalendarEventItem) => {
    if (ev.category === 'ASESMEN' && ev.rawAsesmen) {
      if (role === 'SISWA') {
        if (onSelectAsesmen) {
          onSelectAsesmen(ev.rawAsesmen);
        } else if (onNavigateTab) {
          onNavigateTab('ASESMEN');
        }
      } else if (role === 'GURU' || role === 'KEPSEK') {
        setSelectedAsesmenId(ev.rawAsesmen.id);
      } else if (onNavigateTab) {
        onNavigateTab('ASESMEN');
      }
      return;
    }

    if (ev.category === 'TUGAS') {
      if (onNavigateTab && (role === 'GURU' || role === 'SISWA' || role === 'KEPSEK')) {
        onNavigateTab('TUGAS');
      } else if (ev.kelasId) {
        if (onSelectKelas) onSelectKelas(ev.kelasId);
        else setSelectedKelasId(ev.kelasId);
      }
    }
  };

  const totalExamCount = allEvents.filter((e) => e.category === 'ASESMEN').length;
  const totalTaskCount = allEvents.filter((e) => e.category === 'TUGAS').length;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
      {/* Top Header & Category Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-[#069494] flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Kalender Akademik Interaktif: Jadwal Ujian &amp; Deadline Tugas
            </h2>
            <p className="text-xs text-slate-500">
              Klik tanggal pada kalender untuk memeriksa jadwal asesmen atau tenggat pengumpulan tugas projek.
            </p>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: `Semua Agenda (${allEvents.length})` },
            { id: 'ASESMEN', label: `Ujian & Quiz (${totalExamCount})` },
            { id: 'TUGAS', label: `Deadline Tugas (${totalTaskCount})` },
          ].map((btn) => {
            const isSel = categoryFilter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setCategoryFilter(btn.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSel
                    ? 'bg-[#069494] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Split: Left Calendar Grid | Right Agenda Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Monthly Interactive Grid (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-3">
          {/* Month Navigation Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={handleGoToday}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-50 text-[#069494] border border-slate-200 text-[11px] font-bold transition-colors"
              >
                Hari Ini
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 7-Day Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAY_HEADERS.map((day) => (
              <div
                key={day}
                className="py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell) => {
              const cellEvents = eventsByDateKey[cell.dateKey] || [];
              const hasExam = cellEvents.some((e) => e.category === 'ASESMEN');
              const hasTask = cellEvents.some((e) => e.category === 'TUGAS');
              const isSelected = selectedDateKey === cell.dateKey && viewMode === 'SELECTED_DATE';
              const isToday = cell.dateKey === todayKey;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() => handleClickDateCell(cell.dateKey, cell.date)}
                  className={`min-h-[54px] p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all relative ${
                    isSelected
                      ? 'bg-[#069494] border-[#069494] text-white shadow-md shadow-[#069494]/20'
                      : isToday
                      ? 'bg-teal-50/90 border-teal-300 text-slate-900'
                      : cell.isCurrentMonth
                      ? 'bg-white border-slate-200/80 text-slate-800 hover:border-[#069494]'
                      : 'bg-slate-100/60 border-transparent text-slate-400 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono font-bold tabular-nums ${
                        isSelected
                          ? 'text-white'
                          : isToday
                          ? 'text-[#069494] font-extrabold'
                          : ''
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cellEvents.length > 0 && (
                      <span
                        className={`text-[10px] font-mono font-bold tabular-nums ${
                          isSelected ? 'text-teal-100' : 'text-slate-400'
                        }`}
                      >
                        {cellEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event Indicator Dots / Labels */}
                  {cellEvents.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {hasExam && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-[#069494]'
                          }`}
                          title="Jadwal Ujian / Quiz"
                        />
                      )}
                      {hasTask && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-pink-200' : 'bg-[#FF69B4]'
                          }`}
                          title="Deadline Tugas Projek"
                        />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#069494]" />
                <span>Jadwal Ujian / Quiz</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF69B4]" />
                <span>Deadline Tugas Projek</span>
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              Klik tanggal untuk filter agenda harian
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Agenda Details & Upcoming List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          {/* Mode Switcher: Selected Date vs All Upcoming */}
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('UPCOMING')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                viewMode === 'UPCOMING'
                  ? 'bg-white text-[#069494] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Jadwal ({filteredEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('SELECTED_DATE')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                viewMode === 'SELECTED_DATE'
                  ? 'bg-white text-[#069494] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tanggal {selectedDateKey.split('-').reverse().join('/')} (
              {(eventsByDateKey[selectedDateKey] || []).length})
            </button>
          </div>

          {/* Event Cards List */}
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {displayedPanelEvents.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <CalendarIcon className="w-7 h-7 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  Tidak ada agenda pada tanggal ini
                </p>
                <p className="text-[11px] text-slate-500">
                  Pilih tanggal lain yang memiliki penanda titik warna atau klik tombol di bawah untuk melihat seluruh jadwal.
                </p>
                {viewMode === 'SELECTED_DATE' && (
                  <button
                    type="button"
                    onClick={() => setViewMode('UPCOMING')}
                    className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#069494] text-white text-xs font-bold"
                  >
                    <span>Tampilkan Semua Jadwal</span>
                  </button>
                )}
              </div>
            ) : (
              displayedPanelEvents.map((ev) => {
                const isExam = ev.category === 'ASESMEN';
                const formattedDate = new Date(ev.dateIso).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const formattedTime = new Date(ev.dateIso).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-[#069494] transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold">
                        {isExam ? (
                          <FileSpreadsheet className="w-3.5 h-3.5 text-[#069494]" />
                        ) : (
                          <Briefcase className="w-3.5 h-3.5 text-[#FF69B4]" />
                        )}
                        <span className={isExam ? 'text-[#069494]' : 'text-[#FF69B4]'}>
                          {ev.subType}
                        </span>
                      </div>

                      <span className="font-mono font-bold text-slate-600 tabular-nums">
                        {formatRelativeDays(ev.dateKey)} · {formattedDate}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                        {ev.title}
                      </h4>
                      <p className="text-[11px] font-bold text-[#069494] mt-0.5">
                        {ev.mapel}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="flex items-center gap-1 text-slate-700 font-bold">
                          <School className="w-3 h-3 text-[#069494]" />
                          <span>{ev.kelasNama}</span>
                        </span>
                        <span>·</span>
                        <span className="font-mono tabular-nums flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formattedTime} WIB</span>
                        </span>
                      </div>

                      {role === 'SISWA' && ev.isCompletedByStudent ? (
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Selesai</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEventAction(ev)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                            isExam
                              ? 'bg-[#069494] hover:bg-[#057c7c] text-white'
                              : 'bg-[#FF69B4] hover:bg-[#fa52a3] text-white'
                          }`}
                        >
                          <span>
                            {role === 'SISWA'
                              ? isExam
                                ? 'Kerjakan'
                                : 'Kumpulkan'
                              : isExam
                              ? 'Buka Ujian'
                              : 'Lihat Tugas'}
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
