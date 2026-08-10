/**
 * GabomaAI · Sidebar Complète
 * SmartANDJ AI Technologies
 * Gemini/Claude-style: IbogaAI toggle, stacked nav, L'Antre at bottom
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useSidebar } from '@/hooks/useSidebar';
import { useAuthStore } from '@/stores/auth.store';
import SidebarItem from '@/components/shell/SidebarItem';
import SidebarSection from '@/components/shell/SidebarSection';
import EnergyGauge from '@/components/shell/EnergyGauge';
import MeuteLinks from '@/components/shell/MeuteLinks';
import { NouvellePisteIcon, RenduIcon, ProjetIcon } from '@/components/icons/GabomaIcons';
import { EnPisteIcon } from '@/components/icons/EnPisteIcon';
import { IbogaAiIcon } from '@/components/icons/IbogaAiIcon';
import { Gear, SignOut, Trash, CaretUp, CaretDown, CheckCircle, Shield, Link, Robot, Crosshair, Broadcast, Lightning, LockKey, Desktop, UserCircle, Circle } from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';

export default function Sidebar() {
  const router = useRouter();
  const { signOut } = useClerk();
  const logout = useAuthStore((s: any) => s.logout);
  const { isOpen, close, isCollapsed } = useSidebar();
  const [serverLatency, setServerLatency] = useState<number | null>(null);
  
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue.';
      setDeleteError(message);
      setDeleteLoading(false);
    }
  };

  const [isAntreOpen, setIsAntreOpen] = useState(false);

  const [loxoWeb, setLoxoWeb] = useState(true);
  const [loxoRag, setLoxoRag] = useState(false);
  const [modeGris, setModeGris] = useState(false);
  const [modeOmbre, setModeOmbre] = useState(false);
  const [coffreFort, setCoffreFort] = useState(true);

  useEffect(() => {
    const t0 = Date.now();
    fetch('/api/health').then(() => setServerLatency(Date.now() - t0)).catch(() => setServerLatency(null));
  }, []);

  const sidebarContent = (
    <div
      className="flex flex-col h-full overflow-hidden w-[260px] z-40"
      style={{ background: 'var(--bg-elevated)', borderRight: '1px solid var(--border)' }}
    >
      {/* ── Header: Logo GabomaAI ── */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-2.5">
        <Image
          src="/gaboma-logo.png"
          alt="Gaboma AI"
          width={28}
          height={28}
          className="rounded-lg flex-shrink-0"
        />
        <span
          className="text-[15px] font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Gaboma
        </span>
      </div>

      {/* ── Nouvelle Piste (CTA) ── */}
      <div className="px-3 pb-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="flex items-center gap-2.5 w-full py-2.5 px-3 rounded-xl text-[13px] font-semibold bg-[var(--accent-10)] border border-[var(--border)] text-[var(--accent)] transition-colors hover:bg-[var(--accent-20)]"
        >
          <NouvellePisteIcon className="w-4 h-4" />
          Nouvelle Piste
        </motion.button>
      </div>

      {/* ── Primary Nav — stacked vertically ── */}
      <div className="px-2 pb-2 space-y-0.5">
        <SidebarItem label="Projet" icon={<ProjetIcon className="w-4 h-4" />} />
        <SidebarItem label="Le Rendu" icon={<RenduIcon className="w-4 h-4" />} />
        <SidebarItem label="En Piste" icon={<EnPisteIcon className="w-4 h-4" />} active />
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {/* EN PISTE — Recent conversations */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
            Récentes
          </p>
        </div>
        <div className="px-2 space-y-0.5">
          <SidebarItem label="Mission Libreville 2026" icon="·" active />
          <SidebarItem label="Analyse contrat SOBRAGA" icon="·" />
          <SidebarItem label="Rapport ciment Gabon" icon="·" />
          <SidebarItem label="Voir toutes les pistes →" onClick={() => {}} />
        </div>

        <div className="my-3 mx-4 border-t border-[var(--border)]" />

        {/* ÉNERGIE QUOTIDIENNE */}
        <EnergyGauge used={650} total={1000} />

        {/* ALIMENTER LA MEUTE */}
        <div className="px-4 pb-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-[12px] font-semibold bg-[var(--accent-06)] border border-[var(--border)] text-[var(--accent)] hover:bg-[var(--accent-10)] transition-colors"
          >
            ⚡ ALIMENTER LA MEUTE
          </motion.button>
        </div>

        <div className="my-1 mx-4 border-t border-[var(--border)]" />

        {/* LA MEUTE — Social links (Phosphor icons only) */}
        <MeuteLinks />
      </div>

      {/* ══════════════════════════════════════════
         L'ANTRE — Floating Panel — Opens UPWARD (Gemini Style)
         ══════════════════════════════════════════ */}
      <div className="p-2 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
        <DropdownMenu open={isAntreOpen} onOpenChange={setIsAntreOpen}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-[var(--accent-06)] text-[13px] font-medium text-[var(--text-secondary)] transition-colors">
              <Gear size={16} weight="thin" />
              <span>L'Antre</span>
              {isAntreOpen ? <CaretDown size={14} className="ml-auto opacity-50" /> : <CaretUp size={14} className="ml-auto opacity-50" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-[244px] bg-[var(--bg-elevated)] border-[var(--border)] rounded-xl p-1.5 shadow-2xl"
          >
            <DropdownMenuLabel className="text-[11px] text-[var(--text-tertiary)] font-normal px-2 py-1 truncate">
              cadre.gaboma@gabon.ga
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* VECTEURS */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest px-2 pt-2 pb-1">Vecteurs</DropdownMenuLabel>
              <DropdownMenuItem className="text-[12px] text-[var(--accent)] font-semibold flex items-center gap-2">
                <Lightning size={14} /> Vecteur de Force AURATA
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[12px] text-[var(--text-secondary)] flex items-center gap-2">
                <Broadcast size={14} /> SONAR
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[12px] text-[var(--text-secondary)] flex items-center gap-2">
                <Desktop size={14} /> ONYX
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[12px] text-[var(--text-secondary)] flex items-center gap-2">
                <Circle size={14} /> BLACK P.
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {/* TRAQUE */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest px-2 pt-2 pb-1">Traque</DropdownMenuLabel>
              <DropdownMenuItem className="text-[12px] text-[var(--text-secondary)] flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2"><Crosshair size={14} /> Radar WANDANA</div>
                {loxoWeb && <CheckCircle size={14} className="text-[var(--color-success)]" weight="fill" />}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-[12px] text-[var(--text-secondary)] flex items-center gap-2">
                  <Robot size={14} /> Invoquer WANDANA
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem className="text-[12px] text-[var(--text-secondary)]">Agent RAG</DropdownMenuItem>
                  <DropdownMenuItem className="text-[12px] text-[var(--text-secondary)]">Agent Web</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {/* SOUVERAINETÉ */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest px-2 pt-2 pb-1">Souveraineté</DropdownMenuLabel>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-[12px] text-[var(--text-secondary)] flex items-center gap-2">
                  <Shield size={14} /> MODE GRIS 🌿
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem className="text-[12px] text-[var(--text-secondary)]">Mode Ombre</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem className="text-[12px] text-[var(--text-secondary)] flex items-center gap-2">
                <LockKey size={14} /> Coffre-Fort
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {/* ADMINISTRATION */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-widest px-2 pt-2 pb-1">Administration</DropdownMenuLabel>
              <DropdownMenuItem className="text-[12px] text-[var(--text-secondary)] flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2"><Shield size={14} /> Pacte Politique</div>
                <span className="text-[9px] bg-[var(--accent-10)] text-[var(--accent)] rounded px-1">Configuré</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[12px] text-[var(--text-secondary)] flex items-center gap-2 justify-between cursor-pointer" onClick={() => router.push('/profile')}>
                <div className="flex items-center gap-2"><UserCircle size={14} /> Profil Cadre</div>
                <Link size={12} className="opacity-50" />
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[12px] text-[var(--text-secondary)] flex items-center gap-2 justify-between cursor-pointer" onClick={() => router.push('/subscription')}>
                <div className="flex items-center gap-2"><Desktop size={14} /> Pacte de Chasse</div>
                <Link size={12} className="opacity-50" />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {/* LOGOUT / DELETE */}
            <DropdownMenuItem className="text-[12px] text-[var(--text-secondary)] flex items-center gap-2 cursor-pointer hover:!bg-[var(--accent-10)] hover:!text-[var(--text-primary)]" onClick={handleSignOut}>
              <SignOut size={14} /> Se déconnecter
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[12px] text-[var(--color-error)] flex items-center gap-2 cursor-pointer hover:!bg-[rgba(239,68,68,0.1)] hover:!text-[#f87171]" onClick={() => setShowDeleteModal(true)}>
              <Trash size={14} /> Supprimer le compte
            </DropdownMenuItem>

            {/* NODE STATUS */}
            <div className="px-3 py-2 mt-1 border-t border-[var(--border)]">
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] inline-block" />
                NODE: LIBREVILLE-S-01 · En ligne {serverLatency !== null && `· ${serverLatency}ms`}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-2" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-[10px] text-center tracking-widest font-semibold uppercase text-[var(--text-tertiary)]">
          BY ANDJ • SMARTANDJ AI TECH
        </p>
      </div>
    </div>
  );

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
              style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[var(--color-error)]" style={{ boxShadow: '0 0 10px var(--color-error)' }} />
              <h3 className="text-[16px] font-bold flex items-center gap-2 text-[var(--text-primary)]">
                <span>⚠️</span> Suppression Définitive
              </h3>
              <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
                Cette action est <strong className="text-[var(--color-error)]">irréversible</strong>. Votre Profil Cadre, vos conversations En Piste, et votre historique seront définitivement effacés de GabomaAI.
              </p>
              <p className="text-[12px] italic p-2.5 rounded-lg bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.1)] text-[var(--text-tertiary)]">
                Pour valider, veuillez saisir <span className="font-mono select-all text-[var(--text-primary)]">SUPPRIMER</span> ci-dessous :
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full px-3 py-2 text-sm rounded-xl outline-none transition-colors bg-[var(--accent-06)] border border-[var(--border)] text-[var(--text-primary)]"
              />
              {deleteError && (
                <p className="text-[11px] font-semibold text-[var(--color-error)]">{deleteError}</p>
              )}
              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteError(''); }}
                  className="flex-1 py-2 rounded-xl text-[12px] font-semibold transition-colors bg-[var(--accent-06)] border border-[var(--border)] text-[var(--text-secondary)]"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmText !== 'SUPPRIMER' || deleteLoading}
                  onClick={handleDeleteAccount}
                  className="flex-1 py-2 rounded-xl text-[12px] font-semibold transition-all"
                  style={{ 
                    background: deleteConfirmText === 'SUPPRIMER' && !deleteLoading ? 'var(--color-error)' : 'rgba(220,38,38,0.3)',
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

      {/* Desktop */}
      <div 
        className="hidden lg:flex flex-shrink-0 transition-all duration-300 ease-in-out"
        style={{ width: isCollapsed ? 0 : 260, overflow: 'hidden' }}
      >
        <div style={{ width: 260 }}>
          {sidebarContent}
        </div>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={close}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Toggle Row ── */
function ToggleRow({ label, active, onToggle, pulse }: { label: string; active: boolean; onToggle: () => void; pulse?: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full px-1 py-1.5 text-[12px] group text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
    >
      <span className="font-medium">{label}</span>
      <motion.div
        className="relative w-8 h-4 rounded-full"
        style={{
          background: active ? 'rgba(31,157,107,0.25)' : 'var(--accent-06)',
          border: `1px solid ${active ? 'rgba(31,157,107,0.4)' : 'var(--border)'}`,
        }}
        animate={pulse && active ? { boxShadow: ['0 0 0px rgba(31,157,107,0.3)', '0 0 8px rgba(31,157,107,0.5)', '0 0 0px rgba(31,157,107,0.3)'] } : {}}
        transition={pulse ? { duration: 2, repeat: Infinity } : {}}
      >
        <motion.div
          className="absolute top-[1.5px] w-3 h-3 rounded-full"
          style={{ background: active ? 'var(--color-success)' : 'var(--text-tertiary)' }}
          animate={{ left: active ? 16 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.div>
    </button>
  );
}
