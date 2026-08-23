import React, { useState } from 'react';
import { createCoreCloudAccount, validateCoreCloudAccount, CloudConnectionPayload } from '../lib/assetsCloudApi';

interface Props {
  onClose: () => void;
  onCreated: () => Promise<void> | void;
  showToast?: (message: string) => void;
}

export const CloudConnectionModal: React.FC<Props> = ({ onClose, onCreated, showToast = () => {} }) => {
  const [provider, setProvider] = useState('aws');
  const [accountRef, setAccountRef] = useState('');
  const [name, setName] = useState('');
  const [credentialMode, setCredentialMode] = useState('secret_ref');
  const [credentialRef, setCredentialRef] = useState('');
  const [roleRef, setRoleRef] = useState('');
  const [externalIdRef, setExternalIdRef] = useState('');
  const [region, setRegion] = useState('');
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: CloudConnectionPayload = {
        provider,
        account_ref: accountRef.trim(),
        name: name.trim(),
        credential_mode: credentialMode,
        credential_ref: credentialRef.trim(),
        role_ref: roleRef.trim() || undefined,
        external_id_ref: externalIdRef.trim() || undefined,
        permission_profile: 'discovery-read',
        region: region.trim() || undefined,
      };
      const created = await createCoreCloudAccount(payload);
      setCreatedId(created.id);
      showToast('Cloud account tersimpan di Core. Jalankan Live Validation sebelum Scan.');
      await onCreated();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal membuat cloud account.');
    } finally {
      setSaving(false);
    }
  };

  const validate = async () => {
    if (!createdId) return;
    setSaving(true);
    try {
      const result = await validateCoreCloudAccount(createdId);
      showToast(`Validasi ${result.status} berhasil.`);
      await onCreated();
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Live validation gagal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <form onSubmit={submit} className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div><h2 className="text-base font-bold text-slate-900 dark:text-white">Tambah Koneksi Cloud</h2><p className="text-xs text-slate-500">Credential harus berupa reference aman, bukan secret plaintext.</p></div>
          <button type="button" onClick={onClose} className="text-slate-400">×</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select value={provider} onChange={e => setProvider(e.target.value)} className="rounded-xl border px-3 py-2 text-sm dark:bg-slate-950">
            <option value="aws">AWS</option><option value="azure">Azure</option><option value="gcp">GCP</option><option value="alibaba">Alibaba</option><option value="huawei">Huawei</option>
          </select>
          <input required value={accountRef} onChange={e => setAccountRef(e.target.value)} placeholder="Account / subscription / project ID" className="rounded-xl border px-3 py-2 text-sm dark:bg-slate-950" />
        </div>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Nama koneksi" className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-slate-950" />
        <div className="grid grid-cols-2 gap-3">
          <select value={credentialMode} onChange={e => setCredentialMode(e.target.value)} className="rounded-xl border px-3 py-2 text-sm dark:bg-slate-950"><option value="secret_ref">Secret reference</option><option value="role_ref">Role reference</option></select>
          <input required value={credentialRef} onChange={e => setCredentialRef(e.target.value)} placeholder="aws-sm://... / aws-role://..." className="rounded-xl border px-3 py-2 text-sm font-mono dark:bg-slate-950" />
        </div>
        <input value={roleRef} onChange={e => setRoleRef(e.target.value)} placeholder="Role reference (optional)" className="w-full rounded-xl border px-3 py-2 text-sm font-mono dark:bg-slate-950" />
        <input value={externalIdRef} onChange={e => setExternalIdRef(e.target.value)} placeholder="External ID reference (optional)" className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-slate-950" />
        <input value={region} onChange={e => setRegion(e.target.value)} placeholder="Region (optional)" className="w-full rounded-xl border px-3 py-2 text-sm dark:bg-slate-950" />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold dark:bg-slate-800">Batal</button>
          {!createdId ? <button disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Menyimpan…' : 'Simpan Koneksi'}</button> : <button type="button" disabled={saving} onClick={() => void validate()} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Validasi…' : 'Live Validate'}</button>}
        </div>
      </form>
    </div>
  );
};
