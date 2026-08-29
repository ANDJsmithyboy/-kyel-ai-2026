import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    const { userId } = session;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the active Clerk JWT to pass to FastAPI
    const token = await session.getToken();

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Transparent BFF proxy to FastAPI
    const res = await fetch(`${backendUrl}/api/v1/connectors/providers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // Do not cache the BFF request, rely on FastAPI for business state
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error(`[Connectors BFF] FastAPI returned status ${res.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch connectors from backend' }, 
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[Connectors BFF] Internal Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
