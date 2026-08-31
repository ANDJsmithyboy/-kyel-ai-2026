import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backendUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL) || 'https://api.nkyel.smartandjai.com';
    const token = await auth().then(a => a.getToken());

    const res = await fetch(`${backendUrl}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    if (!res.ok) {
      return NextResponse.json({
        credits: 300,
        tier: 'FREE',
        usage: { used: 0, total: 300 }
      }); // fallback
    }

    const data = await res.json();
    
    return NextResponse.json({
      credits: data.credits ?? 300,
      tier: data.tier ?? 'FREE',
      usage: {
        used: data.credits_used ?? 0,
        total: data.credits ?? 300
      }
    });

  } catch (error) {
    console.error('Error fetching user quotas:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
