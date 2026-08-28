'use client';

import React, { useState, useEffect } from 'react';
import { Folder, X } from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';

interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function ProjectDialog({ isOpen, onClose, onCreate }: ProjectDialogProps) {
  const { t } = useLanguageStore();
  const [projectName, setProjectName] = useState('');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Detect virtual keyboard opening to adjust position (visualViewport API)
    const handleViewportChange = () => {
      if (window.visualViewport && window.visualViewport.height < window.innerHeight) {
        setIsKeyboardOpen(true);
      } else {
        setIsKeyboardOpen(false);
      }
    };

    window.visualViewport?.addEventListener('resize', handleViewportChange);
    return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Dim backdrop with subtle blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[4px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Surface */}
      <div 
        className="relative w-full max-w-[370px] bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        style={{
          width: 'calc(100vw - 28px)',
          padding: '32px',
          transform: isKeyboardOpen ? 'translateY(-15%)' : 'translateY(0)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)] transition-colors active:scale-95"
        >
          <X weight="bold" size={24} />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          {/* Centered Icon Tile */}
          <div className="w-[72px] h-[72px] bg-[var(--surface)] border border-[var(--border-strong)] rounded-[18px] flex items-center justify-center mb-6 shadow-sm">
            <Folder weight="bold" size={34} className="text-[var(--text-primary)]" />
          </div>

          <h2 className="text-[28px] font-semibold tracking-tight text-[var(--text-primary)] mb-6">
            {t('project.create') || 'Create a Project'}
          </h2>

          <div className="w-full text-start mb-6">
            <label className="block text-[15px] font-semibold text-[var(--text-secondary)] mb-2">
              {t('project.nameLabel') || 'Project Name'}
            </label>
            <input
              autoFocus
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder={t('project.namePlaceholder') || 'e.g. Q3 Roadmap'}
              className="w-full h-[54px] px-4 rounded-[14px] bg-[var(--surface)] border border-[var(--border-subtle)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-[16px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors outline-none"
            />
          </div>

          <div className="w-full flex gap-3 sm:flex-row flex-col">
            <button
              onClick={onClose}
              className="flex-1 h-[54px] rounded-[14px] bg-[var(--surface)] hover:bg-[var(--hover)] text-[16px] font-semibold text-[var(--text-secondary)] transition-colors border border-[var(--border-subtle)]"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              disabled={!projectName.trim()}
              onClick={() => {
                onCreate(projectName);
                setProjectName('');
                onClose();
              }}
              className="flex-1 h-[54px] rounded-[14px] bg-[var(--accent)] text-[var(--accent-fg)] text-[16px] font-semibold hover:opacity-90 disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-muted)] disabled:border disabled:border-[var(--border-subtle)] transition-all active:scale-[0.98]"
            >
              {t('common.create') || 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
