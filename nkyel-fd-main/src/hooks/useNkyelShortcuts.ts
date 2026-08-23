'use client';

import { useShortcuts } from './useShortcuts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useNkyelShortcuts() {
  const router = useRouter();
  const [isShortcutsOverlayOpen, setIsShortcutsOverlayOpen] = useState(false);

  // You can pass setter functions or trigger events from here to other stores (Zustand, Context)
  // For now we mock the dispatch behavior
  useShortcuts({
    'mod+shift+n': (e) => {
      // Nouvelle Piste / Nouvelle Fenêtre (Tauri)
      e.preventDefault();
      // @ts-ignore - Tauri object might not be typed
      if (typeof window !== 'undefined' && window.__TAURI__) {
        // En desktop Tauri, on peut ouvrir une vraie nouvelle fenêtre, ou rediriger
        // window.__TAURI__.invoke('open_new_window'); (implémentation future si nécessaire)
      }
      router.push('/');
    },
    'mod+k': (e) => {
      // Quick Switcher
      e.preventDefault();
      // Dispatch open switcher
      window.dispatchEvent(new CustomEvent('open-quick-switcher'));
    },
    'mod+b': (e) => {
      // Toggle Sidebar
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('toggle-sidebar'));
    },
    'mod+shift+f': (e) => {
      // Global search
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('open-global-search'));
    },
    'mod+,': (e) => {
      // Open Antre
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('open-antre-settings'));
    },
    'mod+/': (e) => {
      // Open shortcuts overlay
      e.preventDefault();
      setIsShortcutsOverlayOpen(true);
    },
    'mod+shift+m': (e) => {
      // Toggle mic dictation
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('toggle-mic'));
    },
    'mod+shift+v': (e) => {
      // Toggle Live voice mode
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('toggle-live-voice'));
    },
    '/': (e) => {
      // Focus input (if not already typing, which is handled in useShortcuts)
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('focus-chat-input'));
    },
    'mod+1': (e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('switch-model', { detail: 'aurata' })); },
    'mod+2': (e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('switch-model', { detail: 'nkyel' })); },
    'mod+3': (e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('switch-model', { detail: 'onyxgris' })); },
    'mod+4': (e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('switch-model', { detail: 'blackpanther' })); },
    'mod+5': (e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('switch-model', { detail: 'wandana' })); },
    'mod+=': (e) => {
      e.preventDefault();
      // Zoom Avant
      document.documentElement.style.zoom = `${(parseFloat(document.documentElement.style.zoom || '1') + 0.1).toFixed(1)}`;
    },
    'mod+-': (e) => {
      e.preventDefault();
      // Zoom Arrière
      document.documentElement.style.zoom = `${(Math.max(0.5, parseFloat(document.documentElement.style.zoom || '1') - 0.1)).toFixed(1)}`;
    },
    'mod+0': (e) => {
      e.preventDefault();
      // Reset Zoom
      document.documentElement.style.zoom = '1';
    },
  });

  return {
    isShortcutsOverlayOpen,
    setIsShortcutsOverlayOpen
  };
}
