/* GabomaGPT · api.ts · SmartANDJ AI Technologies · Constitution Zion Core
   Wrappers fetch pour le backend Open WebUI */

const BASE = '/api/v1';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
}

/* ── Envoi de message au backend (streaming SSE) ── */
export async function sendChatMessage(
  req: ChatRequest,
  onChunk: (text: string) => void,
  signal?: AbortSignal
) {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...req, stream: true }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Erreur API: ${res.status} ${res.statusText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('Pas de body dans la réponse');

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
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
      } catch {
        /* Ligne SSE malformée, on ignore */
      }
    }
  }
}

/* ── Health check ── */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch('/health', { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

/* ── Liste des modèles ── */
export async function getModels() {
  const res = await fetch(`${BASE}/models`);
  if (!res.ok) throw new Error('Échec récupération modèles');
  return res.json();
}

/* ── Liste des conversations ── */
export async function getChats() {
  const res = await fetch(`${BASE}/chats`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || data || [];
}
