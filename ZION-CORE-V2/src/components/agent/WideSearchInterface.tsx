'use client';

import React, { useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { useAuth } from '@clerk/nextjs';
import { Send, Sparkles, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { gabomaFetchAdapter } from '@/lib/agentStreamAdapter';
import WandanaSearchNode from './nodes/WandanaSearchNode';
import E2BSandboxNode from './nodes/E2BSandboxNode';
import ThoughtBlock from './nodes/ThoughtBlock';
import RenduNode from './nodes/RenduNode';

export default function WideSearchInterface() {
  const { getToken } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState('BLACK_PANTHER');

  // Configuration ultra-optimisée pour le RSC Streaming / Generative UI
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: '/api/v1/agent/run',
    body: {
      model: selectedModel, // On passe le modèle au backend FastAPI (LangGraph)
    },
    fetch: async (input, init) => {
      // Injection du token Clerk pour la sécurité
      const token = await getToken();
      const secureInit = {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${token}`,
        },
      };
      // Utilisation de notre adaptateur SSE custom
      return gabomaFetchAdapter(input, secureInit);
    },
    onError: (err) => {
      console.error('Erreur du stream agent:', err);
    },
  });

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderToolInvocation = (tool: any) => {
    const status = tool.state === 'result' ? 'success' : 'active';
    const args = tool.args || {};
    const result = tool.result?.data || {};

    switch (tool.toolName) {
      case 'wandana_search':
        return (
          <WandanaSearchNode
            key={tool.toolCallId}
            query={args.query || ''}
            status={status}
            results={result.results || []}
          />
        );
      case 'e2b_executing':
      case 'execute_code':
        return (
          <E2BSandboxNode
            key={tool.toolCallId}
            language={args.language || 'python'}
            code={args.code || ''}
            status={status}
            stdout={result.stdout}
            stderr={result.stderr}
          />
        );
      case 'planning':
        return (
          <ThoughtBlock 
            key={tool.toolCallId} 
            title="Planification stratégique" 
            icon={<Command size={14} />} 
            status={status}
          >
            <div className="font-mono text-xs">{args.plan_text || 'Analyse des objectifs...'}</div>
          </ThoughtBlock>
        );
      case 'generate_artifact':
      case 'create_rendu':
      case 'save_file':
        return (
          <RenduNode
            key={tool.toolCallId}
            title={args.title || args.filename || 'Document'}
            type={args.type || 'markdown'}
            content={args.content || result.content}
            status={status}
          />
        );
      default:
        // Fallback pour les outils inconnus
        return (
          <ThoughtBlock 
            key={tool.toolCallId} 
            title={`Outil : ${tool.toolName}`} 
            icon={<Sparkles size={14} />} 
            status={status}
          >
            <pre className="text-[10px] overflow-x-auto">{JSON.stringify(args, null, 2)}</pre>
          </ThoughtBlock>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] font-sans">
      
      {/* ── Entête minimaliste ── */}
      <header className="flex-none px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]/80 backdrop-blur-md">
        <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2 text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
          <Sparkles className="text-[var(--accent)]" size={18} />
          Deep Search
        </h1>
      </header>

      {/* ── Zone de contenu principal (Thought Blocks & Chat) ── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-8 space-y-6">
        
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <Sparkles size={48} className="text-[var(--accent)]" />
            <h2 className="text-xl font-medium" style={{ fontFamily: 'var(--font-heading)' }}>Que voulez-vous rechercher en profondeur ?</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-md">
              L'agent va planifier, chercher sur le web, et exécuter du code pour vous répondre de manière exhaustive.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-4xl mx-auto w-full`}>
            
            {/* Message Utilisateur */}
            {m.role === 'user' && (
              <div className="bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                {m.content}
              </div>
            )}

            {/* Message Assistant & Thought Blocks (Tool Invocations) */}
            {m.role === 'assistant' && (
              <div className="w-full flex flex-col gap-2">
                
                {/* Rendu des outils / Thought Blocks façon Manus AI */}
                {m.toolInvocations && m.toolInvocations.length > 0 && (
                  <div className="flex flex-col gap-1 w-full pl-2 border-l border-[var(--border)] ml-2 my-2">
                    <AnimatePresence>
                      {m.toolInvocations.map(renderToolInvocation)}
                    </AnimatePresence>
                  </div>
                )}

                {/* Rendu du texte final streamé */}
                {m.content && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[var(--text-primary)] leading-relaxed text-sm md:text-base prose prose-invert max-w-none"
                  >
                    {m.content}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Barre de saisie (Deep Search Input) ── */}
      <div className="flex-none p-4 md:p-6 bg-gradient-to-t from-[var(--bg)] to-transparent">
        <div className="max-w-4xl mx-auto relative">
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-center bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl shadow-lg focus-within:border-[var(--accent-35)] focus-within:ring-4 focus-within:ring-[var(--accent-10)] transition-all overflow-hidden"
          >
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ex: Analyse les rapports financiers de NVIDIA et trace l'évolution de leur marge brute..."
              className="w-full bg-transparent border-none text-[var(--text-primary)] text-sm md:text-base px-6 py-5 focus:outline-none placeholder:text-[var(--text-tertiary)]"
              disabled={isLoading}
            />
            
            <div className="pr-4 flex items-center gap-2">
              {isLoading ? (
                <button 
                  type="button" 
                  onClick={stop}
                  className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-sm animate-pulse" />
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-3 bg-[var(--accent)] text-[var(--bg)] rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
                >
                  <Send size={18} className="ml-1" />
                </button>
              )}
            </div>
          </form>
          
          <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-tertiary)] font-mono">
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setSelectedModel('ONYXGRIS')}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${selectedModel === 'ONYXGRIS' ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-10)]' : 'border-[var(--border)] hover:bg-[var(--accent-06)]'}`}
              >
                ONYXGRIS (Agent IA)
              </button>
              <button 
                type="button"
                onClick={() => setSelectedModel('BLACK_PANTHER')}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${selectedModel === 'BLACK_PANTHER' ? 'border-[var(--color-error)] text-[var(--color-error)] bg-[var(--color-error)]/10' : 'border-[var(--border)] hover:bg-[var(--accent-06)]'}`}
              >
                BLACK PANTHER (Le GOAT)
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Sparkles size={12} className={selectedModel === 'BLACK_PANTHER' ? 'text-[var(--color-error)]' : 'text-[var(--accent)]'} />
              Propulsé par le moteur LangGraph
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
