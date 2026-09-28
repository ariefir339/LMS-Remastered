import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Kelas,
  Pengumuman,
  Komentar,
  Asesmen,
  Soal,
  JawabanSiswa,
  JawabanItem,
  NilaiRekap,
  Materi,
  TugasProjek,
  TugasSubmission,
  MataPelajaran,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_KELAS,
  INITIAL_PENGUMUMAN,
  INITIAL_ASESMEN,
  INITIAL_JAWABAN,
  INITIAL_NILAI_REKAP,
  INITIAL_MATERI,
  INITIAL_TUGAS,
  INITIAL_MAPEL,
} from '../data/mockData';

interface AppContextType {
  // Current view & auth
  currentUser: User | null;
  currentView: 'LANDING' | 'LOGIN' | 'DASHBOARD';
  setCurrentView: (view: 'LANDING' | 'LOGIN' | 'DASHBOARD') => void;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  selectedKelasId: string | null;
  setSelectedKelasId: (id: string | null) => void;
  selectedAsesmenId: string | null;
  setSelectedAsesmenId: (id: string | null) => void;
  isTakingAsesmen: boolean;
  setIsTakingAsesmen: (val: boolean) => void;
  isDbDocsOpen: boolean;
  setIsDbDocsOpen: (val: boolean) => void;
  viewingProfileUser: User | null;
  setViewingProfileUser: (user: User | null) => void;

  // Auth actions
  login: (role: UserRole, email: string, credential: string) => { success: boolean; message?: string };
  quickLogin: (role: UserRole, userId?: string) => void;
  logout: () => void;
  updateCurrentUserProfile: (data: Partial<User>) => void;

  // Users / Accounts
  users: User[];
  addUser: (userData: Omit<User, 'id'>) => User;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Kelas
  kelasList: Kelas[];
  createKelas: (data: { judul: string; jurusan?: string; walasId?: string; deskripsi?: string }) => Kelas;
  updateKelas: (id: string, data: Partial<Kelas>) => void;
  deleteKelas: (id: string) => void;
  addSiswaToKelas: (kelasId: string, siswaId: string) => void;
  removeSiswaFromKelas: (kelasId: string, siswaId: string) => void;

  // Pengumuman & Komentar
  pengumumanList: Pengumuman[];
  addPengumuman: (kelasId: string, judul: string, konten: string, fileUrl?: string) => Pengumuman;
  updatePengumuman: (id: string, judul: string, konten: string) => void;
  deletePengumuman: (id: string) => void;
  addKomentar: (pengumumanId: string, konten: string) => Komentar;
  deleteKomentar: (pengumumanId: string, komentarId: string) => void;

  // Materi Pembelajaran (PDF & Link)
  materiList: Materi[];
  addMateri: (materi: Omit<Materi, 'id' | 'createdAt'>) => Materi;
  updateMateri: (id: string, updates: Partial<Materi>) => void;
  deleteMateri: (id: string) => void;

