"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-md px-4 py-10">
        <Link href="/" className="text-sm font-semibold hover:underline">
          ← Back
        </Link>

        <h1 className="mt-6 text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Sign in to enable Favorites and your Vocabulary.
        </p>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="block w-full rounded-xl bg-zinc-950 px-4 py-3 text-center text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Continue with Google
          </button>
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Needs GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET and NEXTAUTH_SECRET.
          </p>
        </div>
      </div>
    </div>
  );
}
