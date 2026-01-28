import { NextResponse } from "next/server";
import { rewriteByDifficulty } from "@/lib/rewrite";
import type { Difficulty } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string; difficulty?: Difficulty };
    const text = typeof body.text === "string" ? body.text : "";
    const difficulty = body.difficulty ?? "original";

    if (!text.trim()) {
      return NextResponse.json({ text: "" }, { status: 200 });
    }

    if (!(["original", "intermediate", "simple"] as const).includes(difficulty)) {
      return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
    }

    const rewritten = rewriteByDifficulty(text, difficulty);
    return NextResponse.json({ text: rewritten }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
