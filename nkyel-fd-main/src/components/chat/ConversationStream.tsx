/**
 * Nkyel AI · ConversationStream
 * SmartANDJ AI Technologies
 * Message stream with ChatHero when empty, auto-scroll, and streaming indicators
 */

'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { NkyelMessage } from '@/lib/models';
import MessageUser from '@/components/chat/MessageUser';
import MessageAssistant from '@/components/chat/MessageAssistant';
import ChatHero from '@/components/chat/ChatHero';

interface ConversationStreamProps {
  messages: NkyelMessage[];
  isStreaming: boolean;
  onSelectAction?: (prompt: string) => void;
  onOpenMore?: () => void;
}

export default function ConversationStream({
  messages,
  isStreaming,
  onSelectAction = () => {},
  onOpenMore = () => {},
}: ConversationStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4 flex flex-col justify-between"
      style={{ scrollbarWidth: 'thin' }}
    >
      {/* 1. Empty State -> ChatHero */}
      {messages.length === 0 ? (
        <div className="my-auto">
          <ChatHero
            onSelectAction={onSelectAction}
            onOpenMore={onOpenMore}
          />
        </div>
      ) : (
        /* 2. Message History Stream */
        <div className="max-w-3xl w-full mx-auto space-y-4 pt-2">
          <AnimatePresence initial={false}>
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <MessageUser key={msg.id} message={msg} />
              ) : (
                <MessageAssistant key={msg.id} message={msg} />
              )
            )}
          </AnimatePresence>

          {/* Streaming Dot Pulse */}
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#10141F] border border-white/10 w-max">
                <div className="w-2 h-2 rounded-full bg-[#D5AE57] animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#D5AE57] animate-pulse" style={{ animationDelay: '200ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#D5AE57] animate-pulse" style={{ animationDelay: '400ms' }} />
                <span className="text-[11px] text-[#9199A8] font-medium ml-1">Ñkyel réfléchit…</span>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
