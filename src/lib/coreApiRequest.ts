const CORE_API_URL = (import.meta.env.VITE_NUSASEC_CORE_API_URL || 'https://api.nusasec.com').replace(/\/$/, '');

export async function requestCore<T>(path: string, init: RequestInit = {}): Promise<T> {
  const csrf = document.cookie.match(/(?:^|; )nusasec_csrf=([^;]+)/)?.[1];
  const headers = new Headers(init.headers || {});
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (csrf && init.method && !['GET', 'HEAD', 'OPTIONS'].includes(init.method.toUpperCase())) {
    headers.set('X-CSRF-Token', decodeURIComponent(csrf));
  }
  const response = await fetch(`${CORE_API_URL}${path}`, { ...init, credentials: 'include', headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body?.detail === 'string' ? body.detail : `NusaSec-Core request failed (${response.status})`);
  return body as T;
}
