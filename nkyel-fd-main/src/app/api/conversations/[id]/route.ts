/**
 * Nkyel AI · Single Conversation API
 * SmartANDJ AI Technologies
 * Retrieve stored messages from Upstash Redis / Neon
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheInvalidate } from '@/lib/redis';

export const runtime = 'nodejs';

const API_BASE = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.nkyel.smartandjai.com';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = req.headers.get('authorization') || '';

  try {
    const meta = await cacheGet<any>(`conv:${id}:meta`);
    const messages = await cacheGet<any[]>(`conv:${id}`);

    if (messages && Array.isArray(messages) && messages.length > 0) {
      return NextResponse.json({
        id,
        title: meta?.title || 'Conversation',
        model: meta?.model || 'NKYEL_CHUI',
        messages: messages.map((m: any, idx: number) => ({
          id: m.id || `msg-${idx}-${m.timestamp || Date.now()}`,
          role: m.role,
          content: m.content || m.content_text,
          created_at: m.created_at || m.timestamp || Date.now(),
        })),
        createdAt: meta?.createdAt || Date.now(),
      });
    }

    // 2. Fallback souverain P0 : Requêter FastAPI / Neon directement
    try {
      const backendRes = await fetch(`${API_BASE}/api/v1/conversations/${id}/messages`, {
        headers: authHeader ? { Authorization: authHeader } : {},
      });
      if (backendRes.ok) {
        const dbMsgs = await backendRes.json();
        if (Array.isArray(dbMsgs) && dbMsgs.length > 0) {
          const formatted = dbMsgs.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content || m.content_text || '',
            created_at: m.created_at ? new Date(m.created_at).getTime() : Date.now(),
          }));
          return NextResponse.json({
            id,
            title: meta?.title || 'Conversation',
            model: meta?.model || 'NKYEL_CHUI',
            messages: formatted,
            createdAt: meta?.createdAt || Date.now(),
          });
        }
      }
    } catch {
      // Poursuite gracieuse
    }

    return NextResponse.json({
      id,
      title: meta?.title || 'Conversation',
      model: meta?.model || 'NKYEL_CHUI',
      messages: [],
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
