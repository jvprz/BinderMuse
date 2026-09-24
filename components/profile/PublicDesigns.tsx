"use client";

import { useI18n } from "@/i18n/I18nProvider";

type PublicDesignsProps = {
  username: string;
};

export default function PublicDesigns({
  username,
}: PublicDesignsProps) {
  const { t } = useI18n();

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.015em]">
            {t("publicProfile.designs")}
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {t("publicProfile.designsDescription")} @{username}.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--control-hover)]">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5 text-[var(--text-secondary)]"
          >
            <path
              d="M5.75 4.75h12.5a1 1 0 0 1 1 1v12.5a1 1 0 0 1-1 1H5.75a1 1 0 0 1-1-1V5.75a1 1 0 0 1 1-1Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />

            <path
              d="M9.5 4.75v14.5M14.5 4.75v14.5M4.75 9.5h14.5M4.75 14.5h14.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              opacity="0.65"
            />
          </svg>
        </div>

        <h3 className="mt-4 text-sm font-semibold">
          {t("publicProfile.noDesigns")}
        </h3>

        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-5 text-[var(--text-secondary)]">
          {t("publicProfile.noDesignsDescription")}
        </p>
      </div>
    </section>
  );
}