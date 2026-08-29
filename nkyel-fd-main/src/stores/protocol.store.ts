/**
 * Ñkyel AI — Central Protocol Store (Zustand)
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Provides real-time state, capabilities inspection, and mutation actions
 * for all 8 protocol subsystems.
 */

import { create } from 'zustand';
import type {
  MCPServerConfig,
  NkyelSkill,
  A2AAgentCard,
  A2ADelegation,
  A2AMessage,
  AGUIApprovalRequest,
  AGUIStreamEvent,
  A2UISurfaceSpec,
  MCPAppSpec,
  AP2PaymentMandate,
  UCPCheckoutSession,
  GoogleIntegrationTool,
  ProtocolHealthCard,
} from '@/lib/protocols/protocols.types';
import { protocolEventBus, type ProtocolLogEvent } from '@/lib/protocols/protocol-events';

// ─── Initial Mock & Real Datasets ───────────────────────────

const INITIAL_MCP_SERVERS: MCPServerConfig[] = [
  {
    id: 'mcp_fetch_official',
    name: 'Fetch & Web Crawler (Official)',
    version: '1.4.2',
    transport: 'stdio',
    command: 'uvx',
    args: ['mcp-server-fetch'],
    status: 'connected',
    latencyMs: 38,
    scopes: ['network:http', 'network:https'],
    errorCount: 0,
    appsCount: 1,
    provenance: 'Model Context Protocol / Anthropic Core',
    isOfficial: true,
    tools: [
      {
        name: 'fetch_url',
        description: 'Récupère le contenu d\'une page web HTTPS avec extraction propre et filtrage sécurisé',
        enabled: true,
        requiresApproval: false,
        sensitivityLevel: 'safe',
        callCount: 142,
        avgLatencyMs: 42,
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL cible HTTPS valide' },
            raw: { type: 'boolean', description: 'Retourner le HTML brut ou le texte nettoyé' },
          },
          required: ['url'],
        },
      },
      {
        name: 'extract_metadata',
        description: 'Extrait les métadonnées OpenGraph, balises meta et titres d\'une page',
        enabled: true,
        requiresApproval: false,
        sensitivityLevel: 'safe',
        callCount: 89,
        avgLatencyMs: 28,
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL cible' },
          },
          required: ['url'],
        },
      },
    ],
    resources: [
      { uri: 'fetch://cache/recent', name: 'Pages récentes en cache', mimeType: 'application/json', sizeBytes: 1048576 },
    ],
    resourceTemplates: [
      { uriTemplate: 'fetch://domain/{domain}', name: 'Explorateur par nom de domaine', mimeType: 'text/html' },
    ],
    prompts: [
      { name: 'summarize_page', description: 'Résume une page récupérée via son URL', arguments: [{ name: 'url', required: true }] },
    ],
  },
  {
    id: 'mcp_tavily_search',
    name: 'Tavily Deep Grounding MCP',
    version: '2.1.0',
    transport: 'sse',
    endpoint: 'https://api.tavily.com/mcp/v1',
    status: 'connected',
    latencyMs: 84,
    scopes: ['search:web', 'grounding:citations'],
    errorCount: 0,
    appsCount: 1,
    provenance: 'Tavily Search Engine / MCP Hub',
    isOfficial: true,
    tools: [
      {
        name: 'tavily_search',
        description: 'Effectue une recherche approfondie avec grounding, calcul de score de pertinence et citations',
        enabled: true,
        requiresApproval: false,
        sensitivityLevel: 'safe',
        callCount: 310,
        avgLatencyMs: 95,
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Requête de recherche' },
            search_depth: { type: 'string', enum: ['basic', 'advanced'], description: 'Profondeur de recherche' },
            max_results: { type: 'number', description: 'Nombre maximum de résultats (1-10)' },
          },
          required: ['query'],
        },
      },
    ],
    resources: [],
    resourceTemplates: [],
    prompts: [],
  },
  {
    id: 'mcp_postgres_db',
    name: 'Neon PostgreSQL Souverain',
    version: '1.2.0',
    transport: 'stdio',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    status: 'connected',
    latencyMs: 14,
    scopes: ['db:read', 'db:schema_inspect'],
    errorCount: 0,
    appsCount: 2,
    provenance: 'Neon Database Serverless',
    isOfficial: true,
    tools: [
      {
        name: 'read_query',
        description: 'Exécute une requête SQL SELECT en lecture seule dans la base souveraine',
        enabled: true,
        requiresApproval: false,
        sensitivityLevel: 'low',
        callCount: 65,
        avgLatencyMs: 16,
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Requête SELECT valide' },
          },
          required: ['query'],
        },
      },
      {
        name: 'execute_mutation',
        description: 'Exécute une opération d\'écriture SQL (INSERT, UPDATE, DELETE). Action sensible requérant confirmation.',
        enabled: true,
        requiresApproval: true,
        sensitivityLevel: 'high',
        callCount: 12,
        avgLatencyMs: 24,
        inputSchema: {
          type: 'object',
          properties: {
            sql: { type: 'string', description: 'Commande SQL de modification' },
            reason: { type: 'string', description: 'Justification de l\'écriture' },
          },
          required: ['sql', 'reason'],
        },
      },
    ],
    resources: [
      { uri: 'postgres://public/schema', name: 'Schéma relationnel public', mimeType: 'application/sql' },
    ],
    resourceTemplates: [],
    prompts: [],
  },
  {
    id: 'mcp_google_drive',
    name: 'Google Workspace & Drive MCP',
    version: '2.0.1',
    transport: 'sse',
    endpoint: 'https://mcp.workspace.google.com/v1',
    status: 'connected',
    latencyMs: 62,
    scopes: ['drive:read', 'docs:read', 'sheets:read'],
    errorCount: 0,
    appsCount: 1,
    provenance: 'Google Cloud Platform / Workspace Integrations',
    isOfficial: true,
    tools: [
      {
        name: 'search_drive_files',
        description: 'Recherche des fichiers Google Docs, Sheets, Slides et PDFs par mots-clés ou date',
        enabled: true,
        requiresApproval: false,
        sensitivityLevel: 'low',
        callCount: 54,
        avgLatencyMs: 58,
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Termes de recherche' },
            mime_type: { type: 'string', description: 'Filtre de type MIME' },
          },
          required: ['query'],
        },
      },
    ],
    resources: [],
    resourceTemplates: [],
    prompts: [],
  },
];

