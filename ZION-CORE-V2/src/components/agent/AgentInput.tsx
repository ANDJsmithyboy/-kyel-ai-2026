/**
 * GabomaAI · AgentInput
 * SmartANDJ AI Technologies
 * Barre de saisie avec sélection ONYX / BLACK PANTHER.
 * Thème : Zion Core Obsidian.
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { useAgentStore, AgentMode } from '@/store/agentStore';
import { useAgentSSE } from '@/hooks/useAgentSSE';
import { motion } from 'framer-motion';

export default function AgentInput() {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startSSE, stopSSE } = useAgentSSE();

  const mode = useAgentStore((s) => s.mode);
  const phase = useAgentStore((s) => s.phase);
  const sessionId = useAgentStore((s) => s.sessionId);
  const setMode = useAgentStore((s) => s.setMode);

  const isRunning = phase !== 'idle' && phase !== 'done' && phase !== 'error';

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || isRunning) return;

    const store = useAgentStore.getState();
    const agentName = mode === 'onyx' ? 'lead_agent' : 'black_panther';

    // Démarrer une session via l'API
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
      const res = await fetch(`${backendUrl}/api/agent/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), agent: mode }),
      });
      const data = await res.json();

      store.startSession(data.session_id, data.thread_id);

      // Lancer le SSE
      startSSE({
        prompt: prompt.trim(),
        sessionId: data.session_id,
        threadId: data.thread_id,
        agentName,
      });

      setPrompt('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      store.setError('Impossible de démarrer la session agent.');
    }
  }, [prompt, mode, isRunning, startSSE]);

  const handleStop = useCallback(() => {
    stopSSE();
    useAgentStore.getState().setPhase('done');
  }, [stopSSE]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const modeConfig: Record<AgentMode, { label: string; color: string; bg: string }> = {
    onyx: {
      label: 'ONYX',
      color: 'var(--green-emerald)',
      bg: 'rgba(46, 204, 138, 0.1)',
    },
    'black-panther': {
      label: 'BLACK PANTHER',
      color: 'var(--gold, #D4A417)',
      bg: 'rgba(212, 164, 23, 0.1)',
    },
  };

  const currentMode = modeConfig[mode];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-panel)',
      }}
    >
      {/* ── Mode selector ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {(['onyx', 'black-panther'] as AgentMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            disabled={isRunning}
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              border: '1px solid',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              transition: 'all 150ms ease',
              borderColor: mode === m ? modeConfig[m].color : 'var(--border)',
              background: mode === m ? modeConfig[m].bg : 'transparent',
              color: mode === m ? modeConfig[m].color : 'var(--text-tertiary)',
              opacity: isRunning ? 0.5 : 1,
            }}
          >
            {modeConfig[m].label}
          </button>
        ))}

        {/* Phase badge */}
        {isRunning && (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              marginLeft: 'auto',
              fontSize: '11px',
              color: currentMode.color,
              fontWeight: 500,
            }}
          >
            {phase === 'planning' && '🧠 Réflexion…'}
            {phase === 'executing' && '⚡ Exécution…'}
            {phase === 'browsing' && '🌐 Navigation…'}
            {phase === 'writing' && '✍️ Écriture…'}
          </motion.span>
        )}
      </div>

      {/* ── Input area ── */}
      <div
        className="input-bar"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          padding: '10px 14px',
          borderColor: isRunning ? currentMode.color : undefined,
        }}
      >
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          placeholder={
            isRunning
              ? `${currentMode.label} est en cours…`
              : `Dites à ${currentMode.label} ce que vous voulez…`
          }
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.5,
            maxHeight: '160px',
          }}
        />

        {/* Submit / Stop button */}
        {isRunning ? (
          <button
            onClick={handleStop}
            style={{
              flexShrink: 0,
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--destructive, #FF6B7A)',
              background: 'rgba(255, 107, 122, 0.1)',
              color: 'var(--destructive, #FF6B7A)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            ■
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            style={{
              flexShrink: 0,
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: prompt.trim() ? currentMode.color : 'var(--bg-elevated)',
              color: prompt.trim() ? '#000' : 'var(--text-tertiary)',
              cursor: prompt.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 150ms ease',
            }}
          >
            ↑
          </button>
        )}
      </div>
    </div>
  );
}
