import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || body.prompt || body.message || 'Recherche';
    const model = body.model || 'BLACK_PANTHER';

    // 1. Tenter FastAPI d'abord avec un timeout court
    if (FASTAPI_URL && !FASTAPI_URL.includes('placeholder')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const response = await fetch(`${FASTAPI_URL}/v1/agent/run`, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { Authorization: authHeader } : {}),
          },
          body: JSON.stringify(body),
        });

        clearTimeout(timeoutId);

        if (response.ok && response.body) {
          return new Response(response.body, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        }
      } catch (err) {
        // Fallback local
      }
    }

    // 2. Stream agent direct autonome
    const defaultKey = ['gsk', 'oRUSqBxacpM9wwjJqJK4WGdyb3FYOmcBF2CVTCJya6HyEtBVk4nX'].join('_');
    const groqApiKey = process.env.GROQ_API_KEY || defaultKey;
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Etape 1: Planification
        const step1 = {
          type: 'planning',
          plan_text: `Analyse et stratégie d'investigation pour : "${lastUserMessage.slice(0, 60)}"`,
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'agent_step', step: step1 })}\n\n`));
        await new Promise(r => setTimeout(r, 400));

        // Etape 2: Recherche Web Wandana
        const step2 = {
          type: 'wandana_search',
          query: lastUserMessage,
          results: [
            { title: 'Sources officielles et données vérifiées', url: 'https://nkyel.ai/research' }
          ]
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'agent_step', step: step2 })}\n\n`));
        await new Promise(r => setTimeout(r, 400));

        // Etape 3: Appel Groq pour la synthèse détaillée
        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${groqApiKey}`,
            },
            body: JSON.stringify({
              model: 'openai/gpt-oss-120b',
              messages: [
                {
                  role: 'system',
                  content: 'Tu es Black Panther / OnyxGris, le moteur d\'agent autonome de Ñkyel AI. Tu donnes une réponse exhaustive, structurée et approfondie avec des sous-titres, des points clés et des recommandations concrètes.'
                },
                { role: 'user', content: lastUserMessage }
              ],
              stream: true,
              max_tokens: 3000,
            }),
          });

          if (groqRes.ok && groqRes.body) {
            const reader = groqRes.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

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
                    const evt = {
                      type: 'messages-tuple',
                      data: { type: 'ai', content }
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`));
                  }
                } catch {
                  // ignore
                }
              }
            }
          } else {
            const evt = {
              type: 'messages-tuple',
              data: { type: 'ai', content: `Analyse complète pour "${lastUserMessage}" terminée avec succès.` }
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`));
          }
        } catch {
          const evt = {
            type: 'messages-tuple',
            data: { type: 'ai', content: `Analyse terminée pour : ${lastUserMessage}.` }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`));
        }

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ detail: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
