/* GabomaGPT · settings/page.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Page paramètres complète — Apparence, GabomaGPT, Chat, Audio, À propos */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Palette, MessageSquare, Sparkles, Volume2, Info,
  Check, Globe, Type, Sun, Moon
} from 'lucide-react';
import {
  useSettingsStore,
  THEMES, ACCENTS,
  type ThemeKey, type AccentKey, type FontSize,
} from '@/stores/settings.store';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { useClerk } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

type TabKey = 'apparence' | 'gabomagpt' | 'chat' | 'audio' | 'about';

const TABS: { key: TabKey; label: string; icon: typeof Palette }[] = [
  { key: 'apparence', label: 'Apparence', icon: Palette },
  { key: 'gabomagpt', label: 'GabomaGPT', icon: Sparkles },
  { key: 'chat', label: 'Chat', icon: MessageSquare },
  { key: 'audio', label: 'Audio', icon: Volume2 },
  { key: 'about', label: 'À propos', icon: Info },
];

const FONT_SIZES: { key: FontSize; label: string }[] = [
  { key: 'small', label: 'Petit' },
  { key: 'normal', label: 'Normal' },
  { key: 'large', label: 'Grand' },
];

const LANGUAGES = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'fang', name: 'Fang' },
  { code: 'punu', name: 'Punu' },
  { code: 'myene', name: 'Myène' },
  { code: 'nzebi', name: 'Nzebi' },
];

const GREETING_STYLES = [
  { key: 'formel' as const, label: 'Formel', example: 'Bonjour Daniel' },
  { key: 'gabonais' as const, label: 'Gabonais', example: 'Mbolo ! Bonjour Daniel' },
  { key: 'argot' as const, label: 'Argot urbain', example: 'Wesh Daniel, on gère ?' },
];

