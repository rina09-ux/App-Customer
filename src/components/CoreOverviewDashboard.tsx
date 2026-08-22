import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, ArrowUpRight, CheckCircle2, DollarSign, Gem, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { getCoreApiUrl } from '../lib/coreApi';

interface OverviewDashboardProps {
  onNavigateToBilling: () => void;
  onNavigateToAnalytics?: () => void;
  onUpgrade?: (...args: any[]) => void;
  onOpenAiAssistant?: () => void;
  showToast?: (msg: string) => void;
}

interface CommandCenter {
  status: string;
  latest_scan?: { id: number; finished_at?: string | null; status?: string } | null;
  security?: { score?: number; finding_count?: number; by_severity?: Record<string, number> };
  operational?: { open_remediation?: number; active_risk_exceptions?: number; exceptions_expiring_30d?: number; evidence_objects?: number; pqc_assets?: number };
  top_actions?: Array<{ id: string | number; title: string; severity?: string; status?: string; due_at?: string | null }>;
  trend?: Array<{ recorded_at: string; asset_count: number; finding_count: number; posture_summary?: any }>;
}

const CORE = getCoreApiUrl();

export const CoreOverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigateToBilling, onNavigateToAnalytics, showToast = () => {} }) => {
  const [data, setData] = useState<CommandCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<'7d' | '30d' | '8m'>('30d');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${CORE}/api/v1/product-experience/command-center`, { credentials: 'include', headers: { Accept: 'application/json' } });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof body?.detail === 'string' ? body.detail : `Core request failed (${response.status})`);
      setData(body);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat command center dari NusaSec-Core.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visibleTrend = useMemo(() => {
    const trend = data?.trend || [];
    if (range === '8m') return trend;
    const n = range === '30d' ? 8 : 4;
    return trend.slice(-n);
  }, [data, range]);

  const maxFinding = Math.max(1, ...visibleTrend.map((x) => x.finding_count || 0));
  const severity = data?.security?.by_severity || {};

  return (
    <div id="overview-dashboard" className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Cyber Defense Command Center</h1>
            <span className="ds-pill ds-pill-success"><span className="ds-live-dot" />{data?.status || 'CONNECTING'}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">KPI dan posture berikut berasal dari tenant Anda di NusaSec-Core, bukan data demo global.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs font-medium">
            {(['7d', '30d', '8m'] as const).map((value) => <button key={value} onClick={() => setRange(value)} className={`px-2.5 py-1 rounded-lg ${range === value ? 'bg-slate-900 dark:bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}>{value}</button>)}
          </div>
          <button onClick={() => void load()} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
          <button onClick={onNavigateToBilling} className="ds-cta-shimmer px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm shadow-blue-500/30"><Gem className="w-3.5 h-3.5" /> Kelola Paket</button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 p-4 text-sm">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Security Score', value: `${data?.security?.score ?? '—'}`, suffix: '/100', icon: ShieldCheck, cls: 'text-emerald-600' },
          { label: 'Temuan Aktif', value: `${data?.security?.finding_count ?? 0}`, suffix: 'item', icon: AlertTriangle, cls: 'text-rose-600' },
          { label: 'Open Remediation', value: `${data?.operational?.open_remediation ?? 0}`, suffix: 'item', icon: CheckCircle2, cls: 'text-amber-600' },
          { label: 'Aset PQC', value: `${data?.operational?.pqc_assets ?? 0}`, suffix: 'asset', icon: Activity, cls: 'text-blue-600' },
        ].map((card) => { const Icon = card.icon; return <div key={card.label} className="ds-card-hover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><div className="flex items-center justify-between"><span className="text-xs text-slate-500">{card.label}</span><span className="w-8 h-8 rounded-lg bg-slate-100/80 dark:bg-slate-800 flex items-center justify-center"><Icon className={`w-4 h-4 ${card.cls}`} /></span></div><div className="mt-3 flex items-baseline gap-1"><span className="text-2xl font-extrabold text-slate-900 dark:text-white">{card.value}</span><span className="text-xs text-slate-400">{card.suffix}</span></div></div>; })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="ds-card-hover lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4"><div><h3 className="font-bold text-slate-900 dark:text-white">Trend Security Findings</h3><p className="text-xs text-slate-500">Dari MetricSnapshot Core.</p></div><button onClick={onNavigateToAnalytics} className="text-xs text-blue-600 font-semibold">Lihat Analytics →</button></div>
          <div className="h-64 flex items-end gap-2 overflow-x-auto">
            {visibleTrend.length ? visibleTrend.map((row, index) => { const h = Math.max(6, Math.round(((row.finding_count || 0) / maxFinding) * 100)); return <div key={`${row.recorded_at}-${index}`} className="min-w-12 flex-1 flex flex-col justify-end items-center gap-2"><div className="w-full max-w-10 rounded-t-lg bg-blue-600" style={{ height: `${h}%` }} title={`${row.finding_count} findings`} /><span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(row.recorded_at).toLocaleDateString()}</span></div>; }) : <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">Belum ada snapshot telemetry.</div>}
          </div>
        </div>

        <div className="ds-card-hover bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Severity Breakdown</h3>
          <div className="space-y-3">{[['CRITICAL', 'bg-rose-600'], ['HIGH', 'bg-amber-500'], ['MEDIUM', 'bg-blue-500'], ['LOW', 'bg-slate-400']].map(([name, color]) => <div key={name} className="flex items-center gap-3"><span className={`w-2.5 h-2.5 rounded-full ${color}`} /><span className="text-xs text-slate-500 flex-1">{name}</span><span className="font-bold text-sm text-slate-900 dark:text-white">{severity[name] || 0}</span></div>)}</div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">Latest scan: {data?.latest_scan ? new Date(data.latest_scan.finished_at || Date.now()).toLocaleString() : 'Belum ada scan'}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-slate-900 dark:text-white">Top Actions</h3><span className="text-xs text-slate-400">Core Action Center</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{(data?.top_actions || []).slice(0, 6).map((action) => <div key={String(action.id)} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3"><div className="text-sm font-semibold text-slate-900 dark:text-white">{action.title}</div><div className="mt-2 flex items-center justify-between text-[11px] text-slate-400"><span>{action.severity || 'MEDIUM'}</span><span>{action.status || 'OPEN'}</span></div></div>)}</div>
        {!(data?.top_actions || []).length && <div className="text-sm text-slate-400 py-6 text-center">Tidak ada action terbuka.</div>}
      </div>
    </div>
  );
};
