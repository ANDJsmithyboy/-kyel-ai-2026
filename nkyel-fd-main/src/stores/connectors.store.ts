/**
 * Ñkyel AI · Connectors & Skills Store
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Canonical Registry for:
 * 1. CONNECTORS (OAuth, Google Workspace, MCP, REST)
 * 2. SKILLS (Executable capabilities, DeerFlow, Native)
 * 3. DATA SOURCES (Read-only data feeds)
 */

import { create } from 'zustand';

export type ConnectorStatus =
  | 'AVAILABLE'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'AUTHORIZATION_REQUIRED'
  | 'REAUTH_REQUIRED'
  | 'DEGRADED'
  | 'ERROR'
  | 'DISCONNECTED';

export type ConnectorCategory =
  | 'Google'
  | 'Productivity'
  | 'Communication'
  | 'Developer'
  | 'Research'
  | 'Data'
  | 'Marketing'
  | 'Business'
  | 'Storage'
  | 'Social'
  | 'Custom';

export interface ConnectorPermission {
  id: string;
  scope: string;
  humanLabel: string;
  requiresApproval: boolean;
}

export interface ConnectorItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ConnectorCategory;
  icon: string; // phosphor icon name or image url
  status: ConnectorStatus;
  isGoogle: boolean;
  connectedAccount?: string;
  lastUsedAt?: string;
  capabilities: string[];
  permissions: ConnectorPermission[];
  requiresApproval?: boolean;
}

export interface SkillItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  enabled: boolean;
  verified: boolean;
  version: string;
  author: string;
  inputs: string[];
  outputs: string[];
  requiredConnectors?: string[];
}

export interface DataSourceItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  status: 'AVAILABLE' | 'CONNECTED';
  recordsCount?: string;
  lastUpdated?: string;
}

interface ConnectorsState {
  connectors: ConnectorItem[];
  skills: SkillItem[];
  dataSources: DataSourceItem[];
  selectedConnectorId: string | null;
  activeTab: 'connectors' | 'skills' | 'data_sources';
  searchQuery: string;
  selectedCategory: string;

  // Actions
  setActiveTab: (tab: 'connectors' | 'skills' | 'data_sources') => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSelectedConnectorId: (id: string | null) => void;
  connectConnector: (id: string, account?: string) => Promise<void>;
  disconnectConnector: (id: string) => Promise<void>;
  toggleSkill: (id: string) => void;
  addCustomSkill: (skill: Omit<SkillItem, 'id' | 'version' | 'author' | 'verified'>) => void;
}

