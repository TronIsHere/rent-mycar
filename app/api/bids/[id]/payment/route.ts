import { NextResponse } from "next/server";
import { getBidById, submitPaymentProof } from "@/lib/models/bid";
import { savePaymentScreenshot } from "@/lib/upload";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const phone = String(formData.get("phone") ?? "").trim();
    const screenshot = formData.get("screenshot");

    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست." },
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

    if (bid.phone !== phone) {
      return NextResponse.json(
        { error: "شماره موبایل با پیشنهاد ثبت‌شده مطابقت ندارد." },
        { status: 403 },
      );
    }

    if (bid.status !== "pending") {
      return NextResponse.json(
        { error: "این پیشنهاد دیگر قابل پرداخت نیست." },
        { status: 400 },
      );
    }

    if (bid.paymentScreenshotUrl) {
      return NextResponse.json(
        { error: "رسید پرداخت قبلاً ثبت شده است." },
        { status: 400 },
      );
    }

    if (!(screenshot instanceof File) || screenshot.size === 0) {
      return NextResponse.json(
        { error: "تصویر رسید پرداخت الزامی است." },
        { status: 400 },
      );
    }

    const paymentScreenshotUrl = await savePaymentScreenshot(screenshot);
    const updated = await submitPaymentProof(id, phone, paymentScreenshotUrl);

    if (!updated) {
      return NextResponse.json(
        { error: "خطا در ثبت رسید پرداخت." },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/bids/[id]/payment error:", error);
    const message =
      error instanceof Error ? error.message : "خطا در ثبت رسید پرداخت";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
