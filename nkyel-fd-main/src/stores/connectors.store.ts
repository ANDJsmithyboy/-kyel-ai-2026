/**
 * Ñkyel AI · Connectors & Skills Store
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Canonical Registry for:
 * 1. CONNECTORS (OAuth, Google Workspace, MCP, REST)
 * 2. SKILLS (Executable capabilities, DeerFlow 2.0, Native)
 * 3. DATA SOURCES (Read-only data feeds)
 */

import { create } from 'zustand';
import { connectorsApi, skillsMcpApi, type ConnectorItem as ApiConnectorItem } from '@/lib/api';

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
  icon: string;
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
  fetchConnectors: () => Promise<void>;
  fetchSkills: () => Promise<void>;
}

export const useConnectorsStore = create<ConnectorsState>((set, get) => ({
  connectors: [],
  skills: [],
  dataSources: [],
  selectedConnectorId: null,
  activeTab: 'connectors',
  searchQuery: '',
  selectedCategory: 'All',

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedConnectorId: (id) => set({ selectedConnectorId: id }),

  connectConnector: async (id: string) => {
    // Optimistic UI state transition
    set((state) => ({
      connectors: state.connectors.map((c) =>
        c.id === id ? { ...c, status: 'CONNECTING' as ConnectorStatus } : c
      ),
    }));

    try {
      const res = await connectorsApi.connect(id);
      set((state) => ({
        connectors: state.connectors.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'CONNECTED' as ConnectorStatus,
                connectedAccount: res.connector?.connectedAccount || 'Connecté',
                lastUsedAt: 'À l’instant',
              }
            : c
        ),
      }));
    } catch (err) {
      console.error('[Connectors Store] Connection failed:', err);
      set((state) => ({
        connectors: state.connectors.map((c) =>
          c.id === id ? { ...c, status: 'ERROR' as ConnectorStatus } : c
        ),
      }));
    }
  },

  disconnectConnector: async (id: string) => {
    try {
      await connectorsApi.disconnect(id);
      set((state) => ({
        connectors: state.connectors.map((c) =>
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
    } catch (err) {
      console.error('[Connectors Store] Disconnect failed:', err);
    }
  },

  toggleSkill: async (id: string) => {
    try {
      await skillsMcpApi.toggleSkill(id);
      set((state) => ({
        skills: state.skills.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
      }));
    } catch {
      // Fallback local toggle
      set((state) => ({
        skills: state.skills.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
      }));
    }
  },

  addCustomSkill: (skillData) => {
    const newSkill: SkillItem = {
      ...skillData,
      id: `sk_custom_${Date.now()}`,
      version: '1.0.0',
      author: 'Personnalisé',
      verified: true,
    };
    set((state) => ({
      skills: [newSkill, ...state.skills],
    }));
  },

  fetchConnectors: async () => {
    try {
      const rawConnectors = await connectorsApi.list();
      const mapped: ConnectorItem[] = rawConnectors.map((prov) => ({
        id: prov.id,
        slug: prov.slug || prov.id,
        name: prov.name,
        description: prov.description,
        category: (prov.category as ConnectorCategory) || 'Developer',
        icon: prov.icon || 'PlugsConnected',
        status: (prov.status as ConnectorStatus) || 'AVAILABLE',
        isGoogle: prov.isGoogle || false,
        connectedAccount: prov.connectedAccount,
        capabilities: prov.capabilities || [],
        permissions: (prov.permissions || []).map((p: any) => ({
          id: p.id,
          scope: p.scope,
          humanLabel: p.humanLabel,
          requiresApproval: p.requiresApproval ?? false,
        })),
      }));

      set({ connectors: mapped });
    } catch (err) {
      console.error('[Connectors Store] Failed to fetch real connector registry:', err);
    }
  },

  fetchSkills: async () => {
    try {
      const rawSkills = await skillsMcpApi.listSkills();
      const mapped: SkillItem[] = rawSkills.map((sk) => ({
        id: sk.id,
        slug: sk.id,
        name: sk.name,
        description: sk.description,
        category: sk.category,
        icon: 'Brain',
        enabled: sk.enabled,
        verified: true,
        version: '2.0.0',
        author: 'DeerFlow 2.0 (SmartANDJ)',
        inputs: ['context', 'parameters'],
        outputs: ['analysis', 'artifact'],
        requiredConnectors: sk.required_tools,
      }));

      set({ skills: mapped });
    } catch (err) {
      console.error('[Connectors Store] Failed to fetch real skills:', err);
    }
  },
}));
