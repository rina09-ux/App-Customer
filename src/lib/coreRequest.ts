const CORE_API_URL = (import.meta.env.VITE_NUSASEC_CORE_API_URL || import.meta.env.VITE_NUSASEC_CORE_URL || 'https://api.nusasec.com').replace(/\/$/, '');

let csrfToken: string | null = null;

export function setCoreCsrfToken(token: string | null): void {
  csrfToken = token;
}

export function getCoreCsrfToken(): string | null {
  return csrfToken;
}

async function loadCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  const response = await fetch(`${CORE_API_URL}/api/v1/auth/csrf`, { credentials: 'include', headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) return null;
  const body = await response.json().catch(() => ({}));
  if (typeof body?.csrf_token === 'string' && body.csrf_token) {
    csrfToken = body.csrf_token;
    return csrfToken;
  }
  return null;
}

export async function requestCore<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const method = (init.method || 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = await loadCsrfToken();
    if (token) headers.set('X-CSRF-Token', token);
  }
  const response = await fetch(`${CORE_API_URL}${path}`, { ...init, credentials: 'include', headers, cache: 'no-store' });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body?.detail === 'string' ? body.detail : `NusaSec-Core request failed (${response.status})`);
  return body as T;
}

export async function requestCoreMultipart<T>(path: string, body: FormData): Promise<T> {
  const token = await loadCsrfToken();
  const headers = new Headers({ Accept: 'application/json' });
  if (token) headers.set('X-CSRF-Token', token);
  const response = await fetch(`${CORE_API_URL}${path}`, { method: 'POST', credentials: 'include', headers, body, cache: 'no-store' });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof result?.detail === 'string' ? result.detail : `NusaSec-Core request failed (${response.status})`);
  return result as T;
}
