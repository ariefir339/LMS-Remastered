import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { PersonalBranding } from './components/PersonalBranding';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { DatabaseDocsModal } from './components/DatabaseDocsModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GuruDashboard } from './components/guru/GuruDashboard';
import { SiswaDashboard } from './components/siswa/SiswaDashboard';
import { KepsekDashboard } from './components/kepsek/KepsekDashboard';
import { KurikulumDashboard } from './components/kurikulum/KurikulumDashboard';

const MainContent: React.FC = () => {
  const { currentView, currentUser } = useApp();

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-slate-800 flex flex-col antialiased selection:bg-[#069494] selection:text-white">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'LANDING' && <PersonalBranding />}

        {currentView === 'DASHBOARD' && (
          <div className="animate-fadeIn">
            {currentUser?.role === 'ADMIN' && <AdminDashboard />}
            {currentUser?.role === 'GURU' && <GuruDashboard />}
            {currentUser?.role === 'SISWA' && <SiswaDashboard />}
            {currentUser?.role === 'KEPSEK' && <KepsekDashboard />}
            {currentUser?.role === 'KURIKULUM' && <KurikulumDashboard />}
            {!currentUser && (
              <div className="p-10 text-center bg-white border border-slate-200 shadow-sm rounded-2xl">
                <p className="text-slate-500 font-medium">
                  Silakan login terlebih dahulu untuk mengakses sistem LMS CNC.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <ProfileModal />
      <DatabaseDocsModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
