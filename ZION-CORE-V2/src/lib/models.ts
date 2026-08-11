/**
 * Ñkyel AI · Types & Modèles
 * SmartANDJ AI Technologies
 * TypeScript strict — Taxonomie Officielle V3
 */

// ── Modèles IA ────────────────────────────────
export type NkyelModel = 'NKYEL_CHUI' | 'NKYEL_TAI' | 'NKYEL_RADI' | 'RECHERCHE_WEB' | 'BLUE_PANTHER';

export const MODEL_META: Record<NkyelModel, { label: string; icon: string; desc: string; credits: number; tier: number }> = {
  NKYEL_CHUI:    { label: 'Nkyel Chui',    icon: '⚡', desc: 'Réponses rapides & efficaces',       credits: 1,  tier: 0 },
  NKYEL_TAI:     { label: 'Nkyel Tai',     icon: '🧠', desc: 'Raisonnement profond & multimodal', credits: 5,  tier: 1 },
  NKYEL_RADI:    { label: 'Nkyel Radi',    icon: '🌍', desc: 'Langues gabonaises & tâches légères', credits: 3, tier: 0 },
  RECHERCHE_WEB: { label: 'Recherche Web', icon: '🔍', desc: 'Recherche web & deep research',     credits: 15, tier: 1 },
  BLUE_PANTHER:  { label: 'Blue Panther',  icon: '💎', desc: 'Mode Créateur Illimité',            credits: 0,  tier: 999 },
};

// ── Messages ──────────────────────────────────
export interface NkyelMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: NkyelModel;
  sources?: NkyelSource[];
  rendu?: NkyelRendu;
  created_at: number;
}

export interface NkyelSource {
  url: string;
  title: string;
  snippet?: string;
  favicon?: string;
  type: 'loxo_web' | 'loxo_rag' | 'coffre_fort';
}

// ── Conversations ─────────────────────────────
export interface NkyelConversation {
  id: string;
  title: string;
  model: NkyelModel;
  messages: NkyelMessage[];
  created_at: number;
  updated_at: number;
}

// ── Rendus (Artefacts) ────────────────────────
export type RenduType = 'markdown' | 'html' | 'pdf' | 'csv' | 'excel' | 'word' | 'code' | 'chart' | 'website';

export interface NkyelRendu {
  id: string;
  type: RenduType;
  title: string;
  content?: string;
  url?: string;
  language?: string;
  version?: number;
  created_at: number;
}

// ── Agent Events ──────────────────────────────
export type AgentEventStatus = 'pending' | 'active' | 'done' | 'error';
export type AgentPhase = 'idle' | 'planning' | 'executing' | 'done' | 'error';

export interface AgentEvent {
  id: string;
  type: string;
  label: string;
  icon_key: string;
  status: AgentEventStatus;
  duration_ms?: number;
  output?: string;
  started_at?: number;
}

export interface AgentFile {
  name: string;
  path: string;
  size: number;
  type: string;
}

// ── Utilisateur ───────────────────────────────
export interface NkyelUser {
  id: string;
  email: string;
  display_name: string;
  tier: NkyelModel;
  credits_used: number;
  credits_total: number;
  is_pioneer: boolean;
  pioneer_number?: number;
  node: string;
}
