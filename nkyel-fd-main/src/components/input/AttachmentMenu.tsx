/**
 * Nkyel AI · AttachmentMenu
 * SmartANDJ AI Technologies
 * Responsive: Floating cascaded menu on Desktop, Bottom Sheet Modal on Mobile
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen,
  GoogleDriveLogo,
  TreeStructure,
  Robot,
  ClockCounterClockwise,
  Books,
  FileArrowUp,
  CaretRight,
  CaretLeft,
  Sparkle,
  Globe,
  Code,
  FileText,
  Presentation,
  Table,
  VideoCamera,
  Microphone,
  X,
} from '@phosphor-icons/react';

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: string) => void;
}

export default function AttachmentMenu({
  isOpen,
  onClose,
  onSelectOption,
}: AttachmentMenuProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setActiveSubmenu(null);
      return;
    }
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const capabilities = [
    { id: 'research', label: 'Ñkyel Research (Recherche web & RAG)', icon: Globe },
    { id: 'vision', label: 'Ñkyel Vision (Analyse & Création visuelle)', icon: Sparkle },
    { id: 'motion', label: 'Ñkyel Motion (Génération vidéo Veo)', icon: VideoCamera },
    { id: 'voice', label: 'Ñkyel Voice (Parole & Transcription)', icon: Microphone },
    { id: 'web', label: 'Ñkyel Web (Création de sites web)', icon: Globe },
    { id: 'code', label: 'Ñkyel Code (Agent autonome fx Zig)', icon: Code },
    { id: 'slides', label: 'Ñkyel Slides (Présentations PowerPoint)', icon: Presentation },
    { id: 'data', label: 'Ñkyel Data (Feuilles de calcul & Tableaux)', icon: Table },
    { id: 'docs', label: 'Ñkyel Documents (Rapports & PDF formels)', icon: FileText },
  ];

  const recentDocs = [
    { id: 'doc-1', name: 'analyse_discours_meres.pdf', type: 'pdf' },
    { id: 'doc-2', name: 'architecture_souveraine_nkyel.docx', type: 'doc' },
    { id: 'doc-3', name: 'cahier_des_charges_vop.pdf', type: 'pdf' },
  ];

  return (
    <>
      {/* 1. Mobile Backdrop & Bottom Sheet (< 640px) */}
      <div className="sm:hidden">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 max-h-[80vh] bg-[#10141F] border-t border-white/10 rounded-t-3xl p-4 z-50 overflow-y-auto flex flex-col space-y-2"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            {activeSubmenu ? (
              <button
                type="button"
                onClick={() => setActiveSubmenu(null)}
                className="flex items-center gap-1.5 text-xs text-[var(--accent)] font-semibold"
              >
                <CaretLeft size={16} />
                <span>Retour</span>
              </button>
            ) : (
              <span className="text-sm font-bold text-white">Ajouter à la mission</span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/70"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mobile Submenu View: Capacités */}
          {activeSubmenu === 'capacities' && (
            <div className="space-y-1 py-2">
              <div className="text-[11px] font-semibold text-[#9199A8] uppercase tracking-wider px-2 mb-2">
                Capacités d'action Ñkyel
              </div>
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <button
                    key={cap.id}
                    type="button"
                    onClick={() => { onSelectOption(cap.label); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white hover:bg-white/10 text-start text-sm"
                  >
                    <Icon size={18} className="text-[var(--accent)] shrink-0" />
                    <span className="truncate">{cap.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Mobile Submenu View: Sources */}
          {activeSubmenu === 'sources' && (
            <div className="space-y-1 py-2">
              <button
                type="button"
                onClick={() => { onSelectOption('Google Drive'); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white hover:bg-white/10 text-start text-sm"
              >
                <GoogleDriveLogo size={20} className="text-[#00D4AA]" />
                <span>Google Drive</span>
              </button>
              <button
                type="button"
                onClick={() => { onSelectOption('Mémoire Ñkyel'); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white hover:bg-white/10 text-start text-sm"
              >
                <Books size={20} className="text-[var(--accent)]" />
                <span>Mémoire Ñkyel</span>
              </button>
            </div>
          )}

          {/* Mobile Main Menu Items */}
          {!activeSubmenu && (
            <div className="space-y-1 py-1">
              <button
                type="button"
                onClick={() => setActiveSubmenu('capacities')}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-white hover:bg-white/10 text-start text-sm"
              >
                <div className="flex items-center gap-3">
                  <Robot size={18} className="text-[var(--accent)]" />
                  <span>Utiliser des capacités</span>
                </div>
                <CaretRight size={16} className="text-[#9199A8]" />
              </button>

              <button
                type="button"
                onClick={() => { onSelectOption('Plan d’exécution'); onClose(); }}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-white hover:bg-white/10 text-start text-sm"
              >
                <div className="flex items-center gap-3">
                  <TreeStructure size={18} className="text-[#6757E8]" />
                  <span>Construire un plan d'exécution</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubmenu('sources')}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-white hover:bg-white/10 text-start text-sm"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen size={18} className="text-[#9199A8]" />
                  <span>Autres sources</span>
                </div>
                <CaretRight size={16} className="text-[#9199A8]" />
              </button>

              <label className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white hover:bg-white/10 text-start text-sm cursor-pointer">
                <FileArrowUp size={18} className="text-[#9199A8]" />
                <span>Ajouter depuis les fichiers locaux</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      onSelectOption(`Fichier: ${e.target.files[0].name}`);
                      onClose();
                    }
                  }}
                />
              </label>
            </div>
          )}
        </motion.div>
      </div>

      {/* 2. Desktop Floating Menu (>= 640px) */}
      <div
        ref={menuRef}
        className="hidden sm:block absolute bottom-full start-0 mb-3 w-64 p-1.5 rounded-2xl bg-[#10141F] border border-white/10 shadow-2xl backdrop-blur-2xl z-50 text-[13px] font-medium"
        style={{
          boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 1px 1px rgba(255,255,255,0.08)',
        }}
      >
        {/* Autres sources > */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('sources')}
          onMouseLeave={() => setActiveSubmenu(null)}
        >
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#EDEAE3] hover:text-white hover:bg-white/[0.06] transition-colors text-start"
          >
            <div className="flex items-center gap-2.5">
              <FolderOpen size={16} className="text-[#9199A8]" />
              <span>Autres sources</span>
            </div>
            <CaretRight size={13} className="text-[#9199A8]" />
          </button>

          {activeSubmenu === 'sources' && (
            <div className="absolute start-full top-0 ms-1.5 w-60 p-1.5 rounded-2xl bg-[#10141F] border border-white/10 shadow-2xl backdrop-blur-2xl z-50 space-y-1">
              <button
                type="button"
                onClick={() => { onSelectOption('Google Drive'); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#EDEAE3] hover:bg-white/[0.06] text-start"
              >
                <GoogleDriveLogo size={16} className="text-[#00D4AA]" />
                <span>Google Drive</span>
              </button>
              <button
                type="button"
                onClick={() => { onSelectOption('Mémoire Ñkyel'); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#EDEAE3] hover:bg-white/[0.06] text-start"
              >
                <Books size={16} className="text-[var(--accent)]" />
                <span>Mémoire Ñkyel</span>
              </button>
            </div>
          )}
        </div>

        {/* Ajouter depuis Google Drive */}
        <button
          type="button"
          onClick={() => { onSelectOption('Google Drive'); onClose(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#EDEAE3] hover:text-white hover:bg-white/[0.06] transition-colors text-start"
        >
          <GoogleDriveLogo size={16} className="text-[#00D4AA]" />
          <span>Ajouter depuis Google Drive</span>
        </button>

        {/* Plan d'exécution (Ctrl+/) */}
        <button
          type="button"
          onClick={() => { onSelectOption('Plan d’exécution'); onClose(); }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#EDEAE3] hover:text-white hover:bg-white/[0.06] transition-colors text-start"
        >
          <div className="flex items-center gap-2.5">
            <TreeStructure size={16} className="text-[#6757E8]" />
            <span>Plan d'exécution</span>
          </div>
          <span className="text-[11px] text-[#9199A8] font-mono">Ctrl+/</span>
        </button>

        {/* Utiliser des capacités > */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('capacities')}
          onMouseLeave={() => setActiveSubmenu(null)}
        >
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#EDEAE3] hover:text-white hover:bg-white/[0.06] transition-colors text-start"
          >
            <div className="flex items-center gap-2.5">
              <Robot size={16} className="text-[var(--accent)]" />
              <span>Utiliser des capacités</span>
            </div>
            <CaretRight size={13} className="text-[#9199A8]" />
          </button>

          {activeSubmenu === 'capacities' && (
            <div className="absolute start-full top-0 ms-1.5 w-72 p-1.5 rounded-2xl bg-[#10141F] border border-white/10 shadow-2xl backdrop-blur-2xl z-50 space-y-1 max-h-80 overflow-y-auto scrollbar-thin">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#9199A8] uppercase tracking-wider">
                Capacités d'action Ñkyel
              </div>
              {capabilities.map((cap) => {
                const Icon = cap.icon;
                return (
                  <button
                    key={cap.id}
                    type="button"
                    onClick={() => { onSelectOption(cap.label); onClose(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#EDEAE3] hover:bg-white/[0.06] text-start transition-colors"
                  >
                    <Icon size={16} className="text-[var(--accent)] shrink-0" />
                    <span className="truncate">{cap.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Ajouter depuis la bibliothèque (Mémoire) */}
        <button
          type="button"
          onClick={() => { onSelectOption('Mémoire Ñkyel'); onClose(); }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#EDEAE3] hover:text-white hover:bg-white/[0.06] transition-colors text-start"
        >
          <div className="flex items-center gap-2.5">
            <Books size={16} className="text-[var(--accent)]" />
            <span>Mémoire Ñkyel</span>
          </div>
        </button>

        <div className="h-[1px] bg-white/[0.06] my-1" />

        {/* Ajouter depuis les fichiers locaux */}
        <label className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#EDEAE3] hover:text-white hover:bg-white/[0.06] transition-colors text-start cursor-pointer">
          <FileArrowUp size={16} className="text-[#9199A8]" />
          <span>Ajouter depuis les fichiers locaux</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onSelectOption(`Fichier: ${e.target.files[0].name}`);
                onClose();
              }
            }}
          />
        </label>
      </div>
    </>
  );
}
