import Link from "next/link";
import { auth } from "@/lib/auth-server";
import { listFavorites } from "@/lib/favorites";
import { listReview } from "@/lib/vocab";

export const runtime = "nodejs";

export default async function MePage() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string } | undefined)?.id;

  if (!userId) {
    return (
      <div className="min-h-dvh bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
          <Link href="/" className="text-sm font-semibold hover:underline">
            ← Back
          </Link>
          <h1 className="mt-6 text-2xl font-semibold">My Library</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Please sign in to see favorites and your vocabulary.
          </p>
          <div className="mt-6">
            <a
              href="/login"
              className="inline-flex rounded-xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    );
  }

  const favorites = listFavorites(userId, 100);
  const vocab = listReview(userId, undefined, 80);

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold hover:underline">
            ← Back
          </Link>
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            {session?.user?.email}
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-semibold">My Library</h1>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">Favorites</h2>
          {favorites.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">No favorites yet.</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3">
              {favorites.map((f) => (
                <Link
                  key={f.url}
                  href={`/article/${f.id}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{f.sourceName}</div>
                  <div className="mt-1 font-semibold">{f.title}</div>
                  {f.excerpt ? (
                    <div className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">
                      {f.excerpt}
                    </div>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Vocabulary (2-week review)</h2>
          {vocab.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">No words yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {vocab.map((w) => (
                <div
                  key={`${w.word}:${w.lang}`}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold">{w.word}</div>
                      {w.meaning ? (
                        <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{w.meaning}</div>
                      ) : (
                        <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">(No definition yet)</div>
                      )}
                      {w.example ? (
                        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">“{w.example}”</div>
                      ) : null}
                      <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        Expires: {new Date(w.dueAt).toLocaleDateString()} {w.keep ? "(kept)" : ""}
                      </div>
                      {w.sourceUrl ? (
                        <a
                          className="mt-2 inline-block text-xs underline underline-offset-4 text-zinc-600 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                          href={w.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Source
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
