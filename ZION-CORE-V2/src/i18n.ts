/* GabomaGPT · i18n Config · SmartANDJ AI Technologies
   next-intl configuration — fr, fang, punu
   Fondateur : Daniel Jonathan ANDJ */

import { getRequestConfig } from 'next-intl/server';

export const locales = ['fr', 'fang', 'punu'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export default getRequestConfig(async () => {
  // For now, default to French. In future, detect from user preferences or Clerk metadata.
  const locale = defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
