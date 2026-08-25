/**
 * Ñkyel AI — Unified Production API Client · SmartANDJ AI Technologies
 * Client HTTP typé et unifié pour toute l'application :
 * - Gestion automatique du token Bearer Clerk JWT
 * - Traçabilité distribuée avec en-tête X-Request-ID
 * - Support natif du streaming SSE pour les missions
 * - Zéro fuite de détails techniques ou de stack traces
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

export interface APIErrorResponse {
  error: string;
  detail?: string;
  statusCode: number;
}

export class NkyelAPIError extends Error {
  statusCode: number;
  detail?: string;

  constructor(message: string, statusCode: number, detail?: string) {
    super(message);
    this.name = 'NkyelAPIError';
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

class NkyelApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  }

  private async getHeaders(token?: string, extraHeaders?: HeadersInit): Promise<Headers> {
    const headers = new Headers(extraHeaders);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (!headers.has('X-Request-Id')) {
      headers.set('X-Request-Id', `req_${Math.random().toString(36).substring(2, 11)}`);
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * Requête générique typée avec parsing d'erreurs propre.
   */
  async request<T>(
    path: string,
    options: RequestInit & { token?: string } = {}
  ): Promise<T> {
    const { token, headers: customHeaders, ...restOptions } = options;
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const headers = await this.getHeaders(token, customHeaders);

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers,
      });

      if (!response.ok) {
        let errorMsg = 'Une erreur est survenue lors de la communication avec le serveur.';
        let detail: string | undefined;
        try {
          const errorJson = await response.json();
          errorMsg = errorJson.detail || errorJson.message || errorMsg;
          detail = errorJson.error;
        } catch {
          // Réponse non-JSON
        }
        throw new NkyelAPIError(errorMsg, response.status, detail);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (err instanceof NkyelAPIError) throw err;
      throw new NkyelAPIError(
        'Impossible de contacter les services Ñkyel. Vérifiez votre connexion.',
        0,
        err.message
      );
    }
  }

  /**
   * Synchronisation idempotente de l'utilisateur Clerk dans Neon.
   */
  async syncClerkUser(user: { id: string; email: string; name?: string }, token: string) {
    return this.request('/api/auth/sync-clerk-user', {
      method: 'POST',
      token,
      body: JSON.stringify({
        clerk_id: user.id,
        email: user.email,
        name: user.name || '',
      }),
    });
  }

  /**
   * Récupération des préférences persistées.
   */
  async getPreferences(token?: string) {
    return this.request('/api/auth/preferences', { method: 'GET', token });
  }

  /**
   * Sauvegarde des préférences utilisateur.
   */
  async updatePreferences(prefs: Record<string, any>, token?: string) {
    return this.request('/api/auth/preferences', {
      method: 'PUT',
      token,
      body: JSON.stringify(prefs),
    });
  }

  /**
   * Récupération des allocations de quotas produit.
   */
  async getQuotas(token?: string) {
    return this.request('/api/auth/quotas', { method: 'GET', token });
  }

  /**
   * Streaming SSE pour l'exécution d'une mission en temps réel.
   */
  async streamMission(
    prompt: string,
    onEvent: (event: any) => void,
    onError: (err: any) => void,
    token?: string,
    signal?: AbortSignal
  ) {
    const url = `${this.baseUrl}/api/v1/agent/run`;
    const headers = await this.getHeaders(token);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: prompt, stream: true }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`Erreur streaming: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Corps de réponse indisponible');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.substring(6);
          if (dataStr === '[DONE]') return;
          try {
            const parsed = JSON.parse(dataStr);
            onEvent(parsed);
          } catch {
            // Ignorer ligne SSE malformée
          }
        }
      }
    } catch (err: any) {
      onError(err);
    }
  }
}

export const apiClient = new NkyelApiClient();
export default apiClient;
