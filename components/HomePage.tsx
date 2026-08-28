"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { AdInsights } from "@/components/AdInsights";
import { BidSheet } from "@/components/BidSheet";
import { BottomSheet } from "@/components/BottomSheet";
import { SocialLinks } from "@/components/SocialLinks";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoneCard } from "@/components/ZoneCard";
import type { ZoneWithBid } from "@/lib/types";

const CarViewer = dynamic(
  () => import("@/components/car/CarViewer").then((mod) => mod.CarViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center rounded-2xl bg-surface-muted">
        <p className="text-sm text-muted">در حال بارگذاری خودرو...</p>
      </div>
    ),
  },
);

export function HomePage() {
  const [zones, setZones] = useState<ZoneWithBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [zonesSheetOpen, setZonesSheetOpen] = useState(false);
  const [guideSheetOpen, setGuideSheetOpen] = useState(false);

  const fetchZones = useCallback(async () => {
    try {
      const response = await fetch("/api/zones");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "خطا در دریافت اطلاعات");
      }
      setZones(data.zones);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const selectedZone = zones.find((zone) => zone.slug === selectedSlug) ?? null;

  const handleSelectZone = (slug: string) => {
    setSelectedSlug(slug);
    setSheetOpen(true);
    setZonesSheetOpen(false);
  };

  const zoneList = loading ? (
    Array.from({ length: 7 }).map((_, index) => (
      <div
        key={index}
        className="h-24 animate-pulse rounded-2xl bg-surface-muted sm:h-28"
      />
    ))
  ) : (
    zones.map((zone) => (
      <ZoneCard
        key={zone.slug}
        zone={zone}
        selected={selectedSlug === zone.slug}
        onSelect={handleSelectZone}
      />
    ))
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background lg:h-auto lg:min-h-screen lg:overflow-visible">
      <header className="shrink-0 border-b border-border bg-card px-4 py-4 sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-accent">
              اجاره فضای تبلیغاتی
            </p>
            <h1 className="mt-1 text-xl font-bold sm:text-3xl">
              تبلیغ خود را روی پژو ۲۰۷ بگذارید
            </h1>
            <p className="mt-1.5 hidden max-w-2xl text-sm leading-7 text-muted sm:block sm:text-base">
              یکی از نقاط خودرو را انتخاب کنید، پیشنهاد بالاتر بدهید و تصویر
              تبلیغتان را آپلود کنید. پس از تأیید پرداخت، تبلیغ شما روی خودرو
              نمایش داده می‌شود.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setGuideSheetOpen(true)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-accent hover:text-accent sm:text-sm"
            >
              راهنما
            </button>
            <SocialLinks />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 lg:py-8">
        {error && (
          <div className="mb-4 shrink-0 rounded-xl bg-error-bg px-4 py-3 text-sm text-error-text">
            {error}
          </div>
        )}

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start lg:gap-6">
          <section className="flex min-h-0 flex-1 flex-col space-y-3 lg:sticky lg:top-4 lg:block lg:flex-none lg:space-y-4">
            <div className="min-h-0 flex-1 lg:h-[min(68vh,580px)] lg:flex-none">
              {!loading && zones.length > 0 ? (
                <CarViewer
                  zones={zones}
                  selectedSlug={selectedSlug}
                  onSelectZone={handleSelectZone}
                />
              ) : (
                <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl bg-surface-muted">
                  <p className="text-sm text-muted">
                    {loading ? "در حال بارگذاری..." : "اطلاعاتی یافت نشد"}
                  </p>
                </div>
              )}
            </div>
            <p className="shrink-0 text-center text-xs text-muted lg:text-right">
              برای چرخاندن خودرو، انگشت خود را روی صفحه بکشید
            </p>
            <button
              type="button"
              onClick={() => setZonesSheetOpen(true)}
              className="w-full shrink-0 rounded-xl bg-accent px-4 py-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover lg:hidden"
            >
              فضاهای قابل اجاره
              {!loading && (
                <span className="mr-1.5 opacity-80">
                  ({zones.length.toLocaleString("fa-IR")})
                </span>
              )}
            </button>
          </section>

          <section className="hidden min-h-0 flex-col lg:flex lg:max-h-[calc(100dvh-2rem)] lg:overflow-hidden">
            <div className="mb-3 flex shrink-0 items-center justify-between">
              <h2 className="text-base font-bold sm:text-lg">
                فضاهای قابل اجاره
              </h2>
              <span className="text-xs text-muted sm:text-sm">
                {zones.length.toLocaleString("fa-IR")} نقطه
              </span>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-2 lg:pr-1">
              {zoneList}

              {selectedZone ? (
                <BidSheet
                  variant="inline"
                  zone={selectedZone}
                  open
                  onClose={() => {
                    setSelectedSlug(null);
                    setSheetOpen(false);
                  }}
                  onSuccess={fetchZones}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted">
                  یک فضای تبلیغاتی را از لیست یا روی خودرو انتخاب کنید
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <BottomSheet
        open={zonesSheetOpen}
        onClose={() => setZonesSheetOpen(false)}
        title="فضاهای قابل اجاره"
      >
        <div className="space-y-3">{zoneList}</div>
      </BottomSheet>

      <BottomSheet
        open={guideSheetOpen}
        onClose={() => setGuideSheetOpen(false)}
        title="راهنما"
      >
        <AdInsights embedded />
      </BottomSheet>

      {selectedZone && sheetOpen && (
        <BidSheet
          variant="sheet"
          zone={selectedZone}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onSuccess={fetchZones}
        />
      )}

      <footer className="hidden shrink-0 border-t border-border px-4 py-4 text-center text-xs text-muted sm:block">
        پس از ثبت پیشنهاد، پرداخت را انجام دهید تا توسط مدیر تأیید شود.
      </footer>
    </div>
  );
}
