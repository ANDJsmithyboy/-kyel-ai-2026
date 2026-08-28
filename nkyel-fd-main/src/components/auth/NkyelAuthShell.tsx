/**
 * Ñkyel AI — Sovereign Authentication Architecture
 * SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
 *
 * Élite Visuelle : Apple Liquid Glass × Geist Typography × Ñkyel AI
 * - Double panneau Split-Screen (Desktop) / Fluid Stack (Mobile)
 * - Navigation fluide entre Connexion (/sign-in) et Inscription (/sign-up)
 * - Intégration Clerk Pro avec styling anti-fatigue natif (Dark & Light)
 * - Badge de souveraineté et métriques d'infrastructure en direct
 */

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkle,
  ShieldCheck,
  Cpu,
  Brain,
  TreeStructure,
  ArrowLeft,
  LockKey,
  Globe,
  CheckCircle,
  Lightning,
} from '@phosphor-icons/react';

interface NkyelAuthShellProps {
  mode: 'sign-in' | 'sign-up';
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const NKYEL_PILLARS = [
  {
    icon: TreeStructure,
    title: 'WorkGraph & Agents Autonomes',
    desc: 'Exécution DAG en streaming SSE avec inspection continue du raisonnement.',
    color: 'var(--accent)',
  },
  {
    icon: Brain,
    title: 'Mémoire Souveraine DeerMem',
    desc: 'Persistance contextuelle épisodique et vectorielle chiffrée de bout en bout.',
    color: '#60A5FA',
  },
  {
    icon: Cpu,
    title: 'Passerelle Multi-Modèles',
    desc: '9 classes de capacités (Fast, Deep, Code, Vision, Reasoner) sans verrou.',
    color: '#34D399',
  },
];

export default function NkyelAuthShell({
  mode,
  title,
  subtitle,
  children,
}: NkyelAuthShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full bg-[var(--material-canvas)] text-[var(--text-primary)] flex flex-col lg:flex-row relative overflow-x-hidden font-sans selection:bg-[var(--accent-subtle)] selection:text-[var(--accent)]">
      
      {/* ── Background Ambient Glow ────────────────── */}
      <div className="absolute top-0 start-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[var(--accent-subtle)] via-[#6757E8]/5 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 end-10 w-[500px] h-[500px] bg-gradient-to-tl from-[#10B981]/5 via-[var(--accent-subtle)] to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* ══════════════════════════════════════════════════════════════
          GAUCHE : Vitrine Souveraine Ñkyel AI (Desktop)
      ══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 border-e border-[var(--border-subtle)] relative bg-[var(--surface-sunken)]/40 backdrop-blur-2xl">
        
        {/* Top: Brand Header */}
        <div className="space-y-6">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-md shadow-[var(--shadow-accent)] border border-[var(--accent)]/40 relative flex-shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/Nkyel AI-logo.jpeg"
                alt="Ñkyel AI"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[var(--text-primary)] tracking-tight">Ñkyel AI</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold border border-[var(--accent)]/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] font-mono">Sovereign Global Intelligence</p>
            </div>
          </Link>

          {/* Badge & Headline */}
          <div className="pt-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] shadow-sm">
              <Sparkle size={14} className="text-[var(--accent)] animate-pulse" />
              <span>Plateforme Agentique Souveraine Haute Précision</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.15]">
              L'intelligence collective pour vos missions{' '}
              <span className="text-[var(--accent)]">
                autonomes complexes.
              </span>
            </h1>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg">
              Rejoignez l'écosystème Ñkyel AI réunissant l'orchestration multi-agents, 
              le studio d'artefacts VIE et la mémoire contextuelle sans compromis sur la confidentialité.
            </p>
          </div>

          {/* Feature Matrix Cards */}
          <div className="pt-6 space-y-3 max-w-lg">
            {NKYEL_PILLARS.map((p, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (idx + 1) }}
                className="p-3.5 rounded-2xl bg-[var(--surface-raised)]/60 border border-[var(--border-subtle)] hover:border-[var(--border)] transition-all flex items-start gap-3.5"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${p.color}15`, color: p.color }}
                >
                  <p.icon size={18} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-[var(--text-primary)]">{p.title}</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-normal">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="pt-10 border-t border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-tertiary)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Système Opérationnel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <LockKey size={12} className="text-[var(--accent)]" />
              <span>Chiffrement Zero-Knowledge</span>
            </div>
          </div>
          <p className="text-[10px] text-[var(--text-tertiary)] font-mono">
            SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          DROITE : Carte d'authentification Clerk Pro Ñkyel
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative">
        
        {/* Top Bar: Home Link + Mode Switch Tabs */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-xl hover:bg-[var(--surface-raised)] border border-transparent hover:border-[var(--border-subtle)]"
          >
            <ArrowLeft size={14} />
            <span>Accueil</span>
          </Link>

          {/* Segmented Auth Mode Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-subtle)] text-xs font-medium">
            <Link
              href="/sign-in"
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                mode === 'sign-in'
                  ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-sm font-semibold'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Connexion
            </Link>
            <Link
              href="/sign-up"
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                mode === 'sign-up'
                  ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-sm font-semibold'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Inscription
            </Link>
          </div>
        </div>

        {/* Center Container: Title & Clerk Component */}
        <div className="w-full max-w-md mx-auto space-y-6">
          
          {/* Mobile-only logo */}
          <div className="lg:hidden flex flex-col items-center text-center space-y-3 mb-6">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-[var(--accent)]/40 relative">
              <Image
                src="/Nkyel AI-logo.jpeg"
                alt="Ñkyel AI"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Ñkyel AI</h2>
              <p className="text-xs text-[var(--text-secondary)]">Authentification Souveraine</p>
            </div>
          </div>

          {/* Header Title */}
          <div className="space-y-1.5 text-center sm:text-start">
            <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Clerk Component Host with Glass Card Style */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface-raised)]/90 border border-[var(--border)] shadow-2xl backdrop-blur-xl relative">
            {children}
          </div>

          {/* Switch Prompt */}
          <div className="text-center text-xs text-[var(--text-secondary)]">
            {mode === 'sign-in' ? (
              <p>
                Vous n'avez pas encore de compte ?{' '}
                <Link
                  href="/sign-up"
                  className="text-[var(--accent)] hover:underline font-semibold"
                >
                  Créer un compte souverain
                </Link>
              </p>
            ) : (
              <p>
                Vous possédez déjà un compte ?{' '}
                <Link
                  href="/sign-in"
                  className="text-[var(--accent)] hover:underline font-semibold"
                >
                  Se connecter
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Bottom Security Footer */}
        <div className="w-full max-w-md mx-auto mt-8 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Sécurité Clerk Pro & Passkeys</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">
              Conditions
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">
              Confidentialité
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
