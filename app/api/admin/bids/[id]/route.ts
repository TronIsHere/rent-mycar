import { NextResponse } from "next/server";
import {
  unauthorizedResponse,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import {
  getBidById,
  updateBidAdImage,
  updateBidStatus,
} from "@/lib/models/bid";
import type { BidStatus } from "@/lib/models/bid";
import { deleteMediaByUrl, saveAdImage } from "@/lib/upload";
import { resolveMediaUrl } from "@/lib/media-url";

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
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const bid = await getBidById(id);
      if (!bid) {
        return NextResponse.json(
          { error: "پیشنهاد یافت نشد." },
          { status: 404 },
        );
      }

      const formData = await request.formData();
      const adImage = formData.get("adImage");

      if (!(adImage instanceof File) || adImage.size === 0) {
        return NextResponse.json(
          { error: "تصویر تبلیغ الزامی است." },
          { status: 400 },
        );
      }

      const adImageUrl = await saveAdImage(adImage);
      await updateBidAdImage(id, adImageUrl);

      const oldUrl = bid.adImageUrl;
      if (oldUrl && oldUrl !== adImageUrl) {
        void deleteMediaByUrl(oldUrl).catch((error) => {
          console.error("Failed to delete old ad image:", error);
        });
      }

      return NextResponse.json({
        id,
        adImageUrl: resolveMediaUrl(adImageUrl),
      });
    }

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
    const message =
      error instanceof Error ? error.message : "خطا در به‌روزرسانی پیشنهاد";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