const INITIAL_CONNECTORS: ConnectorItem[] = [
  // ── GOOGLE FIRST-CLASS CONNECTORS ──
  {
    id: 'conn_google_workspace',
    slug: 'google-workspace',
    name: 'Google Workspace',
    description: 'Suite bureautique complète : Drive, Docs, Sheets, Gmail et Calendar unifiés.',
    category: 'Google',
    icon: 'GoogleLogo',
    status: 'CONNECTED',
    isGoogle: true,
    connectedAccount: 'daniel@smartandj.com',
    lastUsedAt: 'Il y a 12 minutes',
    capabilities: ['Recherche Drive', 'Édition Docs', 'Analyse Sheets', 'Lecture/Envoi Gmail', 'Gestion Agenda'],
    permissions: [
      { id: 'p1', scope: 'drive.readonly', humanLabel: 'Lire et indexer vos fichiers Google Drive', requiresApproval: false },
      { id: 'p2', scope: 'docs.write', humanLabel: 'Créer et enrichir des Google Docs souverains', requiresApproval: false },
      { id: 'p3', scope: 'sheets.write', humanLabel: 'Mettre à jour des tableaux financiers Sheets', requiresApproval: false },
      { id: 'p4', scope: 'gmail.send', humanLabel: 'Envoyer des e-mails professionnels après votre accord', requiresApproval: true },
      { id: 'p5', scope: 'calendar.events', humanLabel: 'Planifier des réunions sur votre Agenda', requiresApproval: true },
    ],
  },
  {
    id: 'conn_google_drive',
    slug: 'google-drive',
    name: 'Google Drive',
    description: 'Accédez à vos documents, rapports et présentations stockés dans votre Drive.',
    category: 'Google',
    icon: 'HardDrives',
    status: 'AVAILABLE',
    isGoogle: true,
    capabilities: ['Recherche sémantique', 'Téléchargement de PDF', 'Analyse de dossiers'],
    permissions: [
      { id: 'p1', scope: 'drive.readonly', humanLabel: 'Parcourir et lire les documents de votre Drive', requiresApproval: false },
    ],
  },
  {
    id: 'conn_google_docs',
    slug: 'google-docs',
    name: 'Google Docs',
    description: 'Rédigez, structurez et exportez des synthèses exécutives directement sur Docs.',
    category: 'Google',
    icon: 'FileText',
    status: 'AVAILABLE',
    isGoogle: true,
    capabilities: ['Création de document', 'Formatage typographique', 'Ajout de sections'],
    permissions: [
      { id: 'p1', scope: 'docs.create', humanLabel: 'Créer de nouveaux documents Google Docs', requiresApproval: false },
    ],
  },
  {
    id: 'conn_google_sheets',
    slug: 'google-sheets',
    name: 'Google Sheets',
    description: 'Modélisation financière, tableaux de bord et extraction de métriques.',
    category: 'Google',
    icon: 'Table',
    status: 'AVAILABLE',
    isGoogle: true,
    capabilities: ['Création de feuilles', 'Formules financières', 'Visualisations graphiques'],
    permissions: [
      { id: 'p1', scope: 'sheets.edit', humanLabel: 'Modifier des feuilles de calcul Sheets', requiresApproval: false },
    ],
  },
  {
    id: 'conn_gmail',
    slug: 'gmail',
    name: 'Gmail',
    description: 'Synthèse des courriels importants et préparation de réponses sur mesure.',
    category: 'Google',
    icon: 'EnvelopeSimple',
    status: 'AVAILABLE',
    isGoogle: true,
    capabilities: ['Recherche de messages', 'Brouillons automatiques', 'Envoi sécurisé'],
    permissions: [
      { id: 'p1', scope: 'gmail.readonly', humanLabel: 'Lire les courriels pertinents pour vos missions', requiresApproval: false },
      { id: 'p2', scope: 'gmail.send', humanLabel: 'Envoyer des messages après votre validation explicite', requiresApproval: true },
    ],
  },
  {
    id: 'conn_google_calendar',
    slug: 'google-calendar',
    name: 'Google Calendar',
    description: 'Planification stratégique et synchronisation des échéances de mission.',
    category: 'Google',
    icon: 'CalendarBlank',
    status: 'AVAILABLE',
    isGoogle: true,
    capabilities: ['Vérification des disponibilités', 'Création d’événements', 'Rappels'],
    permissions: [
      { id: 'p1', scope: 'calendar.events', humanLabel: 'Ajouter et modifier des rendez-vous', requiresApproval: true },
    ],
  },

  // ── PRODUCTIVITY & DEVELOPER CONNECTORS ──
  {
    id: 'conn_github',
    slug: 'github',
    name: 'GitHub',
    description: 'Inspectez les dépôts de code, créez des PRs et auditez des architectures logicielles.',
    category: 'Developer',
    icon: 'GitBranch',
    status: 'AVAILABLE',
    isGoogle: false,
    capabilities: ['Lecture de code', 'Création de commits', 'Gestion d’issues'],
    permissions: [
      { id: 'p1', scope: 'repo.read', humanLabel: 'Lire les dépôts publics et privés', requiresApproval: false },
      { id: 'p2', scope: 'repo.write', humanLabel: 'Pousser des modifications de code', requiresApproval: true },
    ],
  },
  {
    id: 'conn_notion',
    slug: 'notion',
    name: 'Notion',
    description: 'Synchronisez votre base de connaissances, vos wikis d’équipe et vos roadmaps.',
    category: 'Productivity',
    icon: 'Notebook',
    status: 'AVAILABLE',
    isGoogle: false,
    capabilities: ['Lecture de pages', 'Création de blocs', 'Mise à jour de bases de données'],
    permissions: [
      { id: 'p1', scope: 'notion.read_write', humanLabel: 'Accéder aux espaces de travail partagés', requiresApproval: false },
    ],
  },
  {
    id: 'conn_slack',
    slug: 'slack',
    name: 'Slack',
    description: 'Partagez des synthèses d’agents et recevez des alertes d’exécution en temps réel.',
    category: 'Communication',
    icon: 'Chats',
    status: 'AVAILABLE',
    isGoogle: false,
    capabilities: ['Envoi de notifications', 'Lecture de canaux autorisés'],
    permissions: [
      { id: 'p1', scope: 'chat.write', humanLabel: 'Publier des messages dans les canaux choisis', requiresApproval: true },
    ],
  },
  {
    id: 'conn_postgres',
    slug: 'postgres-neon',
    name: 'PostgreSQL (Neon)',
    description: 'Connexion directe à votre base relationnelle pour requêtes analytiques en langage naturel.',
    category: 'Data',
    icon: 'Database',
    status: 'CONNECTED',
    isGoogle: false,
    connectedAccount: 'neon.db/smartandj_prod',
    lastUsedAt: 'En direct',
    capabilities: ['Requêtes SQL SELECT', 'Schémas et tables', 'Optimisation d’index'],
    permissions: [
      { id: 'p1', scope: 'sql.read', humanLabel: 'Exécuter des requêtes de lecture', requiresApproval: false },
      { id: 'p2', scope: 'sql.write', humanLabel: 'Exécuter des mutations de données', requiresApproval: true },
    ],
  },
];

