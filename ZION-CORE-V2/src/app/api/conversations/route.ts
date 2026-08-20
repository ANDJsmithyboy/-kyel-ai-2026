import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// In-memory / serverless conversation store with fallback
const conversationsCache = new Map<string, { id: string; title: string; model: string; messages: any[]; createdAt: number }>();

export async function GET() {
  const list = Array.from(conversationsCache.values()).sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ conversations: list });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = body.id || `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const title = body.title || 'Nouvelle conversation';
    const model = body.model || 'NKYEL_CHUI';

    const conv = {
      id,
      title,
      model,
      messages: [],
      createdAt: Date.now(),
    };

    conversationsCache.set(id, conv);
    return NextResponse.json(conv, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ id: `conv-${Date.now()}`, title: 'Conversation' }, { status: 200 });
  }
}
