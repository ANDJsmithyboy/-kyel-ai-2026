-- Ñkyel AI — Google Review Private Access SQL Schema
-- SmartANDJ AI Technologies

CREATE TABLE IF NOT EXISTS review_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    audience VARCHAR(50) NOT NULL DEFAULT 'google_reviewers',
    access_profile JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    use_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS review_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invitation_id UUID NOT NULL REFERENCES review_invitations(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS review_quota_usage (
    session_id UUID PRIMARY KEY REFERENCES review_sessions(id) ON DELETE CASCADE,
    quota_profile VARCHAR(50) DEFAULT 'unlimited',
    tokens_input BIGINT DEFAULT 0,
    tokens_output BIGINT DEFAULT 0,
    images_generated INTEGER DEFAULT 0,
    videos_generated INTEGER DEFAULT 0,
    searches_performed INTEGER DEFAULT 0,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
