/**
 * Ñkyel AI · Chat Stream API Route (LEGACY COMPATIBILITY FALLBACK)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * NOTE: Production chat execution is 100% owned by FastAPI:
 * - DEERFLOW / AGENT: POST https://api.nkyel.smartandjai.com/api/v1/nkyel/run
 * - COMPLETIONS: POST https://api.nkyel.smartandjai.com/api/v1/chat/completions
 * - PERSISTENCE: Neon PostgreSQL (public.conversations, public.messages)
 * This route is retained solely as a graceful fallback.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheSet, cacheGet } from '@/lib/redis';
import { NKYEL_PRODUCTION_SYSTEM_PROMPT } from '@/lib/systemPrompt';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const SYSTEM_PROMPT = NKYEL_PRODUCTION_SYSTEM_PROMPT;

// ── Groq Key Pool (round-robin) ─────────────────────────────
const GROQ_KEYS: string[] = (() => {
  const keys: string[] = [];
  const poolEnv = process.env.GROQ_API_KEYS || '';
  if (poolEnv) {
    keys.push(...poolEnv.split(',').map(k => k.trim()).filter(Boolean));
  }
  for (let i = 1; i <= 18; i++) {
    const k = process.env[`GROQ_API_KEY_${i}`];
    if (k && k.trim() && !keys.includes(k.trim())) {
      keys.push(k.trim());
    }
  }
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

// ── Tavily Key Pool ─────────────────────────────────────────
const TAVILY_KEYS: string[] = (() => {
  const keys: string[] = [];
  const poolEnv = process.env.TAVILY_API_KEYS || '';
  if (poolEnv) {
    keys.push(...poolEnv.split(',').map(k => k.trim()).filter(Boolean));
  }
  if (keys.length === 0 && process.env.TAVILY_API_KEY) {
    keys.push(process.env.TAVILY_API_KEY);
  }
  return keys;
})();

let tavilyKeyIndex = 0;
function getNextTavilyKey(): string {
  if (TAVILY_KEYS.length === 0) return '';
  const key = TAVILY_KEYS[tavilyKeyIndex % TAVILY_KEYS.length];
  tavilyKeyIndex++;
  return key;
}

// ── Model mapping ───────────────────────────────────────────
const GROQ_MODEL_MAP: Record<string, string> = {
  'NKYEL_CHUI': 'groq/compound',
  'AURATA': 'groq/compound',
  'aurata': 'groq/compound',
  'NKYEL_RADI': 'groq/compound-mini',
  'SONAR': 'groq/compound-mini',
  'sonar': 'groq/compound-mini',
  'NKYEL_TAI': 'qwen/qwen3.8-27b',
  'nkyel': 'groq/compound',
  'RECHERCHE_WEB': 'groq/compound',
  'WANDANA': 'groq/compound',
  'wandana': 'groq/compound',
  'BLACK_PANTHER': 'groq/compound',
  'black-panther': 'groq/compound',
  'onyxgris': 'groq/compound',
  'flash': 'groq/compound-mini',
  'pro': 'groq/compound',
};

// ══════════════════════════════════════════════════════════════
// SSE Helpers
// ══════════════════════════════════════════════════════════════

function sseEvent(type: string, data: Record<string, any> = {}): string {
  return `data: ${JSON.stringify({ type, ...data })}\n\n`;
}

// ══════════════════════════════════════════════════════════════
// INTENT DETECTION — Does this query require real web search?
// ══════════════════════════════════════════════════════════════

const RESEARCH_KEYWORDS_FR = [
  'recherche', 'rechercher', 'analyse', 'analyser', 'comparer', 'comparaison',
  'marché', 'market', 'étude', 'rapport', 'sources', 'web', 'internet',
  'plateformes', 'platforms', 'concurrent', 'concurrents', 'benchmark',
  'tendances', 'trends', 'stratégi', 'investissement', 'mission',
  'générer pdf', 'générer pptx', 'générer docx', 'générer xlsx',
  'generate pdf', 'generate pptx', 'generate docx', 'generate xlsx',
  'agentic ai', 'intelligence artificielle', 'souverain',
];

const RESEARCH_KEYWORDS_EN = [
  'research', 'analyze', 'compare', 'comparison', 'market', 'study',
  'report', 'sources', 'platforms', 'competitors', 'benchmark',
  'trends', 'strategic', 'investment', 'mission',
  'generate pdf', 'generate pptx', 'generate docx', 'generate xlsx',
  'agentic ai', 'artificial intelligence', 'sovereign',
];

function detectResearchIntent(message: string): boolean {
  const lower = message.toLowerCase();
  if (lower.includes('reply exactly') || lower.includes('google review ok')) {
    return false;
  }
  if (
    lower.includes('research') ||
    lower.includes('recherche') ||
    lower.includes('mcp') ||
    lower.includes('source')
  ) {
    return true;
  }
  const allKeywords = [...RESEARCH_KEYWORDS_FR, ...RESEARCH_KEYWORDS_EN];
  for (const kw of allKeywords) {
    if (lower.includes(kw)) {
      return true;
    }
  }
  return false;
}

// ══════════════════════════════════════════════════════════════
// REAL TAVILY SEARCH — Returns actual web results
// ══════════════════════════════════════════════════════════════

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

async function executeTavilySearch(
  query: string,
  maxResults: number = 5,
): Promise<{ results: TavilyResult[]; error: string | null }> {
  const apiKey = getNextTavilyKey();
  if (!apiKey) {
    return { results: [], error: 'TAVILY_API_KEY_NOT_CONFIGURED' };
  }

  // Try each key on failure
  for (let attempt = 0; attempt < TAVILY_KEYS.length; attempt++) {
    const key = TAVILY_KEYS[(tavilyKeyIndex - 1 + attempt) % TAVILY_KEYS.length];
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: key,
          query,
          max_results: maxResults,
          search_depth: 'advanced',
          include_answer: false,
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const results: TavilyResult[] = (data.results || []).map((r: any) => ({
        title: r.title || '',
        url: r.url || '',
        content: r.content || '',
        score: r.score || 0,
      }));

      return { results, error: null };
    } catch {
      continue;
    }
  }

  return { results: [], error: 'TAVILY_ALL_KEYS_FAILED' };
}

// ══════════════════════════════════════════════════════════════
// GENERATE SEARCH QUERIES from user message
// ══════════════════════════════════════════════════════════════

function generateSearchQueries(message: string): string[] {
  const queries: string[] = [];

  // Primary query = the user's message itself (truncated)
  const primary = message.slice(0, 200);
  queries.push(primary);

  // Extract additional angles
  const lower = message.toLowerCase();
  if (lower.includes('market') || lower.includes('marché')) {
    queries.push(`${primary} market size revenue 2025 2026`);
  }
  if (lower.includes('platform') || lower.includes('plateforme')) {
    queries.push(`top agentic AI platforms comparison 2026`);
  }
  if (lower.includes('compar') || lower.includes('benchmark')) {
    queries.push(`${primary} competitive analysis comparison`);
  }
  if (lower.includes('africa') || lower.includes('afri')) {
    queries.push(`AI market Africa opportunities 2026`);
  }

  // Limit to 3 queries max
  return queries.slice(0, 3);
}

// ══════════════════════════════════════════════════════════════
// STREAM FROM GROQ (with key rotation)
// ══════════════════════════════════════════════════════════════

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
      console.warn(`Groq key #${(groqKeyIndex - 1) % GROQ_KEYS.length} failed (${res.status}), rotating...`);
    } catch (err) {
      console.warn(`Groq key #${(groqKeyIndex - 1) % GROQ_KEYS.length} network error, rotating...`);
    }
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
// STREAM FROM GEMINI (fallback)
// ══════════════════════════════════════════════════════════════

async function streamGemini(
  messages: { role: string; content: string }[],
): Promise<Response | null> {
  if (!GEMINI_KEY) return null;

  const geminiModel = (process.env.NKYEL_PRIMARY_MODEL && process.env.NKYEL_PRIMARY_MODEL !== 'gemini-3.8-flash') ? process.env.NKYEL_PRIMARY_MODEL : 'gemini-3.6-flash';

  const geminiContents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

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
            maxOutputTokens: 8192,
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

// ══════════════════════════════════════════════════════════════
// MAIN POST HANDLER
// ══════════════════════════════════════════════════════════════

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

    // ── Generate REAL runtime IDs ───────────────────────────
    const runId = `run_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const requestId = `req_${randomUUID().replace(/-/g, '').slice(0, 12)}`;

    // ── Detect research intent ──────────────────────────────
    const isResearchQuery = detectResearchIntent(trimmedMessage);

    const groqModel = GROQ_MODEL_MAP[model] || 'groq/compound';

    // ── Build the SSE stream ────────────────────────────────
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        function emit(type: string, data: Record<string, any> = {}) {
          controller.enqueue(encoder.encode(sseEvent(type, {
            run_id: runId,
            request_id: requestId,
            timestamp: new Date().toISOString(),
            ...data,
          })));
        }

        try {
          // ── PHASE 0: Mission started ────────────────────
          emit('RUN_STARTED', { provider: 'nkyel', research_mode: isResearchQuery });
          emit('reflection_start', { provider: 'nkyel', research_mode: isResearchQuery });

          let searchContext = '';
          const allSources: TavilyResult[] = [];

          // ══════════════════════════════════════════════════
          // PHASE 1: REAL WEB SEARCH (if research intent)
          // ══════════════════════════════════════════════════
          if (isResearchQuery) {
            const searchQueries = generateSearchQueries(trimmedMessage);

            for (let qi = 0; qi < searchQueries.length; qi++) {
              const query = searchQueries[qi];
              const toolCallId = `tc_${randomUUID().replace(/-/g, '').slice(0, 8)}`;

              // Emit: tool.started
              const toolPayload = {
                tool_call_id: toolCallId,
                tool_name: 'tavily_web_search',
                tool_input: { query, max_results: 5 },
                agent_id: 'research_agent',
                agent_label: 'Ñkyel Research',
                source_protocol: 'mcp',
              };
              emit('TOOL_CALL_START', toolPayload);
              emit('tool.started', toolPayload);

              // Execute REAL Tavily search
              const { results, error } = await executeTavilySearch(query, 5);

              if (error) {
                // Emit: tool UNAVAILABLE — never hallucinate
                const toolErrPayload = {
                  tool_call_id: toolCallId,
                  tool_name: 'tavily_web_search',
                  tool_output: { error, status: 'TOOL_UNAVAILABLE' },
                  agent_id: 'research_agent',
                  agent_label: 'Ñkyel Research',
                  source_protocol: 'mcp',
                };
                emit('TOOL_CALL_RESULT', toolErrPayload);
                emit('tool.completed', toolErrPayload);
                continue;
              }

              // Emit: tool.completed with result count
              const toolOkPayload = {
                tool_call_id: toolCallId,
                tool_name: 'tavily_web_search',
                tool_output: { result_count: results.length, query },
                agent_id: 'research_agent',
                agent_label: 'Ñkyel Research',
                source_protocol: 'mcp',
              };
              emit('TOOL_CALL_RESULT', toolOkPayload);
              emit('tool.completed', toolOkPayload);

              // Emit individual source events
              for (const result of results) {
                if (!result.url) continue;

                const sourceId = `src_${randomUUID().replace(/-/g, '').slice(0, 8)}`;

                // Check for duplicates
                if (allSources.some(s => s.url === result.url)) continue;

                allSources.push(result);

                const domain = new URL(result.url).hostname.replace(/^www\./, '');
                const sourcePayload = {
                  id: sourceId,
                  source_id: sourceId,
                  url: result.url,
                  title: result.title || domain,
                  domain,
                  snippet: result.content.slice(0, 300),
                  score: result.score,
                  source_type: 'tavily_web',
                  favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
                  agent_id: 'research_agent',
                  agent_label: 'Ñkyel Research',
                  source_protocol: 'mcp',
                };
                emit('source', sourcePayload);
                emit('STATE_DELTA', { delta_type: 'source', source: sourcePayload, data: sourcePayload });
              }
            }

            // ── Build search context for LLM injection ────
            if (allSources.length > 0) {
              searchContext = '\n\n=== REAL WEB SEARCH RESULTS (from Tavily API — use ONLY these sources) ===\n\n';
              for (let i = 0; i < allSources.length; i++) {
                const s = allSources[i];
                searchContext += `[Source ${i + 1}] "${s.title}"\nURL: ${s.url}\nContent: ${s.content.slice(0, 500)}\n\n`;
              }
              searchContext += '=== END OF REAL SOURCES ===\n';
              searchContext += '\nIMPORTANT: Base your analysis EXCLUSIVELY on the sources above. Cite each source by [Source N] and include the real URL. Do NOT invent data or URLs. If the sources are insufficient, say so explicitly.\n';
            } else {
              searchContext = '\n\n[TOOL_UNAVAILABLE] Web search was attempted but returned no results. Inform the user that real-time web research is temporarily unavailable and you cannot provide verified sources at this moment.\n';
            }
          }

          // Emit reflection_end (research phase done)
          emit('reflection_end', {
            sources_found: allSources.length,
            research_mode: isResearchQuery,
          });

          // ══════════════════════════════════════════════════
          // PHASE 2: LLM SYNTHESIS (with real sources injected)
          // ══════════════════════════════════════════════════

          // If research mode, emit task.started for synthesis
          if (isResearchQuery) {
            const taskPayload = {
              task_id: `task_${randomUUID().replace(/-/g, '').slice(0, 8)}`,
              task_label: 'Synthesizing research from verified sources',
              agent_id: 'synthesis_agent',
              agent_label: 'Ñkyel Synthesis',
              source_protocol: 'deerflow',
            };
            emit('STEP_STARTED', taskPayload);
            emit('task.started', taskPayload);
          }

          // Build messages with injected search context
          const systemContent = isResearchQuery
            ? SYSTEM_PROMPT + searchContext
            : SYSTEM_PROMPT;

          const formattedMessages = [
            { role: 'system', content: systemContent },
            ...history.slice(-10).map((m: any) => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content || '',
            })),
            { role: 'user', content: trimmedMessage },
          ];

          // Try Groq first, then Gemini fallback
          let providerResponse = await streamGroq(formattedMessages, groqModel);
          let provider: 'groq' | 'gemini' = 'groq';

          if (!providerResponse) {
            providerResponse = await streamGemini(formattedMessages);
            provider = 'gemini';
          }

          if (!providerResponse || !providerResponse.body) {
            emit('error', {
              message: 'Tous les fournisseurs LLM sont temporairement indisponibles. Réessayez dans un instant.',
              code: 'ALL_PROVIDERS_UNAVAILABLE',
            });
            return;
          }

          // ── Stream LLM tokens ─────────────────────────────
          const reader = providerResponse.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let fullContent = '';

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
                  token = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.delta?.reasoning || '';
                } else {
                  token = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                }

                if (token) {
                  fullContent += token;
                  emit('TEXT_MESSAGE_CONTENT', { content: token, delta: token, text: token });
                  emit('token', { content: token });
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }

          // ── Persist to Redis ──────────────────────────────
          try {
            const existing = (await cacheGet<any[]>(`conv:${conversationId}`)) || [];
            existing.push(
              { role: 'user', content: trimmedMessage, timestamp: Date.now() },
              {
                role: 'assistant',
                content: fullContent,
                timestamp: Date.now(),
                sources: allSources.map(s => ({ url: s.url, title: s.title })),
                run_id: runId,
              },
            );
            await cacheSet(`conv:${conversationId}`, existing, 86400 * 7);
          } catch {
            // Non-blocking
          }

          // ── Emit artifact hints (if research mode) ────────
          if (isResearchQuery && allSources.length > 0 && fullContent.length > 200) {
            const artifactId = `art_${randomUUID().replace(/-/g, '').slice(0, 8)}`;
            emit('rendu', {
              artifact: {
                id: artifactId,
                type: 'report',
                title: `Research Report`,
                content: fullContent,
                formats_available: ['md'],
                run_id: runId,
              },
            });
          }

          // ── Final done event ──────────────────────────────
          const finalPayload = {
            run_id: runId,
            status: 'completed',
            content: fullContent,
            sources_count: allSources.length,
            provider,
            conversation_id: conversationId,
          };
          emit('RUN_FINISHED', finalPayload);
          emit('done', finalPayload);

        } catch (streamErr) {
          console.error('Stream error:', streamErr);
          const errPayload = {
            message: 'Erreur de flux',
            run_id: runId,
            error: (streamErr as Error).message,
          };
          controller.enqueue(encoder.encode(sseEvent('RUN_ERROR', errPayload)));
          controller.enqueue(encoder.encode(sseEvent('error', errPayload)));
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
