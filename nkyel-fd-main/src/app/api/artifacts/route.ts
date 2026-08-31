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
    
    const res = await fetch(`${backendUrl}/api/v1/artifacts?workspace_id=${workspaceId}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch artifacts' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
