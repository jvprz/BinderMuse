"use client";

import { useEffect, useState } from "react";

import { useI18n } from "@/i18n/I18nProvider";

type Theme = "light" | "dark";

const STORAGE_KEY = "bindermuse-theme";

function getPreferredTheme(): Theme {
  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const { t } = useI18n();

  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const preferredTheme = getPreferredTheme();

    document.documentElement.dataset.theme = preferredTheme;

    const timeoutId = window.setTimeout(() => {
      setTheme(preferredTheme);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  function toggleTheme() {
    const newTheme: Theme =
      theme === "light" ? "dark" : "light";

    setTheme(newTheme);

    localStorage.setItem(STORAGE_KEY, newTheme);
    document.documentElement.dataset.theme = newTheme;
  }

  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="header-control w-9"
      aria-label={
        dark
          ? t("common.lightMode")
          : t("common.darkMode")
      }
      title={
        dark
          ? t("common.lightMode")
          : t("common.darkMode")
      }
    >
      {dark ? (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="4"
            stroke="currentColor"
            strokeWidth="1.6"
          />

          <path
            d="M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M2 12H4M20 12H22M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5A8.5 8.5 0 1 0 20.5 14.2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}