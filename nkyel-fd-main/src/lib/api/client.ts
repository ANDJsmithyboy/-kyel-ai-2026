/**
 * Ñkyel AI — Canonical API Client
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Single centralized authenticated API layer for all frontend communication with FastAPI backend.
 * Handles Clerk token acquisition, request timeouts, typed errors, and streaming.
 */

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export type TokenGetter = () => Promise<string | null>;

let globalTokenGetter: TokenGetter | null = null;

/**
 * Registers a global token getter (called by ClerkAuthProvider).
 */
export function setGlobalTokenGetter(getter: TokenGetter) {
  globalTokenGetter = getter;
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return (
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'https://api.nkyel.smartandjai.com'
    ).replace(/\/+$/, '');
  }
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://api.nkyel.smartandjai.com'
  ).replace(/\/+$/, '');
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  // Retrieve token from registered getter or fallback to Clerk on window
  let token: string | null = null;
  if (globalTokenGetter) {
    try {
      token = await globalTokenGetter();
    } catch {
      // Ignored
    }
  }

  if (!token && typeof window !== 'undefined' && (window as any).Clerk?.session) {
    try {
      token = await (window as any).Clerk.session.getToken();
    } catch {
      // Ignored
    }
  }

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const controller = new AbortController();
  const timeoutId = options.timeoutMs
    ? setTimeout(() => controller.abort(), options.timeoutMs)
    : setTimeout(() => controller.abort(), 35000); // 35s default timeout

  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorData: any = null;
      try {
        errorData = await res.json();
      } catch {
        // Not JSON
      }
      const message = errorData?.detail || errorData?.message || `HTTP ${res.status} ${res.statusText}`;
      throw new ApiClientError(message, res.status, errorData);
    }

    // Return empty object for 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof ApiClientError) {
      throw err;
    }
    if (err.name === 'AbortError') {
      throw new ApiClientError('Délai d\'attente de requête dépassé', 408);
    }
    throw new ApiClientError(err.message || 'Erreur réseau', 0);
  }
}

export const api = {
  get: <T = any>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),

  post: <T = any>(path: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T = any>(path: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(path, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  del: <T = any>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};