const INITIAL_SKILLS: NkyelSkill[] = [
  {
    id: 'skill_financial_research',
    name: 'Recherche & Modélisation Financière',
    slug: 'financial-research',
    description: 'Analyse approfondie de bilans, valorisations DCF, ratios financiers et structuration de rapports d\'investissement souverains.',
    version: '2.3.0',
    author: 'Daniel Jonathan ANDJ · SmartANDJ Core',
    compatibility: 'Ñkyel 2.0+, Gemini 2.5/3.7',
    status: 'active',
    isOfficial: true,
    usageCount: 78,
    successRatePercent: 98.4,
    tags: ['finance', 'dcf', 'macro-économie', 'rapports'],
    permissions: [
      { id: 'p_net', scope: 'network:search', reason: 'Recherche de données boursières et cours en direct', isSensitive: false },
      { id: 'p_math', scope: 'calc:financial_engine', reason: 'Calculs d\'actualisation et simulations Monte Carlo', isSensitive: false },
    ],
    scripts: [
      {
        filename: 'dcf_engine.py',
        runtime: 'python',
        code: 'def calculate_dcf(cash_flows, discount_rate, terminal_growth):\n    pv = sum(cf / ((1 + discount_rate) ** (i + 1)) for i, cf in enumerate(cash_flows))\n    terminal_val = (cash_flows[-1] * (1 + terminal_growth)) / (discount_rate - terminal_growth)\n    return pv + (terminal_val / ((1 + discount_rate) ** len(cash_flows)))',
        entrypoint: true,
      },
    ],
    references: [
      { title: 'Standard CFA Institute Valuations', url: 'https://cfainstitute.org/standards', type: 'spec' },
    ],
    assets: ['dcf_template.xlsx', 'executive_summary_schema.json'],
    instructionsMarkdown: `# Skill: Recherche & Modélisation Financière

Lorsque ce Skill est chargé dans WorkGraph :
1. Examiner les états financiers certifiés des 3 dernières années.
2. Établir une hypothèse de taux d'actualisation (WACC) basée sur le risque pays et sectoriel.
3. Produire un tableau comparatif A2UI avec les métriques clés (EV/EBITDA, P/E, FCF Yield).
4. Créer un artefact complet dans l'Artifact Studio avec réconciliation des sources.`,
  },
  {
    id: 'skill_code_architect',
    name: 'Architecture & Sandbox Code',
    slug: 'code-architect',
    description: 'Génération de composants TypeScript propres, tests unitaires, validation statique et exécution sécurisée en sandbox fx/e2b.',
    version: '3.1.0',
    author: 'SmartANDJ Engineering',
    compatibility: 'Ñkyel 2.0+, Python 3.13, Node 22',
    status: 'active',
    isOfficial: true,
    usageCount: 215,
    successRatePercent: 99.1,
    tags: ['code', 'sandbox', 'typescript', 'python'],
    permissions: [
      { id: 'p_exec', scope: 'sandbox:isolated_exec', reason: 'Exécution de code dans un conteneur éphémère sécurisé', isSensitive: true },
      { id: 'p_fs', scope: 'fs:read_workspace', reason: 'Lecture des fichiers du projet actif', isSensitive: false },
    ],
    scripts: [
      {
        filename: 'validator.js',
        runtime: 'javascript',
        code: 'export function validateSource(code) { return code.length > 0 && !code.includes("eval("); }',
        entrypoint: true,
      },
    ],
    references: [
      { title: 'TypeScript 5.7 Documentation', url: 'https://typescriptlang.org', type: 'doc' },
    ],
    assets: [],
    instructionsMarkdown: `# Skill: Architecture & Sandbox Code

Ce Skill ordonne l'ingénierie logicielle :
- Structurer le code selon les principes SOLID.
- Isoler l'exécution dans le conteneur sandbox fx (Vercel Labs) avec timeout de 15s.
- Émettre l'artefact de code directement dans la zone de droite (Artifact Studio).`,
  },
  {
    id: 'skill_multimodal_vision',
    name: 'Vision & Analyse Spatiale',
    slug: 'multimodal-vision',
    description: 'Inspection d\'images, lecture d\'architectures visuelles, génération graphique haute résolution via Imagen et rendu multimédia.',
    version: '1.8.0',
    author: 'Google AI / Ñkyel Vision Mesh',
    compatibility: 'Gemini 2.5 Pro Vision, Imagen 3',
    status: 'active',
    isOfficial: true,
    usageCount: 140,
    successRatePercent: 97.6,
    tags: ['vision', 'imagen', 'multimodal', 'spatial'],
    permissions: [
      { id: 'p_img', scope: 'media:generate_image', reason: 'Génération d\'images vectorielles et photoréalistes', isSensitive: false },
    ],
    scripts: [],
    references: [],
    assets: [],
    instructionsMarkdown: `# Skill: Vision & Analyse Spatiale
Traite les flux multimodaux, vectorise les schémas et pilote les transformations visuelles.`,
  },
];


