import { NextResponse } from "next/server";
import { setKeep } from "@/lib/vocab";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { word?: string; keep?: boolean };
  const word = typeof body.word === "string" ? body.word : "";
  if (!word) return NextResponse.json({ error: "bad request" }, { status: 400 });

  return NextResponse.json(setKeep(userId, word, !!body.keep));
}
