/* GabomaGPT · Database Connection · SmartANDJ AI Technologies
   Neon PostgreSQL serverless + Drizzle ORM
   Fondateur : Daniel Jonathan ANDJ */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// ── Neon serverless connection ──────────────────────────────
const sql = neon(process.env.DATABASE_URL || 'postgres://dummy:dummy@localhost/dummy');

// ── Drizzle ORM instance ────────────────────────────────────
export const db = drizzle(sql, { schema });

// Re-export schema for convenience
export { schema };
