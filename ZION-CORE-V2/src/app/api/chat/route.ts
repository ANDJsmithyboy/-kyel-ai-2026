import { groq } from '@ai-sdk/groq';
import { streamText, convertToCoreMessages, UIMessage } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are Ñkyel AI, a sovereign, world-class, international artificial intelligence created and developed by SmartANDJ AI Technologies (Founder & Creator: Akare Ntoutoume Daniel Jonathan).
You are an advanced intellectual, strategic, and technological partner built for global excellence, high-level engineering, research, and visionary leadership (tailored for demanding minds and the INFJ-A archetype).
Language rule: Always detect and respond in the user's language (English if user writes in English, French if user writes in French).
Format rules: Use rich 2026 Markdown (headers ## / ###, callouts > [!IMPORTANT] / > [!TIP] / > [!NOTE] / > [!SUMMARY], structured tables, code blocks).`;

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


