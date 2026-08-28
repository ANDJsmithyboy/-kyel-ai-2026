/**
 * Ñkyel AI · Key Rotator (Frontend & Next.js API Routes)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Production Key Pool Rotator for up to 100 API keys per service:
 * - Google Gemini (GOOGLE_API_KEYS, GOOGLE_API_KEY_1..100)
 * - Groq (GROQ_API_KEYS, GROQ_API_KEY_1..100)
 * - Images IA (IMAGEN_API_KEYS, FREE_IMAGE_API_KEYS, FAL_KEY_1..100)
 * - Video APIs (RUNWAY_API_KEYS, VEO_API_KEYS, RUNPOD_API_KEYS, VIDEO_API_KEY_1..100)
 * - OpenAI & Anthropic (OPENAI_API_KEY_1..100, ANTHROPIC_API_KEY_1..100)
 */

export class KeyRotator {
  private keys: string[] = [];
  private cooldowns: Map<string, number> = new Map();
  private index = 0;

  constructor(
    private serviceName: string,
    private envVarNames: string[],
    fallbackKeys: string[] = []
  ) {
    this.loadKeys(fallbackKeys);
  }

  private loadKeys(fallbackKeys: string[] = []) {
    const loaded: string[] = [];

    for (const envVar of this.envVarNames) {
      // 1. Direct delimited variable (comma, semicolon, newline, pipe)
      const raw = process.env[envVar] || '';
      if (raw) {
        const parts = raw
          .replace(/;/g, ',')
          .replace(/\n/g, ',')
          .replace(/\|/g, ',')
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean);
        loaded.push(...parts);
      }

      // 2. Numbered variables from _1 to _100
      for (let i = 1; i <= 100; i++) {
        const numVal = process.env[`${envVar}_${i}`] || '';
        if (numVal && numVal.trim()) {
          loaded.push(numVal.trim());
        }
      }
    }

    // Deduplicate
    const uniqueKeys = Array.from(new Set([...loaded, ...fallbackKeys])).filter(Boolean);
    this.keys = uniqueKeys;
  }

  public getActiveKey(): string | null {
    if (this.keys.length === 0) {
      this.loadKeys();
      if (this.keys.length === 0) return null;
    }

    const now = Date.now();
    const available = this.keys.filter((k) => (this.cooldowns.get(k) || 0) < now);

    if (available.length === 0) {
      // If all are cooling down, use the one that expires earliest
      let earliestKey = this.keys[0];
      let earliestTime = this.cooldowns.get(earliestKey) || Infinity;
      for (const k of this.keys) {
        const t = this.cooldowns.get(k) || 0;
        if (t < earliestTime) {
          earliestTime = t;
          earliestKey = k;
        }
      }
      return earliestKey;
    }

    this.index = (this.index + 1) % available.length;
    return available[this.index];
  }

  public reportRateLimit(key: string, cooldownSeconds = 60) {
    this.cooldowns.set(key, Date.now() + cooldownSeconds * 1000);
  }

  public reportSuccess(key: string) {
    this.cooldowns.delete(key);
  }

  public totalKeys(): number {
    return this.keys.length;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PRE-CONFIGURED 100-KEY POOLS FOR NEXT.JS & COOLIFY / RUNPOD
// ══════════════════════════════════════════════════════════════════════════════

export const googleRotator = new KeyRotator('Google/Gemini', [
  'GOOGLE_API_KEYS',
  'GEMINI_API_KEYS',
  'GOOGLE_API_KEY',
  'GEMINI_API_KEY',
]);

export const groqRotator = new KeyRotator('Groq', [
  'GROQ_API_KEYS',
  'GROQ_API_KEY',
]);

export const imageRotator = new KeyRotator('Images IA', [
  'FREE_IMAGE_API_KEYS',
  'IMAGEN_API_KEYS',
  'FAL_KEY',
  'POLLINATIONS_API_KEYS',
  'IMAGE_API_KEY',
]);

export const videoRotator = new KeyRotator('Vidéos IA', [
  'FREE_VIDEO_API_KEYS',
  'RUNWAY_API_KEYS',
  'VEO_API_KEYS',
  'RUNPOD_API_KEY',
  'VIDEO_API_KEY',
  'RUNWAY_API_KEY',
]);

export const openaiRotator = new KeyRotator('OpenAI', [
  'OPENAI_API_KEYS',
  'OPENAI_API_KEY',
]);

export const anthropicRotator = new KeyRotator('Anthropic', [
  'ANTHROPIC_API_KEYS',
  'ANTHROPIC_API_KEY',
]);

export const deepseekRotator = new KeyRotator('DeepSeek', [
  'DEEPSEEK_API_KEYS',
  'DEEPSEEK_API_KEY',
]);
