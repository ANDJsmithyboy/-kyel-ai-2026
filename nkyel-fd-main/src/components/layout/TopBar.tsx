/**
 * Nkyel AI · TopBar.tsx · Client Component (needs onClick handlers)
 * SmartANDJ AI Technologies
 * Barre de navigation minimale — hamburger + nouveau chat.
 */

'use client';
import { IbogaNavigationTrigger } from '@/components/brand';

export default function TopBar() {

  const handleOpenSidebar = () => {
    /* Dispatch custom event — sidebar listens for this */
    window.dispatchEvent(new CustomEvent('nkyel:sidebar:toggle'));
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-30 flex h-[52px] items-center justify-between px-4"
      style={{ background: 'transparent' }}
    >
      {/* LEFT — Iboga Navigation Trigger + Wordmark */}
      <div className="flex items-center gap-2">
        <IbogaNavigationTrigger
          open={false}
          onToggle={handleOpenSidebar}
          glyphSize={20}
          variant="mobile"
          title="Ouvrir la navigation"
          label="Ouvrir la navigation"
        />
        <span
          className="select-none text-[15px] font-semibold tracking-tight text-[var(--text-primary)]"
          style={{ letterSpacing: '-0.025em' }}
        >
          Ñkyel ▼
        </span>
      </div>

      {/* CENTER / RIGHT — Empty by default */}
      <div />
    </header>
  );
}
