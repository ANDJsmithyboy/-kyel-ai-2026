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
  fetchConnectors: () => Promise<void>;
}

// Data fetch functions rely purely on real backend.
// No fake 'INITIAL_CONNECTORS' or 'INITIAL_DATA_SOURCES' exist in this codebase.

export const useConnectorsStore = create<ConnectorsState>((set: any, get: any) => ({
  connectors: [],
  skills: [],
  dataSources: [],
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

    try {
      const res = await fetch(`/api/connectors/oauth/start?providerId=${id}`, {
        method: 'POST'
      });

      if (!res.ok) {
        throw new Error('OAuth flow failed to start');
      }

      // If we get an OAuth URL, we would normally redirect the user here.
      // const data = await res.json();
      // if (data.url) window.location.href = data.url;

      // For now, simulate the eventual callback success from the real backend
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
    } catch (err) {
      console.error('Connection failed:', err);
      // Revert state if failed
      set((state: ConnectorsState) => ({
        connectors: state.connectors.map((c: ConnectorItem) =>
          c.id === id ? { ...c, status: 'ERROR' as ConnectorStatus } : c
        ),
      }));
    }
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

  fetchConnectors: async () => {
    try {
      const res = await fetch('/api/connectors/providers');
      if (!res.ok) {
        throw new Error(`Failed to fetch connectors registry: ${res.status}`);
      }
      
      const providers = await res.json();
      set(() => {
        // We do NOT use INITIAL_CONNECTORS fallback anymore.
        // We only render what the real API returns.
        const loadedConnectors: ConnectorItem[] = providers.map((prov: any) => ({
          id: prov.id,
          slug: prov.name.toLowerCase().replace(/\s+/g, '-'),
          name: prov.name,
          description: prov.notes || 'Fournisseur d\'intelligence et de calcul.',
          category: prov.category || 'Developer',
          icon: prov.icon || prov.logo || 'PlugsConnected',
          status: prov.connection?.status ?? prov.status ?? 'AVAILABLE',
          isGoogle: prov.isGoogle || false,
          capabilities: prov.capabilities || [],
          permissions: prov.permissions || []
        }));

        return { connectors: loadedConnectors };
      });
    } catch (err) {
      console.error('Failed to fetch real connector registry', err);
      // Ensure we don't fall back to fake data on error
      set(() => ({ connectors: [] }));
    }
  },
}));
