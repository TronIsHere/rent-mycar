"use client";

import { useCallback, useEffect, useState } from "react";
import { PriceDisplay } from "@/components/PriceDisplay";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getZoneBySlug } from "@/lib/zones";

type AdminBid = {
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

type Analytics = {
  totalBids: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalApprovedValue: number;
  activeAdValue: number;
  zonesFilled: number;
  totalZones: number;
  bidsByZone: { zoneSlug: string; count: number }[];
};

type ViewAnalytics = {
  totalViews: number;
  viewsToday: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  uniqueSessionsToday: number;
  uniqueSessionsLast7Days: number;
  uniqueSessionsLast30Days: number;
  viewsByDay: { date: string; views: number; uniqueSessions: number }[];
  viewsByPath: { path: string; views: number }[];
};

type AdminTab = "bids" | "views";

function BidCard({
  bid,
  actionId,
  onAction,
  showActions = false,
}: {
  bid: AdminBid;
  actionId: string | null;
  onAction?: (id: string, status: "approved" | "rejected") => void;
  showActions?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bid.adImageUrl}
            alt="تبلیغ"
            className="h-24 w-24 rounded-xl border border-border object-cover"
          />
          <a
            href={bid.adImageUrl}
            download={`ad-${bid.bidderName}.webp`}
            className="text-xs font-medium text-accent hover:underline"
          >
            دانلود
          </a>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{bid.bidderName}</p>
            {bid.isWinning && (
              <span className="rounded-full bg-success-bg px-2 py-0.5 text-xs font-medium text-success-text">
                فعال
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted" dir="ltr">
            {bid.phone}
          </p>
          <p className="mt-2 text-sm">
            فضا: <span className="font-medium">{bid.zoneLabel}</span>
          </p>
          <p className="mt-1 text-sm">
            مبلغ:{" "}
            <PriceDisplay
              amount={bid.amount}
              className="font-semibold text-accent"
            />
          </p>
          <p className="mt-1 text-xs text-muted">
            {new Date(bid.createdAt).toLocaleString("fa-IR")}
          </p>
          {bid.paymentScreenshotUrl ? (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-success-text">
                  رسید پرداخت ثبت شده
                </p>
                <a
                  href={bid.paymentScreenshotUrl}
                  download={`payment-${bid.bidderName}.webp`}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  دانلود رسید
                </a>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bid.paymentScreenshotUrl}
                alt="رسید پرداخت"
                className="h-32 w-full rounded-xl border border-border object-contain bg-background"
              />
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted">رسید پرداخت ارسال نشده</p>
          )}
        </div>
      </div>
      {showActions && onAction && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={actionId === bid._id}
            onClick={() => onAction(bid._id, "approved")}
            className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover disabled:opacity-60"
          >
            تأیید
          </button>
          <button
            type="button"
            disabled={actionId === bid._id}
            onClick={() => onAction(bid._id, "rejected")}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-background disabled:opacity-60"
          >
            رد
          </button>
        </div>
      )}
    </article>
  );
}

