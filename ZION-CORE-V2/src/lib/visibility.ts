/**
 * Ñkyel AI — Frontend Provider Visibility Policy & Showcase Engine · SmartANDJ AI Technologies
 * Implémente la politique stricte de visibilité des fournisseurs selon 3 niveaux :
 * - LEVEL 1 — USER : Affiche les capacités d'agents souverains Ñkyel (Visual, Video, Research). Masque l'infrastructure.
 * - LEVEL 2 — GOOGLE SHOWCASE : Active l'attribution Google UNIQUEMENT pour les technologies Google réellement exécutées (Vérité absolue).
 * - LEVEL 3 — ADMIN / OWNER : Affiche la traçabilité complète (modèle, routeur, latence, coût, request ID).
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

export type VisibilityLevel = 'USER' | 'GOOGLE_SHOWCASE' | 'ADMIN';

export interface ProvenanceDetails {
  agentName?: string;
  provider?: string;          // 'google' | 'fal' | 'runway' | 'groq' | 'tavily' | 'nkyel'
  model?: string;             // 'gemini-3.7-flash' | 'nano-banana' | 'veo-3.1' | ...
  accessMethod?: string;      // 'DIRECT_GOOGLE' | 'RUNWAY_ROUTER' | 'DIRECT_FAL' | ...
  taskTitle?: string;
  sourceCount?: number;
  evidenceCount?: number;
  latencyMs?: number;
  costUsd?: number;
  requestId?: string;
}

export interface AttributionDisplay {
  showGoogleAttribution: boolean;
  agentLabel: string;
  primaryAttribution: string;
  secondaryAttribution?: string;
  googleProduct?: string;
  isDirectGoogle: boolean;
  adminDetails?: {
    provider: string;
    model: string;
    accessMethod: string;
    latencyMs?: number;
    costUsd?: number;
    requestId?: string;
  };
}

/**
 * Résout l'attribution selon le niveau de visibilité et garantit la VÉRITÉ ABSOLUE.
 */
export function resolveAttribution(
  provenance: ProvenanceDetails,
  level: VisibilityLevel = 'USER'
): AttributionDisplay {
  const agentLabel = provenance.agentName || 'Agent Autonome Ñkyel';
  const provider = (provenance.provider || '').toLowerCase();
  const accessMethod = provenance.accessMethod || 'DIRECT_GOOGLE';
  const model = provenance.model || '';

  const isDirectGoogle = provider === 'google' && accessMethod === 'DIRECT_GOOGLE';
  const isRoutedGoogle = provider === 'google' && accessMethod !== 'DIRECT_GOOGLE';

  // ── 1. NIVEAU 1 — USER (Par défaut) ───────────────────────────
  if (level === 'USER') {
    return {
      showGoogleAttribution: false,
      agentLabel,
      primaryAttribution: agentLabel,
      secondaryAttribution: provenance.taskTitle || 'Livrable validé',
      isDirectGoogle: false,
    };
  }

  // ── 2. NIVEAU 2 — GOOGLE SHOWCASE (Reviewer / Démo) ───────────
  if (level === 'GOOGLE_SHOWCASE') {
    // VÉRITÉ STRICTE : Si ce n'est PAS du Google Direct, on n'affiche PAS de badge Google.
    if (isDirectGoogle) {
      let googleProduct = 'Google AI';
      if (model.includes('gemini-3.1-flash-image') || model.includes('gemini-3-pro-image') || model.includes('nano-banana')) {
        googleProduct = 'Google Image';
      } else if (model.includes('veo')) {
        googleProduct = 'Veo';
      } else if (model.includes('search') || provenance.taskTitle?.toLowerCase().includes('search')) {
        googleProduct = 'Google Search';
      } else if (model.includes('maps') || provenance.taskTitle?.toLowerCase().includes('carte') || provenance.taskTitle?.toLowerCase().includes('location')) {
        googleProduct = 'Google Maps';
      } else if (model.includes('gemini')) {
        googleProduct = 'Gemini';
      }

      return {
        showGoogleAttribution: true,
        agentLabel,
        primaryAttribution: `Powered by Google · ${googleProduct}`,
        secondaryAttribution: model,
        googleProduct,
        isDirectGoogle: true,
      };
    }

    // Si le modèle est exécuté par fal, runway ou tavily : affichage capacité Ñkyel uniquement
    return {
      showGoogleAttribution: false,
      agentLabel,
      primaryAttribution: agentLabel,
      secondaryAttribution: provenance.taskTitle || 'Livrable validé',
      isDirectGoogle: false,
    };
  }

  // ── 3. NIVEAU 3 — ADMIN / OWNER ───────────────────────────────
  return {
    showGoogleAttribution: isDirectGoogle,
    agentLabel,
    primaryAttribution: isDirectGoogle ? `Google Direct · ${model}` : `${provider.toUpperCase()} · ${model}`,
    secondaryAttribution: accessMethod,
    googleProduct: isDirectGoogle ? 'Google AI' : undefined,
    isDirectGoogle,
    adminDetails: {
      provider,
      model,
      accessMethod,
      latencyMs: provenance.latencyMs,
      costUsd: provenance.costUsd,
      requestId: provenance.requestId,
    },
  };
}

/**
 * Calcule le récapitulatif compact des technologies Google réellement utilisées
 * pour l'écran de complétion de mission (basé sur la télémétrie réelle).
 */
export function extractGoogleTelemetrySummary(events: ProvenanceDetails[]): {
  geminiUsed: boolean;
  searchGrounded: boolean;
  mapsUsed: boolean;
  imageGenerated: boolean;
  videoGenerated: boolean;
  workspaceUsed: boolean;
  totalDirectGoogleCalls: number;
} {
  let geminiUsed = false;
  let searchGrounded = false;
  let mapsUsed = false;
  let imageGenerated = false;
  let videoGenerated = false;
  let workspaceUsed = false;
  let totalDirectGoogleCalls = 0;

  for (const ev of events) {
    const isDirect = ev.provider === 'google' && ev.accessMethod === 'DIRECT_GOOGLE';
    if (!isDirect) continue;

    totalDirectGoogleCalls++;
    const m = (ev.model || '').toLowerCase();
    const t = (ev.taskTitle || '').toLowerCase();

    if (m.includes('gemini') && !m.includes('image')) geminiUsed = true;
    if (m.includes('search') || t.includes('search') || (ev.sourceCount && ev.sourceCount > 0)) searchGrounded = true;
    if (m.includes('maps') || t.includes('map') || t.includes('location')) mapsUsed = true;
    if (m.includes('image') || m.includes('nano-banana')) imageGenerated = true;
    if (m.includes('veo')) videoGenerated = true;
    if (m.includes('workspace') || m.includes('sheet') || m.includes('doc')) workspaceUsed = true;
  }

  return {
    geminiUsed,
    searchGrounded,
    mapsUsed,
    imageGenerated,
    videoGenerated,
    workspaceUsed,
    totalDirectGoogleCalls,
  };
}
