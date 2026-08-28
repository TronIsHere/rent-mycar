import { NextResponse } from "next/server";
import {
  unauthorizedResponse,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { getBidById, updateBidStatus } from "@/lib/models/bid";
import type { BidStatus } from "@/lib/models/bid";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!verifyAdminPassword(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const status = body.status as BidStatus;

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { error: "وضعیت نامعتبر است." },
        { status: 400 },
      );
    }

    const bid = await getBidById(id);
    if (!bid) {
      return NextResponse.json(
        { error: "پیشنهاد یافت نشد." },
        { status: 404 },
      );
    }

    if (bid.status !== "pending") {
      return NextResponse.json(
        { error: "این پیشنهاد قبلاً بررسی شده است." },
        { status: 400 },
      );
    }

    await updateBidStatus(id, status);

    return NextResponse.json({ id, status });
  } catch (error) {
    console.error("PATCH /api/admin/bids/[id] error:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی پیشنهاد" },
      { status: 500 },
    );
  }
}
