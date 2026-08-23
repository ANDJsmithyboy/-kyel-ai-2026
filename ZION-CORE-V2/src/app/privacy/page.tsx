/**
 * Ñkyel AI · Politique de Confidentialité & Protection des Données (RGPD & Souveraineté)
 * SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
 * Route : /privacy
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, LockKey, Database, UserSwitch, FileText, Globe } from '@phosphor-icons/react';

const SECTIONS = [
  {
    title: '1. Responsable du Traitement & Délégué aux Données',
    content: `SmartANDJ AI Technologies, société fondée par Daniel Jonathan ANDJ, est responsable du traitement des données personnelles collectées lors de l'utilisation de la plateforme Ñkyel AI. Contact DPO : privacy@smartandj.ai.`,
  },
  {
    title: '2. Données Collectées & Minimalisme',
    content: `Nous appliquons le principe de minimisation des données :\n• Identité : Nom, email et identifiant utilisateur (gérés via Clerk JWKS RS256).\n• Préférences : Paramètres de locale BCP-47, devise, timezone, thème et granularité de recherche.\n• Mémoire Souveraine (DeerMem) : Faits et préférences mémorisés sous votre contrôle strict (modifiables et supprimables à tout moment).\n• Télémétrie & Logs : Latence anonymisée, modèles interrogés (zéro contenu de prompt archivé à des fins publicitaires).`,
  },
  {
    title: '3. Résidence des Données & Politique de Souveraineté',
    content: `Ñkyel AI offre un contrôle granulaire de résidence des données dans les paramètres utilisateur :\n• GLOBAL : Routage optimisé vers le modèle le plus performant mondialement.\n• EU ONLY : Traitement et inférence exclusivement au sein de l'Union Européenne (Mistral AI, Scaleway, OVHcloud).\n• AFRIQUE : Traitement et inférence orientés vers la souveraineté africaine.\n• LOCAL / PRIVATE : Inférence exclusive sur cluster privé dédié (RunPod / vLLM on-premise).`,
  },
  {
    title: '4. Vos Droits d\'Accès, de Rectification et d\'Effacement',
    content: `Conformément aux réglementations sur la protection des données personnelles, vous disposez des droits d'accès, de rectification, de portabilité et d'effacement de l'intégralité de vos données. L'exportation de votre historique et la purge de votre mémoire s'effectuent directement depuis l'interface des paramètres.`,
  },
  {
    title: '5. Sécurité, Isolation & Chiffrement',
    content: `Toutes les données sont chiffrées en transit (TLS 1.3) et au repos (AES-256). Notre base de données Neon PostgreSQL applique le Row-Level Security (RLS) garantissant une étanchéité multi-tenant absolue.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#08090D] text-[#EDEDEC] p-6 md:p-12 overflow-y-auto selection:bg-[#D5AE57]/30 selection:text-white" style={{ fontFamily: 'var(--font-sans, "Geist", system-ui, sans-serif)' }}>
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Retour à l&apos;accueil
        </Link>

        <div className="mb-10 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-[#6F9485]/15 text-[#6F9485] flex items-center justify-center border border-[#6F9485]/30">
              <ShieldCheck size={28} weight="bold" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Politique de Confidentialité & Souveraineté</h1>
              <p className="text-xs text-white/50 mt-1">
                Dernière mise à jour : Août 2026 · SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 text-xs text-white/80 leading-relaxed">
          {SECTIONS.map((s, idx) => (
            <section key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <LockKey size={18} className="text-[#D5AE57]" />
                {s.title}
              </h2>
              <p className="text-white/70 whitespace-pre-line leading-relaxed">{s.content}</p>
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-4">
          <p>© 2026 SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/security" className="hover:text-white transition-colors">Sécurité</Link>
            <Link href="/acceptable-use" className="hover:text-white transition-colors">Usage Acceptable</Link>
            <Link href="/legal" className="hover:text-white transition-colors">Mentions Légales</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
