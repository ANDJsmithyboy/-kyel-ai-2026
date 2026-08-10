/* GabomaGPT · Header.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   En-tête chat — sélecteur de modèle + contrôles + toggle sidebar mobile */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PanelLeft, ChevronDown, Sparkles
} from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar';
import { useSettingsStore, getDisplayModelName } from '@/stores/settings.store';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { IconAurata, IconNkyel, IconWandana, GabomaAILogo } from '@/components/icons';

/* ── Modèles disponibles ── */
const MODELS = [
  { id: 'aurata-spark', icon: IconAurata, color: '#C5A059', label: 'Aurata' },
  { id: 'nyel-deep', icon: IconNkyel, color: '#94A3B8', label: 'Ñkyel' },
  { id: 'wandana-archive', icon: IconWandana, color: '#A855F7', label: 'Wandana' },
];

interface HeaderProps {
  currentModel: string;
  onModelChange: (model: string) => void;
}

export default function Header({ currentModel, onModelChange }: HeaderProps) {
  const router = useRouter();
  const { isOpen, toggle, isMobile } = useSidebarStore();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const blackPantherMode = useSettingsStore((s) => s.blackPantherMode);
  const toggleBP = useSettingsStore((s) => s.toggleBlackPanther);

  const [showModelPicker, setShowModelPicker] = useState(false);
  const currentDisplayName = getDisplayModelName(currentModel, isAdmin);
  const currentModelInfo = MODELS.find((m) => m.id === currentModel) || MODELS[1];

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 px-3 py-2 navbar-glass border-b border-[var(--border)]">
      {/* Logo Gaboma AI + Toggle (visible quand sidebar fermée ou mobile) */}
      {(isMobile || !isOpen) && (
        <div className="group flex items-center gap-1.5 mr-2">
          <div className="flex h-8 w-8 items-center justify-center">
            <GabomaAILogo width={22} height={22} />
          </div>
          <button
            onClick={toggle}
            className="flex h-7 w-7 items-center justify-center rounded-lg opacity-0 transition-all group-hover:opacity-100"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.background = 'var(--accent-06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Ouvrir la barre latérale"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
          </button>
        </div>
      )}

      {/* Sélecteur de modèle */}
      <div className="relative">
        <button
          onClick={() => setShowModelPicker(!showModelPicker)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--accent-10)] transition-colors"
        >
          <currentModelInfo.icon size={16} style={{ color: currentModelInfo.color }} />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {currentDisplayName}
          </span>
          <ChevronDown size={14} className="text-[var(--text-tertiary)]" />
        </button>

        {showModelPicker && (
          <div className="absolute top-full left-0 mt-1 w-56 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-lg animate-fade-in z-50">
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => { onModelChange(m.id); setShowModelPicker(false); }}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors',
                  m.id === currentModel
                    ? 'bg-[var(--accent-10)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-white/[0.04]'
                )}
              >
                <m.icon size={16} style={{ color: m.color }} />
                <span className="font-medium">{getDisplayModelName(m.id, isAdmin)}</span>
                {m.id === currentModel && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Black Panther toggle */}
      <button
        onClick={toggleBP}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
          blackPantherMode
            ? 'bg-[rgba(212,164,23,0.15)] text-[#D4A417] border border-[rgba(212,164,23,0.25)]'
            : 'text-[var(--text-tertiary)] hover:bg-white/[0.04] border border-transparent'
        )}
        title="Mode Black Panther"
      >
        <Sparkles size={14} />
        <span className="hidden sm:inline">Black Panther</span>
      </button>

      {/* Admin link */}
      {isAdmin && (
        <button
          onClick={() => router.push('/admin')}
          className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-tertiary)] hover:bg-white/[0.04] transition-colors"
        >
          Admin
        </button>
      )}
    </header>
  );
}
