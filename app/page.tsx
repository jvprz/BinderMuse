"use client";

import Link from "next/link";

import { useI18n } from "@/i18n/I18nProvider";

export default function Home() {
  const { t } = useI18n();

  return (
    <main>
      <section className="mx-auto flex min-h-[calc(100vh-56px)] max-w-[1200px] flex-col items-center justify-center px-6 py-20 text-center sm:py-28">
        <div className="max-w-[850px]">
          <p className="mb-5 text-sm font-medium tracking-[-0.01em] text-[#0071e3]">
            {t("home.eyebrow")}
          </p>

          <h1 className="text-[clamp(3.25rem,8vw,6.8rem)] font-semibold leading-[0.92] tracking-[-0.065em]">
            {t("home.title")}
          </h1>

          <p className="mx-auto mt-8 max-w-[650px] text-[clamp(1.05rem,2vw,1.3rem)] leading-relaxed tracking-[-0.02em] text-[var(--text-secondary)]">
            {t("home.description")}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/editor"
              className="rounded-full bg-[var(--text-primary)] px-6 py-3 text-sm font-medium text-[var(--background)] transition hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("home.startDesigning")}
            </Link>

            <a
              href="#preview"
              className="rounded-full px-6 py-3 text-sm font-medium text-[#0071e3] transition hover:bg-[var(--control-hover)]"
            >
              {t("home.learnMore")} →
            </a>
          </div>
        </div>

        <div
          id="preview"
          className="mt-24 w-full max-w-[900px] rounded-[36px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.08)] sm:p-8"
        >
          <div className="rounded-[28px] bg-[var(--workspace)] px-6 py-16 sm:px-12 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
              {t("home.previewLabel")}
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              {t("home.previewTitle")}
            </h2>

            <p className="mx-auto mt-5 max-w-[520px] text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
              {t("home.previewDescription")}
            </p>

            <div className="mx-auto mt-10 grid max-w-[390px] grid-cols-3 gap-2.5 rounded-[24px] bg-[#18181a] p-4 shadow-2xl">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[63/88] rounded-lg border border-white/10 bg-[#f5f5f7] shadow-sm"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}