import { fetchLatestArticles } from "@/lib/rss";
import { upsertArchivedListItem } from "@/lib/archive";

export async function refreshFeeds(): Promise<{ addedOrUpdated: number }> {
  const items = await fetchLatestArticles({ limit: 120 });
  for (const it of items) {
    upsertArchivedListItem({
      url: it.url,
      id: it.id,
      title: it.title,
      sourceId: it.sourceId,
      sourceName: it.sourceName,
      category: it.category,
      publishedAt: it.publishedAt,
      excerpt: it.excerpt,
    });
  }

  return { addedOrUpdated: items.length };
}
