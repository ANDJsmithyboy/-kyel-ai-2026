-- ======================================================================
-- Ñkyel AI · Schéma SQL PostgreSQL / Neon de Référence (Section 40 & 41)
-- SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
-- ======================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE SCHEMA IF NOT EXISTS nkyel;
SET search_path TO nkyel, public;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 1. Utilisateurs & Identités
CREATE TABLE IF NOT EXISTS app_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id text NOT NULL UNIQUE,
    primary_email citext,
    first_name text,
    last_name text,
    display_name text,
    avatar_url text,
    locale text NOT NULL DEFAULT 'fr',
    timezone text NOT NULL DEFAULT 'Africa/Libreville',
    country_code char(2),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_deletion', 'deleted')),
    onboarding_completed boolean NOT NULL DEFAULT false,
    last_seen_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS user_identities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    provider text NOT NULL,
    provider_user_id text,
    email citext,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (provider, provider_user_id)
);

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id uuid PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
    interface_locale text NOT NULL DEFAULT 'fr',
    conversation_locale text,
    research_locale text,
    timezone text NOT NULL DEFAULT 'Africa/Libreville',
    theme text NOT NULL DEFAULT 'dark',
    low_bandwidth_mode boolean NOT NULL DEFAULT false,
    memory_enabled boolean NOT NULL DEFAULT true,
    personalization_enabled boolean NOT NULL DEFAULT true,
    email_notifications boolean NOT NULL DEFAULT true,
    product_updates boolean NOT NULL DEFAULT false,
    settings jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_organization_id text UNIQUE,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    logo_url text,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    settings jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS organization_members (
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    clerk_membership_id text UNIQUE,
    role text NOT NULL DEFAULT 'member',
    permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
    joined_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS clerk_webhook_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_event_id text NOT NULL UNIQUE,
    event_type text NOT NULL,
    payload_hash text NOT NULL,
    status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed', 'ignored')),
    attempts integer NOT NULL DEFAULT 0,
    last_error text,
    received_at timestamptz NOT NULL DEFAULT now(),
    processed_at timestamptz
);

CREATE TABLE IF NOT EXISTS legal_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type text NOT NULL CHECK (document_type IN (
        'terms', 'privacy', 'cookies', 'acceptable_use', 'data_processing', 'beta_terms'
    )),
    version text NOT NULL,
    locale text NOT NULL,
    title text NOT NULL,
    content_hash text NOT NULL,
    published_at timestamptz NOT NULL,
    effective_at timestamptz NOT NULL,
    url text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    UNIQUE (document_type, version, locale)
);

CREATE TABLE IF NOT EXISTS user_consents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    legal_document_id uuid REFERENCES legal_documents(id) ON DELETE RESTRICT,
    consent_type text NOT NULL,
    granted boolean NOT NULL,
    source text NOT NULL,
    ip_hash text,
    user_agent_hash text,
    created_at timestamptz NOT NULL DEFAULT now(),
    revoked_at timestamptz
);

-- 2. Projets & Cloisonnement
CREATE TABLE IF NOT EXISTS projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    default_locale text,
    visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'organization', 'shared')),
    settings jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    archived_at timestamptz,
    deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS project_members (
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, user_id)
);

-- 3. Agents & Capacités
CREATE TABLE IF NOT EXISTS agent_definitions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    agent_type text NOT NULL,
    version text NOT NULL DEFAULT '1.0.0',
    instructions_ref text,
    capabilities jsonb NOT NULL DEFAULT '[]'::jsonb,
    model_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
    tool_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
    memory_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_system boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Threads & Messages
CREATE TABLE IF NOT EXISTS threads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
    deerflow_thread_id text UNIQUE,
    title text NOT NULL DEFAULT 'Nouvelle mission',
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'running', 'paused', 'completed', 'failed', 'archived')),
    interface_locale text,
    conversation_locale text,
    model_provider text,
    model_id text,
    active_branch_id uuid,
    settings jsonb NOT NULL DEFAULT '{}'::jsonb,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    last_message_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    archived_at timestamptz,
    deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS thread_members (
    thread_id uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (thread_id, user_id)
);

CREATE TABLE IF NOT EXISTS object_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
    thread_id uuid REFERENCES threads(id) ON DELETE SET NULL,
    storage_provider text NOT NULL DEFAULT 'r2',
    bucket text NOT NULL,
    object_key text NOT NULL,
    original_name text NOT NULL,
    mime_type text NOT NULL,
    size_bytes bigint NOT NULL CHECK (size_bytes >= 0),
    checksum_sha256 text,
    encryption_key_ref text,
    scan_status text NOT NULL DEFAULT 'pending' CHECK (scan_status IN ('pending', 'clean', 'infected', 'failed')),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,
    UNIQUE (storage_provider, bucket, object_key)
);

CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    sender_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
    agent_id uuid REFERENCES agent_definitions(id) ON DELETE SET NULL,
    parent_message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
    branch_id uuid,
    sequence bigint NOT NULL,
    role text NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'agent', 'tool')),
    status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'streaming', 'completed', 'cancelled', 'failed')),
    content_text text,
    content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
    language_tag text,
    model_provider text,
    model_id text,
    input_tokens integer,
    output_tokens integer,
    latency_ms integer,
    error_code text,
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    edited_at timestamptz,
    deleted_at timestamptz,
    UNIQUE (thread_id, sequence)
);

CREATE TABLE IF NOT EXISTS message_parts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    part_index integer NOT NULL,
    part_type text NOT NULL CHECK (part_type IN (
        'text', 'reasoning_summary', 'image', 'audio', 'video', 'file', 'code', 'citation', 'tool_call', 'artifact', 'error'
    )),
    text_content text,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    file_id uuid REFERENCES object_files(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (message_id, part_index)
);

-- 5. Runs & Événements d'Exécution
CREATE TABLE IF NOT EXISTS runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    initiated_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
    deerflow_run_id text UNIQUE,
    parent_run_id uuid REFERENCES runs(id) ON DELETE SET NULL,
    status text NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued', 'running', 'paused', 'completed', 'cancelled', 'failed', 'expired'
    )),
    objective text,
    plan jsonb NOT NULL DEFAULT '{}'::jsonb,
    configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
    started_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    error jsonb
);

CREATE TABLE IF NOT EXISTS run_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    run_id uuid NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    sequence bigint NOT NULL,
    event_type text NOT NULL,
    node_external_id text,
    parent_node_external_id text,
    agent_external_id text,
    tool_external_id text,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    occurred_at timestamptz NOT NULL DEFAULT now(),
    persisted_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (run_id, sequence)
);

CREATE TABLE IF NOT EXISTS tool_calls (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id uuid NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
    agent_id uuid REFERENCES agent_definitions(id) ON DELETE SET NULL,
    tool_name text NOT NULL,
    tool_kind text NOT NULL,
    protocol text,
    external_call_id text,
    input_redacted jsonb NOT NULL DEFAULT '{}'::jsonb,
    output_redacted jsonb,
    status text NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed', 'cancelled')),
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    latency_ms integer,
    error jsonb
);

-- 6. Sources & Preuves
CREATE TABLE IF NOT EXISTS sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    run_id uuid REFERENCES runs(id) ON DELETE CASCADE,
    created_by_agent_id uuid REFERENCES agent_definitions(id) ON DELETE SET NULL,
    source_type text NOT NULL,
    canonical_url text,
    domain text,
    title text,
    author text,
    published_at timestamptz,
    accessed_at timestamptz NOT NULL DEFAULT now(),
    original_language text,
    excerpt text,
    content_hash text,
    relevance_score numeric(5,4),
    verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'contradictory')),
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS citations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    source_id uuid NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    citation_index integer NOT NULL,
    claim_text text,
    locator text,
    confidence numeric(5,4),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (message_id, citation_index)
);

-- 7. WorkGraph Spatio-Temporel & Versions
CREATE TABLE IF NOT EXISTS workgraph_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    run_id uuid REFERENCES runs(id) ON DELETE SET NULL,
    version_number integer NOT NULL,
    created_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
    reason text,
    snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (thread_id, version_number)
);

CREATE TABLE IF NOT EXISTS workgraph_nodes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    run_id uuid REFERENCES runs(id) ON DELETE CASCADE,
    graph_version_id uuid NOT NULL REFERENCES workgraph_versions(id) ON DELETE CASCADE,
    external_node_id text NOT NULL,
    parent_external_node_id text,
    node_type text NOT NULL,
    label text NOT NULL,
    status text NOT NULL,
    position_x double precision,
    position_y double precision,
    agent_id uuid REFERENCES agent_definitions(id) ON DELETE SET NULL,
    source_id uuid REFERENCES sources(id) ON DELETE SET NULL,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (graph_version_id, external_node_id)
);

CREATE TABLE IF NOT EXISTS workgraph_edges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    graph_version_id uuid NOT NULL REFERENCES workgraph_versions(id) ON DELETE CASCADE,
    source_external_node_id text NOT NULL,
    target_external_node_id text NOT NULL,
    relation_type text NOT NULL,
    label text,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS checkpoint_metadata (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    run_id uuid REFERENCES runs(id) ON DELETE CASCADE,
    deerflow_checkpoint_id text NOT NULL,
    parent_checkpoint_id text,
    label text,
    created_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (thread_id, deerflow_checkpoint_id)
);

