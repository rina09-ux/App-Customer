import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CreditCard, Gem, RefreshCw, WalletCards, Receipt, Gauge, Ban, RotateCcw } from 'lucide-react';
import { requestCore } from '../lib/coreRequest';

interface Props { showToast?: (msg: string) => void; }

export const CoreBillingView: React.FC<Props> = ({ showToast = (_message: string) => {} }) => {
  const [catalog, setCatalog] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [methods, setMethods] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [usage, setUsage] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly'|'annual'>('monthly');

  const request = useCallback(async <T,>(path: string, init: RequestInit = {}) => requestCore<T>(path, init), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c,s,p,m,i,u] = await Promise.all([
        request<any>('/api/v1/commercial/customer-catalog'),
        request<any>('/api/v1/commercial/billing/summary'),
        request<any>('/api/v1/commercial/billing/profile'),
        request<any>('/api/v1/commercial/billing/payment-methods'),
        request<any>('/api/v1/commercial/billing/invoices'),
        request<any>('/api/v1/commercial/billing/usage'),
      ]);
      setCatalog(c); setSummary(s); setProfile(p); setMethods(m.items || []); setInvoices(i.items || []); setUsage(u.items || []);
      const productCodes = [...new Set((c.plans || []).map((x:any) => x.productCode).filter(Boolean))];
      const subEntries = await Promise.all(productCodes.map(async (code:any) => [code, await request<any>(`/api/v1/commercial/billing/subscription/${encodeURIComponent(code)}`).catch(() => null)] as const));
      setSubscriptions(Object.fromEntries(subEntries));
    } catch (e) { showToast(e instanceof Error ? e.message : 'Gagal memuat billing dari Core.'); }
    finally { setLoading(false); }
  }, [request, showToast]);

  useEffect(() => { void load(); }, [load]);

  const checkout = async () => {
    if (!selectedPlan) return;
    try {
      const key = crypto.randomUUID() + crypto.randomUUID();
      const r = await request<any>('/api/v1/commercial/billing/checkout', { method: 'POST', headers: { 'Idempotency-Key': key }, body: JSON.stringify({ product_code: selectedPlan.productCode, plan_code: selectedPlan.planCode, billing_interval: billingInterval }) });
      if (r.checkout_url) window.location.href = r.checkout_url; else showToast(`Checkout ${r.status || 'dibuat'}; provider belum mengembalikan URL.`);
    } catch (e) { showToast(e instanceof Error ? e.message : 'Checkout gagal.'); }
  };

  const changePlan = async (plan: any) => {
    const sub = subscriptions[plan.productCode];
    if (!sub) return checkout();
    const currentAmount = Number((catalog?.plans || []).find((x:any) => x.productCode === sub.product_code && x.planCode === sub.plan_code)?.monthlyPrice || 0);
    const targetAmount = Number(plan.monthlyPrice || 0);
    const action = targetAmount > currentAmount ? 'upgrade' : targetAmount < currentAmount ? 'downgrade' : 'change';
    try { await request<any>('/api/v1/commercial/billing/subscription/change', { method:'POST', body:JSON.stringify({product_code:plan.productCode,plan_code:plan.planCode,action}) }); showToast(`Perubahan plan ${action} dikirim ke Core.`); setSelectedPlan(null); await load(); }
    catch(e){ showToast(e instanceof Error?e.message:'Perubahan plan gagal.'); }
  };

  const mutateSubscription = async (productCode: string, action: 'cancel'|'reactivate') => {
    try { await request<any>(`/api/v1/commercial/billing/subscription/${encodeURIComponent(productCode)}/${action}`, { method:'POST' }); showToast(`Subscription ${action} berhasil diproses Core.`); await load(); }
    catch(e){ showToast(e instanceof Error?e.message:`Subscription ${action} gagal.`); }
  };

  const openPaymentSetup = async () => {
    try { const b = await request<any>('/api/v1/commercial/billing/payment-methods/setup'); if (b.setup_url) window.open(b.setup_url,'_blank','noopener,noreferrer'); else showToast('Payment provider belum mengembalikan setup URL.'); }
    catch(e){ showToast(e instanceof Error?e.message:'Payment method setup gagal.'); }
  };

  const activeSubscriptionList = useMemo(() => Object.values(subscriptions).filter(Boolean), [subscriptions]);

  return <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
    <div className="flex flex-col sm:flex-row justify-between gap-3"><div><div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 font-mono">NusaSec Commercial Plane</div><h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Billing &amp; Plan</h1><p className="text-xs sm:text-sm text-slate-500">Subscription, invoice, payment method, usage, dan checkout dikelola Core.</p></div><button onClick={()=>void load()} className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold flex gap-2"><RefreshCw className={loading?'w-4 h-4 animate-spin':'w-4 h-4'}/> Refresh</button></div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"><span className="text-xs text-slate-500">Open invoice</span><div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{summary?`${summary.currency} ${(summary.open_amount_minor/100).toFixed(2)}`:'—'}</div></div><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"><span className="text-xs text-slate-500">Paid</span><div className="text-xl font-bold text-emerald-600 mt-1">{summary?`${summary.currency} ${(summary.paid_amount_minor/100).toFixed(2)}`:'—'}</div></div><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"><span className="text-xs text-slate-500">Payment methods</span><div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{methods.length}</div></div><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"><span className="text-xs text-slate-500">Billing email</span><div className="text-sm font-semibold text-slate-900 dark:text-white mt-1 break-all">{profile?.billing_email||'Belum diatur'}</div></div></div>

    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><h3 className="font-bold text-slate-900 dark:text-white flex gap-2 items-center"><CreditCard className="w-4 h-4 text-blue-600"/> Active subscriptions</h3></div><div className="mt-3 space-y-2">{activeSubscriptionList.map((s:any)=><div key={s.product_code} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-3"><div><div className="text-sm font-semibold text-slate-900 dark:text-white">{s.product_code}</div><div className="text-xs text-slate-500">Plan: {s.plan_code} • {s.status}</div><div className="text-[11px] text-slate-400">Period end: {s.current_period_end ? new Date(s.current_period_end).toLocaleString() : '—'}</div></div>{s.status==='CANCEL_AT_PERIOD_END'?<button onClick={()=>void mutateSubscription(s.product_code,'reactivate')} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold flex gap-2"><RotateCcw className="w-3.5 h-3.5"/> Reactivate</button>:s.status==='ACTIVE'||s.status==='TRIAL'?<button onClick={()=>void mutateSubscription(s.product_code,'cancel')} className="px-3 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold flex gap-2"><Ban className="w-3.5 h-3.5"/> Cancel at period end</button>:null}</div>)}</div></div>

    <div className="flex items-center justify-between"><h3 className="font-bold text-slate-900 dark:text-white">Commercial plans</h3><div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl"><button onClick={()=>setBillingInterval('monthly')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${billingInterval==='monthly'?'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm':'text-slate-500'}`}>Monthly</button><button onClick={()=>setBillingInterval('annual')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${billingInterval==='annual'?'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm':'text-slate-500'}`}>Annual</button></div></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">{(catalog?.plans||[]).map((plan:any)=><div key={plan.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4"><div><div className="flex items-center gap-2"><Gem className="w-4 h-4 text-blue-600"/><h3 className="font-bold text-slate-900 dark:text-white">{plan.name}</h3></div><p className="text-xs text-slate-500 mt-1">{plan.subtitle}</p></div><div className="text-3xl font-extrabold text-slate-900 dark:text-white">${billingInterval==='annual'?plan.annualPrice:plan.monthlyPrice}<span className="text-xs font-normal text-slate-400"> / user / {billingInterval==='annual'?'month equivalent':'month'}</span></div><div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 min-h-28">{(plan.features||[]).slice(0,8).map((f:string)=><div key={f}>✓ {f}</div>)}</div><button onClick={()=>setSelectedPlan(plan)} className="w-full px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold">{plan.isCurrent?'Paket Saat Ini':'Pilih / Ubah Paket'}</button></div>)}</div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5"><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><div className="flex justify-between"><h3 className="font-bold text-slate-900 dark:text-white flex gap-2 items-center"><WalletCards className="w-4 h-4 text-blue-600"/> Payment Methods</h3><button onClick={()=>void openPaymentSetup()} className="text-xs font-semibold text-blue-600">Setup</button></div><div className="mt-3 space-y-2">{methods.map(m=><div key={m.id} className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-xl p-3"><span className="text-sm text-slate-900 dark:text-white">{m.label} {m.last4?`•••• ${m.last4}`:''}</span><span className="text-xs text-slate-500">{m.is_default?'Default':m.provider}</span></div>)}{!methods.length&&<div className="text-sm text-slate-400">Belum ada payment method.</div>}</div></div><div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><div className="flex items-center gap-2"><Gauge className="w-4 h-4 text-blue-600"/><h3 className="font-bold text-slate-900 dark:text-white">Usage</h3></div><div className="mt-3 space-y-2">{usage.length?usage.map((u:any)=><div key={`${u.product_code}:${u.meter_code}`} className="flex justify-between text-xs"><span className="text-slate-500">{u.product_code} / {u.meter_code}</span><span className="font-semibold text-slate-900 dark:text-white">{u.quantity}</span></div>):<div className="text-sm text-slate-400">Belum ada usage meter.</div>}</div></div></div>

    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><div className="flex items-center gap-2"><Receipt className="w-4 h-4 text-blue-600"/><h3 className="font-bold text-slate-900 dark:text-white">Invoices</h3></div><div className="mt-3 space-y-2">{invoices.slice(0,8).map(i=><div key={i.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 py-2.5"><div><div className="text-sm font-semibold text-slate-900 dark:text-white">{i.invoice_number}</div><div className="text-[11px] text-slate-500">{i.status} • {i.issued_at?new Date(i.issued_at).toLocaleDateString():'—'}</div></div><div className="text-sm font-mono text-slate-700 dark:text-slate-200">{i.currency} {(i.amount_minor/100).toFixed(2)}</div></div>)}{!invoices.length&&<div className="text-sm text-slate-400">Belum ada invoice.</div>}</div></div>

    {selectedPlan&&<div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"><div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 space-y-4"><h2 className="font-bold text-slate-900 dark:text-white">{selectedPlan.name}</h2><p className="text-sm text-slate-500">Core akan menentukan checkout baru atau perubahan subscription berdasarkan state tenant saat ini.</p><div className="flex gap-2"><button onClick={()=>setSelectedPlan(null)} className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm">Batal</button><button onClick={()=>void (subscriptions[selectedPlan.productCode]?changePlan(selectedPlan):checkout())} className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">Lanjutkan</button></div></div></div>}
  </div>;
};
