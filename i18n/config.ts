import en from "./locales/en";
import es from "./locales/es";
import ca from "./locales/ca";

export const DEFAULT_LOCALE = "en";

export const supportedLocales = [
  {
    code: "en",
    label: "English",
    shortLabel: "EN",
  },
  {
    code: "es",
    label: "Español",
    shortLabel: "ES",
  },
  {
    code: "ca",
    label: "Català",
    shortLabel: "CA",
  },
] as const;

export type Locale = (typeof supportedLocales)[number]["code"];

export const translations = {
  en,
  es,
  ca,
} satisfies Record<Locale, typeof en>;

export function isSupportedLocale(value: string): value is Locale {
  return supportedLocales.some((locale) => locale.code === value);
}