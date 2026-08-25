/**
 * Ñkyel AI — Universal Command Palette (⌘K / Ctrl+K)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Sensation Visuelle : Apple × Geist × Ñkyel Minimal Floating Surface
 * - Navigation instantanée (Keyboard-first: ↑, ↓, Enter, Esc, Tab)
 * - Exécution réelle d'actions (Changement de thème, langue BCP-47, mode autonomie, mémoire)
 * - Sensibilité au contexte (Conversation, Visual Agent, WorkGraph, Memory)
 * - Recherche globale instantanée (Outils, Skills, Paramètres, Actions)
 * - Synchronisation garantie avec Neon PostgreSQL (/api/v1/users/preferences)
 * - Mode Mobile Bottom Sheet
 */

'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  MagnifyingGlass,
  Command,
  Plus,
  ChatCircleDots,
  Graph,
  UsersThree,
  Cpu,
  PlugsConnected,
  PuzzlePiece,
  CalendarCheck,
  Brain,
  FolderSimpleStar,
  FloppyDisk,
  ShieldCheck,
  Gear,
  Moon,
  Sun,
  Globe,
  Lightning,
  Sparkle,
  ArrowRight,
  CheckCircle,
  Eye,
  TerminalWindow,
  SlidersHorizontal,
  HandPointing,
  LockKey,
  PaperPlaneTilt,
  TreeStructure,
} from '@phosphor-icons/react';
import { GeistActivity } from '@/components/icons/GeistIcons';
import { useSafeUser as useUser } from '@/lib/auth-client';
import { useLanguageStore } from '@/stores/language.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useWorkspaceLayout } from '@/hooks/useWorkspaceLayout';

export interface CommandItem {
  id: string;
  label: string;
  category: 'Suggestions' | 'Navigation' | 'Actions & Missions' | 'Apparence & Thème' | 'Langues & Région' | 'Agent & Autonomie' | 'Mémoire & Données' | 'Admin';
  icon: React.ComponentType<any>;
  shortcut?: string;
  contextScope?: ('global' | 'conversation' | 'workspace' | 'settings' | 'admin')[];
  keywords?: string[];
  handler: () => void | Promise<void>;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { uiLocale, setUiLocale } = useLanguageStore();
  const { theme, setTheme, updatePreferences, memoryEnabled } = useSettingsStore();
  const { toggleFocusMode, toggleRight, toggleLeft, setRightTab } = useWorkspaceLayout();

  const isSuperAdmin = useMemo(() => {
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
    return (
      email.includes('jonathanakarentoutoume') ||
      email.includes('smartandjia') ||
      email.includes('nkyel.ai')
    );
  }, [user]);

