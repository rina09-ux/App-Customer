import { requestCore } from './coreApiRequest';

export interface CoreRiskFinding {
  id: string;
  findingKey: string;
  title: string;
  severity: string;
  cvss?: number | null;
  asset: string;
  exposureVector: string;
  remediationPlan: string;
  businessCriticality: string;
  status: string;
  priority: string;
  provider: string;
  cve?: string | null;
  detectedAt?: string | null;
  owner?: string | null;
  dueAt?: string | null;
  exception?: boolean;
}

export async function getRiskFindings(params: { severity?: string; search?: string; status?: string } = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && query.set(k, v));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return requestCore<{ items: CoreRiskFinding[]; pagination: unknown }>(`/api/v1/customer/risk-exposure/findings${suffix}`);
}

export function remediateRiskFinding(findingKey: string) {
  return requestCore<{ findingKey: string; status: string; idempotent: boolean }>(`/api/v1/customer/risk-exposure/remediation/${encodeURIComponent(findingKey)}`, { method: 'POST' });
}
