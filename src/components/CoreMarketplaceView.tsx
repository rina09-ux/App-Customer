import React, { useEffect, useMemo, useState } from 'react';
import { Atom, ArrowRight, Check, Code2, FileCheck2, Gem, Search, ShieldCheck, ShoppingBag } from 'lucide-react';
import { getMyProducts, ProductWorkspace } from '../lib/productApi';

interface Props {
  onNavigateToBilling: () => void;
  showToast?: (msg: string) => void;
}

type FamilyCode = 'all' | 'SECURE' | 'TRUST' | 'QUANTUM' | 'DEVELOPER';

type Card = {
  code: string;
  name: string;
  family: FamilyCode;
  description: string;
  status: string;
  raw: ProductWorkspace;
};

const familyMeta: Record<Exclude<FamilyCode, 'all'>, { name: string; tagline: string; icon: React.ElementType; tint: string }> = {
  SECURE: { name: 'NusaSec Secure', tagline: 'Cloud security discovery, posture, risk and attack-path capabilities', icon: ShieldCheck, tint: 'blue' },
  TRUST: { name: 'NusaSec Trust', tagline: 'Compliance, evidence and regulatory intelligence', icon: FileCheck2, tint: 'emerald' },
  QUANTUM: { name: 'NusaSec Quantum', tagline: 'PQC readiness, CBOM and cryptographic migration', icon: Atom, tint: 'purple' },
  DEVELOPER: { name: 'Developer & Integrations', tagline: 'PQC APIs, SDKs and DevSecOps integrations', icon: Code2, tint: 'slate' },
};

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeItems(items: unknown): Card[] {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => {
    const raw = asRecord(item) as ProductWorkspace;
    const code = asString(raw.product_code || raw.code, `product-${index}`);
    const name = asString(raw.display_name || raw.name || raw.product_name, code);
    const publicInfo = asRecord(raw.public);
    const familyCandidate = asString(raw.family || publicInfo.family || 'SECURE').toUpperCase();
    const family: FamilyCode = ['SECURE', 'TRUST', 'QUANTUM', 'DEVELOPER'].includes(familyCandidate) ? familyCandidate as FamilyCode : 'SECURE';
    const description = asString(raw.outcome || raw.description || raw.short_description || publicInfo.outcome, 'Product workspace dari NusaSec-Core.');
    const entitlement = asRecord(raw.entitlement);
    const status = asString(raw.status || entitlement.status || raw.commercial_status, 'ACTIVE');
    return { code, name, family, description, status, raw };
  });
}

export const CoreMarketplaceView: React.FC<Props> = ({ onNavigateToBilling, showToast = (_msg) => {} }) => {
  const [items, setItems] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<FamilyCode>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyProducts()
      .then((response) => { if (!cancelled) { setItems(normalizeItems(response.items)); setError(null); } })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal mengambil product workspace dari NusaSec-Core.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => items.filter((item) => {
    const familyMatch = selectedFamily === 'all' || item.family === selectedFamily;
    const query = searchQuery.trim().toLowerCase();
    return familyMatch && (!query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query) || item.code.toLowerCase().includes(query));
  }), [items, selectedFamily, searchQuery]);

  const grouped = useMemo(() => {
    const result: Record<string, Card[]> = {};
    filtered.forEach((item) => { (result[item.family] ||= []).push(item); });
    return result;
  }, [filtered]);

  return (
    <div id="marketplace-view" className="flex-1 overflow-y-auto bg-[#f8fafc] px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-8">
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-mono font-semibold"><ShoppingBag className="w-3.5 h-3.5" /> NusaSec-Core Product Workspace</div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">Katalog layanan dan entitlement workspace Anda</h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">Data pada halaman ini berasal dari product catalog dan entitlement tenant di NusaSec-Core. Tidak ada katalog produk paralel di Customer App.</p>
          <div className="pt-2 flex flex-wrap gap-3"><button onClick={onNavigateToBilling} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg"><Gem className="w-4 h-4" /><span>Lihat Paket &amp; Langganan</span></button></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 font-medium text-xs">
          {([{ code: 'all', label: 'Semua Layanan' }, ...Object.entries(familyMeta).map(([code, meta]) => ({ code, label: meta.name }))] as {code: FamilyCode; label: string}[]).map(tab => (
            <button key={tab.code} onClick={() => setSelectedFamily(tab.code)} className={`px-3.5 py-2 rounded-xl transition-all ${selectedFamily === tab.code ? 'bg-slate-900 text-white font-semibold shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>{tab.label}</button>
          ))}
        </div>
        <div className="relative w-full sm:w-72"><Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" /><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari layanan atau kapabilitas..." className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600" /></div>
      </div>

      {loading && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Memuat product workspace dari NusaSec-Core…</div>}
      {error && !loading && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><strong>Product workspace tidak dapat dimuat.</strong><div className="mt-1">{error}</div></div>}
      {!loading && !error && filtered.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Tidak ada product workspace yang cocok dengan pilihan Anda.</div>}

      <div className="space-y-8">
        {Object.entries(grouped).map(([familyCode, cards]) => {
          const meta = familyMeta[familyCode as Exclude<FamilyCode, 'all'>];
          if (!meta) return null;
          const Icon = meta.icon;
          const tint = meta.tint === 'blue' ? 'bg-blue-50 text-blue-600' : meta.tint === 'emerald' ? 'bg-emerald-50 text-emerald-600' : meta.tint === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-700';
          return <div key={familyCode} className="space-y-4">
            <div className="flex items-center gap-3"><div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs ${tint}`}><Icon className="w-5 h-5" /></div><div><h2 className="text-base sm:text-lg font-bold text-slate-900">{meta.name}</h2><p className="text-xs text-slate-500">{meta.tagline}</p></div></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">{cards.map(card => {
              const plan = asRecord(card.raw.plan); const entitlement = asRecord(card.raw.entitlement); const features = Array.isArray(card.raw.features) ? card.raw.features : Array.isArray(entitlement.features) ? entitlement.features : [];
              return <div key={card.code} className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
                <div className="space-y-3"><div className="flex items-center justify-between"><span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{statusLabel(card.status)}</span><span className="w-2 h-2 rounded-full bg-emerald-500" /></div><h3 className="text-base font-bold text-slate-900">{card.name}</h3><p className="text-xs text-slate-600 leading-relaxed">{card.description}</p>{typeof plan.name === 'string' && <div className="text-xs text-slate-500">Plan: <span className="font-semibold text-slate-700">{plan.name}</span></div>}
                  {features.length > 0 && <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-700">{features.slice(0, 4).map((feature, idx) => <div key={idx} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /><span>{typeof feature === 'string' ? feature : asString(asRecord(feature).display_name || asRecord(feature).name, 'Included capability')}</span></div>)}</div>}
                </div><div className="pt-4 border-t border-slate-100 flex items-center gap-2"><button onClick={() => showToast(`${card.name} berasal dari entitlement tenant di NusaSec-Core.`)} className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /><span>Buka Workspace</span></button></div>
              </div>;
            })}</div>
          </div>;
        })}
      </div>
    </div>
  );
};

function statusLabel(status: string): string {
  const normalized = status.replace(/_/g, ' ').toUpperCase();
  return normalized || 'ACTIVE';
}
