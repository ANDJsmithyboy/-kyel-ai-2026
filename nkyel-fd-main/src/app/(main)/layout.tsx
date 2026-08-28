/**
 * Ñkyel AI · Main Layout
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Layout racine unifié sous NkyelAppShell
 */

import type { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  // Le nouveau design Lite (max-w-md) gère son propre layout dans NkyelLiteShell
  // On fournit juste le fond noir absolu pour le reste de l'écran (bords sur desktop).
  return (
    <div className="min-h-screen bg-[#05070E]">
      {children}
    </div>
  );
}
