/**
 * GabomaAI · useAgentBrowserWS Hook
 * SmartANDJ AI Technologies
 * WebSocket binaire — reçoit les frames JPEG du screencast CDP
 * et les dessine via un Blob → Image → requestAnimationFrame.
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAgentStore } from '@/store/agentStore';

export function useAgentBrowserWS(sessionId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const frameCountRef = useRef(0);
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    if (!sessionId) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
    const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
    const host = backendUrl.replace(/^https?:\/\//, '');
    const url = `${wsProtocol}://${host}/ws/agent/browser/${sessionId}`;

    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    // Compteur FPS
    frameCountRef.current = 0;
    fpsIntervalRef.current = setInterval(() => {
      useAgentStore.getState().setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);

    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        const blob = new Blob([event.data], { type: 'image/jpeg' });
        useAgentStore.getState().setCurrentFrame(blob);
        frameCountRef.current++;
      }
    };

    ws.onerror = () => {
      console.warn('[BrowserWS] Erreur de connexion');
    };

    ws.onclose = () => {
      cleanup();
    };
  }, [sessionId]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    cleanup();
  }, []);

  const cleanup = () => {
    if (fpsIntervalRef.current) {
      clearInterval(fpsIntervalRef.current);
      fpsIntervalRef.current = null;
    }
    wsRef.current = null;
    useAgentStore.getState().setFps(0);
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, disconnect };
}
