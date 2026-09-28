import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Shield,
  GraduationCap,
  Users,
  Award,
  BookOpen,
  Mail,
  Lock,
  Key,
  ArrowRight,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { currentView, setCurrentView, login, quickLogin, users } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [email, setEmail] = useState('');
  const [credential, setCredential] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (currentView !== 'LOGIN') return null;

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    setEmail('');
    setCredential('');
  };

  const handleAutoFill = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    if (role === 'ADMIN') {
      setEmail('admin@cnc.sch.id');
      setCredential('password123');
    } else if (role === 'GURU') {
      setEmail('budi.santoso@guru.cnc.sch.id');
      setCredential('198501012010011001');
    } else if (role === 'SISWA') {
      setEmail('ahmad.fauzan@siswa.cnc.sch.id');
      setCredential('0061234561');
    } else if (role === 'KEPSEK') {
      setEmail('kepsek@cnc.sch.id');
      setCredential('196803151994121001');
    } else if (role === 'KURIKULUM') {
      setEmail('kurikulum@cnc.sch.id');
      setCredential('198205102008012005');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Email wajib diisi.');
      return;
    }
    if (!credential.trim()) {
      const fieldName = selectedRole === 'ADMIN' ? 'Password' : selectedRole === 'SISWA' ? 'NIS / NISN' : 'NIK';
      setErrorMsg(`${fieldName} wajib diisi.`);
      return;
    }

    const res = login(selectedRole, email, credential);
    if (!res.success) {
      setErrorMsg(res.message || 'Login gagal, periksa data akun Anda.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={() => setCurrentView('LANDING')}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#069494] text-white shadow-md shadow-[#069494]/20 mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Masuk CNC Education Nexus
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pilih peran Anda untuk masuk ke dashboard portal
          </p>
        </div>

        {/* Role Selector Tabs (5 Roles from spec) */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl mb-5">
          {[
            { role: 'ADMIN' as UserRole, label: 'Admin', icon: Shield },
            { role: 'GURU' as UserRole, label: 'Guru', icon: GraduationCap },
            { role: 'SISWA' as UserRole, label: 'Siswa', icon: Users },
            { role: 'KEPSEK' as UserRole, label: 'Kepsek', icon: Award },
            { role: 'KURIKULUM' as UserRole, label: 'Kurikulum', icon: BookOpen },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRole === item.role;
            return (
              <button
                key={item.role}
                type="button"
                onClick={() => handleRoleChange(item.role)}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  isSelected
                    ? item.role === 'SISWA'
                      ? 'bg-[#FF69B4] text-white shadow-xs'
                      : 'bg-[#069494] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[10px] leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Akun
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="nama@cnc.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                {selectedRole === 'ADMIN'
                  ? 'Password Akun'
                  : selectedRole === 'SISWA'
                  ? 'NIS / NISN Siswa'
                  : 'NIK Guru / Pegawai'}
              </label>
              <span className="text-[10px] font-mono font-semibold text-[#069494]">
                {selectedRole === 'ADMIN' ? 'Email & Password' : selectedRole === 'SISWA' ? 'Email & NISN' : 'Email & NIK'}
              </span>
            </div>
            <div className="relative">
              {selectedRole === 'ADMIN' ? (
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              ) : (
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              )}
              <input
                type={selectedRole === 'ADMIN' ? 'password' : 'text'}
                required
                placeholder={
                  selectedRole === 'ADMIN'
                    ? 'Masukkan password'
                    : selectedRole === 'SISWA'
                    ? 'Nomor Induk Siswa (NISN)'
                    : 'Nomor Induk Kependudukan (NIK)'
                }
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#069494] focus:bg-white font-mono transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'SISWA'
                ? 'bg-[#FF69B4] hover:bg-[#fa52a3] shadow-pink-500/25'
                : 'bg-[#069494] hover:bg-[#057c7c] shadow-[#069494]/25'
            }`}
          >
            <span>Masuk sebagai {selectedRole}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Autofill */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 mb-2">
            Klik untuk auto-fill akun demo resmi:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => handleAutoFill('ADMIN')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors"
            >
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => handleAutoFill('GURU')}
              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#069494] text-[10px] font-bold transition-colors"
            >
              Demo Guru
            </button>
            <button
              type="button"
              onClick={() => handleAutoFill('SISWA')}
              className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-[#FF69B4] text-[10px] font-bold transition-colors"
            >
              Demo Siswa
            </button>
            <button
              type="button"
              onClick={() => handleAutoFill('KEPSEK')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors"
            >
              Demo Kepsek
            </button>
            <button
              type="button"
              onClick={() => handleAutoFill('KURIKULUM')}
              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#069494] text-[10px] font-bold transition-colors"
            >
              Demo Kurikulum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
