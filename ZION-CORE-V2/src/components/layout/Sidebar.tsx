/* GabomaGPT · Sidebar.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Barre latérale premium — conversations, recherche, profil utilisateur
   Identique à Claude.ai / ChatGPT en qualité */
'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, MagnifyingGlass as Search, Gear as Settings, ChatTeardropText as MessageSquare, CaretLeft as PanelLeftClose,
  Trash as Trash2, PushPin as Pin, DotsThree as MoreHorizontal, Sparkle as Sparkles, CaretDown as ChevronDown, Check
} from '@phosphor-icons/react';
import { IconBlackPanther, GabomaAgentIcon } from '../icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebarStore } from '@/stores/sidebar';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore, type Conversation } from '@/stores/chat.store';
import { useSettingsStore } from '@/stores/settings.store';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { useClerk } from '@clerk/nextjs';

/* ── Salutations gabonaises par heure ── */
function getGreeting(name: string, style: string): string {
  const h = new Date().getHours();
  if (style === 'formel') {
    if (h >= 5 && h < 12) return `Bonjour ${name}`;
    if (h >= 12 && h < 18) return `Bon après-midi ${name}`;
    if (h >= 18 && h < 21) return `Bonsoir ${name}`;
    return `Bonsoir ${name}`;
  }
  if (h >= 5 && h < 12) return `Mbolo ! Bonjour ${name}`;
  if (h >= 12 && h < 18) return `Akeva ! Bon après-midi ${name}`;
  if (h >= 18 && h < 21) return `Bonsoir ${name}, on gère quoi ?`;
  return `C'est tard ${name}, mais GabomaGPT veille`;
}

