/**
 * Ñkyel AI · Artifact Generation Proxy — PRODUCTION
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Creates artifacts on the FastAPI backend and returns download URLs.
 * Supports: PDF, DOCX, PPTX, XLSX, Markdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const FASTAPI_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL) || 'https://api.nkyel.smartandjai.com';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, mission_id, run_id, formats } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 });
    }

    const missionId = mission_id || `mis_${Date.now()}`;
    const runIdVal = run_id || `run_${Date.now()}`;
    const requestedFormats: string[] = formats || ['md'];

    // 1. Create the artifact on the backend
    const createRes = await fetch(`${FASTAPI_URL}/api/v1/artifacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        type: 'report',
        mission_id: missionId,
        run_id: runIdVal,
        filename: `${title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 40)}.md`,
        description: `Generated artifact: ${title}`,
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error('Backend artifact creation failed:', createRes.status, errText);
      return NextResponse.json({
        error: 'Artifact creation failed on backend',
        detail: errText,
      }, { status: createRes.status });
    }

    const artifact = await createRes.json();
    const artifactId = artifact.id || artifact.artifact_id;

    // 2. Generate export URLs for each requested format
    const exports: Record<string, string> = {};
    for (const fmt of requestedFormats) {
      exports[fmt] = `${FASTAPI_URL}/api/v1/artifacts/${artifactId}/export?format=${fmt}`;
    }

    return NextResponse.json({
      success: true,
      artifact_id: artifactId,
      title: artifact.title || title,
      exports,
      formats_available: requestedFormats,
    });
  } catch (error: any) {
    console.error('Artifact generation error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      detail: error.message,
    }, { status: 500 });
  }
}
