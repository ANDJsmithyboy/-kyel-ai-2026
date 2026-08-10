-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"tier" text DEFAULT 'AURATA' NOT NULL,
	"credits" integer DEFAULT 100 NOT NULL,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"beta_pioneer" boolean DEFAULT false NOT NULL,
	"pioneer_number" integer,
	"locale" text DEFAULT 'fr' NOT NULL,
	"theme" text DEFAULT 'black-panther' NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_key" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_key" UNIQUE("email"),
	CONSTRAINT "users_tier_check" CHECK (tier = ANY (ARRAY['AURATA'::text, 'SONAR'::text, 'ONYX'::text, 'BLACK_PANTHER'::text]))
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text DEFAULT 'Nouvelle piste' NOT NULL,
	"model" text DEFAULT 'AURATA' NOT NULL,
	"mode" text DEFAULT 'chat' NOT NULL,
	"loxo_enabled" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"tokens_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_model_check" CHECK (model = ANY (ARRAY['AURATA'::text, 'SONAR'::text, 'ONYX'::text, 'BLACK_PANTHER'::text])),
	CONSTRAINT "conversations_mode_check" CHECK (mode = ANY (ARRAY['chat'::text, 'agent'::text]))
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"model" text,
	"tokens_in" integer DEFAULT 0,
	"tokens_out" integer DEFAULT 0,
	"has_rendu" boolean DEFAULT false NOT NULL,
	"sources" jsonb,
	"agent_steps" jsonb,
	"attachments" jsonb,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "messages_role_check" CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])),
	CONSTRAINT "messages_model_check" CHECK (model = ANY (ARRAY['AURATA'::text, 'SONAR'::text, 'ONYX'::text, 'BLACK_PANTHER'::text]))
);
--> statement-breakpoint
CREATE TABLE "agent_sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"deerflow_thread_id" text NOT NULL,
	"model" text NOT NULL,
	"status" text DEFAULT 'idle' NOT NULL,
	"steps" jsonb,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_sessions_model_check" CHECK (model = ANY (ARRAY['ONYX'::text, 'BLACK_PANTHER'::text])),
	CONSTRAINT "agent_sessions_status_check" CHECK (status = ANY (ARRAY['idle'::text, 'running'::text, 'done'::text, 'error'::text]))
);
--> statement-breakpoint
CREATE TABLE "rendus" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"conversation_id" uuid,
	"message_id" uuid,
	"title" text DEFAULT 'Sans titre' NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"language" text,
	"version" integer DEFAULT 1 NOT NULL,
	"is_shared" boolean DEFAULT false NOT NULL,
	"share_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rendus_share_token_key" UNIQUE("share_token"),
	CONSTRAINT "rendus_type_check" CHECK (type = ANY (ARRAY['doc'::text, 'table'::text, 'chart'::text, 'code'::text, 'html'::text, 'image'::text]))
);
--> statement-breakpoint
CREATE TABLE "credits_ledger" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"model" text,
	"method" text,
	"reference" text,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credits_ledger_type_check" CHECK (type = ANY (ARRAY['purchase'::text, 'usage'::text, 'refund'::text, 'bonus'::text, 'beta_grant'::text]))
);
--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"phone" text,
	"country" text DEFAULT 'GA',
	"payment_ref" text,
	"payment_method" text,
	"amount_paid" integer DEFAULT 5000,
	"status" text DEFAULT 'pending' NOT NULL,
	"pioneer_number" serial NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_key" UNIQUE("email"),
	CONSTRAINT "waitlist_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'rejected'::text, 'activated'::text]))
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid,
	"clerk_id" text,
	"action" text NOT NULL,
	"resource" text,
	"resource_id" text,
	"ip_address" text,
	"user_agent" text,
	"payload" jsonb,
	"result" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_logs_result_check" CHECK (result = ANY (ARRAY['success'::text, 'error'::text, 'blocked'::text]))
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"key" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"rollout_pct" integer DEFAULT 100,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_key_key" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_sessions" ADD CONSTRAINT "agent_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_sessions" ADD CONSTRAINT "agent_sessions_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rendus" ADD CONSTRAINT "rendus_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rendus" ADD CONSTRAINT "rendus_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rendus" ADD CONSTRAINT "rendus_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credits_ledger" ADD CONSTRAINT "credits_ledger_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_clerk_id" ON "users" USING btree ("clerk_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_user_updated" ON "conversations" USING btree ("user_id" timestamptz_ops,"updated_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_created" ON "messages" USING btree ("conversation_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_fulltext" ON "messages" USING gin (to_tsvector('french'::regconfig, content) tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_user_created" ON "messages" USING btree ("user_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_agent_sessions_conversation" ON "agent_sessions" USING btree ("conversation_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_rendus_share_token" ON "rendus" USING btree ("share_token" text_ops) WHERE (share_token IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_rendus_user_created" ON "rendus" USING btree ("user_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_credits_user_created" ON "credits_ledger" USING btree ("user_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_waitlist_status_created" ON "waitlist" USING btree ("status" text_ops,"created_at" text_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_created" ON "audit_logs" USING btree ("user_id" timestamptz_ops,"created_at" timestamptz_ops);
*/