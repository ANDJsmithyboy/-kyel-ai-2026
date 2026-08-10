'use client';

import { useState, useCallback, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, ArrowClockwise, ThumbsUp, ThumbsDown } from '@phosphor-icons/react';
import ThinkingAnimation from './ThinkingAnimation';
import { OnyxFaceIcon } from '../icons/OnyxFaceIcon';
import { AurataIcon } from '../icons/AurataIcon';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings.store';

/* ── V3 Code Block — rayon 10px, JetBrains 14px, palette gabonaise ── */
function CodeBlock({ children, className }: { children: ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || '';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [code]);

  return (
    <div className="code-block-container">
      {/* Header : langage + copier */}
      <div className="code-block-header">
        <span className="code-block-lang">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className={cn('code-block-copy', copied && 'copied')}
        >
          {copied ? (
            <>
              <Check size={14} weight="bold" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Copié</span>
            </>
          ) : (
            <>
              <Copy size={14} weight="thin" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Copier</span>
            </>
          )}
        </button>
      </div>
      {/* Corps : 14px desktop, scroll horizontal */}
      <pre className="code-block-body">
        <code className={className}>{code}</code>
      </pre>
    </div>
  );
}

/* ── V3 Inline code — 13px JetBrains ── */
function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code
      style={{
        padding: '2px 6px',
        margin: '0 2px',
        borderRadius: '4px',
        fontSize: 'var(--fs-code-inline)',
        lineHeight: 'var(--lh-code-inline)',
        background: 'var(--accent-10)',
        color: 'var(--accent)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {children}
    </code>
  );
}

export interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  agentStep?: { type: string; label: string; status: 'running' | 'done' | 'warning' } | null;
  modelName?: string;
  tagline?: string;
  time?: string;
  onRegenerate?: () => void;
  onCopy?: () => void;
  showActions?: boolean;
}

