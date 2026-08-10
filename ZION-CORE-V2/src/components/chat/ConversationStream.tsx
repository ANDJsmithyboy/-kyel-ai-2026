/**
 * GabomaAI · ConversationStream
 * SmartANDJ AI Technologies
 * Task 7 — Liste des messages avec auto-scroll et curseur streaming
 */

'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GabomaMessage } from '@/lib/models';
import MessageUser from '@/components/chat/MessageUser';
import MessageAssistant from '@/components/chat/MessageAssistant';

interface ConversationStreamProps {
  messages: GabomaMessage[];
  isStreaming: boolean;
}

export default function ConversationStream({ messages, isStreaming }: ConversationStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      style={{ scrollbarWidth: 'thin' }}
    >
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="flex flex-col items-center justify-center h-full gap-8 text-center relative"
        >
          {/* Advanced Multi-layered Ambient Orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[var(--accent)]/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[var(--color-success)]/5 blur-[80px] rounded-full pointer-events-none mix-blend-screen" />
          
          <motion.div
            animate={{ 
              boxShadow: ['0 0 0px var(--accent-20)', '0 0 40px var(--accent-35)', '0 0 0px var(--accent-20)'],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[var(--color-success)] flex items-center justify-center shadow-2xl relative z-10"
          >
            <div className="w-14 h-14 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
               <div className="w-3 h-3 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" />
            </div>
          </motion.div>
          
          <div className="relative z-10 space-y-2">
            <h2 className="text-[var(--text-3xl)] font-semibold text-[var(--text-primary)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Bonjour Daniel
            </h2>
            <p className="text-[var(--text-sm)] max-w-sm text-[var(--text-secondary)] mx-auto font-medium tracking-wide">
              Que faisons-nous aujourd&apos;hui ?
            </p>
          </div>
        </motion.div>
      )}

      <AnimatePresence initial={false}>
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <MessageUser key={msg.id} message={msg} />
          ) : (
            <MessageAssistant key={msg.id} message={msg} />
          )
        )}
      </AnimatePresence>

      {/* Curseur streaming */}
      {isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-start"
        >
          <div className="flex items-center gap-2 px-4 py-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
