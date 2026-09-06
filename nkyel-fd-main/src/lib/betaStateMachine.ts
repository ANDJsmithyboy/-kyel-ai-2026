/**
 * Ñkyel AI · Beta State Machine & Client · SmartANDJ AI Technologies
 * Gestionnaire d'état de la Bêta Privée 42 heures (22-24 Août 2026).
 * Fondateur : Daniel Jonathan ANDJ
 */

export type BetaState =
  | 'PRELAUNCH'
  | 'OPEN'
  | 'CAPACITY_REACHED'
  | 'PUBLIC_CLOSED'
  | 'INTERNAL_POLISH'
  | 'GOOGLE_CANDIDATE'
  | 'DISABLED';

export interface BetaStatusResponse {
  state: BetaState;
  admitted?: boolean;
  bypass_reason?: 'admin' | 'review' | 'enrollment' | null;
  campaign: {
    slug: string;
    name: string;
    max_seats: number;
    claimed_seats: number;
    remaining_seats: number;
    starts_at_utc: string;
    public_ends_at_utc: string;
    starts_at_libreville: string;
    public_ends_at_libreville: string;
    duration_hours: number;
  };
  server_time: {
    utc: string;
    libreville: string;
    seconds_remaining: number;
  };
  official_message: string;
  user_enrollment: {
    enrolled: boolean;
    seat_number?: number;
    status?: string;
    enrolled_at?: string;
    feedback_completed?: boolean;
  };
}

export interface BetaFeedbackPayload {
  overall_rating: number;
  goal_attempted: string;
  task_succeeded: boolean;
  favorite_feature: string;
  issues_encountered?: string;
  priority_improvement: string;
  likely_to_reuse: number;
  nps_score: number;
  willingness_to_pay: string;
  price_bracket?: string;
  african_context_interest: string;
  locale_used?: string;
  quote_consent?: boolean;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.nkyel.smartandjai.com';

export async function fetchBetaStatus(
  getToken?: () => Promise<string | null>
): Promise<BetaStatusResponse> {
  const headers: Record<string, string> = {};
  if (getToken) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}/api/v1/beta/status`, {
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) {
    throw new Error('Impossible de récupérer le statut de la Bêta.');
  }
  return res.json();
}

export async function enrollInBeta(locale: string = 'fr'): Promise<{ success: boolean; seat_number: number; message: string }> {
  const backendBase = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL) || '';
  const res = await fetch(`${backendBase}/api/v1/beta/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale, terms_version: '1.0' }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Échec de l'inscription à la Bêta.");
  }
  return data;
}

export async function submitBetaFeedback(payload: BetaFeedbackPayload): Promise<{ success: boolean; feedback_id: string }> {
  const backendBase = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL) || '';
  const res = await fetch(`${backendBase}/api/v1/beta/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Échec de l'enregistrement du feedback.");
  }
  return data;
}
