import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const backendBase = process.env.OPENWEBUI_BACKEND_URL || process.env.BACKEND_URL || '';

  const body = await req.json().catch(() => ({}));

  if (backendBase && backendBase.startsWith('http')) {
    try {
      const upstreamRes = await fetch(`${backendBase}/api/v1/beta/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': req.headers.get('authorization') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await upstreamRes.json();
      return NextResponse.json(data, { status: upstreamRes.status });
    } catch {
      // Fallback
    }
  }

  return NextResponse.json({
    success: true,
    feedback_id: 'fb_' + Math.random().toString(36).substring(2, 10),
    message: 'Feedback enregistré avec succès.',
  });
}