  // Tugas & Projek (PDF & Link)
  tugasList: TugasProjek[];
  addTugas: (tugas: Omit<TugasProjek, 'id' | 'createdAt' | 'submissions'>) => TugasProjek;
  updateTugas: (id: string, updates: Partial<TugasProjek>) => void;
  deleteTugas: (id: string) => void;
  submitTugas: (tugasId: string, submission: Omit<TugasSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  gradeTugasSubmission: (tugasId: string, submissionId: string, nilai: number, catatanGuru?: string) => void;

  // Asesmen (Ujian & Quiz)
  asesmenList: Asesmen[];
  createAsesmen: (data: Partial<Asesmen>) => Asesmen;
  updateAsesmen: (id: string, data: Partial<Asesmen>) => void;
  deleteAsesmen: (id: string) => { success: boolean; message?: string };
  addSoal: (asesmenId: string, soal: Omit<Soal, 'id' | 'asesmenId'>) => void;
  updateSoal: (asesmenId: string, soalId: string, soal: Partial<Soal>) => void;
  deleteSoal: (asesmenId: string, soalId: string) => void;

  // Jawaban & Nilai Rekap
  jawabanList: JawabanSiswa[];
  submitJawaban: (asesmenId: string, siswaId: string, jawaban: JawabanItem[]) => JawabanSiswa;
  nilaiRekapList: NilaiRekap[];
  generateNilai: (asesmenId: string) => NilaiRekap[];
  generateNilaiPerFilter: (mapel?: string, kelasId?: string, jurusan?: string) => NilaiRekap[];
  deleteNilaiRekap: (id: string) => void;
  exportToExcel: (asesmenId: string) => void;
  exportNilaiFiltered: (filteredRows: NilaiRekap[], titleLabel?: string) => void;

  // Kurikulum & Mata Pelajaran (Mapel)
  mapelList: MataPelajaran[];
  addMapel: (data: Omit<MataPelajaran, 'id' | 'createdAt' | 'updatedAt'>) => MataPelajaran;
  updateMapel: (id: string, data: Partial<MataPelajaran>) => void;
  deleteMapel: (id: string) => void;

  resetToInitialData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage loaders
  const loadInitial = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(`cnc_app_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => loadInitial('currentUser', null));
  const [currentView, setCurrentView] = useState<'LANDING' | 'LOGIN' | 'DASHBOARD'>(() =>
    currentUser ? 'DASHBOARD' : 'LANDING'
  );
  const [activeNavTab, setActiveNavTab] = useState<string>('KELAS');
  const [selectedKelasId, setSelectedKelasId] = useState<string | null>(null);
  const [selectedAsesmenId, setSelectedAsesmenId] = useState<string | null>(null);
  const [isTakingAsesmen, setIsTakingAsesmen] = useState<boolean>(false);
  const [isDbDocsOpen, setIsDbDocsOpen] = useState<boolean>(false);
  const [viewingProfileUser, setViewingProfileUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>(() => loadInitial('users', INITIAL_USERS));
  const [kelasList, setKelasList] = useState<Kelas[]>(() => loadInitial('kelas', INITIAL_KELAS));
  const [pengumumanList, setPengumumanList] = useState<Pengumuman[]>(() => loadInitial('pengumuman', INITIAL_PENGUMUMAN));
  const [materiList, setMateriList] = useState<Materi[]>(() => loadInitial('materi', INITIAL_MATERI));
  const [tugasList, setTugasList] = useState<TugasProjek[]>(() => loadInitial('tugas', INITIAL_TUGAS));
  const [asesmenList, setAsesmenList] = useState<Asesmen[]>(() => loadInitial('asesmen', INITIAL_ASESMEN));
  const [jawabanList, setJawabanList] = useState<JawabanSiswa[]>(() => loadInitial('jawaban', INITIAL_JAWABAN));
  const [nilaiRekapList, setNilaiRekapList] = useState<NilaiRekap[]>(() => loadInitial('nilaiRekap', INITIAL_NILAI_REKAP));
  const [mapelList, setMapelList] = useState<MataPelajaran[]>(() => loadInitial('mapel', INITIAL_MAPEL));

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('cnc_app_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem('cnc_app_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('cnc_app_kelas', JSON.stringify(kelasList));
  }, [kelasList]);
  useEffect(() => {
    localStorage.setItem('cnc_app_pengumuman', JSON.stringify(pengumumanList));
  }, [pengumumanList]);
  useEffect(() => {
    localStorage.setItem('cnc_app_materi', JSON.stringify(materiList));
  }, [materiList]);
  useEffect(() => {
    localStorage.setItem('cnc_app_tugas', JSON.stringify(tugasList));
  }, [tugasList]);
  useEffect(() => {
    localStorage.setItem('cnc_app_asesmen', JSON.stringify(asesmenList));
  }, [asesmenList]);
  useEffect(() => {
    localStorage.setItem('cnc_app_jawaban', JSON.stringify(jawabanList));
  }, [jawabanList]);
  useEffect(() => {
    localStorage.setItem('cnc_app_nilaiRekap', JSON.stringify(nilaiRekapList));
  }, [nilaiRekapList]);
  useEffect(() => {
    localStorage.setItem('cnc_app_mapel', JSON.stringify(mapelList));
  }, [mapelList]);

  // Auth functions
  const login = (role: UserRole, email: string, credential: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCred = credential.trim();

    const user = users.find((u) => u.email.toLowerCase() === trimmedEmail && u.role === role);
    if (!user) {
      return { success: false, message: `Akun ${role} dengan email ${email} tidak ditemukan.` };
    }

    if (role === 'ADMIN') {
      if (user.password && user.password !== trimmedCred) {
        return { success: false, message: 'Password admin tidak sesuai.' };
      }
    } else if (role === 'GURU' || role === 'KEPSEK' || role === 'KURIKULUM') {
      if (user.nik && user.nik !== trimmedCred) {
        return { success: false, message: 'NIK tidak sesuai dengan data terdaftar.' };
      }
    } else if (role === 'SISWA') {
      if (user.nisn && user.nisn !== trimmedCred) {
        return { success: false, message: 'NIS / NISN tidak sesuai dengan data terdaftar.' };
      }
    }

    setCurrentUser(user);
    setCurrentView('DASHBOARD');
    setSelectedKelasId(null);
    setSelectedAsesmenId(null);
    return { success: true };
  };

  const quickLogin = (role: UserRole, userId?: string) => {
    let target = users.find((u) => (userId ? u.id === userId : u.role === role));
    if (!target) target = INITIAL_USERS.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      setCurrentView('DASHBOARD');
      setSelectedKelasId(null);
      setSelectedAsesmenId(null);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('LANDING');
    setSelectedKelasId(null);
    setSelectedAsesmenId(null);
    setIsTakingAsesmen(false);
  };

  // Locked email update for self-profile
  const updateCurrentUserProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    // Email is strictly locked as per requirement:
    // "di lock profile yang gk bisa diubah, ada email dari si usernya dibawah setelah poto profil dan nama dan sebelum deskripsi"
    const { email: _lockedEmail, ...allowedData } = data;
    const updated: User = { ...currentUser, ...allowedData };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
  };

  // User management (Admin)
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);

    // If student has assigned kelasId, add to class
    if (newUser.role === 'SISWA' && newUser.kelasId) {
      addSiswaToKelas(newUser.kelasId, newUser.id);
    }
    // If teacher has assigned kelasList, add to those classes
    if (newUser.role === 'GURU' && newUser.kelasList && newUser.kelasList.length > 0) {
      newUser.kelasList.forEach((kid) => {
        setKelasList((prev) =>
          prev.map((k) => (k.id === kid && !k.guruIds.includes(newUser.id) ? { ...k, guruIds: [...k.guruIds, newUser.id] } : k))
        );
      });
    }

    return newUser;
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    if (currentUser && currentUser.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    // Remove user from any classes
    setKelasList((prev) =>
      prev.map((k) => ({
        ...k,
        siswaIds: k.siswaIds.filter((sid) => sid !== id),
        guruIds: k.guruIds.filter((gid) => gid !== id),
        walasId: k.walasId === id ? undefined : k.walasId,
      }))
    );
  };

  // Kelas management
  const createKelas = (data: { judul: string; jurusan?: string; walasId?: string; deskripsi?: string }) => {
    const defaultTitle = data.judul.trim() || data.jurusan || 'Kelas Baru';
    const newKelas: Kelas = {
      id: `kelas-${Date.now()}`,
      judul: defaultTitle,
      jurusan: data.jurusan || data.judul,
      walasId: data.walasId || undefined,
      deskripsi: data.deskripsi || '',
      kodeGabung: `CNC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      siswaIds: [],
      guruIds: data.walasId ? [data.walasId] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setKelasList((prev) => [newKelas, ...prev]);
    return newKelas;
  };

  const updateKelas = (id: string, data: Partial<Kelas>) => {
    setKelasList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, ...data, updatedAt: new Date().toISOString() } : k))
    );
  };

  const deleteKelas = (id: string) => {
    setKelasList((prev) => prev.filter((k) => k.id !== id));
    if (selectedKelasId === id) {
      setSelectedKelasId(null);
    }
  };

  const addSiswaToKelas = (kelasId: string, siswaId: string) => {
    setKelasList((prev) =>
      prev.map((k) => {
        if (k.id === kelasId && !k.siswaIds.includes(siswaId)) {
          return { ...k, siswaIds: [...k.siswaIds, siswaId], updatedAt: new Date().toISOString() };
        }
        return k;
      })
    );
  };

  const removeSiswaFromKelas = (kelasId: string, siswaId: string) => {
    setKelasList((prev) =>
      prev.map((k) => {
        if (k.id === kelasId) {
          return {
            ...k,
            siswaIds: k.siswaIds.filter((id) => id !== siswaId),
            updatedAt: new Date().toISOString(),
          };
        }
        return k;
      })
    );
  };

  // Pengumuman & Komentar
  const addPengumuman = (kelasId: string, judul: string, konten: string, fileUrl?: string) => {
    if (!currentUser) throw new Error('Not authenticated');
    const newPeng: Pengumuman = {
      id: `peng-${Date.now()}`,
      kelasId,
      authorId: currentUser.id,
      judul,
      konten,
      fileUrl,
      komentar: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPengumumanList((prev) => [newPeng, ...prev]);
    return newPeng;
  };

  const updatePengumuman = (id: string, judul: string, konten: string) => {
    setPengumumanList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, judul, konten, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deletePengumuman = (id: string) => {
    setPengumumanList((prev) => prev.filter((p) => p.id !== id));
  };

  const addKomentar = (pengumumanId: string, konten: string) => {
    if (!currentUser) throw new Error('Not authenticated');
    const newKom: Komentar = {
      id: `kom-${Date.now()}`,
      pengumumanId,
      authorId: currentUser.id,
      konten,
      createdAt: new Date().toISOString(),
    };
    setPengumumanList((prev) =>
      prev.map((p) => (p.id === pengumumanId ? { ...p, komentar: [...p.komentar, newKom] } : p))
    );
    return newKom;
  };

  const deleteKomentar = (pengumumanId: string, komentarId: string) => {
    setPengumumanList((prev) =>
      prev.map((p) =>
        p.id === pengumumanId ? { ...p, komentar: p.komentar.filter((k) => k.id !== komentarId) } : p
      )
    );
  };

  // Materi Pembelajaran (PDF & Link CRUD)
  const addMateri = (materiData: Omit<Materi, 'id' | 'createdAt'>) => {
    const newMat: Materi = {
      ...materiData,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMateriList((prev) => [newMat, ...prev]);
    return newMat;
  };

  const updateMateri = (id: string, updates: Partial<Materi>) => {
    setMateriList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
  };

  const deleteMateri = (id: string) => {
    setMateriList((prev) => prev.filter((m) => m.id !== id));
  };

  // Tugas & Projek (PDF & Link CRUD + Student Submission)
  const addTugas = (tugasData: Omit<TugasProjek, 'id' | 'createdAt' | 'submissions'>) => {
    const newTugas: TugasProjek = {
      ...tugasData,
      id: `tugas-${Date.now()}`,
      submissions: [],
      createdAt: new Date().toISOString(),
    };
    setTugasList((prev) => [newTugas, ...prev]);
    return newTugas;
  };

  const updateTugas = (id: string, updates: Partial<TugasProjek>) => {
    setTugasList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteTugas = (id: string) => {
    setTugasList((prev) => prev.filter((t) => t.id !== id));
  };

  const submitTugas = (
    tugasId: string,
    submissionData: Omit<TugasSubmission, 'id' | 'submittedAt' | 'status'>
  ) => {
    const newSub: TugasSubmission = {
      ...submissionData,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'SUBMITTED',
    };

    setTugasList((prev) =>
      prev.map((t) => {
        if (t.id === tugasId) {
          // Replace previous submission if any
          const filtered = t.submissions.filter((s) => s.siswaId !== submissionData.siswaId);
          return { ...t, submissions: [newSub, ...filtered] };
        }
        return t;
      })
    );
  };

  const gradeTugasSubmission = (
    tugasId: string,
    submissionId: string,
    nilai: number,
    catatanGuru?: string
  ) => {
    setTugasList((prev) =>
      prev.map((t) => {
        if (t.id === tugasId) {
          return {
            ...t,
            submissions: t.submissions.map((s) =>
              s.id === submissionId ? { ...s, nilai, catatanGuru, status: 'GRADED' } : s
            ),
          };
        }
        return t;
      })
    );
  };

  // Asesmen Management
  const createAsesmen = (data: Partial<Asesmen>) => {
    if (!currentUser) throw new Error('Not authenticated');
    const newAsesmen: Asesmen = {
      id: `asesmen-${Date.now()}`,
      guruId: currentUser.id,
      kelasId: data.kelasId || undefined,
      tipe: data.tipe || 'UJIAN_ONLINE',
      judul: data.judul || 'Asesmen Baru',
      mapel: data.mapel || (currentUser.mapelUtama || 'Umum'),
      deskripsi: data.deskripsi || '',
      durasiMenit: data.tipe === 'QUIZ' ? data.durasiMenit || 30 : data.durasiMenit,
      status: data.status || 'PROSES', // Default draft
      soalList: data.soalList || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAsesmenList((prev) => [newAsesmen, ...prev]);
    return newAsesmen;
  };

  const updateAsesmen = (id: string, data: Partial<Asesmen>) => {
    setAsesmenList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a))
    );
  };

  const deleteAsesmen = (id: string) => {
    const target = asesmenList.find((a) => a.id === id);
    if (!target) return { success: false, message: 'Asesmen tidak ditemukan' };

    // RBAC: Admin cannot delete teacher's assessment!
    if (currentUser?.role === 'ADMIN' && target.guruId !== currentUser.id) {
      return {
        success: false,
        message: 'Admin tidak dapat menghapus asesmen milik guru. Hanya guru pemilik yang berwenang.',
      };
    }
    // Teacher cannot delete other teacher's assessment
    if (currentUser?.role === 'GURU' && target.guruId !== currentUser.id) {
      return { success: false, message: 'Anda tidak dapat menghapus asesmen milik guru lain.' };
    }

    setAsesmenList((prev) => prev.filter((a) => a.id !== id));
    if (selectedAsesmenId === id) setSelectedAsesmenId(null);
    return { success: true };
  };

  const addSoal = (asesmenId: string, soalData: Omit<Soal, 'id' | 'asesmenId'>) => {
    const newSoal: Soal = {
      ...soalData,
      id: `soal-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
      asesmenId,
    };
    setAsesmenList((prev) =>
      prev.map((a) =>
        a.id === asesmenId
          ? { ...a, soalList: [...a.soalList, newSoal], updatedAt: new Date().toISOString() }
          : a
      )
    );
  };

  const updateSoal = (asesmenId: string, soalId: string, soalData: Partial<Soal>) => {
    setAsesmenList((prev) =>
      prev.map((a) => {
        if (a.id === asesmenId) {
          return {
            ...a,
            soalList: a.soalList.map((s) => (s.id === soalId ? { ...s, ...soalData } : s)),
            updatedAt: new Date().toISOString(),
          };
        }
        return a;
      })
    );
  };

  const deleteSoal = (asesmenId: string, soalId: string) => {
    setAsesmenList((prev) =>
      prev.map((a) => {
        if (a.id === asesmenId) {
          return {
            ...a,
            soalList: a.soalList.filter((s) => s.id !== soalId),
            updatedAt: new Date().toISOString(),
          };
        }
        return a;
      })
    );
  };

  // Jawaban & Nilai
  const submitJawaban = (asesmenId: string, siswaId: string, jawaban: JawabanItem[]) => {
    const targetAsesmen = asesmenList.find((a) => a.id === asesmenId);
    let totalScore = 0;

    // Automatic grading for Pilihan Ganda & Kotak Centang
    if (targetAsesmen) {
      jawaban.forEach((jwb) => {
        const soal = targetAsesmen.soalList.find((s) => s.id === jwb.soalId);
        if (!soal) return;

        if (soal.tipe === 'PILIHAN_GANDA') {
          const selected = jwb.jawabanOpsiIds?.[0];
          const correct = soal.kunciJawaban?.[0];
          if (selected && correct && selected === correct) {
            jwb.nilaiDidapat = soal.poin;
            totalScore += soal.poin;
          } else {
            jwb.nilaiDidapat = 0;
          }
        } else if (soal.tipe === 'KOTAK_CENTANG') {
          const selectedSet = new Set(jwb.jawabanOpsiIds || []);
          const correctSet = new Set(soal.kunciJawaban || []);
          const isExact =
            selectedSet.size === correctSet.size &&
            [...selectedSet].every((id) => correctSet.has(id));

          if (isExact) {
            jwb.nilaiDidapat = soal.poin;
            totalScore += soal.poin;
          } else {
            let matched = 0;
            selectedSet.forEach((id) => {
              if (correctSet.has(id)) matched++;
            });
            const partial = Math.round((matched / Math.max(correctSet.size, 1)) * (soal.poin * 0.7));
            jwb.nilaiDidapat = partial;
            totalScore += partial;
          }
        } else if (soal.tipe === 'ESSAY') {
          const essayScore = jwb.jawabanEssay && jwb.jawabanEssay.length > 20 ? Math.round(soal.poin * 0.85) : Math.round(soal.poin * 0.5);
          jwb.nilaiDidapat = essayScore;
          totalScore += essayScore;
        }
      });
    }

    const newJawaban: JawabanSiswa = {
      id: `jwb-${Date.now()}`,
      asesmenId,
      siswaId,
      waktuSubmit: new Date().toISOString(),
      jawabanList: jawaban,
      totalNilai: Math.min(100, totalScore),
      status: 'GRADED',
    };

    setJawabanList((prev) => {
      const filtered = prev.filter((j) => !(j.asesmenId === asesmenId && j.siswaId === siswaId));
      return [newJawaban, ...filtered];
    });

    return newJawaban;
  };

  const generateNilai = (asesmenId: string) => {
    const asesmen = asesmenList.find((a) => a.id === asesmenId);
    if (!asesmen) return [];

    const submissions = jawabanList.filter((j) => j.asesmenId === asesmenId);
    const kelas = kelasList.find((k) => k.id === asesmen.kelasId);
    const kelasNama = kelas ? kelas.judul : 'Kelas Umum';

    const newRekap: NilaiRekap[] = submissions.map((sub) => {
      const student = users.find((u) => u.id === sub.siswaId);
      return {
        id: `nr-${sub.id}-${Date.now()}`,
        asesmenId,
        siswaId: sub.siswaId,
        namaSiswa: student ? student.nama : 'Siswa CNC',
        kelasJurusan: student?.jurusanAsal || kelasNama,
        mapel: asesmen.mapel,
        email: student ? student.email : '-',
        nilai: sub.totalNilai,
        tanggalGenerate: new Date().toISOString(),
      };
    });

    setNilaiRekapList((prev) => {
      const rest = prev.filter((r) => r.asesmenId !== asesmenId);
      return [...newRekap, ...rest];
    });

    return newRekap;
  };

  // Generator nilai permapel + perkelas + perjurusan
  const generateNilaiPerFilter = (mapelFilter?: string, kelasIdFilter?: string, jurusanFilter?: string) => {
    let matchedAsesmens = asesmenList;
    if (mapelFilter) {
      matchedAsesmens = matchedAsesmens.filter((a) => a.mapel.toLowerCase().includes(mapelFilter.toLowerCase()));
    }
    if (kelasIdFilter) {
      matchedAsesmens = matchedAsesmens.filter((a) => a.kelasId === kelasIdFilter);
    }

    const compiled: NilaiRekap[] = [];
    matchedAsesmens.forEach((a) => {
      const submissions = jawabanList.filter((j) => j.asesmenId === a.id);
      const kelas = kelasList.find((k) => k.id === a.kelasId);
      const kelasNama = kelas ? kelas.judul : 'Kelas Umum';

      submissions.forEach((sub) => {
        const student = users.find((u) => u.id === sub.siswaId);
        if (jurusanFilter && student?.jurusanAsal !== jurusanFilter) return;

        compiled.push({
          id: `nr-gen-${a.id}-${sub.siswaId}`,
          asesmenId: a.id,
          siswaId: sub.siswaId,
          namaSiswa: student ? student.nama : 'Siswa CNC',
          kelasJurusan: student?.jurusanAsal || kelasNama,
          mapel: a.mapel,
          email: student ? student.email : '-',
          nilai: sub.totalNilai,
          tanggalGenerate: new Date().toISOString(),
        });
      });
    });

    // Merge into state
    if (compiled.length > 0) {
      setNilaiRekapList((prev) => {
        const existingIds = new Set(compiled.map((c) => `${c.asesmenId}-${c.siswaId}`));
        const filtered = prev.filter((p) => !existingIds.has(`${p.asesmenId}-${p.siswaId}`));
        return [...compiled, ...filtered];
      });
    }

    return compiled;
  };

  const deleteNilaiRekap = (id: string) => {
    setNilaiRekapList((prev) => prev.filter((r) => r.id !== id));
  };

  const exportNilaiFiltered = (filteredRows: NilaiRekap[], titleLabel: string = 'Rekap_Nilai_CNC') => {
    if (filteredRows.length === 0) {
      alert('Tidak ada data nilai yang sesuai dengan filter untuk diekspor.');
      return;
    }

    const headers = ['No', 'Nama Siswa', 'Kelas & Jurusan', 'Mata Pelajaran', 'Email', 'Nilai Akhir', 'Tanggal Generate'];
    const csvContent = [
      headers.join(';'),
      ...filteredRows.map((r, idx) =>
        [
          idx + 1,
          `"${r.namaSiswa.replace(/"/g, '""')}"`,
          `"${r.kelasJurusan.replace(/"/g, '""')}"`,
          `"${r.mapel.replace(/"/g, '""')}"`,
          `"${r.email.replace(/"/g, '""')}"`,
          r.nilai,
          `"${new Date(r.tanggalGenerate).toLocaleString('id-ID')}"`,
        ].join(';')
      ),
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = titleLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('href', url);
    link.setAttribute('download', `${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (asesmenId: string) => {
    const asesmen = asesmenList.find((a) => a.id === asesmenId);
    let rows = nilaiRekapList.filter((r) => r.asesmenId === asesmenId);

    if (rows.length === 0) {
      rows = generateNilai(asesmenId);
    }

    exportNilaiFiltered(rows, `Rekap_Nilai_${asesmen?.judul || 'Asesmen'}`);
  };

  // Kurikulum & Mata Pelajaran CRUD
  const addMapel = (data: Omit<MataPelajaran, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMapel: MataPelajaran = {
      ...data,
      id: `mapel-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMapelList((prev) => [newMapel, ...prev]);
    return newMapel;
  };

  const updateMapel = (id: string, data: Partial<MataPelajaran>) => {
    setMapelList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m))
    );
  };

  const deleteMapel = (id: string) => {
    setMapelList((prev) => prev.filter((m) => m.id !== id));
  };

  const resetToInitialData = () => {
    localStorage.removeItem('cnc_app_users');
    localStorage.removeItem('cnc_app_kelas');
    localStorage.removeItem('cnc_app_pengumuman');
    localStorage.removeItem('cnc_app_materi');
    localStorage.removeItem('cnc_app_tugas');
    localStorage.removeItem('cnc_app_asesmen');
    localStorage.removeItem('cnc_app_jawaban');
    localStorage.removeItem('cnc_app_nilaiRekap');
    localStorage.removeItem('cnc_app_mapel');
    setUsers(INITIAL_USERS);
    setKelasList(INITIAL_KELAS);
    setPengumumanList(INITIAL_PENGUMUMAN);
    setMateriList(INITIAL_MATERI);
    setTugasList(INITIAL_TUGAS);
    setAsesmenList(INITIAL_ASESMEN);
    setJawabanList(INITIAL_JAWABAN);
    setNilaiRekapList(INITIAL_NILAI_REKAP);
    setMapelList(INITIAL_MAPEL);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentView,
        setCurrentView,
        activeNavTab,
        setActiveNavTab,
        selectedKelasId,
        setSelectedKelasId,
        selectedAsesmenId,
        setSelectedAsesmenId,
        isTakingAsesmen,
        setIsTakingAsesmen,
        isDbDocsOpen,
        setIsDbDocsOpen,
        viewingProfileUser,
        setViewingProfileUser,
        login,
        quickLogin,
        logout,
        updateCurrentUserProfile,
        users,
        addUser,
        updateUser,
        deleteUser,
        kelasList,
        createKelas,
        updateKelas,
        deleteKelas,
        addSiswaToKelas,
        removeSiswaFromKelas,
        pengumumanList,
        addPengumuman,
        updatePengumuman,
        deletePengumuman,
        addKomentar,
        deleteKomentar,
        materiList,
        addMateri,
        updateMateri,
        deleteMateri,
        tugasList,
        addTugas,
        updateTugas,
        deleteTugas,
        submitTugas,
        gradeTugasSubmission,
        asesmenList,
        createAsesmen,
        updateAsesmen,
        deleteAsesmen,
        addSoal,
        updateSoal,
        deleteSoal,
        jawabanList,
        submitJawaban,
        nilaiRekapList,
        generateNilai,
        generateNilaiPerFilter,
        deleteNilaiRekap,
        exportToExcel,
        exportNilaiFiltered,
        mapelList,
        addMapel,
        updateMapel,
        deleteMapel,
        resetToInitialData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
