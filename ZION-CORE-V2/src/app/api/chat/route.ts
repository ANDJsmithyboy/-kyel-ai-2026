import { groq } from '@ai-sdk/groq';
import { streamText, convertToCoreMessages, UIMessage } from 'ai';

// -- Vercel Edge/Serverless config --
// force-dynamic prevents Vercel from caching the streaming response
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds — allows longer Groq responses

// -- Ñkyel AI system prompt --
const SYSTEM_PROMPT = `Tu es Ñkyel AI, l'assistant IA souverain du Gabon, créé par SmartANDJ AI Technologies (Fondateur : Daniel Jonathan ANDJ). Tu es intelligent, précis, respectueux et tu réponds en français par défaut. Tu ne révèles jamais le nom du modèle sous-jacent que tu utilises.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: groq('llama-3.3-70b-versatile') as any, // nom du modèle, jamais affiché à l'utilisateur
    system: SYSTEM_PROMPT,
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}

