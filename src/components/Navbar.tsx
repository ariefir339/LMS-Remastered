import React from 'react';
import { useApp } from '../context/AppContext';
import {
  School,
  Database,
  User as UserIcon,
  LogOut,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    logout,
    setIsDbDocsOpen,
    setViewingProfileUser,
    quickLogin,
    resetToInitialData,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('LANDING')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#069494] flex items-center justify-center shadow-md shadow-[#069494]/20 group-hover:scale-105 transition-transform">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#069494]">
                  CNC
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#FF69B4]/15 text-[#FF69B4] border border-[#FF69B4]/30">
                  Edu Nexus
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none hidden sm:block font-medium">
                Sistem Manajemen Kelas &amp; Asesmen
              </p>
            </div>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Figma Palette Color Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500" title="Tema Warna Sesuai Figma">
            <span className="text-[10px] font-semibold text-slate-400">Palette:</span>
            <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: '#FF69B4' }} title="#FF69B4 (Pink)" />
            <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: '#069494' }} title="#069494 (Teal)" />
            <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: '#FFFFFF' }} title="#FFFFFF (White)" />
          </div>

          {/* Database Architecture Docs button */}
          <button
            onClick={() => setIsDbDocsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100/80 text-[#069494] border border-[#069494]/30 shadow-xs transition-all"
            title="Buka Penjelasan Database & Prisma Schema"
          >
            <Database className="w-3.5 h-3.5 text-[#069494]" />
            <span className="hidden md:inline">Arsitektur DB &amp; Prisma</span>
            <span className="md:hidden">DB Docs</span>
          </button>

          {/* Quick Reset Demo Data */}
          <button
            onClick={() => {
              if (confirm('Reset ulang seluruh data simulasi ke seed data awal?')) {
                resetToInitialData();
                alert('Data berhasil di-reset ke kondisi awal!');
              }
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset Data Simulasi"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-slate-200">
              {/* Role Badge */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#069494]/10 border border-[#069494]/25 text-[#069494]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#069494] animate-pulse" />
                <span>{currentUser.role}</span>
              </div>

              {/* User Avatar & Profile trigger */}
              <button
                onClick={() => setViewingProfileUser(currentUser)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left group"
              >
                <img
                  src={currentUser.foto}
                  alt={currentUser.nama}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-300 group-hover:ring-[#069494] transition-all"
                />
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[110px]">
                    {currentUser.nama}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-none">Profil Saya</p>
                </div>
              </button>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-all"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('LOGIN')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#069494] hover:bg-[#058080] text-white shadow-md shadow-[#069494]/25 transition-all"
              >
                <span>Masuk Akun</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
