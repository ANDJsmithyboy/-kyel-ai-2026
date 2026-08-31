/**
 * Ñkyel AI · Chat Stream API Route — PRODUCTION
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * SSE Streaming with:
 * - Groq 18-key round-robin rotation (primary)
 * - Google Gemini fallback
 * - Real token-by-token SSE
 * - Redis conversation persistence
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheSet, cacheGet } from '@/lib/redis';
import { auth } from '@clerk/nextjs/server';
import { NKYEL_PRODUCTION_SYSTEM_PROMPT } from '@/lib/systemPrompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const SYSTEM_PROMPT = NKYEL_PRODUCTION_SYSTEM_PROMPT;

// ── Groq Key Pool (18 keys round-robin) ─────────────────────
const GROQ_KEYS: string[] = (() => {
  const keys: string[] = [];
  // Collect from env
  const poolEnv = process.env.GROQ_API_KEYS || '';
  if (poolEnv) {
    keys.push(...poolEnv.split(',').map(k => k.trim()).filter(Boolean));
  }
  // Also collect numbered keys
  for (let i = 1; i <= 18; i++) {
    const k = process.env[`GROQ_API_KEY_${i}`];
    if (k && k.trim() && !keys.includes(k.trim())) {
      keys.push(k.trim());
    }
  }
  // Fallback to single key
  if (keys.length === 0 && process.env.GROQ_API_KEY) {
    keys.push(process.env.GROQ_API_KEY);
  }
  return keys;
})();

let groqKeyIndex = 0;
function getNextGroqKey(): string {
  if (GROQ_KEYS.length === 0) return '';
  const key = GROQ_KEYS[groqKeyIndex % GROQ_KEYS.length];
  groqKeyIndex++;
  return key;
}

// ── Gemini Key ──────────────────────────────────────────────
const GEMINI_KEY = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

// ── Model mapping ───────────────────────────────────────────
const GROQ_MODEL_MAP: Record<string, string> = {
  'NKYEL_CHUI': 'openai/gpt-oss-120b',
  'AURATA': 'openai/gpt-oss-120b',
  'aurata': 'openai/gpt-oss-120b',
  'NKYEL_RADI': 'groq/compound-mini',
  'SONAR': 'groq/compound-mini',
  'sonar': 'groq/compound-mini',
  'NKYEL_TAI': 'openai/gpt-oss-120b',
  'nkyel': 'openai/gpt-oss-120b',
  'RECHERCHE_WEB': 'groq/compound',
  'WANDANA': 'groq/compound',
  'wandana': 'groq/compound',
  'BLACK_PANTHER': 'openai/gpt-oss-120b',
  'black-panther': 'openai/gpt-oss-120b',
  'onyxgris': 'openai/gpt-oss-120b',
  'flash': 'openai/gpt-oss-120b',
  'pro': 'openai/gpt-oss-120b',
};

// ── SSE helpers ─────────────────────────────────────────────
function sseEvent(type: string, data: Record<string, any> = {}): string {
  return `data: ${JSON.stringify({ type, ...data })}\n\n`;
}

// ── Stream from Groq with key rotation ──────────────────────
async function streamGroq(
  messages: { role: string; content: string }[],
  model: string,
  maxRetries = 3,
): Promise<Response | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const apiKey = getNextGroqKey();
    if (!apiKey) return null;

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (res.ok && res.body) return res;

      // Rate limited or error → rotate to next key
      console.warn(`Groq key #${(groqKeyIndex - 1) % GROQ_KEYS.length} failed (${res.status}), rotating...`);
    } catch (err) {
      console.warn(`Groq key #${(groqKeyIndex - 1) % GROQ_KEYS.length} network error, rotating...`);
    }
  }
  return null;
}

// ── Stream from Gemini (fallback) ───────────────────────────
async function streamGemini(
  messages: { role: string; content: string }[],
): Promise<Response | null> {
  if (!GEMINI_KEY) return null;

  const geminiModel = process.env.NKYEL_PRIMARY_MODEL || 'gemini-2.0-flash';

  // Convert messages to Gemini format
  const geminiContents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  // System instruction
  const systemMsg = messages.find(m => m.role === 'system');

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?alt=sse&key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiContents,
          systemInstruction: systemMsg
            ? { parts: [{ text: systemMsg.content }] }
            : undefined,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      },
    );

    if (res.ok && res.body) return res;
    console.warn(`Gemini fallback failed: ${res.status}`);
  } catch (err) {
    console.warn('Gemini fallback error:', err);
  }
  return null;
}

// ── Main POST handler ───────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const message = rawBody.message || rawBody.content || '';
    const history = Array.isArray(rawBody.history) ? rawBody.history : [];
    const model = rawBody.model || 'AURATA';
    const conversationId = rawBody.conversationId || `conv-${Date.now()}`;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Contenu vide' }, { status: 400 });
    }

    const trimmedMessage = message.trim();

    // Build messages array
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content || '',
      })),
      { role: 'user', content: trimmedMessage },
    ];

    const groqModel = GROQ_MODEL_MAP[model] || 'openai/gpt-oss-120b';

    // Try Groq first (with rotation), then Gemini fallback
    let providerResponse = await streamGroq(formattedMessages, groqModel);
    let provider: 'groq' | 'gemini' = 'groq';

    if (!providerResponse) {
      providerResponse = await streamGemini(formattedMessages);
      provider = 'gemini';
    }

    if (!providerResponse || !providerResponse.body) {
      // Ultimate fallback: static response
      const fallbackStream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          const text = "Je suis Ñkyel AI. Les serveurs sont temporairement surchargés. Réessayez dans un instant.";
          controller.enqueue(encoder.encode(sseEvent('token', { content: text })));
          controller.enqueue(encoder.encode(sseEvent('done')));
          controller.close();
        },
      });
      return new Response(fallbackStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Transform provider SSE → Ñkyel SSE format
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const reader = providerResponse!.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        try {
          // Send reflection_start
          controller.enqueue(encoder.encode(sseEvent('reflection_start', { provider })));

          let firstToken = true;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              const dataStr = trimmed.slice(6).trim();
              if (dataStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(dataStr);
                let token = '';

                if (provider === 'groq') {
                  token = parsed.choices?.[0]?.delta?.content || '';
                } else {
                  // Gemini format
                  token = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                }

                if (token) {
                  if (firstToken) {
                    controller.enqueue(encoder.encode(sseEvent('reflection_end')));
                    firstToken = false;
                  }
                  fullContent += token;
                  controller.enqueue(encoder.encode(sseEvent('token', { content: token })));
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }

          if (firstToken) {
            controller.enqueue(encoder.encode(sseEvent('reflection_end')));
          }

          // Persist to Redis
          try {
            const existing = (await cacheGet<any[]>(`conv:${conversationId}`)) || [];
            existing.push(
              { role: 'user', content: trimmedMessage, timestamp: Date.now() },
              { role: 'assistant', content: fullContent, timestamp: Date.now() },
            );
            await cacheSet(`conv:${conversationId}`, existing, 86400 * 7);
          } catch {
            // Non-blocking
          }

          controller.enqueue(encoder.encode(sseEvent('done', { content: fullContent })));
        } catch (streamErr) {
          console.error('Stream error:', streamErr);
          controller.enqueue(encoder.encode(sseEvent('error', { message: 'Erreur de flux' })));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    console.error('Chat stream handler error:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