CREATE TABLE IF NOT EXISTS human_interventions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id uuid NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    run_id uuid REFERENCES runs(id) ON DELETE SET NULL,
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    graph_version_before uuid REFERENCES workgraph_versions(id) ON DELETE SET NULL,
    graph_version_after uuid REFERENCES workgraph_versions(id) ON DELETE SET NULL,
    intervention_type text NOT NULL,
    target_node_id text,
    old_value jsonb,
    new_value jsonb,
    reason text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'applied', 'failed')),
    created_at timestamptz NOT NULL DEFAULT now(),
    applied_at timestamptz,
    error jsonb
);

-- 8. Artefacts & Fichiers
CREATE TABLE IF NOT EXISTS artifacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
    thread_id uuid REFERENCES threads(id) ON DELETE CASCADE,
    run_id uuid REFERENCES runs(id) ON DELETE SET NULL,
    title text NOT NULL,
    artifact_type text NOT NULL,
    status text NOT NULL DEFAULT 'ready' CHECK (status IN ('generating', 'ready', 'failed', 'archived')),
    current_version integer NOT NULL DEFAULT 1,
    visibility text NOT NULL DEFAULT 'private',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS artifact_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    artifact_id uuid NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
    version_number integer NOT NULL,
    file_id uuid REFERENCES object_files(id) ON DELETE SET NULL,
    content_text text,
    content_json jsonb,
    mime_type text,
    size_bytes bigint,
    checksum_sha256 text,
    created_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
    created_by_agent_id uuid REFERENCES agent_definitions(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (artifact_id, version_number)
);

-- 9. Mémoires Cognitives & Embeddings
CREATE TABLE IF NOT EXISTS memories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    thread_id uuid REFERENCES threads(id) ON DELETE CASCADE,
    agent_id uuid REFERENCES agent_definitions(id) ON DELETE CASCADE,
    namespace text NOT NULL,
    memory_type text NOT NULL,
    content_text text NOT NULL,
    original_language text,
    canonical_language text,
    importance numeric(5,4),
    confidence numeric(5,4),
    source_message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
    consent_basis text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    valid_from timestamptz NOT NULL DEFAULT now(),
    valid_until timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS memory_chunks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id uuid NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    chunk_index integer NOT NULL,
    content_text text NOT NULL,
    embedding_model text,
    embedding vector,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (memory_id, chunk_index)
);

-- 10. MCP, Skills, Planification & Logs
CREATE TABLE IF NOT EXISTS mcp_connections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    transport text NOT NULL,
    endpoint text,
    secret_reference text,
    capabilities jsonb NOT NULL DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'disabled',
    last_healthcheck_at timestamptz,
    last_error text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skill_definitions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL,
    version text NOT NULL,
    source_type text NOT NULL,
    source_reference text,
    manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
    checksum_sha256 text,
    is_official boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (slug, version)
);

CREATE TABLE IF NOT EXISTS skill_installations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id uuid NOT NULL REFERENCES skill_definitions(id) ON DELETE CASCADE,
    owner_user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    enabled boolean NOT NULL DEFAULT true,
    configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
    secret_reference text,
    installed_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    thread_id uuid REFERENCES threads(id) ON DELETE CASCADE,
    name text NOT NULL,
    schedule_type text NOT NULL,
    schedule_expression text NOT NULL,
    timezone text NOT NULL,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    status text NOT NULL DEFAULT 'active',
    next_run_at timestamptz,
    last_run_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS message_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    rating text NOT NULL CHECK (rating IN ('positive', 'negative')),
    reason_code text,
    comment text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, message_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    notification_type text NOT NULL,
    title text NOT NULL,
    body text,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    read_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usage_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
    organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
    thread_id uuid REFERENCES threads(id) ON DELETE SET NULL,
    run_id uuid REFERENCES runs(id) ON DELETE SET NULL,
    event_type text NOT NULL,
    provider text,
    model_id text,
    quantity numeric NOT NULL DEFAULT 0,
    unit text,
    estimated_cost numeric(18,8),
    currency char(3) NOT NULL DEFAULT 'USD',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
    organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id text,
    request_id text,
    ip_hash text,
    user_agent_hash text,
    before_data jsonb,
    after_data jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS idempotency_records (
    key text PRIMARY KEY,
    scope text NOT NULL,
    request_hash text NOT NULL,
    response_code integer,
    response_body jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS data_export_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'queued',
    file_id uuid REFERENCES object_files(id) ON DELETE SET NULL,
    requested_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    expires_at timestamptz,
    error text
);

CREATE TABLE IF NOT EXISTS deletion_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'pending',
    requested_at timestamptz NOT NULL DEFAULT now(),
    scheduled_for timestamptz,
    completed_at timestamptz,
    cancellation_deadline timestamptz,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS backup_manifests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_type text NOT NULL,
    storage_provider text NOT NULL,
    object_key text NOT NULL,
    checksum_sha256 text NOT NULL,
    encrypted boolean NOT NULL DEFAULT true,
    database_timestamp timestamptz NOT NULL,
    size_bytes bigint,
    status text NOT NULL DEFAULT 'created',
    restore_tested_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz
);

