"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  Locale,
  translations,
} from "./config";

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext =
  createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = "bindermuse-locale";

function getTranslation(
  locale: Locale,
  key: string,
): string | undefined {
  const keys = key.split(".");

  let value: unknown = translations[locale];

  for (const currentKey of keys) {
    if (
      typeof value !== "object" ||
      value === null ||
      !(currentKey in value)
    ) {
      return undefined;
    }

    value = (value as Record<string, unknown>)[
      currentKey
    ];
  }

  return typeof value === "string"
    ? value
    : undefined;
}

function translate(
  locale: Locale,
  key: string,
): string {
  const translation = getTranslation(locale, key);

  if (translation !== undefined) {
    return translation;
  }

  const fallback = getTranslation(
    DEFAULT_LOCALE,
    key,
  );

  if (fallback !== undefined) {
    return fallback;
  }

  return key;
}

function getPreferredLocale(): Locale {
  const savedLocale =
    localStorage.getItem(STORAGE_KEY);

  if (
    savedLocale &&
    isSupportedLocale(savedLocale)
  ) {
    return savedLocale;
  }

  const browserLocale =
    navigator.language.split("-")[0];

  if (isSupportedLocale(browserLocale)) {
    return browserLocale;
  }

  return DEFAULT_LOCALE;
}

export function I18nProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [locale, setLocaleState] =
    useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const preferredLocale = getPreferredLocale();

    document.documentElement.lang =
      preferredLocale;

    const timeoutId = window.setTimeout(() => {
      setLocaleState(preferredLocale);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  function setLocale(newLocale: Locale) {
    setLocaleState(newLocale);

    localStorage.setItem(
      STORAGE_KEY,
      newLocale,
    );

    document.documentElement.lang =
      newLocale;
  }

  function t(key: string) {
    return translate(locale, key);
  }

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (context === undefined) {
    throw new Error(
      "useI18n must be used inside an I18nProvider",
    );
  }

  return context;
}