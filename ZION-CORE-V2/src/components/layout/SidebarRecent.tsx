/**
 * Gaboma AI · SidebarRecent.tsx
 * SmartANDJ AI Technologies
 * Conversations récentes — 5 dernières, tronquées.
 */

import Link from 'next/link';
import { IconEnPiste } from '@/components/icons';

interface RecentChat {
  id: string;
  title: string;
}

interface SidebarRecentProps {
  chats: RecentChat[];
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str;
}

export default function SidebarRecent({ chats }: SidebarRecentProps) {
  const recent = chats.slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <div className="flex flex-col px-3 pt-4">
      {/* Label */}
      <div className="mb-2 px-3 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
        <IconEnPiste width={14} height={14} />
        <span
          className="text-[10px] font-medium uppercase"
          style={{
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.08em',
          }}
        >
          En Piste
        </span>
      </div>

      {/* List */}
      {recent.map((chat) => (
        <Link
          key={chat.id}
          href={`/chat/${chat.id}`}
          className="flex h-9 items-center rounded-[var(--radius-sm)] px-3 transition-colors"
          style={{
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = 'var(--accent-06)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <span
            className="truncate text-[13px]"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              color: 'var(--text-secondary)',
            }}
          >
            {truncate(chat.title, 28)}
          </span>
        </Link>
      ))}
    </div>
  );
}
