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

  // Make relative links/images absolute so the reading view works reliably.
  const doc = dom.window.document;
  doc.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href) return;
    try {
      a.setAttribute("href", new URL(href, url).toString());
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noreferrer");
    } catch {
      // ignore
    }
  });
  doc.querySelectorAll("img[src]").forEach((img) => {
    const src = img.getAttribute("src");
    if (!src) return;
    try {
      img.setAttribute("src", new URL(src, url).toString());
    } catch {
      // ignore
    }
  });

  const reader = new Readability(doc);
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
