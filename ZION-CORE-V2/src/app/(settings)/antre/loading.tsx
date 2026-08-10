/**
 * Gaboma AI · L'Antre · loading.tsx
 * SmartANDJ AI Technologies
 * Skeleton — Lee Robinson pattern (animate-pulse)
 */

export default function AntreLoading() {
  return (
    <main style={{ background: 'var(--bg)' }} className="min-h-screen">
      {/* TopBar skeleton */}
      <div className="flex h-[52px] items-center justify-between px-4">
        <div className="h-6 w-6 animate-pulse rounded" style={{ background: 'var(--bg-elevated)' }} />
        <div className="h-5 w-20 animate-pulse rounded" style={{ background: 'var(--bg-elevated)' }} />
        <div className="h-5 w-5 animate-pulse rounded" style={{ background: 'var(--bg-elevated)' }} />
      </div>

      <div className="mx-auto max-w-2xl space-y-2 px-4 pb-8">
        {/* Group 1 */}
        <div className="animate-pulse rounded-[var(--radius-lg)] p-4" style={{ background: 'var(--bg-elevated)' }}>
          <div className="h-5 w-48 rounded" style={{ background: 'var(--accent-06)' }} />
        </div>
        {/* Group 2 */}
        <div className="animate-pulse rounded-[var(--radius-lg)] p-1" style={{ background: 'var(--bg-elevated)' }}>
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-4">
              <div className="h-5 w-5 rounded" style={{ background: 'var(--accent-06)' }} />
              <div className="h-4 w-32 rounded" style={{ background: 'var(--accent-06)' }} />
            </div>
          ))}
        </div>
        {/* Group 3 */}
        <div className="animate-pulse rounded-[var(--radius-lg)] p-1" style={{ background: 'var(--bg-elevated)' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-4">
              <div className="h-5 w-5 rounded" style={{ background: 'var(--accent-06)' }} />
              <div className="h-4 w-40 rounded" style={{ background: 'var(--accent-06)' }} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
