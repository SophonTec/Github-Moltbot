import { NextResponse } from "next/server";
import { addWord } from "@/lib/vocab";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { word?: string; sourceUrl?: string };
  const word = typeof body.word === "string" ? body.word : "";

  try {
    const res = await addWord({ userId, word, sourceUrl: body.sourceUrl });
    return NextResponse.json(res);
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
