/**
 * Ñkyel AI · Internationalized Locale & Currency Formatters
 * SmartANDJ AI Technologies · Founder: Daniel Jonathan ANDJ
 *
 * Gère le formatage strict selon la locale BCP-47 et les préférences utilisateur :
 * - Dates : US (MM/DD/YYYY) vs FR/GA (DD/MM/YYYY) vs ISO (YYYY-MM-DD) vs Arabe/Asie
 * - Heures : 24h vs 12h AM/PM
 * - Nombres : Espace & virgule (1 234,56) vs Virgule & point (1,234.56)
 * - Devises : FCFA (XAF), Euro (EUR), Dollar (USD), Yuan (CNY), Yen (JPY), Riyal (SAR/AED), Roupie (INR)
 */

export type DateFormatOption = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormatOption = '24h' | '12h';
export type NumberFormatOption = 'space_comma' | 'comma_dot';
export type CurrencyOption = 'XAF' | 'EUR' | 'USD' | 'GBP' | 'CNY' | 'JPY' | 'AED' | 'SAR' | 'INR';

export interface FormatterOptions {
  locale?: string;
  dateFormat?: DateFormatOption;
  timeFormat?: TimeFormatOption;
  numberFormat?: NumberFormatOption;
  currency?: CurrencyOption;
}

/** Formate une date selon la locale et le format choisi */
export function formatDate(date: Date | string | number, options: FormatterOptions = {}): string {
  const d = typeof date === 'object' ? date : new Date(date);
  if (isNaN(d.getTime())) return '';

  const { locale = 'fr-FR', dateFormat = 'DD/MM/YYYY' } = options;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  switch (dateFormat) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
    default:
      return `${day}/${month}/${year}`;
  }
}

/** Formate l'heure selon 24h ou 12h */
export function formatTime(date: Date | string | number, options: FormatterOptions = {}): string {
  const d = typeof date === 'object' ? date : new Date(date);
  if (isNaN(d.getTime())) return '';

  const { timeFormat = '24h' } = options;

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  if (timeFormat === '12h') {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    return `${hours}:${minutes} ${ampm}`;
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/** Formate un nombre selon la convention choisie */
export function formatNumber(val: number, options: FormatterOptions = {}): string {
  if (typeof val !== 'number' || isNaN(val)) return '0';

  const { numberFormat = 'space_comma' } = options;

  const parts = val.toString().split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? (numberFormat === 'space_comma' ? ',' + parts[1] : '.' + parts[1]) : '';

  if (numberFormat === 'space_comma') {
    // 1 234 567,89
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${integerPart}${decimalPart}`;
  } else {
    // 1,234,567.89
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${integerPart}${decimalPart}`;
  }
}

/** Formate un montant monétaire */
export function formatCurrency(amount: number, options: FormatterOptions = {}): string {
  const { currency = 'XAF' } = options;
  const formattedNum = formatNumber(amount, options);

  const symbols: Record<CurrencyOption, { symbol: string; position: 'prefix' | 'suffix' }> = {
    XAF: { symbol: 'FCFA', position: 'suffix' },
    EUR: { symbol: '€', position: 'suffix' },
    USD: { symbol: '$', position: 'prefix' },
    GBP: { symbol: '£', position: 'prefix' },
    CNY: { symbol: '¥', position: 'prefix' },
    JPY: { symbol: '¥', position: 'prefix' },
    AED: { symbol: 'AED', position: 'suffix' },
    SAR: { symbol: 'SAR', position: 'suffix' },
    INR: { symbol: '₹', position: 'prefix' },
  };

  const config = symbols[currency] || { symbol: currency, position: 'suffix' };

  if (config.position === 'prefix') {
    return `${config.symbol}${formattedNum}`;
  }
  return `${formattedNum} ${config.symbol}`;
}
