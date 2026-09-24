import { notFound } from "next/navigation";

import PublicDesigns from "@/components/profile/PublicDesigns";
import { createClient } from "@/lib/supabase/server";

type PublicProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "username, display_name, avatar_url, bio, created_at",
    )
    .eq("username", username)
    .maybeSingle();

  if (error || !profile || !profile.username) {
    notFound();
  }

  const displayName =
    profile.display_name || profile.username;

  const initials =
    profile.display_name?.trim().charAt(0).toUpperCase() ||
    profile.username.trim().charAt(0).toUpperCase() ||
    "?";

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
      <section className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--control-hover)] text-2xl font-semibold sm:h-28 sm:w-28">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
            {displayName}
          </h1>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            @{profile.username}
          </p>

          {profile.bio && (
            <p className="mt-5 max-w-xl text-[15px] leading-6 text-[var(--text-secondary)]">
              {profile.bio}
            </p>
          )}
        </div>

        <div className="my-10 h-px bg-[var(--border)]" />

        <PublicDesigns username={profile.username} />
      </section>
    </main>
  );
}