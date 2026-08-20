/**
 * Nkyel AI · SidebarFooter
 * SmartANDJ AI Technologies
 * Profile bar matching Manus screenshot: User Avatar, Name, Desktop icon, Notification Bell with badge
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import {
  GearSix,
  User,
  SignOut,
  Bell,
  Desktop,
  Sparkle,
} from '@phosphor-icons/react';
import { useAuthStore } from '@/stores/auth.store';

interface SidebarFooterProps {
  isCollapsed: boolean;
}

export default function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const [showDropdown, setShowDropdown] = useState(false);
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
      <div className="mt-auto p-2 border-t border-white/[0.06] flex flex-col items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-8 h-8 rounded-full bg-[#D5AE57]/15 border border-[#D5AE57]/30 text-[#D5AE57] flex items-center justify-center text-[12px] font-bold"
        >
          {initials}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={footerRef}
      className="mt-auto p-2.5 border-t border-white/[0.06] shrink-0 relative bg-[#07090F]/60"
    >
      {/* Profile Bar */}
      <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white/[0.04] transition-colors">
        {/* User Info */}
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6757E8] to-[#D5AE57] flex items-center justify-center text-black text-[11px] font-extrabold shadow-sm shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-semibold text-white truncate">
              {displayName}
            </span>
            <span className="text-[10px] text-[#D5AE57] font-medium flex items-center gap-1">
              <Sparkle size={10} weight="fill" /> Ñkyel Pro
            </span>
          </div>
        </button>

        {/* Action icons: Desktop & Notifications */}
        <div className="flex items-center gap-1 shrink-0 text-[#9199A8]">
          <button
            type="button"
            onClick={() => router.push('/desktop')}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:text-white hover:bg-white/5 transition-colors"
            title="Ñkyel Desktop"
          >
            <Desktop size={15} />
          </button>

          <button
            type="button"
            onClick={() => router.push('/notifications')}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:text-white hover:bg-white/5 transition-colors relative"
            title="Notifications"
          >
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#E0584B] ring-2 ring-[#07090F]" />
          </button>
        </div>
      </div>

      {/* Settings Dropdown Menu */}
      {showDropdown && (
        <div className="absolute bottom-full left-2 right-2 mb-2 p-1.5 rounded-2xl bg-[#10141F] border border-white/10 shadow-2xl backdrop-blur-xl z-50 text-[13px] space-y-1">
          <div className="px-3 py-2 border-b border-white/5">
            <div className="font-semibold text-white text-[13px]">{displayName}</div>
            <div className="text-[11px] text-[#9199A8]">SmartANDJ AI Technologies</div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowDropdown(false);
              router.push('/settings');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#9199A8] hover:text-white hover:bg-white/5 transition-colors text-left"
          >
            <GearSix size={16} />
            Paramètres & Modèles
          </button>

          <button
            type="button"
            onClick={() => {
              setShowDropdown(false);
              router.push('/account');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#9199A8] hover:text-white hover:bg-white/5 transition-colors text-left"
          >
            <User size={16} />
            Mon compte
          </button>

          <div className="h-[1px] bg-white/5 my-1" />

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#E0584B] hover:bg-[#E0584B]/10 transition-colors text-left font-medium"
          >
            <SignOut size={16} />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
