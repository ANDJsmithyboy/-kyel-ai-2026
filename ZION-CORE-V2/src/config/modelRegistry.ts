/* GabomaGPT · modelRegistry.ts · SmartANDJ AI Technologies · Constitution Zion Core
   Registre de configuration des familles de modèles et des cibles système. */

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
    key: 'aurata',
    name: 'Famille Aurata',
    description: 'Inférence Locale · Légère · Instance Oracle Cloud (Ollama)',
    targetUrls: ['flash.gabomagpt.com', 'elande.gabomagpt.com'],
    models: [
      { key: 'aurata-spark', name: 'Aurata Spark', description: 'Ultra-léger, quasi-instantané (Réflexe pur)' },
      { key: 'aurata', name: 'Aurata', description: 'Standard gratuit, local (Agile, efficace, sans superflu)' },
      { key: 'aurata-gold', name: 'Aurata Gold', description: 'Gratuit amélioré, contexte long (Chasse étendue)' },
    ],
  },
  {
    key: 'nyel',
    name: 'Famille Ñkyel',
    description: 'Modèle intelligent · Inférence Pro Reasoning',
    targetUrls: ['pro.gabomagpt.com'],
    models: [
      { key: 'nyel', name: 'Ñkyel', description: 'Modèle intelligent (Raisonnement standard)' },
      { key: 'nyel-echo', name: 'Ñkyel Echo', description: 'Raisonnement + Auto-vérification (Modèle se relit et corrige)' },
      { key: 'nyel-deep', name: 'Ñkyel Deep', description: 'Chain-of-thought complet (Plongée et réflexion profonde)' },
    ],
  },
  {
    key: 'onyxgris',
    name: 'Famille OnyxGris',
    description: 'Mode Black Panther · Vitesse brute · Zéro Compromis',
    targetUrls: ['onyx.gabomagpt.com', 'agent.gabomagpt.com'],
    models: [
      { key: 'onyxgris', name: 'OnyxGris', description: "Mode puissant standard (La panthère sort de l'ombre)" },
      { key: 'onyxgris-stealth', name: 'OnyxGris Stealth', description: 'Contexte court, exécution silencieuse et chirurgicale' },
      { key: 'onyxgris-apex', name: 'OnyxGris Apex', description: "Maximum absolu (La panthère au sommet de la forêt)" },
    ],
  },
  {
    key: 'wandana',
    name: 'Famille Wandana',
    description: 'Mode recherche et deep recherche',
    targetUrls: ['research.gabomagpt.com'],
    models: [
      { key: 'wandana', name: 'Wandana', description: 'Recherche structurée standard (Mémorisation et organisation)' },
      { key: 'wandana-savane', name: 'Wandana Savane', description: 'Recherche web étendue (Parcours multi-sources)' },
      { key: 'wandana-archive', name: 'Wandana Archive', description: 'Recherche + Mémoire historique + Synthèse totale' },
    ],
  },
];