function ViewsBarChart({
  data,
}: {
  data: { date: string; views: number; uniqueSessions: number }[];
}) {
  const maxViews = Math.max(...data.map((d) => d.views), 1);

  return (
    <div className="space-y-2">
      {data.map((day) => (
        <div key={day.date} className="flex items-center gap-3 text-sm">
          <span className="w-24 shrink-0 text-xs text-muted" dir="ltr">
            {day.date}
          </span>
          <div className="flex-1">
            <div className="h-6 overflow-hidden rounded-lg bg-background">
              <div
                className="flex h-full items-center rounded-lg bg-accent/80 px-2 text-xs font-medium text-accent-foreground"
                style={{ width: `${Math.max((day.views / maxViews) * 100, day.views > 0 ? 8 : 0)}%` }}
              >
                {day.views > 0 && day.views.toLocaleString("fa-IR")}
              </div>
            </div>
          </div>
          <span className="w-16 shrink-0 text-left text-xs text-muted">
            {day.uniqueSessions.toLocaleString("fa-IR")} بازدیدکننده
          </span>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("bids");
  const [pendingBids, setPendingBids] = useState<AdminBid[]>([]);
  const [approvedBids, setApprovedBids] = useState<AdminBid[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [viewAnalytics, setViewAnalytics] = useState<ViewAnalytics | null>(null);
  const [viewsLoading, setViewsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const adminHeaders = (adminPassword: string) => ({
    "x-admin-password": adminPassword,
  });

  const fetchViewAnalytics = useCallback(async (adminPassword: string) => {
    setViewsLoading(true);
    try {
      const response = await fetch("/api/admin/analytics/views", {
        headers: adminHeaders(adminPassword),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "خطا در دریافت آمار بازدید");
      }
      setViewAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت آمار بازدید");
    } finally {
      setViewsLoading(false);
    }
  }, []);

  const fetchData = useCallback(async (adminPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const [bidsResponse, analyticsResponse] = await Promise.all([
        fetch("/api/admin/bids", { headers: adminHeaders(adminPassword) }),
        fetch("/api/admin/analytics", { headers: adminHeaders(adminPassword) }),
      ]);

      const bidsData = await bidsResponse.json();
      const analyticsData = await analyticsResponse.json();

      if (!bidsResponse.ok) {
        throw new Error(bidsData.error ?? "خطا در دریافت پیشنهادها");
      }
      if (!analyticsResponse.ok) {
        throw new Error(analyticsData.error ?? "خطا در دریافت آمار");
      }

      setPendingBids(bidsData.pending);
      setApprovedBids(bidsData.approved);
      setAnalytics(analyticsData);
      setAuthenticated(true);
      sessionStorage.setItem("adminPassword", adminPassword);
      void fetchViewAnalytics(adminPassword);
    } catch (err) {
      setAuthenticated(false);
      setError(err instanceof Error ? err.message : "خطا در ورود");
    } finally {
      setLoading(false);
    }
  }, [fetchViewAnalytics]);

  useEffect(() => {
    const saved = sessionStorage.getItem("adminPassword");
    if (saved) {
      setPassword(saved);
      fetchData(saved);
    }
  }, [fetchData]);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    fetchData(password);
  };

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    const adminPassword = sessionStorage.getItem("adminPassword") ?? password;
    setActionId(id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bids/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders(adminPassword),
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "خطا در به‌روزرسانی");
      }

      const [bidsResponse, analyticsResponse] = await Promise.all([
        fetch("/api/admin/bids", { headers: adminHeaders(adminPassword) }),
        fetch("/api/admin/analytics", { headers: adminHeaders(adminPassword) }),
      ]);

      if (bidsResponse.ok) {
        const bidsData = await bidsResponse.json();
        setPendingBids(bidsData.pending);
        setApprovedBids(bidsData.approved);
      }
      if (analyticsResponse.ok) {
        setAnalytics(await analyticsResponse.json());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در به‌روزرسانی");
    } finally {
      setActionId(null);
    }
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-background px-4 py-6">
        <div className="mx-auto flex w-full max-w-md justify-end">
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <h1 className="text-xl font-bold">ورود مدیر</h1>
            <p className="mt-2 text-sm text-muted">
              برای بررسی پیشنهادها رمز عبور مدیر را وارد کنید.
            </p>
            <label className="mt-5 block space-y-1.5">
              <span className="text-sm font-medium">رمز عبور</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            {error && (
              <p className="mt-3 text-sm text-error-text">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-hover disabled:opacity-60"
            >
              {loading ? "در حال بررسی..." : "ورود"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">پنل مدیریت</h1>
            <p className="mt-1 text-sm text-muted">
              بررسی پیشنهادها و مشاهده آمار
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="/"
              className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-card"
            >
              بازگشت
            </a>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-error-bg px-4 py-3 text-sm text-error-text">
            {error}
          </p>
        )}

        <div className="mb-6 flex gap-2 rounded-2xl border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setActiveTab("bids")}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "bids"
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            پیشنهادها
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("views");
              const adminPassword =
                sessionStorage.getItem("adminPassword") ?? password;
              if (!viewAnalytics && adminPassword) {
                void fetchViewAnalytics(adminPassword);
              }
            }}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "views"
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            بازدید سایت
          </button>
        </div>

        {activeTab === "bids" && (
          <>
        {analytics && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold">آمار کلی</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="کل پیشنهادها"
                value={analytics.totalBids.toLocaleString("fa-IR")}
                sub={`${analytics.pendingCount.toLocaleString("fa-IR")} در انتظار`}
              />
              <StatCard
                label="تأیید شده"
                value={analytics.approvedCount.toLocaleString("fa-IR")}
                sub={`${analytics.rejectedCount.toLocaleString("fa-IR")} رد شده`}
              />
              <StatCard
                label="ارزش تبلیغات فعال"
                value={
                  <PriceDisplay
                    amount={analytics.activeAdValue}
                    className="text-2xl font-bold"
                  />
                }
                sub={`${analytics.zonesFilled.toLocaleString("fa-IR")} از ${analytics.totalZones.toLocaleString("fa-IR")} فضا`}
              />
              <StatCard
                label="مجموع تأیید شده"
                value={
                  <PriceDisplay
                    amount={analytics.totalApprovedValue}
                    className="text-2xl font-bold"
                  />
                }
              />
            </div>

            {analytics.bidsByZone.length > 0 && (
              <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold">پیشنهاد به تفکیک فضا</h3>
                <div className="flex flex-wrap gap-2">
                  {analytics.bidsByZone.map((item) => (
                    <span
                      key={item.zoneSlug}
                      className="rounded-full border border-border px-3 py-1 text-xs"
                    >
                      {getZoneBySlug(item.zoneSlug)?.label ?? item.zoneSlug}:{" "}
                      {item.count.toLocaleString("fa-IR")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">
            در انتظار تأیید
            {pendingBids.length > 0 && (
              <span className="mr-2 text-sm font-normal text-muted">
                ({pendingBids.length.toLocaleString("fa-IR")})
              </span>
            )}
          </h2>
          {loading ? (
            <p className="text-sm text-muted">در حال بارگذاری...</p>
          ) : pendingBids.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
              پیشنهاد در انتظار تأیید وجود ندارد.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBids.map((bid) => (
                <BidCard
                  key={bid._id}
                  bid={bid}
                  actionId={actionId}
                  onAction={handleAction}
                  showActions
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">
            تأیید شده
            {approvedBids.length > 0 && (
              <span className="mr-2 text-sm font-normal text-muted">
                ({approvedBids.length.toLocaleString("fa-IR")})
              </span>
            )}
          </h2>
          {loading ? (
            <p className="text-sm text-muted">در حال بارگذاری...</p>
          ) : approvedBids.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
              هنوز پیشنهاد تأیید شده‌ای وجود ندارد.
            </div>
          ) : (
            <div className="space-y-4">
              {approvedBids.map((bid) => (
                <BidCard key={bid._id} bid={bid} actionId={actionId} />
              ))}
            </div>
          )}
        </section>
          </>
        )}

        {activeTab === "views" && (
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">آمار بازدید سایت</h2>
              <button
                type="button"
                disabled={viewsLoading}
                onClick={() => {
                  const adminPassword =
                    sessionStorage.getItem("adminPassword") ?? password;
                  if (adminPassword) void fetchViewAnalytics(adminPassword);
                }}
                className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-card disabled:opacity-60"
              >
                {viewsLoading ? "در حال بارگذاری..." : "به‌روزرسانی"}
              </button>
            </div>

            {viewsLoading && !viewAnalytics ? (
              <p className="text-sm text-muted">در حال بارگذاری...</p>
            ) : viewAnalytics ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="کل بازدیدها"
                    value={viewAnalytics.totalViews.toLocaleString("fa-IR")}
                    sub={`${viewAnalytics.viewsToday.toLocaleString("fa-IR")} امروز`}
                  />
                  <StatCard
                    label="۷ روز گذشته"
                    value={viewAnalytics.viewsLast7Days.toLocaleString("fa-IR")}
                    sub={`${viewAnalytics.uniqueSessionsLast7Days.toLocaleString("fa-IR")} بازدیدکننده یکتا`}
                  />
                  <StatCard
                    label="۳۰ روز گذشته"
                    value={viewAnalytics.viewsLast30Days.toLocaleString("fa-IR")}
                    sub={`${viewAnalytics.uniqueSessionsLast30Days.toLocaleString("fa-IR")} بازدیدکننده یکتا`}
                  />
                  <StatCard
                    label="بازدیدکنندگان امروز"
                    value={viewAnalytics.uniqueSessionsToday.toLocaleString("fa-IR")}
                    sub="بر اساس نشست مرورگر"
                  />
                </div>

                {viewAnalytics.viewsByDay.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold">
                      بازدید روزانه (۳۰ روز گذشته)
                    </h3>
                    <ViewsBarChart data={viewAnalytics.viewsByDay} />
                  </div>
                )}

                {viewAnalytics.viewsByPath.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold">بازدید به تفکیک صفحه</h3>
                    <div className="space-y-2">
                      {viewAnalytics.viewsByPath.map((item) => (
                        <div
                          key={item.path}
                          className="flex items-center justify-between gap-4 rounded-xl border border-border px-3 py-2 text-sm"
                        >
                          <span dir="ltr" className="font-medium">
                            {item.path}
                          </span>
                          <span className="text-muted">
                            {item.views.toLocaleString("fa-IR")} بازدید
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewAnalytics.totalViews === 0 && (
                  <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
                    هنوز بازدیدی ثبت نشده است. با بازدید از صفحه اصلی سایت، آمار اینجا نمایش داده می‌شود.
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
                آمار بازدید در دسترس نیست.
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
