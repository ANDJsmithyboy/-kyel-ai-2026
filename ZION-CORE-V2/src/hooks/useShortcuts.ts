'use client';

import { useEffect, useCallback } from 'react';

type ShortcutCallback = (e: KeyboardEvent) => void;

interface ShortcutMap {
  [key: string]: ShortcutCallback;
}

export function useShortcuts(shortcuts: ShortcutMap) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) &&
        e.key !== 'Escape' &&
        !(e.ctrlKey || e.metaKey) // Allow ctrl/cmd combinations even in inputs if handled
      ) {
        // Special case: Esc cancels editing, or Ctrl+Enter submits
        return;
      }

      // Build key string, e.g. "Ctrl+Shift+N" or "Cmd+Shift+N"
      const keys = [];
      if (e.ctrlKey || e.metaKey) keys.push('mod');
      if (e.shiftKey) keys.push('shift');
      if (e.altKey) keys.push('alt');
      
      let key = e.key.toLowerCase();
      // Handle special keys mapping
      if (key === 'control' || key === 'meta' || key === 'shift' || key === 'alt') return;
      if (key === ' ') key = 'space';
      
      keys.push(key);
      const keyCombo = keys.join('+');

      const handler = shortcuts[keyCombo] || shortcuts[e.key] || shortcuts[e.code];
      if (handler) {
        e.preventDefault();
        handler(e);
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
