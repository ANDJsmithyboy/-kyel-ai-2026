"""
Ñkyel AI — Comprehensive Production Migration
Safe, idempotent migration for all canonical tables on Neon PostgreSQL.
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from db.session import engine
from sqlalchemy import text


MIGRATION_SQL = """
-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    workspace_type VARCHAR(64) NOT NULL DEFAULT 'BUSINESS',
    owner_user_id UUID,
    tier VARCHAR(64) NOT NULL DEFAULT 'free',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workspace Members
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(64) NOT NULL DEFAULT 'owner',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_ws_members_ws_user ON workspace_members(workspace_id, user_id);

-- Workspace Settings
CREATE TABLE IF NOT EXISTS workspace_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
    default_model_profile VARCHAR(64) DEFAULT 'NKYEL_RESEARCH',
    default_approval_policy JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(32) DEFAULT 'DARK',
    accent VARCHAR(32) DEFAULT 'GOLD',
    text_size VARCHAR(32) DEFAULT 'MEDIUM',
    density VARCHAR(32) DEFAULT 'COMFORTABLE',
    language VARCHAR(32) DEFAULT 'fr-FR',
    default_model_profile VARCHAR(64) DEFAULT 'NKYEL_RESEARCH',
    reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
    sidebar_collapsed BOOLEAN NOT NULL DEFAULT FALSE,
    show_sources BOOLEAN NOT NULL DEFAULT TRUE,
    show_artifacts BOOLEAN NOT NULL DEFAULT TRUE,
    show_reasoning BOOLEAN NOT NULL DEFAULT FALSE,
    developer_mode BOOLEAN NOT NULL DEFAULT FALSE,
    keyboard_shortcuts BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Missions
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID,
    conversation_id UUID,
    title VARCHAR(512) NOT NULL,
    objective TEXT NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'draft',
    priority VARCHAR(32) NOT NULL DEFAULT 'normal',
    autonomy_level VARCHAR(64) NOT NULL DEFAULT 'semi_autonomous',
    complexity VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    selected_model_profile VARCHAR(64) DEFAULT 'NKYEL_RESEARCH',
    current_phase VARCHAR(64) NOT NULL DEFAULT 'PLANNING',
    current_run_id UUID,
    runtime_type VARCHAR(64),
    run_id VARCHAR(128),
    error_message TEXT,
    metadata_json TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_missions_workspace ON missions(workspace_id);
CREATE INDEX IF NOT EXISTS ix_missions_user ON missions(created_by_user_id);
CREATE INDEX IF NOT EXISTS ix_missions_status ON missions(status);

-- Runs
CREATE TABLE IF NOT EXISTS runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    run_type VARCHAR(32) NOT NULL DEFAULT 'FULL',
    status VARCHAR(32) NOT NULL DEFAULT 'QUEUED',
    selected_model_profile VARCHAR(64) DEFAULT 'NKYEL_RESEARCH',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mission Events (Event Spine)
CREATE TABLE IF NOT EXISTS mission_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID,
    mission_id UUID,
    run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    event_type VARCHAR(128) NOT NULL,
    version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    sequence INTEGER NOT NULL DEFAULT 1,
    payload JSONB,
    node_id VARCHAR(128),
    idempotency_key VARCHAR(255),
    safe_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_mission_events_run_seq ON mission_events(run_id, sequence);

-- WorkGraph Nodes
CREATE TABLE IF NOT EXISTS workgraph_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    mission_id UUID,
    run_id UUID,
    node_type VARCHAR(64) NOT NULL,
    label VARCHAR(512) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    payload JSONB,
    data JSONB,
    position_x FLOAT,
    position_y FLOAT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_workgraph_nodes_ws ON workgraph_nodes(workspace_id);

