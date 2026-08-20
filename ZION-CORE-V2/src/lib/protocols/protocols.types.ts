/**
 * Ñkyel AI — Sovereign Protocols Type System
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Implements strict types for:
 * 1. Model Context Protocol (MCP)
 * 2. Ñkyel Skills (SKILL.md format)
 * 3. Agent2Agent (A2A)
 * 4. AG-UI (Bidirectional Event Layer)
 * 5. A2UI (Declarative Generated Interfaces)
 * 6. MCP Apps (Sandboxed Interactive Interfaces)
 * 7. AP2 & UCP (Agentic Commerce & Payments)
 * 8. Google AI & Workspace Tools
 */

// ─── 1. MODEL CONTEXT PROTOCOL (MCP) ─────────────────────────

export type MCPServerTransport = 'stdio' | 'sse' | 'websocket' | 'http';
export type MCPServerStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'disabled';

export interface MCPToolParameter {
  type: string;
  description?: string;
  required?: boolean;
  enum?: string[];
  default?: unknown;
}

export interface MCPToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, MCPToolParameter>;
    required?: string[];
  };
  enabled: boolean;
  requiresApproval: boolean;
  sensitivityLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  callCount: number;
  avgLatencyMs: number;
  lastUsedAt?: string;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  sizeBytes?: number;
}

export interface MCPResourceTemplate {
  uriTemplate: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPPromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: MCPPromptArgument[];
}

export interface MCPServerConfig {
  id: string;
  name: string;
  version: string;
  transport: MCPServerTransport;
  endpoint?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  status: MCPServerStatus;
  latencyMs: number;
  tools: MCPToolSchema[];
  resources: MCPResource[];
  resourceTemplates: MCPResourceTemplate[];
  prompts: MCPPrompt[];
  appsCount: number;
  scopes: string[];
  errorCount: number;
  lastEventAt?: string;
  provenance: string;
  isOfficial?: boolean;
  githubUrl?: string;
}

// ─── 2. ÑKYEL SKILLS (SKILL.md) ─────────────────────────────

export type SkillStatus = 'active' | 'disabled' | 'draft' | 'testing';

export interface SkillPermission {
  id: string;
  scope: string;
  reason: string;
  isSensitive: boolean;
}

export interface SkillReference {
  title: string;
  url: string;
  type: 'doc' | 'api' | 'guide' | 'spec';
}

export interface SkillScript {
  filename: string;
  runtime: 'python' | 'javascript' | 'bash';
  code: string;
  entrypoint: boolean;
}

export interface NkyelSkill {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  license?: string;
  compatibility: string;
  status: SkillStatus;
  permissions: SkillPermission[];
  scripts: SkillScript[];
  references: SkillReference[];
  assets: string[];
  instructionsMarkdown: string;
  usageCount: number;
  lastUsedAt?: string;
  successRatePercent: number;
  isOfficial: boolean;
  tags: string[];
  sourceUrl?: string;
}

// ─── 3. AGENT2AGENT (A2A) ───────────────────────────────────

export type A2AAgentStatus = 'idle' | 'busy' | 'delegated' | 'offline' | 'error';
export type A2ATaskStatus = 'pending' | 'delegated' | 'processing' | 'completed' | 'failed' | 'rejected';

export interface A2AAgentCard {
  id: string;
  name: string;
  role: string;
  avatar: string;
  provider: 'Nkyel Core' | 'Google Vertex' | 'External A2A' | 'Anthropic' | 'Custom';
  endpoint: string;
  version: string;
  status: A2AAgentStatus;
  declaredCapabilities: string[];
  supportedProtocols: string[];
  maxConcurrency: number;
  activeDelegations: number;
  reputationScore: number;
  latencyMs: number;
}

export interface A2AMessage {
  id: string;
  delegationId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  type: 'task_request' | 'progress_update' | 'clarification' | 'artifact_transfer' | 'task_result' | 'error';
  content: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}

export interface A2ADelegation {
  id: string;
  parentMissionId: string;
  initiatorAgentId: string;
  targetAgentId: string;
  targetAgentName: string;
  taskTitle: string;
  goal: string;
  status: A2ATaskStatus;
  progressPercent: number;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  messages: A2AMessage[];
  artifactsReceived: {
    id: string;
    title: string;
    type: string;
    content?: string;
  }[];
  errorMessage?: string;
  returnedResult?: string;
}

// ─── 4. AG-UI (BIDIRECTIONAL EVENT STREAM) ──────────────────

export type AGUIActionType =
  | 'accept'
  | 'reject'
  | 'modify'
  | 'suspend'
  | 'resume'
  | 'add_constraint'
  | 'request_proof';

export interface AGUIApprovalRequest {
  id: string;
  runId: string;
  actionTitle: string;
  description: string;
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
  requestedAt: string;
  expiresAt?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  affectedResources: string[];
  estimatedCostUsd?: number;
  userConstraint?: string;
}

export interface AGUIStreamEvent {
  id: string;
  type:
    | 'agui.progress'
    | 'agui.token_stream'
    | 'agui.tool_call'
    | 'agui.state.updated'
    | 'agui.approval.required'
    | 'agui.human_intervention'
    | 'agui.artifact_emitted'
    | 'agui.error'
    | 'agui.resumed';
  timestamp: string;
  runId: string;
  stepName?: string;
  progressPercent?: number;
  token?: string;
  approvalRequest?: AGUIApprovalRequest;
  payload?: Record<string, unknown>;
}

