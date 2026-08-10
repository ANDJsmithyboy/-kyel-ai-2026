/* GabomaGPT · PostHog Analytics · SmartANDJ AI Technologies
   Client-side + Server-side PostHog integration
   Fondateur : Daniel Jonathan ANDJ */

'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

// ── Initialize PostHog ──────────────────────────────────────
function PostHogInit() {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        session_recording: {
          maskAllInputs: false,
          maskInputOptions: { password: true },
        },
      });
    }
  }, []);
  return null;
}

// ── Provider ────────────────────────────────────────────────
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <PostHogInit />
      {children}
    </PHProvider>
  );
}

// ══════════════════════════════════════════════════════════
// EVENT HELPERS
// ══════════════════════════════════════════════════════════

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties);
  }
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, traits);
  }
}

// ── Gaboma-specific events ──────────────────────────────────
export const gabomaEvents = {
  chatSent: (mode: string, lang: string) =>
    trackEvent('chat_message_sent', { mode, language: lang }),

  chatReceived: (mode: string, latencyMs: number, tokensOut: number) =>
    trackEvent('chat_response_received', { mode, latency_ms: latencyMs, tokens_out: tokensOut }),

  feedbackGiven: (type: string, messageId: string) =>
    trackEvent('feedback_given', { feedback_type: type, message_id: messageId }),

  modeChanged: (from: string, to: string) =>
    trackEvent('mode_changed', { from_mode: from, to_mode: to }),

  modelChanged: (from: string, to: string) =>
    trackEvent('model_changed', { from_model: from, to_model: to }),

  responseCopied: (messageId: string) =>
    trackEvent('response_copied', { message_id: messageId }),

  responseRegenerated: (messageId: string) =>
    trackEvent('response_regenerated', { message_id: messageId }),

  responseShared: (messageId: string) =>
    trackEvent('response_shared', { message_id: messageId }),

  webSearchUsed: (query: string) =>
    trackEvent('web_search_used', { query }),

  agentSessionStarted: (intent: string) =>
    trackEvent('agent_session_started', { intent }),

  agentSessionCompleted: (outcome: string, latencyMs: number) =>
    trackEvent('agent_session_completed', { outcome, latency_ms: latencyMs }),
};
