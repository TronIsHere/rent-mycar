"use client";

import { useEffect, useRef, useState } from "react";
import { BluBankCard } from "@/components/BluBankCard";
import { PriceDisplay } from "@/components/PriceDisplay";
import { SocialLinks } from "@/components/SocialLinks";
import { StepIndicator } from "@/components/StepIndicator";
import { extractDigits, formatNumberDisplay, parseNumberInput } from "@/lib/format";
import type { ZoneWithBid } from "@/lib/types";

const BID_STEPS = [
  { id: "form", label: "اطلاعات" },
  { id: "payment", label: "پرداخت" },
  { id: "done", label: "تأیید" },
];

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

  const zoneSummary = (
    <div className="border-2 border-border bg-muted p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="label-kinetic text-muted-foreground">فضای انتخاب‌شده</p>
          <p className="mt-1 text-2xl font-bold md:text-3xl">{zone.label}</p>
        </div>
        <div className="text-left">
          <p className="label-kinetic text-muted-foreground">حداقل</p>
          <PriceDisplay
            amount={minRequired}
            className="mt-1 text-xl font-bold text-accent md:text-2xl"
          />
        </div>
      </div>
      <p className="mt-4 border-t-2 border-border pt-4 text-base leading-7 text-muted-foreground">
        تبلیغ شما تا زمانی که کسی پیشنهاد بالاتری ندهد و تأیید شود، روی خودرو
        می‌ماند.
      </p>
    </div>
  );

  const formContent = step === "form" ? (
    <form onSubmit={handleSubmit} className="space-y-8">
      {zoneSummary}

      <label className="block">
        <span className="label-kinetic mb-2 block text-muted-foreground">
          نام شما
        </span>
        <input
          type="text"
          value={bidderName}
          onChange={(e) => setBidderName(e.target.value)}
          className="input-kinetic input-kinetic-sm"
          placeholder="نام و نام خانوادگی"
        />
      </label>

      <label className="block">
        <span className="label-kinetic mb-2 block text-muted-foreground">
          شماره موبایل
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-kinetic input-kinetic-sm"
          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          dir="ltr"
        />
      </label>

      <label className="block">
        <span className="label-kinetic mb-2 block text-muted-foreground">
          مبلغ پیشنهادی
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={formatNumberDisplay(amount)}
          onChange={(e) => setAmount(extractDigits(e.target.value))}
          className="input-kinetic"
          placeholder={minRequired.toLocaleString("fa-IR")}
          dir="ltr"
        />
      </label>

      <div>
        <span className="label-kinetic mb-2 block text-muted-foreground">
          تصویر تبلیغ
        </span>
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
          className="btn-outline w-full border-dashed py-8"
        >
          {adImage ? adImage.name : "انتخاب فایل JPG، PNG یا WEBP"}
        </button>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="پیش‌نمایش تبلیغ"
            className="mt-4 h-40 w-full border-2 border-border bg-background object-contain p-2"
          />
        )}
      </div>

      {error && (
        <p className="border-2 border-error-text bg-error-bg px-4 py-3 text-sm text-error-text">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "در حال ارسال..." : "ثبت پیشنهاد"}
      </button>
    </form>
  ) : step === "payment" ? (
    <form onSubmit={handlePaymentSubmit} className="space-y-8">
      <div className="border-2 border-success bg-success-bg px-4 py-4 text-base font-bold text-success-text">
        پیشنهاد شما ثبت شد. مبلغ زیر را واریز کنید.
      </div>

      <div className="border-2 border-border bg-muted p-6 text-center">
        <p className="label-kinetic text-muted-foreground">مبلغ قابل پرداخت</p>
        <p className="mt-2 text-3xl font-bold text-accent md:text-4xl">
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
        <div className="space-y-3 border-2 border-error-text bg-error-bg px-4 py-4 text-sm text-error-text">
          <p>شماره کارت پرداخت تنظیم نشده است. با پشتیبانی تماس بگیرید.</p>
          <SocialLinks showHandles size="sm" />
        </div>
      )}

      <div className="border-2 border-border bg-muted px-4 py-4 text-center">
        <p className="label-kinetic text-muted-foreground">سوالی دارید؟</p>
        <SocialLinks className="mt-3 justify-center" showHandles size="sm" />
      </div>

      <div>
        <span className="label-kinetic mb-2 block text-muted-foreground">
          تصویر رسید پرداخت
        </span>
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
          className="btn-outline w-full border-dashed py-6"
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
            className="mt-4 h-48 w-full border-2 border-border bg-background object-contain"
          />
        )}
      </div>

      {error && (
        <p className="border-2 border-error-text bg-error-bg px-4 py-3 text-sm text-error-text">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={paymentLoading || !cardNumber}
        className="btn-primary w-full"
      >
        {paymentLoading ? "در حال ارسال..." : "ارسال رسید"}
      </button>
    </form>
  ) : (
    <div className="space-y-6 py-4 text-center">
      <p className="display-number text-accent" aria-hidden>
        ✓
      </p>
      <div>
        <p className="text-2xl font-bold md:text-3xl">رسید ثبت شد</p>
        <p className="mt-3 text-base leading-8 text-muted-foreground md:text-lg">
          پیشنهاد در انتظار تأیید مدیر است. پس از تأیید، تبلیغ روی خودرو نمایش
          داده می‌شود.
        </p>
      </div>
      <button type="button" onClick={onClose} className="btn-outline w-full">
        بستن
      </button>
    </div>
  );

  const header = (
    <div className="mb-8 space-y-6">
      <div className="flex items-start justify-between gap-4 border-b-2 border-border pb-4">
        <h2 className="display-section text-3xl">ثبت پیشنهاد</h2>
        {variant === "inline" && (
          <span className="label-kinetic border-2 border-accent bg-accent px-3 py-2 text-accent-foreground">
            {zone.label}
          </span>
        )}
      </div>
      <StepIndicator steps={BID_STEPS} currentStep={step} />
    </div>
  );

  if (variant === "inline") {
    return (
      <div ref={panelRef} className="kinetic-card scroll-mt-4 border-0 bg-card p-6">
        {header}
        {formContent}
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 animate-fade-in md:hidden"
        style={{ background: "var(--overlay)" }}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="sheet-panel fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col animate-slide-up md:hidden"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b-2 border-border p-5">
          <h2 className="display-section text-3xl">ثبت پیشنهاد</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-outline shrink-0"
            aria-label="بستن"
          >
            بستن
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]">
          <div className="mb-6">
            <StepIndicator steps={BID_STEPS} currentStep={step} />
          </div>
          {formContent}
        </div>
      </div>
    </>
  );
}
