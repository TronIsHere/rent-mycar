import { NextResponse } from "next/server";
import { getWinningBidForZone } from "@/lib/models/bid";
import { AD_ZONES } from "@/lib/zones";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const zones = await Promise.all(
      AD_ZONES.map(async (zone) => ({
        ...zone,
        winningBid: await getWinningBidForZone(zone.slug),
      })),
    );

    return NextResponse.json({ zones });
  } catch (error) {
    console.error("GET /api/zones error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات فضاهای تبلیغاتی" },
      { status: 500 },
    );
  }
}
