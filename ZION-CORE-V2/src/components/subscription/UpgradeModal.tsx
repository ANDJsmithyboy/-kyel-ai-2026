/**
 * Nkyel AI · UpgradeModal & Subscription Flow
 * SmartANDJ AI Technologies
 * High-converting Pro subscription modal with Clerk Auth, pricing plans, and feature unlocks
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, SignInButton, SignUpButton } from '@clerk/nextjs';
import {
  Sparkle,
  CheckCircle,
  Lightning,
  ShieldCheck,
  Cpu,
  Infinity as InfinityIcon,
  X,
  ArrowRight,
} from '@phosphor-icons/react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { isSignedIn } = useAuth();

  if (!isOpen) return null;

  const plans = [
    {
      id: 'pro_monthly',
      name: 'Ñkyel Pro Souverain',
      badge: 'Recommandé — INFJ-A & Visionnaires',
      price: '19.99 €',
      period: '/ mois',
      features: [
        'Accès illimité au modèle souverain 120B (Ñkyel Chui)',
        'Moteur Agent DeerFlow 2.0 complet avec WorkGraph',
        'Génération d\'images haute résolution via Imagen 3',
        'Génération de vidéos et animations avec Veo',
        'Exécution de code native ultra-rapide (Vercel Labs fx)',
        'Connecteurs MCP illimités & RAG souverain (Neon + Redis)',
        'Support prioritaire 24/7 par SmartANDJ AI',
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Ñkyel Enterprise & Gouvernance',
      badge: 'Sur-mesure',
      price: '99.00 €',
      period: '/ mois',
      features: [
        'Toutes les fonctionnalités Pro incluses',
        'Déploiement sur infrastructure souveraine dédiée',
        'Bases de connaissances vectorielles isolées (Qdrant dédié)',
        'Gouvernance multi-utilisateurs & RBAC',
        'SLA 99.99% avec audit de sécurité',
      ],
      popular: false,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-[#07090F] border border-[#D5AE57]/30 rounded-3xl shadow-[0_0_50px_rgba(213,174,87,0.2)] overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-[#10141F] to-[#171B27]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6757E8] to-[#D5AE57] flex items-center justify-center text-black">
                <Sparkle size={18} weight="fill" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Rejoindre l'Élite Ñkyel Pro
                </h2>
                <p className="text-[11px] text-[#9199A8]">
                  SmartANDJ AI Technologies — Puissance souveraine illimitée
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#9199A8] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
            {/* Promo Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#6757E8]/20 via-[#D5AE57]/10 to-transparent border border-[#D5AE57]/30 flex items-center gap-3">
              <Lightning size={24} weight="fill" className="text-[#D5AE57] shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-white">Offre Fondateur & Lancement 2026 : </span>
                <span className="text-[#EDEAE3]">Profitez d'un accès sans limites et de la rotation multi-clés automatique !</span>
              </div>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between text-left transition-all ${
                    p.popular
                      ? 'bg-gradient-to-b from-[#171B27] to-[#10141F] border-[#D5AE57]/50 shadow-lg'
                      : 'bg-[#10141F] border-white/10'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5AE57] bg-[#D5AE57]/10 px-2 py-0.5 rounded-full border border-[#D5AE57]/20">
                        {p.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{p.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-extrabold text-white">{p.price}</span>
                        <span className="text-xs text-[#9199A8]">{p.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-2 text-xs text-[#9199A8] pt-2 border-t border-white/5">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle size={14} weight="fill" className="text-[#00D4AA] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5">
                    {isSignedIn ? (
                      <button
                        type="button"
                        onClick={() => {
                          alert('Redirection vers la passerelle de paiement sécurisée...');
                          onClose();
                        }}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D5AE57] to-[#C5A059] text-black font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
                      >
                        <span>S'abonner maintenant</span>
                        <ArrowRight size={14} weight="bold" />
                      </button>
                    ) : (
                      <SignUpButton mode="modal">
                        <button
                          type="button"
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6757E8] to-[#D5AE57] text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
                        >
                          <span>Créer un compte & S'abonner</span>
                          <ArrowRight size={14} weight="bold" />
                        </button>
                      </SignUpButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
