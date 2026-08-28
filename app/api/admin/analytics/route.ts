import { NextResponse } from "next/server";
import {
  unauthorizedResponse,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { getBidAnalytics } from "@/lib/models/bid";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!verifyAdminPassword(request)) {
    return unauthorizedResponse();
  }

  try {
    const analytics = await getBidAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت آمار" },
      { status: 500 },
    );
  }
}
