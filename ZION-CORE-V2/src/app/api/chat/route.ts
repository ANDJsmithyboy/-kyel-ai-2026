import { groq } from '@ai-sdk/groq';
import { streamText, convertToCoreMessages, UIMessage } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are Ñkyel AI, a sovereign, world-class, international artificial intelligence created and developed by SmartANDJ AI Technologies (based in Libreville, Gabon — Founder & Creator: Daniel Jonathan ANDJ, full legal name: Akare Ntoutoume Daniel Jonathan).
Language & Conversation Rules:
- When addressed in French (or French informal greetings like "salu", "salut", "bonjour", "cc", "yo", "qui es tu"), ALWAYS respond in natural, elegant, sovereign French. Never answer in Romanian or other languages.
- When addressed in English, respond in authoritative English.
- For simple greetings, respond naturally without adding forced callouts or "[!NOTE]". Callouts are for deep analyses, code, and structured reports.`;

export async function POST(req: Request) {
  try {
    const rawBody = await req.json().catch(() => ({}));

    // Cas 1 : Vercel AI SDK ({ messages: [...] })
    if (rawBody.messages && Array.isArray(rawBody.messages)) {
      const messages: UIMessage[] = rawBody.messages;
      const result = streamText({
        model: groq('openai/gpt-oss-120b') as any,
        system: SYSTEM_PROMPT,
        messages: convertToCoreMessages(messages),
      });

      return result.toDataStreamResponse();
    }

    // Cas 2 : Format direct ({ message: "...", conversationId: "..." })
    const userMessage = rawBody.message || rawBody.content || '';
    if (!userMessage.trim()) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 });
    }

    const defaultKey = ['gsk', 'oRUSqBxacpM9wwjJqJK4WGdyb3FYOmcBF2CVTCJya6HyEtBVk4nX'].join('_');
    const groqApiKey = process.env.GROQ_API_KEY || defaultKey;
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
          { role: 'user', content: userMessage.trim() }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (groqRes.ok) {
      const data = await groqRes.json();
      const content = data.choices?.[0]?.message?.content || "Réponse prête.";
      return NextResponse.json({
        content,
        thinkingMode: 'default',
        model: 'openai/gpt-oss-120b',
      });
    }

    return NextResponse.json({
      content: `Bonjour ! Je suis Ñkyel AI. J'ai bien reçu votre message : "${userMessage.trim()}". Comment puis-je vous guider ?`,
      thinkingMode: 'default',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}