const INITIAL_A2A_AGENTS: A2AAgentCard[] = [];

const INITIAL_GOOGLE_TOOLS: GoogleIntegrationTool[] = [
  {
    id: 'g_gemini',
    nkyelTitle: 'Ñkyel Raisonnement & Plan',
    secondaryVendorBadge: 'Gemini 3.7 Pro',
    category: 'ai',
    description: 'Moteur central de planification stratégique, multimodalité et arbitrage des missions.',
    status: 'Disponible',
    officialIcon: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg',
    realOperation: 'Inférence multimodale & orchestration LangGraph',
    currentModelVersion: 'gemini-3.7-pro-preview',
    avgLatencyMs: 320,
    callCount: 1420,
    samplePrompt: 'Analyse la complexité du problème et établis le graphe d\'exécution optimal.',
  },
  {
    id: 'g_code_exec',
    nkyelTitle: 'Ñkyel Sandbox Python',
    secondaryVendorBadge: 'Gemini Code Execution',
    category: 'ai',
    description: 'Exécution vérifiable de code Python dans l\'environnement sécurisé de Gemini.',
    status: 'Disponible',
    officialIcon: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg',
    realOperation: 'Compilation & exécution mathématique/data',
    currentModelVersion: 'gemini-code-execution-v1',
    avgLatencyMs: 140,
    callCount: 390,
    samplePrompt: 'Calcule la distribution de probabilité et trace la courbe analytique.',
  },
  {
    id: 'g_search_grounding',
    nkyelTitle: 'Ñkyel Grounding Souverain',
    secondaryVendorBadge: 'Grounding with Google Search',
    category: 'ai',
    description: 'Ancrage factuel en temps réel avec citations d\'URL vérifiées et extraits de sources.',
    status: 'Disponible',
    officialIcon: 'https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png',
    realOperation: 'Recherche Google en direct & injection de citations vérifiables',
    currentModelVersion: 'google-search-grounding-v2',
    avgLatencyMs: 210,
    callCount: 880,
    samplePrompt: 'Vérifie les annonces officielles des marchés de l\'énergie de cette semaine.',
  },
  {
    id: 'g_imagen',
    nkyelTitle: 'Ñkyel Vision Générative',
    secondaryVendorBadge: 'Imagen 3',
    category: 'ai',
    description: 'Génération d\'images haute résolution, infographies vectorielles et visuels de qualité studio.',
    status: 'Disponible',
    officialIcon: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg',
    realOperation: 'Synthèse d\'image 4K avec prompt photoréaliste',
    currentModelVersion: 'imagen-3.0-generate-002',
    avgLatencyMs: 1100,
    callCount: 240,
    samplePrompt: 'Génère un visuel conceptuel d\'un centre de données alimenté par énergie hydroélectrique.',
  },
  {
    id: 'g_veo',
    nkyelTitle: 'Ñkyel Motion & Cinéma',
    secondaryVendorBadge: 'Veo 2',
    category: 'ai',
    description: 'Création de scènes vidéo cinématiques, transitions de caméras et simulations de mouvement.',
    status: 'Bêta',
    officialIcon: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg',
    realOperation: 'Génération de clip vidéo 1080p 60fps',
    currentModelVersion: 'veo-2.0-video-preview',
    avgLatencyMs: 4200,
    callCount: 65,
    samplePrompt: 'Crée un travelling avant fluide au-dessus de la canopée équatoriale.',
  },
  {
    id: 'g_gemini_tts',
    nkyelTitle: 'Ñkyel Voix & Parole',
    secondaryVendorBadge: 'Gemini TTS Natural Voice',
    category: 'ai',
    description: 'Synthèse vocale expressive et naturelle en français, anglais et tonalités souveraines.',
    status: 'Disponible',
    officialIcon: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg',
    realOperation: 'Audio PCM streaming haute clarté',
    currentModelVersion: 'gemini-tts-v1-hd',
    avgLatencyMs: 180,
    callCount: 520,
    samplePrompt: 'Fais la lecture audio du résumé exécutif avec une voix posée et assurée.',
  },
  {
    id: 'g_drive',
    nkyelTitle: 'Ñkyel Drive & Documents',
    secondaryVendorBadge: 'Google Drive API',
    category: 'workspace',
    description: 'Synchronisation et lecture sécurisée des dépôts documentaires et archives d\'entreprise.',
    status: 'Disponible',
    officialIcon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png',
    realOperation: 'Lecture de documents & indexation vectorielle',
    currentModelVersion: 'google-drive-api-v3',
    avgLatencyMs: 85,
    callCount: 310,
    samplePrompt: 'Parcours le dossier "Stratégie 2026" et résume les points d\'action.',
  },
  {
    id: 'g_docs',
    nkyelTitle: 'Ñkyel Rédacteur Docs',
    secondaryVendorBadge: 'Google Docs API',
    category: 'workspace',
    description: 'Création et mise en page automatique de documents texte professionnels collaboratifs.',
    status: 'Disponible',
    officialIcon: 'https://ssl.gstatic.com/images/branding/product/1x/docs_2020q4_48dp.png',
    realOperation: 'Génération de document avec styles et pagination',
    currentModelVersion: 'google-docs-api-v1',
    avgLatencyMs: 95,
    callCount: 190,
    samplePrompt: 'Exporte le rapport d\'analyse dans un Google Doc formaté.',
  },
  {
    id: 'g_sheets',
    nkyelTitle: 'Ñkyel Tableur Sheets',
    secondaryVendorBadge: 'Google Sheets API',
    category: 'workspace',
    description: 'Génération de feuilles de calcul avec formules automatiques, tableaux croisés et styles.',
    status: 'Disponible',
    officialIcon: 'https://ssl.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png',
    realOperation: 'Insertion de cellules, formules dynamiques et graphiques',
    currentModelVersion: 'google-sheets-api-v4',
    avgLatencyMs: 90,
    callCount: 165,
    samplePrompt: 'Génère une feuille de calcul complète avec modèle DCF et formules automatiques.',
  },
  {
    id: 'g_slides',
    nkyelTitle: 'Ñkyel Présentation Slides',
    secondaryVendorBadge: 'Google Slides API',
    category: 'workspace',
    description: 'Composition automatique de diapositives professionnelles avec typographies et graphiques.',
    status: 'Disponible',
    officialIcon: 'https://ssl.gstatic.com/images/branding/product/1x/slides_2020q4_48dp.png',
    realOperation: 'Création de slides et mise en page visuelle',
    currentModelVersion: 'google-slides-api-v1',
    avgLatencyMs: 120,
    callCount: 110,
    samplePrompt: 'Construis une présentation de 5 slides synthétisant notre étude d\'impact.',
  },
  {
    id: 'g_firebase',
    nkyelTitle: 'Ñkyel Déploiement App',
    secondaryVendorBadge: 'Firebase App Hosting',
    category: 'cloud',
    description: 'Déploiement en un clic de sites web et applications Next.js générées vers le CDN mondial.',
    status: 'Disponible',
    officialIcon: 'https://www.gstatic.com/devrel-devsite/prod/v9430fd3fe601db7c8ee4bc1a7a0b38d380e9a7e67fb67425143a3d5483f9dd40/firebase/images/touchicon-180.png',
    realOperation: 'Build conteneurisé & déploiement mondial sécurisé',
    currentModelVersion: 'firebase-app-hosting-v1',
    avgLatencyMs: 380,
    callCount: 85,
    samplePrompt: 'Déploie le livrable web vers Firebase App Hosting.',
  },
];

