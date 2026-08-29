/* Nkyel AI · modelRegistry.ts · SmartANDJ AI Technologies
   Registre de configuration des profils agentiques Ñkyel. */

export interface ModelEntry {
  key: string;
  name: string;
  description: string;
}

export interface ModelFamily {
  key: string;
  name: string;
  description: string;
  targetUrls: string[];
  models: ModelEntry[];
}

export const MODEL_REGISTRY: ModelFamily[] = [
  {
    key: 'nkyel-core',
    name: 'Famille Ñkyel',
    description: 'Profils agentiques principaux',
    targetUrls: ['api.nkyel.ai'],
    models: [
      { key: 'nkyel', name: 'Ñkyel', description: 'Agent autonome standard (Équilibré)' },
      { key: 'nkyel-chui', name: 'Ñkyel Chui', description: 'Agent d\'exécution rapide (Action)' },
      { key: 'nkyel-radi', name: 'Ñkyel Radi', description: 'Agent de raisonnement profond (Stratégie)' },
      { key: 'nkyel-research', name: 'Ñkyel Research', description: 'Agent de recherche et synthèse (Analyse)' },
    ],
  }
];
