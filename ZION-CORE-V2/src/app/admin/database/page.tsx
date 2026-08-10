/* GabomaGPT · admin/database/page.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Base de donnees — Export/Import/Backup — Miroir Open WebUI Database */
'use client';

import { useState } from 'react';
import { Database, Download, Upload, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';

export default function AdminDatabasePage() {
  const { user } = useAuthStore();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  const handleExportChats = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/v1/chats/export', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error('Erreur export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gabomagpt-chats-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export des conversations termine');
    } catch {
      toast.error('Erreur lors de l\'export des conversations');
    } finally {
      setExporting(false);
    }
  };

  const handleExportUsers = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/v1/users/export', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error('Erreur export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gabomagpt-users-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export des utilisateurs termine');
    } catch {
      toast.error('Erreur lors de l\'export des utilisateurs');
    } finally {
      setExporting(false);
    }
  };

  const handleImportChats = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setImporting(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/v1/chats/import', {
          method: 'POST',
          headers: { Authorization: `Bearer ${user?.token}` },
          body: formData,
        });
        if (!res.ok) throw new Error('Erreur import');
        toast.success('Import des conversations termine');
      } catch {
        toast.error('Erreur lors de l\'import');
      } finally {
        setImporting(false);
      }
    };
    input.click();
  };

  const handleResetDB = async () => {
    if (resetConfirmText !== 'SUPPRIMER') return;
    try {
      toast.success('Reinitialisation demandee (fonctionnalite backend requise)');
      setShowResetConfirm(false);
      setResetConfirmText('');
    } catch {
      toast.error('Erreur lors de la reinitialisation');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Base de donnees</h2>
        <p className="text-sm text-[var(--text-tertiary)]">Export, import et gestion de la base de donnees GabomaGPT</p>
      </div>

      {/* Export */}
      <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Download size={15} className="text-[var(--accent)]" />
          Exporter les donnees
        </h3>
        <p className="text-xs text-[var(--text-tertiary)]">Telecharger une sauvegarde de vos donnees au format JSON</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportChats}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent-30)] transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            {exporting ? 'Export en cours...' : 'Exporter les conversations'}
          </button>
          <button
            onClick={handleExportUsers}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent-30)] transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            {exporting ? 'Export en cours...' : 'Exporter les utilisateurs'}
          </button>
        </div>
      </section>

      {/* Import */}
      <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Upload size={15} className="text-[var(--accent)]" />
          Importer des donnees
        </h3>
        <p className="text-xs text-[var(--text-tertiary)]">Restaurer des donnees depuis une sauvegarde JSON</p>

        <button
          onClick={handleImportChats}
          disabled={importing}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent-30)] transition-colors disabled:opacity-50"
        >
          <Upload size={14} />
          {importing ? 'Import en cours...' : 'Importer des conversations (.json)'}
        </button>
      </section>

      {/* Zone dangereuse */}
      <section className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-4">
        <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
          <AlertTriangle size={15} />
          Zone dangereuse
        </h3>
        <p className="text-xs text-[var(--text-tertiary)]">Ces actions sont irreversibles. Procedez avec precaution.</p>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 size={14} />
            Reinitialiser la base de donnees
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3">
            <p className="text-sm text-red-300">
              Tapez <span className="font-mono font-bold">SUPPRIMER</span> pour confirmer la reinitialisation complete.
            </p>
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-red-500/30 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-red-500 transition-colors font-mono"
            />
            <div className="flex gap-2">
              <button
                onClick={handleResetDB}
                disabled={resetConfirmText !== 'SUPPRIMER'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} />
                Confirmer la reinitialisation
              </button>
              <button
                onClick={() => { setShowResetConfirm(false); setResetConfirmText(''); }}
                className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-white/[0.04] transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
