import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CoreUser, LoginResult, SignupPayload, SignupResult, csrf, login, logout, me, signup, verifyEmail, verifyMfa } from '../lib/coreApi';
import { setCoreCsrfToken } from '../lib/coreRequest';

interface PendingMfa {
  challengeId: string;
  challengeToken: string;
  bootstrap?: boolean;
  methods?: string[];
}

interface AuthContextValue {
  loading: boolean;
  authenticated: boolean;
  user: CoreUser | null;
  csrfToken: string | null;
  pendingMfa: PendingMfa | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<LoginResult>;
  signUp: (payload: SignupPayload) => Promise<SignupResult>;
  verifyEmail: (token: string) => Promise<{ status: string; email: string; tenant_id: string }>;
  verifyLoginMfa: (code: string, method?: 'totp' | 'recovery') => Promise<LoginResult>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<CoreUser | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [pendingMfa, setPendingMfa] = useState<PendingMfa | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      const result = await me();
      setAuthenticated(Boolean(result.authenticated));
      setUser(result.authenticated ? result.user : null);
      if (result.authenticated) {
        try {
          const token = (await csrf()).csrf_token;
          setCsrfToken(token);
          setCoreCsrfToken(token);
        } catch {
          setCsrfToken(null);
          setCoreCsrfToken(null);
        }
      } else {
        setCsrfToken(null);
        setCoreCsrfToken(null);
      }
      setError(null);
    } catch {
      setAuthenticated(false);
      setUser(null);
      setCsrfToken(null);
      setCoreCsrfToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const result = await login(email.trim(), password);
    if (result.status === 'mfa_required' && result.challenge_id && result.challenge_token) {
      setPendingMfa({
        challengeId: result.challenge_id,
        challengeToken: result.challenge_token,
        bootstrap: result.bootstrap,
        methods: result.methods,
      });
      return result;
    }
    if (!result.user) throw new Error('Core login berhasil tetapi user tidak dikembalikan.');
    setAuthenticated(true);
    setUser(result.user);
    setCsrfToken(result.csrf_token || null);
    setCoreCsrfToken(result.csrf_token || null);
    setPendingMfa(null);
    return result;
  }, []);

  const signUp = useCallback(async (payload: SignupPayload) => {
    setError(null);
    return signup(payload);
  }, []);

  const verifyEmailFromToken = useCallback(async (token: string) => {
    setError(null);
    return verifyEmail(token.trim());
  }, []);

  const verifyLoginMfa = useCallback(async (code: string, method: 'totp' | 'recovery' = 'totp') => {
    if (!pendingMfa) throw new Error('MFA challenge tidak tersedia.');
    setError(null);
    const result = await verifyMfa(pendingMfa.challengeId, pendingMfa.challengeToken, code.trim(), method);
    if (!result.user) throw new Error('MFA berhasil tetapi user tidak dikembalikan.');
    setAuthenticated(true);
    setUser(result.user);
    setCsrfToken(result.csrf_token || null);
    setCoreCsrfToken(result.csrf_token || null);
    setPendingMfa(null);
    return result;
  }, [pendingMfa]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await logout(csrfToken || undefined);
    } finally {
      setAuthenticated(false);
      setUser(null);
      setCsrfToken(null);
      setCoreCsrfToken(null);
      setPendingMfa(null);
      setLoading(false);
    }
  }, [csrfToken]);

  const value = useMemo<AuthContextValue>(() => ({
    loading,
    authenticated,
    user,
    csrfToken,
    pendingMfa,
    error,
    signIn: async (email, password) => {
      try { return await signIn(email, password); }
      catch (err) {
        const message = err instanceof Error ? err.message : 'Login gagal.';
        setError(message);
        throw err;
      }
    },
    signUp: async (payload) => {
      try { return await signUp(payload); }
      catch (err) {
        const message = err instanceof Error ? err.message : 'Pendaftaran gagal.';
        setError(message);
        throw err;
      }
    },
    verifyEmail: async (token) => {
      try { return await verifyEmailFromToken(token); }
      catch (err) {
        const message = err instanceof Error ? err.message : 'Verifikasi email gagal.';
        setError(message);
        throw err;
      }
    },
    verifyLoginMfa: async (code, method) => {
      try { return await verifyLoginMfa(code, method); }
      catch (err) {
        const message = err instanceof Error ? err.message : 'Verifikasi MFA gagal.';
        setError(message);
        throw err;
      }
    },
    signOut,
    refreshSession,
    clearError: () => setError(null),
  }), [loading, authenticated, user, csrfToken, pendingMfa, error, signIn, signUp, verifyEmailFromToken, verifyLoginMfa, signOut, refreshSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return context;
}
