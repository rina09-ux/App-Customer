import React, { useEffect, useState } from 'react';
import { Search, Wrench, Check } from 'lucide-react';
import { getRiskFindings, remediateRiskFinding, CoreRiskFinding } from '../lib/riskExposureApi';

interface RiskExposureViewProps { showToast?: (msg: string) => void; }

export const RiskExposureView: React.FC<RiskExposureViewProps> = ({ showToast = () => {} }) => {
  const [findings, setFindings] = useState<CoreRiskFinding[]>([]);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getRiskFindings({ severity: severityFilter, search: searchQuery });
      setFindings(data.items);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Risk data gagal dimuat.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [severityFilter]);

  const remediate = async (finding: CoreRiskFinding) => {
    try {
      await remediateRiskFinding(finding.findingKey);
      showToast(`Remediasi "${finding.title}" dikirim ke Core.`);
      await load();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Remediasi gagal.');
    }
  };

  return (
    <div id="risk-exposure-view" className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-rose-600" /><span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">NusaSec Risk Engine</span></div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Risk &amp; Exposure Management</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Data risiko dan exposure bersumber langsung dari NusaSec-Core.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {['CRITICAL','HIGH','MEDIUM','all'].map((level) => (
          <div key={level} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
            <span className="text-slate-500 text-[11px] block">{level === 'all' ? 'TOTAL TEMUAN' : `${level} TEMUAN`}</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">{level === 'all' ? findings.length : findings.filter(f => f.severity === level).length}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-slate-400 mr-2 font-mono">Tingkat Keparahan:</span>
          {['all', 'CRITICAL', 'HIGH', 'MEDIUM'].map(level => <button key={level} onClick={() => setSeverityFilter(level)} className={`px-3 py-1 rounded-lg uppercase ${severityFilter === level ? 'bg-slate-900 dark:bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{level}</button>)}
        </div>
        <div className="relative flex gap-2">
          <div className="relative flex-1"><Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') void load(); }} placeholder="Cari CVE / nama aset..." className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-full sm:w-64 text-slate-800 dark:text-slate-200" /></div>
          <button onClick={() => void load()} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-semibold">Cari</button>
        </div>
      </div>

      {loading ? <div className="p-8 text-center text-sm text-slate-500">Memuat risk findings dari Core…</div> : (
        <div className="space-y-4">
          {findings.map(f => (
            <div key={f.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2 py-0.5 rounded">{f.cve || f.findingKey}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{f.severity}{f.cvss != null ? ` · CVSS ${f.cvss}` : ''}</span>
                  <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">{f.provider}</span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
                </div>
                <button disabled={f.status === 'RESOLVED'} onClick={() => void remediate(f)} className="px-3.5 py-1.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">{f.status === 'RESOLVED' ? <><Check className="w-3.5 h-3.5" />Selesai</> : <><Wrench className="w-3.5 h-3.5 text-amber-400" />Remediasi</>}</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <div><span className="text-slate-400 block text-[10px]">TARGET ASET</span><span className="font-bold text-slate-900 dark:text-white break-words">{f.asset}</span></div>
                <div><span className="text-slate-400 block text-[10px]">EXPOSURE VECTOR</span><span className="text-blue-600 dark:text-blue-400 font-semibold break-words">{f.exposureVector}</span></div>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900"><strong className="text-slate-900 dark:text-white">Rencana Remediasi:</strong> {f.remediationPlan}</div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800"><span>Terdeteksi: {f.detectedAt || '-'}</span><span>Dampak Bisnis: <strong className="text-slate-700 dark:text-slate-200">{f.businessCriticality}</strong></span></div>
            </div>
          ))}
          {findings.length === 0 && <div className="p-10 text-center text-sm text-slate-500">Tidak ada risk finding pada filter ini.</div>}
        </div>
      )}
    </div>
  );
};
