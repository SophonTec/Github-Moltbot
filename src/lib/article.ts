import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import type { ArticleContent } from "@/lib/types";

function toText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchAndExtractArticle(url: string): Promise<ArticleContent> {
  const res = await fetch(url, {
    // some sites are picky
    headers: {
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "accept": "text/html,application/xhtml+xml",
    },
    // avoid cached content when developing
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch article (${res.status})`);
  }

  const html = await res.text();
  const dom = new JSDOM(html, { url });

  const reader = new Readability(dom.window.document);
  const parsed = reader.parse();

  if (!parsed) {
    // fallback: raw text
    return {
      url,
      title: dom.window.document.title || url,
      text: toText(html),
    };
  }

  const text = (parsed.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();

  return {
    url,
    title: parsed.title || dom.window.document.title || url,
    byline: parsed.byline || undefined,
    siteName: parsed.siteName || undefined,
    publishedAt: undefined,
    text,
    html: parsed.content || undefined,
  };
}
