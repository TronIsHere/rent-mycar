import { NextResponse } from "next/server";
import {
  createBid,
  getHighestApprovedAmount,
} from "@/lib/models/bid";
import { getZoneBySlug } from "@/lib/zones";
import { saveAdImage } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const zoneSlug = String(formData.get("zoneSlug") ?? "");
    const bidderName = String(formData.get("bidderName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const amount = Number(formData.get("amount"));
    const adImage = formData.get("adImage");

    const zone = getZoneBySlug(zoneSlug);
    if (!zone) {
      return NextResponse.json(
        { error: "فضای تبلیغاتی نامعتبر است." },
        { status: 400 },
      );
    }

    if (!bidderName) {
      return NextResponse.json(
        { error: "نام خود را وارد کنید." },
        { status: 400 },
      );
    }

    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "مبلغ پیشنهادی نامعتبر است." },
        { status: 400 },
      );
    }

    const highestApproved = await getHighestApprovedAmount(zone.slug);
    const minRequired = Math.max(
      zone.minBid,
      highestApproved > 0 ? highestApproved + 1 : zone.minBid,
    );

    if (amount < minRequired) {
      return NextResponse.json(
        {
          error: `مبلغ باید حداقل ${minRequired.toLocaleString("fa-IR")} تومان باشد.`,
        },
        { status: 400 },
      );
    }

    if (!(adImage instanceof File) || adImage.size === 0) {
      return NextResponse.json(
        { error: "تصویر تبلیغ الزامی است." },
        { status: 400 },
      );
    }

    const adImageUrl = await saveAdImage(adImage);

    const bidId = await createBid({
      zoneSlug: zone.slug,
      bidderName,
      phone,
      amount,
      adImageUrl,
    });

    const cardNumber = process.env.PAYMENT_CARD_NUMBER ?? "";
    const cardHolder = process.env.PAYMENT_CARD_HOLDER ?? "";
    const cardBank = process.env.PAYMENT_CARD_BANK ?? "";

    return NextResponse.json(
      { id: bidId, status: "pending", amount, cardNumber, cardHolder, cardBank },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/bids error:", error);
    const message =
      error instanceof Error ? error.message : "خطا در ثبت پیشنهاد";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
