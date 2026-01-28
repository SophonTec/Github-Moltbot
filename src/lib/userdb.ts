import { getDb } from "@/lib/db";

export type UserRow = {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: number;
  updatedAt: number;
};

export function ensureUserSchema() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      image TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
      userId TEXT NOT NULL,
      url TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      PRIMARY KEY(userId, url)
    );
    CREATE INDEX IF NOT EXISTS idx_favorites_userId_createdAt ON favorites(userId, createdAt);

    CREATE TABLE IF NOT EXISTS vocab (
      userId TEXT NOT NULL,
      word TEXT NOT NULL,
      lang TEXT NOT NULL,
      meaning TEXT,
      example TEXT,
      sourceUrl TEXT,
      addedAt INTEGER NOT NULL,
      dueAt INTEGER NOT NULL,
      keep INTEGER NOT NULL DEFAULT 0,
      removedAt INTEGER,
      PRIMARY KEY(userId, word, lang)
    );
    CREATE INDEX IF NOT EXISTS idx_vocab_user_dueAt ON vocab(userId, dueAt);
  `);
}

export function upsertUserFromOAuth(params: {
  email: string;
  name?: string | null;
  image?: string | null;
}): UserRow {
  ensureUserSchema();
  const db = getDb();
  const now = Date.now();
  const email = params.email.toLowerCase();

  const existing = db
    .prepare(`SELECT id,email,name,image,createdAt,updatedAt FROM users WHERE email = ?`)
    .get(email) as UserRow | undefined;

  if (existing) {
    db.prepare(
      `UPDATE users SET name = COALESCE(@name, name), image = COALESCE(@image, image), updatedAt = @updatedAt WHERE email = @email`
    ).run({ email, name: params.name ?? null, image: params.image ?? null, updatedAt: now });
    return {
      ...existing,
      name: params.name ?? existing.name,
      image: params.image ?? existing.image,
      updatedAt: now,
    };
  }

  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO users(id,email,name,image,createdAt,updatedAt) VALUES(@id,@email,@name,@image,@createdAt,@updatedAt)`
  ).run({
    id,
    email,
    name: params.name ?? null,
    image: params.image ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return { id, email, name: params.name ?? undefined, image: params.image ?? undefined, createdAt: now, updatedAt: now };
}

export function getUserByEmail(email: string): UserRow | null {
  ensureUserSchema();
  const db = getDb();
  return (
    (db
      .prepare(`SELECT id,email,name,image,createdAt,updatedAt FROM users WHERE email = ?`)
      .get(email.toLowerCase()) as UserRow | undefined) ?? null
  );
}
