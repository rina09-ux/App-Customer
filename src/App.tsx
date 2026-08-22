import React, { useState, useEffect } from 'react';
import { IconRail } from './components/IconRail';
import { Sidebar } from './components/Sidebar';
import { BillingView } from './components/BillingView';
import { OverviewDashboard } from './components/OverviewDashboard';
import { AnalyticsView } from './components/AnalyticsView';
import { OtherViews } from './components/OtherViews';
import { CoreMarketplaceView } from './components/CoreMarketplaceView';
import { ActionCenterView } from './components/ActionCenterView';
import { CoreAssetsCloudView } from './components/CoreAssetsCloudView';
import { RiskExposureView } from './components/RiskExposureView';
import { AttackPathsView } from './components/AttackPathsView';
import { IdentityView } from './components/IdentityView';
import { ComplianceTrustView } from './components/ComplianceTrustView';
import { EvidenceView } from './components/EvidenceView';
import { RegulatoryIntelligenceView } from './components/RegulatoryIntelligenceView';
import { ReportsView } from './components/ReportsView';
import { DataExplorerView } from './components/DataExplorerView';
import { PqcReadinessView } from './components/PqcReadinessView';
import { MigrationCenterView } from './components/MigrationCenterView';
import { DeveloperApiView } from './components/DeveloperApiView';
import { DeveloperSdkView } from './components/DeveloperSdkView';
import { GithubConnectView } from './components/GithubConnectView';
import { OrganizationView } from './components/OrganizationView';
import { SettingsView } from './components/SettingsView';
import { AiAssistantModal } from './components/AiAssistantModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NUSASEC_PUBLIC_URL } from './config/platform';
import { NavigationSection } from './types';
import { Menu, X, CheckCircle2, Sparkles, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';

function CustomerAccessBlocked() {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen ns-app-canvas flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-7 text-center">
        <div className="font-semibold text-slate-900 dark:text-white">Customer workspace access is restricted</div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">This NusaSec-Core account is assigned to the internal operating plane.</p>
        <button onClick={() => void signOut()} className="mt-5 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white px-4 py-3 text-sm font-semibold">Sign out</button>
        <div className="text-[11px] text-slate-400 mt-3">{user?.email}</div>
      </div>
    </div>
  );
}

