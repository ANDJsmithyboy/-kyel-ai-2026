/* GabomaGPT · Better Stack Logger · SmartANDJ AI Technologies
   Structured JSON logging to Better Stack Logs
   Fondateur : Daniel Jonathan ANDJ */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  service: string;
  timestamp: string;
  [key: string]: unknown;
}

const BETTERSTACK_URL = 'https://in.logs.betterstack.com';

/** Send structured log to Better Stack */
async function sendLog(entry: LogEntry): Promise<void> {
  const token = process.env.BETTERSTACK_SOURCE_TOKEN;
  if (!token) {
    console.log(`[${entry.level.toUpperCase()}] ${entry.message}`, entry);
    return;
  }

  try {
    await fetch(BETTERSTACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(entry),
    });
  } catch {
    // Fallback to console if Better Stack is unreachable
    console.error('[BetterStack] Failed to send log:', entry);
  }
}

/** Gaboma logger */
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) =>
    sendLog({
      level: 'info',
      message,
      service: 'gabomagpt-web',
      timestamp: new Date().toISOString(),
      ...meta,
    }),

  warn: (message: string, meta?: Record<string, unknown>) =>
    sendLog({
      level: 'warn',
      message,
      service: 'gabomagpt-web',
      timestamp: new Date().toISOString(),
      ...meta,
    }),

  error: (message: string, meta?: Record<string, unknown>) =>
    sendLog({
      level: 'error',
      message,
      service: 'gabomagpt-web',
      timestamp: new Date().toISOString(),
      ...meta,
    }),

  debug: (message: string, meta?: Record<string, unknown>) =>
    sendLog({
      level: 'debug',
      message,
      service: 'gabomagpt-web',
      timestamp: new Date().toISOString(),
      ...meta,
    }),

  /** Log a chat completion event */
  chatCompletion: (userId: string, mode: string, latencyMs: number, tokensIn: number, tokensOut: number) =>
    sendLog({
      level: 'info',
      message: 'Chat completion',
      service: 'gabomagpt-web',
      timestamp: new Date().toISOString(),
      user_id: userId,
      mode,
      latency_ms: latencyMs,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
    }),

  /** Log an agent session */
  agentSession: (userId: string, traceId: string, outcome: string, latencyMs: number) =>
    sendLog({
      level: 'info',
      message: 'Agent session completed',
      service: 'gabomagpt-web',
      timestamp: new Date().toISOString(),
      user_id: userId,
      trace_id: traceId,
      outcome,
      latency_ms: latencyMs,
    }),
};
