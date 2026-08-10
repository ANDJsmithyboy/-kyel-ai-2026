/* GabomaGPT · Database Schema · SmartANDJ AI Technologies
   Drizzle ORM schema for Neon PostgreSQL
   Fondateur : Daniel Jonathan ANDJ
*/

import { pgTable, index, unique, check, uuid, text, integer, boolean, jsonb, timestamp, foreignKey, serial } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

// ── Users ───────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  clerkId: text("clerk_id").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  tier: text("tier").default('AURATA').notNull(),
  credits: integer("credits").default(100).notNull(),
  creditsUsed: integer("credits_used").default(0).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  banReason: text("ban_reason"),
  betaPioneer: boolean("beta_pioneer").default(false).notNull(),
  pioneerNumber: integer("pioneer_number"),
  locale: text("locale").default('fr').notNull(),
  theme: text("theme").default('black-panther').notNull(),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("idx_users_clerk_id").using("btree", table.clerkId),
  index("idx_users_email").using("btree", table.email),
  unique("users_clerk_id_key").on(table.clerkId),
  unique("users_email_key").on(table.email),
  check("users_tier_check", sql`tier = ANY (ARRAY['AURATA'::text, 'SONAR'::text, 'ONYX'::text, 'BLACK_PANTHER'::text, 'BLUE_PANTHER'::text])`),
]);

// ── Conversations ───────────────────────────────────────
export const conversations = pgTable("conversations", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  userId: uuid("user_id").notNull(),
  title: text("title").default('Nouvelle piste').notNull(),
  model: text("model").default('AURATA').notNull(),
  mode: text("mode").default('chat').notNull(),
  loxoEnabled: boolean("loxo_enabled").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  tokensUsed: integer("tokens_used").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("idx_conversations_user_updated").using("btree", table.userId, table.updatedAt),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "conversations_user_id_fkey"
  }).onDelete("cascade"),
  check("conversations_model_check", sql`model = ANY (ARRAY['AURATA'::text, 'SONAR'::text, 'ONYX'::text, 'BLACK_PANTHER'::text, 'BLUE_PANTHER'::text])`),
  check("conversations_mode_check", sql`mode = ANY (ARRAY['chat'::text, 'agent'::text])`),
]);

// ── Messages ────────────────────────────────────────────
export const messages = pgTable("messages", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  conversationId: uuid("conversation_id").notNull(),
  userId: uuid("user_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  model: text("model"),
  tokensIn: integer("tokens_in").default(0),
  tokensOut: integer("tokens_out").default(0),
  hasRendu: boolean("has_rendu").default(false).notNull(),
  sources: jsonb("sources"),
  agentSteps: jsonb("agent_steps"),
  attachments: jsonb("attachments"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("idx_messages_conversation_created").using("btree", table.conversationId, table.createdAt),
  index("idx_messages_fulltext").using("gin", sql`to_tsvector('french'::regconfig, content)`),
  index("idx_messages_user_created").using("btree", table.userId, table.createdAt),
  foreignKey({
    columns: [table.conversationId],
    foreignColumns: [conversations.id],
    name: "messages_conversation_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "messages_user_id_fkey"
  }).onDelete("cascade"),
  check("messages_role_check", sql`role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])`),
]);

// ── Agent Sessions ──────────────────────────────────────
export const agentSessions = pgTable("agent_sessions", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  userId: uuid("user_id").notNull(),
  conversationId: uuid("conversation_id").notNull(),
  deerflowThreadId: text("deerflow_thread_id").notNull(),
  model: text("model").notNull(),
  status: text("status").default('idle').notNull(),
  steps: jsonb("steps"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("idx_agent_sessions_conversation").using("btree", table.conversationId),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "agent_sessions_user_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.conversationId],
    foreignColumns: [conversations.id],
    name: "agent_sessions_conversation_id_fkey"
  }).onDelete("cascade"),
]);

// ── Rendus (Documents) ──────────────────────────────────
export const rendus = pgTable("rendus", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  userId: uuid("user_id").notNull(),
  conversationId: uuid("conversation_id"),
  messageId: uuid("message_id"),
  title: text("title").default('Sans titre').notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  language: text("language"),
  version: integer("version").default(1).notNull(),
  isShared: boolean("is_shared").default(false).notNull(),
  shareToken: text("share_token"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("idx_rendus_share_token").using("btree", table.shareToken).where(sql`(share_token IS NOT NULL)`),
  index("idx_rendus_user_created").using("btree", table.userId, table.createdAt),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "rendus_user_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.conversationId],
    foreignColumns: [conversations.id],
    name: "rendus_conversation_id_fkey"
  }).onDelete("set null"),
  foreignKey({
    columns: [table.messageId],
    foreignColumns: [messages.id],
    name: "rendus_message_id_fkey"
  }).onDelete("set null"),
  unique("rendus_share_token_key").on(table.shareToken),
]);

// ── Credits Ledger ──────────────────────────────────────
export const creditsLedger = pgTable("credits_ledger", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  userId: uuid("user_id").notNull(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  model: text("model"),
  method: text("method"),
  reference: text("reference"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("idx_credits_user_created").using("btree", table.userId, table.createdAt),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "credits_ledger_user_id_fkey"
  }).onDelete("cascade"),
]);

// ── Waitlist ────────────────────────────────────────────
export const waitlist = pgTable("waitlist", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  phone: text("phone"),
  country: text("country").default('GA'),
  paymentRef: text("payment_ref"),
  paymentMethod: text("payment_method"),
  amountPaid: integer("amount_paid").default(5000),
  status: text("status").default('pending').notNull(),
  pioneerNumber: serial("pioneer_number").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("idx_waitlist_status_created").using("btree", table.status, table.createdAt),
  unique("waitlist_email_key").on(table.email),
]);

// ── Audit Logs ──────────────────────────────────────────
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  userId: uuid("user_id"),
  clerkId: text("clerk_id"),
  action: text("action").notNull(),
  resource: text("resource"),
  resourceId: text("resource_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  payload: jsonb("payload"),
  result: text("result"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("idx_audit_logs_user_created").using("btree", table.userId, table.createdAt),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "audit_logs_user_id_fkey"
  }).onDelete("set null"),
]);

// ── Feature Flags ───────────────────────────────────────
export const featureFlags = pgTable("feature_flags", {
  id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
  key: text("key").notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  rolloutPct: integer("rollout_pct").default(100),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  unique("feature_flags_key_key").on(table.key),
]);
