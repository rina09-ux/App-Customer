import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Download, FileText, Plus, RefreshCw } from 'lucide-react';
import { getCoreApiUrl } from '../lib/coreApi';

interface Schedule { id: number; report_type: string; frequency: string; recipients: string[]; enabled: boolean; next_run_at?: string | null; }
interface ReportArtifact { document_id: number; report_key: string; format: string; artifact_hash: string; created_at: string; }

export const CoreReportsView: React.FC<{ showToast?: (msg: string) => void }> = ({ showToast = () => {} }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [artifact, setArtifact] = useState<ReportArtifact | null>(null);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('Executive Security Summary');
  const [freq, setFreq] = useState('MONTHLY');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const request = async (path: string, init?: RequestInit) => {
    const r = await fetch(`${getCoreApiUrl()}${path}`, { credentials: 'include', ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
    const b = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(b?.detail || `Core request failed (${r.status})`);
    return b;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try { const b = await request('/api/v1/product-experience/reports/schedules'); setSchedules(b.items || []); }
    catch (e) { showToast(e instanceof Error ? e.message : 'Gagal memuat schedules.'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { void load(); }, [load]);

  const generate = async (reportKey: 'executive' | 'security' | 'pqc') => {
    setGenerating(reportKey);
    try {
      const b = await request('/api/v1/product-experience/reports/generate', { method: 'POST', body: JSON.stringify({ report_key: reportKey }) });
      setArtifact(b);
      showToast(`${reportKey.toUpperCase()} report berhasil dibuat sebagai PDF di Core.`);
    } catch (e) { showToast(e instanceof Error ? e.message : 'Generate report gagal.'); }
    finally { setGenerating(null); }
  };

  const downloadArtifact = async () => {
    if (!artifact) return;
    try {
      const r = await fetch(`${getCoreApiUrl()}/api/v1/product-experience/reports/documents/${artifact.document_id}/download`, { credentials: 'include' });
      if (!r.ok) throw new Error('Download report gagal.');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `nusasec-${artifact.report_key}.pdf`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e) { showToast(e instanceof Error ? e.message : 'Download report gagal.'); }
  };

  const createSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await request('/api/v1/product-experience/reports/schedules', { method: 'POST', body: JSON.stringify({ report_type: type, frequency: freq, recipients_json: [recipient] }) });
      showToast('Jadwal laporan disimpan di Core.'); setOpen(false); setRecipient(''); await load();
    } catch (e) { showToast(e instanceof Error ? e.message : 'Schedule gagal.'); }
  };

  return <div id="reports-view" className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
    <div className="flex flex-col sm:flex-row justify-between gap-3"><div><div className="text-[11px] uppercase font-bold tracking-wider text-slate-500 font-mono">NusaSec Authoritative Reporting</div><h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Security Reports &amp; Automated Schedules</h1><p className="text-xs sm:text-sm text-slate-500">Snapshot, PDF artifact, dan schedule berasal dari Core.</p></div><div className="flex gap-2"><button onClick={() => void load()} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><RefreshCw className={loading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'}/></button><button onClick={() => setOpen(true)} className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold flex gap-2"><Plus className="w-4 h-4"/> Tambah Jadwal</button></div></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[['Executive Security Summary','executive'],['Security Posture Audit','security'],['PQC Readiness Attestation','pqc']].map(([name,key])=><div key={key} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600"/><h3 className="font-bold text-slate-900 dark:text-white">{name}</h3></div><p className="text-xs text-slate-500">PDF artifact tenant-scoped dengan hash canonical.</p><button disabled={generating===key} onClick={()=>void generate(key as 'executive'|'security'|'pqc')} className="w-full py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold flex justify-center gap-2 disabled:opacity-50"><Download className="w-4 h-4"/>{generating===key?'Generating…':'Generate PDF'}</button></div>)}</div>
    {artifact&&<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h3 className="font-bold text-slate-900 dark:text-white">Generated PDF</h3><div className="text-xs text-slate-500 mt-1">{artifact.report_key} • SHA-256: <span className="font-mono break-all">{artifact.artifact_hash}</span></div></div><button onClick={()=>void downloadArtifact()} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold flex gap-2"><Download className="w-4 h-4"/> Download PDF</button></div></div>}
    <div className="space-y-3">{schedules.map(s=><div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><div className="font-semibold text-sm text-slate-900 dark:text-white">{s.report_type}</div><div className="text-xs text-slate-500">{s.frequency} • {(s.recipients||[]).join(', ')}</div></div><div className="flex items-center gap-2 text-xs"><span className={`px-2 py-1 rounded-lg ${s.enabled?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-500'}`}>{s.enabled?'ACTIVE':'PAUSED'}</span><Calendar className="w-4 h-4 text-blue-600"/></div></div>)}</div>
    {open&&<div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"><form onSubmit={createSchedule} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 space-y-4"><div className="flex justify-between"><h2 className="font-bold text-slate-900 dark:text-white">Tambah Jadwal</h2><button type="button" onClick={()=>setOpen(false)}>✕</button></div><select value={type} onChange={e=>setType(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-950"><option>Executive Security Summary</option><option>Security Posture Audit</option><option>PQC Readiness Attestation</option></select><select value={freq} onChange={e=>setFreq(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-950"><option>WEEKLY</option><option>MONTHLY</option><option>QUARTERLY</option></select><input required type="email" value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="recipient@company.com" className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-950"/><button className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold">Simpan Jadwal</button></form></div>}
  </div>;
};
