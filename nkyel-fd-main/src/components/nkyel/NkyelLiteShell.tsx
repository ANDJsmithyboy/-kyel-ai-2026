'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Search, ChevronDown, Sun, Moon, Monitor, Bell, Volume2, Send, Cookie,
  Plus, Check, Mic, ArrowUp, MonitorSmartphone, FileText, Code, FileSpreadsheet,
  Globe, CheckCircle2, Circle, Loader2, X, ChevronRight, Menu, Sparkles, Download
} from 'lucide-react';

// --- Types ---
type ViewState = 'home' | 'mission' | 'connectors' | 'settings';

// --- Icons / Logos SVGs ---
const LogoGoogleDrive = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.3333 16.5L8.66667 16.5L5.33333 10.7222L8.66667 4.94444L15.3333 4.94444L18.6667 10.7222L15.3333 16.5Z" fill="#1DA462"/>
    <path d="M8.66667 16.5L12 22.2778L18.6667 10.7222L15.3333 4.94444L8.66667 16.5Z" fill="#FFC107"/>
    <path d="M5.33333 10.7222L2 16.5L8.66667 16.5L15.3333 4.94444L12 -0.833333L5.33333 10.7222Z" fill="#4285F4"/>
  </svg>
);

const LogoGithub = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.839 21.49C9.339 21.58 9.52 21.27 9.52 21.012C9.52 20.782 9.51 20.141 9.505 19.282C6.728 19.884 6.142 17.94 6.142 17.94C5.687 16.786 5.031 16.48 5.031 16.48C4.123 15.86 5.1 15.872 5.1 15.872C6.105 15.943 6.633 16.903 6.633 16.903C7.525 18.431 8.973 17.989 9.54 17.734C9.63 17.086 9.89 16.645 10.178 16.395C7.962 16.143 5.632 15.286 5.632 11.477C5.632 10.392 6.019 9.503 6.647 8.812C6.545 8.56 6.208 7.545 6.744 6.155C6.744 6.155 7.571 5.89 9.493 7.191C10.278 6.973 11.127 6.864 11.97 6.86C12.813 6.864 13.662 6.973 14.448 7.191C16.368 5.89 17.194 6.155 17.194 6.155C17.731 7.545 17.394 8.56 17.293 8.812C17.923 9.503 18.307 10.392 18.307 11.477C18.307 15.297 15.975 16.14 13.754 16.386C14.116 16.698 14.441 17.311 14.441 18.257C14.441 19.613 14.429 20.707 14.429 21.012C14.429 21.273 14.608 21.587 15.114 21.488C19.085 20.163 21.947 16.417 21.947 12C21.947 6.477 17.47 2 11.947 2H12Z"/>
  </svg>
);

const LogoQdrant = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 11L16 13.5V18.5" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 11L8 13.5V18.5" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 11V6" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const LogoGroq = () => (
  <div className="text-[#F97316] font-bold text-xl tracking-tighter">groq</div>
);

const LogoSlack = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="9" width="4" height="10" rx="2" fill="#E01E5A"/>
    <rect x="9" y="5" width="4" height="10" rx="2" fill="#36C5F0"/>
    <rect x="15" y="5" width="4" height="10" rx="2" fill="#2EB67D"/>
    <rect x="11" y="9" width="10" height="4" rx="2" fill="#ECB22E"/>
  </svg>
);

// --- Components ---

const TopBar = ({ title, currentView, setView }: { title: string, currentView: ViewState, setView: (v: ViewState) => void }) => (
  <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-50 bg-[#05070E]/80 backdrop-blur-md">
    <div className="flex items-center gap-3">
      <button onClick={() => setView('home')} className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors">
        <Menu size={20} className="text-slate-300" />
      </button>
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('connectors')}>
        <span className="font-sans font-medium text-[15px]">{title}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button onClick={() => setView('settings')} className="p-2 rounded-xl border border-white/10 bg-[#0E1322] hover:bg-white/5 transition-colors">
        <Sparkles size={18} className="text-[#A855F7]" />
      </button>
    </div>
  </header>
);

