import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, CreditCard, FileCheck2, Lock, X } from 'lucide-react';
import { PlanTier, BillingCycle } from '../types';

interface UpgradeModalProps {
  plan: PlanTier | null;
  billingCycle: BillingCycle;
  seats: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSuccess: (planName: string) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  plan,
  billingCycle: initialBillingCycle,
  seats: initialSeats,
  isOpen,
  onClose,
  onConfirmSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialBillingCycle);
  const [seatCount, setSeatCount] = useState(Math.max(1, initialSeats || 1));
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'xendit' | 'po'>('stripe');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setBillingCycle(initialBillingCycle);
    setSeatCount(Math.max(1, initialSeats || 1));
    setNotice(null);
  }, [isOpen, initialBillingCycle, initialSeats]);

  const pricing = useMemo(() => {
    if (!plan) return null;
    const unit = billingCycle === 'annually' ? plan.annualPrice : plan.monthlyPrice;
    const subtotal = unit * seatCount;
    const tax = subtotal * 0.11;
    return { unit, subtotal, tax, total: subtotal + tax };
  }, [plan, billingCycle, seatCount]);

  if (!isOpen || !plan || !pricing) return null;

  const goToPayment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !companyName.trim()) {
      setNotice('Lengkapi nama, email, dan nama perusahaan terlebih dahulu.');
      return;
    }
    if (!acceptedTerms) {
      setNotice('Setujui syarat layanan untuk melanjutkan.');
      return;
    }
    setNotice(null);
    setStep(2);
  };

  const submitPayment = (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(
      'Payment gateway production belum terhubung pada Customer UI ini. Tidak ada pembayaran atau perubahan paket yang dipalsukan.'
    );
  };

  const close = () => {
    setStep(1);
    setNotice(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">NusaSec Billing</div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upgrade ke {plan.name}</h2>
          </div>
          <button onClick={close} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
          {[['1', 'Data'], ['2', 'Payment'], ['3', 'Result']].map(([number, label], index) => {
            const current = index + 1;
            return (
              <React.Fragment key={number}>
                <div className={`flex items-center gap-2 ${step === current ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  <span className={`w-6 h-6 rounded-full grid place-items-center ${step >= current ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{number}</span>
                  <span>{label}</span>
                </div>
                {current < 3 && <div className="h-px flex-1 mx-3 bg-slate-200 dark:bg-slate-800" />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950/60">
          {notice && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={goToPayment} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama PIC
                  <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nama penanggung jawab" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                </label>
                <label className="space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email
                  <input required type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="pic@perusahaan.com" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                </label>
                <label className="space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-300 md:col-span-2">
                  Nama perusahaan
                  <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="PT Contoh Indonesia" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <div className="text-[11px] uppercase font-mono text-slate-400">Siklus</div>
                  <div className="mt-2 flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <button type="button" onClick={() => setBillingCycle('monthly')} className={`flex-1 py-1.5 rounded-md text-xs font-semibold ${billingCycle === 'monthly' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'}`}>Bulanan</button>
                    <button type="button" onClick={() => setBillingCycle('annually')} className={`flex-1 py-1.5 rounded-md text-xs font-semibold ${billingCycle === 'annually' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'}`}>Tahunan</button>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <div className="text-[11px] uppercase font-mono text-slate-400">Seat</div>
                  <div className="mt-2 flex items-center justify-between">
                    <button type="button" onClick={() => setSeatCount((v) => Math.max(1, v - 1))} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800">-</button>
                    <span className="font-bold text-slate-900 dark:text-white">{seatCount}</span>
                    <button type="button" onClick={() => setSeatCount((v) => v + 1)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800">+</button>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                  <div className="text-[11px] uppercase font-mono text-slate-400">Total</div>
                  <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">${pricing.total.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">termasuk PPN 11%</div>
                </div>
              </div>

              <label className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-0.5" />
                <span>Saya memahami bahwa proses pembayaran production harus menggunakan gateway yang benar-benar terhubung dan terverifikasi.</span>
              </label>

              <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm">Lanjut ke Payment</button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={submitPayment} className="space-y-5">
              <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 text-xs text-blue-900 dark:text-blue-100">
                <div className="font-bold mb-1">Production gateway belum terhubung</div>
                <div>UI ini sengaja tidak menyimpan nomor kartu, CVV, VA, atau credential pembayaran. Integrasi gateway harus dilakukan melalui backend/Core.</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['stripe', 'xendit', 'po'] as const).map((method) => (
                  <button key={method} type="button" onClick={() => setPaymentMethod(method)} className={`p-4 rounded-xl border text-left ${paymentMethod === method ? 'border-blue-600 ring-2 ring-blue-600/15' : 'border-slate-200 dark:border-slate-800'}`}>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <CreditCard className="w-4 h-4" /> {method === 'stripe' ? 'Stripe' : method === 'xendit' ? 'Xendit' : 'Corporate PO'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Gateway selector</div>
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><Lock className="w-4 h-4" /> Secure payment handoff</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Klik tombol berikut hanya untuk membuat handoff request ke backend. Saat ini backend payment belum dikonfigurasi pada UI Customer.</p>
                <button type="submit" className="w-full py-3 rounded-xl bg-slate-900 dark:bg-blue-600 text-white font-bold text-sm">Buat Payment Handoff</button>
              </div>

              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"><ArrowLeft className="w-4 h-4" /> Kembali</button>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-5 text-center py-8">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upgrade request tercatat</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Status lisensi harus dikonfirmasi oleh backend/Core sebelum dianggap aktif.</p>
              </div>
              <div className="ds-border-beam rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left text-xs space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Plan</span><strong>{plan.name}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Seats</span><strong>{seatCount}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Payment</span><strong className="uppercase">{paymentMethod}</strong></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { onConfirmSuccess(plan.name); close(); }} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm">Tutup</button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><FileCheck2 className="w-3 h-3" /> UI billing hanya menyajikan intent; Core adalah source of truth.</span>
            <span>Currency: USD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
