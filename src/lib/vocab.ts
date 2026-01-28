import { getDb } from "@/lib/db";
import { ensureUserSchema } from "@/lib/userdb";

export type VocabRow = {
  userId: string;
  word: string;
  lang: string;
  meaning?: string;
  example?: string;
  sourceUrl?: string;
  addedAt: number;
  dueAt: number;
  keep: number;
  removedAt?: number;
};

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

export async function lookupEnglish(word: string): Promise<{ meaning?: string; example?: string } | null> {
  // Free public dictionary (no key). Best-effort.
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    const arr = Array.isArray(data) ? data : [];
    type DictEntry = { meanings?: Array<{ definitions?: Array<{ definition?: string; example?: string }> }> };
    const first = (arr[0] ?? null) as DictEntry | null;
    const meaning = (first?.meanings?.[0]?.definitions?.[0]?.definition as string | undefined) ?? undefined;
    const example = (first?.meanings?.[0]?.definitions?.[0]?.example as string | undefined) ?? undefined;
    return { meaning, example };
  } catch {
    return null;
  }
}

export async function addWord(params: {
  userId: string;
  word: string;
  lang?: string;
  sourceUrl?: string;
}) {
  ensureUserSchema();
  const db = getDb();
  const now = Date.now();
  const word = params.word.trim().toLowerCase();
  if (!word) throw new Error("empty word");
  const lang = params.lang ?? "en";

  const info = lang === "en" ? await lookupEnglish(word) : null;

  const dueAt = now + TWO_WEEKS_MS;

  db.prepare(
    `INSERT INTO vocab(userId,word,lang,meaning,example,sourceUrl,addedAt,dueAt,keep,removedAt)
     VALUES(@userId,@word,@lang,@meaning,@example,@sourceUrl,@addedAt,@dueAt,0,NULL)
     ON CONFLICT(userId,word,lang) DO UPDATE SET
       removedAt = NULL,
       sourceUrl = COALESCE(excluded.sourceUrl, vocab.sourceUrl),
       meaning = COALESCE(excluded.meaning, vocab.meaning),
       example = COALESCE(excluded.example, vocab.example),
       dueAt = MAX(vocab.dueAt, excluded.dueAt)`
  ).run({
    userId: params.userId,
    word,
    lang,
    meaning: info?.meaning ?? null,
    example: info?.example ?? null,
    sourceUrl: params.sourceUrl ?? null,
    addedAt: now,
    dueAt,
  });

  return { ok: true, word, lang, meaning: info?.meaning, example: info?.example, dueAt };
}

export function removeWord(userId: string, word: string, lang = "en") {
  ensureUserSchema();
  const db = getDb();
  db.prepare(`UPDATE vocab SET removedAt = ? WHERE userId = ? AND word = ? AND lang = ?`).run(
    Date.now(),
    userId,
    word.toLowerCase(),
    lang
  );
  return { ok: true };
}

export function setKeep(userId: string, word: string, keep: boolean, lang = "en") {
  ensureUserSchema();
  const db = getDb();
  db.prepare(`UPDATE vocab SET keep = ? WHERE userId = ? AND word = ? AND lang = ?`).run(
    keep ? 1 : 0,
    userId,
    word.toLowerCase(),
    lang
  );
  return { ok: true };
}

export function listReview(userId: string, now = Date.now(), limit = 50): VocabRow[] {
  ensureUserSchema();
  const db = getDb();

  // Visible words:
  // - removedAt IS NULL
  // - and (keep=1 OR dueAt >= now)  (expired non-kept words disappear)
  const rows = db
    .prepare(
      `SELECT userId,word,lang,meaning,example,sourceUrl,addedAt,dueAt,keep,removedAt
       FROM vocab
       WHERE userId = ? AND removedAt IS NULL AND (keep = 1 OR dueAt >= ?)
       ORDER BY dueAt ASC
       LIMIT ?`
    )
    .all(userId, now, limit) as VocabRow[];

  return rows;
}

export function autoAddNewWordsFromText(params: {
  userId: string;
  text: string;
  sourceUrl?: string;
  max?: number;
}) {
  // Simple heuristic MVP: pick longer, uncommon-looking words.
  // (We can replace with a proper frequency list later.)
  const max = params.max ?? 8;
  const tokens = (params.text.match(/[A-Za-z][A-Za-z'-]{3,}/g) ?? [])
    .map((w) => w.toLowerCase())
    .filter((w) => w.length >= 6 && w.length <= 16);

  const stop = new Set([
    "because",
    "between",
    "through",
    "people",
    "before",
    "during",
    "should",
    "market",
    "company",
    "companies",
    "product",
    "products",
    "technology",
    "economic",
    "economy",
    "according",
    "however",
  ]);

  const uniq: string[] = [];
  const seen = new Set<string>();
  for (const t of tokens) {
    if (stop.has(t)) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    uniq.push(t);
    if (uniq.length >= max) break;
  }

  return uniq;
}
