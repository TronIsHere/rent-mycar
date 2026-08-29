"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminBidCard } from "@/components/admin/AdminBidCard";
import type { AdminBid } from "@/components/admin/AdminBidCard";
import { AdminStatBlock } from "@/components/admin/AdminStatBlock";
import { AdminViewsChart } from "@/components/admin/AdminViewsChart";
import { PriceDisplay } from "@/components/PriceDisplay";
import { getZoneBySlug } from "@/lib/zones";

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

function AdminSection({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {count !== undefined && (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {count.toLocaleString("fa-IR")}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
      {message}
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

  const fetchData = useCallback(
    async (adminPassword: string) => {
      setLoading(true);
      setError(null);
      try {
        const [bidsResponse, analyticsResponse] = await Promise.all([
          fetch("/api/admin/bids", { headers: adminHeaders(adminPassword) }),
          fetch("/api/admin/analytics", {
            headers: adminHeaders(adminPassword),
          }),
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
    },
    [fetchViewAnalytics],
  );

  useEffect(() => {
    const saved = sessionStorage.getItem("adminPassword");
    if (saved) {
      setPassword(saved);
      fetchData(saved);
    }
  }, [fetchData]);

  const refreshBidsAndAnalytics = async (adminPassword: string) => {
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
  };

  const getAdminPassword = () =>
    sessionStorage.getItem("adminPassword") ?? password;

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    fetchData(password);
  };

  const handleEditAdImage = async (id: string, file: File) => {
    const adminPassword = getAdminPassword();
    setError(null);

    const formData = new FormData();
    formData.append("adImage", file);

    const response = await fetch(`/api/admin/bids/${id}`, {
      method: "PATCH",
      headers: adminHeaders(adminPassword),
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "خطا در به‌روزرسانی تصویر");
    }

    await refreshBidsAndAnalytics(adminPassword);
  };

  const handleDelete = async (id: string) => {
    const adminPassword = getAdminPassword();
    setActionId(id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bids/${id}`, {
        method: "DELETE",
        headers: adminHeaders(adminPassword),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "خطا در حذف");
      }
      await refreshBidsAndAnalytics(adminPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در حذف");
    } finally {
      setActionId(null);
    }
  };

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    const adminPassword = getAdminPassword();
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
      await refreshBidsAndAnalytics(adminPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در به‌روزرسانی");
    } finally {
      setActionId(null);
    }
  };

  if (!authenticated) {
    return (
      <div className="admin-shell flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-lg border border-border bg-card p-6"
        >
          <h1 className="text-xl font-semibold">ورود مدیر</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            رمز عبور مدیر را وارد کنید.
          </p>

          <label className="mt-5 block space-y-1.5">
            <span className="text-sm font-medium">رمز عبور</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="mt-3 rounded-md bg-error-bg px-3 py-2 text-sm text-error-text">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary mt-5 w-full"
          >
            {loading ? "در حال بررسی..." : "ورود"}
          </button>

          <a
            href="/"
            className="admin-btn-secondary mt-3 flex w-full text-center"
          >
            بازگشت به سایت
          </a>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">پنل مدیریت</h1>
            <p className="text-sm text-muted-foreground">
              بررسی پیشنهادها و آمار
            </p>
          </div>
          <a href="/" className="admin-btn-secondary shrink-0">
            بازگشت
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {error && (
          <p className="mb-4 rounded-md bg-error-bg px-3 py-2 text-sm text-error-text">
            {error}
          </p>
        )}

        <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setActiveTab("bids")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === "bids"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            پیشنهادها
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("views");
              const adminPassword = getAdminPassword();
              if (!viewAnalytics && adminPassword) {
                void fetchViewAnalytics(adminPassword);
              }
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === "views"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            بازدید سایت
          </button>
        </div>

        {activeTab === "bids" && (
          <>
            {analytics && (
              <AdminSection title="آمار کلی">
                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminStatBlock
                    label="کل پیشنهادها"
                    value={analytics.totalBids.toLocaleString("fa-IR")}
                    sub={`${analytics.pendingCount.toLocaleString("fa-IR")} در انتظار`}
                  />
                  <AdminStatBlock
                    label="تأیید شده"
                    value={analytics.approvedCount.toLocaleString("fa-IR")}
                    sub={`${analytics.rejectedCount.toLocaleString("fa-IR")} رد شده`}
                  />
                  <AdminStatBlock
                    label="ارزش فعال"
                    value={
                      <PriceDisplay
                        amount={analytics.activeAdValue}
                        className="text-2xl font-semibold"
                      />
                    }
                    sub={`${analytics.zonesFilled.toLocaleString("fa-IR")} از ${analytics.totalZones.toLocaleString("fa-IR")} فضا`}
                  />
                  <AdminStatBlock
                    label="مجموع تأیید"
                    value={
                      <PriceDisplay
                        amount={analytics.totalApprovedValue}
                        className="text-2xl font-semibold"
                      />
                    }
                  />
                </div>

                {analytics.bidsByZone.length > 0 && (
                  <div className="mt-4 rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                      پیشنهاد به تفکیک فضا
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analytics.bidsByZone.map((item) => (
                        <span
                          key={item.zoneSlug}
                          className="rounded-md bg-muted px-2.5 py-1 text-xs"
                        >
                          {getZoneBySlug(item.zoneSlug)?.label ?? item.zoneSlug}:{" "}
                          {item.count.toLocaleString("fa-IR")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </AdminSection>
            )}

            <AdminSection title="در انتظار تأیید" count={pendingBids.length}>
              {loading ? (
                <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
              ) : pendingBids.length === 0 ? (
                <EmptyState message="پیشنهاد در انتظار تأیید وجود ندارد." />
              ) : (
                <div className="space-y-3">
                  {pendingBids.map((bid) => (
                    <AdminBidCard
                      key={bid._id}
                      bid={bid}
                      actionId={actionId}
                      onAction={handleAction}
                      onEditAdImage={handleEditAdImage}
                      onDelete={handleDelete}
                      showActions
                    />
                  ))}
                </div>
              )}
            </AdminSection>

            <AdminSection title="تأیید شده" count={approvedBids.length}>
              {loading ? (
                <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
              ) : approvedBids.length === 0 ? (
                <EmptyState message="هنوز پیشنهاد تأیید شده‌ای وجود ندارد." />
              ) : (
                <div className="space-y-3">
                  {approvedBids.map((bid) => (
                    <AdminBidCard
                      key={bid._id}
                      bid={bid}
                      actionId={actionId}
                      onEditAdImage={handleEditAdImage}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </AdminSection>
          </>
        )}

        {activeTab === "views" && (
          <AdminSection title="آمار بازدید">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                disabled={viewsLoading}
                onClick={() => {
                  const adminPassword = getAdminPassword();
                  if (adminPassword) void fetchViewAnalytics(adminPassword);
                }}
                className="admin-btn-secondary"
              >
                {viewsLoading ? "در حال بارگذاری..." : "به‌روزرسانی"}
              </button>
            </div>

            {viewsLoading && !viewAnalytics ? (
              <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
            ) : viewAnalytics ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminStatBlock
                    label="کل بازدیدها"
                    value={viewAnalytics.totalViews.toLocaleString("fa-IR")}
                    sub={`${viewAnalytics.viewsToday.toLocaleString("fa-IR")} امروز`}
                  />
                  <AdminStatBlock
                    label="۷ روز گذشته"
                    value={viewAnalytics.viewsLast7Days.toLocaleString("fa-IR")}
                    sub={`${viewAnalytics.uniqueSessionsLast7Days.toLocaleString("fa-IR")} یکتا`}
                  />
                  <AdminStatBlock
                    label="۳۰ روز گذشته"
                    value={viewAnalytics.viewsLast30Days.toLocaleString("fa-IR")}
                    sub={`${viewAnalytics.uniqueSessionsLast30Days.toLocaleString("fa-IR")} یکتا`}
                  />
                  <AdminStatBlock
                    label="بازدیدکنندگان امروز"
                    value={viewAnalytics.uniqueSessionsToday.toLocaleString(
                      "fa-IR",
                    )}
                    sub="بر اساس نشست مرورگر"
                  />
                </div>

                {viewAnalytics.viewsByDay.length > 0 && (
                  <div className="mt-6 rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                      بازدید روزانه (۳۰ روز گذشته)
                    </h3>
                    <AdminViewsChart data={viewAnalytics.viewsByDay} />
                  </div>
                )}

                {viewAnalytics.viewsByPath.length > 0 && (
                  <div className="mt-4 rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                      بازدید به تفکیک صفحه
                    </h3>
                    <div className="space-y-2">
                      {viewAnalytics.viewsByPath.map((item) => (
                        <div
                          key={item.path}
                          className="flex items-center justify-between gap-4 rounded-md bg-muted/50 px-3 py-2 text-sm"
                        >
                          <span dir="ltr" className="font-medium">
                            {item.path}
                          </span>
                          <span className="text-muted-foreground">
                            {item.views.toLocaleString("fa-IR")} بازدید
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewAnalytics.totalViews === 0 && (
                  <div className="mt-4">
                    <EmptyState message="هنوز بازدیدی ثبت نشده است." />
                  </div>
                )}
              </>
            ) : (
              <EmptyState message="آمار بازدید در دسترس نیست." />
            )}
          </AdminSection>
        )}
      </main>
    </div>
  );
}