/* ── Toggle Switch réutilisable ── */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button onClick={onChange} className="flex items-center justify-between w-full py-3 group">
      <span className="text-sm text-[var(--text-primary)]">{label}</span>
      <div className={cn(
        'w-10 h-6 rounded-full transition-colors relative',
        checked ? 'bg-[var(--accent)]' : 'bg-[var(--bg-overlay)]'
      )}>
        <div className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-1'
        )} />
      </div>
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('apparence');
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { signOut } = useClerk();

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

  const {
    theme, accent, fontSize, greetingStyle, language,
    showThinking, streamResponses, showCopyButton, codeSyntaxHighlight, blackPantherMode,
    setTheme, setAccent, setFontSize, setGreetingStyle, setLanguage,
    toggleThinking, toggleStream, toggleCopy, toggleSyntax, toggleBlackPanther,
  } = useSettingsStore();

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

      <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] navbar-glass shrink-0">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-[var(--accent-10)] transition-colors"
        >
          <ArrowLeft size={18} className="text-[var(--text-secondary)]" />
        </button>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">L'Antre</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar des onglets */}
        <div className="w-48 shrink-0 border-r border-[var(--border)] py-2 overflow-y-auto hidden sm:block">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors',
                activeTab === tab.key
                  ? 'bg-[var(--accent-10)] text-[var(--accent)] font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-white/[0.04]'
              )}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}

          {/* Déconnexion & Suppression */}
          {user && (
            <div className="mt-4 border-t border-[var(--border)] pt-4 space-y-1">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                Déconnexion
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 w-full px-4 py-2 rounded-xl text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                Supprimer le compte
              </button>
            </div>
          )}
        </div>

        {/* Onglets mobile */}
        <div className="sm:hidden flex overflow-x-auto border-b border-[var(--border)] shrink-0 px-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--text-tertiary)]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl mx-auto space-y-8">

            {/* ═══════ APPARENCE ═══════ */}
            {activeTab === 'apparence' && (
              <>
                {/* Thèmes */}
                <section>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <Moon size={16} className="text-[var(--accent)]" />
                    Thème
                  </h2>
                  <div className="space-y-1.5">
                    {THEMES.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setTheme(t.key)}
                        className={cn(
                          'flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all',
                          theme === t.key
                            ? 'border-[var(--accent-35)] bg-[var(--accent-10)]'
                            : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                        )}
                      >
                        <div
                          className="w-5 h-5 rounded-full border-2 shrink-0"
                          style={{
                            background: t.meta,
                            borderColor: theme === t.key ? 'var(--accent)' : 'var(--border)',
                          }}
                        />
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-[var(--text-primary)]">{t.name}</div>
                          <div className="text-xs text-[var(--text-tertiary)]">{t.description}</div>
                        </div>
                        {theme === t.key && <Check size={16} className="text-[var(--accent)]" />}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Accents — 5 pétales */}
                <section>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <Palette size={16} className="text-[var(--accent)]" />
                    Couleur d&apos;accentuation
                  </h2>
                  <p className="text-xs text-[var(--text-tertiary)] mb-3">Les 5 pétales du logo GabomaGPT</p>
                  <div className="space-y-1.5">
                    {ACCENTS.map((a) => (
                      <button
                        key={a.key}
                        onClick={() => setAccent(a.key)}
                        className={cn(
                          'flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border transition-all',
                          accent === a.key
                            ? 'border-[var(--accent-35)] bg-[var(--accent-10)]'
                            : 'border-transparent hover:bg-white/[0.04]'
                        )}
                      >
                        <span
                          className={cn(
                            'w-4 h-4 rounded-full transition-transform',
                            accent === a.key && 'scale-125 ring-2 ring-offset-1 ring-offset-transparent'
                          )}
                          style={{
                            background: a.color,
                            boxShadow: accent === a.key ? `0 0 8px ${a.color}60` : 'none',
                          }}
                        />
                        <span className={cn(
                          'text-sm',
                          accent === a.key ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                        )}>
                          {a.name}
                        </span>
                        <span className="ml-auto font-mono text-[10px] text-[var(--text-tertiary)]">
                          {a.color}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Taille de police */}
                <section>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <Type size={16} className="text-[var(--accent)]" />
                    Taille du texte
                  </h2>
                  <div className="flex gap-2">
                    {FONT_SIZES.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setFontSize(f.key)}
                        className={cn(
                          'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border',
                          fontSize === f.key
                            ? 'bg-[var(--accent-10)] border-[var(--accent-35)] text-[var(--accent)]'
                            : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-white/[0.04]'
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* ═══════ GABOMAGPT ═══════ */}
            {activeTab === 'gabomagpt' && (
              <>
                {/* Black Panther */}
                <section>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <Sparkles size={16} className="text-[#D4A417]" />
                    Mode Black Panther
                  </h2>
                  <Toggle checked={blackPantherMode} onChange={toggleBlackPanther} label="Activer le mode agent autonome" />
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    Active le thème Panther Gold avec workspace split-view et raisonnement Zion-Core visible.
                  </p>
                </section>

                {/* Langue */}
                <section>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <Globe size={16} className="text-[var(--accent)]" />
                    Langue
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => setLanguage(l.code)}
                        className={cn(
                          'px-4 py-2.5 rounded-xl text-sm font-medium transition-all border',
                          language === l.code
                            ? 'bg-[var(--accent-10)] border-[var(--accent-35)] text-[var(--accent)]'
                            : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-white/[0.04]'
                        )}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Style de salutation */}
                <section>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Style de salutation</h2>
                  <div className="space-y-1.5">
                    {GREETING_STYLES.map((g) => (
                      <button
                        key={g.key}
                        onClick={() => setGreetingStyle(g.key)}
                        className={cn(
                          'flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all',
                          greetingStyle === g.key
                            ? 'border-[var(--accent-35)] bg-[var(--accent-10)]'
                            : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                        )}
                      >
                        <div className="text-left">
                          <div className="text-sm font-medium text-[var(--text-primary)]">{g.label}</div>
                          <div className="text-xs text-[var(--text-tertiary)] italic">{g.example}</div>
                        </div>
                        {greetingStyle === g.key && <Check size={16} className="text-[var(--accent)]" />}
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* ═══════ CHAT ═══════ */}
            {activeTab === 'chat' && (
              <>
                <section className="space-y-0 divide-y divide-[var(--border)]">
                  <Toggle checked={showThinking} onChange={toggleThinking} label="Afficher le processus de réflexion" />
                  <Toggle checked={streamResponses} onChange={toggleStream} label="Réponses en streaming" />
                  <Toggle checked={showCopyButton} onChange={toggleCopy} label="Bouton copier sur les messages" />
                  <Toggle checked={codeSyntaxHighlight} onChange={toggleSyntax} label="Coloration syntaxique du code" />
                </section>
              </>
            )}

            {/* ═══════ AUDIO ═══════ */}
            {activeTab === 'audio' && (
              <section>
                <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Entrée vocale</h2>
                <p className="text-sm text-[var(--text-tertiary)]">
                  La reconnaissance vocale sera disponible dans une prochaine mise à jour.
                </p>
                <div className="mt-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                  <div className="text-xs text-[var(--text-tertiary)]">Langue vocale</div>
                  <div className="text-sm text-[var(--text-primary)] mt-1">Français (France)</div>
                </div>
              </section>
            )}

            {/* ═══════ À PROPOS ═══════ */}
            {activeTab === 'about' && (
              <section className="space-y-4">
                <div className="flex items-center gap-4">
                  <img src="/gabomagpt-logo.jpeg" alt="GabomaGPT" className="w-16 h-16 rounded-2xl object-cover" />
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">GabomaGPT</h2>
                    <p className="text-sm text-[var(--text-secondary)]">v2.0 · Zion-Core Obsidian</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">Version</span>
                    <span className="text-[var(--text-primary)] font-mono">2.0.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">Design System</span>
                    <span className="text-[var(--text-primary)]">Zion-Core Obsidian</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">Stack</span>
                    <span className="text-[var(--text-primary)]">Next.js 15 + Tailwind</span>
                  </div>
                </div>

                <div className="text-center pt-4 space-y-1">
                  <p className="text-sm text-[var(--text-secondary)]">
                    By SmartANDJ AI Technologies
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Fondateur : AKARE NTOUTOUME Daniel Jonathan (A·N·D·J)
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Libreville, Gabon
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
