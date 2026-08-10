/* GabomaGPT · admin/web-search/page.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Configuration Recherche Web — Miroir Open WebUI Web Search */
'use client';

import { useState } from 'react';
import { Save, Globe, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SEARCH_ENGINES = [
  { id: 'tavily', name: 'Tavily', needsKey: true },
  { id: 'duckduckgo', name: 'DuckDuckGo', needsKey: false },
  { id: 'searxng', name: 'SearXNG', needsKey: false },
  { id: 'google_pse', name: 'Google PSE', needsKey: true },
  { id: 'bing', name: 'Bing', needsKey: true },
  { id: 'brave', name: 'Brave Search', needsKey: true },
  { id: 'serper', name: 'Serper', needsKey: true },
  { id: 'serpapi', name: 'SerpAPI', needsKey: true },
  { id: 'exa', name: 'Exa', needsKey: true },
  { id: 'perplexity', name: 'Perplexity', needsKey: true },
  { id: 'jina', name: 'Jina', needsKey: true },
  { id: 'firecrawl', name: 'Firecrawl', needsKey: true },
];

const WEB_LOADER_ENGINES = [
  { id: 'playwright', name: 'Playwright' },
  { id: 'firecrawl', name: 'Firecrawl' },
  { id: 'tavily', name: 'Tavily Extract' },
];

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

export default function AdminWebSearchPage() {
  const [enabled, setEnabled] = useState(true);
  const [engine, setEngine] = useState('tavily');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [resultCount, setResultCount] = useState('5');
  const [concurrentRequests, setConcurrentRequests] = useState('10');
  const [domainFilter, setDomainFilter] = useState('');
  const [webLoader, setWebLoader] = useState('playwright');
  const [youtubeLanguage, setYoutubeLanguage] = useState('fr');

  const selectedEngine = SEARCH_ENGINES.find((e) => e.id === engine);

  const handleSave = () => {
    toast.success('Configuration Recherche Web sauvegardée');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Recherche Web</h2>
          <p className="text-sm text-[var(--text-tertiary)]">Configuration du moteur de recherche web pour le RAG</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-medium hover:opacity-90 transition-opacity">
          <Save size={14} />
          Sauvegarder
        </button>
      </div>

      {/* Toggle global */}
      <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
        <Toggle
          checked={enabled}
          onChange={setEnabled}
          label="Activer la recherche web"
          helper="Permet à GabomaGPT de rechercher des informations sur le web pour répondre aux questions"
        />
      </section>

      {enabled && (
        <>
          {/* Moteur de recherche */}
          <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Globe size={15} className="text-[var(--accent)]" />
              Moteur de recherche
            </h3>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Fournisseur</label>
              <select
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
              >
                {SEARCH_ENGINES.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            {selectedEngine?.needsKey && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Clé API {selectedEngine.name}</label>
                <p className="text-xs text-[var(--text-tertiary)]">Clé requise pour utiliser {selectedEngine.name}</p>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Clé API ${selectedEngine.name}...`}
                    className="w-full px-3 py-2 pr-10 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors font-mono"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/[0.06]"
                  >
                    {showKey ? <EyeOff size={14} className="text-[var(--text-tertiary)]" /> : <Eye size={14} className="text-[var(--text-tertiary)]" />}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Nombre de résultats</label>
                <input
                  type="number"
                  value={resultCount}
                  onChange={(e) => setResultCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Requêtes simultanées</label>
                <input
                  type="number"
                  value={concurrentRequests}
                  onChange={(e) => setConcurrentRequests(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Filtre de domaines</label>
              <p className="text-xs text-[var(--text-tertiary)]">Domaines autorisés, séparés par des virgules (vide = tous)</p>
              <input
                type="text"
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                placeholder="gabon.ga, assemblee-nationale.ga, legabon.net"
                className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </section>

          {/* Web Loader */}
          <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Chargeur de pages web</h3>
            <p className="text-xs text-[var(--text-tertiary)]">Moteur utilisé pour extraire le contenu des pages web</p>
            <select
              value={webLoader}
              onChange={(e) => setWebLoader(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
            >
              {WEB_LOADER_ENGINES.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Langue YouTube</label>
              <p className="text-xs text-[var(--text-tertiary)]">Langue pour l&apos;extraction de sous-titres YouTube</p>
              <input
                type="text"
                value={youtubeLanguage}
                onChange={(e) => setYoutubeLanguage(e.target.value)}
                placeholder="fr"
                className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
