import { NextResponse } from "next/server";
import { recordPageView } from "@/lib/models/page-view";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const path = typeof body.path === "string" ? body.path : "/";
    const sessionId =
      typeof body.sessionId === "string" ? body.sessionId : "unknown";
    const referrer =
      typeof body.referrer === "string" ? body.referrer : undefined;

    if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }

    await recordPageView({ path, sessionId, referrer });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/analytics/view error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
