"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";

export function ArticleActions({
  url,
  originalText,
}: {
  url: string;
  originalText: string;
}) {
  const { data } = useSession();
  const signedIn = !!data?.user;

  const [favorite, setFavorite] = useState(false);
  const [word, setWord] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const canSuggest = useMemo(() => originalText.trim().length > 0, [originalText]);

  async function toggleFav() {
    if (!signedIn) {
      window.location.href = "/login";
      return;
    }
    const res = await fetch("/api/favorites/toggle", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return;
    const data2 = (await res.json()) as { favorite?: boolean };
    setFavorite(!!data2.favorite);
  }

  async function addWord(w: string) {
    if (!signedIn) {
      window.location.href = "/login";
      return;
    }
    const ww = w.trim();
    if (!ww) return;
    await fetch("/api/vocab/add", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ word: ww, sourceUrl: url }),
    });
    setWord("");
  }

  async function suggest() {
    if (!signedIn) {
      window.location.href = "/login";
      return;
    }
    if (!canSuggest) return;
    setSuggesting(true);
    try {
      const res = await fetch("/api/vocab/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: originalText, sourceUrl: url }),
      });
      const data2 = (await res.json()) as { words?: string[] };
      setSuggestions(Array.isArray(data2.words) ? data2.words : []);
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={toggleFav}
          className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          {favorite ? "★ Favorited" : "☆ Favorite"}
        </button>

        <a
          href="/me"
          className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          My
        </a>

        {!signedIn ? (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Sign in to use favorites & vocabulary.
          </span>
        ) : null}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Vocabulary</div>
        <div className="mt-2 flex gap-2">
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Add a word (e.g. volatility)"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-black dark:focus:ring-zinc-700"
          />
          <button
            onClick={() => addWord(word)}
            className="shrink-0 rounded-xl bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Add
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={suggest}
            disabled={!canSuggest || suggesting}
            className="text-xs text-zinc-600 underline underline-offset-4 hover:text-zinc-950 disabled:opacity-50 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            {suggesting ? "Finding new words…" : "Auto-pick new words"}
          </button>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">2-week review window</span>
        </div>

        {suggestions.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((w) => (
              <button
                key={w}
                onClick={() => addWord(w)}
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                + {w}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
