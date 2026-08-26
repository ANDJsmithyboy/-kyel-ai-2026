import { pgTable, index, unique, uniqueIndex, check, uuid, text, integer, bigint, boolean, jsonb, timestamp, numeric, foreignKey } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

// =====================================================================
// IDENTITY & TENANCY
// =====================================================================

export const users = pgTable("users", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  primaryEmail: text("primary_email"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  locale: text("locale").default('fr'),
  timezone: text("timezone"),
  status: text("status").notNull().default('ACTIVE'), // ACTIVE, SUSPENDED, PENDING
  onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true, mode: 'string' }),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
});

export const workspaces = pgTable("workspaces", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  name: text("name").notNull(),
  slug: text("slug"),
  workspaceType: text("workspace_type").notNull().default('PERSONAL'), // PERSONAL, TEAM, BUSINESS
  ownerUserId: uuid("owner_user_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  status: text("status").notNull().default('ACTIVE'), // ACTIVE, ARCHIVED, DELETED
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: 'string' }),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
});

export const workspaceMembers = pgTable("workspace_members", {
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text("role").notNull().default('MEMBER'), // OWNER, ADMIN, MEMBER, VIEWER
  status: text("status").notNull().default('ACTIVE'),
  joinedAt: timestamp("joined_at", { withTimezone: true, mode: 'string' }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_workspace_user").on(t.workspaceId, t.userId)
]);

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  theme: text("theme").default('SYSTEM'), // SYSTEM, LIGHT, DARK
  accent: text("accent").default('GOLD'),
  textSize: text("text_size").default('MEDIUM'),
  density: text("density").default('NORMAL'),
  language: text("language").default('fr'),
  defaultModelProfile: text("default_model_profile").default('NKYEL_CHUI'),
  reducedMotion: boolean("reduced_motion").default(false),
  sidebarCollapsed: boolean("sidebar_collapsed").default(false),
  memoryEnabled: boolean("memory_enabled").default(true),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const workspaceSettings = pgTable("workspace_settings", {
  workspaceId: uuid("workspace_id").primaryKey().references(() => workspaces.id, { onDelete: 'cascade' }),
  defaultModelProfile: text("default_model_profile").default('NKYEL_CHUI'),
  defaultApprovalPolicy: jsonb("default_approval_policy"),
  retentionPolicy: jsonb("retention_policy"),
  featurePolicy: jsonb("feature_policy"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

// =====================================================================
// CORE & PROJECTS
// =====================================================================

export const projects = pgTable("projects", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default('ACTIVE'), // ACTIVE, ARCHIVED, DELETED
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: 'string' }),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (t) => [
  index("idx_projects_workspace_updated").on(t.workspaceId, t.updatedAt),
  index("idx_projects_workspace_status").on(t.workspaceId, t.status),
]);

// =====================================================================
// CONVERSATIONS & MESSAGES
// =====================================================================

export const conversations = pgTable("conversations", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'set null' }),
  title: text("title"),
  conversationType: text("conversation_type").notNull().default('CHAT'), // CHAT, MISSION_CHAT
  status: text("status").notNull().default('ACTIVE'), // ACTIVE, ARCHIVED, DELETED
  lastMessageAt: timestamp("last_message_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: 'string' }),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (t) => [
  index("idx_conversations_workspace_updated").on(t.workspaceId, t.updatedAt),
]);

export const messages = pgTable("messages", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  missionId: uuid("mission_id"), // FK added later to avoid circular/forward refs or just standard UUID
  runId: uuid("run_id"),
  parentMessageId: uuid("parent_message_id"), 
  role: text("role").notNull(), // USER, ASSISTANT, SYSTEM_EVENT, TOOL_SUMMARY
  contentText: text("content_text"),
  contentJson: jsonb("content_json"),
  modelProfile: text("model_profile"),
  sequence: bigint("sequence", { mode: "number" }).notNull(),
  status: text("status").notNull().default('SENT'),
  editedAt: timestamp("edited_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (t) => [
  uniqueIndex("uniq_message_seq").on(t.conversationId, t.sequence),
  index("idx_messages_conv_created").on(t.conversationId, t.createdAt),
]);

