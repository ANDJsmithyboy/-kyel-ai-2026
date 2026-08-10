/**
 * GabomaAI · useGabomaSeer Hook
 * Gère la capture caméra, l'envoi de frames à /api/vision/analyze,
 * et l'état du mode Live.
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseGabomaSeerOptions {
  fps?: number;
  enabled?: boolean;
  apiUrl?: string;
}

interface UseGabomaSeerReturn {
  isActive: boolean;
  description: string;
  error: string | null;
  toggle: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function useGabomaSeer({
  fps = 1,
  enabled = true,
  apiUrl = '/api/vision/analyze',
}: UseGabomaSeerOptions = {}): UseGabomaSeerReturn {
  const [isActive, setIsActive] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Vérifier la connexion réseau avant d'envoyer du contenu lourd */
  const isSlowConnection = useCallback((): boolean => {
    if (typeof navigator === 'undefined') return false;
    const conn = (navigator as any).connection;
    if (!conn) return false;
    const slow = ['slow-2g', '2g', '3g'];
    return slow.includes(conn.effectiveType);
  }, []);

  /* Capture une frame depuis la vidéo et retourne un base64 JPEG */
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;

    // Résolution contrôlée : max 720p
    const maxWidth = 1280;
    const maxHeight = 720;
    let w = video.videoWidth;
    let h = video.videoHeight;

    if (w > maxWidth) {
      h = Math.round((h * maxWidth) / w);
      w = maxWidth;
    }
    if (h > maxHeight) {
      w = Math.round((w * maxHeight) / h);
      h = maxHeight;
    }

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, w, h);
    // JPEG qualité 0.7 — bon compromis taille/qualité
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    // Retirer le préfixe data:image/jpeg;base64,
    return dataUrl.split(',')[1] || null;
  }, []);

  /* Envoie une frame au backend */
  const sendFrame = useCallback(async () => {
    if (isSlowConnection()) return;

    const b64 = captureFrame();
    if (!b64) return;

    try {
      const formData = new FormData();
      formData.append('image_b64', b64);
      formData.append('prompt', 'Décris ce que tu vois en détail.');

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        setError(`Erreur ${response.status}: ${errText}`);
        return;
      }

      const data = await response.json();
      setDescription(data.text || '');
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur réseau');
    }
  }, [apiUrl, captureFrame, isSlowConnection]);

  /* Démarre la capture vidéo */
  const startCapture = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false, // Audio ASR sera ajouté plus tard
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Intervalle de capture (fps configurable, défaut 1fps)
      const intervalMs = Math.max(1000 / fps, 500); // minimum 500ms
      intervalRef.current = setInterval(sendFrame, intervalMs);

      setIsActive(true);
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === 'NotAllowedError') {
          setError('Permission caméra refusée. Autorisez l\'accès dans les paramètres du navigateur.');
        } else if (e.name === 'NotFoundError') {
          setError('Aucune caméra détectée sur cet appareil.');
        } else {
          setError(`Erreur caméra : ${e.message}`);
        }
      }
    }
  }, [fps, sendFrame]);

  /* Arrête la capture */
  const stopCapture = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setDescription('');
  }, []);

  /* Toggle on/off */
  const toggle = useCallback(() => {
    if (isActive) {
      stopCapture();
    } else {
      startCapture();
    }
  }, [isActive, startCapture, stopCapture]);

  /* Cleanup au démontage */
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return {
    isActive,
    description,
    error,
    toggle,
    videoRef,
  };
}
