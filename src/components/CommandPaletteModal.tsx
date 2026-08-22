import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Gem,
  Bell,
  Layers,
  BarChart3,
  Moon,
  Sun,
  Laptop,
  ShoppingBag,
  CheckSquare,
  Cloud,
  ShieldAlert,
  FileCheck2,
  Atom,
  GitFork,
  Fingerprint,
  FileText,
  BookOpen,
  PieChart,
  Database,
  Binary,
  Code2,
  Package,
  Github,
  Palette,
  Building2,
  ArrowRight
} from 'lucide-react';
import { NavigationSection } from '../types';
import { useTheme } from '../context/ThemeContext';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (section: NavigationSection) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectSection
}) => {
  const [query, setQuery] = useState('');
  const { setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigate = (section: NavigationSection) => {
    onSelectSection(section);
    onClose();
  };

  const searchableItems: Array<{
    id: string;
    title: string;
    category: string;
    icon: React.ElementType;
    action: () => void;
  }> = [
    { id: 'theme-dark', title: 'Tema: Beralih ke Mode Gelap (Dark Mode)', category: 'Tampilan & Tema', icon: Moon, action: () => { setTheme('dark'); onClose(); } },
    { id: 'theme-light', title: 'Tema: Beralih ke Mode Terang (Light Mode)', category: 'Tampilan & Tema', icon: Sun, action: () => { setTheme('light'); onClose(); } },
    { id: 'theme-system', title: 'Tema: Ikuti Pengaturan Sistem (Auto Sync)', category: 'Tampilan & Tema', icon: Laptop, action: () => { setTheme('system'); onClose(); } },
    { id: 'overview', title: 'Overview Dashboard (Metrik & Statistik SOC)', category: 'Dashboard', icon: Layers, action: () => navigate('overview') },
    { id: 'analytics', title: 'Analytics & Telemetri (Tren Serangan & PQC)', category: 'Dashboard', icon: BarChart3, action: () => navigate('analytics') },
    { id: 'action-center', title: 'Action Center (Tindakan Keamanan Prioritas)', category: 'Dashboard', icon: CheckSquare, action: () => navigate('action-center') },
    { id: 'notifications', title: 'Notifications (Log Peringatan Keamanan)', category: 'Dashboard', icon: Bell, action: () => navigate('notifications') },
    { id: 'marketplace', title: 'All Services Catalog (Marketplace Layanan)', category: 'Marketplace', icon: ShoppingBag, action: () => navigate('marketplace') },
    { id: 'assets-cloud', title: 'Assets & Cloud (Multi-Cloud Inventory & Kube)', category: 'Security', icon: Cloud, action: () => navigate('assets-cloud') },
    { id: 'risk-exposure', title: 'Risk & Exposure (Analisis CVE & Posture)', category: 'Security', icon: ShieldAlert, action: () => navigate('risk-exposure') },
    { id: 'attack-paths', title: 'Attack Paths (Jalur Serangan & Lateral Movement)', category: 'Security', icon: GitFork, action: () => navigate('attack-paths') },
    { id: 'identity', title: 'Identity (IAM, Access & Authentication)', category: 'Security', icon: Fingerprint, action: () => navigate('identity') },
    { id: 'compliance', title: 'Compliance & Trust (SOC 2, ISO 27001, BSSN)', category: 'Trust', icon: FileCheck2, action: () => navigate('compliance') },
    { id: 'evidence', title: 'Evidence (Bukti Audit & Control Evidence)', category: 'Trust', icon: FileText, action: () => navigate('evidence') },
    { id: 'regulatory', title: 'Regulatory Intelligence (Regulasi & Advisory)', category: 'Trust', icon: BookOpen, action: () => navigate('regulatory') },
    { id: 'reports', title: 'Reports (Laporan Security, Trust & PQC)', category: 'Trust', icon: PieChart, action: () => navigate('reports') },
    { id: 'data-explorer', title: 'Data Explorer (Query & Core Data)', category: 'Data Intelligence', icon: Database, action: () => navigate('data-explorer') },
    { id: 'pqc-readiness', title: 'PQC Readiness (Post-Quantum Cryptography)', category: 'Quantum', icon: Atom, action: () => navigate('pqc-readiness') },
    { id: 'migration-center', title: 'Migration Center (PQC Migration Planning)', category: 'Quantum', icon: Binary, action: () => navigate('migration-center') },
    { id: 'pqc-api', title: 'PQC API (Developer API Keys & Telemetry)', category: 'Developer', icon: Code2, action: () => navigate('pqc-api') },
    { id: 'pqc-sdk', title: 'PQC SDK (Packages & Integration Guides)', category: 'Developer', icon: Package, action: () => navigate('pqc-sdk') },
    { id: 'github-connect', title: 'GitHub Connect (Repository Integration)', category: 'Developer', icon: Github, action: () => navigate('github-connect') },
    { id: 'billing', title: 'Billing & Plan (Pilihan Paket, Stripe & Xendit)', category: 'Commercial', icon: Gem, action: () => navigate('billing') },
    { id: 'organization', title: 'Organization (RBAC & Members)', category: 'Account', icon: Building2, action: () => navigate('organization') },
    { id: 'settings', title: 'Settings (Konfigurasi Tenant & Global Theme)', category: 'Account', icon: Palette, action: () => navigate('settings') }
  ];

  const filtered = searchableItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="ds-overlay fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="ds-dialog rounded-2xl max-w-lg w-full overflow-hidden transition-colors">
        <div className="p-3.5 border-b border-[var(--ds-border)] flex items-center gap-3">
          <Search className="w-5 h-5 ds-muted" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik navigasi, aksi, atau 'dark' / 'light' untuk tema..."
            className="ds-control !min-h-0 flex-1 !border-0 !bg-transparent !rounded-none text-sm !px-0 !py-0"
          />
          <button onClick={onClose} className="ds-secondary !min-h-0 !w-8 !px-0 rounded-lg border-0 bg-transparent" aria-label="Tutup">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filtered.length > 0 ? filtered.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--ds-surface-alt)] text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--ds-surface-muted)] group-hover:bg-[var(--ds-surface)] border border-[var(--ds-border)] ds-body flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold ds-title block">{item.title}</span>
                    <span className="text-[10px] ds-muted uppercase tracking-wider">{item.category}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 ds-muted group-hover:ds-body" />
              </button>
            );
          }) : (
            <div className="py-8 text-center text-xs ds-muted">Tidak ada hasil untuk "{query}"</div>
          )}
        </div>
      </div>
    </div>
  );
};
