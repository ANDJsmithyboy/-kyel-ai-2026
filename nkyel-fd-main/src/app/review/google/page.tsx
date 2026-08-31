/**
 * Ñkyel AI · Google Review Workspace
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Full-featured review workspace with live SSE chat.
 * Works for 35 days after token validation.
 * Bypasses Clerk auth — uses localStorage session.
 */

'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const REVIEW_SESSION_KEY = 'nkyel_review_session';
const REVIEW_EXPIRY_KEY = 'nkyel_review_expires';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function GoogleReviewWorkspace() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(35);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem(REVIEW_SESSION_KEY);
    const expiry = localStorage.getItem(REVIEW_EXPIRY_KEY);

    if (!token || !expiry) {
      setIsLoading(false);
      return;
    }

    const expiryMs = parseInt(expiry, 10);
    if (Date.now() > expiryMs) {
      localStorage.removeItem(REVIEW_SESSION_KEY);
      localStorage.removeItem(REVIEW_EXPIRY_KEY);
      setIsLoading(false);
      return;
    }

    const remaining = Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000));
    setDaysRemaining(remaining);
    setIsAuthorized(true);
    setIsLoading(false);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message with SSE streaming
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const assistantId = `msg-${Date.now()}-ai`;
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() },
    ]);

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          model: 'AURATA',
          conversationId: `review-${Date.now()}`,
          history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok || !res.body) {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: 'Erreur de connexion. Réessayez.' }
              : m,
          ),
        );
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6).trim();

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.type === 'token' && parsed.content) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed.content }
                    : m,
                ),
              );
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Erreur réseau. Vérifiez votre connexion.' }
            : m,
        ),
      );
    }

    setIsStreaming(false);
  }, [input, isStreaming, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#07090E]">
        <div className="w-8 h-8 border-2 border-[#D5AE57] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#07090E] text-white">
        <div className="max-w-md text-center space-y-4 p-8">
          <img src="/brand/nkyel-logo-white.png" alt="Ñkyel" className="h-10 mx-auto" />
          <h1 className="text-xl font-bold">Accès non autorisé</h1>
          <p className="text-sm text-neutral-400">Vous avez besoin d&apos;un lien d&apos;invitation valide pour accéder à cet espace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen w-full bg-[#07090E] text-white flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 p-4 flex flex-col h-full shrink-0 hidden md:flex">
        <div className="flex items-center gap-3 mb-8">
          <img src="/brand/nkyel-logo-white.png" alt="Ñkyel" className="h-6 w-auto" />
          <span className="font-semibold tracking-wide text-lg">ñkyel</span>
          <span className="text-[9px] bg-[#D5AE57]/10 text-[#D5AE57] px-2 py-0.5 rounded-full ml-auto font-semibold">
            REVIEW
          </span>
        </div>

        <div className="flex-1">
          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-3">Workspace</div>
          <button
            onClick={() => setMessages([])}
            className="w-full text-left px-3 py-2.5 rounded-xl bg-white/5 text-sm font-medium border border-white/5 hover:border-[#D5AE57]/30 transition-colors"
          >
            + Nouvelle conversation
          </button>
        </div>

        <div className="mt-auto pt-4 border-t border-white/10 space-y-1">
          <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Google App Review</div>
          <div className="text-xs text-[#D5AE57]">{daysRemaining} jours restants</div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="shrink-0 px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/brand/nkyel-logo-white.png" alt="Ñkyel" className="h-5 w-auto md:hidden" />
            <h1 className="text-sm font-semibold text-neutral-200">Ñkyel AI · Espace d&apos;Évaluation</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">LIVE</span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-20 space-y-4">
                <img src="/brand/nkyel-logo-white.png" alt="Ñkyel" className="h-12 mx-auto opacity-30" />
                <h2 className="text-xl font-bold text-neutral-300">Bienvenue dans Ñkyel AI</h2>
                <p className="text-sm text-neutral-500 max-w-md mx-auto">
                  Intelligence artificielle souveraine. Posez n&apos;importe quelle question pour tester les capacités de raisonnement, de recherche et de génération.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {[
                    'Explique-moi le WorkGraph de Ñkyel',
                    'Analyse comparative des IA africaines',
                    'Crée un rapport sur le marché tech gabonais',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        setTimeout(() => inputRef.current?.focus(), 100);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 border border-white/10 hover:border-[#D5AE57]/30 hover:text-[#D5AE57] transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#D5AE57] text-black font-medium'
                      : 'bg-white/5 text-neutral-200 border border-white/5'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{msg.content || (isStreaming ? '...' : '')}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 px-4 sm:px-6 pb-4 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-[#D5AE57]/50 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Envoyez un message à Ñkyel AI..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 resize-none outline-none max-h-32"
                style={{ minHeight: '24px' }}
                disabled={isStreaming}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="shrink-0 w-9 h-9 rounded-xl bg-[#D5AE57] text-black flex items-center justify-center hover:bg-[#D5AE57]/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-neutral-600 text-center mt-2">
              Ñkyel AI · SmartANDJ AI Technologies · Évaluation Google · {daysRemaining}j restants
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
