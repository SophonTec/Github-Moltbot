import { NextResponse } from "next/server";
import { autoAddNewWordsFromText } from "@/lib/vocab";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { text?: string; sourceUrl?: string };
  const text = typeof body.text === "string" ? body.text : "";
  if (!text) return NextResponse.json({ words: [] });

  const words = autoAddNewWordsFromText({ userId, text, sourceUrl: body.sourceUrl, max: 8 });
  return NextResponse.json({ words });
}
