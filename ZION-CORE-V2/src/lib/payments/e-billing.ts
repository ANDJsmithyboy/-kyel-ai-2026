/* Ñkyel AI · E-Billing Provider · SmartANDJ AI Technologies
   OAuth2 (Cognito) integration with E-Billing Gabon (Digitech Africa)
   Fondateur : Daniel Jonathan ANDJ */

import type {
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentStatusResult,
} from './provider';

// -- Token cache ----------------------------------------------
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5min buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const clientId = process.env.EBILLING_CLIENT_ID;
  const clientSecret = process.env.EBILLING_CLIENT_SECRET;
  const tokenEndpoint = process.env.EBILLING_TOKEN_ENDPOINT;
  const scopes = process.env.EBILLING_SCOPES;

  if (!clientId || !clientSecret || !tokenEndpoint) {
    throw new Error('[E-Billing] Missing credentials in environment variables');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&scope=${encodeURIComponent(scopes || '')}`,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[E-Billing] Token request failed: ${res.status} ${body}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

// -- API call helper ------------------------------------------
async function ebillingFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken();
  const baseUrl = process.env.EBILLING_API_BASE_URL || 'https://lab.billing-easy.net';

  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });
}

// -- E-Billing Provider Implementation ------------------------
export class EBillingProvider implements PaymentProvider {
  readonly id = 'e-billing';
  readonly name = 'E-Billing Gabon';
  readonly methodType = 'e_billing' as const;

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Create an invoice via E-Billing API
      const invoiceRes = await ebillingFetch('/api/merchant/v1/invoice', {
        method: 'POST',
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency || 'XAF',
          description: `Abonnement Ñkyel AI — ${request.metadata?.planName || 'Pro'}`,
          payer_email: request.email,
          payer_reference: request.userId,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/ebilling`,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?status=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?status=cancelled`,
          metadata: {
            nkyel_user_id: request.userId,
            nkyel_plan_id: request.planId,
            ...request.metadata,
          },
        }),
      });

      if (!invoiceRes.ok) {
        const error = await invoiceRes.text();
        console.error('[E-Billing] Invoice creation failed:', error);
        return {
          success: false,
          status: 'failed',
          message: 'La création de la facture a échoué. Veuillez réessayer.',
        };
      }

      const invoice = await invoiceRes.json() as {
        id: string;
        payment_url?: string;
        status: string;
      };

      return {
        success: true,
        transactionId: invoice.id,
        status: 'pending',
        redirectUrl: invoice.payment_url,
        message: 'Facture créée. Suivez le lien pour finaliser le paiement.',
      };
    } catch (error) {
      console.error('[E-Billing] Payment error:', error);
      return {
        success: false,
        status: 'failed',
        message: 'Erreur de connexion avec E-Billing. Veuillez réessayer.',
      };
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatusResult> {
    try {
      const res = await ebillingFetch(`/api/merchant/v1/invoice/${transactionId}`);

      if (!res.ok) {
        throw new Error(`Status check failed: ${res.status}`);
      }

      const invoice = await res.json() as {
        id: string;
        status: string;
        paid_at?: string;
        amount: number;
        currency: string;
      };

      // Map E-Billing status to our status
      const statusMap: Record<string, PaymentStatusResult['status']> = {
        'paid': 'completed',
        'completed': 'completed',
        'pending': 'pending',
        'failed': 'failed',
        'cancelled': 'cancelled',
        'expired': 'expired',
      };

      return {
        transactionId: invoice.id,
        status: statusMap[invoice.status] || 'pending',
        paidAt: invoice.paid_at,
        amount: invoice.amount,
        currency: invoice.currency || 'XAF',
      };
    } catch (error) {
      console.error('[E-Billing] Status check error:', error);
      return {
        transactionId,
        status: 'pending',
        amount: 0,
        currency: 'XAF',
      };
    }
  }

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    // TODO: Implement E-Billing webhook signature verification
    // This will depend on E-Billing's specific webhook signing mechanism
    // For now, rely on HTTPS + server-side validation
    console.warn('[E-Billing] Webhook signature verification not yet implemented');
    return true;
  }
}

// -- Singleton export -----------------------------------------
export const ebillingProvider = new EBillingProvider();
