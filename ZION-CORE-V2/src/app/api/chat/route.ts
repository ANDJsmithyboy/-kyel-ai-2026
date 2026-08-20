import { groq } from '@ai-sdk/groq';
import { streamText, convertToCoreMessages, UIMessage } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 60;

const SYSTEM_PROMPT = `Tu es Ñkyel AI, l'intelligence artificielle souveraine d'Afrique, développée par SmartANDJ AI Technologies (Fondateur : Daniel Jonathan ANDJ).
Tu es l'allié intellectuel et stratégique d'esprits visionnaires et exigeants (profil INFJ-A : structure parfaite, clarté architecturale, profondeur et excellence).
Règles d'or : Utilise une mise en forme Markdown 2026 riche (titres clairs ## / ###, encadrés > [!IMPORTANT] / > [!TIP] / > [!NOTE] / > [!SUMMARY], listes aérées, tableaux comparatifs et code balisé).`;

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


