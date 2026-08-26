/**
 * Ñkyel AI · Connector Icons Registry
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Canonical repository of authentic, vector brand logos for connectors and MCP servers.
 * Preserves authentic brand colors, crisp rendering at 18px-24px, zero layout shift.
 */

'use client';

import React from 'react';

export interface ConnectorIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

// 1. Google Workspace (Multicolor G)
export const GoogleWorkspaceIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="Google Workspace" {...props}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

// 2. Google Drive (Triangle mark)
export const GoogleDriveIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="Google Drive" {...props}>
    <path fill="#FFBA00" d="M8.01 4.5l5.99 10.38H2l5.99-10.38z" />
    <path fill="#0066DA" d="M16 4.5H8.01L14 14.88l3.99-6.91L16 4.5z" />
    <path fill="#00AC47" d="M14 14.88L8.01 21.79H22l-6-6.91H14z" />
    <path fill="#EA4335" d="M2 14.88L8.01 21.79l5.99-6.91H2z" />
  </svg>
);

// 3. Gmail (Envelope M)
export const GmailIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="Gmail" {...props}>
    <path fill="#EA4335" d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z" />
    <path fill="#FFFFFF" d="M20 7l-8 5-8-5v10h16V7z" />
    <path fill="#EA4335" d="M12 12L4 7v10h2V9l6 3.75L18 9v8h2V7l-8 5z" />
    <path fill="#4285F4" d="M4 7l8 5 8-5H4z" opacity="0.15" />
    <path fill="#4285F4" d="M3.5 19H5V8.25L2 6.5V17.5c0 .83.67 1.5 1.5 1.5z" />
    <path fill="#34A853" d="M20.5 19H19V8.25L22 6.5V17.5c0 .83-.67 1.5-1.5 1.5z" />
    <path fill="#FBBC04" d="M19 8.25V6.5L12 11.5 5 6.5v1.75l7 4.5 7-4.5z" />
    <path fill="#EA4335" d="M12 11.5L19 6.5H5l7 5z" />
  </svg>
);

// 4. Google Calendar
export const GoogleCalendarIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="Google Calendar" {...props}>
    <rect width="18" height="18" x="3" y="3.5" rx="3.5" fill="#FFFFFF" stroke="#4285F4" strokeWidth="1.5" />
    <rect width="18" height="5" x="3" y="3.5" rx="2" fill="#4285F4" />
    <circle cx="7" cy="3.5" r="1" fill="#FFFFFF" />
    <circle cx="17" cy="3.5" r="1" fill="#FFFFFF" />
    <text x="12" y="17" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#4285F4" fontFamily="sans-serif">
      31
    </text>
  </svg>
);

// 5. Google Docs (Blue document)
export const GoogleDocsIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="Google Docs" {...props}>
    <path fill="#4285F4" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" />
    <path fill="#A1C2FA" d="M14 2v6h6" />
    <path fill="#FFFFFF" d="M8 12h8v1.5H8zm0 3h8v1.5H8zm0 3h5v1.5H8z" />
  </svg>
);

// 6. Google Sheets (Green grid)
export const GoogleSheetsIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="Google Sheets" {...props}>
    <path fill="#0F9D58" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" />
    <path fill="#87CEAC" d="M14 2v6h6" />
    <path fill="#FFFFFF" d="M7 11h10v8H7zm1.5 1.5v2h3v-2zm4.5 0v2h2.5v-2zm-4.5 3.5v1.5h3V16zm4.5 0v1.5h2.5V16z" />
  </svg>
);

// 7. Google Slides (Yellow presentation)
export const GoogleSlidesIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="Google Slides" {...props}>
    <path fill="#F4B400" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" />
    <path fill="#FBE7A1" d="M14 2v6h6" />
    <rect x="7" y="11" width="10" height="7" rx="1" fill="#FFFFFF" />
    <rect x="8.5" y="12.5" width="7" height="4" rx="0.5" fill="#F4B400" opacity="0.6" />
  </svg>
);

// 8. GitHub
export const GitHubIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-label="GitHub" {...props}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

// 9. Notion
export const NotionIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-label="Notion" {...props}>
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.082-.653c.42 0 .093-.42-.14-.56L15.935 2.2c-.42-.327-.98-.7-2.1-.607L3.06 2.48c-.466.047-.56.327-.373.56zm.84 3.733v12.222c0 .7.373 1.027 1.213.98l12.716-.747c.84-.047.933-.56.933-1.12V7.1c0-.56-.233-.84-.793-.793l-13.276.793c-.607.047-.793.373-.793.84zm11.968.42c.093.42 0 .84-.42.887l-.933.187v8.956c-.607.373-1.213.607-1.727.607-.84 0-1.073-.28-1.726-1.167l-4.293-6.72v6.207l1.353.327c.42.093.467.42.467.747v.093l-3.36.233c-.093-.42 0-.84.42-.887l.933-.187V9.014L7.54 8.78c-.42-.093-.467-.42-.467-.747v-.093l3.407-.233 4.433 6.813V8.454l-1.353-.327c-.42-.093-.467-.42-.467-.747v-.093l3.727-.233z" />
  </svg>
);

