// Bilingual content types and utilities

export type Language = 'en' | 'es';

export interface LocalizedString {
  en: string;
  es: string;
}

export interface BilingualService {
  name: LocalizedString;
  description: LocalizedString;
  icon?: string;
}

export interface BilingualTestimonial {
  name: string;
  rating: number;
  text: LocalizedString;
  location?: string;
}

export interface BilingualSiteContent {
  companyName: string;
  tagline: LocalizedString;
  headline: LocalizedString;
  subheadline: LocalizedString;
  about: LocalizedString;
  services: BilingualService[];
  serviceAreas: string[];
  testimonials: BilingualTestimonial[];
  credentials: Array<{ name: string; number?: string }>;
  cta: {
    primary: LocalizedString;
    secondary: LocalizedString;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
  };
}

/**
 * Safely extract localized text from content that may be:
 * - A LocalizedString object { en: "...", es: "..." }
 * - A plain string (legacy content)
 * - Undefined
 * 
 * @param content - The content to extract from
 * @param language - The desired language (defaults to 'en')
 * @returns The localized string, falling back to English or empty string
 * 
 * @example
 * getLocalizedText({ en: "Hello", es: "Hola" }, 'es') // => "Hola"
 * getLocalizedText("Legacy text", 'es') // => "Legacy text"
 * getLocalizedText(undefined, 'en') // => ""
 */
export function getLocalizedText(
  content: LocalizedString | string | undefined,
  language: Language = 'en'
): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  return content[language] || content.en || '';
}

/**
 * Check if content is a LocalizedString object
 */
export function isLocalizedString(content: unknown): content is LocalizedString {
  return (
    typeof content === 'object' &&
    content !== null &&
    'en' in content &&
    typeof (content as LocalizedString).en === 'string'
  );
}

/**
 * Create a LocalizedString from a single language value
 * Useful for migrations or when only one language is available
 */
export function createLocalizedString(
  englishText: string,
  spanishText?: string
): LocalizedString {
  return {
    en: englishText,
    es: spanishText || englishText,
  };
}
