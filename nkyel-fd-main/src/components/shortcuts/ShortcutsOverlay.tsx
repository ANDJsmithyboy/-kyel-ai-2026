'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsOverlay({ isOpen, onClose }: ShortcutsOverlayProps) {
  // Determine if Mac or PC for the modifier key display
  const isMac = typeof window !== 'undefined' ? navigator.userAgent.includes('Mac') : false;
  const mod = isMac ? '⌘' : 'Ctrl';

  const categories = [
    {
      title: 'Global',
      shortcuts: [
        { action: 'Nouvelle Piste', keys: [mod, 'Shift', 'N'] },
        { action: 'Sélecteur Rapide (Quick Switch)', keys: [mod, 'K'] },
        { action: 'Basculer la Sidebar', keys: [mod, 'B'] },
        { action: 'Recherche Globale', keys: [mod, 'Shift', 'F'] },
        { action: "Ouvrir L'Antre (Paramètres)", keys: [mod, ','] },
        { action: 'Aide & Raccourcis', keys: [mod, '/'] },
      ]
    },
    {
      title: 'Modèles & Entrées',
      shortcuts: [
        { action: 'Focus Saisie', keys: ['/'] },
        { action: 'Changer de modèle (1-5)', keys: [mod, '1-5'] },
        { action: 'Activer/Désactiver le Micro', keys: [mod, 'Shift', 'M'] },
        { action: 'Live Voice Mode', keys: [mod, 'Shift', 'V'] },
      ]
    },
    {
      title: 'Conversation',
      shortcuts: [
        { action: 'Envoyer le message', keys: ['Enter'] },
        { action: 'Saut de ligne', keys: ['Shift', 'Enter'] },
        { action: 'Forcer l\'envoi (bypass IME)', keys: [mod, 'Enter'] },
        { action: 'Arrêter la génération', keys: ['Esc'] },
        { action: 'Éditer le dernier message', keys: ['↑'] },
        { action: 'Copier le code', keys: [mod, 'Shift', 'C'] },
        { action: 'Étendre Le Rendu', keys: [mod, 'Shift', 'E'] },
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-3xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Raccourcis Clavier</h2>
              <button onClick={onClose} className="p-2 opacity-60 hover:opacity-100 rounded-lg hover:bg-white/5 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, idx) => (
                <div key={idx}>
                  <h3 className="text-sm font-semibold opacity-50 uppercase tracking-wider mb-4">{category.title}</h3>
                  <div className="space-y-3">
                    {category.shortcuts.map((shortcut, sIdx) => (
                      <div key={sIdx} className="flex justify-between items-center gap-4">
                        <span className="text-sm opacity-80">{shortcut.action}</span>
                        <div className="flex gap-1 shrink-0">
                          {shortcut.keys.map((key, kIdx) => (
                            <kbd key={kIdx} className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono min-w-[24px] text-center">
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
