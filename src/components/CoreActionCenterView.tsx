import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckSquare, Clock, Plus, RefreshCw } from 'lucide-react';
import { getCoreApiUrl } from '../lib/coreApi';
import { useAuth } from '../context/AuthContext';

interface CoreAction {
  id: number | string;
  action_type?: string;
  title: string;
  description?: string;
  severity?: string;
  status: string;
  owner_principal_id?: string | null;
  due_at?: string | null;
  source_type?: string;
  source_id?: string | null;
  metadata?: Record<string, unknown>;
}

interface ActionCenterViewProps {
  showToast?: (msg: string) => void;
}

const CORE = getCoreApiUrl();
const domains = ['all', 'SECURITY', 'COMPLIANCE', 'QUANTUM', 'IDENTITY'] as const;
const statuses = ['all', 'OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CLOSED'] as const;

type Domain = typeof domains[number];
type Status = typeof statuses[number];

export const CoreActionCenterView: React.FC<ActionCenterViewProps> = ({ showToast = (_msg: string) => {} }) => {
  const { csrfToken } = useAuth();
  const [items, setItems] = useState<CoreAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<Domain>('all');
  const [filterStatus, setFilterStatus] = useState<Status>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Exclude<Domain, 'all'>>('SECURITY');
  const [newPriority, setNewPriority] = useState('P1 - HIGH');
  const [newActionText, setNewActionText] = useState('');

  const request = useCallback(async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${CORE}${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        ...(init.headers || {}),
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof body?.detail === 'string' ? body.detail : `Core request failed (${response.status})`);
    return body as T;
  }, [csrfToken]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await request<{ items: CoreAction[] }>('/api/v1/product-experience/action-center?limit=500');
      setItems(result.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat Action Center dari NusaSec-Core.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => { void load(); }, [load]);

  const getDomain = (item: CoreAction): string => {
    const metadataCategory = item.metadata?.category;
    if (typeof metadataCategory === 'string') return metadataCategory.toUpperCase();
    const actionType = String(item.action_type || '').toUpperCase();
    if (actionType.includes('COMPLIANCE')) return 'COMPLIANCE';
    if (actionType.includes('QUANTUM') || actionType.includes('PQC')) return 'QUANTUM';
    if (actionType.includes('IDENTITY') || actionType.includes('IAM')) return 'IDENTITY';
    return 'SECURITY';
  };

  const normalized = useMemo(() => items.map((item) => ({ ...item, domain: getDomain(item) })), [items]);
  const filtered = normalized.filter((item) => (filterCategory === 'all' || item.domain === filterCategory) && (filterStatus === 'all' || item.status === filterStatus));
  const counts = {
    open: normalized.filter((x) => x.status === 'OPEN').length,
    progress: normalized.filter((x) => x.status === 'IN_PROGRESS').length,
    done: normalized.filter((x) => x.status === 'DONE' || x.status === 'CLOSED').length,
    high: normalized.filter((x) => ['CRITICAL', 'HIGH'].includes(String(x.severity).toUpperCase())).length,
  };

  const updateStatus = async (item: CoreAction, status: Exclude<Status, 'all'>) => {
    if (typeof item.id !== 'number') {
      showToast('Item ini berasal dari sistem remediation/exception dan belum memiliki command status langsung pada Action Center.');
      return;
    }
    try {
      await request(`/api/v1/product-experience/action-center/${item.id}/status`, { method: 'POST', body: JSON.stringify({ status }) });
      await load();
      showToast(`Status "${item.title}" diperbarui menjadi ${status}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal memperbarui status.');
    }
  };

  const createAction = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTitle.trim()) return;
    const severity = newPriority.startsWith('P0') ? 'CRITICAL' : newPriority.startsWith('P1') ? 'HIGH' : newPriority.startsWith('P2') ? 'MEDIUM' : 'LOW';
    try {
      await request('/api/v1/product-experience/action-center', {
        method: 'POST',
        body: JSON.stringify({
          action_type: 'MANUAL_REMEDIATION',
          title: newTitle.trim(),
          description: newActionText.trim(),
          severity,
          source_type: 'MANUAL_SOC_ASSIGNMENT',
          source_id: null,
          metadata_json: {
            category: newCategory,
            priority: newPriority,
            recommendedAction: newActionText.trim() || 'Lakukan audit dan validasi pada endpoint terkait.',
          },
        }),
      });
      setIsCreating(false);
      setNewTitle('');
      setNewActionText('');
      await load();
      showToast('Tugas remediasi berhasil dibuat di NusaSec-Core.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal membuat tugas remediasi.');
    }
  };

  return (
    <div id="action-center-view" className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">NusaSec Authoritative Task Engine</div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Action Center &amp; Remediation Backlog</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Semua tindakan berasal dari NusaSec-Core dan dapat dikembalikan ke lifecycle sumbernya.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
          <button onClick={() => setIsCreating(true)} className="px-4 py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2"><Plus className="w-4 h-4" /> Buat Tugas Remediasi</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Tugas Terbuka', counts.open],
          ['Dalam Proses', counts.progress],
          ['Selesai', counts.done],
          ['High / Critical', counts.high],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{label}</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">{value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <div className="text-slate-400 font-mono mb-1">Domain</div>
            <div className="flex flex-wrap gap-1.5">
              {domains.map((value) => <button key={value} onClick={() => setFilterCategory(value)} className={`px-3 py-1.5 rounded-lg font-semibold ${filterCategory === value ? 'bg-slate-900 dark:bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{value === 'all' ? 'Semua Kategori' : value}</button>)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-mono mb-1">Status</div>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map((value) => <button key={value} onClick={() => setFilterStatus(value)} className={`px-3 py-1.5 rounded-lg font-semibold ${filterStatus === value ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{value === 'all' ? 'Semua Status' : value}</button>)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead><tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-mono text-[10px]"><th className="px-4 py-3">Tugas</th><th className="px-4 py-3">Domain</th><th className="px-4 py-3">Severity</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Due</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{filtered.map((item) => <tr key={String(item.id)}><td className="px-4 py-3"><div className="font-semibold text-slate-900 dark:text-white">{item.title}</div><div className="text-[11px] text-slate-400">{item.description || item.action_type || '—'}</div></td><td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.domain}</td><td className="px-4 py-3 font-semibold">{item.severity || 'MEDIUM'}</td><td className="px-4 py-3"><span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{item.status}</span></td><td className="px-4 py-3 text-slate-500">{item.due_at ? new Date(item.due_at).toLocaleDateString() : '—'}</td><td className="px-4 py-3 text-right"><div className="inline-flex gap-1.5">{item.status === 'OPEN' && <button onClick={() => void updateStatus(item, 'IN_PROGRESS')} className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">Mulai</button>}{item.status === 'IN_PROGRESS' && <button onClick={() => void updateStatus(item, 'DONE')} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold">Selesai</button>}{item.status === 'BLOCKED' && <button onClick={() => void updateStatus(item, 'IN_PROGRESS')} className="px-2.5 py-1.5 rounded-lg bg-amber-600 text-white font-semibold">Lanjut</button>}</div></td></tr>)}</tbody></table></div>
        {!loading && !filtered.length && <div className="p-8 text-center text-sm text-slate-400">Tidak ada tugas sesuai filter.</div>}
      </div>

      {isCreating && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60"><form onSubmit={createAction} className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"><div className="flex items-center justify-between"><h2 className="font-bold text-slate-900 dark:text-white">Buat Tugas Remediasi</h2><button type="button" onClick={() => setIsCreating(false)} className="text-slate-400" aria-label="Tutup">×</button></div><input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Judul tugas" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm" required /><div className="grid grid-cols-2 gap-3"><select value={newCategory} onChange={(e) => setNewCategory(e.target.value as Exclude<Domain, 'all'>)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm">{domains.filter((x) => x !== 'all').map((x) => <option key={x} value={x}>{x}</option>)}</select><select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm"><option>P0 - CRITICAL</option><option>P1 - HIGH</option><option>P2 - MEDIUM</option><option>P3 - LOW</option></select></div><textarea value={newActionText} onChange={(e) => setNewActionText(e.target.value)} placeholder="Rekomendasi tindakan" className="w-full min-h-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm" /><div className="flex justify-end gap-2"><button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold">Batal</button><button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">Simpan</button></div></form></div>}
    </div>
  );
};