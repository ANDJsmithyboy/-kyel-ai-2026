/**
 * GabomaAI · Agent Event Labels
 * SmartANDJ AI Technologies
 * Mapping interne → vocabulaire GabomaAI public
 */

export const AGENT_EVENT_LABELS: Record<string, { label: string; icon_key: string }> = {
  planner:          { label: 'Planification de la directive…',      icon_key: 'strategy' },
  coordinator:      { label: 'Coordination des agents…',            icon_key: 'users_three' },
  web_search:       { label: 'Radar WANDANA cherche sur le web…',      icon_key: 'radar' },
  web_fetch:        { label: 'Navigation et lecture de page…',      icon_key: 'globe' },
  bash_tool:        { label: 'Exécution sandbox en cours…',         icon_key: 'terminal' },
  write_file:       { label: 'Rédaction du fichier…',               icon_key: 'file_text' },
  read_file:        { label: 'Lecture du fichier…',                 icon_key: 'folder_open' },
  code_exec:        { label: 'Exécution du code…',                  icon_key: 'code' },
  synthesize:       { label: 'Synthèse en cours…',                  icon_key: 'sparkle' },
  reporter:         { label: 'Rédaction du rapport final…',         icon_key: 'file_doc' },
  artifact_created: { label: 'Le Rendu est prêt 💎',               icon_key: 'diamond' },
  deploy:           { label: 'Déploiement en cours…',               icon_key: 'cloud_arrow_up' },
  loxo_rag:         { label: 'Invoquer WANDANA — fouille les docs…',   icon_key: 'books' },
  memory_store:     { label: 'Mise à jour du Coffre-Fort…',         icon_key: 'vault' },
  done:             { label: 'Mission accomplie ✅',                 icon_key: 'check_circle' },
};

/**
 * Résout un type d'événement interne vers un label GabomaAI.
 * Retourne un fallback humanisé si inconnu.
 */
export function resolveEventLabel(eventType: string): { label: string; icon_key: string } {
  return AGENT_EVENT_LABELS[eventType] ?? {
    label: `Opération en cours…`,
    icon_key: 'circle_notch',
  };
}
