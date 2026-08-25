/**
 * Ñkyel AI — Beta Status API Route
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const now = new Date();
  const utcString = now.toISOString();
  const librevilleString = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Africa/Libreville',
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(now);

  const response = {
    state: 'OPEN',
    campaign: {
      slug: 'nkyel-global-beta-2026',
      name: 'Ñkyel AI Private Beta 2026',
      max_seats: 500,
      claimed_seats: 128,
      remaining_seats: 372,
      starts_at_utc: '2026-08-22T00:00:00Z',
      public_ends_at_utc: '2026-08-28T23:59:59Z',
      starts_at_libreville: '2026-08-22 01:00:00',
      public_ends_at_libreville: '2026-08-29 00:59:59',
      duration_hours: 168,
    },
    server_time: {
      utc: utcString,
      libreville: librevilleString,
      seconds_remaining: 345600,
    },
    official_message: 'Bienvenue sur la Bêta Officielle Ñkyel AI. Système d\'Intelligence Souverain Opérationnel.',
    user_enrollment: {
      enrolled: true,
      seat_number: 42,
      status: 'active',
      enrolled_at: utcString,
      feedback_completed: false,
    },
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
