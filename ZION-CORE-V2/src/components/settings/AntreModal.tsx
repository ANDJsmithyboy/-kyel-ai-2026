'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, CreditCard, PuzzlePiece, Moon, SpeakerHigh, ShieldCheck, Scales, Info, X } from '@phosphor-icons/react';

// Types for the settings
type TabId = 'profil' | 'pacte' | 'extensions' | 'foret' | 'echo' | 'coffre' | 'politique';

interface AntreModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabId;
}

export default function AntreModal({ isOpen, onClose, initialTab = 'profil' }: AntreModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Content for each tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profil':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium tracking-tight mb-4 flex items-center gap-2"><UserCircle weight="duotone" className="text-primary" size={24}/> Profil Citoyen</h3>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold cursor-pointer">
                JD
              </div>
              <div className="flex-1">
                <input type="text" defaultValue="Daniel Jonathan ANDJ" className="bg-transparent border-b border-white/20 px-1 py-1 w-full focus:outline-none focus:border-primary transition-colors text-lg font-medium" />
                <p className="text-sm opacity-60 mt-1">Citoyen depuis Mars 2026</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="opacity-80">Email</span>
                <div className="flex gap-4 items-center">
                  <span className="opacity-60">daniel@Ñkyel AI.com</span>
                  <button className="text-primary text-sm font-medium hover:underline">Modifier</button>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="opacity-80">Téléphone</span>
                <span className="opacity-60">+241 XX XX XX 00</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="opacity-80">Langue de Traque</span>
                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none focus:border-primary">
                  <option>Français</option>
                  <option>English</option>
                  <option>Fang</option>
                  <option>Punu</option>
                  <option>Nzebi</option>
                  <option>Omyène</option>
                </select>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="opacity-80">Rang / Force</span>
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">Black Panther</span>
              </div>
              
              <div className="pt-4">
                <button className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>
        );

      case 'pacte':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium tracking-tight mb-4 flex items-center gap-2"><CreditCard weight="duotone" className="text-primary" size={24}/> Pacte de Chasse</h3>
            <div className="p-6 bg-gradient-to-br from-primary/20 to-transparent border border-primary/30 rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-primary mb-1">Black Panther</h4>
                  <p className="text-sm opacity-80">Renouvellement le 12 Avril 2026</p>
                </div>
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold uppercase">Actif</span>
              </div>
              
              {/* Energy Gauge */}
              <div className="space-y-2 mt-6">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Jauge d'énergie</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold opacity-60 uppercase tracking-wider mb-2">Moyens de paiement</h4>
              <div className="flex justify-between items-center p-3 border border-white/10 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <img src="/airtel-money.png" alt="Airtel Money" className="w-12 h-8 object-contain rounded bg-white" />
                  <span className="font-medium">Airtel Money</span>
                </div>
                <button className="text-xs text-red-400 opacity-80 hover:opacity-100 font-medium">Retirer</button>
              </div>
              <div className="flex justify-between items-center p-3 border border-white/10 rounded-xl bg-white/5 mt-2">
                <div className="flex items-center gap-3">
                  <img src="/moov-money.png" alt="Moov Africa" className="w-12 h-8 object-contain rounded bg-white" />
                  <span className="font-medium">Moov Money</span>
                </div>
                <button className="text-xs text-red-400 opacity-80 hover:opacity-100 font-medium">Retirer</button>
              </div>
              <button className="w-full p-3 border border-dashed border-white/20 rounded-xl text-sm opacity-70 hover:opacity-100 hover:bg-white/5 transition-colors">
                + Ajouter un mode de paiement
              </button>
            </div>
          </div>
        );

      case 'extensions':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium tracking-tight mb-4 flex items-center gap-2"><PuzzlePiece weight="duotone" className="text-primary" size={24}/> Extensions de Traque</h3>
            
            {[
              { name: 'Radar Wandana', desc: 'Recherche web profonde', active: true },
              { name: 'Génération d\'images', desc: 'Création visuelle via prompt', active: true },
              { name: 'Exécution de code', desc: 'Environnement de test isolé', active: false },
              { name: 'Connecteurs Cloud', desc: 'Accès Drive / MCP', active: false, config: 'Accède à : lecture de vos fichiers Drive' }
            ].map((ext, i) => (
              <div key={i} className="flex flex-col p-4 border border-white/10 rounded-xl bg-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{ext.name}</h4>
                    <p className="text-sm opacity-60">{ext.desc}</p>
                  </div>
                  {/* Switch */}
                  <button className={`w-11 h-6 rounded-full transition-colors relative ${ext.active ? 'bg-primary' : 'bg-white/20'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${ext.active ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                {ext.config && (
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs opacity-60">{ext.config}</span>
                    <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                      Configurer
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'foret':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium tracking-tight mb-4 flex items-center gap-2"><Moon weight="duotone" className="text-primary" size={24}/> Mode de Forêt</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="opacity-80">Apparence</span>
                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none focus:border-primary">
                  <option>Système</option>
                  <option>Clair</option>
                  <option>Sombre</option>
                </select>
              </div>

              <div className="py-4 border-b border-white/5">
                <span className="block opacity-80 mb-4">Thème d'Interface</span>
                <div className="flex gap-4">
                  {/* 6 Theme Swatches */}
                  {[
                    { id: 'panther', color: '#020304', accent: '#C5A059' },
                    { id: 'amethyst', color: '#1B1425', accent: '#9D6EE2' },
                    { id: 'emerald', color: '#0A1A14', accent: '#2E8C61' },
                    { id: 'sapphire', color: '#0A141A', accent: '#2E7A8C' },
                    { id: 'ruby', color: '#1A0A0B', accent: '#8C2E35' },
                    { id: 'obsidian', color: '#000000', accent: '#FFFFFF' }
                  ].map((theme) => (
                    <button 
                      key={theme.id}
                      className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${theme.id === 'panther' ? 'border-primary scale-110 shadow-[0_0_15px_rgba(197,160,89,0.3)]' : 'border-transparent'}`}
                      style={{ backgroundColor: theme.color }}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <div>
                  <span className="block opacity-80">Noir OLED Absolu</span>
                  <span className="text-xs opacity-50">Pour économiser la batterie (Mobile)</span>
                </div>
                <button className="w-11 h-6 rounded-full bg-white/20 transition-colors relative">
                  <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'echo':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium tracking-tight mb-4 flex items-center gap-2"><SpeakerHigh weight="duotone" className="text-primary" size={24}/> Écho (Voix)</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="opacity-80">Style de voix</span>
                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none focus:border-primary">
                  <option>Masculine</option>
                  <option>Féminine</option>
                  <option>Neutre</option>
                </select>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="opacity-80">Accent</span>
                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none focus:border-primary">
                  <option>Gabonais</option>
                  <option>Standard</option>
                </select>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="opacity-80">Lecture automatique</span>
                <button className="w-11 h-6 rounded-full bg-primary transition-colors relative">
                  <span className="absolute top-1 left-6 w-4 h-4 rounded-full bg-white transition-transform" />
                </button>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <div>
                  <span className="block opacity-80">Activation mains-libres</span>
                  <span className="text-xs opacity-50">Wake-word pour le Live mode</span>
                </div>
                <button className="w-11 h-6 rounded-full bg-white/20 transition-colors relative">
                  <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform" />
                </button>
              </div>
            </div>
          </div>
        );

      case 'coffre':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium tracking-tight mb-4 flex items-center gap-2"><ShieldCheck weight="duotone" className="text-primary" size={24}/> Coffre-Fort Souverain</h3>
            
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex gap-3 items-start mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div>
                <h4 className="font-medium text-primary mb-1">Souveraineté des données</h4>
                <p className="text-sm opacity-80">Toutes vos informations sont hébergées et traitées souverainement sur des serveurs au Gabon.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <div>
                  <span className="block font-medium">Mode Ombre</span>
                  <span className="text-xs opacity-60">Vos échanges ne sont ni sauvegardés ni utilisés pour l'entraînement.</span>
                </div>
                <button className="w-11 h-6 rounded-full bg-white/20 transition-colors relative">
                  <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform" />
                </button>
              </div>

              <button className="w-full flex justify-between items-center py-3 border-b border-white/5 hover:px-2 transition-all">
                <span className="opacity-80">Changer le mot de passe</span>
                <span className="opacity-40">›</span>
              </button>

              <button className="w-full flex justify-between items-center py-3 border-b border-white/5 hover:px-2 transition-all">
                <span className="opacity-80">Authentification à deux facteurs (2FA)</span>
                <span className="opacity-40">Désactivé ›</span>
              </button>

              <button className="w-full flex justify-between items-center py-3 border-b border-white/5 hover:px-2 transition-all">
                <span className="opacity-80">Appareils connectés</span>
                <span className="opacity-40">2 appareils ›</span>
              </button>
              
              <button className="w-full flex justify-between items-center py-3 border-b border-white/5 hover:px-2 transition-all">
                <span className="opacity-80">Exporter mes données</span>
                <span className="opacity-40">JSON/PDF ›</span>
              </button>
            </div>
          </div>
        );

      case 'politique':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium tracking-tight mb-4 flex items-center gap-2"><Scales weight="duotone" className="text-primary" size={24}/> Pacte Politique</h3>
            
            <div className="space-y-4">
              <button className="w-full flex justify-between items-center py-3 border-b border-white/5 hover:px-2 transition-all">
                <span className="opacity-80">Conditions d'utilisation</span>
                <span className="text-xs opacity-40">v2.1 (Mars 2026) ›</span>
              </button>

              <button className="w-full flex justify-between items-center py-3 border-b border-white/5 hover:px-2 transition-all">
                <span className="opacity-80">Politique de confidentialité</span>
                <span className="text-xs opacity-40">v1.4 (Fév 2026) ›</span>
              </button>

              <button className="w-full flex justify-between items-center py-3 border-b border-white/5 hover:px-2 transition-all">
                <span className="opacity-80">Politique d'utilisation acceptable</span>
                <span className="text-xs opacity-40">›</span>
              </button>

              <div className="py-4">
                <p className="text-sm opacity-60 mb-2">Statut de consentement : <span className="text-primary font-medium">Accepté le 12 Mars 2026</span></p>
                <button className="text-xs font-medium opacity-80 hover:underline">Gérer les préférences de cookies</button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="relative w-[900px] h-[600px] max-w-[95vw] max-h-[90vh] bg-[#0c0c0c] border border-white/10 shadow-2xl rounded-2xl flex overflow-hidden flex-col md:flex-row"
          >
            {/* Header (Mobile) or Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-14 border-b border-white/5 flex items-center justify-between px-4 md:hidden">
              <span className="font-semibold tracking-wide">L'Antre</span>
              <button onClick={onClose} className="p-2 opacity-70 hover:opacity-100"><X size={20}/></button>
            </div>

            {/* Left Sidebar */}
            <div className="w-full md:w-64 bg-white/[0.02] border-r border-white/5 hidden md:flex flex-col">
              <div className="p-6">
                <h2 className="text-xl font-semibold tracking-tight">L'Antre</h2>
              </div>
              <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                <button onClick={() => setActiveTab('profil')} className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profil' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}><UserCircle size={18} weight={activeTab === 'profil' ? 'fill' : 'regular'}/> Profil Citoyen</button>
                <button onClick={() => setActiveTab('pacte')} className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pacte' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}><CreditCard size={18} weight={activeTab === 'pacte' ? 'fill' : 'regular'}/> Pacte de Chasse</button>
                <button onClick={() => setActiveTab('extensions')} className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'extensions' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}><PuzzlePiece size={18} weight={activeTab === 'extensions' ? 'fill' : 'regular'}/> Extensions de Traque</button>
                <button onClick={() => setActiveTab('foret')} className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'foret' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}><Moon size={18} weight={activeTab === 'foret' ? 'fill' : 'regular'}/> Mode de Forêt</button>
                <button onClick={() => setActiveTab('echo')} className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'echo' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}><SpeakerHigh size={18} weight={activeTab === 'echo' ? 'fill' : 'regular'}/> Écho</button>
                <button onClick={() => setActiveTab('coffre')} className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'coffre' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}><ShieldCheck size={18} weight={activeTab === 'coffre' ? 'fill' : 'regular'}/> Coffre-Fort Souverain</button>
                <button onClick={() => setActiveTab('politique')} className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'politique' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}><Scales size={18} weight={activeTab === 'politique' ? 'fill' : 'regular'}/> Pacte Politique</button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col pt-14 md:pt-0">
              {/* Top right actions (Close / Info) */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => setShowDiagnostics(true)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white/70"
                  aria-label="Informations système"
                >
                  <Info size={16} />
                </button>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 hidden md:flex items-center justify-center transition-colors text-white/70"
                  aria-label="Fermer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Form Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-xl">
                  {renderTabContent()}
                </div>
              </div>
            </div>

            {/* Confidentiality-Safe System Info Modal */}
            <AnimatePresence>
              {showDiagnostics && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-16 right-4 w-72 bg-[#1A1A1A] border border-white/10 shadow-2xl rounded-xl p-4 z-50"
                >
                  <h4 className="text-sm font-semibold mb-3">Statut Système</h4>
                  <div className="space-y-2 text-xs opacity-80">
                    <p className="flex justify-between">
                      <span>Version:</span>
                      <span className="font-mono">Ñkyel AI - Build 1.0.0-Ñkyel</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Nœud:</span>
                      <span className="font-mono text-primary">Libreville-S-01</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Statut réseau:</span>
                      <span className="text-green-400">Optimal • 14ms</span>
                    </p>
                  </div>
                  <button onClick={() => setShowDiagnostics(false)} className="mt-4 w-full py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs">Fermer</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
