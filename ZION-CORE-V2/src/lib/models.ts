/**
 * GabomaAI · Types & Modèles
 * SmartANDJ AI Technologies
 * TypeScript strict — Taxonomie Officielle V3
 */

// ── Modèles IA ────────────────────────────────
export type GabomaModel = 'AURATA' | 'NKYEL' | 'ONYXGRIS' | 'WANDANA' | 'BLACK_PANTHER' | 'BLUE_PANTHER';

export const MODEL_META: Record<GabomaModel, { label: string; icon: string; desc: string; credits: number; tier: number }> = {
  AURATA:        { label: 'AURATA',        icon: '🐈', desc: 'Réponses rapides',         credits: 1,  tier: 0 },
  NKYEL:         { label: 'ÑKYEL',         icon: '🧠', desc: 'Modèle intelligent',     credits: 5,  tier: 0 },
  ONYXGRIS:      { label: 'ONYXGRIS',      icon: '🦜', desc: 'Langues gabonaises & agent',credits: 10, tier: 1 },
  WANDANA:       { label: 'WANDANA',       icon: '🐘', desc: 'Recherche web & deep research', credits: 15, tier: 1 },
  BLACK_PANTHER: { label: 'BLACK PANTHER', icon: '🐾', desc: 'Orchestrateur multi-agents',credits: 40, tier: 2 },
  BLUE_PANTHER: { label: 'BLUE PANTHER', icon: '💎', desc: 'Mode Créateur Illimité', credits: 0, tier: 999 },
};

// ── Messages ──────────────────────────────────
export interface GabomaMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: GabomaModel;
  sources?: GabomaSource[];
  rendu?: GabomaRendu;
  created_at: number;
}

export interface GabomaSource {
  url: string;
  title: string;
  snippet?: string;
  favicon?: string;
  type: 'loxo_web' | 'loxo_rag' | 'coffre_fort';
}

// ── Conversations ─────────────────────────────
export interface GabomaConversation {
  id: string;
  title: string;
  model: GabomaModel;
  messages: GabomaMessage[];
  created_at: number;
  updated_at: number;
}

// ── Rendus (Artefacts) ────────────────────────
export type RenduType = 'markdown' | 'html' | 'pdf' | 'csv' | 'excel' | 'word' | 'code' | 'chart' | 'website';

export interface GabomaRendu {
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
export interface GabomaUser {
  id: string;
  email: string;
  display_name: string;
  tier: GabomaModel;
  credits_used: number;
  credits_total: number;
  is_pioneer: boolean;
  pioneer_number?: number;
  node: string;
}
