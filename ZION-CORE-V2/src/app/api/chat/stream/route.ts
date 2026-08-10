/**
 * GabomaAI · Chat Stream API Route
 * SmartANDJ AI Technologies
 * Task 12 — Proxy SSE Next.js → FastAPI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

// export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // 1. Auth Clerk
  let userId: string | null = null;
  try {
    const auth = getAuth(req as never);
    userId = auth.userId;
  } catch {
    // Edge runtime fallback
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
  }

  // 2. Parse body
  const body = await req.json() as {
    conversationId: string | null;
    model: string;
    message: string;
    history: {role: string, content: string}[];
    loxoEnabled: boolean;
  };

  if (!body.message?.trim()) {
    return NextResponse.json({ error: 'Contenu vide' }, { status: 400 });
  }

  // 3. Forward to Groq directly (Temporary bypass)
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    // ── FALLBACK : Mock Stream IA sans backend ──
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const mockText = "Bonjour ! Je suis l'IA Gaboma en mode simulation (Mock). Je n'ai pas besoin du backend FastAPI pour fonctionner. Mon design suit maintenant la Constitution Zion Core V3. Comment puis-je t'aider aujourd'hui ?";
        const words = mockText.split(' ');
        
        for (const word of words) {
          await new Promise(resolve => setTimeout(resolve, 80)); // Délai simulé (80ms/mot)
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
        'X-Accel-Buffering': 'no',
      },
    });
  }

  try {
    const messagesToSend = [
      ...(body.history || []),
      { role: 'user', content: body.message }
    ];

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: body.model || 'llama-3.3-70b-versatile',
        messages: messagesToSend,
        stream: true,
      }),
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text().catch(() => 'Erreur Groq');
      return NextResponse.json(
        { error: `Erreur Groq (${groqRes.status}): ${errorText}` },
        { status: groqRes.status }
      );
    }

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
              } catch (e) {
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur réseau';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
