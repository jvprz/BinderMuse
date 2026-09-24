"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="mt-6 rounded-xl border border-black/10 px-4 py-2 text-sm font-medium transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
    >
      Sign out
    </button>
  );
}