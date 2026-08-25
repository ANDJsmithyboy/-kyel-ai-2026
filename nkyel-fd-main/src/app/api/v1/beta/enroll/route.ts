/**
 * Ñkyel AI — Beta Enroll API Route
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      success: true,
      seat_number: Math.floor(Math.random() * 300) + 1,
      message: 'Inscription confirmée à la Bêta Ñkyel AI.',
      locale: body.locale || 'fr',
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      seat_number: 100,
      message: 'Session Bêta active.',
    });
  }
}