const INITIAL_SKILLS: SkillItem[] = [
  {
    id: 'sk_market_research',
    slug: 'market-research',
    name: 'Étude de Marché Approfondie',
    description: 'Recherche multi-sources, analyse de la concurrence et synthèse d’opportunités stratégiques.',
    category: 'Recherche',
    icon: 'MagnifyingGlass',
    enabled: true,
    verified: true,
    version: '2.4.0',
    author: 'Ñkyel Native',
    inputs: ['Sujet ou secteur', 'Marché cible', 'Périmètre géographique'],
    outputs: ['Rapport PDF', 'Matrice d’opportunités', 'Sources certifiées'],
  },
  {
    id: 'sk_presentation',
    slug: 'professional-presentation',
    name: 'Présentation Professionnelle',
    description: 'Création d’un diaporama structuré et soigné (PPTX/Slides) à partir de vos documents ou recherches.',
    category: 'Productivité',
    icon: 'Presentation',
    enabled: true,
    verified: true,
    version: '1.8.0',
    author: 'Ñkyel Native',
    inputs: ['Brief de mission', 'Contenu clé', 'Nombre de slides'],
    outputs: ['Diaporama interactif', 'Export PPTX', 'Notes d’orateur'],
  },
  {
    id: 'sk_financial_analysis',
    slug: 'financial-analysis',
    name: 'Modélisation Financière & DCF',
    description: 'Analyse de bilan, projections de flux de trésorerie, calcul de TRI/VAN et tableaux comparatifs.',
    category: 'Finance',
    icon: 'TrendUp',
    enabled: true,
    verified: true,
    version: '1.5.0',
    author: 'Ñkyel Native',
    inputs: ['Données financières', 'Hypothèses de croissance', 'Taux d’actualisation'],
    outputs: ['Tableau Sheets', 'Graphique de sensibilité', 'Note de synthèse'],
  },
  {
    id: 'sk_seo_audit',
    slug: 'seo-audit',
    name: 'Audit & Stratégie SEO',
    description: 'Analyse sémantique, repérage d’opportunités de mots-clés et plan de contenu optimisé.',
    category: 'Marketing',
    icon: 'Target',
    enabled: true,
    verified: true,
    version: '1.2.0',
    author: 'Ñkyel Native',
    inputs: ['URL du site', 'Concurrents directs', 'Objectifs de trafic'],
    outputs: ['Rapport d’audit', 'Recommandations techniques', 'Calendrier éditorial'],
  },
  {
    id: 'sk_build_website',
    slug: 'build-website',
    name: 'Création de Landing Page & Web App',
    description: 'Génération de composants React/HTML interactifs avec design moderne et prévisualisation live.',
    category: 'Développement',
    icon: 'Browsers',
    enabled: true,
    verified: true,
    version: '2.1.0',
    author: 'Ñkyel Native',
    inputs: ['Cahier des charges', 'Directives graphiques'],
    outputs: ['Code source propre', 'Aperçu web interactif', 'Fichiers téléchargeables'],
  },
  {
    id: 'sk_video_production',
    slug: 'video-production',
    name: 'Production Vidéo & Clips de Lancement',
    description: 'Storyboard, génération de plans vidéo haute définition et rendu multimédia.',
    category: 'Média',
    icon: 'VideoCamera',
    enabled: true,
    verified: true,
    version: '1.0.0',
    author: 'Ñkyel Native',
    inputs: ['Concept visuel', 'Style artistique', 'Durée'],
    outputs: ['Fichier MP4', 'Vignette affiche', 'Storyboard'],
  },
];

