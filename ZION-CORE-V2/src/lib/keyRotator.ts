/**
 * Nkyel AI · Key Rotator (Frontend & Next.js API Routes)
 * SmartANDJ AI Technologies
 * Multi-account key rotation for free AI tiers (Google Gemini, Groq, HuggingFace, Free Video & Images)
 */

export class KeyRotator {
  private keys: string[] = [];
  private cooldowns: Map<string, number> = new Map();
  private index = 0;

  constructor(private serviceName: string, private envVarName: string, fallbackKeys: string[] = []) {
    this.loadKeys(fallbackKeys);
  }

  private loadKeys(fallbackKeys: string[] = []) {
    const raw = process.env[this.envVarName] || '';
    const parsed = raw.split(',').map((k) => k.trim()).filter(Boolean);
    if (parsed.length > 0) {
      this.keys = parsed;
    } else {
      this.keys = fallbackKeys;
    }
  }

  public getActiveKey(): string | null {
    if (this.keys.length === 0) return null;
    const now = Date.now();
    const available = this.keys.filter((k) => (this.cooldowns.get(k) || 0) < now);

    if (available.length === 0) {
      return this.keys[0];
    }

    this.index = (this.index + 1) % available.length;
    return available[this.index];
  }

  public reportRateLimit(key: string, cooldownSeconds = 60) {
    this.cooldowns.set(key, Date.now() + cooldownSeconds * 1000);
  }

  public totalKeys(): number {
    return this.keys.length;
  }
}

export const googleRotator = new KeyRotator('Google/Gemini', 'GOOGLE_API_KEYS');
export const groqRotator = new KeyRotator('Groq', 'GROQ_API_KEYS');
export const imageRotator = new KeyRotator('Free Image APIs', 'FREE_IMAGE_API_KEYS');
export const videoRotator = new KeyRotator('Free Video APIs', 'FREE_VIDEO_API_KEYS');
