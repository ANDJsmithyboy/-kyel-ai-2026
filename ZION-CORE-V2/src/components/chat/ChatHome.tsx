/**
 * Gaboma AI · ChatHome.tsx · Client Component
 * SmartANDJ AI Technologies
 * 
 * Zone centrale d'accueil (écran vide) :
 * - PC : Titre fixe "Que faisons-nous, {firstName} ?"
 * - Mobile : Logo [G] centré + salutation fluctuante (Mbolo, Salut, Bonjour)
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import InputBar from './InputBar';

const GREETINGS = ['Mbolo', 'Salut', 'Bonjour'];

interface ChatHomeProps {
  firstName?: string;
}

export default function ChatHome({ firstName = 'Citoyen' }: ChatHomeProps) {
  const [greeting, setGreeting] = useState('Mbolo');

  /* Fluctuate greeting on mount (mobile) */
  useEffect(() => {
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  }, []);

  const handleSend = (message: string, model: string | null, wandana: boolean) => {
    // TODO: Route to chat conversation
    console.log('Send:', { message, model, wandana });
  };

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center px-4">
      {/* ── Center content ────────────────────────── */}
      <div className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center">
        
        {/* Logo + fluctuating greeting for all screen sizes */}
        <div className="mb-8 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-4"
          >
            <Image
              src="/gaboma-logo.png"
              alt="Gaboma AI"
              width={64}
              height={64}
              className="rounded-2xl"
              priority
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center text-[22px] sm:text-[28px] font-semibold"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
            }}
          >
            <span style={{ color: 'var(--accent)' }}>{greeting} !</span> Bonjour, {firstName}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-2 text-[14px] text-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            Votre IA souveraine, toujours là pour vous.
          </motion.p>
        </div>
      </div>

      {/* ── InputBar (bottom, full width) ─────────── */}
      <div className="w-full max-w-2xl pb-6">
        <InputBar onSend={handleSend} />
      </div>
    </div>
  );
}
