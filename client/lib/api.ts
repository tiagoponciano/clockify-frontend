export const TOKEN_STORAGE_KEY = 'clockify.accessToken';

export function isMockApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return;
  }
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function readErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }
  const record = payload as { message?: string | string[]; error?: string };
  if (Array.isArray(record.message)) {
    return record.message.join(', ');
  }
  if (typeof record.message === 'string' && record.message.length > 0) {
    return record.message;
  }
  if (typeof record.error === 'string' && record.error.length > 0) {
    return record.error;
  }
  return fallback;
}

function handleUnauthorized(): void {
  setStoredToken(null);
  unauthorizedHandler?.();
}

export function jsonBody(payload: object): string {
  // Keep null / '' / [] so callers can clear optional fields (e.g. description).
  // Only omit undefined (= "do not send this key").
  const cleaned = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
  return JSON.stringify(cleaned);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (isMockApiEnabled()) {
    const { mockApiFetch } = await import('@/lib/mock/handlers');
    return mockApiFetch<T>(path, init);
  }
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(
      0,
      'Não foi possível conectar ao backend. Confirme se a API está em execução.',
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
      throw new ApiError(401, 'Sessão inválida ou expirada. Faça login novamente.');
    }
    throw new ApiError(response.status, readErrorMessage(payload, `Erro ${response.status} na API.`));
  }

  return payload as T;
}

export function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}
