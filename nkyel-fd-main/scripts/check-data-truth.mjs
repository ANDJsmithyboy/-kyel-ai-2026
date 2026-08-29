import { readFileSync } from 'fs';
import { globSync } from 'glob';
import path from 'path';

// This script enforces the DATA_TRUTH_INVARIANT
// It scans all production TS/TSX files for common fake/demo data patterns.

const SUSPICIOUS_PATTERNS = [
  /mock[a-zA-Z0-9_]+/i,
  /fake[a-zA-Z0-9_]+/i,
  /dummy[a-zA-Z0-9_]+/i,
  /sample[a-zA-Z0-9_]+/i,
  /demo[a-zA-Z0-9_]+/i,
  /fixture/i,
  /placeholderData/,
  /fallbackData/,
  /credits:\s*\d{3,}/, // e.g. credits: 1250
  /plan:\s*['"]gratuit['"]/i, // catching hardcoded plan strings inside files
  /plan:\s*['"]pro['"]/i,
  /memberCount:\s*\d+/,
];

// Allowlist files that are explicitly for testing or stories
const ALLOWLIST = [
  '__tests__',
  '.test.',
  '.spec.',
  '.stories.',
  '__fixtures__',
  'mocks',
];

const files = globSync('src/**/*.{ts,tsx,js,jsx}');
let issuesFound = 0;

for (const file of files) {
  // Skip allowlisted files
  if (ALLOWLIST.some(pattern => file.includes(pattern))) continue;

  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip comment lines for simplicity
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) continue;

    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(line)) {
        console.warn(`\x1b[33m[WARNING]\x1b[0m Suspicious pattern /${pattern.source}/ found in ${file}:${i + 1}`);
        console.warn(`   -> ${line.trim()}`);
        issuesFound++;
      }
    }
  }
}

if (issuesFound > 0) {
  console.log(`\n\x1b[31m[FAIL]\x1b[0m Found ${issuesFound} potential DATA_TRUTH_INVARIANT violations.`);
  console.log('Please review these occurrences to ensure no fake business data is hardcoded in production runtime paths.');
  // We exit 0 right now so we don't break the build immediately, but CI could enforce this.
  process.exit(0);
} else {
  console.log('\x1b[32m[PASS]\x1b[0m No suspicious data fabrication patterns found. DATA_TRUTH_INVARIANT intact.');
}
