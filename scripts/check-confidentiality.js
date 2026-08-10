/**
 * Gaboma AI — Confidentiality Linter
 * Ensures no banned tokens (engine names, third-party model names, infra details)
 * leak into the production UI/strings.
 */

const fs = require('fs');
const path = require('path');

const BANNED_TOKENS = [
  'DeerFlow',
  'DeepFlow',
  'Aya Expanse',
  'Qdrant',
  'Fireworks',
  'RunPod',
  'Groq',
  'Llama',
  'Gemini',
  'Kimi',
  'OpenAI',
  'Claude',
  'Contabo',
  'E-Series'
];

const DIRECTORIES_TO_SCAN = [
  'ZION-CORE-V2/src',
  'gabomagpt/android/app/src/main/java'
];

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.kt', '.md'];

let hasError = false;

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else {
      if (EXTENSIONS.some(ext => fullPath.endsWith(ext))) {
        checkFile(fullPath);
      }
    }
  }
}

function checkFile(filePath) {
  // Ignore this script itself and any explicit reference files
  if (filePath.includes('check-confidentiality') || filePath.includes('MASTER') || filePath.includes('task.md')) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const token of BANNED_TOKENS) {
      // Case-insensitive check
      if (line.toLowerCase().includes(token.toLowerCase())) {
        // Exception: allow imports of groq inside backend routes, but forbid them in React components
        if (token === 'Groq' && filePath.includes('api/') && line.includes('import')) continue;
        if (token === 'Qdrant' && filePath.includes('api/') && line.includes('import')) continue;

        console.error(`\x1b[31m[CONFIDENTIALITY LEAK]\x1b[0m ${filePath}:${i + 1}`);
        console.error(`  Found banned token "${token}"`);
        console.error(`  Line: ${line.trim()}`);
        hasError = true;
      }
    }
  }
}

console.log('Running Gaboma AI Confidentiality Linter...');

for (const dir of DIRECTORIES_TO_SCAN) {
  scanDirectory(path.join(__dirname, '..', dir));
}

if (hasError) {
  console.error('\n\x1b[31mConfidentiality check failed! Please remove banned tokens from user-facing or client code.\x1b[0m');
  process.exit(1);
} else {
  console.log('\x1b[32mConfidentiality check passed. No leaks detected.\x1b[0m');
  process.exit(0);
}
