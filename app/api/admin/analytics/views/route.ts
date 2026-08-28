import { NextResponse } from "next/server";
import {
  unauthorizedResponse,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { getPageViewAnalytics } from "@/lib/models/page-view";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!verifyAdminPassword(request)) {
    return unauthorizedResponse();
  }

  try {
    const analytics = await getPageViewAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("GET /api/admin/analytics/views error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت آمار بازدید" },
      { status: 500 },
    );
  }
}