// ─── 5. A2UI (DECLARATIVE GENERATED INTERFACES) ─────────────

export type A2UIComponentType =
  | 'form'
  | 'table'
  | 'chart'
  | 'metric_card'
  | 'card_grid'
  | 'selector'
  | 'document_preview'
  | 'validation_controls'
  | 'comparison_panel';

export interface A2UIFormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'checkbox' | 'date' | 'textarea' | 'range';
  placeholder?: string;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
  required?: boolean;
  validationRule?: string;
}

export interface A2UITableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'badge' | 'date' | 'currency' | 'progress';
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface A2UIChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  category?: string;
}

export interface A2UIChartSpec {
  chartType: 'line' | 'bar' | 'area' | 'pie' | 'radar';
  xAxisKey: string;
  series: { key: string; name: string; color: string }[];
  data: Record<string, unknown>[];
}

export interface A2UIComparisonItem {
  id: string;
  title: string;
  badge?: string;
  isRecommended?: boolean;
  metrics: { label: string; value: string; isPositive?: boolean }[];
  features: { text: string; supported: boolean }[];
  actionLabel?: string;
}

export interface A2UISurfaceSpec {
  id: string;
  title: string;
  description?: string;
  componentType: A2UIComponentType;
  generatedByAgent: string;
  schemaVersion: '1.0.0';
  formFields?: A2UIFormField[];
  tableColumns?: A2UITableColumn[];
  tableData?: Record<string, unknown>[];
  chartSpec?: A2UIChartSpec;
  comparisonItems?: A2UIComparisonItem[];
  metricCardData?: {
    value: string | number;
    label: string;
    trendPercent?: number;
    trendDirection?: 'up' | 'down' | 'neutral';
    subtext?: string;
  };
  validationControls?: {
    checklist: { id: string; text: string; checked: boolean; isMandatory: boolean }[];
    confirmationText: string;
  };
  actions?: { id: string; label: string; variant: 'primary' | 'secondary' | 'danger'; actionKey: string }[];
}

// ─── 6. MCP APPS ────────────────────────────────────────────

export interface MCPAppSpec {
  id: string;
  title: string;
  description: string;
  version: string;
  toolOrigin: string;
  serverOrigin: string;
  appType: 'dashboard' | 'visualization' | 'form' | 'data_explorer' | 'preview' | 'multi_step_workflow';
  sandboxPermissions: string[];
  initialState: Record<string, unknown>;
  htmlTemplate?: string;
  interactiveConfig?: Record<string, unknown>;
}

// ─── 7. AP2 & UCP (AGENTIC COMMERCE) ────────────────────────

export type AP2MandateStatus = 'requested' | 'pending_user_confirmation' | 'approved' | 'executed' | 'cancelled' | 'disputed';

export interface AP2PaymentMandate {
  id: string;
  intentId: string;
  missionId: string;
  agentId: string;
  merchantName: string;
  merchantIcon?: string;
  amount: number;
  currency: 'EUR' | 'USD' | 'XAF' | 'GBP';
  purpose: string;
  status: AP2MandateStatus;
  isExperimental: true;
  requiresExplicitHumanApproval: true;
  requestedAt: string;
  approvedAt?: string;
  authorizationProof?: string;
  receiptId?: string;
  cancellationReason?: string;
}

export interface UCPCheckoutCartItem {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  imageUrl?: string;
}

export interface UCPCheckoutSession {
  id: string;
  mandateId: string;
  items: UCPCheckoutCartItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  shippingAddress?: string;
  status: 'discovery' | 'cart' | 'checkout' | 'paid' | 'tracking' | 'completed';
  trackingNumber?: string;
  carrier?: string;
}

// ─── 8. GOOGLE AI & WORKSPACE TOOLS ─────────────────────────

export interface GoogleIntegrationTool {
  id: string;
  nkyelTitle: string;
  secondaryVendorBadge: string;
  category: 'ai' | 'workspace' | 'cloud';
  description: string;
  status: 'Disponible' | 'Bêta' | 'Expérimental' | 'Prévu';
  officialIcon: string;
  realOperation: string;
  currentModelVersion: string;
  avgLatencyMs: number;
  callCount: number;
  lastCalledAt?: string;
  samplePrompt: string;
}

// ─── 9. PROTOCOLS OVERVIEW STATUS MATRIX ───────────────────

export interface ProtocolHealthCard {
  id: 'mcp' | 'skills' | 'a2a' | 'agui' | 'a2ui' | 'mcp_apps' | 'ap2_ucp' | 'google_workspace' | 'security';
  name: string;
  acronym: string;
  negotiatedVersion: string;
  connectionStatus: 'connected' | 'active' | 'standby' | 'experimental' | 'planned';
  authMode: 'OAuth2' | 'API Key' | 'mTLS' | 'JWT' | 'Local Pipe' | 'None' | (string & {});
  capabilitiesCount: number;
  requestsCount: number;
  latencyMs: number;
  errorsCount: number;
  lastEventAt: string;
  environment: 'Local WorkGraph' | 'Edge Mesh' | 'Sovereign Cloud';
  statusBadge: 'actif' | 'bêta' | 'expérimental' | 'prévu' | 'indisponible';
  accentColor: string;
}
