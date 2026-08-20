/**
 * Ñkyel AI · MessageBubble
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Bulle de message unifiée avec :
 * - Typographie soignée (Outfit / Sora / JetBrains Mono)
 * - Rendu Markdown réactif (tables, code blocks, listes)
 * - Intégration de ResponseActions sous chaque réponse
 * - Identité souveraine de l'agent sans modèle figé en dur
 */

'use client';

import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Terminal, Sparkle, User } from '@phosphor-icons/react';
import NkyelSeptBranchLogo from '@/components/icons/NkyelSeptBranchLogo';
import ResponseActions from './ResponseActions';
import { cn } from '@/lib/utils';

/* -- Bloc de Code Haute Précision -- */
function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || 'code';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="my-3 rounded-xl border border-white/[0.08] bg-[#0E121A] overflow-hidden text-[13px] font-mono shadow-md">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#151922] border-b border-white/[0.06] text-[#7E8795]">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-[#665F9E]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B8C0CC]">
            {language}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-[#7E8795] hover:text-[#F1EEE7] hover:bg-white/[0.06] transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-[#6F9485]" weight="bold" />
              <span className="text-[#6F9485]">Copié</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copier</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-4 overflow-x-auto text-[#F1EEE7] leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
        <code className={className}>{code}</code>
      </pre>
    </div>
  );
}

export interface MessageBubbleProps {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  modelName?: string;
  sourcesCount?: number;
  hasArtifact?: boolean;
  onRegenerate?: () => void;
}

export default function MessageBubble({
  id = 'msg_1',
  role,
  content,
  isStreaming = false,
  modelName = 'Ñkyel Auto',
  sourcesCount = 0,
  hasArtifact = false,
  onRegenerate,
}: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'w-full max-w-3xl mx-auto px-4 py-3 flex gap-3.5 transition-opacity duration-200',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar Agent */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#665F9E]/20 to-[#C39A52]/20 border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
          <NkyelSeptBranchLogo size={20} glow={false} />
        </div>
      )}

      {/* Corps du message */}
      <div
        className={cn(
          'flex flex-col min-w-0 max-w-[88%]',
          isUser ? 'items-end' : 'items-start flex-1'
        )}
      >
        {/* En-tête du message */}
        <div className="flex items-center gap-2 mb-1 text-[11px] text-[#7E8795] font-mono">
          <span>{isUser ? 'Vous' : modelName}</span>
          {isStreaming && !isUser && (
            <span className="inline-flex items-center gap-1 text-[#665F9E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#665F9E] animate-ping" />
              Génération en cours…
            </span>
          )}
        </div>

        {/* Bulle de contenu */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-[14px] leading-relaxed select-text transition-all',
            isUser
              ? 'bg-[#151922] text-[#F1EEE7] border border-white/[0.08] rounded-tr-sm shadow-sm'
              : 'bg-transparent text-[#F1EEE7] w-full p-0'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-invert max-w-none prose-p:my-2 prose-headings:text-[#F1EEE7] prose-headings:font-semibold prose-a:text-[#665F9E] prose-code:font-mono prose-pre:p-0 prose-pre:bg-transparent">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !String(children).includes('\n');
                    if (isInline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 mx-0.5 rounded bg-white/[0.06] text-[#C39A52] font-mono text-[13px] border border-white/[0.04]"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return <CodeBlock className={className}>{children}</CodeBlock>;
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Barre d'actions sous les réponses d'assistant */}
        {!isUser && content && !isStreaming && (
          <ResponseActions
            content={content}
            messageId={id}
            sourcesCount={sourcesCount}
            hasArtifact={hasArtifact}
            onRegenerate={onRegenerate}
          />
        )}
      </div>

      {/* Avatar Utilisateur */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-[#151922] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5 text-[#B8C0CC]">
          <User size={16} />
        </div>
      )}
    </div>
  );
}
