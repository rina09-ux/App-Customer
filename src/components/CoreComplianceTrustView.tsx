import React, { useCallback, useEffect, useState } from 'react';
import { Award, Download, RefreshCw, ShieldCheck } from 'lucide-react';
import { getCoreApiUrl } from '../lib/coreApi';
import { requestCore } from '../lib/coreRequest';

export const CoreComplianceTrustView: React.FC<{ showToast?: (msg: string) => void }> = ({ showToast = () => {} }) => {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [applicability, setApplicability] = useState<any[]>([]);
  const [quality, setQuality] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, a, q] = await Promise.all([
        fetch(`${getCoreApiUrl()}/api/v1/regulatory/catalog`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${getCoreApiUrl()}/api/v1/regulatory/applicability`, { credentials: 'include' }).then(r => r.json()),
        fetch(`${getCoreApiUrl()}/api/v1/data-intelligence/quality`, { credentials: 'include' }).then(r => r.json()),
      ]);
      setCatalog(c.instruments || []); setApplicability(a.items || []); setQuality(q);
    } catch (e) { showToast(e instanceof Error ? e.message : 'Gagal mengambil compliance Core.'); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { void load(); }, [load]);

  const exportDossier = async () => {
    setExporting(true);
    try {
      const b = await requestCore<{ document_id: number }>(`/api/v1/platform/customer-reports/compliance`, { method: 'POST', body: JSON.stringify({ report_key: 'compliance' }) });
      const dl = await fetch(`${getCoreApiUrl()}/api/v1/platform/customer-reports/compliance/${b.document_id}/download`, { credentials: 'include' });
      if (!dl.ok) throw new Error('Download compliance dossier gagal.');
      const blob = await dl.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'nusasec-compliance-dossier.pdf'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      showToast('Compliance Dossier berhasil dibuat dan diunduh dari Core.');
    } catch (e) { showToast(e instanceof Error ? e.message : 'Export compliance dossier gagal.'); }
    finally { setExporting(false); }
  };

  const statusFor = (key: string) => applicability.find(x => x.instrument_key === key);
  return <div id="compliance-trust-view" className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
    <div className="flex justify-between gap-3"><div><div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 font-mono">NusaSec Trust &amp; Continuous Compliance</div><h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Compliance Frameworks &amp; Audit Readiness</h1><p className="text-xs sm:text-sm text-slate-500">Regulatory catalog, applicability, evidence trust signal, dan dossier berasal dari Core.</p></div><div className="flex gap-2"><button onClick={() => void load()} className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"><RefreshCw className={loading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} /></button><button disabled={exporting} onClick={()=>void exportDossier()} className="px-3 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-semibold flex gap-2 disabled:opacity-50"><Download className="w-4 h-4"/>{exporting?'Generating…':'Export Dossier'}</button></div></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"><span className="text-xs text-slate-500">Framework instruments</span><div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{catalog.length}</div></div><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"><span className="text-xs text-slate-500">Potentially applicable</span><div className="text-2xl font-bold text-blue-600 mt-1">{applicability.filter(x=>x.status==='POTENTIALLY_APPLICABLE').length}</div></div><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"><span className="text-xs text-slate-500">Need legal review</span><div className="text-2xl font-bold text-amber-600 mt-1">{applicability.filter(x=>x.requires_legal_review).length}</div></div><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"><span className="text-xs text-slate-500">Evidence trust</span><div className="text-2xl font-bold text-emerald-600 mt-1">{quality?.trust_score ?? 0}%</div></div></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{catalog.map(fw=>{const a=statusFor(fw.id);return <button key={fw.id} onClick={()=>setSelected(fw)} className={`p-5 rounded-2xl border text-left ${selected?.id===fw.id?'bg-emerald-950 text-white border-emerald-700':'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}><div className="flex justify-between"><span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{fw.jurisdiction}</span><ShieldCheck className="w-4 h-4 text-emerald-600"/></div><h3 className="mt-3 font-bold text-sm">{fw.title}</h3><div className="text-xs mt-2 opacity-80">{a?.status||'NOT_EVALUATED'} • confidence {a?.confidence||'—'}</div></button>})}</div>
    {selected&&<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3"><div className="flex items-center gap-2"><Award className="w-5 h-5 text-emerald-600"/><h3 className="font-bold text-slate-900 dark:text-white">{selected.title}</h3></div><p className="text-xs text-slate-500">Official source: <a className="text-blue-600 break-all" href={selected.official_source_url} target="_blank" rel="noreferrer">{selected.official_source_url}</a></p><div className="text-sm text-slate-600 dark:text-slate-300">Technical applicability is a signal only and may require legal review.</div></div>}
  </div>;
};