  const currentContext = useMemo<'global' | 'conversation' | 'workspace' | 'settings' | 'admin'>(() => {
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/workspace')) return 'workspace';
    if (pathname.startsWith('/chat')) return 'conversation';
    if (pathname.startsWith('/settings')) return 'settings';
    return 'global';
  }, [pathname]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Command Handlers with REAL Backend Execution ──────────
  const handleSetTheme = useCallback(async (themeKey: any, themeLabel: string) => {
    setTheme(themeKey);
    await updatePreferences({ theme: themeKey });
    showToast(`Thème changé : ${themeLabel}`);
  }, [setTheme, updatePreferences]);

  const handleSetLocale = useCallback(async (newLocale: string, label: string) => {
    setUiLocale(newLocale);
    await updatePreferences({ uiLocale: newLocale });
    showToast(`Langue d'interface : ${label}`);
  }, [setUiLocale, updatePreferences]);

  const handleSetAutonomy = useCallback(async (level: any, label: string) => {
    await updatePreferences({ autonomyLevel: level });
    showToast(`Autonomie réglée sur : ${label}`);
  }, [updatePreferences]);

  const handleToggleMemory = useCallback(async () => {
    const next = !memoryEnabled;
    await updatePreferences({ memoryEnabled: next });
    showToast(`Mémoire DeerMem : ${next ? 'Activée' : 'Désactivée'}`);
  }, [memoryEnabled, updatePreferences]);

  // ── Registered Commands Catalog ───────────────────────────
  const allCommands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // 1. Suggestions & Rapid Access
      {
        id: 'new-mission',
        label: 'Nouvelle mission agentique',
        category: 'Suggestions',
        icon: Plus,
        shortcut: '⌘N',
        keywords: ['mission', 'new', 'prompt', 'creer', 'commencer', 'start'],
        handler: () => {
          router.push('/chat?new=true');
          setIsOpen(false);
        },
      },
      {
        id: 'open-vie',
        label: 'Ouvrir Ñkyel VIE (Studio d\'Artefacts)',
        category: 'Suggestions',
        icon: Graph,
        shortcut: '⌘V',
        keywords: ['vie', 'canvas', 'artefact', 'preview', 'studio', 'code'],
        handler: () => {
          router.push('/workspace');
          setIsOpen(false);
        },
      },
      {
        id: 'open-workgraph',
        label: 'Afficher le WorkGraph Interactif',
        category: 'Suggestions',
        icon: TreeStructure,
        shortcut: '⌘W',
        keywords: ['workgraph', 'graphe', 'arborescence', 'agents', 'noeuds'],
        handler: () => {
          router.push('/workspace?view=workgraph');
          setIsOpen(false);
        },
      },
      {
        id: 'open-memory',
        label: 'Consulter la Mémoire Souveraine DeerMem',
        category: 'Suggestions',
        icon: Brain,
        shortcut: '⌘M',
        keywords: ['memoire', 'memory', 'souvenirs', 'deermem', 'faits'],
        handler: () => {
          router.push('/memory');
          setIsOpen(false);
        },
      },
      {
        id: 'open-settings',
        label: 'Ouvrir les Paramètres (Apple × Geist)',
        category: 'Suggestions',
        icon: Gear,
        shortcut: '⌘,',
        keywords: ['parametres', 'settings', 'configuration', 'compte', 'preferences'],
        handler: () => {
          router.push('/settings');
          setIsOpen(false);
        },
      },

      {
        id: 'action-toggle-focus',
        label: 'Basculer le Mode Focus (Plein Écran Calme)',
        category: 'Actions & Missions',
        icon: Eye,
        shortcut: '⌘F',
        keywords: ['focus', 'calme', 'plein ecran', 'masquer panneaux'],
        handler: () => {
          toggleFocusMode();
          showToast('Mode Focus basculé');
          setIsOpen(false);
        },
      },
      {
        id: 'action-toggle-inspector',
        label: 'Afficher / Masquer l\'Inspecteur Contextuel (Sources / Tools / Run)',
        category: 'Actions & Missions',
        icon: GeistActivity,
        shortcut: '⌘I',
        keywords: ['contexte', 'inspector', 'sources', 'outils', 'tools', 'skills', 'mcp'],
        handler: () => {
          toggleRight();
          setIsOpen(false);
        },
      },
      {
        id: 'action-show-sources',
        label: 'Inspecter les Sources & Preuves de la Mission',
        category: 'Actions & Missions',
        icon: Globe,
        keywords: ['sources', 'preuves', 'citations', 'references'],
        handler: () => {
          setRightTab('sources');
          setIsOpen(false);
        },
      },

      // 2. Navigation
      {
        id: 'nav-welcome',
        label: 'Vitrine d\'Accueil Manus-Grade',
        category: 'Navigation',
        icon: Sparkle,
        keywords: ['accueil', 'welcome', 'vitrine', 'manus', 'gemini'],
        handler: () => {
          router.push('/welcome');
          setIsOpen(false);
        },
      },
      {
        id: 'nav-protocols',
        label: 'Observatoire des Protocoles (A2A, MCP, SSE)',
        category: 'Navigation',
        icon: Cpu,
        keywords: ['protocoles', 'a2a', 'mcp', 'sse', 'ag-ui'],
        handler: () => {
          router.push('/protocols');
          setIsOpen(false);
        },
      },
      {
        id: 'nav-scheduled',
        label: 'Missions Planifiées & Récurrentes',
        category: 'Navigation',
        icon: CalendarCheck,
        keywords: ['missions', 'planifiees', 'scheduled', 'cron', 'taches'],
        handler: () => {
          router.push('/scheduled');
          setIsOpen(false);
        },
      },

      // 3. Themes
      {
        id: 'theme-black-panther',
        label: 'Thème : Black Panther (Noir Absolu & Or)',
        category: 'Apparence & Thème',
        icon: Moon,
        keywords: ['theme', 'sombre', 'black', 'panther', 'dark'],
        handler: () => {
          handleSetTheme('black-panther', 'Black Panther');
          setIsOpen(false);
        },
      },
      {
        id: 'theme-nuit-lope',
        label: 'Thème : Nuit Lopé (Onyx & Émeraude)',
        category: 'Apparence & Thème',
        icon: Moon,
        keywords: ['theme', 'nuit', 'lope', 'emeraude', 'vert'],
        handler: () => {
          handleSetTheme('nuit-lope', 'Nuit Lopé');
          setIsOpen(false);
        },
      },
      {
        id: 'theme-aurore-ogoue',
        label: 'Thème : Aurore Ogooué (Apple Light Mode)',
        category: 'Apparence & Thème',
        icon: Sun,
        keywords: ['theme', 'clair', 'light', 'blanc', 'aurore'],
        handler: () => {
          handleSetTheme('aurore-ogoue', 'Aurore Ogooué');
          setIsOpen(false);
        },
      },

      // 4. Languages (BCP-47 Universal)
      {
        id: 'lang-fr-ga',
        label: 'Langue : Français (Gabon — fr-GA)',
        category: 'Langues & Région',
        icon: Globe,
        keywords: ['langue', 'francais', 'gabon', 'fr-ga'],
        handler: () => {
          handleSetLocale('fr-GA', 'Français (Gabon)');
          setIsOpen(false);
        },
      },
      {
        id: 'lang-fr-fr',
        label: 'Langue : Français (France — fr-FR)',
        category: 'Langues & Région',
        icon: Globe,
        keywords: ['langue', 'francais', 'france', 'fr-fr'],
        handler: () => {
          handleSetLocale('fr-FR', 'Français (France)');
          setIsOpen(false);
        },
      },
      {
        id: 'lang-en-us',
        label: 'Language: English (United States — en-US)',
        category: 'Langues & Région',
        icon: Globe,
        keywords: ['language', 'english', 'us', 'en-us'],
        handler: () => {
          handleSetLocale('en-US', 'English (US)');
          setIsOpen(false);
        },
      },
      {
        id: 'lang-en-gb',
        label: 'Language: English (United Kingdom — en-GB)',
        category: 'Langues & Région',
        icon: Globe,
        keywords: ['language', 'english', 'uk', 'en-gb'],
        handler: () => {
          handleSetLocale('en-GB', 'English (UK)');
          setIsOpen(false);
        },
      },

      // 5. Agent & Autonomy
      {
        id: 'autonomy-guided',
        label: 'Autonomie : Guidée (Confirmation pour chaque action)',
        category: 'Agent & Autonomie',
        icon: HandPointing,
        keywords: ['autonomie', 'guidee', 'manuel', 'controle'],
        handler: () => {
          handleSetAutonomy('guided', 'Guidée');
          setIsOpen(false);
        },
      },
      {
        id: 'autonomy-semi',
        label: 'Autonomie : Semi-Autonome (Recommandé)',
        category: 'Agent & Autonomie',
        icon: SlidersHorizontal,
        keywords: ['autonomie', 'semi', 'equilibre', 'standard'],
        handler: () => {
          handleSetAutonomy('semi_autonomous', 'Semi-Autonome');
          setIsOpen(false);
        },
      },
      {
        id: 'autonomy-full',
        label: 'Autonomie : Entièrement Autonome',
        category: 'Agent & Autonomie',
        icon: Lightning,
        keywords: ['autonomie', 'complete', 'full', 'auto'],
        handler: () => {
          handleSetAutonomy('fully_autonomous', 'Entièrement Autonome');
          setIsOpen(false);
        },
      },

      // 6. Memory & DeerMem
      {
        id: 'toggle-memory',
        label: 'Basculer l\'Extraction de Mémoire Automatique',
        category: 'Mémoire & Données',
        icon: Brain,
        keywords: ['memoire', 'toggle', 'desactiver', 'activer', 'deermem'],
        handler: () => {
          handleToggleMemory();
          setIsOpen(false);
        },
      },
    ];

