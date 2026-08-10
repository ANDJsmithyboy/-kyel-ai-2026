/* GabomaGPT · admin/audio/page.tsx · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Parametres Audio TTS/STT — Miroir Open WebUI Audio Settings */
'use client';

import { useState } from 'react';
import { Save, Volume2, Mic, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TTS_ENGINES = [
  { id: 'openai', name: 'OpenAI TTS' },
  { id: 'elevenlabs', name: 'ElevenLabs' },
  { id: 'azure', name: 'Azure Speech' },
  { id: 'browser', name: 'Navigateur (Web Speech API)' },
];

const STT_ENGINES = [
  { id: 'openai', name: 'OpenAI Whisper' },
  { id: 'deepgram', name: 'Deepgram' },
  { id: 'azure', name: 'Azure Speech' },
  { id: 'browser', name: 'Navigateur (Web Speech API)' },
];

const OPENAI_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

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

export default function AdminAudioPage() {
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsEngine, setTtsEngine] = useState('openai');
  const [ttsVoice, setTtsVoice] = useState('nova');
  const [ttsApiKey, setTtsApiKey] = useState('');
  const [showTtsKey, setShowTtsKey] = useState(false);

  const [sttEnabled, setSttEnabled] = useState(true);
  const [sttEngine, setSttEngine] = useState('openai');
  const [sttApiKey, setSttApiKey] = useState('');
  const [showSttKey, setShowSttKey] = useState(false);
  const [sttLanguage, setSttLanguage] = useState('fr');

  const handleSave = () => {
    toast.success('Parametres audio sauvegardes');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Audio</h2>
          <p className="text-sm text-[var(--text-tertiary)]">Configuration Text-to-Speech et Speech-to-Text</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-medium hover:opacity-90 transition-opacity">
          <Save size={14} />
          Sauvegarder
        </button>
      </div>

      {/* TTS */}
      <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Volume2 size={15} className="text-[var(--accent)]" />
            Text-to-Speech (TTS)
          </h3>
          <Toggle checked={ttsEnabled} onChange={setTtsEnabled} label="" />
        </div>

        {ttsEnabled && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Moteur TTS</label>
              <select
                value={ttsEngine}
                onChange={(e) => setTtsEngine(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
              >
                {TTS_ENGINES.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            {ttsEngine === 'openai' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Voix</label>
                <div className="grid grid-cols-3 gap-2">
                  {OPENAI_VOICES.map((v) => (
                    <button
                      key={v}
                      onClick={() => setTtsVoice(v)}
                      className={cn(
                        'px-3 py-2 rounded-xl text-sm font-medium capitalize transition-colors border',
                        ttsVoice === v
                          ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent-30)]'
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {ttsEngine !== 'browser' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Cle API TTS</label>
                <div className="relative">
                  <input
                    type={showTtsKey ? 'text' : 'password'}
                    value={ttsApiKey}
                    onChange={(e) => setTtsApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 pr-10 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors font-mono"
                  />
                  <button
                    onClick={() => setShowTtsKey(!showTtsKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/[0.06]"
                  >
                    {showTtsKey ? <EyeOff size={14} className="text-[var(--text-tertiary)]" /> : <Eye size={14} className="text-[var(--text-tertiary)]" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* STT */}
      <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Mic size={15} className="text-[var(--accent)]" />
            Speech-to-Text (STT)
          </h3>
          <Toggle checked={sttEnabled} onChange={setSttEnabled} label="" />
        </div>

        {sttEnabled && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Moteur STT</label>
              <select
                value={sttEngine}
                onChange={(e) => setSttEngine(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
              >
                {STT_ENGINES.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Langue de reconnaissance</label>
              <select
                value={sttLanguage}
                onChange={(e) => setSttLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
              >
                <option value="fr">Francais</option>
                <option value="en">English</option>
                <option value="auto">Auto-detection</option>
              </select>
            </div>

            {sttEngine !== 'browser' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Cle API STT</label>
                <div className="relative">
                  <input
                    type={showSttKey ? 'text' : 'password'}
                    value={sttApiKey}
                    onChange={(e) => setSttApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 pr-10 rounded-xl bg-[var(--zc-input)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors font-mono"
                  />
                  <button
                    onClick={() => setShowSttKey(!showSttKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/[0.06]"
                  >
                    {showSttKey ? <EyeOff size={14} className="text-[var(--text-tertiary)]" /> : <Eye size={14} className="text-[var(--text-tertiary)]" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