// =====================================================================
// MISSIONS & RUNS
// =====================================================================

export const missions = pgTable("missions", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: 'set null' }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'set null' }),
  title: text("title"),
  objective: text("objective"),
  status: text("status").notNull().default('DRAFT'), // DRAFT, RUNNING, COMPLETED, FAILED, etc.
  complexity: text("complexity"),
  selectedModelProfile: text("selected_model_profile"),
  simulationStatus: text("simulation_status"),
  currentPhase: text("current_phase"),
  currentRunId: uuid("current_run_id"), // FK added later
  metadata: jsonb("metadata"),
  startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
  failedAt: timestamp("failed_at", { withTimezone: true, mode: 'string' }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: 'string' }),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (t) => [
  index("idx_missions_workspace_updated").on(t.workspaceId, t.updatedAt),
  index("idx_missions_workspace_status").on(t.workspaceId, t.status),
  index("idx_missions_project_updated").on(t.projectId, t.updatedAt),
]);

export const runs = pgTable("runs", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  attemptNumber: integer("attempt_number").notNull(),
  status: text("status").notNull().default('QUEUED'), // QUEUED, RUNNING, COMPLETED, FAILED
  selectedModelProfile: text("selected_model_profile"),
  startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
  failedAt: timestamp("failed_at", { withTimezone: true, mode: 'string' }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true, mode: 'string' }),
  errorCode: text("error_code"),
  errorSummary: text("error_summary"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_run_attempt").on(t.missionId, t.attemptNumber)
]);

export const idempotencyKeys = pgTable("idempotency_keys", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'set null' }),
  key: text("key").notNull(),
  commandType: text("command_type").notNull(),
  resourceType: text("resource_type"),
  resourceId: uuid("resource_id"),
  responseStatus: integer("response_status"),
  responsePayload: jsonb("response_payload"),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_idempotency_key").on(t.workspaceId, t.key)
]);

// =====================================================================
// EVENT SPINE
// =====================================================================

export const missionEvents = pgTable("mission_events", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'cascade' }),
  sequence: bigint("sequence", { mode: "number" }).notNull(),
  eventType: text("event_type").notNull(),
  agentId: uuid("agent_id"),
  taskId: uuid("task_id"),
  toolExecutionId: uuid("tool_execution_id"),
  artifactId: uuid("artifact_id"),
  sourceId: uuid("source_id"),
  connectionId: uuid("connection_id"),
  payload: jsonb("payload"),
  safeMetadata: jsonb("safe_metadata"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_mission_event_seq").on(t.missionId, t.sequence),
  index("idx_mission_events_run_seq").on(t.runId, t.sequence),
  index("idx_mission_events_ws_created").on(t.workspaceId, t.createdAt),
  index("idx_mission_events_type_created").on(t.eventType, t.createdAt),
]);

