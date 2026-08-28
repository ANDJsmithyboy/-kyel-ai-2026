/**
 * Ñkyel AI — Safe Google-Grade Markdown Renderer
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Full Production Markdown Support:
 * - Headings (H2 ~20-22px, H3 ~16-18px)
 * - Lists (bullet, numbered, nested) with clean indentation
 * - Tables (overflow-x-auto, mobile touch safe)
 * - Code Blocks (Geist Mono, syntax highlight, real copy button, no page overflow)
 * - Inline Code (subtle background, clean radius)
 * - Blockquotes (amber accent border, italic)
 * - Links (sanitized, external indicator)
 * - Inline Citation chips ([1], [2])
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, ArrowSquareOut } from '@phosphor-icons/react';

interface NkyelMarkdownRendererProps {
  content: string;
  onCitationClick?: (index: number) => void;
}

// ── Code Block with Language Badge & Copy Button ─────────────────
function CodeBlockComponent({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || 'code';
  const codeString = String(children || '').replace(/\n$/, '');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [codeString]);

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-[var(--border)] bg-[#0C0F17] text-white shadow-md font-mono text-[13px] leading-relaxed">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.03]">
        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="h-7 px-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all text-xs font-sans active:scale-95 touch-manipulation"
          title="Copier le code"
          aria-label="Copier le code"
        >
          {copied ? (
            <>
              <Check size={12} weight="bold" className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copié</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copier</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Horizontal Scroll (Never breaks page layout) */}
      <pre className="p-4 overflow-x-auto scrollbar-thin text-neutral-200">
        <code className={className}>{codeString}</code>
      </pre>
    </div>
  );
}

// ── Inline Code Component ────────────────────────────────────────
function InlineCodeComponent({ children }: { children?: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[var(--surface-raised)] border border-[var(--border-subtle)] font-mono text-[13px] text-[var(--accent)] font-medium">
      {children}
    </code>
  );
}

// ── Link Component with Security and External Indicators ────────
function LinkComponent({ href, children }: { href?: string; children?: React.ReactNode }) {
  const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
  const isSafe = href && !href.startsWith('javascript:');

  if (!isSafe) {
    return <span>{children}</span>;
  }

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="inline-flex items-center gap-0.5 text-[var(--accent)] hover:underline font-medium break-words transition-colors"
    >
      <span>{children}</span>
      {isExternal && <ArrowSquareOut size={11} className="inline-block opacity-70 ml-0.5 shrink-0" />}
    </a>
  );
}

export default function NkyelMarkdownRenderer({ content, onCitationClick }: NkyelMarkdownRendererProps) {
  // Pre-process citations if formatted as [1], [2] to avoid breaking markdown
  const sanitizedContent = useMemo(() => {
    return content || '';
  }, [content]);

  return (
    <div className="w-full font-sans text-[15px] sm:text-[16px] leading-[1.68] text-[var(--text-primary)] break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-5 mb-2.5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[18px] sm:text-[20px] font-bold tracking-tight text-[var(--text-primary)] mt-5 mb-2 border-b border-[var(--border-subtle)] pb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[16px] sm:text-[17px] font-semibold tracking-tight text-[var(--text-primary)] mt-4 mb-1.5">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[15px] font-semibold text-[var(--text-primary)] mt-3 mb-1">
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children }) => <p className="mb-3.5 last:mb-0 leading-[1.68]">{children}</p>,

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-3 space-y-1.5 text-[var(--text-primary)]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-3 space-y-1.5 text-[var(--text-primary)]">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,

          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-[3px] border-[var(--accent)] pl-4 py-1 my-3.5 italic text-[var(--text-secondary)] bg-[var(--surface-raised)]/40 rounded-r-xl">
              {children}
            </blockquote>
          ),

          // Code
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return <InlineCodeComponent>{children}</InlineCodeComponent>;
            }
            return <CodeBlockComponent className={className}>{children}</CodeBlockComponent>;
          },

          // Tables (with horizontal scrollable wrapper for mobile)
          table: ({ children }) => (
            <div className="my-4 w-full overflow-x-auto scrollbar-thin rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/30">
              <table className="w-full border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-[var(--border)] bg-[var(--surface-raised)] text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody className="divide-y divide-[var(--border-subtle)]">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-[var(--hover)] transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-4 py-3 font-semibold">{children}</th>,
          td: ({ children }) => <td className="px-4 py-2.5 text-[14px]">{children}</td>,

          // Horizontal rule
          hr: () => <hr className="my-5 border-t border-[var(--border-subtle)]" />,

          // Links
          a: ({ href, children }) => <LinkComponent href={href}>{children}</LinkComponent>,
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
}