function MainAppContent() {
  const { loading, authenticated, user, signOut } = useAuth();
  const [currentSection, setCurrentSection] = useState<NavigationSection>('overview');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!loading && !authenticated) {
      window.location.assign(`${NUSASEC_PUBLIC_URL.replace(/\/$/, '')}/#login`);
    }
  }, [loading, authenticated]);

  if (loading) return <div className="min-h-screen ns-app-canvas flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">Connecting to NusaSec-Core…</div>;
  if (!authenticated) return <div className="min-h-screen ns-app-canvas flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">Redirecting to sign in…</div>;
  if (String(user?.user_type || '').toUpperCase() === 'INTERNAL') return <CustomerAccessBlocked />;

  const showToast = (msg: string) => { setToastMessage(msg); window.setTimeout(() => setToastMessage(null), 3500); };
  const handleUpgradePlan = () => setCurrentSection('billing');

  const renderActiveView = () => {
    switch (currentSection) {
      case 'marketplace': return <CoreMarketplaceView onNavigateToBilling={() => setCurrentSection('billing')} showToast={showToast} />;
      case 'action-center': return <ActionCenterView showToast={showToast} />;
      case 'notifications': return <OtherViews currentSection="notifications" onNavigateToBilling={() => setCurrentSection('billing')} showToast={showToast} />;
      case 'assets-cloud': return <CoreAssetsCloudView showToast={showToast} />;
      case 'risk-exposure': return <RiskExposureView showToast={showToast} />;
      case 'attack-paths': return <AttackPathsView showToast={showToast} />;
      case 'identity': return <IdentityView showToast={showToast} />;
      case 'compliance': return <ComplianceTrustView showToast={showToast} />;
      case 'evidence': return <EvidenceView showToast={showToast} />;
      case 'regulatory': return <RegulatoryIntelligenceView showToast={showToast} />;
      case 'reports': return <ReportsView showToast={showToast} />;
      case 'data-explorer': return <DataExplorerView showToast={showToast} />;
      case 'pqc-readiness': return <PqcReadinessView showToast={showToast} />;
      case 'migration-center': return <MigrationCenterView showToast={showToast} />;
      case 'pqc-api': return <DeveloperApiView showToast={showToast} />;
      case 'pqc-sdk': return <DeveloperSdkView showToast={showToast} />;
      case 'github-connect': return <GithubConnectView showToast={showToast} />;
      case 'organization':
      case 'members': return <OrganizationView showToast={showToast} />;
      case 'settings':
      case 'preference': return <SettingsView showToast={showToast} />;
      case 'analytics': return <AnalyticsView showToast={showToast} />;
      case 'billing': return <BillingView showToast={showToast} />;
      case 'overview':
      default: return <OverviewDashboard onNavigateToBilling={() => setCurrentSection('billing')} onNavigateToAnalytics={() => setCurrentSection('analytics')} onUpgrade={handleUpgradePlan} onOpenAiAssistant={() => setIsAiModalOpen(true)} showToast={showToast} />;
    }
  };

  return (
    <div className="h-screen w-screen flex ns-app-canvas overflow-hidden font-sans antialiased select-none transition-colors duration-200">
      {toastMessage && (
        <div id="app-toast" className="fixed top-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 dark:border-slate-600 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-1" aria-label="Tutup notifikasi"><X className="w-4 h-4" /></button>
        </div>
      )}
      <div className="flex-1 min-w-0 flex overflow-hidden ns-main-canvas transition-colors duration-200">
        <div className="hidden md:flex shrink-0"><IconRail currentSection={currentSection} onSelectSection={(sec) => { setCurrentSection(sec); setMobileSidebarOpen(false); }} onOpenNotifications={() => setCurrentSection('notifications')} /></div>
        <div className="hidden lg:flex shrink-0"><Sidebar currentSection={currentSection} onSelectSection={(sec) => { setCurrentSection(sec); setMobileSidebarOpen(false); }} onOpenSearch={() => setIsCommandPaletteOpen(true)} onAddNewTeam={() => { setCurrentSection('organization'); showToast('Buka formulir undangan untuk menambahkan anggota ke organisasi.'); }} /></div>
        <AnimatePresence>
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setMobileSidebarOpen(false)} />
              <motion.div id="mobile-sidebar-drawer" initial={{ x: '-100%', opacity: 0.7 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '-100%', opacity: 0 }} transition={{ type: 'spring', damping: 26, stiffness: 280 }} className="relative z-50 flex h-full bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
                <div className="relative flex flex-col h-full w-full min-w-0">
                  <Sidebar currentSection={currentSection} onSelectSection={(sec) => { setCurrentSection(sec); setMobileSidebarOpen(false); }} onOpenSearch={() => { setIsCommandPaletteOpen(true); setMobileSidebarOpen(false); }} />
                  <button onClick={() => setMobileSidebarOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Tutup Menu" aria-label="Tutup Menu"><X className="w-4 h-4" /></button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden ns-main-canvas transition-colors duration-200">
          <div className="lg:hidden h-14 ns-mobile-header border-b px-4 flex items-center justify-between shrink-0">
            <button id="mobile-hamburger-btn" onClick={() => setMobileSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Buka menu"><Menu className="w-5 h-5" /></button>
            <span className="font-bold text-sm text-slate-900 dark:text-white capitalize">{currentSection.replace('-', ' ')}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsAiModalOpen(true)} className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg" aria-label="Buka NusaSec AI"><Sparkles className="w-5 h-5" /></button>
              <button onClick={() => void signOut()} className="p-2 text-slate-500 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" aria-label="Sign out"><LogOut className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="ds-view-enter flex-1 min-h-0 overflow-auto" key={currentSection}>{renderActiveView()}</div>
        </div>
      </div>
      <AiAssistantModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
      <CommandPaletteModal isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onSelectSection={(sec) => setCurrentSection(sec)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
