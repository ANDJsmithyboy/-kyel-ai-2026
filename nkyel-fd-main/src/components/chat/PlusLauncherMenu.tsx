'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Archive, PuzzlePiece, CalendarPlus, Database,
  CaretRight, CaretLeft, Sparkle, GoogleDriveLogo
} from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/language.store';

export type PlusMenuState = 'root' | 'sanctuary' | 'missions' | 'capabilities' | 'sources';

interface PlusLauncherMenuProps {
  onClose: () => void;
  onSelectAction: (actionId: string, payload?: any) => void;
  isMobile: boolean;
}

export default function PlusLauncherMenu({ onClose, onSelectAction, isMobile }: PlusLauncherMenuProps) {
  const { t } = useLanguageStore();
  const [activeMenu, setActiveMenu] = useState<PlusMenuState>('root');

  // Prevent background scroll on mobile when active
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobile]);

  // Root Menu
  const renderRoot = () => (
    <div className="flex flex-col py-2 space-y-1">
      <MenuItem 
        icon={<FileText weight="bold" size={22} />} 
        label={t('launcher.localFiles') || 'Add local files'} 
        onClick={() => onSelectAction('local_files')} 
      />
      <MenuItem 
        icon={<Archive weight="bold" size={22} />} 
        label={t('launcher.sanctuary') || 'Add from Sanctuary'} 
        hasChevron 
        onClick={() => setActiveMenu('sanctuary')} 
      />
      <MenuItem 
        icon={<Sparkle weight="bold" size={22} />} 
        label={t('launcher.recentMissions') || 'Add recent Missions'} 
        hasChevron 
        onClick={() => setActiveMenu('missions')} 
      />
      <MenuItem 
        icon={<PuzzlePiece weight="bold" size={22} />} 
        label={t('launcher.capabilities') || 'Use Capabilities'} 
        hasChevron 
        onClick={() => setActiveMenu('capabilities')} 
      />
      <MenuItem 
        icon={<CalendarPlus weight="bold" size={22} />} 
        label={t('launcher.plan') || 'Plan'} 
        onClick={() => onSelectAction('plan')} 
      />
      
      <div className="h-[1px] bg-[var(--border-subtle)] my-1.5 mx-3" />
      
      <MenuItem 
        icon={<GoogleDriveLogo weight="bold" size={22} />} 
        label="Google Drive" 
        onClick={() => onSelectAction('gdrive')} 
      />
      <MenuItem 
        icon={<Database weight="bold" size={22} />} 
        label={t('launcher.otherSources') || 'Other sources'} 
        hasChevron 
        onClick={() => setActiveMenu('sources')} 
      />
    </div>
  );

  // Example Submenu: Sanctuary
  const renderSanctuary = () => (
    <div className="flex flex-col py-2">
      <div className="flex items-center px-2 pb-2 mb-2 border-b border-[var(--border-subtle)]">
        <button 
          onClick={() => setActiveMenu('root')}
          className="p-1.5 hover:bg-[var(--hover)] rounded-lg mr-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <CaretLeft weight="bold" size={20} />
        </button>
        <span className="font-semibold text-[15px]">{t('launcher.sanctuary') || 'Sanctuary'}</span>
      </div>
      
      {/* Fake recent items for demonstration, actual implementation pulls from Sanctuary store */}
      <div className="px-3 py-1 space-y-1">
        <div className="text-[12px] font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">Recent Files</div>
        {[1, 2, 3].map(i => (
          <button key={i} onClick={() => onSelectAction('sanctuary_file', `file_${i}`)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--hover)] rounded-xl text-start transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
              <FileText size={18} className="text-[var(--text-secondary)]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-medium truncate">Strategic_Plan_2026_v{i}.pdf</span>
              <span className="text-[12px] text-[var(--text-muted)]">Mission {i}</span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="px-3 pt-2 mt-2 border-t border-[var(--border-subtle)]">
        <button onClick={() => onSelectAction('open_sanctuary')} className="w-full py-2.5 flex items-center justify-center gap-2 text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] rounded-xl">
          Browse Sanctuary <CaretRight weight="bold" size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div 
      className="absolute bottom-[calc(100%+12px)] left-0 z-50 overflow-hidden shadow-[var(--shadow-floating)] border border-[var(--border-strong)] rounded-[20px] bg-[var(--surface-raised)] backdrop-blur-xl animate-in slide-in-from-bottom-2 fade-in duration-200"
      style={{
        width: isMobile ? 'min(calc(100vw - 32px), 330px)' : '320px',
        maxHeight: 'min(calc(100dvh - 120px), 500px)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="h-full overflow-y-auto overscroll-contain no-scrollbar">
        {activeMenu === 'root' && renderRoot()}
        {activeMenu === 'sanctuary' && renderSanctuary()}
        {/* Additional submenus (missions, capabilities, sources) follow the same pattern */}
        {(activeMenu === 'missions' || activeMenu === 'capabilities' || activeMenu === 'sources') && (
          <div className="flex flex-col py-2">
            <div className="flex items-center px-2 pb-2 mb-2 border-b border-[var(--border-subtle)]">
              <button 
                onClick={() => setActiveMenu('root')}
                className="p-1.5 hover:bg-[var(--hover)] rounded-lg mr-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <CaretLeft weight="bold" size={20} />
              </button>
              <span className="font-semibold text-[15px]">
                {activeMenu === 'missions' ? 'Recent Missions' : activeMenu === 'capabilities' ? 'Capabilities' : 'Other Sources'}
              </span>
            </div>
            <div className="p-6 text-center text-[13px] text-[var(--text-muted)]">
              Populated from real backend state.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ icon, label, hasChevron, onClick }: { icon: React.ReactNode; label: string; hasChevron?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-3 py-2.5 mx-1.5 rounded-[12px] hover:bg-[var(--hover)] text-[var(--text-primary)] active:scale-[0.98] transition-all"
      style={{ width: 'calc(100% - 12px)' }}
    >
      <div className="flex items-center gap-3">
        <div className="text-[var(--text-primary)] flex items-center justify-center shrink-0 w-[24px]">
          {icon}
        </div>
        <span className="text-[15px] sm:text-[16px] font-medium">{label}</span>
      </div>
      {hasChevron && (
        <CaretRight weight="bold" size={18} className="text-[var(--text-tertiary)]" />
      )}
    </button>
  );
}
