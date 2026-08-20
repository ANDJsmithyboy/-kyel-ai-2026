/**
 * Nkyel AI · MessageAssistant
 * SmartANDJ AI Technologies
 * Bulle assistant avec rendu Markdown complet (NkyelMarkdown), CodeBlock, Table, Listes & Sources
 */

'use client';

import { motion } from 'framer-motion';
import type { NkyelMessage } from '@/lib/models';
import SourcePills from '@/components/chat/SourcePills';
import NkyelMarkdown from '@/components/markdown/NkyelMarkdown';

interface MessageAssistantProps {
  message: NkyelMessage;
}

export default function MessageAssistant({ message }: MessageAssistantProps) {
  const isEmpty = !message.content || message.content.trim() === '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-start w-full"
    >
      <div
        className="max-w-[90%] md:max-w-[80%] px-5 py-4 glass shadow-sm"
        style={{
          borderRadius: '24px 24px 24px 6px',
        }}
      >
        {isEmpty ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" style={{ animationDelay: '200ms' }} />
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        ) : (
          <NkyelMarkdown content={message.content} />
        )}
        {message.sources && message.sources.length > 0 && (
          <SourcePills sources={message.sources} />
        )}
      </div>
    </motion.div>
  );
}
