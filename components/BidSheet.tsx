"use client";

import { useEffect, useRef, useState } from "react";
import { BluBankCard } from "@/components/BluBankCard";
import { PriceDisplay } from "@/components/PriceDisplay";
import { SocialLinks } from "@/components/SocialLinks";
import { extractDigits, formatNumberDisplay, parseNumberInput } from "@/lib/format";
import type { ZoneWithBid } from "@/lib/types";

type BidSheetProps = {
  zone: ZoneWithBid | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  variant: "sheet" | "inline";
};

export function BidSheet({
  zone,
  open,
  onClose,
  onSuccess,
  variant,
}: BidSheetProps) {
  const [bidderName, setBidderName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [adImage, setAdImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "payment" | "done">("form");
  const [bidId, setBidId] = useState<string | null>(null);
  const [submittedAmount, setSubmittedAmount] = useState(0);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardBank, setCardBank] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [paymentPreviewUrl, setPaymentPreviewUrl] = useState<string | null>(
    null,
  );
  const [paymentLoading, setPaymentLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paymentFileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const minRequired = zone
    ? Math.max(
        zone.minBid,
        zone.winningBid?.amount ? zone.winningBid.amount + 1 : zone.minBid,
      )
    : 0;

  useEffect(() => {
    if (!open) {
      setBidderName("");
      setPhone("");
      setAmount("");
      setAdImage(null);
      setPreviewUrl(null);
      setError(null);
      setStep("form");
      setBidId(null);
      setSubmittedAmount(0);
      setCardNumber("");
      setCardHolder("");
      setCardBank("");
      setCopied(false);
      setPaymentScreenshot(null);
      setPaymentPreviewUrl(null);
    }
  }, [open, zone?.slug]);

  useEffect(() => {
    if (!paymentScreenshot) {
      setPaymentPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(paymentScreenshot);
    setPaymentPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [paymentScreenshot]);

  useEffect(() => {
    if (!adImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(adImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [adImage]);

  useEffect(() => {
    if (!open || variant !== "sheet") return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose, variant]);

  useEffect(() => {
    if (!open || variant !== "inline" || !panelRef.current) return;
    panelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [open, variant, zone?.slug]);

  if (!open || !zone) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsedAmount = parseNumberInput(amount);

    if (!bidderName.trim()) {
      setError("نام خود را وارد کنید.");
      return;
    }
    if (!/^09\d{9}$/.test(phone.trim())) {
      setError("شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹).");
      return;
    }
    if (!parsedAmount || parsedAmount < minRequired) {
      setError(
        `مبلغ باید حداقل ${minRequired.toLocaleString("fa-IR")} تومان باشد.`,
      );
      return;
    }
    if (!adImage) {
      setError("تصویر تبلیغ را انتخاب کنید.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("zoneSlug", zone.slug);
      formData.append("bidderName", bidderName.trim());
      formData.append("phone", phone.trim());
      formData.append("amount", String(parsedAmount));
      formData.append("adImage", adImage);

      const response = await fetch("/api/bids", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "خطا در ثبت پیشنهاد");
      }

      setBidId(data.id);
      setSubmittedAmount(parsedAmount);
      setCardNumber(data.cardNumber ?? "");
      setCardHolder(data.cardHolder ?? "");
      setCardBank(data.cardBank ?? "");
      setStep("payment");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت پیشنهاد");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!bidId) return;

    if (!paymentScreenshot) {
      setError("تصویر رسید پرداخت را انتخاب کنید.");
      return;
    }

    setPaymentLoading(true);
    try {
      const formData = new FormData();
      formData.append("phone", phone.trim());
      formData.append("screenshot", paymentScreenshot);

      const response = await fetch(`/api/bids/${bidId}/payment`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "خطا در ثبت رسید پرداخت");
      }

      setStep("done");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "خطا در ثبت رسید پرداخت",
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(extractDigits(cardNumber));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("کپی شماره کارت انجام نشد.");
    }
  };

  const formContent = step === "form" ? (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl bg-background p-3 text-sm">
        <p className="text-muted">فضای انتخاب‌شده</p>
        <p className="mt-1 font-semibold">{zone.label}</p>
        <p className="mt-2 text-muted">
          حداقل پیشنهاد:{" "}
          <PriceDisplay
            amount={minRequired}
            className="font-medium text-foreground"
          />
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">نام شما</span>
        <input
          type="text"
          value={bidderName}
          onChange={(e) => setBidderName(e.target.value)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="نام و نام خانوادگی"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">شماره موبایل</span>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          dir="ltr"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">مبلغ پیشنهادی (تومان)</span>
        <input
          type="text"
          inputMode="numeric"
          value={formatNumberDisplay(amount)}
          onChange={(e) => setAmount(extractDigits(e.target.value))}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder={minRequired.toLocaleString("fa-IR")}
          dir="ltr"
        />
      </label>

      <div className="space-y-1.5">
        <span className="text-sm font-medium">تصویر تبلیغ</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => setAdImage(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-6 text-sm text-muted transition hover:border-accent hover:text-accent"
        >
          {adImage ? adImage.name : "انتخاب فایل تصویر تبلیغ"}
        </button>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="پیش‌نمایش تبلیغ"
            className="mt-2 h-32 w-full rounded-xl border border-border bg-background object-contain"
          />
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error-text">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-accent px-4 py-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? "در حال ارسال..." : "ثبت پیشنهاد"}
      </button>
    </form>
  ) : step === "payment" ? (
    <form onSubmit={handlePaymentSubmit} className="space-y-4">
      <div className="rounded-xl bg-success-bg p-4 text-sm text-success-text">
        پیشنهاد شما ثبت شد. لطفاً مبلغ زیر را واریز کنید.
      </div>

      <div className="rounded-xl bg-background p-4 text-sm">
        <p className="text-muted">مبلغ قابل پرداخت</p>
        <p className="mt-1 text-xl font-bold">
          <PriceDisplay amount={submittedAmount} />
        </p>
      </div>

      {cardNumber ? (
        <div className="space-y-3">
          <p className="text-center text-sm text-muted">شماره کارت برای واریز</p>
          <BluBankCard
            cardNumber={cardNumber}
            cardHolder={cardHolder}
            bankName={cardBank}
            copied={copied}
            onCopy={handleCopyCard}
          />
        </div>
      ) : (
        <div className="space-y-3 rounded-xl bg-error-bg px-4 py-3 text-sm text-error-text">
          <p>شماره کارت پرداخت تنظیم نشده است. با پشتیبانی تماس بگیرید.</p>
          <SocialLinks showHandles size="sm" />
        </div>
      )}

      <div className="rounded-xl border border-border bg-background px-4 py-3 text-center text-sm">
        <p className="text-muted">سوالی دارید؟</p>
        <SocialLinks className="mt-2 justify-center" showHandles size="sm" />
      </div>

      <div className="space-y-1.5">
        <span className="text-sm font-medium">تصویر رسید پرداخت</span>
        <input
          ref={paymentFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) =>
            setPaymentScreenshot(e.target.files?.[0] ?? null)
          }
        />
        <button
          type="button"
          onClick={() => paymentFileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-6 text-sm text-muted transition hover:border-accent hover:text-accent"
        >
          {paymentScreenshot
            ? paymentScreenshot.name
            : "انتخاب فایل تصویر رسید"}
        </button>
        {paymentPreviewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={paymentPreviewUrl}
            alt="پیش‌نمایش رسید"
            className="mt-2 h-48 w-full rounded-xl border border-border object-contain bg-background"
          />
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-error-bg px-4 py-3 text-sm text-error-text">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={paymentLoading || !cardNumber}
        className="w-full rounded-xl bg-accent px-4 py-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60"
      >
        {paymentLoading ? "در حال ارسال..." : "ثبت"}
      </button>
    </form>
  ) : (
    <div className="space-y-4">
      <p className="rounded-xl bg-success-bg px-4 py-3 text-sm text-success-text">
        رسید پرداخت شما ثبت شد و پیشنهاد در انتظار تأیید مدیر است.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl border border-border px-4 py-3.5 text-sm font-semibold transition hover:bg-background"
      >
        بستن
      </button>
    </div>
  );

  if (variant === "inline") {
    return (
      <div
        ref={panelRef}
        className="rounded-2xl border border-border bg-card p-5 shadow-sm scroll-mt-4"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">ثبت پیشنهاد</h2>
          <span className="rounded-full bg-accent-muted px-3 py-1 text-xs font-medium text-accent">
            {zone.label}
          </span>
        </div>
        {formContent}
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 animate-fade-in"
        style={{ background: "var(--overlay)" }}
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-3xl bg-card shadow-2xl animate-slide-up">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold">ثبت پیشنهاد</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-background"
            aria-label="بستن"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {formContent}
        </div>
      </div>
    </>
  );
}
