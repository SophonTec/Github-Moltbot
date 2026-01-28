"use client";

import { useMemo, useState } from "react";
import type { Difficulty } from "@/lib/types";

const OPTIONS: Array<{ id: Difficulty; label: string; hint: string }> = [
  { id: "simple", label: "Easy", hint: "Shorter sentences, simpler words" },
  { id: "intermediate", label: "Medium", hint: "Mild simplification" },
  { id: "original", label: "Original", hint: "Source text" },
];

export function Reader({
  title,
  meta,
  originalText,
}: {
  title: string;
  meta?: string;
  originalText: string;
}) {
  const [difficulty, setDifficulty] = useState<Difficulty>("original");
  const [text, setText] = useState<string>(originalText);
  const [loading, setLoading] = useState(false);

  const currentHint = useMemo(
    () => OPTIONS.find((o) => o.id === difficulty)?.hint ?? "",
    [difficulty]
  );

  async function onChange(next: Difficulty) {
    setDifficulty(next);

    if (next === "original") {
      setText(originalText);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: originalText, difficulty: next }),
      });
      const data = (await res.json()) as { text?: string };
      setText((data.text ?? "").trim() || "(No content)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <header className="mb-5">
        <h1 className="text-balance text-2xl font-semibold leading-snug text-zinc-950 dark:text-zinc-50 sm:text-3xl">
          {title}
        </h1>
        {meta ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{meta}</p>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex w-full overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950 sm:w-auto">
            {OPTIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => onChange(o.id)}
                className={
                  "flex-1 rounded-lg px-3 py-2 text-sm font-medium sm:flex-none " +
                  (difficulty === o.id
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900")
                }
                aria-pressed={difficulty === o.id}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {loading ? "Rewriting…" : currentHint}
          </div>
        </div>
      </header>

      <article className="space-y-4 text-[15px] leading-7 text-zinc-900 dark:text-zinc-100 sm:text-[16px]">
        {text.split(/\n{2,}/).map((p, idx) => (
          <p key={idx} className="whitespace-pre-wrap">
            {p}
          </p>
        ))}
      </article>

      <div className="mt-10 rounded-xl border border-zinc-200 bg-white p-4 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
        Disclaimer: Articles come from public sources (RSS + on-page extraction). Some sites may block full text; in that case you may see reduced content.
      </div>
    </div>
  );
}
