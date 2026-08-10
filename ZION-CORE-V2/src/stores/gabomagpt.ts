/* GabomaGPT · gabomagpt.ts · SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Store principal : plan, jetons, paiement */

import { create } from 'zustand';

/* ── Types ────────────────────────────────────────── */
export type PlanKey = 'flash' | 'pro' | 'elite' | 'panther' | 'panther_pro';
export type PaymentStep = 'choose_plan' | 'choose_operator' | 'processing' | 'success' | 'error';
export type OperatorKey = 'airtel' | 'moov';

export interface PlanConfig {
  name: string;
  price: number;
  currency: string;
  tokens: number;
  tokensReset: 'daily' | 'one-time';
  color: string;
}

export const PLANS: Record<string, PlanConfig> = {
  flash: { name: 'GabomaGPT Flash', price: 0, currency: 'FCFA', tokens: 50, tokensReset: 'daily', color: '#22C55E' },
  pro: { name: 'GabomaGPT Pro', price: 2500, currency: 'FCFA', tokens: 500, tokensReset: 'one-time', color: '#38BDF8' },
  elite: { name: 'GabomaGPT Élite', price: 13000, currency: 'FCFA', tokens: 3000, tokensReset: 'one-time', color: '#FACC15' },
};

/* ── State ────────────────────────────────────────── */
interface GabomaState {
  plan: PlanKey;
  tokens: number;
  tokensMax: number;
  isPantherMode: boolean;
  isPaymentModalOpen: boolean;
  isUpgradeModalOpen: boolean;
  paymentStep: PaymentStep;
  targetPlan: PlanKey | null;
  targetOperator: OperatorKey | null;
  userName: string;
  userEmail: string;
  language: string;
  isThinking: boolean;
  thinkingMessage: string;

  /* Actions */
  consumeTokens: (amount: number) => boolean;
  creditTokens: (amount: number) => void;
  setPlan: (plan: PlanKey) => void;
  openPaymentModal: (targetPlan?: PlanKey | null) => void;
  closePaymentModal: () => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  setThinking: (thinking: boolean, message?: string) => void;
  setUser: (name: string, email: string) => void;
  reset: () => void;
}

const STORAGE_KEY = 'gabomagpt_state';

function loadPersisted(): Partial<GabomaState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(state: Partial<GabomaState>) {
  if (typeof window === 'undefined') return;
  try {
    const { isPaymentModalOpen, isUpgradeModalOpen, paymentStep, targetPlan, targetOperator, isThinking, thinkingMessage, ...rest } = state as GabomaState;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch { /* noop */ }
}

const defaults: Omit<GabomaState, 'consumeTokens' | 'creditTokens' | 'setPlan' | 'openPaymentModal' | 'closePaymentModal' | 'openUpgradeModal' | 'closeUpgradeModal' | 'setThinking' | 'setUser' | 'reset'> = {
  plan: 'flash',
  tokens: 50,
  tokensMax: 50,
  isPantherMode: false,
  isPaymentModalOpen: false,
  isUpgradeModalOpen: false,
  paymentStep: 'choose_plan',
  targetPlan: null,
  targetOperator: null,
  userName: '',
  userEmail: '',
  language: 'fr',
  isThinking: false,
  thinkingMessage: '',
};

export const useGabomaStore = create<GabomaState>((set, get) => ({
  ...defaults,
  ...loadPersisted(),

  consumeTokens: (amount: number) => {
    const s = get();
    if (s.tokens >= amount) {
      const next = { ...s, tokens: s.tokens - amount };
      set(next);
      persist(next);
      return true;
    }
    set({ isPaymentModalOpen: true });
    return false;
  },

  creditTokens: (amount: number) => {
    const s = get();
    const next = { ...s, tokens: Math.min(s.tokens + amount, s.tokensMax) };
    set(next);
    persist(next);
  },

  setPlan: (plan: PlanKey) => {
    const cfg = PLANS[plan];
    if (!cfg) return;
    const next = { plan, tokens: cfg.tokens, tokensMax: cfg.tokens };
    set(next);
    persist({ ...get(), ...next });
  },

  openPaymentModal: (targetPlan = null) =>
    set({ isPaymentModalOpen: true, isUpgradeModalOpen: false, targetPlan, paymentStep: 'choose_plan' }),

  closePaymentModal: () =>
    set({ isPaymentModalOpen: false, targetPlan: null, paymentStep: 'choose_plan', targetOperator: null }),

  openUpgradeModal: () => set({ isUpgradeModalOpen: true }),
  closeUpgradeModal: () => set({ isUpgradeModalOpen: false }),

  setThinking: (thinking: boolean, message = '') =>
    set({ isThinking: thinking, thinkingMessage: message }),

  setUser: (name: string, email: string) => {
    set({ userName: name, userEmail: email });
    persist({ ...get(), userName: name, userEmail: email });
  },

  reset: () => {
    set(defaults);
    persist(defaults as GabomaState);
    if (typeof window !== 'undefined') document.body.classList.remove('mode-bp', 'panther');
  },
}));

/* ── Derived selectors ──────────────────────────────── */
export const selectTokensPercent = (s: GabomaState) =>
  s.tokensMax > 0 ? Math.round((s.tokens / s.tokensMax) * 100) : 0;
export const selectIsLowTokens = (s: GabomaState) =>
  s.tokensMax > 0 ? s.tokens / s.tokensMax < 0.2 : false;
