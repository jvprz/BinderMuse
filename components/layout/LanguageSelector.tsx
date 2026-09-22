"use client";

import { useEffect, useRef, useState } from "react";

import { supportedLocales } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";

export default function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLocale = supportedLocales.find(
    (item) => item.code === locale,
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="header-control gap-2 px-3"
        aria-label={t("common.language")}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{currentLocale?.shortLabel ?? "EN"}</span>

        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="app-menu absolute right-0 top-11 z-50 min-w-40 p-1.5"
        >
          {supportedLocales.map((item) => {
            const selected = item.code === locale;

            return (
              <button
                key={item.code}
                type="button"
                role="menuitem"
                onClick={() => {
                  setLocale(item.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                  selected
                    ? "bg-[var(--control-hover)] font-medium"
                    : "hover:bg-[var(--control-hover)]"
                }`}
              >
                <span>{item.label}</span>

                {selected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                    className="text-[#0071e3]"
                  >
                    <path
                      d="M3 7.2L5.6 9.7L11 4.3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}