export const checkpoints = pgTable("checkpoints", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").notNull().references(() => runs.id, { onDelete: 'cascade' }),
  sequence: bigint("sequence", { mode: "number" }),
  checkpointType: text("checkpoint_type"),
  stateSnapshot: jsonb("state_snapshot"),
  resumeToken: text("resume_token"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

// =====================================================================
// TASKS
// =====================================================================

export const tasks = pgTable("tasks", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'cascade' }),
  parentTaskId: uuid("parent_task_id"),
  title: text("title"),
  description: text("description"),
  status: text("status").default('PENDING').notNull(),
  priority: integer("priority").default(0),
  assignedAgentId: uuid("assigned_agent_id"),
  metadata: jsonb("metadata"),
  startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
  failedAt: timestamp("failed_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

// =====================================================================
// WORKGRAPH
// =====================================================================

export const workgraphNodes = pgTable("workgraph_nodes", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'cascade' }),
  nodeType: text("node_type").notNull(),
  domainResourceType: text("domain_resource_type"),
  domainResourceId: uuid("domain_resource_id"),
  label: text("label").notNull(),
  status: text("status").notNull(),
  isSimulated: boolean("is_simulated").default(false),
  isPredicted: boolean("is_predicted").default(false),
  data: jsonb("data"),
  layoutData: jsonb("layout_data"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const workgraphEdges = pgTable("workgraph_edges", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'cascade' }),
  sourceNodeId: uuid("source_node_id").notNull().references(() => workgraphNodes.id, { onDelete: 'cascade' }),
  targetNodeId: uuid("target_node_id").notNull().references(() => workgraphNodes.id, { onDelete: 'cascade' }),
  relationType: text("relation_type").notNull(),
  isSimulated: boolean("is_simulated").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  index("idx_workgraphedges_mission").on(t.missionId),
  index("idx_workgraphedges_source").on(t.sourceNodeId),
  index("idx_workgraphedges_target").on(t.targetNodeId),
]);

export const simulations = pgTable("simulations", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'cascade' }),
  version: integer("version").notNull(),
  status: text("status").notNull(),
  estimatedDurationMinSeconds: integer("estimated_duration_min_seconds"),
  estimatedDurationMaxSeconds: integer("estimated_duration_max_seconds"),
  estimatedCostLow: numeric("estimated_cost_low"),
  estimatedCostHigh: numeric("estimated_cost_high"),
  riskLevel: text("risk_level"),
  confidence: text("confidence"),
  summary: text("summary"),
  plan: jsonb("plan"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const predictions = pgTable("predictions", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'cascade' }),
  predictionType: text("prediction_type"),
  valueJson: jsonb("value_json"),
  confidence: text("confidence"),
  basis: jsonb("basis"),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

// =====================================================================
// SOURCES, EVIDENCE, DECISIONS
// =====================================================================

export const sources = pgTable("sources", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'cascade' }),
  sourceType: text("source_type"),
  url: text("url"),
  canonicalUrl: text("canonical_url"),
  title: text("title").notNull(),
  domain: text("domain"),
  author: text("author"),
  publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
  retrievedAt: timestamp("retrieved_at", { withTimezone: true, mode: 'string' }).notNull(),
  searchProvider: text("search_provider"),
  contentHash: text("content_hash"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  index("idx_sources_mission").on(t.missionId),
  index("idx_sources_canonical").on(t.canonicalUrl),
  index("idx_sources_hash").on(t.contentHash),
]);

