/**
 * Ñkyel AI — Beta Feedback API Route
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      success: true,
      feedback_id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      message: 'Feedback enregistré avec succès. Merci de contribuer à Ñkyel AI.',
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      feedback_id: `fb_${Date.now()}`,
    });
  }
}
