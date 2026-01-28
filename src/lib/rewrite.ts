import type { Difficulty } from "@/lib/types";

const SIMPLE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bapproximately\b/gi, "about"],
  [/\butilize\b/gi, "use"],
  [/\bcommence\b/gi, "start"],
  [/\bterminate\b/gi, "end"],
  [/\bpurchase\b/gi, "buy"],
  [/\bassist\b/gi, "help"],
  [/\bindividuals\b/gi, "people"],
  [/\bobjective\b/gi, "goal"],
  [/\bsufficient\b/gi, "enough"],
  [/\bconsequently\b/gi, "so"],
  [/\bnevertheless\b/gi, "but"],
  [/\btherefore\b/gi, "so"],
  [/\bin order to\b/gi, "to"],
  [/\bprior to\b/gi, "before"],
  [/\bdemonstrate\b/gi, "show"],
  [/\bimpact\b/gi, "effect"],
  [/\bimplement\b/gi, "do"],
  [/\bregarding\b/gi, "about"],
];

function splitSentences(text: string): string[] {
  // Very lightweight sentence splitter.
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function wrapLines(text: string): string {
  // Keep paragraphs readable on mobile.
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .join("\n\n");
}

function simplifySentence(s: string, maxWords: number): string[] {
  // Remove parenthetical info and soften punctuation.
  let t = s.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();

  for (const [re, rep] of SIMPLE_REPLACEMENTS) t = t.replace(re, rep);

  // If still long, split on commas / semicolons.
  const parts = t
    .split(/[;:—–]/)
    .flatMap((x) => x.split(/,(?=\s)/))
    .map((x) => x.trim())
    .filter(Boolean);

  const out: string[] = [];
  for (const p of parts) {
    const words = p.split(/\s+/);
    if (words.length <= maxWords) {
      out.push(p);
    } else {
      // Chunk into shorter lines.
      for (let i = 0; i < words.length; i += maxWords) {
        out.push(words.slice(i, i + maxWords).join(" "));
      }
    }
  }

  return out;
}

export function rewriteByDifficulty(text: string, difficulty: Difficulty): string {
  const clean = wrapLines(text).trim();
  if (!clean) return "";

  if (difficulty === "original") return clean;

  const sentences = splitSentences(clean);

  if (difficulty === "intermediate") {
    // Intermediate: keep structure, mild simplification.
    const rewritten = sentences
      .map((s) => {
        let t = s.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
        // a small subset of replacements
        for (const [re, rep] of SIMPLE_REPLACEMENTS.slice(0, 7)) t = t.replace(re, rep);
        return t;
      })
      .join(" ");
    return wrapLines(rewritten);
  }

  // Simple: shorter sentences + more replacements.
  const simplifiedLines: string[] = [];
  for (const s of sentences) {
    simplifiedLines.push(...simplifySentence(s, 14));
  }

  // Make it friendlier for learners: add blank lines every ~4 sentences.
  const grouped: string[] = [];
  for (let i = 0; i < simplifiedLines.length; i++) {
    grouped.push(simplifiedLines[i] + (/[.!?]$/.test(simplifiedLines[i]) ? "" : "."));
    if ((i + 1) % 4 === 0) grouped.push("\n");
  }

  return wrapLines(grouped.join(" ").replace(/\s+\n\s+/g, "\n\n"));
}
