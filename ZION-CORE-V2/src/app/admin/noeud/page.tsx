/* GabomaGPT · admin/noeud/page.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Connexions API — Gestion des fournisseurs externes (Alibaba, DeepSeek, Groq, etc.)
   Miroir de la philosophie Open WebUI : les clés et URLs sont configurables ici,
   mais les utilisateurs finaux ne voient que les noms Gaboma Souverains. */
'use client';

import { useState } from 'react';
import { FloppyDisk, Plus, Trash, Eye, EyeSlash, Cloud, HardDrives, ArrowsClockwise } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Connection {
  id: string;
  providerId: string;
  url: string;
  key: string;
  label: string;
  enabled: boolean;
}

function Toggle({ checked, onChange, label, helper }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; helper?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <div className="text-[13px] font-semibold text-[var(--text-primary)] antialiased tracking-tight">{label}</div>
        {helper && <div className="text-[11px] font-medium text-[var(--text-muted)] mt-1 tracking-tight leading-relaxed">{helper}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-5.5 rounded-full transition-colors shrink-0 border',
          checked ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[var(--bg-card)] border-[var(--glass-border)]'
        )}
      >
        <span className={cn(
          'absolute top-[1.5px] w-4 h-4 rounded-full transition-transform shadow-sm',
          checked ? 'translate-x-5 bg-white' : 'translate-x-1 bg-[var(--text-muted)]'
        )} />
      </button>
    </div>
  );
}

