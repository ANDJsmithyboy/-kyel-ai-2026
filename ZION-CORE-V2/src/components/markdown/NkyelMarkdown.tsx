'use client';

import React, { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import CodeBlock from './CodeBlock';
import {
  Info,
  Lightbulb,
  Sparkle,
  Warning,
  WarningOctagon,
  Quotes,
  CheckCircle,
  Eye,
  Compass,
} from '@phosphor-icons/react';

interface NkyelMarkdownProps {
  content: string;
}

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 mx-0.5 rounded-md text-[0.88em] bg-[var(--accent-10)] text-[var(--accent)] font-mono border border-[var(--accent-20)] shadow-[0_0_8px_var(--accent-06)]">
      {children}
    </code>
  );
}

// Callout Types Configuration (2026 Design System)
const CALLOUT_CONFIG: Record<
  string,
  {
    title: string;
    border: string;
    bg: string;
    text: string;
    iconColor: string;
    glow: string;
    icon: React.ComponentType<any>;
  }
> = {
  NOTE: {
    title: 'Note',
    border: 'border-cyan-500/40',
    bg: 'bg-gradient-to-r from-cyan-950/30 to-cyan-900/10',
    text: 'text-cyan-200',
    iconColor: 'text-cyan-400',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    icon: Info,
  },
  INFO: {
    title: 'Information',
    border: 'border-blue-500/40',
    bg: 'bg-gradient-to-r from-blue-950/30 to-blue-900/10',
    text: 'text-blue-200',
    iconColor: 'text-blue-400',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    icon: Info,
  },
  TIP: {
    title: 'Astuce & Clé',
    border: 'border-emerald-500/40',
    bg: 'bg-gradient-to-r from-emerald-950/30 to-emerald-900/10',
    text: 'text-emerald-200',
    iconColor: 'text-emerald-400',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    icon: Lightbulb,
  },
  IMPORTANT: {
    title: 'Essentiel (Vision INFJ)',
    border: 'border-[#C5A059]/50',
    bg: 'bg-gradient-to-r from-[#C5A059]/15 to-[#C5A059]/5',
    text: 'text-[#EDEAE3]',
    iconColor: 'text-[#C5A059]',
    glow: 'shadow-[0_0_18px_rgba(197,160,89,0.2)]',
    icon: Sparkle,
  },
  WARNING: {
    title: 'Attention',
    border: 'border-amber-500/40',
    bg: 'bg-gradient-to-r from-amber-950/30 to-amber-900/10',
    text: 'text-amber-200',
    iconColor: 'text-amber-400',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    icon: Warning,
  },
  CAUTION: {
    title: 'Vigilance Critique',
    border: 'border-rose-500/40',
    bg: 'bg-gradient-to-r from-rose-950/30 to-rose-900/10',
    text: 'text-rose-200',
    iconColor: 'text-rose-400',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]',
    icon: WarningOctagon,
  },
  SUMMARY: {
    title: 'Synthèse Stratégique',
    border: 'border-violet-500/40',
    bg: 'bg-gradient-to-r from-violet-950/30 to-violet-900/10',
    text: 'text-violet-200',
    iconColor: 'text-violet-400',
    glow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)]',
    icon: Compass,
  },
  VISION: {
    title: 'Vision & Perspective',
    border: 'border-indigo-500/40',
    bg: 'bg-gradient-to-r from-indigo-950/30 to-indigo-900/10',
    text: 'text-indigo-200',
    iconColor: 'text-indigo-400',
    glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]',
    icon: Eye,
  },
};

function extractCalloutInfo(children: ReactNode): { type: string | null; cleanContent: ReactNode } {
  if (!children) return { type: null, cleanContent: children };

  const firstChild = Array.isArray(children) ? children[0] : children;
  if (React.isValidElement(firstChild) && firstChild.props && firstChild.props.children) {
    const rawText = Array.isArray(firstChild.props.children)
      ? firstChild.props.children[0]
      : firstChild.props.children;

    if (typeof rawText === 'string') {
      const match = rawText.match(/^\[!(NOTE|INFO|TIP|IMPORTANT|WARNING|CAUTION|SUMMARY|VISION)\]\s*(.*)/i);
      if (match) {
        const type = match[1].toUpperCase();
        const remainingFirstText = match[2];

        const newChildren = React.Children.map(children, (child, idx) => {
          if (idx === 0 && React.isValidElement(child)) {
            const inner = React.Children.toArray(child.props.children);
            inner[0] = remainingFirstText;
            return React.cloneElement(child as React.ReactElement<any>, {}, ...inner);
          }
          return child;
        });

        return { type, cleanContent: newChildren };
      }
    }
  }

  return { type: null, cleanContent: children };
}

