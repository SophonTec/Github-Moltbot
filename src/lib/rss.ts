import Parser from "rss-parser";
import { FEEDS } from "@/lib/feeds";
import { encodeUrlToId } from "@/lib/id";
import type { ArticleListItem } from "@/lib/types";

const parser: Parser = new Parser({
  timeout: 10_000,
});

function cleanText(input?: string): string | undefined {
  if (!input) return undefined;
  const s = input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return s || undefined;
}

export async function fetchLatestArticles(params?: {
  category?: "tech" | "economy";
  limit?: number;
}): Promise<ArticleListItem[]> {
  const { category, limit = 40 } = params ?? {};

  const sources = category ? FEEDS.filter((f) => f.category === category) : FEEDS;

  const results: ArticleListItem[] = [];

  await Promise.all(
    sources.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        for (const item of parsed.items ?? []) {
          const url = (item.link ?? "").trim();
          const title = (item.title ?? "").trim();
          if (!url || !title) continue;
          results.push({
            id: encodeUrlToId(url),
            url,
            title,
            sourceId: feed.id,
            sourceName: feed.name,
            category: feed.category,
            publishedAt: item.isoDate ?? undefined,
            excerpt: cleanText(item.contentSnippet ?? item.content ?? item.summary ?? undefined),
          });
        }
      } catch {
        // Ignore a failing feed; we still show others.
      }
    })
  );

  // newest first when possible
  results.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  // dedupe by URL
  const seen = new Set<string>();
  const deduped: ArticleListItem[] = [];
  for (const r of results) {
    if (seen.has(r.url)) continue;
    seen.add(r.url);
    deduped.push(r);
    if (deduped.length >= limit) break;
  }

  return deduped;
}
