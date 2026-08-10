/**
 * GabomaAI — Init Database · SmartANDJ AI Technologies
 * Crée toutes les tables dans Neon PostgreSQL.
 * Usage: node scripts/init-db.mjs
 */

import { Pool } from "@neondatabase/serverless";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_HKkCZuxn2j0O@ep-shy-firefly-abitziup-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ connectionString: DATABASE_URL });

const SCHEMA = `
-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS "users" (
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
  CONSTRAINT "users_email_key" UNIQUE("email")
);

-- Conversations
CREATE TABLE IF NOT EXISTS "conversations" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" text DEFAULT 'Nouvelle piste' NOT NULL,
  "model" text DEFAULT 'AURATA' NOT NULL,
  "mode" text DEFAULT 'chat' NOT NULL,
  "loxo_enabled" boolean DEFAULT false NOT NULL,
  "is_archived" boolean DEFAULT false NOT NULL,
  "is_pinned" boolean DEFAULT false NOT NULL,
  "tokens_used" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Messages
CREATE TABLE IF NOT EXISTS "messages" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  "conversation_id" uuid NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
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
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Agent Sessions
CREATE TABLE IF NOT EXISTS "agent_sessions" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "conversation_id" uuid NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "deerflow_thread_id" text NOT NULL,
  "model" text NOT NULL,
  "status" text DEFAULT 'idle' NOT NULL,
  "steps" jsonb,
  "error_message" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Rendus (artifacts)
CREATE TABLE IF NOT EXISTS "rendus" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "conversation_id" uuid REFERENCES "conversations"("id") ON DELETE SET NULL,
  "message_id" uuid REFERENCES "messages"("id") ON DELETE SET NULL,
  "title" text DEFAULT 'Sans titre' NOT NULL,
  "type" text NOT NULL,
  "content" text NOT NULL,
  "language" text,
  "version" integer DEFAULT 1 NOT NULL,
  "is_shared" boolean DEFAULT false NOT NULL,
  "share_token" text UNIQUE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Credits Ledger
CREATE TABLE IF NOT EXISTS "credits_ledger" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "amount" integer NOT NULL,
  "balance_after" integer NOT NULL,
  "model" text,
  "method" text,
  "reference" text,
  "meta" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Waitlist
CREATE TABLE IF NOT EXISTS "waitlist" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  "email" text NOT NULL UNIQUE,
  "full_name" text,
  "phone" text,
  "country" text DEFAULT 'GA',
  "payment_ref" text,
  "payment_method" text,
  "amount_paid" integer DEFAULT 5000,
  "status" text DEFAULT 'pending' NOT NULL,
  "pioneer_number" serial NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "clerk_id" text,
  "action" text NOT NULL,
  "resource" text,
  "resource_id" text,
  "ip_address" text,
  "user_agent" text,
  "payload" jsonb,
  "result" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS "feature_flags" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  "key" text NOT NULL UNIQUE,
  "enabled" boolean DEFAULT false NOT NULL,
  "rollout_pct" integer DEFAULT 100,
  "description" text,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_users_clerk_id" ON "users" ("clerk_id");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "idx_conversations_user_updated" ON "conversations" ("user_id", "updated_at");
CREATE INDEX IF NOT EXISTS "idx_messages_conversation_created" ON "messages" ("conversation_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_messages_user_created" ON "messages" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_agent_sessions_conversation" ON "agent_sessions" ("conversation_id");
CREATE INDEX IF NOT EXISTS "idx_rendus_user_created" ON "rendus" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_credits_user_created" ON "credits_ledger" ("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_waitlist_status_created" ON "waitlist" ("status", "created_at");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_created" ON "audit_logs" ("user_id", "created_at");
`;

async function main() {
  console.log("🚀 Création des tables GabomaAI dans Neon...");

  // Split by semicolons and execute each statement
  const statements = SCHEMA.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await pool.query(stmt);
      // Extract table/index name for logging
      const match = stmt.match(
        /(?:TABLE|INDEX)\s+(?:IF NOT EXISTS\s+)?"?(\w+)"?/i
      );
      if (match) {
        console.log(`  ✅ ${match[1]}`);
      }
    } catch (err) {
      console.error(`  ❌ Erreur: ${err.message}`);
      console.error(`     Statement: ${stmt.substring(0, 80)}...`);
    }
  }

  await pool.end();
  console.log("\n🎉 Base de données GabomaAI initialisée !");
}

main().catch(console.error);
