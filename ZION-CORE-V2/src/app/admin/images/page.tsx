/* GabomaGPT · admin/images/page.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Parametres Generation d'Images — Miroir Open WebUI Images Settings */
'use client';

import { useState } from 'react';
import { Save, Image, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const IMAGE_ENGINES = [
  { id: 'openai', name: 'OpenAI DALL-E' },
  { id: 'automatic1111', name: 'AUTOMATIC1111 (Stable Diffusion)' },
  { id: 'comfyui', name: 'ComfyUI' },
  { id: 'gemini', name: 'Google Gemini' },
];

const DALLE_MODELS = ['dall-e-3', 'dall-e-2'];
const IMAGE_SIZES = ['256x256', '512x512', '1024x1024', '1024x1792', '1792x1024'];

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

export default function AdminImagesPage() {
  const [enabled, setEnabled] = useState(false);
  const [engine, setEngine] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [dalleModel, setDalleModel] = useState('dall-e-3');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [steps, setSteps] = useState('50');
  const [sdUrl, setSdUrl] = useState('http://localhost:7860');

  const handleSave = () => {
    toast.success('Parametres images sauvegardes');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Images</h2>
          <p className="text-sm text-[var(--text-tertiary)]">Configuration de la generation d&apos;images</p>
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
          label="Activer la generation d'images"
          helper="Permet aux utilisateurs de generer des images via les conversations"
        />
      </section>

      {enabled && (
        <>
          {/* Moteur */}
          <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Image size={15} className="text-[var(--accent)]" />
              Moteur de generation
            </h3>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Fournisseur</label>
              <select
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
              >
                {IMAGE_ENGINES.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            {/* OpenAI DALL-E config */}
            {engine === 'openai' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Cle API OpenAI</label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-primary)]">Modele</label>
                    <select
                      value={dalleModel}
                      onChange={(e) => setDalleModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
                    >
                      {DALLE_MODELS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-primary)]">Taille</label>
                    <select
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
                    >
                      {IMAGE_SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Stable Diffusion / ComfyUI config */}
            {(engine === 'automatic1111' || engine === 'comfyui') && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">URL du serveur</label>
                  <input
                    type="url"
                    value={sdUrl}
                    onChange={(e) => setSdUrl(e.target.value)}
                    placeholder="http://localhost:7860"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Nombre de steps</label>
                  <input
                    type="number"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
