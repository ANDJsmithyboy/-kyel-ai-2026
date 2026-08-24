/* Ñkyel AI · sign-up/[[...sign-up]]/page.tsx · SmartANDJ AI Technologies
   Fondateur : Daniel Jonathan ANDJ
   Pure Sovereign Ñkyel Sign-Up Experience (No third-party iframe) */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { ArrowRight } from '@phosphor-icons/react';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/chat');
    }, 300);
  };

  return (
    <AuthShell mode="sign-up">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)] block">
            Nom complet
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Daniel Jonathan ANDJ"
            className="w-full h-11 px-3.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-default)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-[var(--text-primary)] text-sm transition-all outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)] block">
            Adresse e-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="fondateur@nkyel.ai"
            className="w-full h-11 px-3.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-default)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-[var(--text-primary)] text-sm transition-all outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)] block">
            Mot de passe
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full h-11 px-3.5 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-default)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 text-[var(--text-primary)] text-sm transition-all outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 mt-2 rounded-xl bg-[var(--text-primary)] hover:opacity-90 text-[var(--material-canvas)] font-semibold text-sm shadow-sm border-0 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Créer mon compte</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
