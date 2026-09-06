-- ======================================================================
-- Ñkyel AI · Migration 005 : Schéma Bêta Souverain (tables beta_* avec FK users)
-- SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
-- ======================================================================
--
-- Objectif : créer les tables beta_* qui manquent en production.
-- Aucun DROP, aucune destruction. Tout est IF NOT EXISTS et idempotent.
-- Les FK pointent vers la table canonique users (modèle SQLAlchemy).
-- ======================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS beta_campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    name text NOT NULL,
    starts_at timestamptz NOT NULL,
    public_ends_at timestamptz NOT NULL,
    max_seats integer NOT NULL DEFAULT 100 CHECK (max_seats > 0),
    claimed_seats integer NOT NULL DEFAULT 0 CHECK (claimed_seats >= 0 AND claimed_seats <= max_seats),
    feedback_required boolean NOT NULL DEFAULT true,
    forced_state text CHECK (forced_state IN ('PRELAUNCH', 'OPEN', 'CAPACITY_REACHED', 'PUBLIC_CLOSED', 'INTERNAL_POLISH', 'GOOGLE_CANDIDATE', 'DISABLED')),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS beta_enrollments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid NOT NULL REFERENCES beta_campaigns(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clerk_user_id text NOT NULL,
    seat_number integer NOT NULL CHECK (seat_number >= 1 AND seat_number <= 100),
    status text NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'active', 'completed', 'revoked', 'waitlist')),
    enrolled_at timestamptz NOT NULL DEFAULT now(),
    first_task_at timestamptz,
    last_activity_at timestamptz,
    feedback_completed_at timestamptz,
    terms_version text NOT NULL DEFAULT '1.0',
    locale text NOT NULL DEFAULT 'fr',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_beta_campaign_user UNIQUE (campaign_id, user_id),
    CONSTRAINT uq_beta_campaign_seat UNIQUE (campaign_id, seat_number)
);

CREATE INDEX IF NOT EXISTS idx_beta_enrollments_user ON beta_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_enrollments_clerk ON beta_enrollments(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_beta_enrollments_seat ON beta_enrollments(campaign_id, seat_number);

CREATE TABLE IF NOT EXISTS beta_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key text NOT NULL UNIQUE,
    campaign_id uuid REFERENCES beta_campaigns(id) ON DELETE SET NULL,
    enrollment_id uuid REFERENCES beta_enrollments(id) ON DELETE SET NULL,
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    event_name text NOT NULL,
    thread_id text,
    run_id text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_beta_events_name ON beta_events(event_name);
CREATE INDEX IF NOT EXISTS idx_beta_events_user ON beta_events(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_events_run ON beta_events(run_id);
CREATE INDEX IF NOT EXISTS idx_beta_events_time ON beta_events(occurred_at DESC);

CREATE TABLE IF NOT EXISTS beta_feedback_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid REFERENCES beta_campaigns(id) ON DELETE CASCADE,
    enrollment_id uuid REFERENCES beta_enrollments(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clerk_user_id text NOT NULL,
    overall_rating integer NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    goal_attempted text NOT NULL,
    task_succeeded boolean NOT NULL,
    favorite_feature text NOT NULL,
    issues_encountered text,
    priority_improvement text NOT NULL,
    likely_to_reuse integer NOT NULL CHECK (likely_to_reuse >= 1 AND likely_to_reuse <= 5),
    nps_score integer NOT NULL CHECK (nps_score >= 0 AND nps_score <= 10),
    willingness_to_pay text NOT NULL,
    price_bracket text,
    african_context_interest text NOT NULL,
    locale_used text NOT NULL DEFAULT 'fr',
    quote_consent boolean NOT NULL DEFAULT false,
    submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_beta_feedback_user ON beta_feedback_records(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_rating ON beta_feedback_records(overall_rating);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_nps ON beta_feedback_records(nps_score);

-- Idempotent seed : campagne officielle Bêta (créée ou mise à jour)
INSERT INTO beta_campaigns (
    slug,
    name,
    starts_at,
    public_ends_at,
    max_seats,
    claimed_seats,
    feedback_required,
    is_active
) VALUES (
    'beta-pioneer-august-2026',
    'Bêta Privée Ñkyel AI — 100 Pionniers (22-24 Août 2026)',
    '2026-08-22T11:00:00Z',
    '2026-08-24T05:00:00Z',
    100,
    0,
    true,
    true
) ON CONFLICT (slug) DO UPDATE SET
    starts_at = EXCLUDED.starts_at,
    public_ends_at = EXCLUDED.public_ends_at,
    max_seats = EXCLUDED.max_seats,
    updated_at = now();

COMMIT;