// --- 1. Settings View ---
const SettingsView = () => {
  const [activeTab, setActiveTab] = useState('Général');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
      className="p-4 h-full overflow-y-auto pb-20"
    >
      <div className="bg-[#0E1322]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.05)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold">Paramètres</h2>
          <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full border border-[#A855F7] flex items-center justify-center p-1">
               <svg viewBox="0 0 24 24" className="w-10 h-10 fill-none stroke-white stroke-[1.5]">
                 <path d="M4 12c0-4.418 3.582-8 8-8s8 3.582 8 8" strokeLinecap="round"/>
                 <path d="M12 12c-2.21 0-4-1.79-4-4" strokeLinecap="round"/>
                 <path d="M15 15c-1.5 1.5-3 1.5-4.5 1.5" strokeLinecap="round"/>
               </svg>
               <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#A855F7] border-2 border-[#0E1322]"></div>
            </div>
            <div>
              <div className="font-sans font-semibold text-[17px]">Ñkyel AI Hub</div>
              <div className="text-slate-400 text-sm">espace de travail</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-[#A855F7]/20 text-[#A855F7] px-2 py-0.5 rounded-full">gratuit • 1 membre</span>
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-500 group-hover:text-slate-300" />
        </div>

        {/* Search */}
        <div className="relative mt-6 mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="rechercher dans les paramètres" 
            className="w-full bg-[#05070E] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#A855F7]/50 focus:ring-1 focus:ring-[#A855F7]/50 transition-all placeholder:text-slate-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-white/10 mb-6 overflow-x-auto no-scrollbar">
          {['Général', 'Compte', 'Utilisation et facturation'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 mr-6 text-[15px] font-medium whitespace-nowrap relative ${activeTab === tab ? 'text-white' : 'text-slate-400 hover:text-slate-300'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="settings-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A855F7]" />
              )}
            </button>
          ))}
          <div className="flex-1"></div>
          <button className="pb-3 text-slate-400"><Menu size={18}/></button>
        </div>

        {/* Appearance Section */}
        <div className="mb-8">
          <h3 className="font-sans font-semibold text-[17px] mb-4">Apparence</h3>
          
          <div className="mb-4">
            <label className="text-sm text-slate-400 block mb-2">Langue</label>
            <div className="relative">
              <select className="w-full appearance-none bg-[#05070E] border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#A855F7]/50">
                <option>Français</option>
                <option>English</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-2">Thème</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Clair', icon: Sun },
                { id: 'dark', label: 'Sombre', icon: Moon },
                { id: 'auto', label: 'Auto', icon: Monitor },
              ].map(theme => (
                <motion.button 
                  whileTap={{ scale: 0.96 }}
                  key={theme.id}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border ${theme.id === 'auto' ? 'border-[#A855F7] bg-[#A855F7]/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-white/10 bg-[#05070E] hover:bg-white/5'}`}
                >
                  <theme.icon size={22} className={`mb-2 ${theme.id === 'auto' ? 'text-white' : 'text-slate-400'}`} />
                  <span className={`text-sm ${theme.id === 'auto' ? 'text-white font-medium' : 'text-slate-400'}`}>{theme.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Communication Preferences */}
        <div>
          <h3 className="font-sans font-semibold text-[17px] mb-4">Préférences de communication</h3>
          
          <div className="bg-[#05070E] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
            {[
              { icon: Bell, title: 'notifications du navigateur', desc: 'recevez des notifications dans votre navigateur', active: true },
              { icon: Volume2, title: 'alerte sonore', desc: 'jouez un son pour les notifications et les alertes', active: true },
              { icon: Send, title: 'recevez les mises à jour du produit', desc: 'soyez informé des nouvelles fonctionnalités', active: true },
            ].map((pref, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex gap-4">
                  <pref.icon size={20} className="text-[#A855F7] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[15px] font-medium">{pref.title}</div>
                    <div className="text-[13px] text-slate-400 mt-0.5">{pref.desc}</div>
                  </div>
                </div>
                {/* Toggle */}
                <div className={`w-11 h-6 rounded-full p-1 transition-colors ${pref.active ? 'bg-[#6366F1]' : 'bg-white/10'}`}>
                  <motion.div 
                    layout 
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                    initial={false}
                    animate={{ x: pref.active ? 20 : 0 }}
                  />
                </div>
              </div>
            ))}
            
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex gap-4 items-center">
                <Cookie size={20} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-[15px] font-medium">gestion des cookies</div>
                  <div className="text-[13px] text-slate-400 mt-0.5">gérez vos préférences de cookies</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-500" />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

// --- 2. Connectors View ---
const ConnectorsView = () => {
  const [activeTab, setActiveTab] = useState('Applications');

  const connectors = [
    { name: 'Google Drive', desc: 'Stockage et collaboration de fichiers', icon: LogoGoogleDrive, status: 'connected' },
    { name: 'OneDrive', desc: 'Stockage cloud Microsoft', icon: () => <div className="text-[#0078D4] font-bold text-xl">O</div>, status: 'none' },
    { name: 'GitHub', desc: 'Code, repositories et workflows', icon: LogoGithub, status: 'connected' },
    { name: 'Tavily', desc: 'Recherche web augmentée par IA', icon: () => <div className="text-[#F43F5E] font-bold">T</div>, status: 'none' },
    { name: 'Qdrant', desc: 'Base vectorielle ultra-rapide', icon: LogoQdrant, status: 'connected' },
    { name: 'Neon', desc: 'Base de données Postgres serverless', icon: () => <div className="text-[#00E599] font-bold text-xl">N</div>, status: 'config' },
    { name: 'Clerk', desc: 'Authentification et gestion des utilisateurs', icon: () => <div className="text-white font-bold text-xl">C</div>, status: 'connected' },
    { name: 'RunPod', desc: 'GPU cloud pour l\'IA & le ML', icon: () => <div className="text-[#6D28D9] font-bold text-xl">R</div>, status: 'none' },
    { name: 'Groq', desc: 'Inférence ultra-rapide pour LLMs', icon: LogoGroq, status: 'connected' },
    { name: 'Gemini', desc: 'Modèles multimodaux de Google', icon: () => <div className="text-[#3B82F6] font-bold text-2xl">✦</div>, status: 'none' },
    { name: 'Slack', desc: 'Messagerie et notifications', icon: LogoSlack, status: 'connected' },
    { name: 'Notion', desc: 'Docs, wikis et gestion de connaissances', icon: () => <div className="bg-white text-black w-6 h-6 rounded text-center font-bold">N</div>, status: 'connected' },
    { name: 'Figma', desc: 'Design collaboratif et assets', icon: () => <div className="text-[#F24E1E] font-bold">F</div>, status: 'none' },
    { name: 'API sur mesure', desc: 'Connectez votre propre API REST ou GraphQL', icon: () => <Code className="text-[#F59E0B]" />, status: 'config' },
    { name: 'MCP privé', desc: 'Proxy vers votre serveur MCP personnalisé', icon: () => <div className="text-[#A855F7] font-bold text-xl">M</div>, status: 'config' },
    { name: 'Webhook', desc: 'Recevez des événements en temps réel', icon: () => <div className="text-slate-300 font-bold text-xl">W</div>, status: 'none' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-4 h-full flex flex-col"
    >
      <h1 className="font-serif text-[32px] font-medium leading-tight mb-1">Connecteurs</h1>
      <p className="text-slate-400 text-[15px] mb-6">Connectez ñkyel à vos outils et données en quelques clics.</p>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Rechercher un connecteur..." 
          className="w-full bg-[#05070E] border border-white/10 rounded-2xl py-3.5 pl-10 pr-4 text-[15px] focus:outline-none focus:border-[#A855F7]/50 focus:ring-1 focus:ring-[#A855F7]/50 transition-all placeholder:text-slate-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-[#05070E] border border-white/5 rounded-xl mb-6">
        {['Applications', 'APIs & services', 'Passerelles', 'MCP & serveurs'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-[13px] font-medium py-2 rounded-lg transition-all ${activeTab === tab ? 'bg-[#0E1322] text-[#A855F7] border border-[#A855F7]/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'text-slate-400 hover:text-slate-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <div className="grid grid-cols-2 gap-3">
          {connectors.map((c, i) => (
            <motion.div 
              whileTap={{ scale: 0.98 }}
              key={i} 
              className={`p-3 rounded-2xl border ${c.status === 'connected' ? 'bg-[#0E1322]/80 border-[#10B981]/20' : 'bg-[#0E1322]/40 border-white/5'} backdrop-blur-md flex flex-col justify-between min-h-[120px] cursor-pointer hover:border-white/10 transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#05070E] border border-white/5 flex items-center justify-center shrink-0">
                  <c.icon />
                </div>
                {c.status === 'connected' && (
                  <div className="w-8 h-8 rounded-full border border-[#10B981] flex items-center justify-center text-[#10B981] bg-[#10B981]/10">
                    <Check size={16} />
                  </div>
                )}
                {c.status !== 'connected' && (
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-300 bg-white/5">
                    <Plus size={16} />
                  </div>
                )}
              </div>
              
              <div className="mt-3">
                <div className="font-semibold text-[15px] mb-0.5">{c.name}</div>
                <div className="text-[12px] text-slate-400 leading-tight mb-2 line-clamp-2">{c.desc}</div>
                
                <div className="flex items-center gap-1.5">
                  {c.status === 'connected' && <><div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div><span className="text-[11px] text-[#10B981]">connecté</span></>}
                  {c.status === 'config' && <><div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div><span className="text-[11px] text-[#F59E0B]">à configurer</span></>}
                  {c.status === 'none' && <><div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div><span className="text-[11px] text-slate-500">non lié</span></>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer bar */}
      <div className="fixed bottom-4 left-4 right-4 bg-[#0E1322]/90 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2 text-[13px] text-slate-400">
          <div className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center"><ChevronDown size={10}/></div>
          14 connecteurs disponibles
        </div>
        <div className="flex items-center gap-1.5 text-[13px] text-[#10B981] font-medium">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
          3 connectés
        </div>
      </div>
    </motion.div>
  );
};

