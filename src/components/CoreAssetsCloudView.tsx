import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Cloud, RefreshCw, Search, Plus, ScanLine, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getCoreCloudAccounts, getCoreCloudAssets, startCoreCloudScan, validateCoreCloudAccount, CoreCloudAccount } from '../lib/assetsCloudApi';
import { CloudConnectionModal } from './CloudConnectionModal';

interface CoreAssetsCloudViewProps { showToast?: (message: string) => void; }

const providerLabel = (provider: string): string => {
  const normalized = provider.trim();
  if (!normalized) return 'Unknown Provider';
  return normalized.split(/[-_\s]+/).map((part) => part.length <= 4 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
};

export const CoreAssetsCloudView: React.FC<CoreAssetsCloudViewProps> = ({ showToast = (_message: string) => {} }) => {
  const [accounts, setAccounts] = useState<CoreCloudAccount[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [provider, setProvider] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanningId, setScanningId] = useState<number | null>(null);
  const [validatingId, setValidatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConnect, setShowConnect] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [nextAccounts, nextAssets] = await Promise.all([getCoreCloudAccounts(), getCoreCloudAssets({ provider, search })]);
      setAccounts(nextAccounts); setAssets(nextAssets);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data Assets & Cloud dari NusaSec-Core.';
      setError(message); showToast(message);
    } finally { setLoading(false); }
  }, [provider, search, showToast]);

  useEffect(() => { void load(); }, [load]);

  const providerOptions = useMemo(() => ['all', ...Array.from(new Set(accounts.map((x) => x.provider)))], [accounts]);

  const handleValidate = async (account: CoreCloudAccount) => {
    const numericId = Number(account.id);
    if (!Number.isFinite(numericId)) return;
    setValidatingId(numericId);
    try { await validateCoreCloudAccount(numericId); showToast(`Live validation ${providerLabel(account.provider)} berhasil.`); await load(); }
    catch (err) { showToast(err instanceof Error ? err.message : 'Live validation gagal.'); }
    finally { setValidatingId(null); }
  };

  const handleScan = async (account: CoreCloudAccount) => {
    const numericId = Number(account.id);
    if (!Number.isFinite(numericId)) return;
    if (account.identityStatus !== 'VALIDATED') { showToast('Validasi live wajib dilakukan sebelum scan.'); return; }
    setScanningId(numericId);
    try { await startCoreCloudScan(numericId); showToast(`Scan ${providerLabel(account.provider)} untuk ${account.name} masuk antrean di Core.`); await load(); }
    catch (err) { showToast(err instanceof Error ? err.message : 'Gagal memulai scan.'); }
    finally { setScanningId(null); }
  };

  return (
    <div id="assets-cloud-view" className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-blue-600"></span><span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">NusaSec Secure Data Plane</span></div><h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Multi-Cloud Connections & Asset Inventory</h1><p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Data tenant langsung dari NusaSec-Core. Status dan scan harus berbasis evidence Core.</p></div>
        <button onClick={() => setShowConnect(true)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs"><Plus className="w-4 h-4" /> Tambah Koneksi Cloud</button>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/30 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3"><h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono flex items-center gap-2"><Cloud className="w-4 h-4 text-blue-600" /> AKUN CLOUD TERHUBUNG</h2><button onClick={() => void load()} className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-900" aria-label="Refresh"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between"><span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{providerLabel(account.provider)}</span><span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${account.identityStatus === 'VALIDATED' ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/30' : 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/30'}`}><span className="w-1.5 h-1.5 rounded-full bg-current"></span>{account.identityStatus}</span></div>
              <div><h3 className="font-bold text-slate-900 dark:text-white text-sm">{account.name}</h3><p className="text-[11px] text-slate-400 font-mono mt-0.5">{account.accountRef}</p></div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono"><div><span className="text-[10px] text-slate-400 block">ASET</span><span className="font-bold text-slate-900 dark:text-white">{account.assetCount}</span></div><div><span className="text-[10px] text-slate-400 block">SCAN</span><span className="font-bold text-slate-900 dark:text-white">{account.scanStatus}</span></div></div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"><span className="text-[11px] text-slate-500">{account.lastValidatedAt ? new Date(account.lastValidatedAt).toLocaleString() : 'Belum divalidasi'}</span><div className="flex items-center gap-1.5"><button onClick={() => void handleValidate(account)} disabled={validatingId === Number(account.id) || account.identityStatus === 'VALIDATED'} className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold disabled:opacity-50">{validatingId === Number(account.id) ? 'Validate…' : account.identityStatus === 'VALIDATED' ? 'Validated' : 'Validate'}</button><button onClick={() => void handleScan(account)} disabled={scanningId === Number(account.id) || account.identityStatus !== 'VALIDATED'} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-blue-600 text-white text-[11px] font-semibold disabled:opacity-50"><ScanLine className="w-3.5 h-3.5" /> {scanningId === Number(account.id) ? 'Queue…' : 'Scan'}</button></div></div>
            </div>
          ))}
          {!loading && accounts.length === 0 && <div className="md:col-span-2 lg:col-span-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500">Belum ada cloud account terhubung.</div>}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h3 className="font-bold text-slate-900 dark:text-white text-base">Katalog Seluruh Aset Infrastruktur</h3><p className="text-xs text-slate-500 dark:text-slate-400">Filter dan pencarian dieksekusi oleh Core dengan tenant isolation.</p></div><div className="flex flex-wrap items-center gap-2"><select value={provider} onChange={(e) => setProvider(e.target.value)} className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-full min-w-0"><option value="all">Semua Provider</option>{providerOptions.filter((x) => x !== 'all').map((x) => <option key={x} value={x}>{providerLabel(x)}</option>)}</select><div className="relative min-w-0 w-full sm:w-60"><Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama aset / ARN..." className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white min-w-0" /></div></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead><tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono uppercase text-[10px]"><th className="pb-3 px-3">Nama Aset & External ID</th><th className="pb-3 px-3">Tipe Resource</th><th className="pb-3 px-3">Region</th><th className="pb-3 px-3">Sensitivitas</th><th className="pb-3 px-3">Risiko</th><th className="pb-3 px-3 text-right">Status</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{assets.map((asset) => <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40"><td className="py-3.5 px-3"><div className="font-bold text-slate-900 dark:text-white text-[13px]">{asset.name}</div><div className="text-slate-400 font-mono text-[10px] truncate max-w-xs">{asset.externalId}</div></td><td className="py-3.5 px-3 font-mono text-slate-700 dark:text-slate-300">{asset.assetType}</td><td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{asset.region}</td><td className="py-3.5 px-3"><span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{asset.sensitivity}</span></td><td className="py-3.5 px-3 font-mono"><span className={`font-bold ${Number(asset.riskScore) > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>{asset.riskScore} / 100</span></td><td className="py-3.5 px-3 text-right"><span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"><CheckCircle2 className="w-3.5 h-3.5" />{asset.status}</span></td></tr>)}</tbody></table></div>
      </div>

      {showConnect && <CloudConnectionModal onClose={() => setShowConnect(false)} onCreated={load} showToast={showToast} />}
    </div>
  );
};
