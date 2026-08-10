/**
 * GabomaAI · Agent Stream Adapter (Vercel AI SDK)
 * Transforme le flux SSE (Server-Sent Events) brut de FastAPI 
 * en Data Stream Protocol compatible avec le Vercel AI SDK (`useChat`).
 */

export const gabomaFetchAdapter = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  // 1. Ajouter l'authentification (Clerk token si présent dans init.headers)
  // Le token Clerk est généralement passé par le client.
  const response = await fetch(input, init);

  if (!response.ok) {
    return response;
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  // 2. Créer un TransformStream pour convertir les événements SSE de FastAPI vers le protocole Vercel
  const stream = new TransformStream({
    async start(controller) {},
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last partial line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue;
        const dataStr = line.replace('data: ', '').trim();
        
        if (dataStr === '[DONE]') {
          continue;
        }

        try {
          const event = JSON.parse(dataStr);

          // Mapping du format FastAPI vers Vercel Data Stream Protocol
          
          if (event.type === 'messages-tuple' && event.data?.type === 'ai' && event.data?.content) {
            // Streaming de texte classique (0: "texte")
            controller.enqueue(encoder.encode(`0:${JSON.stringify(event.data.content)}\n`));
          } 
          
          else if (event.type === 'agent_step') {
            // Streaming d'une invocation d'outil (9: {"toolCallId":"...", "toolName":"...", "args":{...}})
            const step = event.step;
            const toolCallId = `call_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            
            // Format compatible ToolInvocation (Vercel)
            const toolCallPayload = {
              toolCallId,
              toolName: step.type, // e.g., 'wandana_search', 'e2b_executing'
              args: step, 
            };
            controller.enqueue(encoder.encode(`9:${JSON.stringify([toolCallPayload])}\n`));
            
            // Simulation automatique du retour de l'outil pour que le SDK l'enregistre (a: {"toolCallId": "...", "result": ...})
            // Dans une vraie infra, on le ferait à la réception du résultat complet.
            const toolResultPayload = {
              toolCallId,
              result: { status: 'completed', data: step },
            };
            controller.enqueue(encoder.encode(`a:${JSON.stringify([toolResultPayload])}\n`));
          }

        } catch (e) {
          // Ignorer les erreurs de parsing pour les lignes incomplètes (ou bufferiser)
          console.error("Erreur de parsing dans le stream adapter:", e, dataStr);
        }
      }
    },
    flush(controller) {
       if (buffer.trim()) {
           // Traiter le dernier buffer si nécessaire
       }
    }
  });

  // 3. Retourner la réponse avec le nouveau stream parsé
  return new Response(response.body?.pipeThrough(stream), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
