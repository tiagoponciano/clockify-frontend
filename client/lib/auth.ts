import type { UserDto } from '@/lib/types';
import { mapBackendUser } from '@/lib/api-mappers';
import { apiFetch, getApiBaseUrl, getStoredToken, setStoredToken } from './api';

const PENDING_EMAIL_KEY = 'clockify.pendingEmail';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  status: UserDto['status'];
  role: UserDto['role'];
}

export type Session =
  | { kind: 'user'; user: AuthUser }
  | { kind: 'open' };

export function getGoogleAuthUrl(): string {
  return `${getApiBaseUrl()}/api/auth/google`;
}

export function getPendingEmail(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage.getItem(PENDING_EMAIL_KEY);
}

export function setPendingEmail(email: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (email) {
    window.sessionStorage.setItem(PENDING_EMAIL_KEY, email);
    return;
  }
  window.sessionStorage.removeItem(PENDING_EMAIL_KEY);
}

export async function getSession(): Promise<Session | null> {
  const payload = await apiFetch<AuthUser | { message: string } | Record<string, unknown>>(
    '/api/auth/me',
  );
  if ('email' in payload && typeof payload.email === 'string' && payload.email) {
    return { kind: 'user', user: mapBackendUser(payload as Parameters<typeof mapBackendUser>[0]) as AuthUser };
  }
  if ('message' in payload) {
    return { kind: 'open' };
  }
  return null;
}

export async function getMe(): Promise<AuthUser | null> {
  const session = await getSession();
  return session?.kind === 'user' ? session.user : null;
}

export function logout(): void {
  setStoredToken(null);
  setPendingEmail(null);
}

export { getStoredToken };