export default function AdminNoeudPage() {
  const [enableExternal, setEnableExternal] = useState(true);
  const [enableOllama, setEnableOllama] = useState(false);
  const [enableDirect, setEnableDirect] = useState(false);

  const [connections, setConnections] = useState<Connection[]>([
    { id: '1', providerId: 'groq', url: 'https://api.groq.com/openai/v1', key: '', label: 'Groq (Sert de base à Onyx & Aurata)', enabled: true },
    { id: '2', providerId: 'anthropic', url: 'https://api.anthropic.com/v1', key: '', label: 'Anthropic (Sert de base à Black Panther)', enabled: true },
    { id: '3', providerId: 'deepseek', url: 'https://api.deepseek.com', key: '', label: 'DeepSeek (Sert de base à Sonar)', enabled: true },
    { id: '4', providerId: 'alibaba', url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', key: '', label: 'Alibaba Qwen (Sert de base à Nkyel)', enabled: false },
    { id: '5', providerId: 'moonshot', url: 'https://api.moonshot.cn/v1', key: '', label: 'Moonshot Kimi (Optionnel)', enabled: false },
    { id: '6', providerId: 'openai', url: 'https://api.openai.com/v1', key: '', label: 'OpenAI (Optionnel)', enabled: false },
  ]);

  const [ollamaUrls, setOllamaUrls] = useState<string[]>(['http://localhost:11434']);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const addConnection = () => {
    setConnections([...connections, {
      id: Date.now().toString(),
      providerId: 'custom',
      url: '',
      key: '',
      label: 'Nouvelle Connexion Custom',
      enabled: true,
    }]);
  };

  const removeConnection = (id: string) => {
    setConnections(connections.filter((c) => c.id !== id));
  };

  const updateConnection = (id: string, field: keyof Connection, value: string | boolean) => {
    setConnections(connections.map((c) =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleSave = () => {
    toast.success('Configuration réseau Nœud sauvegardée');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 antialiased animate-in fade-in duration-500">
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-[var(--glass-border)]">
        <div>
          <h2 className="text-xl font-display font-semibold text-[var(--text-primary)] tracking-tight">Nœud Libreville-S-01</h2>
          <p className="text-[13px] font-medium text-[var(--text-secondary)] mt-1.5 tracking-tight">
            Configuration des API Providers masqués sous l'identité souveraine Gaboma.
          </p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--text-primary)] text-xs font-semibold uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_15px_var(--accent-20)]">
          <FloppyDisk size={16} weight="bold" />
          Appliquer
        </button>
      </div>

      {/* External APIs */}
      <section className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--glass-border)] shadow-sm backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--glass-border)]">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-widest">
              <Cloud size={18} className="text-[var(--accent)]" weight="thin" />
              Fournisseurs Privés Externes
            </h3>
            <p className="text-[11px] font-medium text-[var(--text-muted)] mt-1 tracking-tight leading-relaxed max-w-lg">
              Ces fournisseurs seront maquillés dans le chat en tant que Onyx, Aurata, Black Panther, etc. Les utilisateurs ne verront jamais les noms originaux (Alibaba, Groq, DeepSeek).
            </p>
          </div>
          <Toggle checked={enableExternal} onChange={setEnableExternal} label="" />
        </div>

        {enableExternal && (
          <div className="space-y-4">
            {connections.map((conn) => (
              <div key={conn.id} className={`p-4 rounded-xl border transition-colors ${conn.enabled ? 'bg-[var(--bg-card2)] border-[var(--glass-border)]' : 'bg-[var(--bg-base)] border-[var(--glass-border)] opacity-60'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => updateConnection(conn.id, 'enabled', !conn.enabled)}
                      className={cn('w-3 h-3 rounded-full shrink-0 border transition-colors', conn.enabled ? 'bg-[var(--emerald)] border-[var(--emerald)] shadow-[0_0_8px_var(--emerald)]' : 'bg-transparent border-[var(--text-muted)]')}
                    />
                    <input
                      type="text"
                      value={conn.label}
                      onChange={(e) => updateConnection(conn.id, 'label', e.target.value)}
                      className="text-sm font-semibold bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none flex-1 tracking-tight"
                    />
                  </div>
                  <button onClick={() => removeConnection(conn.id)} className="p-1.5 rounded-lg hover:bg-[var(--destructive)]/10 transition-colors ml-4 group">
                    <Trash size={16} className="text-[var(--text-muted)] group-hover:text-[var(--destructive)] transition-colors" weight="thin" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest block mb-1.5">URL de base (Compatible OpenAI)</label>
                    <input
                      type="url"
                      value={conn.url}
                      onChange={(e) => updateConnection(conn.id, 'url', e.target.value)}
                      placeholder="https://api.deepseek.com"
                      disabled={!conn.enabled}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--glass-border)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest block mb-1.5">Clé API</label>
                    <div className="relative">
                      <input
                        type={showKeys[conn.id] ? 'text' : 'password'}
                        value={conn.key}
                        onChange={(e) => updateConnection(conn.id, 'key', e.target.value)}
                        placeholder="sk-..."
                        disabled={!conn.enabled}
                        className="w-full px-3 py-2 pr-10 rounded-lg bg-[var(--bg-base)] border border-[var(--glass-border)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors font-mono disabled:opacity-50"
                      />
                      <button
                        onClick={() => setShowKeys({ ...showKeys, [conn.id]: !showKeys[conn.id] })}
                        disabled={!conn.enabled}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-[var(--glass)] transition-colors disabled:opacity-50"
                      >
                        {showKeys[conn.id] ? <EyeSlash size={16} className="text-[var(--text-muted)]" weight="thin" /> : <Eye size={16} className="text-[var(--text-muted)]" weight="thin" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addConnection}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-dashed border-[var(--glass-border)] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card2)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-all mt-4"
            >
              <Plus size={16} weight="bold" />
              Ajouter un nouveau fournisseur
            </button>
          </div>
        )}
      </section>

      {/* Ollama */}
      <section className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--glass-border)] shadow-sm backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-widest">
            <HardDrives size={18} className="text-[var(--accent)]" weight="thin" />
            Nœuds Locaux (Ollama)
          </h3>
          <Toggle checked={enableOllama} onChange={setEnableOllama} label="" />
        </div>

        {enableOllama && (
          <div className="space-y-3 pt-4 border-t border-[var(--glass-border)] mt-4">
            {ollamaUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const next = [...ollamaUrls];
                    next[i] = e.target.value;
                    setOllamaUrls(next);
                  }}
                  placeholder="http://localhost:11434"
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--glass-border)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors font-mono"
                />
                <button className="p-2.5 rounded-lg hover:bg-[var(--glass)] transition-colors border border-transparent hover:border-[var(--glass-border)] group">
                  <ArrowsClockwise size={16} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" weight="thin" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Connexions directes */}
      <section className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--glass-border)] shadow-sm backdrop-blur-xl">
        <Toggle
          checked={enableDirect}
          onChange={setEnableDirect}
          label="Connexions API Personnelles (Bring Your Own Key)"
          helper="Si activé, les utilisateurs premium pourront renseigner leurs propres clés API (Ollama, Anthropic, etc.) dans leurs paramètres, qui seront masquées localement."
        />
      </section>
    </div>
  );
}
