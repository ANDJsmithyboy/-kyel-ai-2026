/**
 * Ñkyel AI · MessageBubble
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Bulle de message unifiée avec :
 * - Typographie soignée (Geist / SF Mono)
 * - Rendu Markdown réactif compatible Mode Clair & Mode Sombre
 * - Intégration de ResponseActions sous chaque réponse
 * - Identité souveraine de l'agent sans modèle figé en dur
 */

'use client';

import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Terminal, Sparkle, User } from '@phosphor-icons/react';
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
    <div className="nkyel-code-block my-3 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-inset)] overflow-hidden text-[13px] font-mono shadow-md">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[var(--surface-raised)] border-b border-[var(--border)] text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-[var(--accent)]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {language}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-[var(--success)]" weight="bold" />
              <span className="text-[var(--success)]">Copié</span>
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
      <pre className="p-4 overflow-x-auto text-[var(--text-primary)] leading-relaxed scrollbar-thin">
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
  modelName = 'Ñkyel',
  sourcesCount = 0,
  hasArtifact = false,
  onRegenerate,
}: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      data-message-role={role}
      data-message-kind={isUser ? 'user' : isStreaming ? 'agent-activity' : 'assistant'}
      aria-label={isUser ? 'Message utilisateur' : isStreaming ? 'Travail de Ñkyel en cours' : 'Réponse de Ñkyel'}
      className={cn(
        'nkyel-message-row w-full max-w-3xl mx-auto px-4 py-3 flex gap-3.5 transition-opacity duration-200',
        isUser ? 'nkyel-user-message justify-end' : 'nkyel-assistant-message justify-start'
      )}
    >
      {/* Avatar Agent */}
      {!isUser && (
        <div className="nkyel-message-avatar flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--accent)] mt-0.5 shadow-sm">
          <Sparkle size={16} weight="fill" />
        </div>
      )}

      {/* Corps du message */}
      <div
        className={cn(
          'nkyel-message-column flex flex-col min-w-0 max-w-[88%]',
          isUser ? 'items-end' : 'items-start flex-1'
        )}
      >
        {/* En-tête du message */}
        <div className="nkyel-message-meta flex items-center gap-2 mb-1 text-[11px] text-[var(--text-tertiary)] font-mono">
          <span className="nkyel-message-author font-medium text-[var(--text-secondary)]">{isUser ? 'Vous' : modelName}</span>
          {!isUser && !isStreaming && <span className="nkyel-message-kind">Réponse de l’agent</span>}
          {isStreaming && !isUser && (
            <span className="nkyel-agent-work-indicator inline-flex items-center gap-1 text-[var(--accent)] font-sans font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
              Travail de l’agent · en cours
            </span>
          )}
        </div>

        {/* Bulle de contenu */}
        <div
          className={cn(
            'nkyel-message-content rounded-2xl px-4 py-3 text-[var(--text-base)] leading-relaxed select-text transition-all',
            isUser
              ? 'nkyel-message-user-surface bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border-strong)] rounded-tr-sm shadow-sm'
              : 'nkyel-message-assistant-surface bg-transparent text-[var(--text-primary)] w-full p-0'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="nkyel-assistant-body max-w-none text-[var(--text-primary)] prose-headings:text-[var(--text-primary)] prose-headings:font-semibold prose-a:text-[var(--accent)] prose-a:underline prose-code:font-mono prose-pre:p-0 prose-pre:bg-transparent space-y-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !String(children).includes('\n');
                    if (isInline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 mx-0.5 rounded bg-[var(--surface-raised)] text-[var(--accent)] font-mono text-[13px] border border-[var(--border)]"
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
        <div className="nkyel-message-avatar w-8 h-8 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5 text-[var(--text-secondary)] shadow-sm">
          <User size={16} />
        </div>
      )}
    </div>
  );
}
