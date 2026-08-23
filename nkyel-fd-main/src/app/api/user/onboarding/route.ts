/* Nkyel AI · Onboarding API Route · SmartANDJ AI Technologies
   Saves onboarding data (birthDate, sector, ToS) into the users table (meta JSONB)
   and updates Clerk publicMetadata with onboardingComplete flag.
   Fondateur : Daniel Jonathan ANDJ */

import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

// -- Type guard --
interface OnboardingPayload {
  fullName: string;
  birthDate: string;  // YYYY-MM-DD
  sector: string;
  tosAccepted: boolean;
  languages?: string[];      // e.g. ["fr-GA", "fan"]
  primaryLocale?: string;    // e.g. "fr-GA"
  telemetryEnabled?: boolean;
}

function isValidPayload(body: unknown): body is OnboardingPayload {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.fullName === 'string' && b.fullName.trim().length >= 2 &&
    typeof b.birthDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.birthDate) &&
    typeof b.sector === 'string' && b.sector.length > 0 &&
    b.tosAccepted === true
  );
}

export async function POST(req: Request) {
  try {
    // -- 1. Auth --
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // -- 2. Parse & validate --
    const body = await req.json();
    if (!isValidPayload(body)) {
      return NextResponse.json(
        { error: 'Données invalides. Tous les champs sont requis.' },
        { status: 400 },
      );
    }

    const { fullName, birthDate, sector, tosAccepted, languages, primaryLocale, telemetryEnabled } = body;

    // -- 3. Build meta object --
    const onboardingMeta = {
      onboardingComplete: true,
      onboardingCompletedAt: new Date().toISOString(),
      birthDate,
      sector,
      tosAcceptedAt: new Date().toISOString(),
      languages: languages || ['fr-GA'],
      primaryLocale: primaryLocale || 'fr-GA',
      telemetryEnabled: telemetryEnabled ?? false,
    };

    // -- 4. Upsert user in database --
    // First try to find existing user
    const existingUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.clerkId, clerkId))
      .limit(1);

    if (existingUsers.length > 0) {
      // Update existing user
      const existingMeta = (existingUsers[0].meta as Record<string, unknown>) || {};
      await db
        .update(schema.users)
        .set({
          fullName,
          meta: { ...existingMeta, ...onboardingMeta },
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.users.clerkId, clerkId));
    } else {
      // This shouldn't normally happen (Clerk webhook usually creates the user),
      // but handle gracefully by inserting a new row
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(clerkId);

      await db.insert(schema.users).values({
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        fullName,
        avatarUrl: clerkUser.imageUrl || null,
        meta: onboardingMeta,
      });
    }

    // -- 5. Update Clerk publicMetadata (for middleware fast-path) --
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(clerkId, {
      publicMetadata: { onboardingComplete: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Onboarding API] Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 },
    );
  }
}
