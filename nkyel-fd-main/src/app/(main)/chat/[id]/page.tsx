/**
 * Nkyel AI · Chat [id] Page (conversation existante)
 * SmartANDJ AI Technologies
 * Task 11 — Charge la conversation puis streaming
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { NkyelModel, NkyelMessage, NkyelSource } from '@/lib/models';
import { useChat } from '@/hooks/useChat';
import ConversationStream from '@/components/chat/ConversationStream';
import InputBar from '@/components/input/InputBar';
import { missionsApi } from '@/lib/api/missions';
import { useWorkGraphStore } from '@/lib/nkyel/work-graph-store';

export default function ChatIdPage() {
  const params = useParams();
  const conversationId = (Array.isArray(params?.id) ? params.id[0] : params?.id) || null;
  const [model, setModel] = useState<NkyelModel>('NKYEL_CHUI');
  const [loading, setLoading] = useState(true);
  const chat = useChat({
    conversationId,
    model,
    loxoEnabled: true,
    loxoRAGEnabled: false,
  });

  // Charger les messages existants et restaurer la mission
  useEffect(() => {
    if (!conversationId) return;
    (async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}`);
        if (res.ok) {
          const data = await res.json() as { messages: NkyelMessage[]; model?: NkyelModel };
          chat.setMessages(data.messages ?? []);
          if (data.model) setModel(data.model);
        }

        // Restauration P0 de la mission (WorkGraph, sources réelles, evidence)
        try {
          const restored = await missionsApi.restoreMission(conversationId);
          if (restored && restored.found) {
            if (restored.sources && restored.sources.length > 0) {
              const restoredSources: NkyelSource[] = restored.sources.map((s: any) => ({
                url: s.url,
                title: s.title,
                snippet: s.excerpt,
                type: 'loxo_web',
              }));
              chat.setMessages((prev) => {
                if (prev.length > 0) {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (updated[lastIdx].role === 'assistant') {
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      sources: restoredSources,
                    };
                  }
                  return updated;
                }
                // Si l'état local était vide, reconstruire depuis la mission persistée dans Neon
                if (restored.mission) {
                  const reconstructed: NkyelMessage[] = [];
                  if (restored.mission.objective) {
                    reconstructed.push({
                      id: `user-${conversationId}`,
                      role: 'user',
                      content: restored.mission.objective,
                      created_at: restored.mission.created_at ? new Date(restored.mission.created_at).getTime() : Date.now() - 5000,
                    });
                  }
                  const artifactSummary = restored.artifacts && restored.artifacts.length > 0
                    ? `\n\n### Livrables sauvegardés :\n` + restored.artifacts.map((a: any) => `- [${a.title}](${a.url})`).join('\n')
                    : '';
                  reconstructed.push({
                    id: `assistant-${conversationId}`,
                    role: 'assistant',
                    content: (restored.mission.title ? `# ${restored.mission.title}\n\n` : '') +
                             (restored.mission.objective ? `Mission : ${restored.mission.objective}\n\nStatut : ${restored.mission.status}\n` : '') +
                             artifactSummary,
                    sources: restoredSources,
                    created_at: restored.mission.completed_at ? new Date(restored.mission.completed_at).getTime() : Date.now(),
                  });
                  return reconstructed;
                }
                return prev;
              });
            }

            if (restored.nodes && restored.nodes.length > 0) {
              const nodesMap = new Map();
              for (const n of restored.nodes) {
                nodesMap.set(n.id, {
                  id: n.id,
                  type: n.node_type || 'step',
                  version: '1.0.0',
                  title: n.label,
                  status: n.status || 'completed',
                  provenance: 'agent_generated',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  payload: n.payload,
                });
              }
              useWorkGraphStore.setState({ nodes: nodesMap });
            }
          }
        } catch {
          // Silently proceed
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, [conversationId]);

  const handleSend = useCallback((content: string) => {
    chat.sendMessage(content);
  }, [chat]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: '#020304' }}>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: '#C5A059', animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#020304' }}>
      <ConversationStream messages={chat.messages} isStreaming={chat.isStreaming} />

      {chat.error && (
        <div
          className="mx-4 mb-2 px-4 py-3 rounded-xl text-[13px]"
          style={{ background: 'rgba(192,57,45,0.08)', border: '1px solid rgba(192,57,45,0.2)', color: '#C0392D' }}
        >
          ❌ {chat.error}
          <button
            onClick={chat.clearError}
            className="ms-3 underline text-[12px]"
            style={{ color: '#8A8A92', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Fermer
          </button>
        </div>
      )}

      <InputBar
        onSend={handleSend}
        onStop={chat.stop}
        isStreaming={chat.isStreaming}
        model={model}
        onModelChange={setModel}
      />
    </div>
  );
}
