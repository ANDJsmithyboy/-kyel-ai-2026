export * from './client';
export * from './workspaces';
export * from './missions';
export * from './workgraph';
export * from './sources-evidence';
export * from './simulations';
export * from './approvals';
export * from './skills-mcp';
export * from './connectors';
export * from './artifacts';
export * from './programs';

// Legacy compatibility exports
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch('/health', { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getModels() {
  const res = await fetch('/api/v1/models');
  if (!res.ok) throw new Error('Échec récupération modèles');
  return res.json();
}

export async function getChats() {
  const res = await fetch('/api/v1/chats');
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || data || [];
}