const INITIAL_HEALTH_CARDS: ProtocolHealthCard[] = [
  {
    id: 'mcp',
    name: 'Model Context Protocol',
    acronym: 'MCP',
    negotiatedVersion: '2024-11-05',
    connectionStatus: 'connected',
    authMode: 'Local Pipe / OAuth2',
    capabilitiesCount: 8,
    requestsCount: 563,
    latencyMs: 42,
    errorsCount: 0,
    lastEventAt: 'Il y a 3s',
    environment: 'Local WorkGraph',
    statusBadge: 'actif',
    accentColor: '#5BA3B5',
  },
  {
    id: 'skills',
    name: 'Ñkyel Skills Engine (SKILL.md)',
    acronym: 'SKILLS',
    negotiatedVersion: '1.0.0 (Open Format)',
    connectionStatus: 'connected',
    authMode: 'JWT / Scope RBAC',
    capabilitiesCount: 12,
    requestsCount: 433,
    latencyMs: 12,
    errorsCount: 0,
    lastEventAt: 'Il y a 12s',
    environment: 'Local WorkGraph',
    statusBadge: 'actif',
    accentColor: '#C39A52',
  },
  {
    id: 'a2a',
    name: 'Agent2Agent Protocol',
    acronym: 'A2A',
    negotiatedVersion: '2.0.0-RFC',
    connectionStatus: 'connected',
    authMode: 'mTLS & Token Mesh',
    capabilitiesCount: 4,
    requestsCount: 289,
    latencyMs: 34,
    errorsCount: 0,
    lastEventAt: 'Il y a 8s',
    environment: 'Edge Mesh',
    statusBadge: 'actif',
    accentColor: '#6F9485',
  },
  {
    id: 'agui',
    name: 'AG-UI Event & Stream Layer',
    acronym: 'AG-UI',
    negotiatedVersion: '1.2.0 (SSE)',
    connectionStatus: 'active',
    authMode: 'JWT Sovereign Session',
    capabilitiesCount: 9,
    requestsCount: 1820,
    latencyMs: 8,
    errorsCount: 0,
    lastEventAt: 'À l\'instant',
    environment: 'Local WorkGraph',
    statusBadge: 'actif',
    accentColor: '#315A70',
  },
  {
    id: 'a2ui',
    name: 'A2UI Declarative Interfaces',
    acronym: 'A2UI',
    negotiatedVersion: '1.0.0 JSON-UI',
    connectionStatus: 'active',
    authMode: 'Native Component Sandbox',
    capabilitiesCount: 9,
    requestsCount: 312,
    latencyMs: 15,
    errorsCount: 0,
    lastEventAt: 'Il y a 25s',
    environment: 'Local WorkGraph',
    statusBadge: 'actif',
    accentColor: '#765E78',
  },
  {
    id: 'mcp_apps',
    name: 'MCP Apps Sandbox Runner',
    acronym: 'MCP APPS',
    negotiatedVersion: '1.0.0-draft',
    connectionStatus: 'standby',
    authMode: 'Isolated Iframe Sandbox',
    capabilitiesCount: 3,
    requestsCount: 94,
    latencyMs: 22,
    errorsCount: 0,
    lastEventAt: 'Il y a 1m',
    environment: 'Local WorkGraph',
    statusBadge: 'actif',
    accentColor: '#665F9E',
  },
  {
    id: 'ap2_ucp',
    name: 'Ñkyel Pay (AP2 & UCP)',
    acronym: 'AP2/UCP',
    negotiatedVersion: 'Draft 0.4',
    connectionStatus: 'experimental',
    authMode: 'Human-in-the-Loop Explicit Mandate',
    capabilitiesCount: 4,
    requestsCount: 18,
    latencyMs: 65,
    errorsCount: 0,
    lastEventAt: 'Il y a 12m',
    environment: 'Sovereign Cloud',
    statusBadge: 'expérimental',
    accentColor: '#D98E3B',
  },
  {
    id: 'google_workspace',
    name: 'Google AI & Workspace Mesh',
    acronym: 'GOOGLE AI',
    negotiatedVersion: 'v1 / v2 / v3 REST',
    connectionStatus: 'connected',
    authMode: 'OAuth2 & API Key Sovereign',
    capabilitiesCount: 14,
    requestsCount: 2450,
    latencyMs: 140,
    errorsCount: 0,
    lastEventAt: 'À l\'instant',
    environment: 'Sovereign Cloud',
    statusBadge: 'actif',
    accentColor: '#4285F4',
  },
];

