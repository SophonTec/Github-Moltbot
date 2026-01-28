import { NextResponse } from "next/server";
import { refreshFeeds } from "@/lib/refresh";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const token = process.env.REFRESH_TOKEN;
  if (token) {
    const got = req.headers.get("x-refresh-token");
    if (got !== token) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const result = await refreshFeeds();
  return NextResponse.json({ ok: true, ...result });
}