// 10. Slack (Authentic 4-color hashtag)
export const SlackIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="Slack" {...props}>
    <path fill="#E01E5A" d="M5.04 14.5a2.5 2.5 0 0 1-2.5-2.5c0-1.38 1.12-2.5 2.5-2.5h2.5v2.5a2.5 2.5 0 0 1-2.5 2.5zM10.04 14.5a2.5 2.5 0 0 1 2.5 2.5v2.5a2.5 2.5 0 0 1-5 0v-2.5h2.5z" />
    <path fill="#36C5F0" d="M9.5 5.04a2.5 2.5 0 0 1-2.5-2.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v2.5H9.5zM9.5 10.04a2.5 2.5 0 0 1 2.5-2.5h2.5a2.5 2.5 0 0 1 0 5h-2.5v-2.5z" />
    <path fill="#2EB67D" d="M18.96 9.5a2.5 2.5 0 0 1 2.5 2.5c0 1.38-1.12 2.5-2.5 2.5h-2.5V12a2.5 2.5 0 0 1 2.5-2.5zM13.96 9.5a2.5 2.5 0 0 1-2.5-2.5V4.5a2.5 2.5 0 0 1 5 0V7h-2.5z" />
    <path fill="#ECB22E" d="M14.5 18.96a2.5 2.5 0 0 1 2.5 2.5c0 1.38-1.12 2.5-2.5 2.5s-2.5-1.12-2.5-2.5v-2.5h2.5zM14.5 13.96a2.5 2.5 0 0 1-2.5 2.5H9.5a2.5 2.5 0 0 1 0-5h2.5v2.5z" />
  </svg>
);

// 11. Microsoft 365 (4 color tiles)
export const MicrosoftIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="Microsoft" {...props}>
    <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
    <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
    <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
    <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
  </svg>
);

// 12. LinkedIn
export const LinkedInIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="LinkedIn" {...props}>
    <path fill="#0A66C2" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.65 1.65 0 0 0 1.66-1.66 1.66 1.66 0 0 0-3.32 0c0 .92.74 1.66 1.66 1.66m1.39 9.74v-8.37H5.07v8.37h2.78z" />
  </svg>
);

// 13. PostgreSQL
export const PostgreSQLIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="PostgreSQL" {...props}>
    <path fill="#336791" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.8 15.5c-1.3.8-2.9.8-4.3.2-.4-.2-.8-.4-1.2-.7l.9-1.5c.3.2.6.4.9.5 1 .4 2.2.3 3.1-.3.8-.5 1.3-1.4 1.3-2.4 0-.4-.1-.8-.3-1.1-.3-.4-.7-.7-1.2-.9-.7-.3-1.5-.4-2.3-.4h-1.3V9.5h1.3c.7 0 1.4-.1 2-.4.4-.2.8-.5 1-.8.2-.3.3-.7.3-1 0-.8-.4-1.5-1.1-1.9-.8-.4-1.8-.4-2.7-.1-.3.1-.6.3-.9.5L9.6 4.3c.4-.3.9-.5 1.4-.7 1.5-.5 3.2-.4 4.5.4 1.2.7 1.9 2 1.9 3.4 0 .7-.2 1.4-.6 2-.4.6-1 1.1-1.7 1.4.9.3 1.6.8 2.1 1.5.5.8.8 1.7.8 2.6 0 1.6-.9 3.1-2.2 4.1z" />
  </svg>
);

// 14. Qdrant
export const QdrantIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="Qdrant Vector DB" {...props}>
    <path fill="#DC2626" d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.2l7.8 3.9L12 12 4.2 8.1 12 4.2zM4 9.8l7 3.5v7.4l-7-3.5V9.8zm16 7.4l-7 3.5v-7.4l7-3.5v7.4z" />
  </svg>
);

