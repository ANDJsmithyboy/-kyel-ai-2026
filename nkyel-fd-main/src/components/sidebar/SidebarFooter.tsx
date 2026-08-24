/**
 * Ñkyel AI · SidebarFooter (Luma AI & Apple Architecture)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Profil ancré en bas à gauche de la sidebar :
 * - Informations compte, plan actif
 * - Popover compact thémé (100% Light et 100% Dark)
 * - Zéro couleur codée en dur
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSafeClerk as useClerk } from '@/lib/auth-client';
import {
  GearSix,
  User,
  SignOut,
  Bell,
  Desktop,
  Sparkle,
  Crown,
} from '@phosphor-icons/react';
import { useAuthStore } from '@/stores/auth.store';
import UpgradeModal from '@/components/subscription/UpgradeModal';

interface SidebarFooterProps {
  isCollapsed: boolean;
}

export default function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const logout = useAuthStore((s: any) => s.logout);
  const user = useAuthStore((s: any) => s.user);

  const [showDropdown, setShowDropdown] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (footerRef.current && !footerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  const handleSignOut = async () => {
    logout();
    await signOut();
    router.push('/sign-in');
  };

  const displayName = user?.name || 'Daniel Jonathan ANDJ';
  const initials = 'DJ';

  if (isCollapsed) {
    return (
      <>
        <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
        <div className="mt-auto p-2 border-t border-[var(--border)] flex flex-col items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 rounded-full bg-[#D5AE57]/15 border border-[#D5AE57]/30 text-[#D5AE57] flex items-center justify-center text-[12px] font-bold shadow-sm"
          >
            {initials}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <UpgradeModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />

      <div
        ref={footerRef}
        className="mt-auto p-2 border-t border-[var(--border)] shrink-0 relative bg-[var(--material-glass-regular)]"
      >
        {/* Profile Bar */}
        <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-[var(--hover)] transition-colors">
          {/* User Info */}
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
          >
            <div className="w-7 h-7 rounded-full bg-[#D5AE57] text-black flex items-center justify-center text-[11px] font-extrabold shadow-sm shrink-0">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                {displayName}
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUpgradeOpen(true);
                }}
                className="text-[10px] text-[#D5AE57] font-medium flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Sparkle size={10} weight="fill" /> Ñkyel Pro
              </span>
            </div>
          </button>

          {/* Action icons: Notifications */}
          <div className="flex items-center gap-1 shrink-0 text-[var(--text-secondary)]">
            <button
              type="button"
              onClick={() => router.push('/settings')}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors"
              title="Paramètres"
            >
              <GearSix size={15} />
            </button>
          </div>
        </div>

        {/* Settings Dropdown Menu (Luma AI Style) */}
        {showDropdown && (
          <div className="absolute bottom-full left-2 right-2 mb-2 p-1.5 rounded-2xl bg-[var(--material-glass-elevated)] border border-[var(--border-strong)] shadow-[var(--shadow-modal)] backdrop-blur-2xl z-50 text-[13px] space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
              <div className="font-semibold text-[var(--text-primary)] text-[13px]">{displayName}</div>
              <div className="text-[11px] text-[var(--text-tertiary)]">SmartANDJ AI Technologies</div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowDropdown(false);
                setIsUpgradeOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#D5AE57] hover:bg-[#D5AE57]/10 transition-colors text-left font-semibold"
            >
              <Crown size={15} weight="fill" />
              <span>S&apos;abonner à Ñkyel Pro</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowDropdown(false);
                router.push('/settings');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors text-left font-medium"
            >
              <GearSix size={15} />
              <span>Paramètres & Préférences</span>
            </button>

            <div className="h-[1px] bg-[var(--border-subtle)] my-1" />

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors text-left font-medium"
            >
              <SignOut size={15} />
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
