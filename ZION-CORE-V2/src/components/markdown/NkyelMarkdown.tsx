'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import CodeBlock from './CodeBlock';
import type { ReactNode } from 'react';

interface NkyelMarkdownProps {
  content: string;
}

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 mx-0.5 rounded-md text-[0.88em] bg-[var(--accent-10)] text-[var(--accent)] font-mono border border-[var(--accent-16)]">
      {children}
    </code>
  );
}

export default function NkyelMarkdown({ content }: NkyelMarkdownProps) {
  if (!content) return null;

  return (
    <div className="markdown-prose max-w-none text-[15px] leading-relaxed text-[var(--text-primary)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1({ children }) {
            return <h1 className="text-xl font-bold text-white mt-5 mb-2.5 tracking-tight border-b border-white/10 pb-1.5">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg font-bold text-white mt-4 mb-2 tracking-tight">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base font-semibold text-[var(--accent)] mt-3.5 mb-1.5">{children}</h3>;
          },
          h4({ children }) {
            return <h4 className="text-sm font-semibold text-white/90 mt-3 mb-1">{children}</h4>;
          },
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
                className="text-[var(--accent)] underline underline-offset-4 hover:opacity-80 transition-opacity font-medium"
                {...props}
              >
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-[var(--accent)] pl-4 py-1 my-3 italic text-white/80 bg-[var(--accent-06)] rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-[12px] border border-white/10 shadow-sm bg-black/30">
                <table className="w-full text-[13px] text-left divide-y divide-white/10">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return <th className="px-4 py-2.5 font-semibold text-white bg-white/5">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-2 text-white/80 border-t border-white/5">{children}</td>;
          },
          strong({ children }) {
            return <strong className="font-semibold text-white">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic text-white/90">{children}</em>;
          },
          hr() {
            return <hr className="my-4 border-white/10" />;
          },
          p({ children }) {
            return <p className="mb-3.5 last:mb-0 leading-[1.75]">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 mb-3.5 space-y-1.5">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 mb-3.5 space-y-1.5">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-[1.75] pl-1">{children}</li>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
