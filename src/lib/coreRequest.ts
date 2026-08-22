const configuredCoreUrl = import.meta.env.VITE_NUSASEC_CORE_API_URL || import.meta.env.VITE_NUSASEC_CORE_URL;
const CORE_API_URL = (configuredCoreUrl || (import.meta.env.PROD ? 'https://api.nusasec.com' : '')).replace(/\/$/, '');
const CORE_REQUEST_TIMEOUT_MS = 20000;

if (!CORE_API_URL) {
  throw new Error('NusaSec Core URL is required in non-production builds (set VITE_NUSASEC_CORE_API_URL).');
}

let csrfToken: string | null = null;

export function setCoreCsrfToken(token: string | null): void {
  csrfToken = token;
}

export function getCoreCsrfToken(): string | null {
  return csrfToken;
}

function timeoutSignal(existing?: AbortSignal | null): AbortSignal {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), CORE_REQUEST_TIMEOUT_MS);
  if (existing) {
    if (existing.aborted) controller.abort();
    else existing.addEventListener('abort', () => controller.abort(), { once: true });
  }
  controller.signal.addEventListener('abort', () => window.clearTimeout(timeout), { once: true });
  return controller.signal;
}

async function loadCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  const response = await fetch(`${CORE_API_URL}/api/v1/auth/csrf`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: timeoutSignal(),
  });
  if (!response.ok) throw new Error(`Unable to obtain Core CSRF token (${response.status})`);
  const body = await response.json().catch(() => ({}));
  if (typeof body?.csrf_token !== 'string' || !body.csrf_token) {
    throw new Error('Core did not return a valid CSRF token');
  }
  csrfToken = body.csrf_token;
  return csrfToken;
}

export async function requestCore<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const method = (init.method || 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = await loadCsrfToken();
    headers.set('X-CSRF-Token', token);
  }
  let response: Response;
  try {
    response = await fetch(`${CORE_API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers,
      cache: 'no-store',
      signal: timeoutSignal(init.signal),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('NusaSec-Core request timed out or was cancelled');
    }
    throw error;
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.detail === 'string' ? body.detail : `NusaSec-Core request failed (${response.status})`;
    throw new Error(message);
  }
  return body as T;
}

export async function requestCoreMultipart<T>(path: string, body: FormData, signal?: AbortSignal): Promise<T> {
  const token = await loadCsrfToken();
  const headers = new Headers({ Accept: 'application/json', 'X-CSRF-Token': token });
  const response = await fetch(`${CORE_API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body,
    cache: 'no-store',
    signal: timeoutSignal(signal),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof result?.detail === 'string' ? result.detail : `NusaSec-Core request failed (${response.status})`);
  return result as T;
}
