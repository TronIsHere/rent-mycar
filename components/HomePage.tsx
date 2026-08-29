"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdInsights } from "@/components/AdInsights";
import { BidSheet } from "@/components/BidSheet";
import { BottomSheet } from "@/components/BottomSheet";
import { KineticMarquee } from "@/components/KineticMarquee";
import { SocialLinks } from "@/components/SocialLinks";
import { ZoneCard } from "@/components/ZoneCard";
import { CarModelLoadingOverlay } from "@/components/car/CarModelLoadingOverlay";
import { CarViewerShell } from "@/components/car/CarViewerShell";
import { preloadCarModel } from "@/lib/preload-car-model";
import type { ZoneWithBid } from "@/lib/types";

const CarViewer = dynamic(
  () => import("@/components/car/CarViewer").then((mod) => mod.CarViewer),
  {
    ssr: false,
    loading: () => (
      <CarViewerShell>
        <CarModelLoadingOverlay message="در حال آماده‌سازی نمایشگر..." />
      </CarViewerShell>
    ),
  },
);

function StatBlock({
  value,
  label,
  highlight,
  compact,
}: {
  value: string;
  label: string;
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`border-2 ${compact ? "p-3" : "p-4 md:p-6"} ${
        highlight
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-card"
      }`}
    >
      <p
        className={`font-bold leading-none ${
          compact ? "text-2xl" : "text-4xl md:text-5xl"
        } ${highlight ? "" : "text-foreground"}`}
      >
        {value}
      </p>
      <p
        className={`label-kinetic mt-2 ${
          highlight ? "text-black/70" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
    </div>
  );
}

export function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.08]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.35]);

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

  useEffect(() => {
    preloadCarModel();
  }, []);

  const selectedZone = zones.find((zone) => zone.slug === selectedSlug) ?? null;

  const occupiedCount = useMemo(
    () => zones.filter((zone) => zone.winningBid).length,
    [zones],
  );

  const availableCount = zones.length - occupiedCount;

  const handleSelectZone = (slug: string) => {
    setSelectedSlug(slug);
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    setSheetOpen(isMobile);
    setZonesSheetOpen(false);
  };

  const zoneList = loading
    ? Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="skeleton h-32" />
      ))
    : zones.map((zone) => (
        <ZoneCard
          key={zone.slug}
          zone={zone}
          selected={selectedSlug === zone.slug}
          onSelect={handleSelectZone}
        />
      ));

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[95vw] items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="min-w-0">
            <p className="label-kinetic text-accent">اجاره تبلیغ</p>
            <p className="truncate text-lg font-bold md:text-xl">پژو ۲۰۷</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setGuideSheetOpen(true)}
              className="btn-outline hidden md:inline-flex"
            >
              راهنما
            </button>
            <SocialLinks />
          </div>
        </div>
      </header>

      <KineticMarquee speed={55} />

      <section
        ref={heroRef}
        className="relative overflow-hidden border-b-2 border-border px-4 py-12 md:px-8 md:py-20"
      >
        <p
          className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 select-none text-[clamp(6rem,22vw,14rem)] font-bold leading-none text-muted opacity-40"
          aria-hidden
        >
          ۲۰۷
        </p>

        <motion.div style={{ scale: heroScale, opacity: heroOpacity }}>
          <p className="label-kinetic mb-4 text-accent">بازار تبلیغات</p>
          <h1 className="display-hero max-w-5xl">
            تبلیغ خود را
            <br />
            <span className="text-accent">روی خودروی من</span> بگذارید
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl lg:text-2xl">
            نقطه را روی مدل سه‌بعدی انتخاب کنید، پیشنهاد بالاتر بدهید و تصویر
            تبلیغ را آپلود کنید.
          </p>
        </motion.div>
      </section>

      <main className="mx-auto w-full max-w-[95vw] flex-1 px-4 py-8 pb-28 md:px-8 md:py-12 md:pb-12">
        {error && (
          <div className="mb-6 border-2 border-error-text bg-error-bg px-4 py-3 text-sm text-error-text">
            {error}
          </div>
        )}

        {!loading && (
          <div className="mb-8 grid grid-cols-3 gap-px border-2 border-border bg-border lg:hidden">
            <StatBlock
              value={zones.length.toLocaleString("fa-IR")}
              label="کل فضا"
            />
            <StatBlock
              value={availableCount.toLocaleString("fa-IR")}
              label="آزاد"
              highlight
            />
            <StatBlock
              value={occupiedCount.toLocaleString("fa-IR")}
              label="اجاره شده"
            />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.85fr_1fr] lg:gap-px lg:border-2 lg:border-border lg:bg-border">
          <section className="flex min-h-0 flex-col bg-background lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:p-4">
            <div className="relative flex min-h-[min(48dvh,380px)] flex-1 flex-col overflow-hidden border-2 border-border lg:min-h-0">
              <div
                className="viewer-grid pointer-events-none absolute inset-0 z-0"
                aria-hidden
              />
              <div className="relative z-10 min-h-0 flex-1">
                {!loading && zones.length === 0 ? (
                  <CarViewerShell className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground">اطلاعاتی یافت نشد</p>
                  </CarViewerShell>
                ) : (
                  <CarViewer
                    zones={zones}
                    selectedSlug={selectedSlug}
                    onSelectZone={handleSelectZone}
                  />
                )}
              </div>
              <p className="label-kinetic relative z-20 shrink-0 border-t border-border/60 px-4 py-2 text-muted-foreground lg:hidden">
                برای چرخاندن، انگشت را بکشید
              </p>
              <p className="label-kinetic relative z-20 hidden shrink-0 border-t border-border/60 px-4 py-2 text-muted-foreground lg:block">
                برای چرخاندن، ماوس را بکشید
              </p>
            </div>
          </section>

          <section className="flex min-h-0 flex-col bg-background lg:h-[calc(100vh-5rem)] lg:overflow-hidden lg:p-4">
            {!loading && (
              <div className="mb-4 hidden gap-px border-2 border-border bg-border lg:grid lg:grid-cols-3">
                <StatBlock
                  compact
                  value={zones.length.toLocaleString("fa-IR")}
                  label="کل فضا"
                />
                <StatBlock
                  compact
                  value={availableCount.toLocaleString("fa-IR")}
                  label="آزاد"
                  highlight
                />
                <StatBlock
                  compact
                  value={occupiedCount.toLocaleString("fa-IR")}
                  label="اجاره شده"
                />
              </div>
            )}

            <div className="mb-3 border-b-2 border-border pb-3">
              <h2 className="text-2xl font-bold leading-tight tracking-tight lg:text-xl">
                فضاها
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                یک نقطه انتخاب کنید
              </p>
            </div>

            <div className="space-y-px bg-border lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain">
              {zoneList}

              {selectedZone ? (
                <>
                  <div className="kinetic-card border-0 bg-card p-6 text-center lg:hidden">
                    <p className="label-kinetic text-accent">{selectedZone.label}</p>
                    <p className="mt-2 text-lg font-bold">فضا انتخاب شده</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      برای ثبت پیشنهاد، دکمه پایین صفحه را بزنید
                    </p>
                  </div>
                  <div className="hidden lg:block">
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
                  </div>
                </>
              ) : (
                <div className="kinetic-card border-0 bg-card p-12 text-center">
                  <p
                    className="display-number text-muted opacity-30"
                    aria-hidden
                  >
                    ?
                  </p>
                  <p className="mt-4 text-xl font-bold">فضایی انتخاب نشده</p>
                  <p className="mt-2 text-base text-muted-foreground">
                    از لیست یا روی خودرو یک نقطه را انتخاب کنید
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <KineticMarquee
        speed={40}
        direction="left"
        variant="inverse"
        className="hidden md:block"
      />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-background p-4 md:hidden">
        <button
          type="button"
          onClick={() => {
            if (selectedZone) {
              setSheetOpen(true);
            } else {
              setZonesSheetOpen(true);
            }
          }}
          className="btn-primary w-full"
        >
          {selectedZone ? (
            <>ثبت پیشنهاد: {selectedZone.label}</>
          ) : (
            <>
              انتخاب فضای تبلیغاتی
              {!loading && (
                <span className="border border-black/20 px-2 py-0.5 text-xs">
                  {zones.length.toLocaleString("fa-IR")}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      <BottomSheet
        open={zonesSheetOpen}
        onClose={() => setZonesSheetOpen(false)}
        title="فضاها"
        subtitle="یک نقطه را انتخاب کنید"
      >
        <div className="space-y-px bg-border">{zoneList}</div>
      </BottomSheet>

      <BottomSheet
        open={guideSheetOpen}
        onClose={() => setGuideSheetOpen(false)}
        title="راهنما"
        subtitle="قبل از ثبت پیشنهاد"
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

      <footer className="border-t-2 border-border px-8 py-8 text-center">
        <p className="label-kinetic text-muted-foreground">
          پس از ثبت پیشنهاد، پرداخت را انجام دهید تا توسط مدیر تأیید شود
        </p>
      </footer>
    </div>
  );
}
