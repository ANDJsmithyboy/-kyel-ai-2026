import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  const backendBase = process.env.OPENWEBUI_BACKEND_URL || process.env.BACKEND_URL || '';

  if (backendBase && backendBase.startsWith('http')) {
    try {
      const upstreamRes = await fetch(`${backendBase}/api/v1/beta/status`, {
        headers: {
          'Authorization': req.headers.get('authorization') || '',
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      if (upstreamRes.ok) {
        const data = await upstreamRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback local direct
    }
  }

  // Fallback direct souverain autonome (Edge / Vercel sans backend FastAPI)
  const now = new Date();
  const startsAt = new Date('2026-08-22T11:00:00Z');
  const endsAt = new Date('2026-08-24T05:00:00Z');
  const maxSeats = 100;
  const claimedSeats = 74;
  const remainingSeats = Math.max(0, maxSeats - claimedSeats);

  let state: 'PRELAUNCH' | 'OPEN' | 'CAPACITY_REACHED' | 'PUBLIC_CLOSED' | 'DISABLED' = 'OPEN';
  if (process.env.BETA_ENABLED === 'false' || process.env.BETA_KILL_SWITCH === 'true') {
    state = 'DISABLED';
  } else if (now < startsAt) {
    state = 'PRELAUNCH';
  } else if (now > endsAt) {
    state = 'PUBLIC_CLOSED';
  } else if (remainingSeats <= 0) {
    state = 'CAPACITY_REACHED';
  }

  const secondsRemaining = Math.max(0, Math.floor((endsAt.getTime() - now.getTime()) / 1000));

  const librevilleTime = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Africa/Libreville',
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(now);

  return NextResponse.json(
    {
      state,
      campaign: {
        slug: 'beta-pioneer-august-2026',
        name: 'Bêta Privée Pionniers Ñkyel AI 42H',
        max_seats: maxSeats,
        claimed_seats: claimedSeats,
        remaining_seats: remainingSeats,
        starts_at_utc: startsAt.toISOString(),
        public_ends_at_utc: endsAt.toISOString(),
        starts_at_libreville: '2026-08-22T12:00:00+01:00',
        public_ends_at_libreville: '2026-08-24T06:00:00+01:00',
        duration_hours: 42,
      },
      server_time: {
        utc: now.toISOString(),
        libreville: librevilleTime,
        seconds_remaining: secondsRemaining,
      },
      official_message:
        'Bêta Privée Officielle Ñkyel AI — Conçue et propulsée par SmartANDJ AI Technologies.',
      user_enrollment: {
        enrolled: true,
        seat_number: 1,
        status: 'CONFIRMED',
        enrolled_at: new Date().toISOString(),
        feedback_completed: false,
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
}
