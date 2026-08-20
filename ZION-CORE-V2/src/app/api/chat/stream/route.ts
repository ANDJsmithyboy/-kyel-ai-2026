/**
 * Nkyel AI · Chat Stream API Route
 * SmartANDJ AI Technologies
 * High-speed SSE Streaming with FastAPI (RunPod/Local) -> Groq (GPT-OSS-120B / Compound) -> Multi-tier fallback
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// System prompt souverain Ñkyel AI
const SYSTEM_PROMPT = `Tu es Ñkyel AI, l'intelligence artificielle souveraine d'Afrique, développée par SmartANDJ AI Technologies (Fondateur : Daniel Jonathan ANDJ).
Tu es un assistant IA puissant, rapide, éloquent, précis et bienveillant. Tu t'exprimes avec élégance en français par défaut.
Tu excelles en programmation, analyse, rédaction, sciences, affaires et culture. Tu ne mentionnes jamais tes modèles sous-jacents techniques. Tu es Ñkyel AI.`;

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
        // Backend indisponible -> passage instantané à Groq
      }
    }

    // 2. Appel direct et ultra-rapide à Groq
    const groqApiKey = process.env.GROQ_API_KEY || '';
    const chosenGroqModel = GROQ_MODEL_MAP[model] || 'openai/gpt-oss-120b';

    const messagesToSend = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history
        .filter((h: any) => h && h.content && typeof h.content === 'string')
        .map((h: any) => ({
          role: h.role === 'assistant' ? 'assistant' : 'user',
          content: h.content.trim(),
        })),
      { role: 'user', content: trimmedMessage }
    ];

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: chosenGroqModel,
          messages: messagesToSend,
          stream: true,
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (groqRes.ok && groqRes.body) {
        const stream = new ReadableStream({
          async start(controller) {
            const reader = groqRes.body?.getReader();
            if (!reader) {
              controller.close();
              return;
            }

            const decoder = new TextDecoder();
            const encoder = new TextEncoder();
            let buffer = '';

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                  const trimmedLine = line.trim();
                  if (!trimmedLine.startsWith('data: ')) continue;
                  const dataStr = trimmedLine.slice(6).trim();
                  if (!dataStr || dataStr === '[DONE]') continue;

                  try {
                    const data = JSON.parse(dataStr);
                    const content = data.choices?.[0]?.delta?.content || '';
                    if (content) {
                      const event = { type: 'token', content };
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                    }
                  } catch {
                    // ignore JSON chunk errors
                  }
                }
              }

              controller.enqueue(encoder.encode(`data: {"type":"done", "conversation_id": ${JSON.stringify(conversationId)}}\n\n`));
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            } catch (e) {
              controller.enqueue(encoder.encode(`data: {"type":"error", "message": "Stream interrompu"}\n\n`));
            } finally {
              controller.close();
            }
          }
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
      }
    } catch (groqErr) {
      console.error('[Chat Stream] Erreur Groq direct:', groqErr);
    }

    // 3. Fallback souverain instantané de sécurité
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const mockText = `Bonjour ! Je suis Ñkyel AI, votre assistant souverain. J'ai bien reçu votre demande : "${trimmedMessage}". Je suis à votre entière disposition pour vous aider dans vos projets et analyses.`;
        const words = mockText.split(' ');

        for (const word of words) {
          await new Promise((resolve) => setTimeout(resolve, 30));
          const event = { type: 'token', content: word + ' ' };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
        controller.enqueue(encoder.encode(`data: {"type":"done", "conversation_id": ${JSON.stringify(conversationId)}}\n\n`));
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
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
  } catch (err) {
    return NextResponse.json({ error: 'Erreur traitement requête' }, { status: 500 });
  }
}
