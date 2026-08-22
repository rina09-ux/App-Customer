import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Download, FileText, RefreshCw, Upload } from 'lucide-react';
import { getCoreApiUrl } from '../lib/coreApi';
import { requestCoreMultipart } from '../lib/coreRequest';
import { requestCore } from '../lib/coreRequest';

interface Evidence { id: string; filename: string; contentType?: string; sizeBytes?: number; sha256?: string; kind?: string; status?: string; createdAt?: string; freshness?: string; }

export const CoreEvidenceView: React.FC<{ showToast?: (msg: string) => void }> = ({ showToast = () => {} }) => {
  const [items, setItems] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState('security-evidence');
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${getCoreApiUrl()}/api/v1/data-intelligence/catalog?object_type=evidence&limit=500`, { credentials: 'include' });
      const b = await r.json();
      if (!r.ok) throw new Error(b?.detail || 'Gagal mengambil evidence catalog.');
      const out: Evidence[] = [];
      for (const row of b.items || []) {
        const m = String(row.object_key || '').match(/^evidence:(\d+)$/);
        if (!m) continue;
        const d = await fetch(`${getCoreApiUrl()}/api/v1/platform/evidence/${m[1]}`, { credentials: 'include' }).then(x => x.json());
        out.push({
          id: m[1],
          filename: row.display_name || `Evidence ${m[1]}`,
          contentType: row.attributes?.content_type,
          sizeBytes: row.attributes?.size_bytes,
          sha256: d.sha256,
          status: d.status,
          createdAt: row.last_seen_at,
          freshness: row.freshness_status,
        });
      }
      setItems(out);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Gagal memuat evidence.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void load(); }, [load]);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('kind', kind);
      const b = await requestCoreMultipart<any>('/api/v1/platform/evidence', form);
      const r = { ok: true };
      if (!r.ok) throw new Error(b?.detail || 'Upload evidence gagal.');
      showToast(`Evidence tersimpan di Core. SHA-256: ${b.sha256}`);
      setFile(null);
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Upload evidence gagal.');
    } finally {
      setUploading(false);
    }
  };

  const download = async (item: Evidence) => {
    setDownloading(item.id);
    try {
      const r = await fetch(`${getCoreApiUrl()}/api/v1/platform/evidence/${encodeURIComponent(item.id)}/download`, { credentials: 'include' });
      if (!r.ok) {
        const b = await r.json().catch(() => ({}));
        throw new Error(b?.detail || 'Download evidence gagal.');
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.filename || `evidence-${item.id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Download evidence gagal.');
    } finally {
      setDownloading(null);
    }
  };

  return <div id="evidence-view" className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
    <div className="flex flex-col sm:flex-row justify-between gap-3">
      <div>
        <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 font-mono">NusaSec Trust Evidence Registry</div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Evidence Collection &amp; Integrity</h1>
        <p className="text-xs sm:text-sm text-slate-500">Evidence disimpan, di-hash, diverifikasi integritasnya, dan diunduh melalui NusaSec-Core.</p>
      </div>
      <button onClick={() => void load()} className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold flex gap-2">
        <RefreshCw className={loading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} /> Refresh
      </button>
    </div>

    <form onSubmit={upload} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><Upload className="w-4 h-4 text-blue-600"/> Unggah Evidence</div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
        <input type="file" required onChange={e => setFile(e.target.files?.[0] || null)} className="text-xs text-slate-600 dark:text-slate-300"/>
        <select value={kind} onChange={e => setKind(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs">
          <option value="security-evidence">Security Evidence</option>
          <option value="soc2_attestation">SOC 2 Attestation</option>
          <option value="pen_test">Pen Test</option>
          <option value="policy_document">Policy Document</option>
          <option value="pqc_benchmark">PQC Benchmark</option>
        </select>
        <button disabled={uploading} className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold">{uploading ? 'Uploading…' : 'Upload'}</button>
      </div>
    </form>

    <div className="space-y-3">
      {items.map(x => <div key={x.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex gap-2 items-center flex-wrap">
            <FileText className="w-4 h-4 text-blue-600"/>
            <strong className="text-sm text-slate-900 dark:text-white break-all">{x.filename}</strong>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 className="w-3 h-3 inline"/> {x.status}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono break-all">SHA-256: {x.sha256 || '—'}</div>
          <div className="text-[11px] text-slate-500 mt-1">{x.kind || 'evidence'} • {x.freshness || 'UNKNOWN'} • {x.createdAt ? new Date(x.createdAt).toLocaleString() : '—'}</div>
        </div>
        <button type="button" onClick={() => void download(x)} disabled={downloading === x.id || x.status !== 'ACTIVE'} className="shrink-0 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 disabled:opacity-50">
          <Download className="w-3.5 h-3.5" /> {downloading === x.id ? 'Mengunduh…' : 'Download'}
        </button>
      </div>)}
    </div>
  </div>;
};
