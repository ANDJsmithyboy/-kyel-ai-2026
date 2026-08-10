'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GabomaModel } from '@/lib/models';
import { MODEL_META } from '@/lib/models';
import { Camera, Image, FileText, ToggleLeft, ToggleRight, X } from '@phosphor-icons/react';
import { IconAurata } from '../icons/IconAurata';
import { IconNkyel } from '../icons/IconNkyel';
import { IconOnyxGris } from '../icons/IconOnyxGris';
import { IconWandana } from '../icons/IconWandana';
import { IconBlackPanther } from '../icons/IconBlackPanther';

interface AttachmentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  model: GabomaModel;
  onModelSelect: (m: GabomaModel) => void;
  wandanaEnabled: boolean;
  onToggleWandana: () => void;
}

export default function AttachmentSheet({
  isOpen,
  onClose,
  model,
  onModelSelect,
  wandanaEnabled,
  onToggleWandana
}: AttachmentSheetProps) {
  if (!isOpen) return null;

  const handleSelectModel = (m: GabomaModel) => {
    onModelSelect(m);
    onClose();
  };

  const getModelIcon = (m: GabomaModel, isActive: boolean) => {
    const props = { className: `w-5 h-5 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}` };
    switch(m) {
      case 'AURATA': return <IconAurata {...props} />;
      case 'NKYEL': return <IconNkyel {...props} />;
      case 'ONYXGRIS': return <IconOnyxGris {...props} />;
      case 'WANDANA': return <IconWandana {...props} />;
      case 'BLACK_PANTHER': return <IconBlackPanther {...props} />;
      case 'BLUE_PANTHER': return <IconBlackPanther {...props} style={{ color: '#0070F3' }} />;
      default: return <IconAurata {...props} />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute bottom-full left-0 mb-2 w-[320px] rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col"
        style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px) saturate(180%)'
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <span className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.07em]">Options</span>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* 1. Médias horizontaux */}
        <div className="flex items-center justify-around p-3 border-b border-[var(--border)]">
          {[
            { icon: <Camera size={20} weight="thin" />, label: 'Caméra' },
            { icon: <Image size={20} weight="thin" />, label: 'Image' },
            { icon: <FileText size={20} weight="thin" />, label: 'Fichier' }
          ].map((item, i) => (
            <button key={i} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[var(--accent-06)] transition-colors text-[var(--text-primary)] group">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] group-hover:bg-[var(--accent-10)] flex items-center justify-center transition-colors">
                {item.icon}
              </div>
              <span className="text-[11px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">{item.label}</span>
            </button>
          ))}
        </div>

        {/* 2. Vecteur de Force (Modèles) */}
        <div className="p-2 border-b border-[var(--border)]">
          <div className="px-2 py-1.5 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Vecteur de force</div>
          {(Object.keys(MODEL_META) as GabomaModel[]).map((m) => {
            const meta = MODEL_META[m];
            const isActive = m === model;
            return (
              <button
                key={m}
                onClick={() => handleSelectModel(m)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[var(--accent-06)] transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] group-hover:bg-[var(--accent-08)] flex items-center justify-center">
                    {getModelIcon(m, isActive)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-[var(--text-primary)] uppercase tracking-wide">
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">{meta.desc}</span>
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-35)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* 3. Section WANDANA */}
        <div className="p-3 border-b border-[var(--border)]">
          <button
            onClick={onToggleWandana}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${wandanaEnabled ? 'bg-[rgba(31,157,107,0.10)] border-l-2 border-[var(--color-success)]' : 'hover:bg-[var(--accent-06)]'}`}
          >
            <div className="flex items-center gap-3">
              <IconWandana className={`w-5 h-5 ${wandanaEnabled ? 'text-[var(--color-success)]' : 'text-[var(--text-secondary)]'}`} />
              <div className="flex flex-col text-left">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">WANDANA</span>
                <span className="text-[11px] text-[var(--text-secondary)]">Recherche web / vidéo</span>
              </div>
            </div>
            {wandanaEnabled ? <ToggleRight size={24} weight="fill" className="text-[var(--color-success)]" /> : <ToggleLeft size={24} weight="regular" className="text-[var(--text-tertiary)]" />}
          </button>
        </div>

        {/* 4. Connecteurs */}
        <div className="p-3">
          <div className="px-1 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Connecteurs</div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hidden">
            {['Skills', 'MCP', 'WhatsApp', '+ Ajouter'].map((conn, i) => (
              <div key={i} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] opacity-50 cursor-not-allowed">
                <span className="text-[12px] font-medium text-[var(--text-secondary)]">{conn}</span>
                <span className="text-[9px] bg-[var(--bg-elevated)] px-1.5 rounded text-[var(--text-tertiary)]">Bientôt</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
