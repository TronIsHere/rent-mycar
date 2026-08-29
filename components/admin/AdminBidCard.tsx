"use client";

import { useEffect, useRef, useState } from "react";
import { PriceDisplay } from "@/components/PriceDisplay";

export type AdminBid = {
  _id: string;
  zoneSlug: string;
  zoneLabel: string;
  bidderName: string;
  phone: string;
  amount: number;
  adImageUrl: string;
  paymentScreenshotUrl?: string;
  paymentSubmittedAt?: string;
  status: "pending" | "approved" | "rejected";
  isWinning?: boolean;
  createdAt: string;
};

type AdminBidCardProps = {
  bid: AdminBid;
  actionId: string | null;
  onAction?: (id: string, status: "approved" | "rejected") => void;
  onEditAdImage?: (id: string, file: File) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  showActions?: boolean;
};

export function AdminBidCard({
  bid,
  actionId,
  onAction,
  onEditAdImage,
  onDelete,
  showActions = false,
}: AdminBidCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!newImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(newImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [newImage]);

  const cancelEdit = () => {
    setEditing(false);
    setNewImage(null);
    setEditError(null);
  };

  const handleSaveImage = async () => {
    if (!newImage || !onEditAdImage) return;
    setSaving(true);
    setEditError(null);
    try {
      await onEditAdImage(bid._id, newImage);
      cancelEdit();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "خطا در ذخیره تصویر");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    const confirmed = window.confirm(
      `آیا از حذف پیشنهاد «${bid.bidderName}» مطمئن هستید؟`,
    );
    if (!confirmed) return;
    await onDelete(bid._id);
  };

  const displayImageUrl = previewUrl ?? bid.adImageUrl;
  const isBusy = actionId === bid._id;

  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex gap-4">
        <div className="flex shrink-0 flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImageUrl}
            alt="تبلیغ"
            className="h-20 w-20 rounded-md border border-border bg-background object-contain p-1"
          />
          {!editing && (
            <div className="flex flex-col gap-1">
              <a
                href={bid.adImageUrl}
                download={`ad-${bid.bidderName}.webp`}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                دانلود
              </a>
              {onEditAdImage && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ویرایش تصویر
                </button>
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{bid.bidderName}</p>
            {bid.isWinning && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground">
                فعال
              </span>
            )}
            {showActions && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                در انتظار
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
            {bid.phone}
          </p>
          <p className="mt-2 text-sm">
            فضا: <span className="font-medium">{bid.zoneLabel}</span>
          </p>
          <p className="mt-1 text-sm">
            مبلغ:{" "}
            <PriceDisplay amount={bid.amount} className="font-medium" />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(bid.createdAt).toLocaleString("fa-IR")}
          </p>

          {bid.paymentScreenshotUrl ? (
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">رسید پرداخت</p>
                <a
                  href={bid.paymentScreenshotUrl}
                  download={`payment-${bid.bidderName}.webp`}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  دانلود رسید
                </a>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bid.paymentScreenshotUrl}
                alt="رسید پرداخت"
                className="h-28 w-full rounded-md border border-border bg-background object-contain"
              />
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              رسید پرداخت ارسال نشده
            </p>
          )}
        </div>
      </div>

      {editing && onEditAdImage && (
        <div className="mt-4 space-y-3 rounded-md border border-border bg-muted/50 p-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => setNewImage(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground"
          >
            {newImage ? newImage.name : "انتخاب تصویر جدید"}
          </button>
          {editError && (
            <p className="text-xs text-error-text">{editError}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!newImage || saving}
              onClick={() => void handleSaveImage()}
              className="admin-btn-primary flex-1"
            >
              {saving ? "در حال ذخیره..." : "ذخیره"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={cancelEdit}
              className="admin-btn-secondary flex-1"
            >
              انصراف
            </button>
          </div>
        </div>
      )}

      {showActions && onAction && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onAction(bid._id, "approved")}
            className="admin-btn-primary flex-1"
          >
            {isBusy ? "..." : "تأیید"}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onAction(bid._id, "rejected")}
            className="admin-btn-secondary flex-1"
          >
            رد
          </button>
        </div>
      )}

      {onDelete && !editing && (
        <button
          type="button"
          disabled={isBusy}
          onClick={() => void handleDelete()}
          className="admin-btn-danger mt-3 w-full"
        >
          {isBusy ? "در حال حذف..." : "حذف پیشنهاد"}
        </button>
      )}
    </article>
  );
}
