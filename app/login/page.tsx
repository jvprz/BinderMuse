"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/editor");
    router.refresh();
  }

  return (
    <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>

          <p className="mt-2 text-sm opacity-60">
            Sign in to BinderMuse.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              onChange={(event) => setEmail(event.target.value)}
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-black/10 bg-transparent px-4 py-3 outline-none transition focus:border-black/30 dark:border-white/10 dark:focus:border-white/30"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          {error && (
            <p className="text-center text-sm text-red-500">
              {error}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm opacity-60">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium underline underline-offset-4"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}