export default function MessageBubble({
  role,
  content,
  isStreaming = false,
  agentStep = null,
  modelName = 'BLACK PANTHER',
  tagline = 'AUTOMATA V2.0',
  time = 'A l\'instant',
  onRegenerate,
  onCopy,
  showActions = true,
}: MessageBubbleProps) {
  const isUser = role === 'user';
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);
  const [msgCopied, setMsgCopied] = useState(false);
  const blackPantherMode = useSettingsStore((s) => s.blackPantherMode);

  const handleCopyMessage = useCallback(() => {
    navigator.clipboard.writeText(content);
    setMsgCopied(true);
    onCopy?.();
    setTimeout(() => setMsgCopied(false), 1800);
  }, [content, onCopy]);

  return (
    <div
      className={cn(
        'flex w-full animate-fade-in-up group mb-6',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start w-full')}>
        
        {/* V3: Assistant eyebrow label — position seule distingue les rôles */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{
                background: 'var(--accent-10)',
                border: '1px solid var(--accent-16)',
                color: 'var(--accent)',
                boxShadow: '0 0 10px var(--accent-10)',
              }}
            >
               {modelName.includes('AURATA') ? <AurataIcon className="w-3.5 h-3.5" /> : <OnyxFaceIcon className="w-3.5 h-3.5" />}
            </div>
            <span className="eyebrow-label">
              {modelName} <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>·</span> <span style={{ color: 'var(--text-secondary)', letterSpacing: 'var(--ls-meta)' }}>{tagline}</span>
            </span>
          </div>
        )}

        {/* V3: Message content — AI = flat (no bg), User = glass-user-msg */}
        {isUser ? (
          /* ── TEXTE UTILISATEUR : aligné droite, max 70%, fond glass, SemiBold 600 ── */
          <div className="msg-user">
            <p style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
          </div>
        ) : isStreaming && !content && !agentStep ? (
          /* ── STREAMING INDICATOR ── */
          <div className="flex items-center gap-2 py-1">
            <span className="eyebrow-label" style={{ animation: 'pulse-soft 1.5s infinite' }}>
              En piste…
            </span>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent)',
                animation: 'pulse-soft 1.5s infinite',
                boxShadow: '0 0 8px var(--accent-35)',
              }}
            />
          </div>
        ) : (
          /* ── TEXTE IA : pleine largeur, zéro fond, Sora Medium 500 ── */
          <div className="msg-ai">
            {/* Agent step indicator */}
            {agentStep && (
              <div
                className="flex items-center gap-2 py-1 rounded-lg px-3 mb-3 w-max"
                style={{
                  background: 'var(--accent-06)',
                  border: '1px solid var(--accent-08)',
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background:
                      agentStep.status === 'running' ? 'var(--accent)' :
                      agentStep.status === 'warning' ? 'var(--color-warning)' :
                      'var(--color-success)',
                    boxShadow:
                      agentStep.status === 'running' ? '0 0 8px var(--accent-35)' :
                      agentStep.status === 'warning' ? '0 0 8px rgba(217,142,59,0.5)' :
                      '0 0 8px rgba(31,157,107,0.5)',
                    animation: agentStep.status === 'running' ? 'pulse-soft 1.5s infinite' : 'none',
                  }}
                />
                <span
                  className="eyebrow-label"
                  style={{
                    color:
                      agentStep.status === 'running' ? 'var(--accent)' :
                      agentStep.status === 'warning' ? 'var(--color-warning)' :
                      'var(--color-success)',
                    animation: agentStep.status === 'running' ? 'pulse-soft 1.5s infinite' : 'none',
                  }}
                >
                  {agentStep.label}
                </span>
              </div>
            )}

            {/* <think> block parsing */}
            {(() => {
              let thinking = null;
              let mainContent = content;
              
              const thinkStart = content.indexOf('<think>');
              if (thinkStart !== -1) {
                const thinkEnd = content.indexOf('</think>');
                if (thinkEnd === -1) {
                  thinking = content.slice(thinkStart + 7);
                  mainContent = content.slice(0, thinkStart);
                } else {
                  thinking = content.slice(thinkStart + 7, thinkEnd);
                  mainContent = content.slice(0, thinkStart) + content.slice(thinkEnd + 8);
                }
              }

              return (
                <>
                  {thinking && (
                    <details 
                      className="mb-4 rounded-lg overflow-hidden group"
                      style={{
                        border: '1px solid var(--accent-10)',
                        background: 'var(--bg-glass)',
                      }}
                      open={isStreaming && content.indexOf('</think>') === -1}
                    >
                      <summary 
                        className="cursor-pointer py-2 px-3 flex items-center gap-2 select-none hover:bg-[var(--accent-06)] transition-colors"
                        style={{
                          fontSize: 'var(--fs-caption)',
                          color: 'var(--text-secondary)',
                          letterSpacing: 'var(--ls-meta)'
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            animation: (isStreaming && content.indexOf('</think>') === -1) ? 'pulse-soft 1.5s infinite' : 'none',
                          }}
                        />
                        <span className="eyebrow-label" style={{color: 'var(--text-secondary)'}}>
                          {(isStreaming && content.indexOf('</think>') === -1) ? `${modelName.split(' ')[0]} réfléchit...` : `Réflexion de ${modelName.split(' ')[0]}`}
                        </span>
                      </summary>
                      <div 
                        className="px-3 pb-3 text-[var(--text-tertiary)]" 
                        style={{
                          fontSize: 'var(--fs-small)',
                          lineHeight: 'var(--lh-body)',
                          borderTop: '1px solid var(--accent-06)',
                          paddingTop: '8px',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {thinking.trim()}
                      </div>
                    </details>
                  )}

                  {/* Markdown content */}
                  {mainContent && (
                    <div className="markdown-prose max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ className, children, ...props }) {
                            const isBlock = className?.startsWith('language-') ||
                              (typeof children === 'string' && children.includes('\n'));
                            if (isBlock) {
                              return <CodeBlock className={className}>{children}</CodeBlock>;
                            }
                            return <InlineCode>{children}</InlineCode>;
                          },
                          a({ children, href, ...props }) {
                            return (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--accent)] underline underline-offset-4 hover:opacity-80 transition-opacity"
                                style={{ transitionDuration: 'var(--duration-hover)' }}
                                {...props}
                              >
                                {children}
                              </a>
                            );
                          },
                          table({ children }) {
                            return (
                              <div
                                className="overflow-x-auto my-4"
                                style={{
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--border)',
                                  background: 'var(--accent-06)',
                                }}
                              >
                                <table style={{ width: '100%', fontSize: 'var(--fs-small)' }}>{children}</table>
                              </div>
                            );
                          },
                          p({ children }) {
                            return <p style={{ marginBottom: '16px', lineHeight: 'var(--lh-body)' }}>{children}</p>;
                          },
                          ul({ children }) {
                            return <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>;
                          },
                          ol({ children }) {
                            return <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>;
                          },
                          li({ children }) {
                            return <li style={{ lineHeight: 'var(--lh-body)', paddingLeft: '4px' }}>{children}</li>;
                          }
                        }}
                      >
                        {mainContent}
                      </ReactMarkdown>

                      {/* V3: Streaming cursor — accent color, blink */}
                      {isStreaming && (
                        <span
                          style={{
                            display: 'inline-block',
                            width: 6,
                            height: 16,
                            background: 'var(--accent)',
                            borderRadius: 2,
                            marginLeft: 4,
                            verticalAlign: 'middle',
                            animation: 'terminal-cursor-blink 1s infinite',
                            boxShadow: '0 0 8px var(--accent-35)',
                          }}
                        />
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Metadata & Actions */}
        {isUser ? (
          <div className="mt-1.5 px-2">
            <span
              style={{
                fontSize: 'var(--fs-caption)',
                lineHeight: 'var(--lh-caption)',
                fontWeight: 500,
                letterSpacing: 'var(--ls-meta)',
                color: 'var(--text-tertiary)',
              }}
            >
              {time}
            </span>
          </div>
        ) : (
          showActions && !isStreaming && content && (
            <div
              className="flex items-center gap-1 mt-2 px-1 opacity-0 group-hover:opacity-100"
              style={{ transition: `opacity var(--duration-dropdown) var(--ease-smooth)` }}
            >
              <button
                onClick={handleCopyMessage}
                className="flex items-center gap-1.5 p-1.5 rounded-lg transition-colors"
                style={{
                  color: msgCopied ? 'var(--color-success)' : 'var(--text-tertiary)',
                  transitionDuration: 'var(--duration-hover)',
                }}
                title="Copier"
              >
                {msgCopied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="thin" />}
              </button>

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-[var(--accent-06)] transition-colors"
                  style={{ color: 'var(--text-tertiary)', transitionDuration: 'var(--duration-hover)' }}
                  title="Refaire"
                >
                  <ArrowClockwise size={14} weight="thin" />
                </button>
              )}

              <button
                onClick={() => setFeedbackGiven('up')}
                className={cn('p-1.5 rounded-lg transition-colors ml-4')}
                style={{
                  color: feedbackGiven === 'up' ? 'var(--color-success)' : 'var(--text-tertiary)',
                  background: feedbackGiven === 'up' ? 'rgba(31,157,107,0.10)' : 'transparent',
                  transitionDuration: 'var(--duration-hover)',
                }}
                title="Utile"
              >
                <ThumbsUp size={14} weight="thin" />
              </button>

              <button
                onClick={() => setFeedbackGiven('down')}
                className="p-1.5 rounded-lg transition-colors"
                style={{
                  color: feedbackGiven === 'down' ? 'var(--color-error)' : 'var(--text-tertiary)',
                  background: feedbackGiven === 'down' ? 'rgba(224,88,75,0.10)' : 'transparent',
                  transitionDuration: 'var(--duration-hover)',
                }}
                title="Pas utile"
              >
                <ThumbsDown size={14} weight="thin" />
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
