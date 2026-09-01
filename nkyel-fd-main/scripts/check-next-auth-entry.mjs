#!/usr/bin/env node
/* Ñkyel AI — check-next-auth-entry.mjs
   Build guard to enforce Next.js 16 proxy.ts architecture and prevent middleware.ts creation. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const forbiddenFiles = [
  path.join(rootDir, 'middleware.ts'),
  path.join(rootDir, 'middleware.js'),
  path.join(rootDir, 'src', 'middleware.ts'),
  path.join(rootDir, 'src', 'middleware.js'),
];

for (const file of forbiddenFiles) {
  if (fs.existsSync(file)) {
    console.error(`\n❌ [AUTH ENTRY GUARD ERROR] Forbidden middleware file detected at: ${file}`);
    console.error('👉 Ñkyel uses Next.js 16. middleware.ts is forbidden. Use proxy.ts only.\n');
    process.exit(1);
  }
}

const requiredProxy = [
  path.join(rootDir, 'src', 'proxy.ts'),
  path.join(rootDir, 'proxy.ts'),
];

const hasProxy = requiredProxy.some((p) => fs.existsSync(p));
if (!hasProxy) {
  console.error('\n❌ [AUTH ENTRY GUARD ERROR] Missing proxy.ts file in Next.js project.');
  console.error('👉 Ñkyel requires proxy.ts for Clerk authentication.\n');
  process.exit(1);
}

console.log('✅ [Auth Entry Guard] Next.js 16 proxy.ts verified. middleware.ts is absent.');
process.exit(0);
