import { requestCore } from './coreRequest';

export interface CoreCloudAccount {
  id: number | string;
  accountId: string;
  provider: string;
  accountRef: string;
  name: string;
  region?: string | null;
  credentialMode?: string;
  identityStatus: string;
  lastValidatedAt?: string | null;
  regionCount: number;
  assetCount: number;
  scanStatus: string;
  scanId?: number | null;
  scanCount: number;
}

export interface CoreCloudAsset {
  id: string;
  scanId: string;
  provider: string;
  assetType: string;
  externalId: string;
  name: string;
  region: string;
  metadata: Record<string, unknown>;
  riskScore: number;
  sensitivity: string;
  status: string;
}

export interface CloudConnectionPayload {
  provider: string;
  account_ref: string;
  name: string;
  credential_mode: string;
  credential_ref: string;
  role_ref?: string;
  external_id_ref?: string;
  permission_profile?: string;
  region_scope?: string[];
  allowed_services?: string[];
  region?: string;
}

export async function getCoreCloudAccounts(): Promise<CoreCloudAccount[]> {
  const body = await requestCore<{ items: CoreCloudAccount[] }>('/api/v1/customer/assets-cloud/accounts');
  return body.items || [];
}

export async function createCoreCloudAccount(payload: CloudConnectionPayload): Promise<{ id: number; identity_id: number; status: string; next: string }> {
  return requestCore('/api/v1/customer/assets-cloud/accounts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function validateCoreCloudAccount(accountId: number): Promise<{ account_id: number; identity_id: number; status: string; validated_at: string; evidence: Record<string, unknown> }> {
  return requestCore(`/api/v1/customer/assets-cloud/accounts/${encodeURIComponent(accountId)}/validate`, {
    method: 'POST',
  });
}

export async function getCoreCloudAssets(params: {
  provider?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<CoreCloudAsset[]> {
  const query = new URLSearchParams();
  if (params.provider && params.provider !== 'all') query.set('provider', params.provider);
  if (params.search) query.set('search', params.search);
  query.set('limit', String(params.limit ?? 100));
  query.set('offset', String(params.offset ?? 0));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const body = await requestCore<{ items: CoreCloudAsset[] }>(`/api/v1/customer/assets-cloud/assets${suffix}`);
  return body.items || [];
}

export async function startCoreCloudScan(accountId: number): Promise<{ id: number; accountId: number; status: string }> {
  const key = `customer-scan:${accountId}:${Date.now()}`;
  return requestCore(`/api/v1/customer/assets-cloud/scans?account_id=${encodeURIComponent(accountId)}&idempotency_key=${encodeURIComponent(key)}`, { method: 'POST' });
}
