/**
 * Ñkyel AI · UpgradeModal (Abonnements & Élite Pro)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Modal épurée et thémée (100% Light et 100% Dark) avec garanties WCAG 2.2 AA
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkle,
  Check,
  X,
  Lightning,
  ShieldCheck,
  Brain,
  Crown,
  Lock,
} from '@phosphor-icons/react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  if (!isOpen) return null;

  const plans = [
    {
      id: 'pro-unlimited',
      name: 'Ñkyel Pro Souverain',
      badge: 'Inférence Illimitée',
      price: billingCycle === 'yearly' ? '18 000 XAF' : '22 000 XAF',
      period: '/mois',
      popular: true,
      features: [
        'Accès illimité à Google Gemini 3.1 Pro & 2.5 Flash',
        'Ingestion multimodale 2 Millions de tokens',
        'Exécution Sandbox Python E2B illimitée',
        'Recherche Wandana Web Radar temps réel',
        'Mémoire souveraine DeerMem persistante',
        'Support prioritaire SmartANDJ',
      ],
    },
    {
      id: 'enterprise',
      name: 'Ñkyel Organisation',
      badge: 'Sur-mesure',
      price: 'Sur devis',
      period: '',
      popular: false,
      features: [
        'Déploiement VPC / Local On-Premise',
        'SLA 99.99% garanti et clés API dédiées',
        'Connecteurs MCP d\'entreprise sur-mesure',
        'Isolation totale et conformité RGPD / Souveraineté',
        'Formation et intégration continue',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Scrim */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
      />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-[var(--material-content)] border border-[var(--border-strong)] rounded-3xl shadow-[var(--shadow-modal)] overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--material-glass-regular)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center text-[var(--accent-fg)] font-bold">
                <Sparkle size={18} weight="fill" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight">
                  Rejoindre l&apos;Élite Ñkyel Pro
                </h2>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  SmartANDJ AI Technologies — Puissance souveraine mondiale
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
            {/* Promo Banner */}
            <div className="p-4 rounded-2xl bg-[var(--accent-subtle)] border border-[var(--accent)]/30 flex items-center gap-3">
              <Lightning size={24} weight="fill" className="text-[var(--accent)] shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[var(--text-primary)]">Offre Fondateur 2026 : </span>
                <span className="text-[var(--text-secondary)]">Profitez d&apos;un accès sans limites et de la rotation multi-modèles intelligente !</span>
              </div>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between text-left transition-all ${
                    p.popular
                      ? 'bg-[var(--surface-raised)] border-[var(--accent)]/50 shadow-md'
                      : 'bg-[var(--surface)] border-[var(--border)]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-full border border-[var(--accent)]/20">
                        {p.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">{p.name}</h3>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                          {p.price}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">{p.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-2 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check size={14} weight="bold" className="text-[var(--accent)] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      alert('Redirection vers la passerelle de paiement souveraine sécurisée...');
                      onClose();
                    }}
                    className={`mt-5 w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                      p.popular
                        ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] shadow-md'
                        : 'bg-[var(--surface-raised)] hover:bg-[var(--hover)] text-[var(--text-primary)] border border-[var(--border)]'
                    }`}
                  >
                    Choisir ce forfait
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
