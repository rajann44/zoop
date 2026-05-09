import { en } from "@/locales/en";

export const locales = {
  en,
} as const;

export type LocaleCode = keyof typeof locales;

export const DEFAULT_LOCALE: LocaleCode = "en";

export function getLocaleDictionary(locale: LocaleCode = DEFAULT_LOCALE) {
  return locales[locale];
}

export const t = getLocaleDictionary(DEFAULT_LOCALE);
