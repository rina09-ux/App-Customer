import React, { useState } from 'react';
import {
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Lock,
  Flame,
  Radio,
  Clock,
  Check
} from 'lucide-react';

interface PlaybookItem {
  id: string;
  name: string;
  category: 'Ransomware' | 'DDoS' | 'Credential Breach' | 'Zero Trust';
  description: string;
  steps: string[];
  executionTime: string;
  lastExecuted: string;
}

const PLAYBOOKS_DATA: PlaybookItem[] = [
  {
    id: 'pb-1',
    name: 'Emergency Cloudflare Under-Attack Mode',
    category: 'DDoS',
    description: 'Aktifkan tantangan Managed JS & CAPTCHA global serta tingkatkan threshold limit Layer 7.',
    steps: ['Edge Challenge Turnstile Active', 'Egress Rate-Limit 50 req/sec', 'Geo-Fence High Risk ASNs'],
    executionTime: '0.8 detik',
    lastExecuted: 'Kemarin'
  },
  {
    id: 'pb-2',
    name: 'Compromised Token Universal Revocation',
    category: 'Credential Breach',
    description: 'Cabut seluruh JWT access token, force logout semua sesi aktif, dan rotasi secret KMS.',
    steps: ['Invalidate Redis Session Store', 'Rotate Signing Public/Private Key', 'Trigger Push 2FA Re-auth'],
    executionTime: '1.2 detik',
    lastExecuted: '4 hari lalu'
  },
  {
    id: 'pb-3',
    name: 'Zero-Trust Host Quarantine & Network Isolation',
    category: 'Ransomware',
    description: 'Isolasi node komputasi yang terinfeksi dari VPC private subnet dan buat snapshot memori forensik.',
    steps: ['Drop VPC Ingress/Egress Security Groups', 'Trigger Memory Dump to S3 Cold Vault', 'Alert On-Call SOC Team'],
    executionTime: '2.1 detik',
    lastExecuted: 'Belum Pernah'
  }
];

export const SecurityPlaybooks: React.FC<{ showToast?: (msg: string) => void }> = ({
  showToast = (_msg: string) => {}
}) => {
  const [runningId, setRunningId] = useState<string | null>(null);
  const [executedPlaybooks, setExecutedPlaybooks] = useState<string[]>([]);

  const handleExecute = (pb: PlaybookItem) => {
    setRunningId(pb.id);
    showToast(`Menjalankan playbook otomatis: "${pb.name}"...`);

    setTimeout(() => {
      setRunningId(null);
      setExecutedPlaybooks((prev) => [...prev, pb.id]);
      showToast(`Playbook "${pb.name}" berhasil dieksekusi dalam ${pb.executionTime}!`);
    }, 1200);
  };

  return (
    <div id="security-playbooks-card" className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Flame className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                AUTOMATED SECOPS INCIDENT PLAYBOOKS (SOAR)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Alur kerja mitigasi ancaman otomatis dengan eksekusi satu klik saat terjadi insiden kritis.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAYBOOKS_DATA.map((pb) => {
          const isRunning = runningId === pb.id;
          const isDone = executedPlaybooks.includes(pb.id);

          return (
            <div
              key={pb.id}
              className="bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-all space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {pb.category}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {pb.executionTime}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{pb.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{pb.description}</p>

                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                  {pb.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700">
                <button
                  onClick={() => handleExecute(pb)}
                  disabled={isRunning}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isDone
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengeksekusi Alur Kerja...</span>
                    </>
                  ) : isDone ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Mitigasi Selesai (Jalankan Ulang)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Jalankan Playbook</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
