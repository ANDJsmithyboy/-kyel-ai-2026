/* GabomaGPT · admin/interface/page.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Paramètres Interface — Miroir Open WebUI Interface Settings */
'use client';

import { useState } from 'react';
import { Save, MessageSquare, Tag, Sparkles, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function Toggle({ checked, onChange, label, helper }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; helper?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <div className="text-sm font-medium text-[var(--text-primary)]">{label}</div>
        {helper && <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{helper}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-5.5 rounded-full transition-colors shrink-0',
          checked ? 'bg-[var(--accent)]' : 'bg-[var(--bg-overlay)]'
        )}
      >
        <span className={cn(
          'absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform shadow-sm',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )} />
      </button>
    </div>
  );
}

export default function AdminInterfacePage() {
  const [defaultSystemPrompt, setDefaultSystemPrompt] = useState(
    'Tu es GabomaGPT, une intelligence artificielle souveraine du Gabon. Tu reponds en francais avec precision et bienveillance.'
  );
  const [enableTitleGeneration, setEnableTitleGeneration] = useState(true);
  const [enableAutoTags, setEnableAutoTags] = useState(true);
  const [enableBanners, setEnableBanners] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [suggestions, setSuggestions] = useState([
    'Explique-moi la Constitution du Gabon',
    'Redige un email professionnel en francais',
    'Aide-moi avec du code Python',
    'Raconte-moi l\'histoire du Gabon',
  ]);
  const [newSuggestion, setNewSuggestion] = useState('');

  const addSuggestion = () => {
    if (newSuggestion.trim()) {
      setSuggestions([...suggestions, newSuggestion.trim()]);
      setNewSuggestion('');
    }
  };

  const removeSuggestion = (idx: number) => {
    setSuggestions(suggestions.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    toast.success('Parametres d\'interface sauvegardes');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Interface</h2>
          <p className="text-sm text-[var(--text-tertiary)]">Personnalisation de l&apos;interface utilisateur</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-medium hover:opacity-90 transition-opacity">
          <Save size={14} />
          Sauvegarder
        </button>
      </div>

      {/* Prompt systeme */}
      <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <MessageSquare size={15} className="text-[var(--accent)]" />
          Prompt systeme par defaut
        </h3>
        <p className="text-xs text-[var(--text-tertiary)]">Ce prompt sera ajoute au debut de chaque conversation</p>
        <textarea
          value={defaultSystemPrompt}
          onChange={(e) => setDefaultSystemPrompt(e.target.value)}
          rows={4}
          className="w-full px-3 py-2.5 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors resize-none"
        />
      </section>

      {/* Taches automatiques */}
      <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-1">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-2">
          <Sparkles size={15} className="text-[var(--accent)]" />
          Taches automatiques
        </h3>
        <Toggle
          checked={enableTitleGeneration}
          onChange={setEnableTitleGeneration}
          label="Generation automatique de titres"
          helper="GabomaGPT genere automatiquement un titre pour chaque conversation"
        />
        <Toggle
          checked={enableAutoTags}
          onChange={setEnableAutoTags}
          label="Tags automatiques"
          helper="Ajouter automatiquement des tags aux conversations"
        />
      </section>

      {/* Bannieres */}
      <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <AlertTriangle size={15} className="text-[var(--accent)]" />
          Bannieres
        </h3>
        <Toggle
          checked={enableBanners}
          onChange={setEnableBanners}
          label="Afficher une banniere"
          helper="Affiche un message en haut de l'interface pour tous les utilisateurs"
        />
        {enableBanners && (
          <input
            type="text"
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
            placeholder="Message de la banniere..."
            className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        )}
      </section>

      {/* Suggestions de prompts */}
      <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Tag size={15} className="text-[var(--accent)]" />
          Suggestions de prompts
        </h3>
        <p className="text-xs text-[var(--text-tertiary)]">Propositions affichees sur la page de nouvelle conversation</p>

        <div className="space-y-2">
          {suggestions.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
              <span className="flex-1 text-sm text-[var(--text-primary)]">{s}</span>
              <button onClick={() => removeSuggestion(idx)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors">
                Retirer
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newSuggestion}
            onChange={(e) => setNewSuggestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSuggestion()}
            placeholder="Ajouter une suggestion..."
            className="flex-1 px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button onClick={addSuggestion} className="px-4 py-2 rounded-xl bg-[var(--accent-10)] text-[var(--accent)] text-sm font-medium hover:opacity-80 transition-opacity">
            Ajouter
          </button>
        </div>
      </section>
    </div>
  );
}
