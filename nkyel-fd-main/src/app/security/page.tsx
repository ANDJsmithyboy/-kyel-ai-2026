/**
 * Ñkyel AI — Page Sécurité & Souveraineté des Données (Section 45)
 * Route : /security
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, LockKey, Database, CloudCheck, Key, ArrowLeft } from '@phosphor-icons/react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#08090D] text-[#F1EEE7] p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-[#7E8795] hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l'accueil
        </Link>

        <div className="mb-10 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-[#6F9485]/20 text-[#6F9485] flex items-center justify-center border border-[#6F9485]/30">
              <ShieldCheck size={28} weight="bold" />
            </span>
            <div>
              <h1 className="text-2xl font-bold font-heading text-[#F1EEE7]">Sécurité & Souveraineté Ñkyel AI</h1>
              <p className="text-xs text-[#7E8795] mt-1">
                Engagement de protection, chiffrement et isolation stricte multi-tenant.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-xs text-[#B8C0CC] leading-relaxed">
          <section className="p-6 rounded-2xl bg-[#0E121A] border border-white/[0.06]">
            <h2 className="text-sm font-bold text-[#F1EEE7] mb-3 flex items-center gap-2">
              <LockKey size={18} className="text-[var(--accent)]" />
              1. Chiffrement de Bout en Bout & Authentification
            </h2>
            <p>
              Toutes les communications entre votre navigateur, l'API FastAPI et le moteur DeerFlow 2.0 sont chiffrées
              en transit via TLS 1.3. L'authentification repose sur des jetons signés RS256 émis par Clerk avec
              support natif du MFA et des Passkeys.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0E121A] border border-white/[0.06]">
            <h2 className="text-sm font-bold text-[#F1EEE7] mb-3 flex items-center gap-2">
              <Database size={18} className="text-[#665F9E]" />
              2. Cloisonnement Row-Level Security (RLS) sur Neon PostgreSQL
            </h2>
            <p>
              Chaque utilisateur dispose d'un identifiant immuable unique. Nos tables PostgreSQL appliquent
              strictement les politiques Row-Level Security (RLS) garantissant qu'aucun utilisateur ou agent tiers ne peut
              accéder à vos threads, messages, souvenirs ou artefacts.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[#0E121A] border border-white/[0.06]">
            <h2 className="text-sm font-bold text-[#F1EEE7] mb-3 flex items-center gap-2">
              <CloudCheck size={18} className="text-[#6F9485]" />
              3. Stockage Souverain Cloisonné sur Cloudflare R2
            </h2>
            <p>
              Tous vos livrables (images FLUX, vidéos Wan2.1, audios et rapports de recherche) sont isolés dans des clés
              sécurisées sous <code className="text-[#AAA2C8]">users/&#123;user_id&#125;/artifacts/...</code> et accessibles
              uniquement via des URLs signées temporaires.
            </p>
          </section>
        </div>

        <footer className="mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-4">
          <p>© 2026 SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/acceptable-use" className="hover:text-white transition-colors">Usage Acceptable</Link>
            <Link href="/legal" className="hover:text-white transition-colors">Mentions Légales</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
