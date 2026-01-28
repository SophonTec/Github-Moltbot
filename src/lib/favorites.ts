import { getDb } from "@/lib/db";
import { ensureUserSchema } from "@/lib/userdb";

export function isFavorite(userId: string, url: string): boolean {
  ensureUserSchema();
  const db = getDb();
  const row = db
    .prepare(`SELECT 1 as one FROM favorites WHERE userId = ? AND url = ?`)
    .get(userId, url) as { one: number } | undefined;
  return !!row;
}

export function toggleFavorite(userId: string, url: string): { favorite: boolean } {
  ensureUserSchema();
  const db = getDb();
  const now = Date.now();
  const exists = isFavorite(userId, url);
  if (exists) {
    db.prepare(`DELETE FROM favorites WHERE userId = ? AND url = ?`).run(userId, url);
    return { favorite: false };
  }
  db.prepare(`INSERT OR IGNORE INTO favorites(userId,url,createdAt) VALUES(?,?,?)`).run(userId, url, now);
  return { favorite: true };
}

export function listFavorites(userId: string, limit = 100) {
  ensureUserSchema();
  const db = getDb();
  return db
    .prepare(
      `SELECT a.url,a.id,a.title,a.sourceName,a.sourceId,a.category,a.publishedAt,a.excerpt
       FROM favorites f
       JOIN articles a ON a.url = f.url
       WHERE f.userId = ?
       ORDER BY f.createdAt DESC
       LIMIT ?`
    )
    .all(userId, limit) as Array<{
    url: string;
    id: string;
    title: string;
    sourceName: string;
    sourceId: string;
    category: "tech" | "economy";
    publishedAt?: string;
    excerpt?: string;
  }>;
}
