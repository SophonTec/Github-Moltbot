import type { ArticleListItem } from "@/lib/types";
import type { DbArticleRow } from "@/lib/db";
import { getDb } from "@/lib/db";

export function listArchivedArticles(params?: {
  category?: "tech" | "economy";
  limit?: number;
}): ArticleListItem[] {
  const { category, limit = 60 } = params ?? {};
  const db = getDb();

  const rows: DbArticleRow[] = category
    ? (db
        .prepare(
          `SELECT url,id,title,sourceName,sourceId,category,publishedAt,excerpt,fetchedAt
           FROM articles
           WHERE category = ?
           ORDER BY COALESCE(publishedAt, '') DESC, fetchedAt DESC
           LIMIT ?`
        )
        .all(category, limit) as DbArticleRow[])
    : (db
        .prepare(
          `SELECT url,id,title,sourceName,sourceId,category,publishedAt,excerpt,fetchedAt
           FROM articles
           ORDER BY COALESCE(publishedAt, '') DESC, fetchedAt DESC
           LIMIT ?`
        )
        .all(limit) as DbArticleRow[]);

  return rows.map((r) => ({
    id: r.id,
    url: r.url,
    title: r.title,
    sourceId: r.sourceId,
    sourceName: r.sourceName,
    category: r.category,
    publishedAt: r.publishedAt,
    excerpt: r.excerpt,
  }));
}

export function getArchivedArticle(url: string): DbArticleRow | null {
  const db = getDb();
  return (
    (db
      .prepare(
        `SELECT url,id,title,sourceName,sourceId,category,publishedAt,excerpt,contentText,contentHtml,fetchedAt
         FROM articles
         WHERE url = ?`
      )
      .get(url) as DbArticleRow | undefined) ?? null
  );
}

export function upsertArchivedListItem(row: {
  url: string;
  id: string;
  title: string;
  sourceName: string;
  sourceId: string;
  category: "tech" | "economy";
  publishedAt?: string;
  excerpt?: string;
}) {
  const db = getDb();
  db.prepare(
    `INSERT INTO articles(url,id,title,sourceName,sourceId,category,publishedAt,excerpt,fetchedAt)
     VALUES(@url,@id,@title,@sourceName,@sourceId,@category,@publishedAt,@excerpt,@fetchedAt)
     ON CONFLICT(url) DO UPDATE SET
       title=excluded.title,
       sourceName=excluded.sourceName,
       sourceId=excluded.sourceId,
       category=excluded.category,
       publishedAt=COALESCE(excluded.publishedAt, articles.publishedAt),
       excerpt=COALESCE(excluded.excerpt, articles.excerpt),
       fetchedAt=excluded.fetchedAt`
  ).run({ ...row, fetchedAt: Date.now() });
}

export function updateArchivedContent(url: string, content: { contentText?: string; contentHtml?: string }) {
  const db = getDb();
  db.prepare(
    `UPDATE articles
     SET contentText = COALESCE(@contentText, contentText),
         contentHtml = COALESCE(@contentHtml, contentHtml),
         fetchedAt = @fetchedAt
     WHERE url = @url`
  ).run({ url, ...content, fetchedAt: Date.now() });
}
