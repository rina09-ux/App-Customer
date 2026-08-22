const configuredCoreUrl = import.meta.env.VITE_NUSASEC_CORE_API_URL || import.meta.env.VITE_NUSASEC_CORE_URL;
const CORE_API_URL = (configuredCoreUrl || (import.meta.env.PROD ? 'https://api.nusasec.com' : '')).replace(/\/$/, '');
const CORE_REQUEST_TIMEOUT_MS = 20000;

if (!CORE_API_URL) {
  throw new Error('NusaSec Core URL is required in non-production builds (set VITE_NUSASEC_CORE_API_URL).');
}

export interface CoreUser {
  email: string;
  display_name?: string;
  tenant_id: string;
  user_type?: string;
  role?: string;
  scopes?: string[];
  must_change_password?: boolean;
  mfa_enabled?: boolean;
  preferred_locale?: string;
  preferred_timezone?: string;
}

export interface LoginResult {
  status: 'authenticated' | 'mfa_required';
  csrf_token?: string;
  challenge_id?: string;
  challenge_token?: string;
  bootstrap?: boolean;
  methods?: string[];
  expires_at?: string;
  mfa_verified?: boolean;
  user?: CoreUser;
}

export interface SignupPayload {
  email: string;
  password: string;
  display_name: string;
  organization_name: string;
  country_code: string;
  timezone: string;
}

export interface SignupResult {
  status: 'verification_required';
  organization?: { tenant_id: string; name: string; slug: string };
  dev_verification_token?: string;
}

export interface MeResult {
  authenticated: boolean;
  auth_method?: string;
  user: CoreUser;
  expires_at?: string | null;
}

function signalFor(input?: AbortSignal | null): AbortSignal {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), CORE_REQUEST_TIMEOUT_MS);
  if (input) {
    if (input.aborted) controller.abort();
    else input.addEventListener('abort', () => controller.abort(), { once: true });
  }
  controller.signal.addEventListener('abort', () => window.clearTimeout(timeout), { once: true });
  return controller.signal;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${CORE_API_URL}${path}`, {
      credentials: 'include',
      ...init,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(init.headers || {}) },
      signal: signalFor(init.signal),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof body?.detail === 'string' ? body.detail : `NusaSec-Core request failed (${response.status})`;
      throw new Error(message);
    }
    return body as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('NusaSec-Core request timed out or was cancelled');
    }
    throw error;
  }
}

export function login(email: string, password: string): Promise<LoginResult> {
  return request<LoginResult>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function signup(payload: SignupPayload): Promise<SignupResult> {
  return request<SignupResult>('/api/v1/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
}

export function verifyEmail(token: string): Promise<{ status: string; email: string; tenant_id: string }> {
  return request<{ status: string; email: string; tenant_id: string }>('/api/v1/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) });
}

export function verifyMfa(challengeId: string, challengeToken: string, code: string, method: 'totp' | 'recovery' = 'totp'): Promise<LoginResult> {
  return request<LoginResult>('/api/v1/auth/mfa/verify', {
    method: 'POST',
    body: JSON.stringify({ challenge_id: challengeId, challenge_token: challengeToken, method, code }),
  });
}

export function me(): Promise<MeResult> { return request<MeResult>('/api/v1/auth/me'); }
export function csrf(): Promise<{ csrf_token: string }> { return request<{ csrf_token: string }>('/api/v1/auth/csrf'); }

export function logout(csrfToken?: string): Promise<{ status: string }> {
  return request<{ status: string }>('/api/v1/auth/logout', {
    method: 'POST',
    headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : undefined,
  });
}

export function getCoreApiUrl(): string { return CORE_API_URL; }