// 15. Cloudflare
export const CloudflareIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="Cloudflare" {...props}>
    <path fill="#F38020" d="M18.25 10.5a5.5 5.5 0 0 0-10.4-1.8A4.25 4.25 0 0 0 4.25 13a4.25 4.25 0 0 0 .3 8h13.7a4.25 4.25 0 0 0 0-8.5c-.25 0-.5.02-.75.06l.75-2.06z" />
    <path fill="#FAAE40" d="M18.25 12.5a3.5 3.5 0 0 0-3.4 2.8l-.2.9h3.6a2.25 2.25 0 0 1 0 4.5H5.75A2.75 2.75 0 0 1 3 18a2.75 2.75 0 0 1 2.75-2.75c.3 0 .6.05.9.15l1-.9A3.5 3.5 0 0 1 14 11.5c.3 0 .6.03.9.1l.9-1.9a5.5 5.5 0 0 0-7.55 1.8 4.25 4.25 0 0 0-4 4.5 4.25 4.25 0 0 0 4 4.25h12.5a4.25 4.25 0 0 0 0-8.5l-.5.25.4-.75z" />
  </svg>
);

// 16. Linear
export const LinearIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-label="Linear" {...props}>
    <path d="M3.24 16.76a9.56 9.56 0 0 1 13.52-13.52L3.24 16.76zm1.48 2.56L18.24 5.8a9.56 9.56 0 0 1-13.52 13.52zM2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0z" />
  </svg>
);

// 17. Figma
export const FigmaIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="Figma" {...props}>
    <path fill="#0ACF83" d="M8 24a4 4 0 0 1-4-4 4 4 0 0 1 4-4h4v4a4 4 0 0 1-4 4z" />
    <path fill="#A259FF" d="M4 12a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4z" />
    <path fill="#F24E1E" d="M4 4a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4z" />
    <path fill="#FF7262" d="M12 0h4a4 4 0 0 1 4 4 4 4 0 0 1-4 4h-4V0z" />
    <path fill="#1ABCFE" d="M20 12a4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4 4 4 0 0 1 4 4z" />
  </svg>
);

// 18. Stripe
export const StripeIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-label="Stripe" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" fill="#635BFF" />
    <path fill="#FFFFFF" d="M13.5 9.5c0-.6-.5-1-1.3-1-.9 0-1.8.4-2.5 1L9 8.2c.9-.8 2-1.2 3.2-1.2 2.1 0 3.5 1.1 3.5 2.8v4.9c0 .4.1.7.3.9l-.9.6c-.4-.3-.6-.8-.6-1.3-.6.9-1.6 1.4-2.7 1.4-1.8 0-3-1.2-3-2.8 0-1.9 1.5-2.8 3.7-2.8h1v-.9zm0 2.2h-.9c-1.3 0-2.1.5-2.1 1.6 0 .9.7 1.4 1.6 1.4.9 0 1.4-.5 1.4-1.2v-1.8z" />
  </svg>
);

// 19. Tavily
export const TavilyIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-label="Tavily Search" {...props}>
    <circle cx="12" cy="12" r="9" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#D5AE57" stroke="none" />
  </svg>
);

// 20. Canonical Neutral MCP Fallback Glyph (Geist/Apple Precision)
export const McpFallbackIcon: React.FC<ConnectorIconProps> = ({ size = 20, className = '', ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-label="Model Context Protocol" {...props}>
    <rect x="3" y="7" width="18" height="13" rx="3" />
    <path d="M7 7V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" />
    <circle cx="8" cy="13.5" r="1.5" fill="currentColor" />
    <circle cx="16" cy="13.5" r="1.5" fill="currentColor" />
    <path d="M12 11v5" />
  </svg>
);

// Registry resolver
export const CONNECTOR_ICON_REGISTRY: Record<string, React.FC<ConnectorIconProps>> = {
  // Google
  'google-workspace': GoogleWorkspaceIcon,
  'google-drive': GoogleDriveIcon,
  'gmail': GmailIcon,
  'google-calendar': GoogleCalendarIcon,
  'google-docs': GoogleDocsIcon,
  'google-sheets': GoogleSheetsIcon,
  'google-slides': GoogleSlidesIcon,
  'google': GoogleWorkspaceIcon,

  // Productivity & Tech
  'github': GitHubIcon,
  'notion': NotionIcon,
  'slack': SlackIcon,
  'microsoft': MicrosoftIcon,
  'microsoft-365': MicrosoftIcon,
  'linkedin': LinkedInIcon,
  'linear': LinearIcon,
  'figma': FigmaIcon,
  'stripe': StripeIcon,
  'tavily': TavilyIcon,

  // Data & Infrastructure
  'postgres': PostgreSQLIcon,
  'postgresql': PostgreSQLIcon,
  'qdrant': QdrantIcon,
  'cloudflare': CloudflareIcon,

  // Fallbacks
  'mcp': McpFallbackIcon,
  'default': McpFallbackIcon,
};

export const getConnectorIcon = (slugOrId: string): React.FC<ConnectorIconProps> => {
  const normalized = slugOrId.toLowerCase().replace(/^(conn_|connector_)/, '').replace(/_/g, '-');
  return CONNECTOR_ICON_REGISTRY[normalized] || CONNECTOR_ICON_REGISTRY.default;
};
