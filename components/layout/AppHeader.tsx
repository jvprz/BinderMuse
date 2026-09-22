"use client";

import Link from "next/link";

import { useI18n } from "@/i18n/I18nProvider";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";

export default function AppHeader() {
  const { t } = useI18n();

  return (
    <header className="app-header sticky top-0 z-40">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-5 sm:px-6">
        <Link
          href="/"
          className="text-[17px] font-semibold tracking-[-0.025em]"
        >
          BinderMuse
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/editor"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[var(--text-primary)] sm:block"
          >
            {t("navigation.editor")}
          </Link>

          <div className="mx-1 h-4 w-px bg-[var(--border)]" />

          <LanguageSelector />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}