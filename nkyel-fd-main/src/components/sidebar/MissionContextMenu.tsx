'use client';

import React, { useState } from 'react';
import { 
  ShareNetwork, PencilSimple, ArrowSquareOut, PushPin, 
  Star, Folder, ArchiveBox, Trash
} from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';

interface MissionContextMenuProps {
  missionId: string;
  onClose: () => void;
  onRename: () => void;
  onMoveToProject: () => void;
  isMobile: boolean;
}

export default function MissionContextMenu({ 
  missionId, onClose, onRename, onMoveToProject, isMobile 
}: MissionContextMenuProps) {
  const { t } = useLanguageStore();

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={(e) => { e.stopPropagation(); onClose(); }} 
      />
      
      <div 
        className={`absolute z-50 overflow-hidden shadow-[var(--shadow-floating)] border border-[var(--border-strong)] rounded-[20px] bg-[var(--surface-raised)] backdrop-blur-xl animate-in fade-in duration-150 ${
          isMobile ? 'left-0 bottom-full mb-2' : 'left-full top-0 ml-2'
        }`}
        style={{
          width: isMobile ? 'min(calc(100vw - 40px), 320px)' : '280px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col py-2 space-y-0.5">
          <MenuAction icon={<ShareNetwork weight="bold" size={22} />} label={t('mission.share') || 'Share Mission'} onClick={onClose} />
          <MenuAction icon={<PencilSimple weight="bold" size={22} />} label={t('common.rename') || 'Rename'} onClick={() => { onRename(); onClose(); }} />
          <MenuAction icon={<ArrowSquareOut weight="bold" size={22} />} label={t('common.openNewTab') || 'Open in new tab'} onClick={onClose} />
          
          <div className="h-[1px] bg-[var(--border-subtle)] my-1.5 mx-3" />
          
          <MenuAction icon={<PushPin weight="bold" size={22} />} label={t('common.pin') || 'Pin'} onClick={onClose} />
          <MenuAction icon={<Star weight="bold" size={22} />} label={t('common.favorite') || 'Add to favorites'} onClick={onClose} />
          <MenuAction icon={<Folder weight="bold" size={22} />} label={t('common.moveToProject') || 'Move to Project'} hasChevron onClick={onMoveToProject} />
          
          <div className="h-[1px] bg-[var(--border-subtle)] my-1.5 mx-3" />
          
          <MenuAction icon={<ArchiveBox weight="bold" size={22} />} label={t('common.archive') || 'Archive'} onClick={onClose} />
          <MenuAction 
            icon={<Trash weight="bold" size={22} />} 
            label={t('common.delete') || 'Delete'} 
            onClick={onClose} 
            isDanger 
          />
        </div>
      </div>
    </>
  );
}

function MenuAction({ icon, label, onClick, hasChevron, isDanger }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-3 py-2.5 mx-1.5 rounded-[12px] transition-all active:scale-[0.98] ${
        isDanger 
          ? 'hover:bg-red-500/10 text-red-600 dark:text-red-400' 
          : 'hover:bg-[var(--hover)] text-[var(--text-primary)]'
      }`}
      style={{ width: 'calc(100% - 12px)' }}
    >
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center shrink-0 w-[24px]`}>
          {icon}
        </div>
        <span className="text-[15px] sm:text-[16px] font-medium">{label}</span>
      </div>
      {hasChevron && (
        <span className="text-[18px] opacity-50">&rsaquo;</span>
      )}
    </button>
  );
}