export const evidence = pgTable("evidence", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'cascade' }),
  sourceId: uuid("source_id").notNull().references(() => sources.id, { onDelete: 'cascade' }),
  claim: text("claim").notNull(),
  evidenceText: text("evidence_text"),
  structuredData: jsonb("structured_data"),
  relationship: text("relationship").notNull(),
  qualityScore: numeric("quality_score"),
  confidence: text("confidence"),
  createdByAgentId: uuid("created_by_agent_id"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const hypotheses = pgTable("hypotheses", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'cascade' }),
  statement: text("statement").notNull(),
  status: text("status"),
  confidence: text("confidence"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const hypothesisEvidence = pgTable("hypothesis_evidence", {
  hypothesisId: uuid("hypothesis_id").notNull().references(() => hypotheses.id, { onDelete: 'cascade' }),
  evidenceId: uuid("evidence_id").notNull().references(() => evidence.id, { onDelete: 'cascade' }),
  relationship: text("relationship"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_hypo_evidence").on(t.hypothesisId, t.evidenceId)
]);

export const decisions = pgTable("decisions", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'cascade' }),
  decisionType: text("decision_type"),
  summary: text("summary").notNull(),
  rationaleSummary: text("rationale_summary"),
  status: text("status"),
  decidedBy: text("decided_by"),
  decidedByUserId: uuid("decided_by_user_id").references(() => users.id, { onDelete: 'set null' }),
  decidedByAgentId: uuid("decided_by_agent_id"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const decisionEvidence = pgTable("decision_evidence", {
  decisionId: uuid("decision_id").notNull().references(() => decisions.id, { onDelete: 'cascade' }),
  evidenceId: uuid("evidence_id").notNull().references(() => evidence.id, { onDelete: 'cascade' }),
  relationship: text("relationship"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_dec_evidence").on(t.decisionId, t.evidenceId)
]);

export const approvalRequests = pgTable("approval_requests", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'cascade' }),
  requestedByAgentId: uuid("requested_by_agent_id"),
  actionType: text("action_type").notNull(),
  targetSummary: text("target_summary"),
  payloadPreview: jsonb("payload_preview"),
  riskLevel: text("risk_level"),
  status: text("status").notNull(), // PENDING, APPROVED, REJECTED, EXPIRED, CANCELLED
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const approvalDecisions = pgTable("approval_decisions", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  approvalRequestId: uuid("approval_request_id").notNull().references(() => approvalRequests.id, { onDelete: 'restrict' }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  decision: text("decision").notNull(),
  editedPayload: jsonb("edited_payload"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

// =====================================================================
// AGENTS & TOOLS
// =====================================================================

export const agents = pgTable("agents", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default('ACTIVE'),
  currentVersionId: uuid("current_version_id"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: 'string' }),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
});

export const agentVersions = pgTable("agent_versions", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: 'cascade' }),
  version: integer("version").notNull(),
  instructions: text("instructions"),
  configuration: jsonb("configuration"),
  approvalPolicy: jsonb("approval_policy"),
  memoryPolicy: jsonb("memory_policy"),
  compiledRuntimeConfig: jsonb("compiled_runtime_config"),
  createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_agent_version").on(t.agentId, t.version)
]);

export const agentCapabilities = pgTable("agent_capabilities", {
  agentVersionId: uuid("agent_version_id").notNull().references(() => agentVersions.id, { onDelete: 'cascade' }),
  capabilityKey: text("capability_key").notNull(),
  enabled: boolean("enabled").default(true),
  config: jsonb("config"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_agent_cap").on(t.agentVersionId, t.capabilityKey)
]);

export const skills = pgTable("skills", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: 'cascade' }),
  skillKey: text("skill_key"),
  name: text("name"),
  description: text("description"),
  version: text("version"),
  sourceType: text("source_type"),
  configuration: jsonb("configuration"),
  status: text("status"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const agentSkills = pgTable("agent_skills", {
  agentVersionId: uuid("agent_version_id").notNull().references(() => agentVersions.id, { onDelete: 'cascade' }),
  skillId: uuid("skill_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
  enabled: boolean("enabled").default(true),
  configOverride: jsonb("config_override"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_agent_skill").on(t.agentVersionId, t.skillId)
]);

export const tools = pgTable("tools", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: 'cascade' }),
  toolKey: text("tool_key").notNull(),
  name: text("name"),
  description: text("description"),
  toolType: text("tool_type"),
  provider: text("provider"),
  inputSchema: jsonb("input_schema"),
  outputSchema: jsonb("output_schema"),
  status: text("status"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const toolExecutions = pgTable("tool_executions", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: 'cascade' }),
  missionId: uuid("mission_id").references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'cascade' }),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: 'set null' }),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: 'set null' }),
  toolId: uuid("tool_id").references(() => tools.id, { onDelete: 'set null' }),
  toolKey: text("tool_key").notNull(),
  status: text("status").notNull(),
  safeInputSummary: jsonb("safe_input_summary"),
  safeOutputSummary: jsonb("safe_output_summary"),
  startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
  failedAt: timestamp("failed_at", { withTimezone: true, mode: 'string' }),
  latencyMs: integer("latency_ms"),
  errorCode: text("error_code"),
  errorSummary: text("error_summary"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

// =====================================================================
// CONNECTIONS & MCP
// =====================================================================

export const connections = pgTable("connections", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  providerKey: text("provider_key").notNull(),
  connectionType: text("connection_type").notNull(),
  status: text("status").notNull(),
  externalAccountId: text("external_account_id"),
  displayName: text("display_name"),
  displayEmail: text("display_email"),
  metadata: jsonb("metadata"),
  connectedAt: timestamp("connected_at", { withTimezone: true, mode: 'string' }),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true, mode: 'string' }),
  reauthRequiredAt: timestamp("reauth_required_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (t) => [
  index("idx_connections_ws_provider").on(t.workspaceId, t.providerKey),
  index("idx_connections_ws_status").on(t.workspaceId, t.status),
]);

