'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { Copy, Check } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

/**
 * V3 Code Block — Design System V3
 * - Rayon 10px, bordure 1px accent 8%
 * - Header 36-40px, JetBrains 12px langage, bouton Copier
 * - Corps JetBrains 14px (desktop) / 13px (mobile)
 * - Scroll horizontal, jamais de wrap forcé
 * - Palette gabonaise désaturée (pas VS Code criard)
 */

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
}

export default function CodeBlock({ children, className }: CodeBlockProps) {
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
      {/* Header : langage à gauche, Copier à droite */}
      <div className="code-block-header">
        <span className="code-block-lang">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className={cn('code-block-copy', copied && 'copied')}
        >
          {copied ? (
            <>
              <Check size={14} weight="bold" />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--ls-meta)',
                }}
              >
                Copié
              </span>
            </>
          ) : (
            <>
              <Copy size={14} weight="thin" />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--ls-meta)',
                }}
              >
                Copier
              </span>
            </>
          )}
        </button>
      </div>
      {/* Corps : scroll horizontal, pas de wrap */}
      <pre className="code-block-body">
        <code className={className}>{code}</code>
      </pre>
    </div>
  );
}