// --- 3. Home View ---
const HomeView = ({ setView }: { setView: (v: ViewState) => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-4 h-full flex flex-col"
    >
      <div className="flex-1 flex flex-col justify-center pb-20">
        <h1 className="font-serif text-[44px] leading-[1.1] mb-8 font-medium">que puis-je faire<br/>pour vous ?</h1>
        
        {/* Main Input Area */}
        <div className="bg-[#0E1322]/60 backdrop-blur-xl border border-[#A855F7]/30 rounded-3xl p-4 shadow-[0_0_30px_rgba(168,85,247,0.1)] mb-4">
          <textarea 
            rows={3}
            placeholder="assignez une mission ou tapez / pour plus"
            className="w-full bg-transparent border-0 resize-none text-[17px] focus:outline-none focus:ring-0 placeholder:text-slate-500 text-white mb-4"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.button whileTap={{ scale: 0.9 }} className="w-11 h-11 rounded-full border-2 border-[#6366F1] flex items-center justify-center bg-[#6366F1]/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Plus size={22} />
              </motion.button>
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/5 transition-colors">
                <Code size={18} />
              </button>
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/5 transition-colors">
                <MonitorSmartphone size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/5 transition-colors">
                <Mic size={18} />
              </button>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setView('mission')}
                className="w-11 h-11 rounded-full bg-[#6366F1] flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              >
                <ArrowUp size={22} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { icon: Monitor, label: 'créer des diapositives' },
            { icon: Globe, label: 'créer un site web' },
            { icon: Sparkles, label: 'conception' },
            { icon: MonitorSmartphone, label: 'créer des jeux' },
            { icon: Plus, label: 'plus' },
          ].map((chip, i) => (
            <button key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-[#0E1322]/50 hover:bg-white/5 transition-colors text-[14px]">
              <chip.icon size={16} className="text-[#A855F7]" />
              {chip.label}
            </button>
          ))}
        </div>

        {/* Promo Card */}
        <div className="bg-gradient-to-br from-[#0E1322] to-[#0A0D18] border border-white/10 rounded-3xl p-5 relative overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.15)] group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-[#A855F7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 w-[60%]">
            <h3 className="font-serif text-[22px] leading-tight mb-2">téléchargez ñkyel pour windows ou macos</h3>
            <p className="text-slate-400 text-[13px] mb-4">plus rapide, plus puissant, hors ligne</p>
            <div className="flex items-center gap-2 text-[#A855F7] text-[14px] font-medium">
              télécharger maintenant <ArrowUp size={16} className="rotate-45" />
            </div>
          </div>
          
          {/* Faux laptop graphic */}
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-[160px] h-[100px] bg-[#1A1F35] rounded-t-lg border-t border-l border-r border-white/20 shadow-2xl flex flex-col">
            <div className="flex-1 bg-[#05070E] m-1 rounded-sm border border-white/5 relative overflow-hidden">
               {/* Abstract panther shape */}
               <svg viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 stroke-white/50 fill-none stroke-[0.5]">
                 <path d="M30 40 Q40 20 60 30 T70 50 Q75 60 65 70 T40 60 Z"/>
               </svg>
            </div>
            <div className="h-2 bg-[#2A2F45] rounded-b-lg border-b border-l border-r border-white/20"></div>
          </div>
          
          <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center shadow-lg border border-[#A855F7]/30 z-20">
            <Download size={18} className="text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- 4. Mission View ---
const MissionView = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {/* User Prompt */}
        <div className="flex justify-end mb-6">
          <div className="bg-[#0E1322] border border-white/5 rounded-2xl rounded-tr-sm p-4 max-w-[85%] text-[15px] leading-relaxed text-slate-200">
            Prépare un plan de lancement pour mon SaaS de facturation B2B. Inclue le positionnement, la stratégie go-to-market et un plan de contenu sur 90 jours.
            <div className="flex justify-end items-center gap-1 mt-2 text-[11px] text-[#A855F7]">
              09:42 <Check size={14} />
            </div>
          </div>
        </div>

        {/* AI Response Header */}
        <div className="flex gap-3 mb-4">
          <div className="relative w-10 h-10 rounded-full border border-[#A855F7] flex items-center justify-center shrink-0">
             <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-white stroke-[1.5]">
               <path d="M4 12c0-4.418 3.582-8 8-8s8 3.582 8 8" strokeLinecap="round"/>
             </svg>
             <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#A855F7] border-2 border-[#05070E]"></div>
          </div>
          <div>
            <div className="text-[15px] leading-relaxed">
              Parfait. Je vais structurer un plan complet et actionnable.<br/>
              Voici l'avancement en temps réel 👇
            </div>
            <div className="text-[12px] text-slate-500 mt-1">09:42</div>
          </div>
        </div>

        {/* Dynamic Task List */}
        <div className="space-y-2 mb-6">
          {/* Completed */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E1322]/50 border border-white/5">
            <div className="flex items-center gap-4">
              <Search size={20} className="text-slate-400" />
              <div>
                <div className="text-[15px] font-medium">Analyse</div>
                <div className="text-[13px] text-slate-500">Compréhension du produit, du marché et des concurrents</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">✓ terminé</span>
              <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E1322]/50 border border-white/5">
            <div className="flex items-center gap-4">
              <FileText size={20} className="text-slate-400" />
              <div>
                <div className="text-[15px] font-medium">Plan</div>
                <div className="text-[13px] text-slate-500">Définition du positioning, ICP et messages clés</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">✓ terminé</span>
              <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
            </div>
          </div>

          {/* In Progress */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E1322] border border-[#A855F7]/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <div className="flex items-center gap-4">
              <Globe size={20} className="text-[#A855F7]" />
              <div>
                <div className="text-[15px] font-medium text-white">Recherche</div>
                <div className="text-[13px] text-slate-400">Veille marché, canaux, exemples & benchmarks</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#A855F7] bg-[#A855F7]/10 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#A855F7] animate-ping"></span> en cours
              </span>
              <div className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse"></div>
            </div>
          </div>

          {/* Pending */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-transparent">
            <div className="flex items-center gap-4 opacity-50">
              <Sparkles size={20} className="text-slate-400" />
              <div>
                <div className="text-[15px] font-medium">Exécution</div>
                <div className="text-[13px] text-slate-500">Rédaction du plan, calendrier 90 jours et livrables</div>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-50">
              <span className="text-[12px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">• à venir</span>
              <div className="w-2 h-2 rounded-full border border-slate-500"></div>
            </div>
          </div>
        </div>

        {/* Deliverables */}
        <div className="mb-8">
          <h4 className="text-[15px] font-medium mb-3">Livrables en préparation</h4>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {[
              { type: 'PDF', icon: FileText, color: 'text-red-400', label: 'Plan de lancement complet' },
              { type: 'DOCX', icon: FileText, color: 'text-blue-400', label: 'Stratégie Go-to-Market' },
              { type: 'PPTX', icon: Monitor, color: 'text-orange-400', label: 'Plan de contenu 90 jours' },
              { type: 'XLSX', icon: FileSpreadsheet, color: 'text-green-400', label: 'Plan d\'actions & KPIs' },
              { type: 'Site web', icon: Globe, color: 'text-purple-400', label: 'Résumé interactif' },
            ].map((doc, i) => (
              <div key={i} className="flex flex-col p-2.5 rounded-xl border border-white/5 bg-[#0E1322]/30 min-w-[100px] shrink-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className={`p-1 rounded bg-white/5 ${doc.color}`}><doc.icon size={14}/></div>
                  <span className="text-[11px] font-semibold">{doc.label}</span>
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-medium">{doc.type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h4 className="text-[15px] font-medium mb-4">Étapes</h4>
          <div className="relative pl-3 space-y-4">
            <div className="absolute left-3.5 top-2 bottom-2 w-px bg-white/10"></div>
            
            {[
              { label: 'Analyse du produit et du marché', time: '09:42', status: 'done' },
              { label: 'Analyse concurrentielle & positionnement', time: '09:43', status: 'done' },
              { label: 'Définition ICP, messages clés, promesse', time: '09:44', status: 'done' },
              { label: 'Recherche canaux d\'acquisition & benchmarks', time: '09:45', status: 'active' },
              { label: 'Rédaction du plan & calendrier 90 jours', time: '—', status: 'pending' },
              { label: 'Création des livrables & synthèse', time: '—', status: 'pending' },
            ].map((step, i) => (
              <div key={i} className="relative flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-4">
                  <div className={`relative z-10 w-2 h-2 rounded-full border-2 ${step.status === 'done' ? 'bg-[#05070E] border-slate-500' : step.status === 'active' ? 'bg-[#05070E] border-[#A855F7] shadow-[0_0_8px_#A855F7]' : 'bg-[#05070E] border-slate-700'}`}></div>
                  <span className={step.status === 'active' ? 'text-white font-medium' : step.status === 'done' ? 'text-slate-400' : 'text-slate-600'}>{step.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{step.time}</span>
                  {step.status === 'done' && <CheckCircle2 size={14} className="text-[#10B981]" />}
                  {step.status === 'active' && <Loader2 size={14} className="text-[#A855F7] animate-spin" />}
                  {step.status === 'pending' && <Circle size={14} className="text-slate-700" />}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2 mt-4 text-[12px] text-slate-400 pl-8">
            <Monitor size={14} />
            Temps estimé restant : <span className="text-[#A855F7]">~3-5 min</span>
          </div>
        </div>

      </div>

      {/* Footer Input */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#05070E] via-[#05070E] to-transparent pt-10">
        <div className="bg-[#0E1322]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-3 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 w-full">
             <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full border-2 border-[#6366F1] flex items-center justify-center bg-[#6366F1]/10 text-[#6366F1] shrink-0">
               <Plus size={20} />
             </motion.button>
             <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/5 transition-colors shrink-0">
               <Code size={18} />
             </button>
             <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/5 transition-colors shrink-0">
               <MonitorSmartphone size={18} />
             </button>
             
             <input 
                type="text" 
                placeholder="Posez une question ou donnez une instruction..."
                className="flex-1 bg-transparent border-0 text-[15px] focus:outline-none focus:ring-0 placeholder:text-slate-500 text-white min-w-0 px-2"
             />
             
             <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/5 transition-colors shrink-0">
               <Mic size={18} />
             </button>
             <motion.button 
               whileTap={{ scale: 0.9 }}
               className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
             >
               <ArrowUp size={20} />
             </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


// --- Main App Shell ---
export default function NkyelLiteShell() {
  const [currentView, setCurrentView] = useState<ViewState>('home');

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#05070E] text-slate-100 font-sans relative overflow-hidden flex flex-col shadow-2xl border-x border-white/5">
      
      {/* Dynamic TopBar */}
      <TopBar 
        title={currentView === 'home' ? 'ñkyel 1.0 lite' : currentView === 'connectors' ? 'Connecteurs' : currentView === 'settings' ? 'Paramètres' : 'ñkyel 1.0 lite'} 
        currentView={currentView}
        setView={setCurrentView}
      />

      {/* View Router with AnimatePresence */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === 'home' && <HomeView key="home" setView={setCurrentView} />}
          {currentView === 'mission' && <MissionView key="mission" />}
          {currentView === 'connectors' && <ConnectorsView key="connectors" />}
          {currentView === 'settings' && <SettingsView key="settings" />}
        </AnimatePresence>
      </div>

    </div>
  );
}
