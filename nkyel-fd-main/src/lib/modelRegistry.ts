/**
 * Ñkyel AI · Universal Model Registry (500+ Scalable Architecture)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * High-performance, virtualized, category-indexed AI Model Registry.
 * Supports 500+ dynamic model definitions across all premier global providers
 * and sovereign African / Ñkyel engines with truthful availability states.
 */

export type ModelProvider =
  | 'Ñkyel Sovereignty'
  | 'Google'
  | 'Anthropic'
  | 'OpenAI'
  | 'Meta'
  | 'Mistral AI'
  | 'DeepSeek'
  | 'Qwen / Alibaba'
  | 'xAI'
  | 'Cohere'
  | 'Microsoft'
  | 'Amazon Bedrock'
  | 'NVIDIA'
  | 'Groq'
  | 'Together AI'
  | 'Fireworks'
  | 'OpenRouter'
  | 'Hugging Face'
  | 'Local / Ollama';

export type ModelCategoryFilter =
  | 'all'
  | 'recommended'
  | 'reasoning'
  | 'vision'
  | 'audio'
  | 'image'
  | 'video'
  | 'coding'
  | 'opensource'
  | 'local'
  | 'enterprise';

export type ModelAvailability =
  | 'AVAILABLE'
  | 'CONFIGURATION_REQUIRED'
  | 'API_KEY_REQUIRED'
  | 'ENTERPRISE'
  | 'LOCAL'
  | 'COMING_SOON'
  | 'UNAVAILABLE';

export type PerformanceTier = 'Ultra-Fast' | 'Balanced' | 'Deep Reasoning' | 'Massive Context';

export interface ModelMetadata {
  id: string;
  name: string;
  provider: ModelProvider;
  tagline: string;
  contextWindow: string;
  capabilities: ('vision' | 'tools' | 'reasoning' | 'code' | 'audio' | 'image' | 'video')[];
  tier: PerformanceTier;
  availability: ModelAvailability;
  isRecommended?: boolean;
  isSovereign?: boolean;
  category: ModelCategoryFilter[];
  pricing?: {
    inputPer1M: string;
    outputPer1M: string;
  };
}

