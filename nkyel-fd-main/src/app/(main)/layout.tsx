/**
 * Ñkyel AI · Main Layout
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Layout racine unifié sous NkyelAppShell
 */

import type { ReactNode } from 'react';
import NkyelAppShell from '@/components/shell/NkyelAppShell';

export default function MainLayout({ children }: { children: ReactNode }) {
  return <NkyelAppShell>{children}</NkyelAppShell>;
}