    // 7. Admin Only commands
    if (isSuperAdmin) {
      items.push({
        id: 'admin-command-center',
        label: 'Ouvrir le Command Center d\'Administration',
        category: 'Admin',
        icon: ShieldCheck,
        shortcut: '⌘⇧A',
        keywords: ['admin', 'command', 'center', 'fournisseurs', 'audit', 'flags'],
        handler: () => {
          router.push('/admin');
          setIsOpen(false);
        },
      });
    }

    return items;
  }, [
    router,
    isSuperAdmin,
    handleSetTheme,
    handleSetLocale,
    handleSetAutonomy,
    handleToggleMemory,
  ]);

  // ── Keyboard Shortcut Listener ────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // ── Filtered Search Results ───────────────────────────────
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter((cmd) => {
      const matchLabel = cmd.label.toLowerCase().includes(q);
      const matchCategory = cmd.category.toLowerCase().includes(q);
      const matchKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(q));
      return matchLabel || matchCategory || matchKeywords;
    });
  }, [allCommands, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Arrow key navigation inside list
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].handler();
      }
    }
  };

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-[100] px-4 py-2.5 rounded-2xl bg-[var(--material-content-raised)] border border-[#D5AE57]/50 text-xs text-[var(--text-primary)] shadow-[var(--shadow-floating)] flex items-center gap-2"
          >
            <CheckCircle size={16} weight="fill" className="text-[#D5AE57]" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Universal Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[90] flex items-start justify-center pt-16 sm:pt-24 p-3 sm:p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl rounded-3xl bg-[var(--material-glass-floating)] border border-[var(--border-strong)] shadow-[var(--shadow-modal)] backdrop-blur-3xl overflow-hidden flex flex-col max-h-[82vh]"
            >
              {/* Search Bar Header */}
              <div className="p-3.5 sm:p-4 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--surface)]">
                <MagnifyingGlass size={18} className="text-[#D5AE57] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Que souhaitez-vous faire ? (ex: nouvelle mission, dark, langue, mémoire...)"
                  className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] placeholder:opacity-60 focus:outline-none font-sans"
                />
                <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[10px] text-[var(--text-secondary)] font-mono">
                  ESC
                </kbd>
              </div>

              {/* Filtered Commands List */}
              <div
                ref={listRef}
                className="p-2 overflow-y-auto space-y-1 custom-scrollbar max-h-[60vh]"
              >
                {filteredCommands.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[var(--text-tertiary)] font-normal">
                    Aucune commande trouvée pour « {query} ».
                  </div>
                ) : (
                  filteredCommands.map((cmd, idx) => {
                    const Icon = cmd.icon;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => cmd.handler()}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all ${
                          isSelected
                            ? 'bg-[#D5AE57]/15 border border-[#D5AE57]/40 text-[var(--text-primary)] shadow-sm'
                            : 'hover:bg-[var(--hover)] border border-transparent text-[var(--text-secondary)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#D5AE57] text-black shadow-md'
                                : 'bg-[var(--surface-raised)] text-[var(--text-secondary)]'
                            }`}
                          >
                            <Icon size={16} weight={isSelected ? 'bold' : 'regular'} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-xs font-semibold truncate ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
                              {cmd.label}
                            </div>
                            <div className="text-[10px] text-[var(--text-tertiary)] truncate">
                              {cmd.category}
                            </div>
                          </div>
                        </div>

                        {cmd.shortcut && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-tertiary)] shrink-0 ml-2">
                            {cmd.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer Guidance */}
              <div className="p-2.5 px-4 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.2 rounded bg-[var(--surface-raised)] border border-[var(--border)] font-mono text-[10px]">↑</kbd>
                    <kbd className="px-1.5 py-0.2 rounded bg-[var(--surface-raised)] border border-[var(--border)] font-mono text-[10px]">↓</kbd>
                    <span>Naviguer</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.2 rounded bg-[var(--surface-raised)] border border-[var(--border)] font-mono text-[10px]">↵</kbd>
                    <span>Exécuter</span>
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#D5AE57]">Ñkyel Universal Action Layer</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
