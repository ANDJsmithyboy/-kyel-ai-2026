import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const client = await clerkClient();
    
    // Delete user from Clerk.
    // This will trigger the Clerk 'user.deleted' webhook,
    // which in turn deletes the user from the local Neon PostgreSQL DB.
    await client.users.deleteUser(userId);

    // Proactively delete in our database in case the webhook has latency.
    await db.delete(users).where(eq(users.clerkId, userId));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Account Delete API] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la suppression du compte' },
      { status: 500 }
    );
  }
}
