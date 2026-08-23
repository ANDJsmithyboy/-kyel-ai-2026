import { pgTable, index, unique, check, uuid, text, integer, boolean, jsonb, timestamp, foreignKey, serial } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clerkId: text("clerk_id").notNull(),
	email: text().notNull(),
	fullName: text("full_name"),
	avatarUrl: text("avatar_url"),
	tier: text().default('AURATA').notNull(),
	credits: integer().default(100).notNull(),
	creditsUsed: integer("credits_used").default(0).notNull(),
	isAdmin: boolean("is_admin").default(false).notNull(),
	isBanned: boolean("is_banned").default(false).notNull(),
	banReason: text("ban_reason"),
	betaPioneer: boolean("beta_pioneer").default(false).notNull(),
	pioneerNumber: integer("pioneer_number"),
	locale: text().default('fr').notNull(),
	theme: text().default('black-panther').notNull(),
	meta: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_users_clerk_id").using("btree", table.clerkId.asc().nullsLast().op("text_ops")),
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_clerk_id_key").on(table.clerkId),
	unique("users_email_key").on(table.email),
	check("users_tier_check", sql`tier = ANY (ARRAY['AURATA'::text, 'SONAR'::text, 'ONYX'::text, 'BLACK_PANTHER'::text])`),
]);

export const conversations = pgTable("conversations", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: text().default('Nouvelle piste').notNull(),
	model: text().default('AURATA').notNull(),
	mode: text().default('chat').notNull(),
	loxoEnabled: boolean("loxo_enabled").default(false).notNull(),
	isArchived: boolean("is_archived").default(false).notNull(),
	isPinned: boolean("is_pinned").default(false).notNull(),
	tokensUsed: integer("tokens_used").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_conversations_user_updated").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.updatedAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "conversations_user_id_fkey"
		}).onDelete("cascade"),
	check("conversations_model_check", sql`model = ANY (ARRAY['AURATA'::text, 'SONAR'::text, 'ONYX'::text, 'BLACK_PANTHER'::text])`),
	check("conversations_mode_check", sql`mode = ANY (ARRAY['chat'::text, 'agent'::text])`),
]);

export const messages = pgTable("messages", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	conversationId: uuid("conversation_id").notNull(),
	userId: uuid("user_id").notNull(),
	role: text().notNull(),
	content: text().notNull(),
	model: text(),
	tokensIn: integer("tokens_in").default(0),
	tokensOut: integer("tokens_out").default(0),
	hasRendu: boolean("has_rendu").default(false).notNull(),
	sources: jsonb(),
	agentSteps: jsonb("agent_steps"),
	attachments: jsonb(),
	meta: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_messages_conversation_created").using("btree", table.conversationId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_messages_fulltext").using("gin", sql`to_tsvector('french'::regconfig, content)`),
	index("idx_messages_user_created").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
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
	check("messages_model_check", sql`model = ANY (ARRAY['AURATA'::text, 'SONAR'::text, 'ONYX'::text, 'BLACK_PANTHER'::text])`),
]);

export const agentSessions = pgTable("agent_sessions", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	conversationId: uuid("conversation_id").notNull(),
	deerflowThreadId: text("deerflow_thread_id").notNull(),
	model: text().notNull(),
	status: text().default('idle').notNull(),
	steps: jsonb(),
	errorMessage: text("error_message"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_agent_sessions_conversation").using("btree", table.conversationId.asc().nullsLast().op("uuid_ops")),
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
	check("agent_sessions_model_check", sql`model = ANY (ARRAY['ONYX'::text, 'BLACK_PANTHER'::text])`),
	check("agent_sessions_status_check", sql`status = ANY (ARRAY['idle'::text, 'running'::text, 'done'::text, 'error'::text])`),
]);

export const rendus = pgTable("rendus", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	conversationId: uuid("conversation_id"),
	messageId: uuid("message_id"),
	title: text().default('Sans titre').notNull(),
	type: text().notNull(),
	content: text().notNull(),
	language: text(),
	version: integer().default(1).notNull(),
	isShared: boolean("is_shared").default(false).notNull(),
	shareToken: text("share_token"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_rendus_share_token").using("btree", table.shareToken.asc().nullsLast().op("text_ops")).where(sql`(share_token IS NOT NULL)`),
	index("idx_rendus_user_created").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
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
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "rendus_user_id_fkey"
		}).onDelete("cascade"),
	unique("rendus_share_token_key").on(table.shareToken),
	check("rendus_type_check", sql`type = ANY (ARRAY['doc'::text, 'table'::text, 'chart'::text, 'code'::text, 'html'::text, 'image'::text])`),
]);

export const creditsLedger = pgTable("credits_ledger", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	type: text().notNull(),
	amount: integer().notNull(),
	balanceAfter: integer("balance_after").notNull(),
	model: text(),
	method: text(),
	reference: text(),
	meta: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_credits_user_created").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "credits_ledger_user_id_fkey"
		}).onDelete("cascade"),
	check("credits_ledger_type_check", sql`type = ANY (ARRAY['purchase'::text, 'usage'::text, 'refund'::text, 'bonus'::text, 'beta_grant'::text])`),
]);

export const waitlist = pgTable("waitlist", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	email: text().notNull(),
	fullName: text("full_name"),
	phone: text(),
	country: text().default('GA'),
	paymentRef: text("payment_ref"),
	paymentMethod: text("payment_method"),
	amountPaid: integer("amount_paid").default(5000),
	status: text().default('pending').notNull(),
	pioneerNumber: serial("pioneer_number").notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_waitlist_status_created").using("btree", table.status.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	unique("waitlist_email_key").on(table.email),
	check("waitlist_status_check", sql`status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'rejected'::text, 'activated'::text])`),
]);

export const auditLogs = pgTable("audit_logs", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id"),
	clerkId: text("clerk_id"),
	action: text().notNull(),
	resource: text(),
	resourceId: text("resource_id"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	payload: jsonb(),
	result: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_audit_logs_user_created").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "audit_logs_user_id_fkey"
		}).onDelete("set null"),
	check("audit_logs_result_check", sql`result = ANY (ARRAY['success'::text, 'error'::text, 'blocked'::text])`),
]);

export const featureFlags = pgTable("feature_flags", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	key: text().notNull(),
	enabled: boolean().default(false).notNull(),
	rolloutPct: integer("rollout_pct").default(100),
	description: text(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("feature_flags_key_key").on(table.key),
]);
