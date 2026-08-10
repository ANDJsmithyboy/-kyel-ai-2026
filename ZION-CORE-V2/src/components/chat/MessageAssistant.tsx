/**
 * GabomaAI · MessageAssistant
 * SmartANDJ AI Technologies
 * Task 7 — Bulle assistant alignée gauche avec markdown + sources
 */

'use client';

import { motion } from 'framer-motion';
import type { GabomaMessage } from '@/lib/models';
import SourcePills from '@/components/chat/SourcePills';

interface MessageAssistantProps {
  message: GabomaMessage;
}

export default function MessageAssistant({ message }: MessageAssistantProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-start"
    >
      <div
        className="max-w-[85%] md:max-w-[72%] px-5 py-4 glass shadow-sm"
        style={{
          borderRadius: '24px 24px 24px 6px',
        }}
      >
        <div
          className="markdown-prose text-[var(--text-sm)] text-[var(--text-primary)] tracking-wide"
          style={{ lineHeight: 1.65, wordBreak: 'break-word' }}
          dangerouslySetInnerHTML={{ __html: renderMarkdownSimple(message.content) }}
        />
        {message.sources && message.sources.length > 0 && (
          <SourcePills sources={message.sources} />
        )}
      </div>
    </motion.div>
  );
}

/**
 * Rendu markdown minimal côté client (inline code, bold, italic, links).
 * Pour le rendu complet, utiliser GabomaMarkdown avec react-markdown.
 */
function renderMarkdownSimple(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:#050810;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px;margin:8px 0;overflow-x:auto;font-family:var(--font-mono);font-size:13px;line-height:1.6"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(197,160,89,0.1);color:#C5A059;padding:1px 5px;border-radius:4px;font-size:0.9em">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#00D4AA;text-decoration:underline">$1</a>')
    .replace(/\n/g, '<br/>');
}
