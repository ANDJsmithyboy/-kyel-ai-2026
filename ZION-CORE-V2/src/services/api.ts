/* GabomaGPT · api.ts · SmartANDJ AI Technologies
   Service de communication avec le backend FastAPI Gaboma AI v1
   Fondateur : Daniel Jonathan ANDJ */

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/* ── Types ────────────────────────────────────────── */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onToken?: (token: string) => void;
  onAgentStep?: (step: { type: string; label: string; status: 'running' | 'done' | 'warning' }) => void;
  onSources?: (sources: any[]) => void;
  onRendu?: (rendu: any) => void;
  onDone?: (fullText: string, conversationId?: string) => void;
  onError?: (error: string) => void;
}

/* ── Helpers ───────────────────────────────────────── */

function getHeaders(token: string | null): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

/**
 * Lit un stream SSE générique et dispatch les callbacks
 */
async function processStream(
  res: Response,
  callbacks: StreamCallbacks,
) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    callbacks.onError?.(err.detail || `Erreur API ${res.status}`);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    callbacks.onError?.('Stream non disponible');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  const _STEP_LABELS: Record<string, string> = {
    web_search: "Wandana recherche...",
    planner: "Planification stratégique...",
    reporter: "Rédaction du rapport...",
    coder: "Écriture du code...",
    reviewer: "Révision en cours...",
    artifact: "Génération du rendu...",
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        
        const dataStr = trimmed.slice(6);
        if (dataStr === '[DONE]') {
          continue; 
        }

        try {
          const event = JSON.parse(dataStr);
          
          if (event.type === 'token') {
            callbacks.onToken?.(event.text || event.content || '');
          } else if (event.type === 'agent_step') {
            callbacks.onAgentStep?.(event.step);
          } else if (event.type === 'messages-tuple') {
            const data = event.data || {};
            // AI sending text chunks
            if (data.type === 'ai') {
              if (data.content) {
                callbacks.onToken?.(data.content);
              }
              // AI invoking a tool
              if (data.tool_calls && data.tool_calls.length > 0) {
                for (const tc of data.tool_calls) {
                  callbacks.onAgentStep?.({
                    type: tc.name,
                    label: _STEP_LABELS[tc.name] || `Exécution: ${tc.name}...`,
                    status: 'running'
                  });
                }
              }
            }
            // Tool execution finished
            else if (data.type === 'tool') {
              callbacks.onAgentStep?.({
                type: data.name,
                label: _STEP_LABELS[data.name] || `Terminé: ${data.name}`,
                status: 'done'
              });
            }
          } else if (event.type === 'sources') {
            callbacks.onSources?.(event.sources);
          } else if (event.type === 'rendu') {
            callbacks.onRendu?.(event.rendu);
          } else if (event.type === 'error') {
            callbacks.onError?.(event.message || event.error);
          } else if (event.type === 'done' || event.type === 'done_all') {
            callbacks.onDone?.(event.content || '', event.conversation_id);
          }
        } catch (e) {
          // Ligne JSON invalide (peut arriver si chunking bizarre)
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    callbacks.onError?.((err as Error).message);
  }
}

/* ── Endpoints ─────────────────────────────────────── */

/**
 * Lance une conversation classique (AURATA / SONAR) via /v1/chat/completions
 */
export async function streamChat(
  token: string | null,
  model: string,
  message: string,
  history: ChatMessage[],
  callbacks: StreamCallbacks,
  conversationId?: string,
  signal?: AbortSignal,
) {
  try {
    const res = await fetch(`/api/chat/stream`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        message,
        history,
        model,
        conversationId,
        loxoEnabled: true,
      }),
      signal,
    });
    
    await processStream(res, callbacks);
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    callbacks.onError?.((err as Error).message);
  }
}

/**
 * Lance le mode Agent (ONYX / BLACK PANTHER) via /v1/agent/run
 */
export async function streamAgent(
  token: string | null,
  model: string,
  message: string,
  callbacks: StreamCallbacks,
  conversationId?: string,
  context?: string,
  signal?: AbortSignal,
) {
  try {
    const res = await fetch(`${BASE}/v1/agent/run`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        message,
        context,
        model,
        conversation_id: conversationId,
        plan_mode: false,
      }),
      signal,
    });
    
    await processStream(res, callbacks);
  } catch (err) {
    if ((err as Error).name === 'AbortError') return;
    callbacks.onError?.((err as Error).message);
  }
}
export interface ModelInfo {
  id: string;
  name: string;
  owned_by?: string;
}

export async function getModels(token: string): Promise<ModelInfo[]> {
  try {
    const res = await fetch(`${BASE}/v1/models`, {
      headers: getHeaders(token),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getDocuments(token: string): Promise<any[]> {
  try {
    const res = await fetch(`${BASE}/v1/documents`, {
      headers: getHeaders(token),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function uploadDocument(token: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  
  const h: Record<string, string> = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${BASE}/v1/documents/upload`, {
    method: 'POST',
    headers: h,
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return await res.json();
}

export async function deleteDocument(token: string, id: string): Promise<void> {
  const res = await fetch(`${BASE}/v1/documents/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Delete failed');
}

export async function streamChatCompletion(
  token: string | null,
  model: string,
  messages: ChatMessage[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal
) {
  const history = messages.slice(0, -1);
  const message = messages[messages.length > 0 ? messages.length - 1 : 0]?.content || '';
  return streamChat(token, model, message, history, callbacks, undefined, signal);
}
