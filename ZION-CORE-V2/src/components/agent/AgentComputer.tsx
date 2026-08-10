/**
 * GabomaAI · AgentComputer — Design System V3
 * SmartANDJ AI Technologies
 * Canvas JPEG live du navigateur Playwright.
 * Cadre avec bordure 1px accent à 20% opacité.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAgentStore } from '@/store/agentStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentComputer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrame = useAgentStore((s) => s.currentFrame);
  const currentUrl = useAgentStore((s) => s.currentUrl);
  const fps = useAgentStore((s) => s.fps);
  const phase = useAgentStore((s) => s.phase);

  // ── Dessiner la frame JPEG sur le canvas ──
  const drawFrame = useCallback(async (blob: Blob) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bitmap = await createImageBitmap(blob);
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
  }, []);

  useEffect(() => {
    if (!currentFrame) return;
    let rafId: number;
    const draw = () => {
      drawFrame(currentFrame);
    };
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [currentFrame, drawFrame]);

  const isLive = phase === 'browsing' && currentFrame !== null;

  return (
    <div
      className="agent-computer"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--accent-20)', /* V3: Bordure 1px accent à ~20% opacité */
        background: 'var(--bg-panel)',
      }}
    >
      {/* ── Barre d'URL style navigateur ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--accent-20)',
          fontSize: 'var(--fs-caption)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {/* Feux tricolores macOS */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
        </div>

        {/* Barre URL */}
        <div
          style={{
            flex: 1,
            padding: '4px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {currentUrl ?? 'about:blank'}
        </div>

        {/* Badge LIVE - point 6px pulsant vert */}
        <AnimatePresence>
          {isLive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'rgba(31, 157, 107, 0.15)', /* gabon-green V3 */
                border: '1px solid rgba(31, 157, 107, 0.3)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-success)',
              }}
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--color-success)',
                }}
              />
              LIVE
            </motion.div>
          )}
        </AnimatePresence>

        {/* FPS */}
        {fps > 0 && (
          <span
            style={{
              fontSize: '10px',
              color: 'var(--text-tertiary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fps} fps
          </span>
        )}
      </div>

      {/* ── Zone canvas ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-deep)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {isLive ? (
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--text-tertiary)',
              fontSize: 'var(--fs-small)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {/* Icône moniteur stylisé */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 256 256"
              fill="none"
              style={{ opacity: 0.4 }}
            >
              <rect
                x="32"
                y="48"
                width="192"
                height="128"
                rx="8"
                stroke="currentColor"
                strokeWidth="12"
              />
              <line x1="128" y1="176" x2="128" y2="208" stroke="currentColor" strokeWidth="12" />
              <line x1="96" y1="208" x2="160" y2="208" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
            </svg>
            <span>Navigateur en attente…</span>
            <span style={{ fontSize: 'var(--fs-caption)', opacity: 0.6 }}>
              L&apos;agent ouvrira un navigateur quand nécessaire
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