export const connectionCapabilities = pgTable("connection_capabilities", {
  connectionId: uuid("connection_id").notNull().references(() => connections.id, { onDelete: 'cascade' }),
  capabilityKey: text("capability_key").notNull(),
  externalIdentifier: text("external_identifier"),
  status: text("status"),
  metadata: jsonb("metadata"),
  discoveredAt: timestamp("discovered_at", { withTimezone: true, mode: 'string' }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_conn_cap").on(t.connectionId, t.capabilityKey)
]);

export const mcpServers = pgTable("mcp_servers", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  connectionId: uuid("connection_id").references(() => connections.id, { onDelete: 'set null' }),
  serverKey: text("server_key").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  transport: text("transport"),
  endpointMetadata: jsonb("endpoint_metadata"),
  status: text("status"),
  iconKey: text("icon_key"),
  websiteUrl: text("website_url"),
  protocolVersion: text("protocol_version"),
  lastDiscoveredAt: timestamp("last_discovered_at", { withTimezone: true, mode: 'string' }),
  lastHealthCheckAt: timestamp("last_health_check_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  index("idx_mcpservers_ws_status").on(t.workspaceId, t.status),
]);

export const mcpTools = pgTable("mcp_tools", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  mcpServerId: uuid("mcp_server_id").notNull().references(() => mcpServers.id, { onDelete: 'cascade' }),
  toolName: text("tool_name").notNull(),
  displayName: text("display_name"),
  description: text("description"),
  inputSchema: jsonb("input_schema"),
  outputSchema: jsonb("output_schema"),
  status: text("status"),
  enabled: boolean("enabled").default(true),
  discoveredAt: timestamp("discovered_at", { withTimezone: true, mode: 'string' }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_mcptool_server").on(t.mcpServerId, t.toolName),
]);

// =====================================================================
// COMPUTER SESSIONS
// =====================================================================

export const computerSessions = pgTable("computer_sessions", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  missionId: uuid("mission_id").references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'cascade' }),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: 'set null' }),
  providerBackend: text("provider_backend"),
  status: text("status"),
  controlOwner: text("control_owner"), // AGENT, USER, NONE
  startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const computerActions = pgTable("computer_actions", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  computerSessionId: uuid("computer_session_id").notNull().references(() => computerSessions.id, { onDelete: 'cascade' }),
  sequence: bigint("sequence", { mode: "number" }).notNull(),
  actionType: text("action_type"),
  safeDescription: text("safe_description"),
  status: text("status"),
  startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_computeraction_seq").on(t.computerSessionId, t.sequence)
]);

// =====================================================================
// ARTIFACTS
// =====================================================================

export const artifacts = pgTable("artifacts", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: 'set null' }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'set null' }),
  conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: 'set null' }),
  missionId: uuid("mission_id").references(() => missions.id, { onDelete: 'set null' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'set null' }),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: 'set null' }),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: 'set null' }),
  artifactType: text("artifact_type").notNull(),
  artifactSubtype: text("artifact_subtype"),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull(),
  currentVersionId: uuid("current_version_id"), // FK to artifactVersions added via relations
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: 'string' }),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (t) => [
  index("idx_artifacts_workspace_created").on(t.workspaceId, t.createdAt),
  index("idx_artifacts_ws_type_created").on(t.workspaceId, t.artifactType, t.createdAt),
  index("idx_artifacts_mission").on(t.missionId),
  index("idx_artifacts_project").on(t.projectId),
]);

