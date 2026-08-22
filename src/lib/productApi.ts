import { getCoreApiUrl } from './coreApi';

export interface ProductWorkspace {
  product_code?: string;
  display_name?: string;
  status?: string;
  entitlement?: string | Record<string, unknown>;
  plan?: string | Record<string, unknown>;
  features?: unknown[];
  [key: string]: unknown;
}

export interface ProductsMeResponse {
  schema?: string;
  items?: ProductWorkspace[];
}

export async function getMyProducts(): Promise<ProductsMeResponse> {
  const response = await fetch(`${getCoreApiUrl()}/api/v1/products/me`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.detail === 'string'
      ? body.detail
      : `NusaSec-Core product request failed (${response.status})`;
    throw new Error(message);
  }
  return body as ProductsMeResponse;
}

export async function getProductWorkspace(productCode: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${getCoreApiUrl()}/api/v1/products/${encodeURIComponent(productCode)}/workspace`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.detail === 'string'
      ? body.detail
      : `NusaSec-Core workspace request failed (${response.status})`;
    throw new Error(message);
  }
  return body as Record<string, unknown>;
}
