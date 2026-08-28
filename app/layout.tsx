import type { Metadata } from "next";
import Script from "next/script";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "اجاره فضای تبلیغاتی | پژو ۲۰۷",
  description:
    "فضای تبلیغاتی روی خودرو پژو ۲۰۷ را اجاره کنید. بالاترین پیشنهاد برنده می‌شود.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
