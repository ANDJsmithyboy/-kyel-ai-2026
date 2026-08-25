/**
 * Ñkyel AI · Manus-Grade & Apple-Precision Sovereign Landing Page
 * Powered by Google Gemini Ecosystem & Private Sovereign Fabric
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Élite Visuelle : Manus AI + Apple Precision + Linear
 * - Hero lumineux avec prompt composer interactif
 * - Simulateur temps réel du WorkGraph & VIE Canvas propulsé par Google Gemini
 * - Écosystème Google (Gemini Flash, Gemini Pro, Imagen 3, Veo, Cloud TPU)
 * - Moteur d'inférence privé (38 fournisseurs orchestrés en coulisses)
 * - Intégration Clerk fluide (Sign In, Sign Up, User State)
 * - Hub légal exhaustif reliant toutes les politiques
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Brain,
  TerminalWindow,
  Globe,
  LockKey,
  Database,
  Lightning,
  TreeStructure,
  Eye,
  CheckCircle,
  Play,
  UserCircle,
  Code,
  FileText,
  Cookie,
  Scales,
  ChatCircleText,
  PlugsConnected,
  ChartLineUp,
  Image,
  VideoCamera,
  Infinity as InfinityIcon,
} from '@phosphor-icons/react';
import { useSafeUser as useUser, SignInButton, SignUpButton, UserButton } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

const GEMINI_CAPABILITIES = [
  { id: 'flash', label: '⚡ Gemini 2.5 Flash', desc: 'Ultra-rapide <80ms', badge: 'Vitesse Éclair' },
  { id: 'pro', label: '🧠 Gemini 3.1 Pro', desc: 'Raisonnement 2M Tokens', badge: 'Raisonnement Élite' },
  { id: 'code', label: '💻 Gemini Code Architect', desc: 'Génération & Compilation Fullstack', badge: 'Code Pro' },
  { id: 'vision', label: '👁️ Gemini Vision Pro', desc: 'Analyse Multimodale Vidéo/Image', badge: 'Multimodal' },
  { id: 'imagen', label: '🎨 Imagen 3 & Veo Studio', desc: 'Génération Image & Vidéo HD', badge: 'Création Visuelle' },
  { id: 'multilingual', label: '🌍 Polyglotte Mondial', desc: '100+ Langues & Dialectes', badge: 'Universel' },
];

const SAMPLE_MISSIONS = [
  "Créer une application React complète avec backend FastAPI et base Neon",
  "Analyser ce rapport financier de 500 pages grâce au contexte 2M de Gemini",
  "Développer un agent de recherche autonome avec WorkGraph et simulation temporelle",
  "Générer une interface UI interactive en direct dans le studio d'artefacts VIE",
];

const APPLE_CORE_PILLARS = [
  {
    icon: Brain,
    color: '#D5AE57',
    title: "1. Puissance Multimodale Google Gemini",
    desc: "Fenêtre de contexte jusqu'à 2 millions de tokens. Ingestion fluide de documents massifs, de vidéos brutes, d'audios et de codebases complètes en une seule requête.",
    tag: "Gemini 3.1 / 2.5 Pro",
  },
  {
    icon: TreeStructure,
    color: '#6F9485',
    title: "2. WorkGraph & Human Node",
    desc: "Exécution agentique transparente décomposée en étapes vérifiables avec arbitrages humains à tout moment et checkpoints de retour en arrière.",
    tag: "Orchestration V2",
  },
  {
    icon: Image,
    color: '#3B82F6',
    title: "3. Studio d'Artefacts & Création Multimodale",
    desc: "Génération d'images haute fidélité via Imagen 3, vidéo dynamique via Veo et compilation d'applications interactives exécutables en direct dans VIE Canvas.",
    tag: "Imagen 3 · Veo",
  },
  {
    icon: Database,
    color: '#A78BFA',
    title: "4. Mémoire Souveraine DeerMem",
    desc: "9 niveaux de mémoire persistante contextuelle. Vos préférences, instructions et projets restent gravés sous votre contrôle strict sans fuite.",
    tag: "9 Niveaux de Contexte",
  },
  {
    icon: Globe,
    color: '#EC4899',
    title: "5. Polyglotte Universel & RTL",
    desc: "Compréhension et génération natives en plus de 100 langues mondiales, inversion complète de l'interface en RTL (Arabe, Hébreu) et respect des nuances culturelles.",
    tag: "100+ Langues",
  },
  {
    icon: ShieldCheck,
    color: '#10B981',
    title: "6. Sécurité de Rang Bancaire & Cloud Privé",
    desc: "Authentification chiffrée JWKS RS256, isolation multi-tenant Row-Level Security sur base dédiée, chiffrement de bout en bout et zéro clé API exposée en clair.",
    tag: "Chiffrement Zero-Knowledge",
  },
];

export default function ManusLandingPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const [promptText, setPromptText] = useState('');
  const [selectedCapability, setSelectedCapability] = useState('pro');
  const [simulatedStep, setSimulatedStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedStep((prev) => (prev + 1) % 4);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const handleLaunch = () => {
    if (isSignedIn) {
      router.push('/chat');
    } else {
      router.push('/sign-in');
    }
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-[#EDEDEC] selection:bg-[#D5AE57]/30 selection:text-white relative overflow-x-hidden" style={{ fontFamily: 'var(--font-sans, "Geist", system-ui, -apple-system, sans-serif)' }}>
      {/* ── Apple-Grade Ambient Aurora Mesh ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#D5AE57]/20 via-[#6F9485]/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[25%] -left-48 w-[650px] h-[650px] bg-[#3B82F6]/10 blur-[160px] rounded-full" />
        <div className="absolute top-[55%] -right-48 w-[650px] h-[650px] bg-[#D5AE57]/15 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:28px_28px] opacity-30" />
      </div>

      {/* ── Frosted Glass Sticky Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05060A]/85 backdrop-blur-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D5AE57] to-amber-200 text-black flex items-center justify-center font-black text-sm shadow-[0_0_25px_rgba(213,174,87,0.4)] group-hover:scale-105 transition-transform">
              Ñ
            </div>
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              Ñkyel <span className="text-[#D5AE57] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#D5AE57]/10 border border-[#D5AE57]/30 tracking-wider">GEMINI CORE</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-white/70">
            <a href="#gemini" className="hover:text-white transition-colors">Écosystème Gemini</a>
            <a href="#workgraph" className="hover:text-white transition-colors">WorkGraph</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capacités</a>
            <a href="#sovereignty" className="hover:text-white transition-colors">Souveraineté</a>
            <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
          </nav>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/chat"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D5AE57] to-amber-300 hover:opacity-95 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(213,174,87,0.35)] transition-transform active:scale-95"
                >
                  <Lightning size={14} weight="fill" />
                  <span>Ouvrir l&apos;Agent</span>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <SignInButton mode="modal">
                  <button className="px-3.5 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-all">
                    Se connecter
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D5AE57] to-amber-300 hover:opacity-95 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(213,174,87,0.4)] transition-transform active:scale-95">
                    <span>Créer un compte</span>
                    <ArrowRight size={13} weight="bold" />
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Hero Section (Manus AI × Apple Vibe) ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-24 space-y-28">
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Luminous Apple Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-medium text-white/90 shadow-[0_0_30px_rgba(213,174,87,0.15)] backdrop-blur-md"
          >
            <Sparkle size={14} weight="fill" className="text-[#D5AE57] animate-pulse" />
            <span>Propulsé par Google Gemini Ecosystem & l&apos;Orchestrateur Souverain Ñkyel</span>
          </motion.div>

          {/* Grand Apple/Manus Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
          >
            L&apos;Agent IA Généraliste <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D5AE57] via-amber-100 to-[#6F9485]">
              Universel & Multimodal
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            Exécutez vos missions complexes grâce à la puissance multimodale de <strong>Google Gemini (Flash, Pro, Imagen 3, Veo)</strong> orchestrée par une architecture souveraine privée avec mémoire contextuelle et restitution d&apos;artefacts en direct.
          </motion.p>

          {/* ── Interactive Manus-Style Prompt Composer ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-3xl mx-auto p-3.5 sm:p-5 rounded-3xl border border-white/[0.12] bg-[#0A0C14]/95 backdrop-blur-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_30px_90px_rgba(0,0,0,0.8)] space-y-4 text-left"
          >
            <div className="relative">
              <textarea
                rows={3}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Décrivez votre mission complexe à Ñkyel (développement fullstack, analyse d'un PDF de 500 pages avec Gemini 2M, recherche arborescente, rendu visuel...)"
                className="w-full p-3 bg-transparent text-sm text-white placeholder-white/50 focus:outline-none resize-none leading-relaxed font-sans"
              />
            </div>

            {/* Quick Sample Prompts */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {SAMPLE_MISSIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptText(s)}
                  className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-[11px] text-white/70 hover:text-white whitespace-nowrap transition-colors"
                >
                  {s.slice(0, 42)}...
                </button>
              ))}
            </div>

            {/* Gemini Capability Switcher & Execution CTA */}
            <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {GEMINI_CAPABILITIES.map((cap) => {
                  const isSel = selectedCapability === cap.id;
                  return (
                    <button
                      key={cap.id}
                      onClick={() => setSelectedCapability(cap.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                        isSel
                          ? 'bg-[#D5AE57]/20 border border-[#D5AE57]/60 text-[#D5AE57] shadow-sm'
                          : 'bg-black/40 border border-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      {cap.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleLaunch}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#D5AE57] to-amber-300 hover:opacity-95 text-black font-black text-xs transition-transform active:scale-95 shadow-[0_0_25px_rgba(213,174,87,0.4)] shrink-0"
              >
                <span>Lancer la Mission</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>
          </motion.div>
        </section>

        {/* ── Live Agent Execution Simulation Showcase (Manus Vibe) ── */}
        <section id="workgraph" className="p-6 sm:p-10 rounded-3xl border border-white/10 bg-white/[0.015] backdrop-blur-xl space-y-7 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#D5AE57]">
                <TreeStructure size={16} />
                <span>WORKGRAPH AGENT ENGINE 2.0 · GOOGLE GEMINI BACKBONE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Exécution Agentique Décomposable & Vérifiable
              </h2>
            </div>
            <span className="text-xs px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2 self-start font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Cœur Actif : Google Gemini 3.1 Pro (2M Contexte)
            </span>
          </div>

          {/* 4 Interactive Progress Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: '1. Ingestion & Raisonnement 2M', desc: 'Gemini Pro analyse instantanément l’ensemble du contexte sans perte d’information.', engine: 'Google Gemini Pro', state: simulatedStep >= 0 ? 'completed' : 'pending' },
              { title: '2. Décomposition WorkGraph', desc: 'Planification arborescente dynamique et allocation des sous-tâches spécialisées.', engine: 'WorkGraph Orchestrator', state: simulatedStep >= 1 ? 'completed' : 'pending' },
              { title: '3. Exécution Sandbox & Outils', desc: 'Génération de code, validation TypeScript et exécution d’APIs dans un environnement isolé.', engine: 'E2B Sandbox + Gemini', state: simulatedStep >= 2 ? 'completed' : 'pending' },
              { title: '4. Restitution Interactive VIE', desc: 'Compilation temps réel d’artefacts complets (React, UI, documents) directement utilisables.', engine: 'VIE Studio Canvas', state: simulatedStep >= 3 ? 'completed' : 'pending' },
            ].map((node, i) => (
              <div
                key={i}
                className={`p-5 rounded-2xl border transition-all ${
                  simulatedStep === i
                    ? 'bg-[#D5AE57]/10 border-[#D5AE57] text-white shadow-[0_0_20px_rgba(213,174,87,0.2)]'
                    : 'bg-black/35 border-white/5 text-white/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-[#D5AE57]">
                    {node.engine}
                  </span>
                  <CheckCircle size={17} className={simulatedStep >= i ? 'text-emerald-400' : 'text-white/20'} weight="fill" />
                </div>
                <h3 className="font-bold text-xs text-white">{node.title}</h3>
                <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{node.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Google Ecosystem & Sovereign Core (Apple Grid) ── */}
        <section id="gemini" className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              L&apos;Écosystème d&apos;Intelligence Google Gemini
            </h2>
            <p className="text-xs sm:text-sm text-white/60">
              Une alliance parfaite entre la technologie de pointe de Google et l&apos;orchestration souveraine privée de SmartANDJ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {APPLE_CORE_PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl border border-white/[0.08] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.15] transition-all space-y-4 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/10" style={{ background: `${p.color}15`, color: p.color }}>
                        <Icon size={22} weight="bold" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10">
                        {p.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white">{p.title}</h3>
                    <p className="text-xs text-white/60 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Sovereign Manifesto (Apple Vibe) ── */}
        <section id="sovereignty" className="p-8 sm:p-14 rounded-3xl border border-[#D5AE57]/30 bg-gradient-to-b from-[#D5AE57]/10 via-transparent to-transparent text-center space-y-5 max-w-4xl mx-auto shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#D5AE57] text-black font-black text-xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(213,174,87,0.4)]">
            Ñ
          </div>
          <blockquote className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-snug max-w-3xl mx-auto">
            « L&apos;intelligence artificielle ne doit appartenir à aucun cartel. Ñkyel est le pont souverain vers l&apos;intelligence universelle pour tous les continents. »
          </blockquote>
          <p className="text-xs text-white/60 font-mono">
            SmartANDJ AI Technologies · Fondateur & Architecte en Chef : Daniel Jonathan ANDJ
          </p>
        </section>
      </main>

      {/* ── Enterprise Footer with ALL Policies ── */}
      <footer className="border-t border-white/[0.08] bg-[#030407] py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-xs">
          <div className="col-span-2 space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#D5AE57] text-black flex items-center justify-center font-black text-xs">
                Ñ
              </div>
              <span className="font-bold text-sm text-white">Ñkyel AI</span>
            </div>
            <p className="text-[11px] text-white/50 max-w-xs leading-relaxed">
              Propulsé par SmartANDJ AI Technologies. Moteur d&apos;intelligence artificielle universelle et souveraine orchestrant l&apos;écosystème Google Gemini.
            </p>
            <p className="text-[10px] text-white/30 font-mono">
              SmartANDJ AI Technologies · Édition Mondiale Production 2026
            </p>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider text-[#D5AE57]">Produit</span>
            <ul className="space-y-1.5 text-white/60">
              <li><Link href="/chat" className="hover:text-white transition-colors">Conversation & Chat</Link></li>
              <li><Link href="/workspace" className="hover:text-white transition-colors">WorkGraph Studio</Link></li>
              <li><Link href="/settings" className="hover:text-white transition-colors">Paramètres Souverains</Link></li>
              <li><Link href="/welcome" className="hover:text-white transition-colors">Vitrine Ñkyel</Link></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider text-[#D5AE57]">Cœur IA</span>
            <ul className="space-y-1.5 text-white/60">
              <li><span className="text-white/40">Google Gemini 3.1 Pro</span></li>
              <li><span className="text-white/40">Google Gemini 2.5 Flash</span></li>
              <li><span className="text-white/40">Google Imagen 3 Studio</span></li>
              <li><span className="text-white/40">Google Veo Video Engine</span></li>
              <li><span className="text-white/40">Souveraineté Cloud Privé</span></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider text-[#D5AE57]">Politiques & Légal</span>
            <ul className="space-y-1.5 text-white/60">
              <li><Link href="/terms" className="hover:text-white transition-colors">Conditions Générales (CGU)</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Confidentialité & RGPD</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Sécurité & Résidence</Link></li>
              <li><Link href="/acceptable-use" className="hover:text-white transition-colors">Utilisation Acceptable</Link></li>
              <li><Link href="/legal" className="hover:text-white transition-colors">Mentions Légales</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Politique de Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/40 gap-4">
          <p>© 2026 SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ · Tous droits réservés.</p>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Moteur Google Gemini Connecté · Infrastructure Privée Opérationnelle</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
