import Link from "next/link";
import { decodeIdToUrl } from "@/lib/id";
import { fetchAndExtractArticle } from "@/lib/article";
import { getArchivedArticle, updateArchivedContent } from "@/lib/archive";
import { Reader } from "@/app/components/Reader";

export const runtime = "nodejs";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const url = decodeIdToUrl(id);

  const cached = getArchivedArticle(url);

  const article = cached?.contentText
    ? {
        url: cached.url,
        title: cached.title,
        byline: undefined,
        siteName: cached.sourceName,
        publishedAt: cached.publishedAt,
        text: cached.contentText,
        html: cached.contentHtml,
      }
    : await fetchAndExtractArticle(url);

  // Cache extracted content for later browsing.
  if (!cached?.contentText) {
    updateArchivedContent(url, { contentText: article.text, contentHtml: article.html });
  }

  const metaParts = [article.siteName, article.byline].filter(Boolean);
  const meta = metaParts.join(" · ");

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/80 backdrop-blur dark:border-zinc-800 dark:bg-black/60">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="text-sm font-semibold hover:underline">
            Moltbot Reader
          </Link>
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-zinc-600 hover:text-zinc-950 hover:underline dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            Open source
          </a>
        </div>
      </div>

      <Reader
        title={article.title}
        meta={meta || undefined}
        sourceUrl={article.url}
        originalText={article.text}
        originalHtml={article.html}
      />
    </div>
  );
}
