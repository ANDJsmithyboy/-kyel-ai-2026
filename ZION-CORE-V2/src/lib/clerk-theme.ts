/**
 * Ñkyel AI — Clerk Custom Theme & Appearance · SmartANDJ AI Technologies
 * Personnalisation de Clerk pour épouser parfaitement les tokens de design Ñkyel :
 * - Cartes sans fond blanc agressif
 * - Boutons et accents dorés (#c39a52 / var(--accent))
 * - Typographie Geist & bordures subtiles
 * - Intégration 100% étanche Light / Dark / System
 *
 * Fondateur : Daniel Jonathan ANDJ
 */

export const nkyelClerkAppearance = {
  layout: {
    socialButtonsPlacement: 'bottom' as const,
    socialButtonsVariant: 'blockButton' as const,
    logoPlacement: 'none' as const,
  },
  variables: {
    colorPrimary: '#c39a52',
    colorText: '#f1f5f9',
    colorTextSecondary: '#94a3b8',
    colorBackground: 'transparent',
    colorInputBackground: '#0d1422',
    colorInputText: '#f8fafc',
    borderRadius: '0.75rem',
    fontFamily: 'var(--font-geist), -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '0.875rem',
  },
  elements: {
    card: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      border: 'none',
      padding: '0',
      width: '100%',
    },
    headerTitle: {
      color: 'var(--text-primary, #ffffff)',
      fontSize: '1.25rem',
      fontWeight: '700',
      fontFamily: 'var(--font-geist)',
    },
    headerSubtitle: {
      color: 'var(--text-secondary, #94a3b8)',
      fontSize: '0.875rem',
    },
    socialButtonsBlockButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'var(--text-primary, #ffffff)',
      borderRadius: '0.75rem',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
    },
    socialButtonsBlockButtonText: {
      color: 'var(--text-primary, #ffffff)',
      fontWeight: '600',
    },
    dividerLine: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    dividerText: {
      color: 'var(--text-tertiary, #64748b)',
      fontSize: '0.75rem',
    },
    formFieldLabel: {
      color: 'var(--text-secondary, #cbd5e1)',
      fontSize: '0.8125rem',
      fontWeight: '500',
    },
    formFieldInput: {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      color: 'var(--text-primary, #ffffff)',
      borderRadius: '0.75rem',
      padding: '0.625rem 0.875rem',
      fontSize: '0.875rem',
      '&:focus': {
        borderColor: '#c39a52',
        boxShadow: '0 0 0 2px rgba(195, 154, 82, 0.2)',
      },
    },
    formButtonPrimary: {
      backgroundColor: '#c39a52',
      color: '#0a0e17',
      borderRadius: '0.75rem',
      fontWeight: '700',
      fontSize: '0.875rem',
      padding: '0.625rem 1rem',
      '&:hover': {
        backgroundColor: '#b08842',
      },
    },
    footerActionLink: {
      color: '#c39a52',
      fontWeight: '600',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    identityPreviewText: {
      color: 'var(--text-primary, #ffffff)',
    },
    identityPreviewEditButton: {
      color: '#c39a52',
    },
    formFieldErrorText: {
      color: '#ef4444',
      fontSize: '0.75rem',
    },
    formResendCodeLink: {
      color: '#c39a52',
    },
    otpCodeFieldInput: {
      border: '1px solid rgba(255, 255, 255, 0.15)',
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      color: '#ffffff',
      borderRadius: '0.5rem',
    },
  },
};
