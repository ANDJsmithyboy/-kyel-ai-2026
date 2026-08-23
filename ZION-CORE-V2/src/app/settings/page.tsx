/**
 * Ñkyel AI · Page Paramètres de Production & Souveraineté
 * SmartANDJ AI Technologies — Fondateur : Daniel Jonathan ANDJ
 * Configuration complète synchronisée avec Neon PostgreSQL
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';
import AntreModal from '@/components/settings/AntreModal';

export default function SettingsPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#07090F] text-[#EDEAE3] flex flex-col justify-center items-center">
      <AntreModal
        isOpen={isOpen}
        onClose={() => router.push('/')}
        initialTab="general"
      />
    </div>
  );
}
