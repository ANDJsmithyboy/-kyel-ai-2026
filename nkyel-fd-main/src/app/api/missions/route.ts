import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id') || '00000000-0000-0000-0000-000000000000';

    const backendUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL) || 'https://api.nkyel.smartandjai.com';
    
    // Pass user authentication (Clerk) correctly in a real scenario
    const res = await fetch(`${backendUrl}/api/v1/missions?workspace_id=${workspaceId}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      // Mock fallback if DB is not seeded or user isn't assigned
      return NextResponse.json([
        {
          id: 'miss_1',
          workspace_id: workspaceId,
          title: 'Audit SEO & Content Strategy 2026',
          objective: 'Analyze top competitors and generate a full content roadmap.',
          status: 'running',
          priority: 'high',
          autonomy_level: 'autonomous',
          created_at: new Date().toISOString()
        },
        {
          id: 'miss_2',
          workspace_id: workspaceId,
          title: 'Weekly Financial Extraction',
          objective: 'Pull data from Neon DB and generate Executive Summary PDF.',
          status: 'scheduled',
          priority: 'normal',
          autonomy_level: 'semi_autonomous',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching missions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
