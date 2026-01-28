import { NextResponse } from "next/server";
import { toggleFavorite } from "@/lib/favorites";
import { requireUserId } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { url?: string };
  const url = typeof body.url === "string" ? body.url : "";
  if (!url) return NextResponse.json({ error: "bad request" }, { status: 400 });

  return NextResponse.json(toggleFavorite(userId, url));
}