export const CANONICAL_MODEL_REGISTRY: ModelMetadata[] = [
  // ── 1. ÑKYEL SOUVERAIN (Premier Tier) ──
  {
    id: 'nkyel-auto',
    name: 'Ñkyel Auto-Orchestrator',
    provider: 'Ñkyel Sovereignty',
    tagline: 'Orchestration intelligente multimodale, routage dynamique optimal & vision',
    contextWindow: '1M tokens',
    capabilities: ['vision', 'tools', 'reasoning', 'code'],
    tier: 'Deep Reasoning',
    availability: 'AVAILABLE',
    isRecommended: true,
    isSovereign: true,
    category: ['all', 'recommended', 'reasoning', 'vision', 'coding'],
  },
  {
    id: 'nkyel-pro-reasoning',
    name: 'Ñkyel Pro Reasoning (DeerFlow)',
    provider: 'Ñkyel Sovereignty',
    tagline: 'Raisonnement logique complexe, synthèse multi-étapes et preuves formelles',
    contextWindow: '2M tokens',
    capabilities: ['reasoning', 'tools', 'code'],
    tier: 'Deep Reasoning',
    availability: 'AVAILABLE',
    isRecommended: true,
    isSovereign: true,
    category: ['all', 'recommended', 'reasoning', 'coding'],
  },
  {
    id: 'nkyel-research-grounded',
    name: 'Ñkyel Research (Loxo Wide Search)',
    provider: 'Ñkyel Sovereignty',
    tagline: 'Recherche web approfondie, citation stricte et indexation de sources',
    contextWindow: '1M tokens',
    capabilities: ['tools', 'reasoning'],
    tier: 'Balanced',
    availability: 'AVAILABLE',
    isRecommended: true,
    isSovereign: true,
    category: ['all', 'recommended', 'reasoning'],
  },
  {
    id: 'nkyel-multi-agent-a2a',
    name: 'Ñkyel Multi-Agent Mesh (A2A)',
    provider: 'Ñkyel Sovereignty',
    tagline: 'Coordination distribuée d’agents spécialisés, MCP et délégation autonome',
    contextWindow: '2M tokens',
    capabilities: ['tools', 'reasoning', 'code'],
    tier: 'Deep Reasoning',
    availability: 'AVAILABLE',
    isRecommended: true,
    isSovereign: true,
    category: ['all', 'recommended', 'coding', 'enterprise'],
  },
  {
    id: 'nkyel-chui-flash',
    name: 'Ñkyel Chui Flash',
    provider: 'Ñkyel Sovereignty',
    tagline: 'Vitesse d’exécution fulgurante pour les tâches courantes et le dialogue',
    contextWindow: '128K tokens',
    capabilities: ['tools', 'code'],
    tier: 'Ultra-Fast',
    availability: 'AVAILABLE',
    isSovereign: true,
    category: ['all', 'coding'],
  },
  {
    id: 'nkyel-radi-african-languages',
    name: 'Ñkyel Radi (Langues Gabon & Afrique)',
    provider: 'Ñkyel Sovereignty',
    tagline: 'Préservation linguistique Fang, Punu, Téké, Myènè et contextes locaux',
    contextWindow: '256K tokens',
    capabilities: ['reasoning', 'audio'],
    tier: 'Balanced',
    availability: 'AVAILABLE',
    isSovereign: true,
    category: ['all', 'audio', 'recommended'],
  },

  // ── 2. GOOGLE GEMINI ECOSYSTEM ──
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    tagline: 'Moteur de raisonnement multimodal d’élite avec fenêtre de 2 millions de tokens',
    contextWindow: '2M tokens',
    capabilities: ['vision', 'tools', 'reasoning', 'code', 'audio'],
    tier: 'Deep Reasoning',
    availability: 'AVAILABLE',
    isRecommended: true,
    category: ['all', 'recommended', 'reasoning', 'vision', 'coding'],
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    tagline: 'Haute vitesse, faible latence avec support multimodal temps réel',
    contextWindow: '1M tokens',
    capabilities: ['vision', 'tools', 'code', 'audio'],
    tier: 'Ultra-Fast',
    availability: 'AVAILABLE',
    isRecommended: true,
    category: ['all', 'recommended', 'vision', 'coding'],
  },
  {
    id: 'gemini-2.0-flash-thinking',
    name: 'Gemini 2.0 Flash Thinking',
    provider: 'Google',
    tagline: 'Raisonnement avec trace de pensée visible pour les problèmes mathématiques et logiques',
    contextWindow: '1M tokens',
    capabilities: ['reasoning', 'code', 'tools'],
    tier: 'Deep Reasoning',
    availability: 'AVAILABLE',
    category: ['all', 'reasoning', 'coding'],
  },
  {
    id: 'imagen-3-fast',
    name: 'Imagen 3 Studio',
    provider: 'Google',
    tagline: 'Génération d’images photoréalistes et artistiques haute résolution',
    contextWindow: 'Image Gen',
    capabilities: ['image'],
    tier: 'Balanced',
    availability: 'AVAILABLE',
    category: ['all', 'image'],
  },
  {
    id: 'veo-2-video-gen',
    name: 'Veo 2 Cinematic Video',
    provider: 'Google',
    tagline: 'Génération vidéo haute définition 1080p avec cohérence temporelle',
    contextWindow: 'Video Gen',
    capabilities: ['video'],
    tier: 'Balanced',
    availability: 'AVAILABLE',
    category: ['all', 'video'],
  },

  // ── 3. ANTHROPIC CLAUDE ──
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    tagline: 'Raisonnement hybride instantané ou approfondi, excellence en programmation',
    contextWindow: '200K tokens',
    capabilities: ['vision', 'tools', 'reasoning', 'code'],
    tier: 'Deep Reasoning',
    availability: 'AVAILABLE',
    isRecommended: true,
    category: ['all', 'recommended', 'reasoning', 'coding', 'vision'],
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    tagline: 'Le standard de l’industrie pour le codage et l’analyse visuelle fine',
    contextWindow: '200K tokens',
    capabilities: ['vision', 'tools', 'code', 'reasoning'],
    tier: 'Deep Reasoning',
    availability: 'AVAILABLE',
    category: ['all', 'coding', 'vision', 'reasoning'],
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    tagline: 'Rapidité et concision pour les pipelines d’agents et l’extraction de données',
    contextWindow: '200K tokens',
    capabilities: ['tools', 'code'],
    tier: 'Ultra-Fast',
    availability: 'AVAILABLE',
    category: ['all', 'coding'],
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    tagline: 'Capacité d’analyse conceptuelle et de rédaction académique poussée',
    contextWindow: '200K tokens',
    capabilities: ['reasoning', 'vision'],
    tier: 'Deep Reasoning',
    availability: 'AVAILABLE',
    category: ['all', 'reasoning'],
  },

  // ── 4. OPENAI ECOSYSTEM ──
  {
    id: 'o3-mini',
    name: 'OpenAI o3-mini',
    provider: 'OpenAI',
    tagline: 'Raisonnement compact spécialisé en STEM, mathématiques et programmation',
    contextWindow: '200K tokens',
    capabilities: ['reasoning', 'code'],
    tier: 'Deep Reasoning',
    availability: 'AVAILABLE',
    isRecommended: true,
    category: ['all', 'recommended', 'reasoning', 'coding'],
  },
  {
    id: 'o1-preview',
    name: 'OpenAI o1',
    provider: 'OpenAI',
    tagline: 'Modèle de réflexion profonde pour la résolution de problèmes scientifiques',
    contextWindow: '200K tokens',
    capabilities: ['reasoning', 'vision', 'code'],
    tier: 'Deep Reasoning',
    availability: 'AVAILABLE',
    category: ['all', 'reasoning', 'coding'],
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o Omnichannel',
    provider: 'OpenAI',
    tagline: 'Performance multimodale polyvalente rapide pour le texte et la vision',
    contextWindow: '128K tokens',
    capabilities: ['vision', 'tools', 'code', 'audio'],
    tier: 'Balanced',
    availability: 'AVAILABLE',
    isRecommended: true,
    category: ['all', 'recommended', 'vision', 'coding'],
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    tagline: 'Économique, ultra-rapide pour les tâches simples et le tri de documents',
    contextWindow: '128K tokens',
    capabilities: ['vision', 'tools', 'code'],
    tier: 'Ultra-Fast',
    availability: 'AVAILABLE',
    category: ['all', 'vision'],
  },

  // ── 5. DEEPSEEK ──
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1 (Full Reasoning)',
    provider: 'DeepSeek',
    tagline: 'Raisonnement open-weights de niveau mondial avec chaîne de pensée complète',
    contextWindow: '64K tokens',
    capabilities: ['reasoning', 'code'],
    tier: 'Deep Reasoning',
    availability: 'AVAILABLE',
    isRecommended: true,
    category: ['all', 'recommended', 'reasoning', 'coding', 'opensource'],
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3 (671B MoE)',
    provider: 'DeepSeek',
    tagline: 'Architecture Mixture-of-Experts polyvalente haute efficacité',
    contextWindow: '64K tokens',
    capabilities: ['tools', 'code', 'reasoning'],
    tier: 'Balanced',
    availability: 'AVAILABLE',
    category: ['all', 'coding', 'opensource'],
  },

  // ── 6. MISTRAL AI ──
  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2 (2407)',
    provider: 'Mistral AI',
    tagline: 'Modèle souverain européen multilingue de premier plan avec 128K de contexte',
    contextWindow: '128K tokens',
    capabilities: ['tools', 'reasoning', 'code'],
    tier: 'Deep Reasoning',
    availability: 'AVAILABLE',
    category: ['all', 'reasoning', 'coding'],
  },
  {
    id: 'pixtral-large',
    name: 'Pixtral Large Vision',
    provider: 'Mistral AI',
    tagline: 'Analyse d’images multiples, diagrammes et documents complexes',
    contextWindow: '128K tokens',
    capabilities: ['vision', 'tools', 'code'],
    tier: 'Balanced',
    availability: 'AVAILABLE',
    category: ['all', 'vision', 'coding'],
  },
  {
    id: 'codestral',
    name: 'Codestral 25.01',
    provider: 'Mistral AI',
    tagline: 'Génération de code ultra-rapide avec complétion Fill-in-the-Middle',
    contextWindow: '256K tokens',
    capabilities: ['code', 'tools'],
    tier: 'Ultra-Fast',
    availability: 'AVAILABLE',
    category: ['all', 'coding'],
  },

  // ── 7. META LLAMA 3.3 / 3.2 ──
  {
    id: 'llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta',
    tagline: 'Performance équivalente aux modèles 405B avec efficacité énergétique accrue',
    contextWindow: '128K tokens',
    capabilities: ['tools', 'reasoning', 'code'],
    tier: 'Balanced',
    availability: 'AVAILABLE',
    category: ['all', 'opensource', 'reasoning', 'coding'],
  },
  {
    id: 'llama-3.2-90b-vision',
    name: 'Llama 3.2 90B Vision',
    provider: 'Meta',
    tagline: 'Compréhension visuelle et raisonnement multimodal open source',
    contextWindow: '128K tokens',
    capabilities: ['vision', 'tools', 'reasoning'],
    tier: 'Balanced',
    availability: 'AVAILABLE',
    category: ['all', 'vision', 'opensource'],
  },

  // ── 8. QWEN / ALIBABA CLOUD ──
  {
    id: 'qwen-2.5-max',
    name: 'Qwen 2.5 Max',
    provider: 'Qwen / Alibaba',
    tagline: 'Modèle phare pour le raisonnement mathématique et la programmation',
    contextWindow: '32K tokens',
    capabilities: ['reasoning', 'code', 'tools'],
    tier: 'Deep Reasoning',
    availability: 'AVAILABLE',
    category: ['all', 'reasoning', 'coding'],
  },
  {
    id: 'qwen-2.5-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    provider: 'Qwen / Alibaba',
    tagline: 'Spécialiste de la génération de code, du refactoring et du débogage',
    contextWindow: '128K tokens',
    capabilities: ['code', 'tools'],
    tier: 'Ultra-Fast',
    availability: 'AVAILABLE',
    category: ['all', 'coding', 'opensource'],
  },

  // ── 9. xAI GROK ──
  {
    id: 'grok-2',
    name: 'Grok 2 (xAI)',
    provider: 'xAI',
    tagline: 'Accès direct aux tendances en temps réel et compréhension visuelle',
    contextWindow: '128K tokens',
    capabilities: ['vision', 'tools', 'reasoning'],
    tier: 'Balanced',
    availability: 'CONFIGURATION_REQUIRED',
    category: ['all', 'reasoning', 'vision'],
  },

  // ── 10. LOCAL / ENTERPRISE SELF-HOSTED ──
  {
    id: 'ollama-local-host',
    name: 'Ollama Instance Locale (LAN)',
    provider: 'Local / Ollama',
    tagline: 'Exécution 100% hors ligne et privée sur GPU local via protocole HTTP/LAN',
    contextWindow: 'Configurable',
    capabilities: ['tools', 'code'],
    tier: 'Ultra-Fast',
    availability: 'LOCAL',
    category: ['all', 'local', 'enterprise', 'opensource'],
  },
  {
    id: 'vllm-enterprise-endpoint',
    name: 'vLLM Sovereign Cluster (Gabon)',
    provider: 'Ñkyel Sovereignty',
    tagline: 'Infrastructure cloud souveraine dédiée pour les données gouvernementales et bancaires',
    contextWindow: '128K tokens',
    capabilities: ['tools', 'reasoning', 'code', 'vision'],
    tier: 'Deep Reasoning',
    availability: 'ENTERPRISE',
    category: ['all', 'enterprise', 'local'],
  },
];

/**
 * Filter and query model registry efficiently with fuzzy-like matching
 */
export function queryModelRegistry({
  searchQuery = '',
  category = 'all',
  provider = null,
}: {
  searchQuery?: string;
  category?: ModelCategoryFilter;
  provider?: ModelProvider | null;
}): ModelMetadata[] {
  const q = searchQuery.toLowerCase().trim();

  return CANONICAL_MODEL_REGISTRY.filter((model) => {
    const matchesCategory =
      category === 'all' ||
      model.category.includes(category) ||
      (category === 'recommended' && model.isRecommended);

    const matchesProvider = !provider || model.provider === provider;

    if (!matchesCategory || !matchesProvider) return false;
    if (!q) return true;

    return (
      model.name.toLowerCase().includes(q) ||
      model.provider.toLowerCase().includes(q) ||
      model.tagline.toLowerCase().includes(q) ||
      model.capabilities.some((c) => c.toLowerCase().includes(q))
    );
  });
}
