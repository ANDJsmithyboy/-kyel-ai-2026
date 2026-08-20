/* Nkyel AI · Checkout Page · SmartANDJ AI Technologies
   Payment method selection + checkout flow (web-only per §9)
   Fondateur : Daniel Jonathan ANDJ */

'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { PLANS, formatXAF } from '@/lib/payments/provider';
import { DURATION, EASE_CSS } from '@/lib/motion';

type PaymentMethod = 'e-billing' | 'mobile-money' | 'card';
type CheckoutState = 'plan' | 'method' | 'processing' | 'success' | 'error';

export default function CheckoutPage() {
  const { user } = useUser();
  const router = useRouter();

  const [state, setState] = useState<CheckoutState>('plan');
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('e-billing');
  const [error, setError] = useState('');

  const plan = PLANS.find(p => p.id === selectedPlan);
  const paidPlans = PLANS.filter(p => p.price > 0);

  async function handleCheckout() {
    if (!plan || !user) return;
    setState('processing');
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          provider: paymentMethod,
          email: user.primaryEmailAddress?.emailAddress || '',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du paiement');
      }

      if (data.redirectUrl) {
        // E-Billing redirect to payment page
        window.location.href = data.redirectUrl;
      } else if (data.status === 'completed') {
        setState('success');
      } else {
        // Pending — show confirmation
        setState('success');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setState('error');
    }
  }

  return (
    <div className="checkout-root">
      <div className="checkout-glow" />
      <div className="checkout-container">

        {/* Header */}
        <header className="checkout-header">
          <button className="checkout-back" onClick={() => router.back()}>← Retour</button>
          <div className="checkout-logo">G</div>
          <h1 className="checkout-title">Passer à Gaboma Pro</h1>
          <p className="checkout-subtitle">Débloquez toute la puissance de l&apos;IA gabonaise</p>
        </header>

        {/* -- STEP: PLAN SELECTION -- */}
        {state === 'plan' && (
          <div className="checkout-step">
            <div className="checkout-plans">
              {paidPlans.map(p => (
                <button
                  key={p.id}
                  className={`checkout-plan-card ${selectedPlan === p.id ? 'selected' : ''} ${p.popular ? 'popular' : ''}`}
                  onClick={() => setSelectedPlan(p.id)}
                  type="button"
                >
                  {p.popular && <span className="checkout-plan-badge">Recommandé</span>}
                  <h3 className="checkout-plan-name">{p.name}</h3>
                  <div className="checkout-plan-price">
                    <span className="checkout-plan-amount">{formatXAF(p.price)}</span>
                    <span className="checkout-plan-interval">/{p.interval === 'month' ? 'mois' : 'an'}</span>
                  </div>
                  <ul className="checkout-plan-features">
                    {p.features.map(f => (
                      <li key={f}>✓ {f}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
            <button
              className="checkout-btn-primary"
              onClick={() => setState('method')}
            >
              Choisir {plan?.name} →
            </button>
          </div>
        )}

        {/* -- STEP: PAYMENT METHOD -- */}
        {state === 'method' && (
          <div className="checkout-step">
            <h2 className="checkout-step-title">Mode de paiement</h2>
            <p className="checkout-step-subtitle">
              {plan?.name} — {formatXAF(plan?.price || 0)}/{plan?.interval === 'month' ? 'mois' : 'an'}
            </p>

            <div className="checkout-methods">
              <button
                className={`checkout-method-card ${paymentMethod === 'e-billing' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('e-billing')}
                type="button"
              >
                <span className="checkout-method-icon">🏦</span>
                <div className="checkout-method-info">
                  <span className="checkout-method-name">E-Billing</span>
                  <span className="checkout-method-desc">Paiement via Mobile Money, tous opérateurs</span>
                </div>
              </button>

              <button
                className={`checkout-method-card ${paymentMethod === 'mobile-money' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('mobile-money')}
                type="button"
              >
                <span className="checkout-method-icon">📱</span>
                <div className="checkout-method-info">
                  <span className="checkout-method-name">Mobile Money Direct</span>
                  <span className="checkout-method-desc">Airtel Money ou Moov Money</span>
                  <span className="checkout-method-badge">Bientôt</span>
                </div>
              </button>

              <button
                className={`checkout-method-card ${paymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('card')}
                type="button"
              >
                <span className="checkout-method-icon">💳</span>
                <div className="checkout-method-info">
                  <span className="checkout-method-name">Carte Bancaire</span>
                  <span className="checkout-method-desc">Visa, Mastercard (3D Secure)</span>
                  <span className="checkout-method-badge">Bientôt</span>
                </div>
              </button>
            </div>

            <div className="checkout-buttons">
              <button className="checkout-btn-back" onClick={() => setState('plan')}>← Retour</button>
              <button
                className="checkout-btn-primary"
                onClick={handleCheckout}
                disabled={paymentMethod !== 'e-billing'}
              >
                Payer {formatXAF(plan?.price || 0)} →
              </button>
            </div>
          </div>
        )}

        {/* -- STEP: PROCESSING -- */}
        {state === 'processing' && (
          <div className="checkout-step checkout-center">
            <div className="checkout-spinner" />
            <h2 className="checkout-step-title">Traitement en cours…</h2>
            <p className="checkout-step-subtitle">
              Connexion avec E-Billing. Vous allez être redirigé vers la page de paiement.
            </p>
          </div>
        )}

        {/* -- STEP: SUCCESS -- */}
        {state === 'success' && (
          <div className="checkout-step checkout-center">
            <div className="checkout-success-icon">✓</div>
            <h2 className="checkout-step-title">Paiement initié !</h2>
            <p className="checkout-step-subtitle">
              Votre abonnement sera activé dès la confirmation du paiement. 
              Vous recevrez une notification.
            </p>
            <button
              className="checkout-btn-primary"
              onClick={() => router.push('/chat')}
            >
              Retour au chat →
            </button>
          </div>
        )}

        {/* -- STEP: ERROR -- */}
        {state === 'error' && (
          <div className="checkout-step checkout-center">
            <div className="checkout-error-icon">✗</div>
            <h2 className="checkout-step-title">Erreur de paiement</h2>
            <p className="checkout-error-text">{error}</p>
            <button
              className="checkout-btn-primary"
              onClick={() => setState('method')}
            >
              Réessayer →
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="checkout-footer">
          <p>🔒 Paiement sécurisé · Vos données sont chiffrées</p>
          <p>SMARTANDJ AI TECHNOLOGIES · Nkyel AI 2026</p>
        </footer>
      </div>

      <style>{`
        .checkout-root {
          min-height: 100vh;
          background: var(--bg, #020304);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 24px 20px;
          position: relative;
          overflow: hidden;
        }
        .checkout-glow {
          position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
          width: 600px; height: 600px;
          background: radial-gradient(circle, var(--accent, #C5A059) 0%, transparent 70%);
          opacity: 0.06; pointer-events: none;
        }
        .checkout-container {
          position: relative; width: 100%; max-width: 520px;
          display: flex; flex-direction: column; gap: 28px;
        }

        /* Header */
        .checkout-header { text-align: center; }
        .checkout-back {
          display: inline-block; font-size: 13px;
          color: var(--accent, #C5A059); background: none; border: none;
          cursor: pointer; margin-bottom: 16px;
        }
        .checkout-logo {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--accent, #C5A059); display: flex;
          align-items: center; justify-content: center;
          font-size: 26px; font-weight: 800; color: var(--bg, #020304);
          margin: 0 auto 12px;
          box-shadow: 0 4px 24px rgba(197, 160, 89, 0.25);
        }
        .checkout-title {
          font-size: 24px; font-weight: 700;
          color: var(--text, #EDEAE3); margin: 0;
        }
        .checkout-subtitle {
          font-size: 14px; color: var(--text-secondary, #8A8378); margin: 4px 0 0;
        }

        /* Step */
        .checkout-step {
          display: flex; flex-direction: column; gap: 16px;
          animation: ck-fade 0.22s ${EASE_CSS.decelerate};
        }
        .checkout-center { align-items: center; text-align: center; padding: 40px 0; }
        @keyframes ck-fade { from { opacity: 0; } to { opacity: 1; } }
        .checkout-step-title {
          font-size: 18px; font-weight: 600;
          color: var(--text, #EDEAE3); margin: 0;
        }
        .checkout-step-subtitle {
          font-size: 13px; color: var(--text-secondary, #8A8378); margin: 0;
        }

        /* Plans */
        .checkout-plans { display: flex; flex-direction: column; gap: 12px; }
        .checkout-plan-card {
          background: var(--surface, #0A0908);
          border: 1px solid rgba(197, 160, 89, 0.08);
          border-radius: 16px; padding: 20px; text-align: left;
          cursor: pointer; transition: all ${DURATION.fast}s;
          position: relative; overflow: hidden;
          width: 100%; color: var(--text, #EDEAE3);
        }
        .checkout-plan-card:hover { border-color: rgba(197, 160, 89, 0.2); }
        .checkout-plan-card.selected {
          border-color: var(--accent, #C5A059);
          background: rgba(197, 160, 89, 0.06);
        }
        .checkout-plan-badge {
          position: absolute; top: 12px; right: 12px;
          background: var(--accent, #C5A059); color: var(--bg, #020304);
          font-size: 10px; font-weight: 700; padding: 4px 10px;
          border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .checkout-plan-name {
          font-size: 16px; font-weight: 600; margin: 0 0 8px;
          color: var(--text, #EDEAE3);
        }
        .checkout-plan-price { display: flex; align-items: baseline; gap: 2px; margin-bottom: 12px; }
        .checkout-plan-amount {
          font-size: 28px; font-weight: 700; color: var(--accent, #C5A059);
        }
        .checkout-plan-interval { font-size: 14px; color: var(--text-secondary, #8A8378); }
        .checkout-plan-features {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 6px;
        }
        .checkout-plan-features li {
          font-size: 13px; color: var(--text-secondary, #8A8378);
        }

        /* Payment Methods */
        .checkout-methods { display: flex; flex-direction: column; gap: 10px; }
        .checkout-method-card {
          display: flex; align-items: center; gap: 14px;
          padding: 16px; background: var(--surface, #0A0908);
          border: 1px solid rgba(197, 160, 89, 0.08);
          border-radius: 12px; cursor: pointer;
          transition: all ${DURATION.fast}s; text-align: left; width: 100%;
          color: var(--text, #EDEAE3);
        }
        .checkout-method-card:hover { border-color: rgba(197, 160, 89, 0.2); }
        .checkout-method-card.selected {
          border-color: var(--accent, #C5A059);
          background: rgba(197, 160, 89, 0.06);
        }
        .checkout-method-icon { font-size: 24px; }
        .checkout-method-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .checkout-method-name { font-size: 14px; font-weight: 600; }
        .checkout-method-desc { font-size: 12px; color: var(--text-secondary, #8A8378); }
        .checkout-method-badge {
          display: inline-block; font-size: 10px; font-weight: 600;
          color: var(--accent, #C5A059); background: rgba(197, 160, 89, 0.1);
          padding: 2px 8px; border-radius: 10px; width: fit-content; margin-top: 2px;
        }

        /* Buttons */
        .checkout-buttons { display: flex; gap: 12px; }
        .checkout-btn-back {
          padding: 14px 20px; background: transparent;
          border: 1px solid rgba(197, 160, 89, 0.08);
          border-radius: 12px; color: var(--text-secondary, #8A8378);
          font-size: 14px; font-weight: 500; cursor: pointer;
        }
        .checkout-btn-primary {
          flex: 1; padding: 14px 24px;
          background: var(--accent, #C5A059);
          color: var(--bg, #020304);
          font-size: 14px; font-weight: 600; border: none;
          border-radius: 12px; cursor: pointer;
          transition: opacity ${DURATION.fast}s, transform ${DURATION.fast}s;
        }
        .checkout-btn-primary:hover:not(:disabled) { opacity: 0.9; }
        .checkout-btn-primary:active:not(:disabled) { transform: scale(0.97); }
        .checkout-btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }

        /* States */
        .checkout-spinner {
          width: 48px; height: 48px;
          border: 3px solid rgba(197, 160, 89, 0.2);
          border-top-color: var(--accent, #C5A059);
          border-radius: 50%;
          animation: ck-spin 0.8s linear infinite;
          margin-bottom: 16px;
        }
        @keyframes ck-spin { to { transform: rotate(360deg); } }
        .checkout-success-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(31, 157, 107, 0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; color: #1F9D6B;
          margin-bottom: 16px;
          animation: ck-pop 0.4s ${EASE_CSS.decelerate};
        }
        @keyframes ck-pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .checkout-error-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(224, 88, 75, 0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; color: #E0584B;
          margin-bottom: 16px;
        }
        .checkout-error-text {
          font-size: 13px; color: #E0584B; margin: 0;
          background: rgba(224, 88, 75, 0.08); padding: 12px;
          border-radius: 10px; width: 100%;
        }

        /* Footer */
        .checkout-footer {
          text-align: center; padding: 20px 0;
        }
        .checkout-footer p {
          font-size: 10px; font-weight: 600; letter-spacing: 0.5px;
          color: var(--text-tertiary, #5C5648); margin: 4px 0;
        }
      `}</style>
    </div>
  );
}
