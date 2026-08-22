import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Mail,
  Sliders,
  Sparkles,
  Check,
  TrendingUp
} from 'lucide-react';

interface UsageThresholdAlertProps {
  currentMonthlySpend?: number;
  onSaveAlertSettings?: (settings: { enabled: boolean; amount: number; email: string }) => void;
}

export const UsageThresholdAlert: React.FC<UsageThresholdAlertProps> = ({
  currentMonthlySpend = 16,
  onSaveAlertSettings
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [alertAmount, setAlertAmount] = useState<number>(50);
  const [recipientEmail, setRecipientEmail] = useState<string>('nurlaelaazwini66@gmail.com');
  const [notifyAt80, setNotifyAt80] = useState<boolean>(true);
  const [notifyAt100, setNotifyAt100] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const presets = [25, 50, 100, 200, 500];

  const percentageUsed = alertAmount > 0 ? Math.min(100, Math.round((currentMonthlySpend / alertAmount) * 100)) : 0;
  const isNearLimit = percentageUsed >= 80 && percentageUsed < 100;
  const isOverLimit = percentageUsed >= 100;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    if (onSaveAlertSettings) {
      onSaveAlertSettings({
        enabled: isEnabled,
        amount: alertAmount,
        email: recipientEmail
      });
    }
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div id="threshold-alerts-section" className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6 mb-8">
      {/* Header with Main Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <BellRing className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
              <span className="text-[12px] font-bold uppercase tracking-wider text-slate-800">
                USAGE &amp; SPEND THRESHOLD ALERTS
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.2 rounded-full uppercase">
                Proactive Protection
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Atur batas anggaran bulanan dan terima notifikasi otomatis sebelum batas kuota atau tagihan tercapai.
            </p>
          </div>
        </div>

        {/* Master Toggle Switch */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-700">
            {isEnabled ? 'Peringatan Aktif' : 'Peringatan Nonaktif'}
          </span>
          <button
            type="button"
            id="threshold-alert-toggle"
            role="switch"
            aria-checked={isEnabled}
            onClick={() => setIsEnabled(!isEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
              isEnabled ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {isEnabled ? (
        <form onSubmit={handleSave} className="space-y-6 pt-2 border-t border-slate-100">
          {/* Spend Progress Visualizer */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                Penggunaan Anggaran Bulan Berjalan:
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  ${currentMonthlySpend.toFixed(2)}
                </span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-600 font-semibold">
                  Batas ${alertAmount.toFixed(2)} USD
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isOverLimit
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : isNearLimit
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {isOverLimit ? 'Melebihi Batas' : isNearLimit ? 'Mendekati Batas' : 'Aman (In Budget)'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverLimit
                    ? 'bg-rose-600'
                    : isNearLimit
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${percentageUsed}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>$0.00</span>
              <span>{percentageUsed}% Terpakai</span>
              <span>${alertAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Amount Input & Preset Options */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Column */}
            <div className="space-y-2">
              <label htmlFor="threshold-amount-input" className="text-xs font-bold text-slate-800 block">
                Nominal Ambang Batas Bulanan ($ USD)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                  $
                </div>
                <input
                  id="threshold-amount-input"
                  type="number"
                  min="5"
                  max="10000"
                  step="5"
                  required
                  value={alertAmount}
                  onChange={(e) => setAlertAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="50.00"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-2xs"
                />
              </div>

              {/* Preset Quick Select Pills */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">Pilih cepat:</span>
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAlertAmount(val)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold border transition-all ${
                      alertAmount === val
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Email Column */}
            <div className="space-y-2">
              <label htmlFor="threshold-email-input" className="text-xs font-bold text-slate-800 block">
                Kirim Notifikasi Email Ke
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="threshold-email-input"
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="admin@perusahaan.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Peringatan instan akan dikirimkan saat pemakaian paket, add-on, atau seat mencapai ambang batas.
              </p>
            </div>
          </div>

          {/* Trigger Condition Checkboxes */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={notifyAt80}
                  onChange={(e) => setNotifyAt80(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Peringatkan saat mencapai 80% (${(alertAmount * 0.8).toFixed(2)})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={notifyAt100}
                  onChange={(e) => setNotifyAt100(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span>Peringatkan saat mencapai 100% (${alertAmount.toFixed(2)})</span>
              </label>
            </div>

            <button
              id="save-threshold-alert-btn"
              type="submit"
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Pengaturan Disimpan ✓</span>
                </>
              ) : (
                <span>Simpan Pengaturan Batas</span>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Peringatan ambang batas saat ini dinonaktifkan. Aktifkan toggle di atas untuk mengontrol batas pengeluaran otomatis.</span>
        </div>
      )}
    </div>
  );
};
