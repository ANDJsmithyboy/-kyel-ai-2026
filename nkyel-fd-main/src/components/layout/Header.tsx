/* Nkyel AI · Header.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   En-tête chat — sélecteur de modèle + contrôles + toggle sidebar mobile */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PanelLeft, ChevronDown, Sparkles, CircleDashed
} from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar';
import { useSettingsStore } from '@/stores/settings.store';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/chat.store';
import { cn } from '@/lib/utils';
import { IconAurata, IconNkyel, IconWandana } from '@/components/icons';
import { IbogaNavigationTrigger } from '@/components/brand';

function getDisplayModelName(modelId: string, _isAdmin?: boolean) {
  if (modelId === 'nkyel-chui') return 'Ñkyel Chui';
  if (modelId === 'nkyel-radi') return 'Ñkyel Radi';
  if (modelId === 'nkyel-research') return 'Ñkyel Research';
  return 'Ñkyel';
}

function getModelIconProps(modelId: string) {
  if (modelId === 'nkyel-chui') return { icon: IconAurata, color: '#22C55E' };
  if (modelId === 'nkyel-radi') return { icon: IconNkyel, color: '#3B82F6' };
  if (modelId === 'nkyel-research') return { icon: IconWandana, color: '#942BC9' };
  return { icon: IconNkyel, color: '#F5F5F3' };
}

interface HeaderProps {
  currentModel: string;
  onModelChange: (model: string) => void;
}

export default function Header({ currentModel, onModelChange }: HeaderProps) {
  const router = useRouter();
  const { isOpen, toggle, isMobile } = useSidebarStore();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const availableProfiles = useChatStore((s: any) => s.availableProfiles);
  const isProfilesLoading = useChatStore((s: any) => s.isProfilesLoading);
  const fetchProfiles = useChatStore((s: any) => s.fetchProfiles);

  const [showModelPicker, setShowModelPicker] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const currentDisplayName = getDisplayModelName(currentModel, isAdmin);
  const currentModelProps = getModelIconProps(currentModel);
  const CurrentIcon = currentModelProps.icon;

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
          {isProfilesLoading ? (
            <CircleDashed size={16} className="animate-spin text-[var(--text-tertiary)]" />
          ) : (
            <CurrentIcon width={16} height={16} style={{ color: currentModelProps.color }} />
          )}
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {isProfilesLoading ? 'Chargement...' : currentDisplayName}
          </span>
          <ChevronDown size={14} className="text-[var(--text-tertiary)]" />
        </button>

        {showModelPicker && !isProfilesLoading && (
          <div className="absolute top-full start-0 mt-1 w-56 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-lg animate-fade-in z-50">
            {availableProfiles?.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[var(--text-tertiary)]">
                Aucun profil disponible
              </div>
            ) : (
              availableProfiles?.map((m: any) => {
                const props = getModelIconProps(m.id);
                const MIcon = props.icon;
                return (
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
                    <MIcon width={16} height={16} style={{ color: props.color }} />
                    <span className="font-medium">{getDisplayModelName(m.id, isAdmin)}</span>
                    {m.id === currentModel && (
                      <span className="ms-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

    </header>
  );
}