export default function Sidebar() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { isOpen, isMobile, close, toggle, setMobile } = useSidebarStore();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeConversationId);
  const addConversation = useChatStore((s) => s.addConversation);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const removeConversation = useChatStore((s) => s.removeConversation);
  const greetingStyle = useSettingsStore((s) => s.greetingStyle);
  const blackPantherMode = useSettingsStore((s) => s.blackPantherMode);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleSignOut = async () => {
    logout();
    await signOut();
    router.push('/sign-in');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la suppression.');
      }
      logout();
      await signOut();
      router.push('/sign-in');
    } catch (err: any) {
      setDeleteError(err.message || 'Une erreur est survenue.');
      setDeleteLoading(false);
    }
  };

  /* Calculer la salutation cote client uniquement (evite hydration mismatch) */
  useEffect(() => {
    if (user) {
      setGreeting(getGreeting(user.name.split(' ')[0], greetingStyle));
    }
  }, [user, greetingStyle]);

  /* Détecter mobile */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setMobile(mq.matches);
    setIsMounted(true);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setMobile]);

  /* Raccourcis clavier */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); toggle(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  const handleNewChat = useCallback(() => {
    const conv: Conversation = {
      id: uuidv4(),
      title: 'Nouvelle conversation',
      messages: [],
      model: 'llama-3.3-70b-versatile',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addConversation(conv);
    setActiveConversation(conv.id);
    router.push(`/chat/${conv.id}`);
    if (isMobile) close();
  }, [addConversation, setActiveConversation, router, isMobile, close]);

  const handleSelectChat = useCallback((id: string) => {
    setActiveConversation(id);
    router.push(`/chat/${id}`);
    if (isMobile) close();
  }, [setActiveConversation, router, isMobile, close]);

  /* Filtrer conversations */
  const filtered = searchQuery
    ? conversations.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  /* Grouper par date */
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 7 * 86400000;

  const groups: { label: string; items: Conversation[] }[] = [];
  const todayItems = filtered.filter((c) => c.updatedAt >= todayStart);
  const yesterdayItems = filtered.filter((c) => c.updatedAt >= yesterdayStart && c.updatedAt < todayStart);
  const weekItems = filtered.filter((c) => c.updatedAt >= weekStart && c.updatedAt < yesterdayStart);
  const olderItems = filtered.filter((c) => c.updatedAt < weekStart);

  if (todayItems.length) groups.push({ label: "Aujourd'hui", items: todayItems });
  if (yesterdayItems.length) groups.push({ label: 'Hier', items: yesterdayItems });
  if (weekItems.length) groups.push({ label: '7 derniers jours', items: weekItems });
  if (olderItems.length) groups.push({ label: 'Plus ancien', items: olderItems });

  /* ── Collapsed sidebar (desktop, fermé) ── */
  if (!isOpen && !isMobile) {
    return (
      <div className="fixed top-0 left-0 z-50 h-screen w-[48px] flex flex-col items-center py-2 border-r border-[var(--border)] bg-[var(--zc-surface)]" suppressHydrationWarning>
        <button
          onClick={toggle}
          className="p-2 rounded-xl hover:bg-[var(--accent-10)] transition-colors group text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          title="Ouvrir la barre latérale (Ctrl+B)"
        >
          <GabomaAgentIcon className="w-6 h-6" />
        </button>

        <button
          onClick={handleNewChat}
          className="mt-2 p-2 rounded-xl hover:bg-[var(--accent-10)] transition-colors"
          title="Nouvelle conversation (Ctrl+N)"
        >
          <Plus size={18} className="text-[var(--text-secondary)]" />
        </button>

        <button
          onClick={() => { toggle(); setShowSearch(true); }}
          className="mt-1 p-2 rounded-xl hover:bg-[var(--accent-10)] transition-colors"
          title="Rechercher (Ctrl+K)"
        >
          <Search size={18} className="text-[var(--text-secondary)]" />
        </button>

        <div className="flex-1" />

        <button
          onClick={() => router.push('/settings')}
          className="p-2 rounded-xl hover:bg-[var(--accent-10)] transition-colors mb-1"
          title="L'Antre"
        >
          <Settings size={18} className="text-[var(--text-secondary)]" />
        </button>

        {user && (
          <div className="p-1" title={user.name}>
            <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-semibold text-[var(--accent-foreground)]">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl relative flex flex-col gap-4 shadow-2xl"
              style={{ background: '#0B0D0F', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
              <h3 className="text-[16px] font-bold flex items-center gap-2" style={{ color: '#F0EDE6' }}>
                <span>⚠️</span> Suppression Définitive
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: '#8A8A92' }}>
                Cette action est <strong style={{ color: '#ef4444' }}>irréversible</strong>. Votre Profil Cadre, vos conversations En Piste, et votre historique seront définitivement effacés de GabomaAI.
              </p>
              <p className="text-[12px] italic p-2.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: '#525258' }}>
                Pour valider, veuillez saisir <span className="font-mono select-all" style={{ color: '#F0EDE6' }}>SUPPRIMER</span> ci-dessous :
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full px-3 py-2 text-sm rounded-xl outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EDE6' }}
              />
              {deleteError && (
                <p className="text-[11px] font-semibold" style={{ color: '#f87171' }}>{deleteError}</p>
              )}
              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteError(''); }}
                  className="flex-1 py-2 rounded-xl text-[12px] font-semibold transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', color: '#8A8A92' }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmText !== 'SUPPRIMER' || deleteLoading}
                  onClick={handleDeleteAccount}
                  className="flex-1 py-2 rounded-xl text-[12px] font-semibold transition-all"
                  style={{ 
                    background: deleteConfirmText === 'SUPPRIMER' && !deleteLoading ? '#dc2626' : 'rgba(220,38,38,0.3)',
                    color: deleteConfirmText === 'SUPPRIMER' && !deleteLoading ? '#fff' : 'rgba(255,255,255,0.5)',
                    border: 'none',
                    cursor: deleteConfirmText === 'SUPPRIMER' && !deleteLoading ? 'pointer' : 'not-allowed'
                  }}
                >
                  {deleteLoading ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Overlay mobile */}
      {isMobile && (
        <div className="fixed inset-0 bg-black/60 z-40 animate-fade-in" onClick={close} />
      )}

      {/* Sidebar ouverte */}
      <aside
        id="sidebar"
        className={cn(
          'fixed top-0 left-0 z-50 h-screen flex flex-col select-none',
          'w-[260px] bg-[var(--zc-surface)]/80 backdrop-blur-xl text-[var(--text-secondary)]',
          'border-r border-white/[0.03]',
          'transition-transform duration-250',
          isMobile ? 'shadow-2xl' : '',
        )}        suppressHydrationWarning      >
        {/* ── En-tête : Logo + GabomaGPT + Iboga toggle ── */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-2 relative">
          {/* Dot indicator lumineux */}
          <div className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
          <a href="/chat" className="flex items-center gap-2 flex-1 min-w-0 pl-4" onClick={() => { if (isMobile) close(); }}>
            {blackPantherMode ? (
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-10)] border border-[var(--accent-20)] flex items-center justify-center text-[var(--accent)] shrink-0">
                <IconBlackPanther className="w-5 h-5" />
              </div>
            ) : (
              <img
                src="/gabomagpt-logo.jpeg"
                alt="GabomaGPT"
                className="w-8 h-8 rounded-xl object-cover shrink-0 ring-1 ring-[var(--border)]"
              />
            )}
            <div className="flex items-baseline gap-0 min-w-0">
              <span className="text-[15px] font-semibold tracking-tight text-[var(--accent)]">Gaboma</span>
              <span className="text-[15px] font-semibold tracking-tight text-[var(--gabon-blue,#38BDF8)]">AI</span>
            </div>
          </a>
          <button
            onClick={toggle}
            className="p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors shrink-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            title="Fermer la barre latérale (Ctrl+B)"
          >
            <GabomaAgentIcon className="w-6 h-6" />
          </button>
        </div>

        {/* ── Boutons rapides : Nouveau chat + Recherche ── */}
        <div className="px-2 pb-1 space-y-0.5">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-[var(--accent-10)] transition-colors group"
          >
            <Plus size={16} weight="bold" className="text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
            <span className="font-medium">Nouvelle Piste</span>
            <span className="ml-auto text-[10px] text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">Ctrl+N</span>
          </button>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-[var(--accent-10)] transition-colors group"
          >
            <Search size={16} weight="bold" className="text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
            <span className="font-medium">Radar WANDANA</span>
            <span className="ml-auto text-[10px] text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">Ctrl+K</span>
          </button>
        </div>

        {/* ── Barre de recherche ── */}
        {showSearch && (
          <div className="px-3 pb-2 animate-fade-in">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)]">
              <Search size={14} className="text-[var(--text-tertiary)] shrink-0" />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* ── Liste des conversations ── */}
        <div className="flex-1 overflow-y-auto scroll-fade scrollbar-hidden px-2 pt-1 pb-2">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare size={32} weight="thin" className="text-[var(--text-tertiary)] mb-3 opacity-40" />
              <p className="text-sm text-[var(--text-tertiary)]">L'Antre est vide</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 opacity-60">
                Ouvrez une "Nouvelle Piste" pour commencer
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="mb-2">
                <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  {group.label}
                </div>
                {group.items.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectChat(conv.id)}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-colors group relative',
                      conv.id === activeId
                        ? 'bg-[var(--accent-10)] text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-white/[0.04]'
                    )}
                  >
                    {/* Indicateur actif latéral */}
                    {conv.id === activeId && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[var(--accent)] rounded-r-full" />
                    )}
                    <MessageSquare size={14} className={cn(
                      'shrink-0',
                      conv.id === activeId ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
                    )} strokeWidth={1.5} />
                    <span className="truncate flex-1 text-left">{conv.title}</span>

                    {/* Bouton supprimer au hover */}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeConversation(conv.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={12} className="text-red-400" />
                    </button>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        {/* ── Footer : profil utilisateur + paramètres ── */}
        <div className="px-2 py-2 border-t border-white/[0.03]">
          {/* Black Panther badge */}
          {blackPantherMode ? (
            <div className="flex items-center gap-2 px-3 py-1.5 mb-1.5 rounded-xl bg-[rgba(212,164,23,0.08)] border border-[rgba(212,164,23,0.15)]">
              <Sparkles size={12} weight="fill" className="text-[#D4A417]" />
              <span className="text-[11px] font-medium text-[#D4A417]">BLACK PANTHER</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 mb-1.5 rounded-xl bg-[rgba(46,204,138,0.08)] border border-[rgba(46,204,138,0.15)]">
              <Sparkles size={12} weight="fill" className="text-[var(--green-emerald)]" />
              <span className="text-[11px] font-medium text-[var(--green-emerald)]">AURATA SOUVERAIN</span>
            </div>
          )}

          {/* Utilisateur */}
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-sm font-semibold text-[var(--accent-foreground)] shrink-0">
              {user ? user.name.charAt(0).toUpperCase() : 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user ? user.name : 'Invité'}
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)] truncate">
                {greeting || 'Mbolo !'}
              </div>
            </div>
            <button
              onClick={() => { router.push('/settings'); if (isMobile) close(); }}
              className="p-1.5 rounded-lg hover:bg-[var(--accent-10)] transition-colors"
              title="L'Antre"
            >
              <Settings size={16} className="text-[var(--text-tertiary)]" />
            </button>
          </div>

          {/* Menu de Déconnexion / Suppression */}
          <div className="flex items-center gap-2 px-2 pb-2">
            <button
              onClick={handleSignOut}
              className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-white bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              title="Se déconnecter"
            >
              Déconnexion
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-colors"
              title="Supprimer mon compte"
            >
              Supprimer
            </button>
          </div>

          {/* Signature */}
          <div className="text-center pt-2 pb-1 select-none flex flex-col gap-0.5">
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[var(--text-tertiary)] opacity-60">
              Gaboma AI VOP
            </span>
            <span className="text-[9px] text-[var(--text-tertiary)] opacity-40 font-light">
              &copy; 2026 SmartANDJ AI
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