export const artifactVersions = pgTable("artifact_versions", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  artifactId: uuid("artifact_id").notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
  version: integer("version").notNull(),
  mimeType: text("mime_type"),
  extension: text("extension"),
  filename: text("filename"),
  r2Bucket: text("r2_bucket"),
  r2Key: text("r2_key"),
  sizeBytes: bigint("size_bytes", { mode: "number" }),
  checksumSha256: text("checksum_sha256"),
  width: integer("width"),
  height: integer("height"),
  durationMs: bigint("duration_ms", { mode: "number" }),
  pageCount: integer("page_count"),
  slideCount: integer("slide_count"),
  sheetCount: integer("sheet_count"),
  provider: text("provider"),
  model: text("model"),
  accessMethod: text("access_method"),
  generationMetadata: jsonb("generation_metadata"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_artifact_version").on(t.artifactId, t.version),
]);

export const artifactRelations = pgTable("artifact_relations", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  sourceArtifactId: uuid("source_artifact_id").notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
  targetArtifactId: uuid("target_artifact_id").notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
  relationType: text("relation_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const artifactSources = pgTable("artifact_sources", {
  artifactId: uuid("artifact_id").notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
  sourceId: uuid("source_id").notNull().references(() => sources.id, { onDelete: 'cascade' }),
  relationType: text("relation_type"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_artifact_source").on(t.artifactId, t.sourceId)
]);

export const artifactEvidence = pgTable("artifact_evidence", {
  artifactId: uuid("artifact_id").notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
  evidenceId: uuid("evidence_id").notNull().references(() => evidence.id, { onDelete: 'cascade' }),
  relationType: text("relation_type"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_artifact_evidence").on(t.artifactId, t.evidenceId)
]);

export const messageArtifacts = pgTable("message_artifacts", {
  messageId: uuid("message_id").notNull().references(() => messages.id, { onDelete: 'cascade' }),
  artifactId: uuid("artifact_id").notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
  relationType: text("relation_type"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_message_artifact").on(t.messageId, t.artifactId)
]);

// =====================================================================
// AUTOMATIONS
// =====================================================================

export const automations = pgTable("automations", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'set null' }),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: 'set null' }),
  name: text("name").notNull(),
  description: text("description"),
  triggerType: text("trigger_type").notNull(),
  scheduleExpression: text("schedule_expression"),
  timezone: text("timezone"),
  status: text("status").notNull(),
  missionTemplate: jsonb("mission_template"),
  lastRunAt: timestamp("last_run_at", { withTimezone: true, mode: 'string' }),
  nextRunAt: timestamp("next_run_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (t) => [
  index("idx_automations_ws_status").on(t.workspaceId, t.status),
  index("idx_automations_next_run").on(t.nextRunAt), // Could filter by active status in queries
]);

export const automationRuns = pgTable("automation_runs", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  automationId: uuid("automation_id").notNull().references(() => automations.id, { onDelete: 'cascade' }),
  missionId: uuid("mission_id").references(() => missions.id, { onDelete: 'set null' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'set null' }),
  status: text("status"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true, mode: 'string' }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
  failedAt: timestamp("failed_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

// =====================================================================
// MEMORY & TELEMETRY
// =====================================================================

export const memories = pgTable("memories", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: 'cascade' }),
  scope: text("scope").notNull(),
  content: text("content"),
  metadata: jsonb("metadata"),
  qdrantPointId: text("qdrant_point_id"),
  status: text("status"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
});

