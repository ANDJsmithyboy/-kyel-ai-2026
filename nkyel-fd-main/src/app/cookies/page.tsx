/**
 * Ñkyel AI · Politique de Cookies & Traceurs
 * SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
 * Route : /cookies
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Cookie, ShieldCheck, CheckCircle, Sliders } from '@phosphor-icons/react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#08090D] text-[#EDEDEC] p-6 md:p-12 overflow-y-auto selection:bg-[var(--accent-subtle)] selection:text-white" style={{ fontFamily: 'var(--font-sans, "Geist", system-ui, sans-serif)' }}>
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l&apos;accueil
        </Link>

        <div className="mb-10 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center border border-[var(--accent)]/30">
              <Cookie size={28} weight="bold" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Politique de Cookies & Préférences</h1>
              <p className="text-xs text-white/50 mt-1">
                Transparence totale sur l&apos;usage minimaliste et respectueux des témoins de connexion sur Ñkyel AI.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-xs text-white/80 leading-relaxed">
          <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Cookie size={18} className="text-[var(--accent)]" />
              1. Qu&apos;est-ce qu&apos;un Cookie ?
            </h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite d&apos;un site web. Il permet de mémoriser vos préférences de navigation, de sécuriser votre session et d&apos;optimiser le temps de chargement de l&apos;interface.
            </p>
            <p>
              <strong>Engagement Ñkyel AI :</strong> Nous n&apos;utilisons AUCUN cookie publicitaire ou de revente de données à des courtiers tiers.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-400" />
              2. Cookies Strictement Nécessaires (Non désactivables)
            </h2>
            <p>
              Ces cookies sont indispensables au fonctionnement sécurisé de la plateforme et à la persistance de votre session :
            </p>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="font-mono text-[var(--accent)] font-bold">__session, __clerk_db_jwt</span>
                <span className="text-white/70">Gestion de la session sécurisée et authentification Clerk JWKS.</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="font-mono text-[var(--accent)] font-bold">Nkyel_theme, Nkyel_Language_Storage</span>
                <span className="text-white/70">Mémorisation locale du thème d&apos;interface (Dark/Light) et de la locale BCP-47 sans flash visuel.</span>
              </div>
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders size={18} className="text-[var(--accent)]" />
              3. Gestion de vos Préférences
            </h2>
            <p>
              Vous pouvez à tout moment configurer ou refuser le dépôt de témoins analytiques via les paramètres de votre navigateur ou directement depuis le menu <strong>Paramètres → Données & Confidentialité</strong> de Ñkyel AI.
            </p>
          </section>
        </div>

        <footer className="mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-4">
          <p>© 2026 SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/security" className="hover:text-white transition-colors">Sécurité</Link>
            <Link href="/legal" className="hover:text-white transition-colors">Mentions Légales</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