// ─── Store Interface ────────────────────────────────────────

interface ProtocolStoreState {
  // Protocol lists
  mcpServers: MCPServerConfig[];
  skills: NkyelSkill[];
  a2aAgents: A2AAgentCard[];
  delegations: A2ADelegation[];
  activeDelegationId: string | null;
  googleTools: GoogleIntegrationTool[];
  healthCards: ProtocolHealthCard[];
  
  // Active AG-UI state
  activeApprovalRequest: AGUIApprovalRequest | null;
  streamEvents: AGUIStreamEvent[];
  isMissionRunning: boolean;
  missionProgress: number;
  missionStepLabel: string;
  
  // A2UI Surfaces
  activeA2UISurfaces: A2UISurfaceSpec[];
  
  // MCP Apps
  mcpApps: MCPAppSpec[];
  activeMCPApp: MCPAppSpec | null;

  // AP2 & UCP Pay
  activePaymentMandate: AP2PaymentMandate | null;
  checkoutSession: UCPCheckoutSession | null;

  // Actions
  addMCPServer: (server: MCPServerConfig) => void;
  toggleMCPTool: (serverId: string, toolName: string) => void;
  setMCPToolApproval: (serverId: string, toolName: string, requiresApproval: boolean) => void;
  
  addSkill: (skill: NkyelSkill) => void;
  toggleSkillStatus: (skillId: string) => void;
  testSkillLive: (skillId: string, inputPayload: string) => Promise<{ output: string; latencyMs: number }>;

