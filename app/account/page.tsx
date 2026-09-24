import LogoutButton from "@/components/auth/LogoutButton";
import ProfileForm from "@/components/account/ProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">
          Account
        </h1>

        <p className="mt-6 text-sm opacity-60">
          You are not signed in.
        </p>
      </main>
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div>
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          BinderMuse
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Your profile
        </h1>

        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Choose how other BinderMuse users will see you.
        </p>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-500">
            {error.message}
          </p>
        </div>
      ) : (
        <ProfileForm
          userId={user.id}
          initialProfile={profile}
        />
      )}

      <div className="mt-10 border-t border-[var(--border)] pt-6">
        <p className="text-xs text-[var(--text-secondary)]">
          Signed in as {user.email}
        </p>

        <LogoutButton />
      </div>
    </main>
  );
}