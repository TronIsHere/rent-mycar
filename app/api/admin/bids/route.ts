import { NextResponse } from "next/server";
import {
  unauthorizedResponse,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import {
  getBidsByStatus,
  getWinningBidForZone,
} from "@/lib/models/bid";
import type { BidDocument } from "@/lib/models/bid";
import { getZoneBySlug } from "@/lib/zones";

export const dynamic = "force-dynamic";

function serializeBid(bid: BidDocument, isWinning = false) {
  return {
    _id: bid._id.toString(),
    zoneSlug: bid.zoneSlug,
    zoneLabel: getZoneBySlug(bid.zoneSlug)?.label ?? bid.zoneSlug,
    bidderName: bid.bidderName,
    phone: bid.phone,
    amount: bid.amount,
    adImageUrl: bid.adImageUrl,
    paymentScreenshotUrl: bid.paymentScreenshotUrl,
    paymentSubmittedAt: bid.paymentSubmittedAt?.toISOString(),
    status: bid.status,
    isWinning,
    createdAt: bid.createdAt.toISOString(),
  };
}

export async function GET(request: Request) {
  if (!verifyAdminPassword(request)) {
    return unauthorizedResponse();
  }

  try {
    const [pending, approved] = await Promise.all([
      getBidsByStatus("pending"),
      getBidsByStatus("approved"),
    ]);

    const winningByZone = new Map(
      (
        await Promise.all(
          [...new Set(approved.map((bid) => bid.zoneSlug))].map(
            async (zoneSlug) => {
              const winning = await getWinningBidForZone(zoneSlug);
              return [zoneSlug, winning?._id] as const;
            },
          ),
        )
      ),
    );

    const serializedPending = pending.map((bid) => serializeBid(bid));
    const serializedApproved = approved.map((bid) =>
      serializeBid(bid, winningByZone.get(bid.zoneSlug) === bid._id.toString()),
    );

    return NextResponse.json({
      pending: serializedPending,
      approved: serializedApproved,
    });
  } catch (error) {
    console.error("GET /api/admin/bids error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت پیشنهادها" },
      { status: 500 },
    );
  }
}
