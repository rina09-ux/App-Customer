import React, { useState } from 'react';
import {
  Download,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Receipt,
  Filter,
  CreditCard,
  Check,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import { InvoiceItem } from '../types';

interface DetailedInvoice extends InvoiceItem {
  period: string;
  paymentMethod: string;
  pdfSize: string;
}

interface BillingHistoryProps {
  onDownloadInvoice?: (invoiceId: string) => void;
  onExportCsv?: (filename: string, recordCount: number) => void;
}

const EXTENDED_INVOICES: DetailedInvoice[] = [
  {
    id: 'INV-2026-008',
    date: 'Aug 01, 2026',
    period: 'Aug 01 - Aug 31, 2026',
    amount: '$16.00',
    plan: 'Plus Plan (1 User) + AI Add-on ($4)',
    status: 'Paid',
    paymentMethod: 'Visa •••• 4242',
    pdfSize: '124 KB',
    downloadUrl: '#'
  },
  {
    id: 'INV-2026-007',
    date: 'Jul 01, 2026',
    period: 'Jul 01 - Jul 31, 2026',
    amount: '$12.00',
    plan: 'Plus Plan (1 User)',
    status: 'Paid',
    paymentMethod: 'Visa •••• 4242',
    pdfSize: '118 KB',
    downloadUrl: '#'
  },
  {
    id: 'INV-2026-006',
    date: 'Jun 01, 2026',
    period: 'Jun 01 - Jun 30, 2026',
    amount: '$12.00',
    plan: 'Plus Plan (1 User)',
    status: 'Paid',
    paymentMethod: 'Visa •••• 4242',
    pdfSize: '116 KB',
    downloadUrl: '#'
  },
  {
    id: 'INV-2026-005',
    date: 'May 01, 2026',
    period: 'May 01 - May 31, 2026',
    amount: '$0.00',
    plan: 'Free Workspace Tier (Trial)',
    status: 'Paid',
    paymentMethod: 'Trial Allowance',
    pdfSize: '95 KB',
    downloadUrl: '#'
  }
];

export const BillingHistory: React.FC<BillingHistoryProps> = ({
  onDownloadInvoice,
  onExportCsv
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const filteredInvoices = EXTENDED_INVOICES.filter(
    (inv) =>
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (invoice: DetailedInvoice) => {
    setDownloadingId(invoice.id);
    setTimeout(() => {
      setDownloadingId(null);
      setDownloadSuccessId(invoice.id);
      if (onDownloadInvoice) onDownloadInvoice(invoice.id);
      setTimeout(() => setDownloadSuccessId(null), 2500);
    }, 800);
  };

  const handleExportCSV = () => {
    setIsExportingCsv(true);
    const headers = [
      'Invoice ID',
      'Date',
      'Period',
      'Plan Description',
      'Amount (USD)',
      'Status',
      'Payment Method'
    ];

    const rows = filteredInvoices.map((inv) => [
      `"${inv.id}"`,
      `"${inv.date}"`,
      `"${inv.period}"`,
      `"${inv.plan.replace(/"/g, '""')}"`,
      `"${inv.amount.replace('$', '')}"`,
      `"${inv.status}"`,
      `"${inv.paymentMethod}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const filename = `workspace-billing-history-${new Date().getFullYear()}.csv`;

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setIsExportingCsv(false);
      setExportSuccess(true);
      if (onExportCsv) onExportCsv(filename, filteredInvoices.length);
      setTimeout(() => setExportSuccess(false), 2500);
    }, 600);
  };

  return (
    <div id="billing-history-section" className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6 mb-8 transition-colors">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-blue-500"></span>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              BILLING HISTORY &amp; INVOICES
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Riwayat pembayaran faktur resmi, rincian biaya, unduhan dokumen tanda terima PDF, dan ekspor pembukuan.
          </p>
        </div>

        {/* Search Invoices & Export CSV Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="search-invoices-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari faktur..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            disabled={isExportingCsv || filteredInvoices.length === 0}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs shrink-0 ${
              exportSuccess
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 active:scale-98'
            }`}
            title="Ekspor riwayat tagihan ke file CSV untuk pembukuan akuntansi"
          >
            {isExportingCsv ? (
              <>
                <span className="w-3 h-3 border-2 border-slate-800 dark:border-slate-200 border-t-transparent rounded-full animate-spin"></span>
                <span>Mengekspor...</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>CSV Diekspor ✓</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span>Ekspor CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Chips Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/80 text-xs">
        <div className="flex items-center gap-2.5">
          <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Total Tagihan Tahun Ini:</span>
            <span className="font-bold text-slate-900 dark:text-white">$40.00 USD</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Jadwal Tagihan Berikutnya:</span>
            <span className="font-bold text-slate-900 dark:text-white">01 Sep 2026 (Otomatis)</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <CreditCard className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Metode Pembayaran Utama:</span>
            <span className="font-bold text-slate-900 dark:text-white">Visa •••• 4242</span>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">No. Faktur</th>
              <th className="py-3 px-4">Tanggal &amp; Periode</th>
              <th className="py-3 px-4">Deskripsi Paket</th>
              <th className="py-3 px-4">Jumlah</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Faktur PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv) => {
                const isDownloading = downloadingId === inv.id;
                const isSuccess = downloadSuccessId === inv.id;

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{inv.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-900 dark:text-white block">{inv.date}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{inv.period}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-900 dark:text-white block">{inv.plan}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{inv.paymentMethod}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {inv.amount}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        id={`btn-download-invoice-${inv.id.toLowerCase()}`}
                        onClick={() => handleDownload(inv)}
                        disabled={isDownloading}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-2xs ${
                          isSuccess
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 active:scale-95'
                        }`}
                        title="Unduh faktur PDF"
                      >
                        {isDownloading ? (
                          <>
                            <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                            <span className="text-[11px]">Mengunduh...</span>
                          </>
                        ) : isSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[11px]">Tersimpan</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            <span className="text-[11px]">PDF ({inv.pdfSize})</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  Tidak ada faktur yang cocok dengan pencarian "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
