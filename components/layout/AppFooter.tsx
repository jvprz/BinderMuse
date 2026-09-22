"use client";

import Link from "next/link";

import { useI18n } from "@/i18n/I18nProvider";

export default function AppFooter() {
  const { t } = useI18n();

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-[15px] font-semibold tracking-[-0.025em]"
            >
              BinderMuse
            </Link>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-tertiary)]">
              {t("footer.tagline")}
            </p>
          </div>

          <nav
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--text-secondary)]"
            aria-label={t("footer.navigation")}
          >
            <Link
              href="/editor"
              className="transition hover:text-[var(--text-primary)]"
            >
              {t("navigation.editor")}
            </Link>

            <Link
              href="/about"
              className="transition hover:text-[var(--text-primary)]"
            >
              {t("footer.about")}
            </Link>

            <Link
              href="/privacy"
              className="transition hover:text-[var(--text-primary)]"
            >
              {t("footer.privacy")}
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-[var(--text-primary)]"
            >
              {t("footer.terms")}
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-5">
          <p className="text-xs text-[var(--text-tertiary)]">
            © {year} BinderMuse. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}