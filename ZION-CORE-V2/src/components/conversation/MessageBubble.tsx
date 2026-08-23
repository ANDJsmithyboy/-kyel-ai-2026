/**
 * Ñkyel AI · MessageBubble
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Sovereign message bubble with:
 * — Geist Sans / Geist Mono typography
 * — Clean non-boxy assistant responses
 * — High-precision code blocks with syntax highlighting & copy
 * — Action bar integration under assistant responses
 * — Clear role separation: User, Ñkyel, Agent Activity, VIE, Artifact, Source, WorkGraph
 */

'use client';

import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Terminal, User } from '@phosphor-icons/react';
import NkyelSeptBranchLogo from '@/components/icons/NkyelSeptBranchLogo';
import ResponseActions from './ResponseActions';

/* ── Code Block Component ── */
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
    <div
      className="my-3 overflow-hidden"
      style={{
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        background: 'var(--surface)',
        fontSize: 'var(--text-sm)',
        fontFamily: 'var(--font-mono)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Code Header */}
      <div
        className="flex items-center justify-between"
        style={{
          paddingInline: 'var(--space-3)',
          paddingBlock: 'var(--space-1)',
          background: 'var(--surface-raised)',
          borderBottom: '1px solid var(--border-subtle)',
          color: 'var(--fg-muted)',
        }}
      >
        <div className="flex items-center gap-2">
          <Terminal size={14} style={{ color: 'var(--accent)' }} />
          <span
            className="font-semibold uppercase tracking-wider"
            style={{ fontSize: '11px', color: 'var(--fg-muted)' }}
          >
            {language}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded"
          style={{
            paddingInline: 'var(--space-2)',
            paddingBlock: '2px',
            fontSize: '11px',
            color: 'var(--fg-subtle)',
            transition: `all var(--transition-fast)`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--fg)';
            e.currentTarget.style.background = 'var(--accent-subtle)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--fg-subtle)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {copied ? (
            <>
              <Check size={12} style={{ color: 'var(--hue-success)' }} weight="bold" />
              <span style={{ color: 'var(--hue-success)' }}>Copié</span>
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
      <pre
        className="overflow-x-auto scrollbar-thin"
        style={{
          padding: 'var(--space-4)',
          color: 'var(--fg)',
          lineHeight: 'var(--leading-relaxed)',
        }}
      >
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
      className="w-full mx-auto flex gap-3.5"
      style={{
        maxWidth: 'var(--content-max)',
        paddingInline: 'var(--space-4)',
        paddingBlock: 'var(--space-3)',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      {/* Agent Avatar */}
      {!isUser && (
        <div
          className="flex items-center justify-center shrink-0 mt-0.5"
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-muted)',
          }}
        >
          <NkyelSeptBranchLogo size={20} glow={false} />
        </div>
      )}

      {/* Message Content Container */}
      <div
        className="flex flex-col min-w-0"
        style={{
          maxWidth: isUser ? '85%' : '100%',
          flex: isUser ? 'none' : '1',
          alignItems: isUser ? 'flex-end' : 'flex-start',
        }}
      >
        {/* Message Header / Meta */}
        <div
          className="flex items-center gap-2 mb-1 font-mono"
          style={{ fontSize: '11px', color: 'var(--fg-subtle)' }}
        >
          <span>{isUser ? 'Vous' : modelName}</span>
          {isStreaming && !isUser && (
            <span
              className="inline-flex items-center gap-1.5"
              style={{ color: 'var(--accent)' }}
            >
              <span
                className="animate-ping rounded-full"
                style={{ width: 6, height: 6, background: 'var(--accent)' }}
              />
              Génération en cours…
            </span>
          )}
        </div>

        {/* Content Bubble */}
        <div
          className="select-text"
          style={{
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--leading-relaxed)',
            width: isUser ? 'auto' : '100%',
            padding: isUser ? '10px 16px' : '0',
            borderRadius: isUser ? 'var(--radius-lg)' : '0',
            background: isUser ? 'var(--surface-raised)' : 'transparent',
            border: isUser ? '1px solid var(--border-default)' : 'none',
            color: 'var(--fg)',
            boxShadow: isUser ? 'var(--shadow-xs)' : 'none',
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose max-w-none prose-p:my-2 prose-headings:font-semibold prose-code:font-mono">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match && !String(children).includes('\n');
                    if (isInline) {
                      return (
                        <code
                          className="font-mono rounded"
                          style={{
                            paddingInline: '5px',
                            paddingBlock: '2px',
                            marginInline: '2px',
                            background: 'var(--accent-subtle)',
                            color: 'var(--accent)',
                            fontSize: 'var(--text-sm)',
                            border: '1px solid var(--border-subtle)',
                          }}
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

        {/* Response Action Bar under assistant messages */}
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

      {/* User Avatar */}
      {isUser && (
        <div
          className="flex items-center justify-center shrink-0 mt-0.5"
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-default)',
            color: 'var(--fg-muted)',
          }}
        >
          <User size={16} />
        </div>
      )}
    </div>
  );
}
