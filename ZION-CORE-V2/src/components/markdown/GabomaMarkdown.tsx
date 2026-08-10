'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import CodeBlock from './CodeBlock';
import type { ReactNode } from 'react';

interface GabomaMarkdownProps {
  content: string;
}

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 mx-0.5 rounded-md text-[0.85em] bg-white/10 border border-white/5 text-[var(--text-primary)] font-mono">
      {children}
    </code>
  );
}

export default function GabomaMarkdown({ content }: GabomaMarkdownProps) {
  return (
    <div className="markdown-prose max-w-none text-[15px]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
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
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-4 hover:text-white transition-colors" {...props}>
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-[14px] border border-white/10 shadow-sm bg-black/20">
                <table className="w-full text-[13px]">{children}</table>
              </div>
            );
          },
          p({ children }) {
            return <p className="mb-4 last:mb-0 leading-[1.75]">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>;
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
