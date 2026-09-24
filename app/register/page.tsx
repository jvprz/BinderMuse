"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Account created. Check your email to confirm your account.",
    );

    setLoading(false);
  }

  return (
    <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create your account
          </h1>

          <p className="mt-2 text-sm opacity-60">
            Start creating with BinderMuse.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none transition focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none transition focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>

          {message && (
            <p className="text-center text-sm opacity-70">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}