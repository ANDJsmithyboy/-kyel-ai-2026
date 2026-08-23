'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface UseAudioSTTReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  transcript: string;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  clearTranscript: () => void;
}

export function useAudioSTT(): UseAudioSTTReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript('');
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Erreur lors de l\'accès au microphone:', err);
      const errorMessage =
        err.name === 'NotAllowedError'
          ? 'Accès au microphone refusé.'
          : 'Erreur lors de l\'initialisation du microphone.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [isRecording]);

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'audio.webm');

      const response = await fetch('/api/audio/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur serveur: ${response.status}`);
      }

      const data = await response.json();
      if (data.text) {
        setTranscript(data.text);
      } else {
        throw new Error('Aucun texte retourné par l\'API.');
      }
    } catch (err: any) {
      console.error('Erreur de transcription:', err);
      const errorMessage = err.message || 'Erreur lors de la transcription audio.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsTranscribing(false);
    }
  };

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    isRecording,
    isTranscribing,
    transcript,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
  };
}
