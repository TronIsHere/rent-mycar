import { NextResponse } from "next/server";
import {
  unauthorizedResponse,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { getPendingBids } from "@/lib/models/bid";
import { getZoneBySlug } from "@/lib/zones";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!verifyAdminPassword(request)) {
    return unauthorizedResponse();
  }

  try {
    const bids = await getPendingBids();
    const serialized = bids.map((bid) => ({
      _id: bid._id.toString(),
      zoneSlug: bid.zoneSlug,
      zoneLabel: getZoneBySlug(bid.zoneSlug)?.label ?? bid.zoneSlug,
      bidderName: bid.bidderName,
      phone: bid.phone,
      amount: bid.amount,
      adImageUrl: bid.adImageUrl,
      status: bid.status,
      createdAt: bid.createdAt.toISOString(),
    }));

    return NextResponse.json({ bids: serialized });
  } catch (error) {
    console.error("GET /api/admin/bids error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت پیشنهادها" },
      { status: 500 },
    );
  }
}