-- ─── INDEX OPTIMISÉS ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_threads_owner_recent ON threads (owner_user_id, last_message_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_threads_project ON threads (project_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_thread_sequence ON messages (thread_id, sequence);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_runs_thread_created ON runs (thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_run_events_run_sequence ON run_events (run_id, sequence);
CREATE INDEX IF NOT EXISTS idx_run_events_thread_time ON run_events (thread_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_sources_thread ON sources (thread_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sources_url ON sources (canonical_url);
CREATE INDEX IF NOT EXISTS idx_workgraph_nodes_version ON workgraph_nodes (graph_version_id, node_type);
CREATE INDEX IF NOT EXISTS idx_artifacts_thread ON artifacts (thread_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_memories_namespace ON memories (owner_user_id, namespace) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_memories_project ON memories (project_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tool_calls_run ON tool_calls (run_id, started_at);
CREATE INDEX IF NOT EXISTS idx_audit_actor_time ON audit_logs (actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id, created_at DESC) WHERE read_at IS NULL;

-- ─── TRIGGERS AUTOMATIQUES ─────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_app_users_updated ON app_users;
CREATE TRIGGER trg_app_users_updated BEFORE UPDATE ON app_users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_user_preferences_updated ON user_preferences;
CREATE TRIGGER trg_user_preferences_updated BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_organizations_updated ON organizations;
CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated ON projects;
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_threads_updated ON threads;
CREATE TRIGGER trg_threads_updated BEFORE UPDATE ON threads FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_runs_updated ON runs;
CREATE TRIGGER trg_runs_updated BEFORE UPDATE ON runs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_artifacts_updated ON artifacts;
CREATE TRIGGER trg_artifacts_updated BEFORE UPDATE ON artifacts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_memories_updated ON memories;
CREATE TRIGGER trg_memories_updated BEFORE UPDATE ON memories FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── ROW LEVEL SECURITY (SECTION 41) ──────────────────────────────
CREATE OR REPLACE FUNCTION current_user_id() RETURNS uuid LANGUAGE sql STABLE AS $$
    SELECT NULLIF( current_setting('nkyel.current_user_id', true), '' )::uuid
$$;

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

ALTER TABLE app_users FORCE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;
ALTER TABLE threads FORCE ROW LEVEL SECURITY;
ALTER TABLE messages FORCE ROW LEVEL SECURITY;
ALTER TABLE memories FORCE ROW LEVEL SECURITY;
ALTER TABLE artifacts FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'app_users_self') THEN
        CREATE POLICY app_users_self ON app_users FOR ALL USING (id = current_user_id()) WITH CHECK (id = current_user_id());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'threads_authorized') THEN
        CREATE POLICY threads_authorized ON threads FOR ALL USING (
            owner_user_id = current_user_id()
            OR EXISTS (SELECT 1 FROM thread_members tm WHERE tm.thread_id = threads.id AND tm.user_id = current_user_id())
        ) WITH CHECK (
            owner_user_id = current_user_id()
            OR EXISTS (SELECT 1 FROM thread_members tm WHERE tm.thread_id = threads.id AND tm.user_id = current_user_id() AND tm.role IN ('owner', 'editor'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'messages_through_thread') THEN
        CREATE POLICY messages_through_thread ON messages FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM threads t
                LEFT JOIN thread_members tm ON tm.thread_id = t.id AND tm.user_id = current_user_id()
                WHERE t.id = messages.thread_id AND (t.owner_user_id = current_user_id() OR tm.user_id IS NOT NULL)
            )
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'memories_owner') THEN
        CREATE POLICY memories_owner ON memories FOR ALL USING (owner_user_id = current_user_id()) WITH CHECK (owner_user_id = current_user_id());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'artifacts_authorized') THEN
        CREATE POLICY artifacts_authorized ON artifacts FOR SELECT USING (
            owner_user_id = current_user_id()
            OR EXISTS (SELECT 1 FROM thread_members tm WHERE tm.thread_id = artifacts.thread_id AND tm.user_id = current_user_id())
        );
    END IF;
END $$;

-- ─── RÔLES APPLICATIFS SANS BYPASSRLS (SECTION 41) ────────────────
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'nkyel_app') THEN
        CREATE ROLE nkyel_app NOINHERIT NOBYPASSRLS;
    END IF;
END $$;

GRANT nkyel_app TO CURRENT_USER;
GRANT USAGE ON SCHEMA nkyel TO nkyel_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA nkyel TO nkyel_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA nkyel TO nkyel_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA nkyel TO nkyel_app;

COMMIT;
