-- Ñkyel AI — Migration 003 : Resource Management, Quotas, Routing, Queue

-- 1. Beta Configuration (Global states)
CREATE TABLE IF NOT EXISTS beta_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beta_start_at TIMESTAMPTZ NOT NULL,
    beta_end_at TIMESTAMPTZ NOT NULL,
    max_public_users INT NOT NULL DEFAULT 100,
    runpod_beta_budget_usd NUMERIC(10, 4) NOT NULL DEFAULT 7.45,
    fal_budget_usd NUMERIC(10, 4) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Entitlement Profiles (The base templates for tiers)
CREATE TABLE IF NOT EXISTS entitlement_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_name VARCHAR(50) UNIQUE NOT NULL, -- FOUNDER, PRESIDENTIAL_REVIEWER, GOOGLE_REVIEWER, PARTNER, VIP_PREVIEW, PUBLIC_BETA
    priority INT NOT NULL, -- 0 (highest) to 50 (lowest)
    max_active_missions INT NOT NULL,
    max_queued_missions INT NOT NULL,
    max_cumulative_tokens_per_mission BIGINT NOT NULL,
    daily_agent_token_soft_budget BIGINT NOT NULL,
    daily_agent_token_hard_budget BIGINT NOT NULL,
    weekly_agent_token_soft_budget BIGINT,
    deep_research_per_day INT NOT NULL DEFAULT 5,
    searches_per_mission INT NOT NULL DEFAULT 10,
    sources_per_mission INT NOT NULL DEFAULT 40,
    artifacts_per_day INT NOT NULL DEFAULT 20,
    images_beta INT NOT NULL DEFAULT 10,
    videos_beta INT NOT NULL DEFAULT 1,
    video_duration_max INT NOT NULL DEFAULT 5,
    code_builds_per_day INT NOT NULL DEFAULT 10,
    website_builds_per_day INT NOT NULL DEFAULT 5,
    mobile_app_builds_per_day INT NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert base profiles based on the spec
INSERT INTO entitlement_profiles (
    tier_name, priority, max_active_missions, max_queued_missions, max_cumulative_tokens_per_mission,
    daily_agent_token_soft_budget, daily_agent_token_hard_budget, weekly_agent_token_soft_budget,
    deep_research_per_day, searches_per_mission, sources_per_mission, artifacts_per_day,
    images_beta, videos_beta, video_duration_max
) VALUES 
('FOUNDER', 0, 3, 20, 1000000, 3000000, 5000000, 21000000, 30, 100, 200, 100, 20, 5, 10),
('PRESIDENTIAL_REVIEWER', 10, 2, 20, 2000000, 5000000, 8000000, 35000000, 30, 100, 150, 100, 50, 10, 5),
('GOOGLE_REVIEWER', 20, 1, 8, 500000, 1000000, 1500000, 7000000, 10, 50, 80, 30, 5, 2, 5),
('PARTNER', 30, 1, 5, 400000, 750000, 1000000, 5250000, 10, 40, 60, 50, 10, 3, 5),
('VIP_PREVIEW', 40, 1, 3, 300000, 500000, 750000, 3500000, 5, 25, 50, 15, 5, 1, 5),
('PUBLIC_BETA', 50, 1, 2, 2000000, 3000000, 5000000, 15000000, 15, 10, 40, 20, 10, 1, 5)
ON CONFLICT (tier_name) DO NOTHING;


-- 3. User Entitlements
CREATE TABLE IF NOT EXISTS user_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES entitlement_profiles(id),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ, -- NULL means does not expire
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    custom_overrides_json TEXT, -- To override base limits per user
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_entitlements_active ON user_entitlements(user_id) WHERE is_active = TRUE;


-- 4. Quota Usage Ledger
CREATE TABLE IF NOT EXISTS quota_usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- IMAGE, VIDEO, ARTIFACT, MISSION_START, SEARCH
    cost_value INT NOT NULL DEFAULT 1,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    metadata_json TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 5. Provider Accounts
CREATE TABLE IF NOT EXISTS provider_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_type VARCHAR(50) NOT NULL, -- GROQ, GEMINI, RUNPOD, FAL, RUNWAY, TAVILY
    display_internal_name VARCHAR(100) NOT NULL,
    credential_reference VARCHAR(255) NOT NULL, -- e.g., GROQ_API_KEY_01
    project_or_org_reference VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    priority INT NOT NULL DEFAULT 10,
    capabilities TEXT, -- JSON list of capabilities or models
    health_status VARCHAR(50) NOT NULL DEFAULT 'HEALTHY', -- HEALTHY, DEGRADED, THROTTLED, EXHAUSTED, DISABLED, ERROR
    rate_state_json TEXT, -- For storing headers like remaining tokens
    budget_state_json TEXT, -- For tracking monetary limits
    last_success_at TIMESTAMPTZ,
    last_error_at TIMESTAMPTZ,
    last_429_at TIMESTAMPTZ,
    cooldown_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 6. Mission Priority Queue
CREATE TABLE IF NOT EXISTS mission_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id VARCHAR(128) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id),
    entitlement_tier VARCHAR(50) NOT NULL,
    priority INT NOT NULL DEFAULT 50, -- Fetched from entitlement_profile at queue time
    status VARCHAR(32) NOT NULL DEFAULT 'QUEUED', -- QUEUED, CLAIMED, RUNNING, COMPLETED, FAILED, CANCELLED, EXPIRED
    attempts INT NOT NULL DEFAULT 0,
    resource_class VARCHAR(64) DEFAULT 'AGENT',
    estimated_token_budget BIGINT,
    metadata_json TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    claimed_at TIMESTAMPTZ,
    claimed_by VARCHAR(128), -- Worker ID
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    last_error TEXT
);
CREATE INDEX IF NOT EXISTS idx_mission_queue_claim ON mission_queue(status, available_at, priority, requested_at) WHERE status = 'QUEUED';


-- 7. Special Invites
CREATE TABLE IF NOT EXISTS special_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash VARCHAR(512) UNIQUE NOT NULL,
    invite_type VARCHAR(50) NOT NULL, -- PRESIDENTIAL_REVIEWER, GOOGLE_REVIEWER, PARTNER, VIP_PREVIEW
    entitlement_profile UUID REFERENCES entitlement_profiles(id),
    max_redemptions INT NOT NULL DEFAULT 1,
    redemptions_count INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    first_redeemed_at TIMESTAMPTZ,
    redeemed_by_user_id UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    metadata_json TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 8. Model Registry Config
CREATE TABLE IF NOT EXISTS model_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_type VARCHAR(50) NOT NULL,
    model_id VARCHAR(128) NOT NULL,
    capabilities_json TEXT NOT NULL, -- e.g. ["HEAVY_REASONING", "CODING"]
    context_window INT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    priority INT NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider_type, model_id)
);
