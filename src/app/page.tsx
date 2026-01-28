import Link from "next/link";
import { fetchLatestArticles } from "@/lib/rss";
import { listArchivedArticles } from "@/lib/archive";
import { ArticleCard } from "@/app/components/ArticleCard";

export const runtime = "nodejs";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category === "tech" || sp.category === "economy" ? sp.category : undefined;

  // Prefer archive (stored), fallback to live feeds.
  const archived = listArchivedArticles({ category, limit: 60 });
  const items = archived.length > 0 ? archived : await fetchLatestArticles({ category, limit: 45 });

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-black/40">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-6 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">Moltbot Reader</h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Public tech & economy articles, with adjustable reading difficulty.
              </p>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              <span className="rounded-full border border-zinc-200 px-2 py-1 dark:border-zinc-800">
                Mobile-first
              </span>
            </div>
          </div>

          <nav className="flex gap-2">
            <Tab href="/" active={!category} label="All" />
            <Tab href="/?category=tech" active={category === "tech"} label="Tech" />
            <Tab href="/?category=economy" active={category === "economy"} label="Economy" />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        {items.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            No items loaded yet. Some feeds may be temporarily unavailable.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {items.map((item) => (
              <ArticleCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <footer className="mt-10 text-xs text-zinc-500 dark:text-zinc-400">
          <p>
            Sources are linked directly. This site uses RSS + readability-style extraction for
            reading view.
          </p>
          <p className="mt-2">
            Tip: Choose <span className="font-medium">Easy</span> for younger readers or
            non-native learners.
          </p>
        </footer>
      </main>

      <div className="h-10" />
    </div>
  );
}

function Tab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        "rounded-full border px-3 py-1.5 text-sm " +
        (active
          ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900")
      }
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
