/* GabomaGPT · Clerk Webhook · SmartANDJ AI Technologies
   Sync Clerk users → Neon PostgreSQL via Drizzle
   Events: user.created, user.updated, user.deleted
   Fondateur : Daniel Jonathan ANDJ */

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
  type: string;
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('[Clerk Webhook] Missing CLERK_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // ── Verify webhook signature ──────────────────────────────
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let event: ClerkUserEvent;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserEvent;
  } catch (err) {
    console.error('[Clerk Webhook] Verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // ── Handle events ─────────────────────────────────────────
  const { type, data } = event;
  const email = data.email_addresses?.[0]?.email_address;
  const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Utilisateur';

  try {
    switch (type) {
      case 'user.created': {
        const isGodMode = email && ['jonathanakarentoutoume@gmail.com', 'smartandjiatechnologies@gmail.com'].includes(email.toLowerCase());

        await db.insert(users).values({
          clerkId: data.id,
          email: email || `${data.id}@clerk.user`,
          fullName: name,
          avatarUrl: data.image_url,
          tier: isGodMode ? 'BLUE_PANTHER' : 'AURATA',
          credits: isGodMode ? 999999999 : 100,
          isAdmin: !!isGodMode,
        }).onConflictDoNothing();

        console.log(`[Clerk Webhook] User created: ${email}`);
        break;
      }

      case 'user.updated': {
        const isGodMode = email && ['jonathanakarentoutoume@gmail.com', 'smartandjiatechnologies@gmail.com'].includes(email.toLowerCase());

        await db.update(users)
          .set({
            email: email || undefined,
            fullName: name,
            avatarUrl: data.image_url,
            ...(isGodMode ? { tier: 'BLUE_PANTHER', credits: 999999999, isAdmin: true } : {}),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(users.clerkId, data.id));

        console.log(`[Clerk Webhook] User updated: ${email}`);
        break;
      }

      case 'user.deleted': {
        await db.delete(users).where(eq(users.clerkId, data.id));
        console.log(`[Clerk Webhook] User deleted: ${data.id}`);
        break;
      }

      default:
        console.log(`[Clerk Webhook] Unhandled event: ${type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error(`[Clerk Webhook] Error processing ${type}:`, err);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
