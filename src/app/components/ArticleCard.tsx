import Link from "next/link";
import type { ArticleListItem } from "@/lib/types";

export function ArticleCard({ item }: { item: ArticleListItem }) {
  return (
    <Link
      href={`/article/${item.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {item.sourceName}
            {item.publishedAt ? (
              <>
                <span className="px-2">·</span>
                <time dateTime={item.publishedAt}>
                  {new Date(item.publishedAt).toLocaleDateString()}
                </time>
              </>
            ) : null}
          </div>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-6 text-zinc-950 dark:text-zinc-50">
            {item.title}
          </h3>
          {item.excerpt ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {item.excerpt}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full border border-zinc-200 px-2 py-1 text-[11px] text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
          {item.category}
        </span>
      </div>
    </Link>
  );
}
