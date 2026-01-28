import { JSDOM } from "jsdom";
import type { Difficulty } from "@/lib/types";
import { rewriteByDifficulty } from "@/lib/rewrite";

function isText(node: Node): node is Text {
  return node.nodeType === 3;
}

function shouldSkipElement(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  return (
    tag === "script" ||
    tag === "style" ||
    tag === "noscript" ||
    tag === "svg" ||
    tag === "canvas" ||
    tag === "code" ||
    tag === "pre"
  );
}

function normalizeSpaces(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function rewriteInlineTextPreservingSpacing(original: string, rewritten: string): string {
  // Keep a single leading/trailing space if the original had it.
  const lead = /^\s/.test(original) ? " " : "";
  const trail = /\s$/.test(original) ? " " : "";
  return lead + normalizeSpaces(rewritten) + trail;
}

export function rewriteArticleHtml(originalHtml: string, difficulty: Difficulty): string {
  if (difficulty === "original") return originalHtml;

  const dom = new JSDOM(`<div id="root">${originalHtml}</div>`);
  const doc = dom.window.document;
  const root = doc.getElementById("root");
  if (!root) return originalHtml;

  // Strategy:
  // - Keep original DOM structure (images, headings, lists, etc.)
  // - Rewrite text at block level (p/li/blockquote/figcaption) to preserve layout.
  // - Avoid rewriting code/pre and similar.
  const BLOCK_SELECTOR = "p, li, blockquote, figcaption";

  root.querySelectorAll(BLOCK_SELECTOR).forEach((el) => {
    if (shouldSkipElement(el)) return;

    const textNodes: Text[] = [];
    const walker = doc.createTreeWalker(el, dom.window.NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) {
      if (!isText(n)) continue;
      const parent = n.parentElement;
      if (!parent) continue;
      // If any ancestor between node and el is a skip element, skip.
      let cur: Element | null = parent;
      let skip = false;
      while (cur && cur !== el) {
        if (shouldSkipElement(cur)) {
          skip = true;
          break;
        }
        cur = cur.parentElement;
      }
      if (skip) continue;
      if (!n.nodeValue || !normalizeSpaces(n.nodeValue)) continue;
      textNodes.push(n);
    }

    const combined = textNodes.map((t) => t.nodeValue ?? "").join(" ");
    const combinedClean = normalizeSpaces(combined);
    if (!combinedClean) return;

    const rewritten = rewriteByDifficulty(combinedClean, difficulty);

    // Replace text across the existing nodes, preserving the element structure.
    // We assign the rewritten text to the first node and clear the rest.
    const first = textNodes[0];
    if (first) {
      first.nodeValue = rewriteInlineTextPreservingSpacing(first.nodeValue ?? "", rewritten);
      for (let i = 1; i < textNodes.length; i++) textNodes[i].nodeValue = "";
    }
  });

  // Also rewrite headings lightly.
  root.querySelectorAll("h1, h2, h3").forEach((el) => {
    if (shouldSkipElement(el)) return;
    const txt = normalizeSpaces(el.textContent ?? "");
    if (!txt) return;
    const rewritten = rewriteByDifficulty(txt, difficulty);
    el.textContent = normalizeSpaces(rewritten.replace(/\n+/g, " "));
  });

  return root.innerHTML;
}
