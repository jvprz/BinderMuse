"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { supportedLocales } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type UserMenuProps = {
  user: User;
};

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "bindermuse-theme";

function getPreferredTheme(): Theme {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const { locale, setLocale, t } = useI18n();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Keep the initial render deterministic to avoid hydration mismatches.
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(data);
    }

    void loadProfile();
  }, [user.id]);

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

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  function changeTheme(newTheme: Theme) {
    setTheme(newTheme);

    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    document.documentElement.dataset.theme = newTheme;
  }

  async function handleSignOut() {
    setIsSigningOut(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      setIsSigningOut(false);
      return;
    }

    setIsOpen(false);

    router.push("/login");
    router.refresh();
  }

  const displayName =
    profile?.display_name ||
    profile?.username ||
    user.email?.split("@")[0] ||
    "Account";

  const username = profile?.username;

  const initials =
    profile?.display_name?.trim().charAt(0).toUpperCase() ||
    profile?.username?.trim().charAt(0).toUpperCase() ||
    user.email?.trim().charAt(0).toUpperCase() ||
    "?";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={t("userMenu.openMenu")}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex rounded-full p-1 transition hover:bg-[var(--control-hover)]"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--control-hover)] text-xs font-semibold">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="app-menu absolute right-0 top-[calc(100%+8px)] z-50 w-72 p-2"
        >
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--control-hover)] text-sm font-semibold">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {displayName}
              </p>

              <p className="truncate text-xs text-[var(--text-secondary)]">
                {username ? `@${username}` : user.email}
              </p>
            </div>
          </div>

          <div className="my-2 h-px bg-[var(--border)]" />

          <nav className="space-y-0.5">
            <Link
              href="/designs"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm transition hover:bg-[var(--control-hover)]"
            >
              {t("userMenu.myDesigns")}
            </Link>

            {username && (
              <Link
                href={`/u/${username}`}
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm transition hover:bg-[var(--control-hover)]"
              >
                {t("userMenu.profile")}
              </Link>
            )}

            <Link
              href="/account"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm transition hover:bg-[var(--control-hover)]"
            >
              {t("userMenu.accountSettings")}
            </Link>
          </nav>

          <div className="my-2 h-px bg-[var(--border)]" />

          <div className="px-2 py-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-[var(--text-secondary)]">
                {t("userMenu.language")}
              </span>

              <div className="flex rounded-lg bg-[var(--control-hover)] p-0.5">
                {supportedLocales.map((item) => {
                  const selected = item.code === locale;

                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setLocale(item.code)}
                      aria-pressed={selected}
                      title={item.label}
                      className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
                        selected
                          ? "bg-[var(--background)] text-[var(--text-primary)] shadow-sm"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {item.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-sm text-[var(--text-secondary)]">
                {t("userMenu.appearance")}
              </span>

              <div className="flex rounded-lg bg-[var(--control-hover)] p-0.5">
                <button
                  type="button"
                  onClick={() => changeTheme("light")}
                  aria-pressed={theme === "light"}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    theme === "light"
                      ? "bg-[var(--background)] text-[var(--text-primary)] shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {t("userMenu.light")}
                </button>

                <button
                  type="button"
                  onClick={() => changeTheme("dark")}
                  aria-pressed={theme === "dark"}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    theme === "dark"
                      ? "bg-[var(--background)] text-[var(--text-primary)] shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {t("userMenu.dark")}
                </button>
              </div>
            </div>
          </div>

          <div className="my-2 h-px bg-[var(--border)]" />

          <button
            type="button"
            role="menuitem"
            disabled={isSigningOut}
            onClick={handleSignOut}
            className="w-full rounded-xl px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSigningOut
              ? t("userMenu.signingOut")
              : t("userMenu.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}