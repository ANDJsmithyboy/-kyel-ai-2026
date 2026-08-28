/* Nkyel AI · Header.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   En-tête chat — sélecteur de modèle + contrôles + toggle sidebar mobile */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PanelLeft, ChevronDown, Sparkles
} from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar';
import { useSettingsStore } from '@/stores/settings.store';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { IconAurata, IconNkyel, IconWandana } from '@/components/icons';
import { IbogaNavigationTrigger } from '@/components/brand';

function getDisplayModelName(modelId: string, _isAdmin?: boolean) {
  if (modelId === 'aurata-spark') return 'Ñkyel Fast';
  if (modelId === 'nyel-deep') return 'Ñkyel Deep';
  if (modelId === 'wandana-archive') return 'Ñkyel Research';
  return 'Ñkyel Auto';
}

/* -- Modèles disponibles -- */
const MODELS = [
  { id: 'aurata-spark', icon: IconAurata, color: '#C5A059', label: 'Aurata' },
  { id: 'nyel-deep', icon: IconNkyel, color: '#94A3B8', label: 'Nkyel' },
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
      {/* Iboga Navigation Trigger + Wordmark (visible quand sidebar fermée ou mobile) */}
      {(isMobile || !isOpen) && (
        <div className="flex items-center gap-1.5 me-2">
          <IbogaNavigationTrigger
            open={false}
            onToggle={toggle}
            glyphSize={19}
            variant="header"
            title="Ouvrir la navigation"
            label="Ouvrir la navigation"
          />
          <span
            className="select-none text-[15px] font-semibold tracking-tight text-[var(--text-primary)]"
            style={{ letterSpacing: '-0.025em' }}
          >
            Ñkyel
          </span>
        </div>
      )}

      {/* Sélecteur de modèle */}
      <div className="relative">
        <button
          onClick={() => setShowModelPicker(!showModelPicker)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--accent-10)] transition-colors"
        >
          <currentModelInfo.icon width={16} height={16} style={{ color: currentModelInfo.color }} />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {currentDisplayName}
          </span>
          <ChevronDown size={14} className="text-[var(--text-tertiary)]" />
        </button>

        {showModelPicker && (
          <div className="absolute top-full start-0 mt-1 w-56 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-lg animate-fade-in z-50">
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
                <m.icon width={16} height={16} style={{ color: m.color }} />
                <span className="font-medium">{getDisplayModelName(m.id, isAdmin)}</span>
                {m.id === currentModel && (
                  <span className="ms-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
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
    </header>
  );
}
