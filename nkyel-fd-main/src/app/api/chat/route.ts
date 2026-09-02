/**
 * Ñkyel AI · Chat API Route (Vercel AI SDK compatible)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 * Groq round-robin rotation + Gemini fallback
 */

import { streamText, convertToCoreMessages, UIMessage } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

export const maxDuration = 120;

const SYSTEM_PROMPT = `You are Ñkyel AI, a sovereign, world-class, international artificial intelligence created and developed by SmartANDJ AI Technologies (based in Libreville, Gabon — Founder & Creator: Daniel Jonathan ANDJ, full legal name: Akare Ntoutoume Daniel Jonathan).
Language & Conversation Rules:
- When addressed in French (or French informal greetings like "salu", "salut", "bonjour", "cc", "yo", "qui es tu"), ALWAYS respond in natural, elegant, sovereign French. Never answer in Romanian or other languages.
- When addressed in English, respond in authoritative English.
- For simple greetings, respond naturally without adding forced callouts or "[!NOTE]". Callouts are for deep analyses, code, and structured reports.`;

// ── Groq Key Pool ───────────────────────────────────────────
const GROQ_KEYS: string[] = (() => {
  const keys: string[] = [];
  const poolEnv = process.env.GROQ_API_KEYS || '';
  if (poolEnv) keys.push(...poolEnv.split(',').map(k => k.trim()).filter(Boolean));
  for (let i = 1; i <= 18; i++) {
    const k = process.env[`GROQ_API_KEY_${i}`];
    if (k && k.trim() && !keys.includes(k.trim())) keys.push(k.trim());
  }
  if (keys.length === 0 && process.env.GROQ_API_KEY) keys.push(process.env.GROQ_API_KEY);
  return keys;
})();

let groqIdx = 0;
function nextGroqKey(): string {
  if (GROQ_KEYS.length === 0) return process.env.GROQ_API_KEY || '';
  const key = GROQ_KEYS[groqIdx % GROQ_KEYS.length];
  groqIdx++;
  return key;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json().catch(() => ({}));

    if (rawBody.messages && Array.isArray(rawBody.messages)) {
      const messages: UIMessage[] = rawBody.messages;

      // Try Groq with rotation (up to 3 attempts)
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const groqInstance = createGroq({ apiKey: nextGroqKey() });
          const result = streamText({
            model: groqInstance('openai/gpt-oss-120b') as any,
            system: SYSTEM_PROMPT,
            messages: convertToCoreMessages(messages),
          });
          return result.toDataStreamResponse();
        } catch (err: any) {
          console.warn(`Groq attempt ${attempt + 1} failed:`, err.message);
          if (attempt === 2) {
            // Gemini fallback
            const geminiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
            if (geminiKey) {
              try {
                const google = createGoogleGenerativeAI({ apiKey: geminiKey });
                const result = streamText({
                  model: google('gemini-3.8-flash') as any,
                  system: SYSTEM_PROMPT,
                  messages: convertToCoreMessages(messages),
                });
                return result.toDataStreamResponse();
              } catch {
                // Final fallback below
              }
            }
          }
        }
      }

      return NextResponse.json({ content: "Je suis Ñkyel AI. Serveurs temporairement surchargés." }, { status: 503 });
    }

    // Direct message format
    const userMessage = rawBody.message || rawBody.content || '';
    if (!userMessage.trim()) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 });
    }

    const groqApiKey = nextGroqKey();
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage.trim() },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (groqRes.ok) {
      const data = await groqRes.json();
      const content = data.choices?.[0]?.message?.content || 'Réponse prête.';
      return NextResponse.json({ content, model: 'openai/gpt-oss-120b' });
    }

    // Secondary fallback to Gemini 3.8 Flash
    const geminiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (geminiKey) {
      try {
        const gemRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: userMessage.trim() }] }],
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            }),
          }
        );
        if (gemRes.ok) {
          const data = await gemRes.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Réponse prête.';
          return NextResponse.json({ content, model: 'gemini-3.8-flash' });
        }
      } catch {
        // Fallback below
      }
    }

    return NextResponse.json({
      content: `Bonjour ! Je suis Ñkyel AI. Comment puis-je vous aider ?`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
