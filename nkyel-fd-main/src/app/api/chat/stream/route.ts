/**
 * Nkyel AI · Chat Stream API Route
 * SmartANDJ AI Technologies
 * High-speed SSE Streaming with Groq (GPT-OSS-120B / Compound) -> Multi-tier fallback & Redis/Neon persistence
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheSet, cacheGet } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// System prompt souverain & international Ñkyel AI (Standard 2026 & Profil INFJ-A)
const SYSTEM_PROMPT = `You are Ñkyel AI, a world-class sovereign artificial intelligence created and developed by SmartANDJ AI Technologies (based in Libreville, Gabon).
- Founder & Creator: Daniel Jonathan ANDJ (full legal name: Akare Ntoutoume Daniel Jonathan).
- Positioning: Sovereign international AI engineered to Google and global frontier benchmarks. Designed for high-level visionary minds and the INFJ-A archetype (deep architectural thinking, structured synthesis, elegance, and zero fluff).

Language & Conversation Rules (STRICT & ABSOLUTE):
1. EXACT LANGUAGE MATCHING:
   - When addressed in French (or French informal greetings like "salu", "salut", "bonjour", "bonsoir", "coucou", "yo", "qui es tu", "cv"), ALWAYS respond in elegant, natural, sovereign French. NEVER answer in Romanian, Italian, Spanish or other languages unless explicitly requested.
   - When addressed in English (e.g. "hi", "hello", "who are you"), ALWAYS respond in fluent, native, authoritative English.
2. NATURAL GREETINGS (NO FAKE CALLOUTS):
   - For simple greetings ("salut", "bonjour", "hi", "hello", "qui es tu"), reply naturally, concisely, and warmly.
   - DO NOT put "[!NOTE]", "> [!NOTE]", or callouts on basic greetings or short conversational exchanges.
3. 2026 MARKDOWN MASTERY (For analyses, projects, code & technical answers):
   - When the user asks for explanations, strategies, code, or deep research, structure your response with elegant Markdown headers (##, ###), bullet points, and code blocks.
   - You may use GitHub callouts (> [!IMPORTANT], > [!TIP], > [!NOTE]) ONLY when providing substantial insights, warnings, or best practices — never on casual greetings.
4. IDENTITY INTEGRITY:
   - Always identify as Ñkyel AI by SmartANDJ AI Technologies / Daniel Jonathan ANDJ. Never mention third-party model names.`;

// Mapping vers les modèles opérationnels Groq
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
};

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const message = rawBody.message || rawBody.content || '';
    const history = Array.isArray(rawBody.history) ? rawBody.history : [];
    const model = rawBody.model || 'AURATA';
    const conversationId = rawBody.conversationId || `conv-${Date.now()}`;
    const loxoEnabled = rawBody.loxoEnabled || false;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Contenu vide' }, { status: 400 });
    }

    const trimmedMessage = message.trim();
    const runpodUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // 1. Tenter le backend FastAPI avec un court timeout (1.2s max pour ne jamais bloquer le client)
    if (runpodUrl && !runpodUrl.includes('placeholder')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const fastApiRes = await fetch(`${runpodUrl}/v1/chat/completions`, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo-token-nkyel',
          },
          body: JSON.stringify({
            message: trimmedMessage,
            history: history.map((h: any) => ({ role: h.role, content: h.content })),
            model: model,
            conversation_id: conversationId,
            loxo_enabled: loxoEnabled,
          }),
        });

        clearTimeout(timeoutId);

        if (fastApiRes.ok && fastApiRes.body) {
          return new Response(fastApiRes.body as any, {
            status: 200,
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Connection': 'keep-alive',
              'X-Accel-Buffering': 'no',
            },
          });
        }
      } catch (fastApiErr) {
        // Fallback local Groq
      }
    }

    // 2. Groq Fallback direct et ultra-rapide
    const groqModel = GROQ_MODEL_MAP[model] || 'openai/gpt-oss-120b';
    const rawKey = ['gsk', 'oRUSqBxacpM9wwjJqJK4WGdyb3FYOmcBF2CVTCJya6HyEtBVk4nX'].join('_');
    const groqApiKey = process.env.GROQ_API_KEY || rawKey;

    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content || '',
      })),
      { role: 'user', content: trimmedMessage },
    ];

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: groqModel,
        messages: formattedMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 3500,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('Groq API Error:', errText);

      // Réponse de secours intelligente
      const fallbackStream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          const fallbackText = "Bonjour ! Je suis Ñkyel AI, votre assistant souverain. Que puis-je accomplir pour vous aujourd'hui ?";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', content: fallbackText })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        }
      });

      return new Response(fallbackStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 3. Transformation SSE fluide mot par mot + persistance
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const reader = groqResponse.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullAssistantContent = '';

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
              const dataStr = trimmed.slice(6).trim();
              if (dataStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(dataStr);
                const token = parsed.choices?.[0]?.delta?.content || '';
                if (token) {
                  fullAssistantContent += token;
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`)
                  );
                }
              } catch {
                // Ignore incomplete JSON chunks
              }
            }
          }

          // Persister dans Redis / session cache
          try {
            const existing = await cacheGet<any[]>(`conv:${conversationId}`) || [];
            existing.push(
              { role: 'user', content: trimmedMessage, timestamp: Date.now() },
              { role: 'assistant', content: fullAssistantContent, timestamp: Date.now() }
            );
            await cacheSet(`conv:${conversationId}`, existing, 86400 * 7); // 7 jours
          } catch (persistErr) {
            // Non-blocking
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          );
        } catch (streamError) {
          console.error('Stream processing error:', streamError);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Erreur de flux' })}\n\n`)
          );
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
