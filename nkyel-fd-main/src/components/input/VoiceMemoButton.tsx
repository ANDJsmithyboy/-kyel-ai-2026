'use client';

import { Microphone, StopCircle } from '@phosphor-icons/react';
import { useState } from 'react';

export default function VoiceMemoButton() {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
    if (!isRecording) {
      setTimeout(() => setIsRecording(false), 3000); // Mock stop
    }
  };

  if (isRecording) {
    return (
      <button
        onClick={toggleRecording}
        className="w-10 h-10 mb-1 flex items-center justify-center rounded-full bg-red-500/15 border border-red-500/40 text-red-500 transition-colors shrink-0 animate-pulse"
        title="Arrêter l'enregistrement"
      >
        <StopCircle size={20} weight="fill" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleRecording}
      className="w-10 h-10 mb-1 flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-colors shrink-0"
      title="Mémo Vocal"
    >
      <Microphone size={20} weight="bold" />
    </button>
  );
}
