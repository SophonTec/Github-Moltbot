import { NextResponse } from "next/server";
import type { Difficulty } from "@/lib/types";
import { rewriteArticleHtml } from "@/lib/rewrite-html";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { html?: string; difficulty?: Difficulty };
    const html = typeof body.html === "string" ? body.html : "";
    const difficulty = body.difficulty ?? "original";

    if (!html.trim()) {
      return NextResponse.json({ html: "" }, { status: 200 });
    }

    if (!(["original", "intermediate", "simple"] as const).includes(difficulty)) {
      return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
    }

    const rewrittenHtml = rewriteArticleHtml(html, difficulty);
    return NextResponse.json({ html: rewrittenHtml }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
