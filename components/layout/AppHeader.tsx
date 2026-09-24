"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import UserMenu from "@/components/auth/UserMenu";
import { useI18n } from "@/i18n/I18nProvider";
import { createClient } from "@/lib/supabase/client";

export default function AppHeader() {
  const { t } = useI18n();

  const [user, setUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setAuthLoaded(true);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoaded(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

          {authLoaded &&
            (user ? (
              <UserMenu user={user} />
            ) : (
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[var(--text-primary)]"
              >
                Sign in
              </Link>
            ))}
        </div>
      </div>
    </header>
  );
}