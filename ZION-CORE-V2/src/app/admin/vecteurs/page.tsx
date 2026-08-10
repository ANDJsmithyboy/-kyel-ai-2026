/* GabomaGPT · admin/models/page.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Gestion des modèles et clés API */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Cpu, Key, Eye, EyeOff, RefreshCw, Check, Copy } from 'lucide-react';
import { getModels, type ModelInfo } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { MODEL_DISPLAY_NAMES } from '@/stores/settings.store';
import { MODEL_REGISTRY } from '@/config/modelRegistry';
import { cn } from '@/lib/utils';

export default function AdminModelsPage() {
  const token = useAuthStore((s) => s.user?.token);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKeys, setShowKeys] = useState(false);

  const loadModels = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getModels(token);
      setModels(data);
    } catch {
      // Silencieux si backend non connecté
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadModels(); }, [loadModels]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Modèles & Clés API</h2>
          <p className="text-sm text-[var(--text-tertiary)]">{models.length} modèles disponibles</p>
        </div>
        <button onClick={loadModels} className="p-2 rounded-xl hover:bg-[var(--accent-10)] transition-colors">
          <RefreshCw size={16} className={cn('text-[var(--text-secondary)]', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Masquage des noms */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Eye size={16} className="text-[var(--accent)]" />
          Masquage des modèles
        </h3>
        <p className="text-xs text-[var(--text-tertiary)] mb-4">
          Les utilisateurs normaux voient des noms GabomaGPT au lieu des vrais noms de modèles.
        </p>
        <div className="space-y-2">
          {Object.entries(MODEL_DISPLAY_NAMES).map(([real, display]) => (
            <div key={real} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[var(--zc-input)] border border-[var(--border)]">
              <div className="text-xs font-mono text-[var(--text-tertiary)]">{real}</div>
              <div className="text-xs font-medium text-[var(--accent)]">{display}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Registre des familles de modèles */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Registre des familles de modèles</h3>
        <div className="space-y-4">
          {MODEL_REGISTRY.map((family) => (
            <div key={family.key} className="p-4 rounded-2xl bg-[var(--zc-input)] border border-[var(--border)]">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{family.name}</span>
                <span className="text-xs text-[var(--text-tertiary)]">{family.description}</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">URL cible</div>
                  {family.targetUrls.map((url) => (
                    <div key={url} className="text-sm text-[var(--accent)]">{url}</div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="text-[0.72rem] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Modèles</div>
                  {family.models.map((model) => (
                    <div key={model.key} className="rounded-xl bg-[var(--bg-surface)] px-3 py-2 text-sm">
                      <div className="font-medium text-[var(--text-primary)]">{model.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">{model.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des modèles du backend */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Cpu size={16} className="text-[var(--accent)]" />
          Modèles connectés
        </h3>
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl skeleton" />
            ))
          ) : models.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">
              Aucun modèle disponible — Connectez le backend Open WebUI
            </div>
          ) : (
            models.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                <Cpu size={16} className="text-[var(--text-tertiary)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--text-primary)] truncate">{m.id}</div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {MODEL_DISPLAY_NAMES[m.id] || m.name || 'Non masqué'}
                  </div>
                </div>
                <span className="text-xs text-[var(--text-tertiary)]">{m.owned_by}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Clés API */}
      <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Key size={16} className="text-[var(--accent)]" />
          Clés API
        </h3>
        <p className="text-xs text-[var(--text-tertiary)] mb-3">
          Les clés API sont gérées par le backend Open WebUI. Accédez aux paramètres backend pour les modifier.
        </p>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--zc-input)] border border-[var(--border)]">
          <span className="flex-1 text-xs font-mono text-[var(--text-tertiary)]">
            {showKeys ? 'sk-••••••••••••••••••••' : '••••••••••••••••••••••••••'}
          </span>
          <button onClick={() => setShowKeys(!showKeys)} className="p-1 hover:bg-white/[0.08] rounded-lg transition-colors">
            {showKeys ? <EyeOff size={14} className="text-[var(--text-tertiary)]" /> : <Eye size={14} className="text-[var(--text-tertiary)]" />}
          </button>
        </div>
      </div>
    </div>
  );
}
