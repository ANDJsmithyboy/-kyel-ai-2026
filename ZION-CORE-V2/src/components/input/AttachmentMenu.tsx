/**
 * Nkyel AI · AttachmentMenu
 * SmartANDJ AI Technologies
 * Multi-level flyout menu matching Manus screenshot: Sources, Google Drive, Plan, Capacités, Mémoire, Fichiers locaux
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FolderOpen,
  GoogleDriveLogo,
  TreeStructure,
  Robot,
  ClockCounterClockwise,
  Books,
  FileArrowUp,
  CaretRight,
  Sparkle,
  Globe,
  Code,
  FileText,
  Presentation,
  Table,
  VideoCamera,
  Microphone,
  Check,
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
    <div
      ref={menuRef}
      className="absolute bottom-full left-0 mb-3 w-64 p-1.5 rounded-2xl bg-[#10141F] border border-white/10 shadow-2xl backdrop-blur-2xl z-50 text-[13px] font-medium"
      style={{
        boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 1px 1px rgba(255,255,255,0.08)',
      }}
    >
      {/* 1. Autres sources > */}
      <div
        className="relative"
        onMouseEnter={() => setActiveSubmenu('sources')}
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        <button
          type="button"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#EDEAE3] hover:text-white hover:bg-white/[0.06] transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <FolderOpen size={16} className="text-[#9199A8]" />
            <span>Autres sources</span>
          </div>
          <CaretRight size={13} className="text-[#9199A8]" />
        </button>

        {activeSubmenu === 'sources' && (
          <div className="absolute left-full top-0 ml-1.5 w-60 p-1.5 rounded-2xl bg-[#10141F] border border-white/10 shadow-2xl backdrop-blur-2xl z-50 space-y-1">
            <button
              type="button"
              onClick={() => { onSelectOption('Google Drive'); onClose(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#EDEAE3] hover:bg-white/[0.06] text-left"
            >
              <GoogleDriveLogo size={16} className="text-[#00D4AA]" />
              <span>Google Drive</span>
            </button>
            <button
              type="button"
              onClick={() => { onSelectOption('Mémoire Ñkyel'); onClose(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#EDEAE3] hover:bg-white/[0.06] text-left"
            >
              <Books size={16} className="text-[#D5AE57]" />
              <span>Mémoire Ñkyel</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Ajouter depuis Google Drive */}
      <button
        type="button"
        onClick={() => { onSelectOption('Google Drive'); onClose(); }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#EDEAE3] hover:text-white hover:bg-white/[0.06] transition-colors text-left"
      >
        <GoogleDriveLogo size={16} className="text-[#00D4AA]" />
        <span>Ajouter depuis Google Drive</span>
      </button>

      {/* 3. Plan d'exécution (Ctrl+/) */}
      <button
        type="button"
        onClick={() => { onSelectOption('Plan d’exécution'); onClose(); }}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#EDEAE3] hover:text-white hover:bg-white/[0.06] transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <TreeStructure size={16} className="text-[#6757E8]" />
          <span>Plan d'exécution</span>
        </div>
        <span className="text-[11px] text-[#9199A8] font-mono">Ctrl+/</span>
      </button>

      {/* 4. Utiliser des capacités > */}
      <div
        className="relative"
        onMouseEnter={() => setActiveSubmenu('capacities')}
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        <button
          type="button"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#EDEAE3] hover:text-white hover:bg-white/[0.06] transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <Robot size={16} className="text-[#D5AE57]" />
            <span>Utiliser des capacités</span>
          </div>
          <CaretRight size={13} className="text-[#9199A8]" />
        </button>

        {activeSubmenu === 'capacities' && (
          <div className="absolute left-full top-0 ml-1.5 w-72 p-1.5 rounded-2xl bg-[#10141F] border border-white/10 shadow-2xl backdrop-blur-2xl z-50 space-y-1 max-h-80 overflow-y-auto scrollbar-thin">
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
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#EDEAE3] hover:bg-white/[0.06] text-left transition-colors"
                >
                  <Icon size={16} className="text-[#D5AE57] shrink-0" />
                  <span className="truncate">{cap.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Ajouter des tâches récentes > */}
      <div
        className="relative"
        onMouseEnter={() => setActiveSubmenu('recents')}
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        <button
          type="button"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#EDEAE3] hover:text-white hover:bg-white/[0.06] transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <ClockCounterClockwise size={16} className="text-[#9199A8]" />
            <span>Ajouter des tâches récentes</span>
          </div>
          <CaretRight size={13} className="text-[#9199A8]" />
        </button>

        {activeSubmenu === 'recents' && (
          <div className="absolute left-full top-0 ml-1.5 w-64 p-1.5 rounded-2xl bg-[#10141F] border border-white/10 shadow-2xl backdrop-blur-2xl z-50 space-y-1">
            {recentDocs.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => { onSelectOption(doc.name); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#EDEAE3] hover:bg-white/[0.06] text-left truncate"
              >
                <FileText size={15} className="text-[#E0584B] shrink-0" />
                <span className="truncate">{doc.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 6. Ajouter depuis la bibliothèque (Mémoire) > */}
      <div
        className="relative"
        onMouseEnter={() => setActiveSubmenu('memory')}
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        <button
          type="button"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#EDEAE3] hover:text-white hover:bg-white/[0.06] transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <Books size={16} className="text-[#D5AE57]" />
            <span>Ajouter depuis la bibliothèque</span>
          </div>
          <CaretRight size={13} className="text-[#9199A8]" />
        </button>

        {activeSubmenu === 'memory' && (
          <div className="absolute left-full top-0 ml-1.5 w-64 p-1.5 rounded-2xl bg-[#10141F] border border-white/10 shadow-2xl backdrop-blur-2xl z-50 space-y-1">
            {recentDocs.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => { onSelectOption(doc.name); onClose(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#EDEAE3] hover:bg-white/[0.06] text-left truncate"
              >
                <FileText size={15} className="text-[#E0584B] shrink-0" />
                <span className="truncate">{doc.name}</span>
              </button>
            ))}
            <div className="h-[1px] bg-white/5 my-1" />
            <button
              type="button"
              onClick={() => { onSelectOption('Ouvrir la Mémoire'); onClose(); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#D5AE57] hover:bg-[#D5AE57]/10 text-left font-semibold"
            >
              <Books size={15} />
              <span>Ouvrir la Mémoire Ñkyel</span>
            </button>
          </div>
        )}
      </div>

      <div className="h-[1px] bg-white/[0.06] my-1" />

      {/* 7. Ajouter depuis les fichiers locaux */}
      <label className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#EDEAE3] hover:text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer">
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
  );
}