const INITIAL_DATA_SOURCES: DataSourceItem[] = [
  {
    id: 'ds_world_bank',
    slug: 'world-bank-data',
    name: 'Données Macro-Économiques Banque Mondiale',
    description: 'Indicateurs officiels de développement, PIB, démographie et climat pour 200+ pays.',
    category: 'Économie',
    status: 'CONNECTED',
    recordsCount: '1.2M points de données',
    lastUpdated: 'Aujourd’hui à 06:00',
  },
  {
    id: 'ds_african_markets',
    slug: 'african-markets-db',
    name: 'Indices & Marchés Financiers Africains',
    description: 'Données boursières BVMAC, BRVM, cours des matières premières et régulations régionales.',
    category: 'Finance',
    status: 'CONNECTED',
    recordsCount: '45k séries temporelles',
    lastUpdated: 'Il y a 15 minutes',
  },
  {
    id: 'ds_legal_registry',
    slug: 'ohada-legal-registry',
    name: 'Jurisprudence & Textes OHADA',
    description: 'Base juridique complète des actes uniformes, jurisprudence commerciale et droit des affaires.',
    category: 'Juridique',
    status: 'AVAILABLE',
    recordsCount: '12k actes & décisions',
  },
];

export const useConnectorsStore = create<ConnectorsState>((set: any, get: any) => ({
  connectors: INITIAL_CONNECTORS,
  skills: INITIAL_SKILLS,
  dataSources: INITIAL_DATA_SOURCES,
  selectedConnectorId: null,
  activeTab: 'connectors',
  searchQuery: '',
  selectedCategory: 'All',

  setActiveTab: (tab: 'connectors' | 'skills' | 'data_sources') => set({ activeTab: tab }),
  setSearchQuery: (searchQuery: string) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory: string) => set({ selectedCategory }),
  setSelectedConnectorId: (id: string | null) => set({ selectedConnectorId: id }),

  connectConnector: async (id: string, account: string = 'user@example.com') => {
    // Optimistic UI state transition
    set((state: ConnectorsState) => ({
      connectors: state.connectors.map((c: ConnectorItem) =>
        c.id === id ? { ...c, status: 'CONNECTING' as ConnectorStatus } : c
      ),
    }));

    await new Promise((resolve) => setTimeout(resolve, 800));

    set((state: ConnectorsState) => ({
      connectors: state.connectors.map((c: ConnectorItem) =>
        c.id === id
          ? {
              ...c,
              status: 'CONNECTED' as ConnectorStatus,
              connectedAccount: account,
              lastUsedAt: 'À l’instant',
            }
          : c
      ),
    }));
  },

  disconnectConnector: async (id: string) => {
    set((state: ConnectorsState) => ({
      connectors: state.connectors.map((c: ConnectorItem) =>
        c.id === id
          ? {
              ...c,
              status: 'AVAILABLE' as ConnectorStatus,
              connectedAccount: undefined,
              lastUsedAt: undefined,
            }
          : c
      ),
    }));
  },

  toggleSkill: (id: string) => {
    set((state: ConnectorsState) => ({
      skills: state.skills.map((s: SkillItem) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    }));
  },

  addCustomSkill: (skillData: Omit<SkillItem, 'id' | 'version' | 'author' | 'verified'>) => {
    const newSkill: SkillItem = {
      ...skillData,
      id: `sk_custom_${Date.now()}`,
      version: '1.0.0',
      author: 'Personnalisé',
      verified: true,
    };
    set((state: ConnectorsState) => ({
      skills: [newSkill, ...state.skills],
    }));
  },
}));
