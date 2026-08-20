/* Nkyel AI · Checkout API · SmartANDJ AI Technologies
   Creates payment sessions via the selected payment provider
   Fondateur : Daniel Jonathan ANDJ */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { ebillingProvider } from '@/lib/payments/e-billing';
import { PLANS, type PaymentRequest } from '@/lib/payments/provider';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // -- 1. Auth --
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // -- 2. Parse body --
    const body = await req.json() as {
      planId: string;
      provider: string;
      email: string;
      phoneNumber?: string;
    };

    const { planId, provider, email } = body;

    // -- 3. Validate plan --
    const plan = PLANS.find(p => p.id === planId);
    if (!plan || plan.price === 0) {
      return NextResponse.json(
        { error: 'Plan invalide ou gratuit' },
        { status: 400 },
      );
    }

    // -- 4. Build payment request --
    const paymentRequest: PaymentRequest = {
      planId: plan.id,
      userId: clerkId,
      email,
      amount: plan.price,
      currency: plan.priceCurrency,
      metadata: {
        planName: plan.name,
        planInterval: plan.interval,
      },
    };

    // -- 5. Route to provider --
    let result;
    switch (provider) {
      case 'e-billing':
        result = await ebillingProvider.createPayment(paymentRequest);
        break;
      case 'mobile-money':
        // TODO: Wire Mobile Money provider (CinetPay/GIMACPAY)
        return NextResponse.json(
          { error: 'Mobile Money sera disponible prochainement' },
          { status: 501 },
        );
      case 'card':
        // TODO: Wire card provider
        return NextResponse.json(
          { error: 'Paiement par carte sera disponible prochainement' },
          { status: 501 },
        );
      default:
        return NextResponse.json(
          { error: 'Méthode de paiement non reconnue' },
          { status: 400 },
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Checkout API] Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez réessayer.' },
      { status: 500 },
    );
  }
}
