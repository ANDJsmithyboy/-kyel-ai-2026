/* Ñkyel AI · E-Billing Webhook · SmartANDJ AI Technologies
   Handles payment confirmation callbacks from E-Billing Gabon
   Fondateur : Daniel Jonathan ANDJ */

import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      invoice_id: string;
      status: string;
      paid_at?: string;
      amount: number;
      currency: string;
      metadata?: {
        nkyel_user_id?: string;
        nkyel_plan_id?: string;
      };
    };

    console.log('[E-Billing Webhook] Received:', JSON.stringify(body));

    // ── Verify the payment is completed ──
    if (body.status !== 'paid' && body.status !== 'completed') {
      console.log('[E-Billing Webhook] Payment not completed, status:', body.status);
      return NextResponse.json({ received: true });
    }

    const userId = body.metadata?.nkyel_user_id;
    const planId = body.metadata?.nkyel_plan_id;

    if (!userId || !planId) {
      console.error('[E-Billing Webhook] Missing user or plan ID in metadata');
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // ── Update user subscription in database ──
    const existingUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.clerkId, userId))
      .limit(1);

    if (existingUsers.length > 0) {
      const existingMeta = (existingUsers[0].meta as Record<string, unknown>) || {};
      await db
        .update(schema.users)
        .set({
          meta: {
            ...existingMeta,
            subscription: {
              planId,
              status: 'active',
              provider: 'e-billing',
              transactionId: body.invoice_id,
              activatedAt: new Date().toISOString(),
              paidAmount: body.amount,
              paidCurrency: body.currency,
            },
          },
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.users.clerkId, userId));
    }

    // ── Update Clerk publicMetadata for fast middleware checks ──
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingComplete: true,
        plan: planId,
        planActive: true,
      },
    });

    console.log(`[E-Billing Webhook] Subscription activated for user ${userId}: ${planId}`);

    return NextResponse.json({ received: true, activated: true });
  } catch (error) {
    console.error('[E-Billing Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 },
    );
  }
}