export const shareLinks = pgTable("share_links", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id, { onDelete: 'restrict' }),
  resourceType: text("resource_type").notNull(),
  resourceId: uuid("resource_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  accessLevel: text("access_level").notNull(),
  allowDownload: boolean("allow_download").default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
  revokedAt: timestamp("revoked_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true, mode: 'string' }),
});

export const usageEvents = pgTable("usage_events", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'set null' }),
  missionId: uuid("mission_id").references(() => missions.id, { onDelete: 'set null' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'set null' }),
  artifactId: uuid("artifact_id").references(() => artifacts.id, { onDelete: 'set null' }),
  capability: text("capability").notNull(),
  provider: text("provider"),
  model: text("model"),
  units: jsonb("units"),
  estimatedCostUsd: numeric("estimated_cost_usd"),
  actualCostUsd: numeric("actual_cost_usd"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const quotaCounters = pgTable("quota_counters", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }),
  periodType: text("period_type"),
  periodStart: timestamp("period_start", { withTimezone: true, mode: 'string' }),
  periodEnd: timestamp("period_end", { withTimezone: true, mode: 'string' }),
  metric: text("metric"),
  usedValue: numeric("used_value").default('0'),
  reservedValue: numeric("reserved_value").default('0'),
  limitValue: numeric("limit_value"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("uniq_quota_counter").on(t.workspaceId, t.userId, t.periodStart, t.periodEnd, t.metric)
]);

export const feedback = pgTable("feedback", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  missionId: uuid("mission_id").references(() => missions.id, { onDelete: 'set null' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'set null' }),
  messageId: uuid("message_id").references(() => messages.id, { onDelete: 'set null' }),
  artifactId: uuid("artifact_id").references(() => artifacts.id, { onDelete: 'set null' }),
  feedbackType: text("feedback_type"),
  category: text("category"),
  severity: text("severity"),
  message: text("message"),
  screenshotArtifactId: uuid("screenshot_artifact_id").references(() => artifacts.id, { onDelete: 'set null' }),
  status: text("status"),
  safeDiagnostics: jsonb("safe_diagnostics"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: 'set null' }),
  actorAgentId: uuid("actor_agent_id").references(() => agents.id, { onDelete: 'set null' }),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: uuid("resource_id"),
  requestId: text("request_id"),
  ipHash: text("ip_hash"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const connectionCredentials = pgTable("connection_credentials", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  connectionId: uuid("connection_id").notNull().references(() => connections.id, { onDelete: 'cascade' }),
  encryptedPayload: text("encrypted_payload").notNull(),
  keyId: text("key_id").notNull(),
  algorithm: text("algorithm").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const mcpResources = pgTable("mcp_resources", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  mcpServerId: uuid("mcp_server_id").notNull().references(() => mcpServers.id, { onDelete: 'cascade' }),
  resourceUri: text("resource_uri").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  mimeType: text("mime_type"),
  metadata: jsonb("metadata"),
  status: text("status").notNull().default('ACTIVE'),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const remoteAgents = pgTable("remote_agents", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  agentUrl: text("agent_url").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  capabilities: jsonb("capabilities"),
  authType: text("auth_type"),
  status: text("status").notNull().default('ACTIVE'),
  lastDiscoveredAt: timestamp("last_discovered_at", { withTimezone: true, mode: 'string' }),
  lastHealthCheckAt: timestamp("last_health_check_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const a2aHandoffs = pgTable("a2a_handoffs", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  missionId: uuid("mission_id").notNull().references(() => missions.id, { onDelete: 'cascade' }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: 'set null' }),
  sourceAgentId: uuid("source_agent_id"),
  remoteAgentId: uuid("remote_agent_id").references(() => remoteAgents.id, { onDelete: 'set null' }),
  taskReference: text("task_reference"),
  status: text("status").notNull(),
  inputSummary: jsonb("input_summary"),
  outputSummary: jsonb("output_summary"),
  startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
  failedAt: timestamp("failed_at", { withTimezone: true, mode: 'string' }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

