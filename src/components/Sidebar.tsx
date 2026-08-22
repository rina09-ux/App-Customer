import React, { useEffect, useState } from 'react';
import { Search, LayoutGrid, ShoppingBag, CheckSquare, BarChart3, Bell, Cloud, ShieldAlert, GitFork, Fingerprint, FileCheck2, FileText, BookOpen, PieChart, Database, Atom, Binary, Code2, Package, Github, CreditCard, Building2, Settings } from 'lucide-react';
import { NavigationSection } from '../types';
import { getCoreApiUrl } from '../lib/coreApi';
import { useAuth } from '../context/AuthContext';

interface SidebarProps { currentSection: NavigationSection; onSelectSection: (section: NavigationSection) => void; onOpenSearch: () => void; searchQuery?: string; onAddNewTeam?: () => void; }

export const Sidebar: React.FC<SidebarProps> = ({ currentSection, onSelectSection, onOpenSearch }) => {
  const { user } = useAuth();
  const [tenantLabel, setTenantLabel] = useState(user?.tenant_id || 'customer');
  const [actionBadge, setActionBadge] = useState<string>('');
  const [riskBadge, setRiskBadge] = useState<string>('');
  const [complianceBadge, setComplianceBadge] = useState<string>('');
  const [unreadBadge, setUnreadBadge] = useState<string>('');

  useEffect(() => {
    setTenantLabel(user?.tenant_id || 'customer');
    const base = getCoreApiUrl();
    const load = async () => {
      try {
        const [cc, notif, comp, org] = await Promise.all([
          fetch(`${base}/api/v1/product-experience/command-center`, { credentials: 'include' }).then(r => r.ok ? r.json() : null),
          fetch(`${base}/api/v1/product-experience/notifications?unread_only=true`, { credentials: 'include' }).then(r => r.ok ? r.json() : null),
          fetch(`${base}/api/v1/product-experience/compliance?framework=POJK`, { credentials: 'include' }).then(r => r.ok ? r.json() : null),
          fetch(`${base}/api/v1/commercial/organization`, { credentials: 'include' }).then(r => r.ok ? r.json() : null),
        ]);
        if (org?.organization?.legal_name) setTenantLabel(org.organization.legal_name);
        if (cc?.security) {
          const open = Number(cc?.security?.finding_count || 0);
          setRiskBadge(open > 0 ? `${open} CVSS` : '');
        }
        if (cc?.operational) {
          const open = Number(cc?.operational?.open_remediation || 0);
          setActionBadge(open > 0 ? `${open} New` : '');
        }
        const unread = Array.isArray(notif?.items) ? notif.items.length : 0;
        setUnreadBadge(unread > 0 ? `${unread}` : '');
        const score = comp?.assessment?.compliance_score;
        setComplianceBadge(Number.isFinite(Number(score)) ? `${Number(score).toFixed(1)}%` : '');
      } catch {
        // Navigation must remain usable even if auxiliary badge calls fail.
      }
    };
    void load();
  }, [user?.tenant_id]);

  const navigationGroups = [
    { group: 'MARKETPLACE', items: [{ id: 'marketplace' as NavigationSection, label: 'All Services', icon: ShoppingBag, badge: 'Catalog' }] },
    { group: 'DASHBOARD', items: [
      { id: 'overview' as NavigationSection, label: 'Overview', icon: LayoutGrid },
      { id: 'action-center' as NavigationSection, label: 'Action Center', icon: CheckSquare, badge: actionBadge },
      { id: 'analytics' as NavigationSection, label: 'Analytics', icon: BarChart3 },
      { id: 'notifications' as NavigationSection, label: 'Notifications', icon: Bell, badge: unreadBadge }
    ] },
    { group: 'SECURITY (NusaSec Secure)', items: [
      { id: 'assets-cloud' as NavigationSection, label: 'Assets & Cloud', icon: Cloud },
      { id: 'risk-exposure' as NavigationSection, label: 'Risk & Exposure', icon: ShieldAlert, badge: riskBadge },
      { id: 'attack-paths' as NavigationSection, label: 'Attack Paths', icon: GitFork },
      { id: 'identity' as NavigationSection, label: 'Identity', icon: Fingerprint }
    ] },
    { group: 'TRUST (NusaSec Trust)', items: [
      { id: 'compliance' as NavigationSection, label: 'Compliance', icon: FileCheck2, badge: complianceBadge },
      { id: 'evidence' as NavigationSection, label: 'Evidence', icon: FileText },
      { id: 'regulatory' as NavigationSection, label: 'Regulatory', icon: BookOpen },
      { id: 'reports' as NavigationSection, label: 'Reports', icon: PieChart }
    ] },
    { group: 'DATA INTELLIGENCE', items: [{ id: 'data-explorer' as NavigationSection, label: 'Data Explorer', icon: Database }] },
    { group: 'QUANTUM (NusaSec Quantum)', items: [
      { id: 'pqc-readiness' as NavigationSection, label: 'PQC Readiness', icon: Atom, badge: 'NIST PQC' },
      { id: 'migration-center' as NavigationSection, label: 'Migration Center', icon: Binary }
    ] },
    { group: 'DEVELOPER', items: [
      { id: 'pqc-api' as NavigationSection, label: 'PQC API', icon: Code2 },
      { id: 'pqc-sdk' as NavigationSection, label: 'PQC SDK', icon: Package },
      { id: 'github-connect' as NavigationSection, label: 'GitHub Connect', icon: Github }
    ] },
    { group: 'COMMERCIAL & ACCOUNT', items: [
      { id: 'billing' as NavigationSection, label: 'Billing & Usage', icon: CreditCard },
      { id: 'organization' as NavigationSection, label: 'Organization (RBAC)', icon: Building2 },
      { id: 'settings' as NavigationSection, label: 'Settings', icon: Settings }
    ] }
  ];

  return (
    <div id="sidebar-panel" className="w-64 ns-sidebar flex flex-col h-full py-4 px-3 select-none shrink-0 transition-colors duration-200">
      <div className="px-3 pb-3 mb-2 ns-sidebar-header flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg ds-primary ds-cta-shimmer flex items-center justify-center font-bold text-[11px] shadow-2xs">N</div><div><div className="text-xs font-bold ds-title tracking-tight flex items-center gap-1.5"><span>NusaSec Core</span><span className="ds-live-dot text-emerald-500" /></div><p className="text-[10px] ds-muted font-mono truncate max-w-[190px]">Tenant: {tenantLabel}</p></div></div></div>
      <div className="px-1 mb-3"><button id="sidebar-search-btn" onClick={onOpenSearch} className="ds-secondary w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-all group shadow-[0_1px_2px_rgba(0,0,0,0.02)]"><div className="flex items-center gap-2"><Search className="w-3.5 h-3.5 ds-muted transition-colors"/><span className="ds-body text-[13px]">Search</span></div><kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium ds-muted bg-transparent border border-slate-300 dark:border-slate-700 rounded shadow-xs">⌘ K</kbd></button></div>
      <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">{navigationGroups.map((group,gIdx)=><div key={gIdx} className="space-y-1"><div className="px-3 mb-1.5 ds-eyebrow">{group.group}</div><div className="space-y-0.5">{group.items.map(item=>{const Icon=item.icon;const isActive=currentSection===item.id||(item.id==='organization'&&currentSection==='members')||(item.id==='settings'&&currentSection==='preference');return <button key={item.id} id={`nav-item-${item.id}`} onClick={()=>onSelectSection(item.id)} aria-current={isActive?'page':undefined} data-active={isActive?'true':undefined} className={`ds-nav-item w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors ${isActive?'font-semibold shadow-xs':''}`}><div className="flex items-center gap-2.5 min-w-0"><Icon className="w-4 h-4 shrink-0 stroke-[1.9]"/><span className="truncate">{item.label}</span></div>{item.badge&&<span className={`ds-badge shrink-0 font-mono ${isActive?'bg-white/20 text-white border border-white/15':'ds-secondary'}`}>{item.badge}</span>}</button>})}</div></div>)}</div>
    </div>
  );
};
