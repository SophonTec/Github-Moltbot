import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export type DbArticleRow = {
  url: string;
  id: string;
  title: string;
  sourceName: string;
  sourceId: string;
  category: "tech" | "economy";
  publishedAt?: string;
  excerpt?: string;
  contentText?: string;
  contentHtml?: string;
  fetchedAt: number;
};

let _db: Database.Database | null = null;

export function getDb() {
  if (_db) return _db;

  const dataDir = path.join(process.cwd(), ".data");
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, "moltbot.sqlite");

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      url TEXT PRIMARY KEY,
      id TEXT NOT NULL,
      title TEXT NOT NULL,
      sourceName TEXT NOT NULL,
      sourceId TEXT NOT NULL,
      category TEXT NOT NULL,
      publishedAt TEXT,
      excerpt TEXT,
      contentText TEXT,
      contentHtml TEXT,
      fetchedAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_articles_publishedAt ON articles(publishedAt);
    CREATE INDEX IF NOT EXISTS idx_articles_fetchedAt ON articles(fetchedAt);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
  `);

  _db = db;
  return db;
}
