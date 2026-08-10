/* GabomaGPT · Payment Provider Interface · SmartANDJ AI Technologies
   Abstract payment provider — all concrete providers implement this.
   Fondateur : Daniel Jonathan ANDJ */

// ── Payment Method Types ─────────────────────────────────────
export type PaymentMethodType = 'mobile_money' | 'e_billing' | 'card';

// ── Plan Tiers ───────────────────────────────────────────────
export interface PlanTier {
  id: string;
  name: string;
  price: number;           // in XAF (CFA Franc BEAC)
  priceCurrency: string;   // 'XAF'
  interval: 'month' | 'year';
  features: string[];
  models: string[];        // e.g. ['aurata'] or ['aurata', 'nkyel', 'wandana']
  agents: string[];        // e.g. ['onyxgris'] or ['onyxgris', 'legoat', 'blackpanther']
  messagesPerDay: number;  // -1 = unlimited
  badge: string;           // display badge text
  popular?: boolean;
}

// ── Plans Configuration ──────────────────────────────────────
export const PLANS: PlanTier[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    priceCurrency: 'XAF',
    interval: 'month',
    features: [
      'Modèle Aurata (Flash)',
      '30 messages par jour',
      'Agent OnyxGris (basique)',
      'Historique 7 jours',
    ],
    models: ['aurata'],
    agents: ['onyxgris'],
    messagesPerDay: 30,
    badge: 'Gratuit',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 4900,  // 4 900 XAF/mois
    priceCurrency: 'XAF',
    interval: 'month',
    features: [
      'Tous les modèles (Aurata, Ñkyel, Wandana)',
      'Messages illimités',
      'Tous les agents (OnyxGris, Le Goat, Black Panther AI)',
      'Recherche web avancée (Wandana)',
      'Missions autonomes (Le Goat)',
      'Historique illimité',
      'Support prioritaire',
    ],
    models: ['aurata', 'nkyel', 'wandana'],
    agents: ['onyxgris', 'legoat', 'blackpanther'],
    messagesPerDay: -1,
    badge: 'Pro',
    popular: true,
  },
  {
    id: 'pro_yearly',
    name: 'Pro Annuel',
    price: 49000,  // 49 000 XAF/an (~2 mois offerts)
    priceCurrency: 'XAF',
    interval: 'year',
    features: [
      'Tout le plan Pro',
      '2 mois offerts',
      'Accès anticipé aux nouveautés',
    ],
    models: ['aurata', 'nkyel', 'wandana'],
    agents: ['onyxgris', 'legoat', 'blackpanther'],
    messagesPerDay: -1,
    badge: 'Pro Annuel',
  },
];

// ── Payment Request / Response ───────────────────────────────
export interface PaymentRequest {
  planId: string;
  userId: string;
  email: string;
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface MobileMoneyPaymentRequest extends PaymentRequest {
  phoneNumber: string;        // e.g. '+24107XXXXXXX'
  operator: 'airtel' | 'moov';
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  message?: string;
  redirectUrl?: string;       // For card 3DS or USSD confirmation
  expiresAt?: string;         // ISO timestamp for pending payments
}

export interface PaymentStatusResult {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'expired';
  paidAt?: string;
  amount: number;
  currency: string;
}

// ── Provider Interface ───────────────────────────────────────
export interface PaymentProvider {
  /** Unique identifier for this provider */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /** Payment method type this provider handles */
  readonly methodType: PaymentMethodType;

  /** Initiate a payment */
  createPayment(request: PaymentRequest): Promise<PaymentResult>;

  /** Check payment status (for async confirmations like Mobile Money) */
  getPaymentStatus(transactionId: string): Promise<PaymentStatusResult>;

  /** Verify webhook signature from the provider */
  verifyWebhookSignature(payload: string, signature: string): boolean;
}

// ── Format helpers ───────────────────────────────────────────
export function formatXAF(amount: number): string {
  return new Intl.NumberFormat('fr-GA', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
