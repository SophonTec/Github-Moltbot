"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { data } = useSession();
  const user = data?.user;

  if (!user) {
    return (
      <button
        onClick={() => signIn("google")}
        className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
      >
        Sign in
      </button>
    );
  }

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
    >
      Sign out
    </button>
  );
}
