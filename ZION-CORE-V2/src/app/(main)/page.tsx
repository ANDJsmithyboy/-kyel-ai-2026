/**
 * GabomaAI - Page d'accueil - Server Component
 * SmartANDJ AI Technologies
 * Route "/" dans le layout (main) avec Sidebar + TopBar + RenduPanel
 */

import { Suspense } from 'react';
import { cookies } from 'next/headers';
import ChatHome from '@/components/chat/ChatHome';

async function getFirstName(): Promise<string> {
  const cookieStore = await cookies();
  const name = cookieStore.get('gabomagpt_firstname')?.value;
  return name || 'explorateur';
}

function ChatHomeSkeleton() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="h-12 w-12 rounded-xl" style={{ background: 'var(--accent-06)' }} />
      <div className="mt-6 h-8 w-64 rounded-lg" style={{ background: 'var(--accent-06)' }} />
      <div className="mt-8 h-14 w-full max-w-[680px] rounded-full" style={{ background: 'var(--surface)' }} />
    </div>
  );
}

export default async function HomePage() {
  const firstName = await getFirstName();

  return (
    <Suspense fallback={<ChatHomeSkeleton />}>
      <ChatHome firstName={firstName} />
    </Suspense>
  );
}