  delegateA2ATask: (targetAgentId: string, taskTitle: string, goal: string) => Promise<A2ADelegation>;
  sendA2AMessage: (delegationId: string, content: string, type?: A2AMessage['type']) => void;

  requestApproval: (request: AGUIApprovalRequest) => void;
  resolveApproval: (action: 'accept' | 'reject' | 'modify', constraint?: string) => void;
  
  pushStreamEvent: (event: AGUIStreamEvent) => void;
  setMissionProgress: (isRunning: boolean, progress: number, stepLabel: string) => void;

  renderA2UISurface: (spec: A2UISurfaceSpec) => void;
  openMCPApp: (app: MCPAppSpec) => void;
  closeMCPApp: () => void;

  requestPaymentMandate: (mandate: Omit<AP2PaymentMandate, 'id' | 'status' | 'requestedAt'>) => void;
  approvePaymentMandate: (mandateId: string) => void;
  cancelPaymentMandate: (mandateId: string, reason: string) => void;
  fetchA2AAgents: () => Promise<void>;
}

export const useProtocolStore = create<ProtocolStoreState>((set: any, get: any) => ({
  mcpServers: INITIAL_MCP_SERVERS,
  skills: INITIAL_SKILLS,
  a2aAgents: INITIAL_A2A_AGENTS,
  delegations: [],
  activeDelegationId: null,
  googleTools: INITIAL_GOOGLE_TOOLS,
  healthCards: INITIAL_HEALTH_CARDS,

  activeApprovalRequest: null,
  streamEvents: [],
  isMissionRunning: false,
  missionProgress: 0,
  missionStepLabel: 'Prêt',

  activeA2UISurfaces: [],
  mcpApps: [
    {
      id: 'app_data_explorer',
      title: 'Explorateur de Données Financières MCP',
      description: 'Application interactive permettant le filtrage dynamique des séries temporelles et ratios.',
      version: '1.0.0',
      toolOrigin: 'read_query',
      serverOrigin: 'mcp_postgres_db',
      appType: 'data_explorer',
      sandboxPermissions: ['storage:read', 'export:csv'],
      initialState: { selectedYear: 2025, currency: 'EUR' },
    },
  ],
  activeMCPApp: null,

  activePaymentMandate: null,
  checkoutSession: null,

  addMCPServer: (server: MCPServerConfig) => {
    set((state: ProtocolStoreState) => ({
      mcpServers: [...state.mcpServers, server],
    }));
    protocolEventBus.emit('mcp.server.connected', 'mcp', `Nouveau serveur MCP connecté : ${server.name}`, { serverId: server.id });
  },

  toggleMCPTool: (serverId: string, toolName: string) => {
    set((state: ProtocolStoreState) => ({
      mcpServers: state.mcpServers.map((s) => {
        if (s.id !== serverId) return s;
        return {
          ...s,
          tools: s.tools.map((t) => (t.name === toolName ? { ...t, enabled: !t.enabled } : t)),
        };
      }),
    }));
  },

  setMCPToolApproval: (serverId: string, toolName: string, requiresApproval: boolean) => {
    set((state: ProtocolStoreState) => ({
      mcpServers: state.mcpServers.map((s) => {
        if (s.id !== serverId) return s;
        return {
          ...s,
          tools: s.tools.map((t) => (t.name === toolName ? { ...t, requiresApproval } : t)),
        };
      }),
    }));
  },

  addSkill: (skill: NkyelSkill) => {
    set((state: ProtocolStoreState) => ({
      skills: [...state.skills, skill],
    }));
    protocolEventBus.emit('skill.discovered', 'skill', `Nouveau Skill découvert : ${skill.name}`, { skillId: skill.id });
  },

  toggleSkillStatus: (skillId: string) => {
    set((state: ProtocolStoreState) => ({
      skills: state.skills.map((sk) => {
        if (sk.id !== skillId) return sk;
        return { ...sk, status: sk.status === 'active' ? 'disabled' : 'active' };
      }),
    }));
  },

  testSkillLive: async (skillId: string, inputPayload: string) => {
    const skill = get().skills.find((s: NkyelSkill) => s.id === skillId);
    if (!skill) throw new Error('Skill introuvable');

    protocolEventBus.emit('skill.loaded', 'skill', `Chargement du Skill : ${skill.name}`, { skillId });
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 600));
    const latencyMs = Math.round(performance.now() - start);

    const output = `[Banc d'essai Ñkyel Skill: ${skill.name}]\n✓ Permissions validées : ${skill.permissions.map((p) => p.scope).join(', ')}\n✓ Instructions compilées (v${skill.version})\n✓ Résultat exécuté pour l'entrée : "${inputPayload.slice(0, 40)}"\n✓ Statut : SUCCÈS (Temps d'exécution : ${latencyMs}ms)`;

    protocolEventBus.emit('skill.executed', 'skill', `Skill exécuté avec succès : ${skill.name}`, { skillId, output }, 'success', latencyMs);

    set((state: ProtocolStoreState) => ({
      skills: state.skills.map((s) =>
        s.id === skillId ? { ...s, usageCount: s.usageCount + 1, lastUsedAt: new Date().toISOString() } : s
      ),
    }));

    return { output, latencyMs };
  },

  delegateA2ATask: async (targetAgentId: string, taskTitle: string, goal: string) => {
    const targetAgent = get().a2aAgents.find((a: A2AAgentCard) => a.id === targetAgentId);
    const delegationId = `del_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const initialMsg: A2AMessage = {
      id: `msg_${Date.now()}_1`,
      delegationId,
      senderId: 'agent_strategist',
      senderName: 'Ñkyel Stratège',
      recipientId: targetAgentId,
      recipientName: targetAgent?.name || 'Agent Distant',
      type: 'task_request',
      content: `Délégation de mission : ${taskTitle}. Objectif : ${goal}`,
      timestamp: new Date().toISOString(),
    };

    const newDelegation: A2ADelegation = {
      id: delegationId,
      parentMissionId: `mission_${Date.now()}`,
      initiatorAgentId: 'agent_strategist',
      targetAgentId,
      targetAgentName: targetAgent?.name || 'Agent A2A',
      taskTitle,
      goal,
      status: 'delegated',
      progressPercent: 20,
      startedAt: new Date().toISOString(),
      messages: [initialMsg],
      artifactsReceived: [],
    };

    set((state: ProtocolStoreState) => ({
      delegations: [newDelegation, ...state.delegations],
      activeDelegationId: delegationId,
    }));

    protocolEventBus.emit(
      'a2a.task.delegated',
      'a2a',
      `Mission déléguée à ${newDelegation.targetAgentName} : ${taskTitle}`,
      { delegationId, targetAgentId }
    );

    // Simulation de réponse de l'agent
    setTimeout(() => {
      get().sendA2AMessage(
        delegationId,
        `Mission acceptée. Analyse des contraintes en cours selon le protocole A2A/2.0.`,
        'progress_update'
      );
    }, 800);

    return newDelegation;
  },

  sendA2AMessage: (delegationId: string, content: string, type: A2AMessage['type'] = 'progress_update') => {
    set((state: ProtocolStoreState) => ({
      delegations: state.delegations.map((del) => {
        if (del.id !== delegationId) return del;
        const msg: A2AMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          delegationId,
          senderId: del.targetAgentId,
          senderName: del.targetAgentName,
          recipientId: del.initiatorAgentId,
          recipientName: 'Ñkyel Stratège',
          type,
          content,
          timestamp: new Date().toISOString(),
        };
        return {
          ...del,
          progressPercent: Math.min(100, del.progressPercent + 25),
          status: del.progressPercent >= 75 ? 'completed' : 'processing',
          messages: [...del.messages, msg],
        };
      }),
    }));

    protocolEventBus.emit('a2a.message.received', 'a2a', `Message A2A reçu pour ${delegationId}: ${content.slice(0, 45)}...`, { delegationId, content });
  },

  requestApproval: (request: AGUIApprovalRequest) => {
    set({ activeApprovalRequest: request });
    protocolEventBus.emit(
      'agui.approval.required',
      'agui',
      `Intervention humaine requise : ${request.actionTitle}`,
      { requestId: request.id, sensitivity: request.sensitivity },
      'warning'
    );
  },

  resolveApproval: (action: 'accept' | 'reject' | 'modify', constraint?: string) => {
    const active = get().activeApprovalRequest;
    if (!active) return;

    set({ activeApprovalRequest: null });
    protocolEventBus.emit(
      'agui.state.updated',
      'agui',
      `Demande d'approbation résolue : ${action.toUpperCase()}${constraint ? ` avec contrainte : "${constraint}"` : ''}`,
      { requestId: active.id, action, constraint },
      action === 'reject' ? 'error' : 'success'
    );
  },

  pushStreamEvent: (event: AGUIStreamEvent) => {
    set((state: ProtocolStoreState) => ({
      streamEvents: [event, ...state.streamEvents.slice(0, 80)],
    }));
  },

  setMissionProgress: (isRunning: boolean, progress: number, stepLabel: string) => {
    set({
      isMissionRunning: isRunning,
      missionProgress: progress,
      missionStepLabel: stepLabel,
    });
  },

  renderA2UISurface: (spec: A2UISurfaceSpec) => {
    set((state: ProtocolStoreState) => ({
      activeA2UISurfaces: [spec, ...state.activeA2UISurfaces.filter((s) => s.id !== spec.id)],
    }));
    protocolEventBus.emit('a2ui.surface.created', 'a2ui', `Surface A2UI déclarative générée : ${spec.title}`, { surfaceId: spec.id, type: spec.componentType });
  },

  openMCPApp: (app: MCPAppSpec) => {
    set({ activeMCPApp: app });
    protocolEventBus.emit('mcp.app.rendered', 'mcp', `MCP App interactive affichée : ${app.title}`, { appId: app.id });
  },

  closeMCPApp: () => {
    set({ activeMCPApp: null });
  },

  requestPaymentMandate: (mandateData: Omit<AP2PaymentMandate, 'id' | 'status' | 'requestedAt'>) => {
    const mandate: AP2PaymentMandate = {
      ...mandateData,
      id: `mandate_${Date.now()}`,
      status: 'pending_user_confirmation',
      isExperimental: true,
      requiresExplicitHumanApproval: true,
      requestedAt: new Date().toISOString(),
    };

    set({ activePaymentMandate: mandate });
    protocolEventBus.emit('ap2.mandate.requested', 'ap2', `Intention de paiement AP2 requise : ${mandate.amount} ${mandate.currency} vers ${mandate.merchantName}`, { mandateId: mandate.id }, 'warning');
  },

  approvePaymentMandate: (mandateId: string) => {
    set((state: ProtocolStoreState) => {
      if (state.activePaymentMandate?.id !== mandateId) return state;
      return {
        activePaymentMandate: {
          ...state.activePaymentMandate,
          status: 'approved',
          approvedAt: new Date().toISOString(),
          authorizationProof: `proof_sig_${Math.random().toString(36).slice(2, 12)}`,
          receiptId: `rcpt_${Date.now()}`,
        },
      };
    });
    protocolEventBus.emit('ap2.mandate.approved', 'ap2', `Mandat AP2 approuvé avec signature humaine`, { mandateId }, 'success');
  },

  cancelPaymentMandate: (mandateId: string, reason: string) => {
    set((state: ProtocolStoreState) => {
      if (state.activePaymentMandate?.id !== mandateId) return state;
      return {
        activePaymentMandate: {
          ...state.activePaymentMandate,
          status: 'cancelled',
          cancellationReason: reason,
        },
      };
    });
    protocolEventBus.emit('ap2.mandate.requested', 'ap2', `Mandat AP2 annulé : ${reason}`, { mandateId, reason }, 'error');
  },

  fetchA2AAgents: async () => {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        if (data.agents && Array.isArray(data.agents)) {
          set((state: ProtocolStoreState) => {
            const newAgents = data.agents.map((agent: any) => ({
              id: agent.agent_id,
              name: agent.name,
              role: agent.role || 'Visual Agent',
              avatar: agent.name.charAt(0).toUpperCase(),
              provider: 'Visual Agent Studio',
              endpoint: `a2a://internal/${agent.agent_id}`,
              version: agent.version?.toString() || '1.0.0',
              status: 'idle',
              declaredCapabilities: [agent.cognition_mode, 'autonomy:' + agent.autonomy],
              supportedProtocols: ['A2A/2.0'],
              maxConcurrency: 1,
              activeDelegations: 0,
              reputationScore: 100,
              latencyMs: Math.floor(Math.random() * 50) + 10,
            }));
            
            // Merge with static agents
            const existingIds = new Set(newAgents.map((a: any) => a.id));
            const retainedStatic = state.a2aAgents.filter(a => !existingIds.has(a.id));
            
            return {
              a2aAgents: [...newAgents, ...retainedStatic]
            };
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch A2A agents:', err);
    }
  },
}));
