/**
 * Nkyel AI · Single Conversation API
 * SmartANDJ AI Technologies
 * Retrieve stored messages from Upstash Redis / Neon
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheInvalidate } from '@/lib/redis';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const meta = await cacheGet<any>(`conv:${id}:meta`);
    const messages = await cacheGet<any[]>(`conv:${id}`) || [];

    return NextResponse.json({
      id,
      title: meta?.title || 'Conversation',
      model: meta?.model || 'NKYEL_CHUI',
      messages: messages.map((m: any, idx: number) => ({
        id: `msg-${idx}-${m.timestamp || Date.now()}`,
        role: m.role,
        content: m.content,
        created_at: m.timestamp || Date.now(),
      })),
      createdAt: meta?.createdAt || Date.now(),
    });
  } catch (error) {
    return NextResponse.json({
      id,
      title: 'Conversation',
      model: 'NKYEL_CHUI',
      messages: [],
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await cacheInvalidate(`conv:${id}`);
    await cacheInvalidate(`conv:${id}:meta`);
  } catch {
    // ignore
  }
  return NextResponse.json({ success: true, id });
}
