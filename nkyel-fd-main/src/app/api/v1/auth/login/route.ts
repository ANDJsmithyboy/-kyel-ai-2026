/**
 * Ñkyel AI — Sovereign Auth Login API Route
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || 'user@nkyel.ai';

    return NextResponse.json({
      success: true,
      token: `nkyel_jwt_${Date.now()}_${Buffer.from(email).toString('base64')}`,
      user: {
        id: 'usr_smartandj_01',
        email,
        name: body.name || 'Daniel Jonathan ANDJ',
        role: 'admin',
        credits: 300,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      token: `nkyel_jwt_${Date.now()}`,
    });
  }
}
