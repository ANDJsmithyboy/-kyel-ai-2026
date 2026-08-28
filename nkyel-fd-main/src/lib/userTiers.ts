/**
 * Ñkyel AI — User Tiers, Quotas & Role Management
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 */

export interface UserTierConfig {
  tierId: 'CREATOR' | 'VIP_CONTRIBUTOR' | 'BETA_USER';
  labelEn: string;
  labelFr: string;
  badgeLabelEn: string;
  badgeLabelFr: string;
  isGodMode: boolean;
  quotas: {
    messagesPerDay: number;
    videosPerMonth: number;
    imagesPerMonth: number;
    pdfIaRequestsPerMonth: number;
    concurrentMissions: number;
    deepResearchPerDay: number;
  };
}

export const USER_TIERS: Record<string, UserTierConfig> = {
  CREATOR: {
    tierId: 'CREATOR',
    labelEn: 'Creator of Ñkyel',
    labelFr: 'Créateur de Ñkyel',
    badgeLabelEn: '∞ Mode God',
    badgeLabelFr: '∞ Mode God',
    isGodMode: true,
    quotas: {
      messagesPerDay: 999999,
      videosPerMonth: 999999,
      imagesPerMonth: 999999,
      pdfIaRequestsPerMonth: 999999,
      concurrentMissions: 999,
      deepResearchPerDay: 999,
    },
  },
  VIP_CONTRIBUTOR: {
    tierId: 'VIP_CONTRIBUTOR',
    labelEn: 'Partner Collaborator (M. MBA)',
    labelFr: 'Collaborateur Partenaire (M. MBA)',
    badgeLabelEn: '★ VIP Contributor',
    badgeLabelFr: '★ Collaborateur VIP',
    isGodMode: false,
    quotas: {
      messagesPerDay: 100,
      videosPerMonth: 3,
      imagesPerMonth: 10,
      pdfIaRequestsPerMonth: 150,
      concurrentMissions: 3,
      deepResearchPerDay: 25,
    },
  },
  BETA_USER: {
    tierId: 'BETA_USER',
    labelEn: 'Free · Beta access',
    labelFr: 'Free · Accès bêta',
    badgeLabelEn: 'Beta Access',
    badgeLabelFr: 'Accès Bêta',
    isGodMode: false,
    quotas: {
      messagesPerDay: 30,
      videosPerMonth: 1,
      imagesPerMonth: 3,
      pdfIaRequestsPerMonth: 20,
      concurrentMissions: 1,
      deepResearchPerDay: 5,
    },
  },
};

/**
 * Returns the exact tier configuration for an authenticated user
 */
export function getUserTier(email?: string | null, role?: string | null): UserTierConfig {
  const normalizedEmail = (email || '').toLowerCase().trim();

  // 1. Creator Detection (Daniel Jonathan ANDJ)
  if (
    role === 'SUPER_ADMIN' ||
    role === 'OWNER' ||
    normalizedEmail === 'danieldouba20@gmail.com' ||
    normalizedEmail.includes('smartandj')
  ) {
    return USER_TIERS.CREATOR;
  }

  // 2. Financial Collaborator (M. MBA)
  if (
    normalizedEmail === 'hermae1901@gmail.com' ||
    normalizedEmail === 'hermae.mba@gmail.com'
  ) {
    return USER_TIERS.VIP_CONTRIBUTOR;
  }

  // 3. Default Beta User
  return USER_TIERS.BETA_USER;
}