export default function NkyelMarkdown({ content }: NkyelMarkdownProps) {
  if (!content) return null;

  return (
    <div className="markdown-prose max-w-none text-[15px] leading-relaxed text-[var(--text-primary)] font-normal space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1({ children }) {
            return (
              <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#EDEAE3] to-[var(--accent)] mt-6 mb-3 tracking-tight border-b border-white/10 pb-2 flex items-center gap-2">
                <Sparkle size={20} weight="fill" className="text-[var(--accent)] shrink-0" />
                <span>{children}</span>
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-lg md:text-xl font-bold text-white mt-5 mb-2.5 tracking-tight flex items-center gap-2">
                <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-[var(--accent)] to-emerald-500" />
                <span>{children}</span>
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-base font-semibold text-[var(--accent)] mt-4 mb-2 tracking-wide flex items-center gap-1.5">
                <CheckCircle size={16} weight="bold" className="text-[var(--accent)] shrink-0" />
                <span>{children}</span>
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="text-sm font-semibold text-white/90 mt-3 mb-1 uppercase tracking-wider text-[12px] text-white/60">
                {children}
              </h4>
            );
          },
          code({ className, children, ...props }) {
            const isBlock =
              className?.startsWith('language-') ||
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
                className="text-[var(--accent)] font-medium underline underline-offset-4 hover:text-white hover:shadow-[0_0_12px_var(--accent)] transition-all"
                {...props}
              >
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            const { type, cleanContent } = extractCalloutInfo(children);

            if (type && CALLOUT_CONFIG[type]) {
              const cfg = CALLOUT_CONFIG[type];
              const Icon = cfg.icon;

              return (
                <div
                  className={`my-4 p-4 rounded-xl border ${cfg.border} ${cfg.bg} ${cfg.glow} backdrop-blur-md transition-all duration-300`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={18} weight="fill" className={cfg.iconColor} />
                    <span className={`text-[12px] font-bold uppercase tracking-wider ${cfg.iconColor}`}>
                      {cfg.title}
                    </span>
                  </div>
                  <div className={`text-[14px] leading-relaxed ${cfg.text}`}>
                    {cleanContent}
                  </div>
                </div>
              );
            }

            return (
              <blockquote className="relative my-4 p-4 pl-5 rounded-xl border-l-4 border-[var(--accent)] bg-gradient-to-r from-[var(--accent-10)] to-transparent backdrop-blur-sm italic text-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <Quotes size={24} weight="fill" className="absolute top-2 right-3 text-[var(--accent-20)] pointer-events-none" />
                <div className="relative z-10 leading-relaxed">{children}</div>
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-5 rounded-2xl border border-white/10 shadow-2xl bg-black/40 backdrop-blur-md">
                <table className="w-full text-[13px] text-left divide-y divide-white/10">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-white/5 uppercase tracking-wider text-[11px] text-white/70 font-semibold">{children}</thead>;
          },
          th({ children }) {
            return <th className="px-4 py-3 font-semibold text-white tracking-wider">{children}</th>;
          },
          td({ children }) {
            return (
              <td className="px-4 py-3 text-white/85 border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                {children}
              </td>
            );
          },
          strong({ children }) {
            return <strong className="font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic text-[var(--accent)]/95">{children}</em>;
          },
          hr() {
            return (
              <hr className="my-6 border-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-35)] to-transparent" />
            );
          },
          p({ children }) {
            return <p className="mb-3.5 last:mb-0 leading-[1.78]">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-none pl-1 mb-3.5 space-y-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 mb-3.5 space-y-2">{children}</ol>;
          },
          li({ children }) {
            return (
              <li className="leading-[1.75] flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 shrink-0 shadow-[0_0_6px_var(--accent)]" />
                <span className="flex-1">{children}</span>
              </li>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
