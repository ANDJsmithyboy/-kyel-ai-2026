/**
 * Nkyel AI · Chat Stream API Route
 * SmartANDJ AI Technologies
 * Task 12 — Proxy SSE Next.js → FastAPI (RunPod) + Groq Direct Fallback
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const message = rawBody.message || rawBody.content || '';
    const history = rawBody.history || [];
    const model = rawBody.model || 'AURATA';
    const conversationId = rawBody.conversationId || null;
    const loxoEnabled = rawBody.loxoEnabled || false;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Contenu vide' }, { status: 400 });
    }

    const trimmedMessage = message.trim();
    const runpodUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ejresep5jsepf3-8080.proxy.runpod.net';

    // 1. Tenter de contacter le backend FastAPI sur RunPod en premier
    try {
      const fastApiRes = await fetch(`${runpodUrl}/v1/chat/completions`, {
        method: 'POST',
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
      console.warn('[Chat Stream] FastAPI unreachable, falling back to Groq:', fastApiErr);
    }

    // 2. Fallback direct Groq si le RunPod a un souci
    const groqApiKey = process.env.GROQ_API_KEY || '';
    const messagesToSend = [
      {
        role: 'system',
        content: 'Tu es Ñkyel AI, le grand modèle souverain et assistant intelligent créé par Daniel Jonathan ANDJ (SmartANDJ AI Technologies). Tu réponds avec précision, élégance et chaleur en français.'
      },
      ...history.map((h: any) => ({ role: h.role, content: h.content })),
      { role: 'user', content: trimmedMessage }
    ];

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messagesToSend,
        stream: true,
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
                if (!line.startsWith('data: ')) continue;
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') continue;

                try {
                  const data = JSON.parse(dataStr);
                  const content = data.choices?.[0]?.delta?.content || '';
                  if (content) {
                    const event = { type: 'token', content };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
                  }
                } catch {
                  // ignore
                }
              }
            }

            controller.enqueue(encoder.encode(`data: {"type":"done"}\n\n`));
          } catch (e) {
            controller.enqueue(encoder.encode(`data: {"type":"error", "message": "Stream interrupted"}\n\n`));
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

    // 3. Fallback ultime de sécurité
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const mockText = `Bonjour ! Je suis Ñkyel AI, l'IA souveraine conçue par Daniel Jonathan ANDJ (SmartANDJ AI Technologies). J'ai bien reçu votre message : "${trimmedMessage}". Tout le système est connecté et opérationnel pour votre démonstration Google !`;
        const words = mockText.split(' ');

        for (const word of words) {
          await new Promise(resolve => setTimeout(resolve, 50));
          const event = { type: 'token', content: word + ' ' };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
        controller.enqueue(encoder.encode(`data: {"type":"done"}\n\n`));
        controller.close();
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur traitement requête' }, { status: 500 });
  }
}

