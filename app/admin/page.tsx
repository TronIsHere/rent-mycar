"use client";

import { useCallback, useEffect, useState } from "react";
import { PriceDisplay } from "@/components/PriceDisplay";
import { ThemeToggle } from "@/components/ThemeToggle";

type PendingBid = {
  _id: string;
  zoneSlug: string;
  zoneLabel: string;
  bidderName: string;
  phone: string;
  amount: number;
  adImageUrl: string;
  createdAt: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [bids, setBids] = useState<PendingBid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchBids = useCallback(async (adminPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/bids", {
        headers: { "x-admin-password": adminPassword },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "خطا در دریافت پیشنهادها");
      }
      setBids(data.bids);
      setAuthenticated(true);
      sessionStorage.setItem("adminPassword", adminPassword);
    } catch (err) {
      setAuthenticated(false);
      setError(err instanceof Error ? err.message : "خطا در ورود");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("adminPassword");
    if (saved) {
      setPassword(saved);
      fetchBids(saved);
    }
  }, [fetchBids]);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    fetchBids(password);
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
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "خطا در به‌روزرسانی");
      }
      setBids((current) => current.filter((bid) => bid._id !== id));
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
            <h1 className="text-2xl font-bold">پیشنهادهای در انتظار</h1>
            <p className="mt-1 text-sm text-muted">
              پس از دریافت پرداخت، پیشنهاد را تأیید کنید.
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

        {loading ? (
          <p className="text-sm text-muted">در حال بارگذاری...</p>
        ) : bids.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted">
            پیشنهاد در انتظار تأیید وجود ندارد.
          </div>
        ) : (
          <div className="space-y-4">
            {bids.map((bid) => (
              <article
                key={bid._id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bid.adImageUrl}
                    alt="تبلیغ"
                    className="h-24 w-24 shrink-0 rounded-xl border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{bid.bidderName}</p>
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
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    disabled={actionId === bid._id}
                    onClick={() => handleAction(bid._id, "approved")}
                    className="flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover disabled:opacity-60"
                  >
                    تأیید
                  </button>
                  <button
                    type="button"
                    disabled={actionId === bid._id}
                    onClick={() => handleAction(bid._id, "rejected")}
                    className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-background disabled:opacity-60"
                  >
                    رد
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
