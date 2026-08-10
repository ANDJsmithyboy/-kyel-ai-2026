/**
 * Gaboma AI · TopBar.tsx · Client Component (needs onClick handlers)
 * SmartANDJ AI Technologies
 * Barre de navigation minimale — hamburger + nouveau chat.
 */

'use client';

import { useRouter } from 'next/navigation';

export default function TopBar() {
  const router = useRouter();

  const handleOpenSidebar = () => {
    /* Dispatch custom event — sidebar listens for this */
    window.dispatchEvent(new CustomEvent('gaboma:sidebar:toggle'));
  };

  const handleNewChat = () => {
    router.push('/chat');
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-30 flex h-[52px] items-center justify-between px-4"
      style={{ background: 'transparent' }}
    >
      {/* LEFT — Hamburger */}
      <button
        type="button"
        onClick={handleOpenSidebar}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Ouvrir le menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M3 5.5H17M3 10H17M3 14.5H17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* CENTER — Empty */}
      <div />

      {/* RIGHT — New chat */}
      <button
        type="button"
        onClick={handleNewChat}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Nouvelle conversation"
      >
        {/* SquarePen icon */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M13.5 3.5L16.5 6.5M11.5 5.5L3 14V17H6L14.5 8.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </header>
  );
}
