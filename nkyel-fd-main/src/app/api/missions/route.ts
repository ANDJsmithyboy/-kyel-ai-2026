import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const { userId, getToken } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id') || '00000000-0000-0000-0000-000000000000';

    const backendUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL) || 'https://api.nkyel.smartandjai.com';

    // Get Clerk JWT token and forward to backend
    const token = await getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${backendUrl}/api/v1/missions?workspace_id=${workspaceId}`, {
      headers,
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Backend returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching missions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