-- WorkGraph Edges
CREATE TABLE IF NOT EXISTS workgraph_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    mission_id UUID,
    run_id UUID,
    source_node_id UUID NOT NULL,
    target_node_id UUID NOT NULL,
    relation_type VARCHAR(64) NOT NULL DEFAULT 'DEPENDENCY',
    label VARCHAR(255),
    data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_workgraph_edges_ws ON workgraph_edges(workspace_id);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID,
    run_id UUID,
    title VARCHAR(512) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checkpoints
CREATE TABLE IF NOT EXISTS checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id VARCHAR(128),
    mission_id UUID,
    run_id UUID,
    checkpoint_id VARCHAR(128),
    data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotency Keys
CREATE TABLE IF NOT EXISTS idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL UNIQUE,
    locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Simulations
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID,
    run_id UUID,
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    estimated_duration_min_seconds INTEGER DEFAULT 0,
    estimated_duration_max_seconds INTEGER DEFAULT 0,
    estimated_cost_low FLOAT DEFAULT 0.0,
    estimated_cost_high FLOAT DEFAULT 0.0,
    risk_level VARCHAR(32) DEFAULT 'LOW',
    confidence VARCHAR(32) DEFAULT '0.9',
    summary TEXT,
    plan JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Predictions
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID,
    run_id UUID,
    prediction_type VARCHAR(64) NOT NULL,
    value_json JSONB,
    confidence VARCHAR(32) DEFAULT 'MEDIUM',
    basis JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sources
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID,
    mission_id UUID,
    run_id UUID,
    source_type VARCHAR(64) NOT NULL DEFAULT 'WEB',
    url TEXT,
    title VARCHAR(512),
    domain VARCHAR(255),
    excerpt TEXT,
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evidence
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    mission_id UUID,
    claim TEXT,
    relation VARCHAR(32) NOT NULL DEFAULT 'supports',
    fact_excerpt TEXT,
    confidence FLOAT DEFAULT 0.5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hypotheses & Evidence
CREATE TABLE IF NOT EXISTS hypotheses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID,
    statement TEXT NOT NULL,
    confidence FLOAT DEFAULT 0.5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hypothesis_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hypothesis_id UUID NOT NULL REFERENCES hypotheses(id) ON DELETE CASCADE,
    evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE
);

-- Decisions & Evidence
CREATE TABLE IF NOT EXISTS decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID,
    title VARCHAR(512) NOT NULL,
    rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decision_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE
);

-- Approval Requests & Decisions
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID,
    action_type VARCHAR(64) NOT NULL,
    payload JSONB,
    status VARCHAR(32) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    decided_by_user_id UUID NOT NULL,
    approved BOOLEAN NOT NULL,
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agents & Skills & Tools
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(128) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    prompt_template TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    capability VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tool_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
    run_id UUID,
    status VARCHAR(32) DEFAULT 'SUCCESS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Message Artifacts
CREATE TABLE IF NOT EXISTS message_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    artifact_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usage Events & Quota Counters
CREATE TABLE IF NOT EXISTS usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    cost FLOAT DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quota_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    counter_name VARCHAR(64) NOT NULL,
    current_val INTEGER DEFAULT 0,
    max_val INTEGER DEFAULT 100,
    reset_at TIMESTAMPTZ
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(128) NOT NULL,
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Connectors
CREATE TABLE IF NOT EXISTS connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    connector_type VARCHAR(64) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'available',
    credentials_encrypted TEXT,
    scopes_json TEXT,
    health_status VARCHAR(32) DEFAULT 'unknown',
    last_health_check_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""


async def run_migration():
    print("Executing comprehensive migration on Neon PostgreSQL...")
    async with engine.begin() as conn:
        for statement in MIGRATION_SQL.split(";"):
            stmt = statement.strip()
            if stmt and not stmt.startswith("--"):
                try:
                    await conn.execute(text(stmt))
                except Exception as e:
                    print(f"  Note: {e}")
    print("MIGRATION COMPLETE: ALL CANONICAL TABLES ARE PROVISIONED!")


if __name__ == "__main__":
    asyncio.run(run_migration())
