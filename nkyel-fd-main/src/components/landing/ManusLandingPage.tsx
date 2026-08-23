/**
 * Ñkyel AI · Manus-Grade Sovereign Landing Page & Clerk Gateway
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Esthétique d'élite : Manus AI + Linear + Apple Design
 * - Hero lumineux avec prompt composer interactif
 * - Simulation temps réel du WorkGraph & VIE Canvas
 * - Matrice dynamique des 38 fournisseurs mondiaux d'IA
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
} from '@phosphor-icons/react';
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const CAPABILITIES = [
  { id: 'fast', label: 'Fast (Éclair)', model: 'Groq LPU / Gemini Flash', latency: '<100ms' },
  { id: 'reasoning', label: 'Raisonnement Approfondi', model: 'DeepSeek R1 / o1', latency: '400ms' },
  { id: 'code', label: 'Code Architect', model: 'Codestral FR / Qwen 2.5 Coder', latency: '180ms' },
  { id: 'vision', label: 'Vision & Multimodal', model: 'Pixtral Large / Gemini Pro', latency: '220ms' },
  { id: 'african', label: 'Langues Gabonaises & Africaines', model: 'Gaboma AI / Lelapa / Fang', latency: '150ms' },
  { id: 'sovereign', label: 'Souveraineté Dédiée', model: 'RunPod GPU / Mistral EU', latency: '90ms' },
];

const GLOBAL_ECOSYSTEMS = [
  { region: 'France (Prioritaire)', providers: ['Mistral AI', 'Scaleway AI', 'OVHcloud AI'], flag: '🇫🇷', badge: 'Souveraineté UE' },
  { region: 'USA & Global', providers: ['OpenAI', 'Anthropic', 'Google Gemini', 'Meta Llama', 'Groq LPU', 'Fireworks', 'Cohere'], flag: '🌐', badge: 'Puissance Brute' },
  { region: 'Chine', providers: ['DeepSeek', 'Alibaba Qwen', 'Zhipu GLM', 'Moonshot Kimi', 'MiniMax', 'Baidu ERNIE', 'ByteDance'], flag: '🇨🇳', badge: 'Raisonnement & Code' },
  { region: 'Afrique & Gabon', providers: ['Gaboma AI', 'Lelapa AI', 'Masakhane', 'Ñkyel Sovereign MoE', 'Fang / Punu / Myènè'], flag: '🇬🇦', badge: 'Patrimoine & Langues' },
  { region: 'Asie & Moyen-Orient', providers: ['NTT tsuzumi', 'NAVER HyperCLOVA X', 'Upstage Solar', 'Sarvam AI', 'Falcon TII', 'Jais Arabic'], flag: '🌏', badge: 'RTL & Spécialités' },
  { region: 'Self-Hosted & Local', providers: ['vLLM Cluster', 'TGI Engine', 'SGLang', 'Ollama Local', 'RunPod Dedicated GPU'], flag: '⚡', badge: 'Confidentialité 100%' },
];

const SAMPLE_MISSIONS = [
  "Créer une application React complète avec backend FastAPI et base Neon",
  "Analyser ce rapport financier et traduire la synthèse en Fang et Français",
  "Développer un agent autonome de veille concurrentielle avec WorkGraph",
  "Générer une interface UI interactive en direct dans le studio d'artefacts VIE",
];

export default function ManusLandingPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const [promptText, setPromptText] = useState('');
  const [selectedCapability, setSelectedCapability] = useState('reasoning');
  const [simulatedStep, setSimulatedStep] = useState(0);
  const [activeRegionFilter, setActiveRegionFilter] = useState('all');

  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedStep((prev) => (prev + 1) % 4);
    }, 3000);
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
    <div className="min-h-screen bg-[#06070B] text-[#EDEDEC] selection:bg-[#D5AE57]/30 selection:text-white relative overflow-x-hidden" style={{ fontFamily: 'var(--font-sans, "Geist", system-ui, sans-serif)' }}>
      {/* ── Dynamic Ambient Background Glows ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#D5AE57]/15 via-[#6F9485]/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[30%] -left-40 w-[600px] h-[600px] bg-[#3B82F6]/5 blur-[150px] rounded-full" />
        <div className="absolute top-[60%] -right-40 w-[600px] h-[600px] bg-[#D5AE57]/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* ── Sticky Luxury Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#06070B]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D5AE57] to-amber-200 text-black flex items-center justify-center font-black text-sm shadow-[0_0_20px_rgba(213,174,87,0.4)] group-hover:scale-105 transition-transform">
              Ñ
            </div>
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              Ñkyel <span className="text-[#D5AE57] text-xs font-mono font-normal px-1.5 py-0.5 rounded bg-[#D5AE57]/10 border border-[#D5AE57]/20">AI FABRIC</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-white/70">
            <a href="#fabric" className="hover:text-white transition-colors">Global Fabric</a>
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
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D5AE57] hover:bg-[#C5A059] text-black font-bold text-xs shadow-lg transition-transform active:scale-95"
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
                  <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D5AE57] hover:bg-[#C5A059] text-black font-bold text-xs shadow-[0_0_15px_rgba(213,174,87,0.3)] transition-transform active:scale-95">
                    <span>Créer un compte</span>
                    <ArrowRight size={13} weight="bold" />
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Hero Section (Manus AI Vibe) ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-24 space-y-24">
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Luminous Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-medium text-white/80 shadow-inner"
          >
            <Sparkle size={14} weight="fill" className="text-[#D5AE57] animate-pulse" />
            <span>Ñkyel Global AI Fabric · 38 Fournisseurs Mondiaux · Souveraineté & Multilinguisme</span>
          </motion.div>

          {/* Grand Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
          >
            L&apos;Agent IA Généraliste <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D5AE57] via-amber-100 to-[#6F9485]">
              Universel & Souverain
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            Une architecture agnostique mondiale qui demande une <strong>capacité</strong> et non un nom commercial.
            Ñkyel choisit dynamiquement le moteur parfait parmi 38 écosystèmes pour exécuter n&apos;importe quelle mission avec précision et mémoire.
          </motion.p>

          {/* ── Interactive Manus-Style Prompt Composer ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-3xl mx-auto p-2 sm:p-3 rounded-2xl border border-white/10 bg-[#0E1118]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-3 text-left"
          >
            <div className="relative">
              <textarea
                rows={3}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Décrivez votre mission complexe à Ñkyel (code, recherche arborescente, analyse documentaire, traduction gabonaise...)"
                className="w-full p-3 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none resize-none"
              />
            </div>

            {/* Quick Sample Prompts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {SAMPLE_MISSIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptText(s)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 text-[10px] text-white/60 hover:text-white whitespace-nowrap transition-colors"
                >
                  {s.slice(0, 38)}...
                </button>
              ))}
            </div>

            {/* Capability Selector & Execution CTA */}
            <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {CAPABILITIES.map((cap) => {
                  const isSel = selectedCapability === cap.id;
                  return (
                    <button
                      key={cap.id}
                      onClick={() => setSelectedCapability(cap.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isSel
                          ? 'bg-[#D5AE57]/20 border border-[#D5AE57]/50 text-[#D5AE57]'
                          : 'bg-black/30 border border-white/5 text-white/50 hover:text-white'
                      }`}
                    >
                      {cap.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleLaunch}
                className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#D5AE57] hover:bg-[#C5A059] text-black font-extrabold text-xs transition-transform active:scale-95 shadow-[0_0_20px_rgba(213,174,87,0.4)]"
              >
                <span>Lancer la Mission</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>
          </motion.div>
        </section>

        {/* ── Live Agent Execution Simulation Showcase ── */}
        <section id="workgraph" className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#D5AE57]">
                <TreeStructure size={16} />
                <span>WORKGRAPH ARBITRATION ENGINE 2.0</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Exécution Agentique Décomposable & Vérifiable
              </h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1.5 self-start">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Routage Actif : Mistral Large + DeepSeek R1 + Gemini Pro
            </span>
          </div>

          {/* 4 Interactive Progress Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { title: '1. Planification Arborescente', desc: 'Décomposition autonome en 4 sous-objectifs et points de contrôle.', engine: 'DeepSeek R1', state: simulatedStep >= 0 ? 'completed' : 'pending' },
              { title: '2. Routage Spécialisé', desc: 'Distribution parallèle : Codestral (Code) & Pixtral (Vision).', engine: 'Mistral AI FR', state: simulatedStep >= 1 ? 'completed' : 'pending' },
              { title: '3. Exécution Sandbox E2B', desc: 'Environnement isolé, validation de types et tests unitaires.', engine: 'E2B Sandbox', state: simulatedStep >= 2 ? 'completed' : 'pending' },
              { title: '4. Compilation d’Artefacts', desc: 'Rendu temps réel dans le studio VIE Canvas avec interaction humaine.', engine: 'VIE Studio', state: simulatedStep >= 3 ? 'completed' : 'pending' },
            ].map((node, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border transition-all ${
                  simulatedStep === i
                    ? 'bg-[#D5AE57]/10 border-[#D5AE57] text-white shadow-lg'
                    : 'bg-black/30 border-white/5 text-white/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#D5AE57]">
                    {node.engine}
                  </span>
                  <CheckCircle size={16} className={simulatedStep >= i ? 'text-emerald-400' : 'text-white/20'} weight="fill" />
                </div>
                <h3 className="font-bold text-xs text-white">{node.title}</h3>
                <p className="text-[11px] text-white/50 mt-1">{node.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 38 Global Providers Matrix Showcase ── */}
        <section id="fabric" className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Le Registre Mondial des Fournisseurs
            </h2>
            <p className="text-xs sm:text-sm text-white/60">
              Ñkyel unifie 38 écosystèmes internationaux sous une interface standardisée sans aucun compromis de sécurité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GLOBAL_ECOSYSTEMS.map((eco, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.03] transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{eco.flag}</span>
                    <h3 className="font-bold text-xs text-white">{eco.region}</h3>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#D5AE57]/10 text-[#D5AE57] border border-[#D5AE57]/20">
                    {eco.badge}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {eco.providers.map((p, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-2 py-1 rounded-lg bg-black/40 border border-white/5 text-[10px] text-white/80 font-mono"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5 Core Pillars Section ── */}
        <section id="capabilities" className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Les 5 Piliers Fondamentaux de Ñkyel
            </h2>
            <p className="text-xs sm:text-sm text-white/60">
              Conçu pour l&apos;autonomie, la mémoire persistante et la protection absolue de vos données.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.01] space-y-3">
              <TreeStructure size={28} className="text-[#D5AE57]" />
              <h3 className="font-bold text-sm text-white">1. WorkGraph & Human Node</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Visualisation arborescente transparente, arbitrages humains à tout moment et retour en arrière grâce aux checkpoints d&apos;état LangGraph.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.01] space-y-3">
              <Eye size={28} className="text-[#6F9485]" />
              <h3 className="font-bold text-sm text-white">2. Visual Intelligence & VIE</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Moteur Make-It-Real avec simulation temporelle, analyse d&apos;images et rendu d&apos;applications interactives complètes en temps réel.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.01] space-y-3">
              <Database size={28} className="text-blue-400" />
              <h3 className="font-bold text-sm text-white">3. Mémoire Souveraine DeerMem</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                9 niveaux de mémoire persistante avec politiques strictes. Vous gardez le contrôle total sur ce dont Ñkyel se souvient.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.01] space-y-3">
              <Globe size={28} className="text-purple-400" />
              <h3 className="font-bold text-sm text-white">4. Langues Gabonaises & RTL</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Support BCP-47 de pointe pour le Fang, Punu, Myènè, Nzebi, Swahili, Lingala, Wolof et inversion RTL complète pour l&apos;arabe.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.01] space-y-3">
              <ShieldCheck size={28} className="text-emerald-400" />
              <h3 className="font-bold text-sm text-white">5. Sécurité de Rang Bancaire</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Authentification Clerk RS256, isolation multi-tenant Row-Level Security sur Neon PostgreSQL et zéro clé API exposée en clair.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#D5AE57]/20 bg-[#D5AE57]/5 space-y-3 flex flex-col justify-between">
              <div>
                <Sparkle size={28} className="text-[#D5AE57]" weight="fill" />
                <h3 className="font-bold text-sm text-white mt-3">Prêt à transformer vos missions ?</h3>
                <p className="text-xs text-white/70 mt-1">
                  Créez votre compte en 30 secondes et découvrez la puissance de l&apos;intelligence souveraine.
                </p>
              </div>
              <button
                onClick={handleLaunch}
                className="w-full py-2 rounded-xl bg-[#D5AE57] hover:bg-[#C5A059] text-black font-extrabold text-xs transition-transform active:scale-95"
              >
                Commencer l&apos;expérience Ñkyel
              </button>
            </div>
          </div>
        </section>

        {/* ── Sovereign Manifesto ── */}
        <section id="sovereignty" className="p-8 sm:p-12 rounded-3xl border border-[#D5AE57]/30 bg-gradient-to-b from-[#D5AE57]/10 to-transparent text-center space-y-4 max-w-4xl mx-auto">
          <div className="w-10 h-10 rounded-xl bg-[#D5AE57] text-black font-black text-lg mx-auto flex items-center justify-center">
            Ñ
          </div>
          <blockquote className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-snug max-w-3xl mx-auto">
            « L&apos;intelligence artificielle ne doit appartenir à aucun cartel. Ñkyel est le pont souverain vers l&apos;intelligence universelle pour l&apos;Afrique et le monde. »
          </blockquote>
          <p className="text-xs text-white/60 font-mono">
            SmartANDJ AI Technologies · Fondateur & Architecte en Chef : Daniel Jonathan ANDJ
          </p>
        </section>
      </main>

      {/* ── Enterprise Footer with ALL Policies ── */}
      <footer className="border-t border-white/[0.08] bg-[#030407] py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-xs">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#D5AE57] text-black flex items-center justify-center font-bold text-xs">
                Ñ
              </div>
              <span className="font-bold text-sm text-white">Ñkyel AI</span>
            </div>
            <p className="text-[11px] text-white/50 max-w-xs leading-relaxed">
              Propulsé par SmartANDJ AI Technologies. Architecture agnostique mondiale et souveraineté d&apos;intelligence artificielle.
            </p>
            <p className="text-[10px] text-white/30 font-mono">
              Libreville, Gabon · Édition Production 2026.1
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider text-[#D5AE57]">Produit</span>
            <ul className="space-y-1.5 text-white/60">
              <li><Link href="/chat" className="hover:text-white transition-colors">Conversation & Chat</Link></li>
              <li><Link href="/workspace" className="hover:text-white transition-colors">WorkGraph Studio</Link></li>
              <li><Link href="/settings" className="hover:text-white transition-colors">Paramètres Souverains</Link></li>
              <li><Link href="/onboarding" className="hover:text-white transition-colors">Onboarding</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider text-[#D5AE57]">Écosystème</span>
            <ul className="space-y-1.5 text-white/60">
              <li><span className="text-white/40">Mistral AI (FR)</span></li>
              <li><span className="text-white/40">Google Gemini</span></li>
              <li><span className="text-white/40">DeepSeek R1</span></li>
              <li><span className="text-white/40">Gaboma AI (Langues)</span></li>
              <li><span className="text-white/40">RunPod Sovereign</span></li>
            </ul>
          </div>

          <div className="space-y-2">
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

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/40 gap-4">
          <p>© 2026 SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ · Tous droits réservés.</p>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>38 Fournisseurs Connectés · Statut Opérationnel 100%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
