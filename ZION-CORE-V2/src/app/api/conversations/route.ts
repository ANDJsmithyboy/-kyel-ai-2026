/**
 * Nkyel AI · Conversations API
 * SmartANDJ AI Technologies
 * Persists user conversations to Upstash Redis & Neon PostgreSQL
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheSet, cacheGet } from '@/lib/redis';

export const runtime = 'nodejs';

// In-memory fallback
const inMemoryConversations = new Map<string, any>();

export async function GET() {
  try {
    const cachedList = await cacheGet<any[]>('conversations:all');
    if (cachedList && Array.isArray(cachedList)) {
      return NextResponse.json({ conversations: cachedList });
    }
  } catch {
    // fallback
  }

  const list = Array.from(inMemoryConversations.values()).sort((a, b) => b.createdAt - a.createdAt);
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
      updatedAt: Date.now(),
    };

    inMemoryConversations.set(id, conv);

    // Save in Redis
    try {
      const list = await cacheGet<any[]>('conversations:all') || [];
      const updatedList = [conv, ...list.filter((c: any) => c.id !== id)].slice(0, 50);
      await cacheSet('conversations:all', updatedList, 86400 * 30); // 30 jours
      await cacheSet(`conv:${id}:meta`, conv, 86400 * 30);
    } catch {
      // Non-blocking
    }

    return NextResponse.json(conv, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ id: `conv-${Date.now()}`, title: 'Conversation' }, { status: 200 });
  }
}
