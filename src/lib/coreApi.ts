const CORE_API_URL = (import.meta.env.VITE_NUSASEC_CORE_URL || 'https://api.nusasec.com').replace(/\/$/, '');

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
  organization?: {
    tenant_id: string;
    name: string;
    slug: string;
  };
  dev_verification_token?: string;
}

export interface MeResult {
  authenticated: boolean;
  auth_method?: string;
  user: CoreUser;
  expires_at?: string | null;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${CORE_API_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.detail === 'string' ? body.detail : `NusaSec-Core request failed (${response.status})`;
    throw new Error(message);
  }
  return body as T;
}

export function login(email: string, password: string): Promise<LoginResult> {
  return request<LoginResult>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function signup(payload: SignupPayload): Promise<SignupResult> {
  return request<SignupResult>('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function verifyEmail(token: string): Promise<{ status: string; email: string; tenant_id: string }> {
  return request<{ status: string; email: string; tenant_id: string }>('/api/v1/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function verifyMfa(
  challengeId: string,
  challengeToken: string,
  code: string,
  method: 'totp' | 'recovery' = 'totp',
): Promise<LoginResult> {
  return request<LoginResult>('/api/v1/auth/mfa/verify', {
    method: 'POST',
    body: JSON.stringify({
      challenge_id: challengeId,
      challenge_token: challengeToken,
      method,
      code,
    }),
  });
}

export function me(): Promise<MeResult> {
  return request<MeResult>('/api/v1/auth/me');
}

export function csrf(): Promise<{ csrf_token: string }> {
  return request<{ csrf_token: string }>('/api/v1/auth/csrf');
}

export function logout(csrfToken?: string): Promise<{ status: string }> {
  return request<{ status: string }>('/api/v1/auth/logout', {
    method: 'POST',
    headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : undefined,
  });
}

export function getCoreApiUrl(): string {
  return CORE_API_URL;
}
