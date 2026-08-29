import type { Metadata } from "next";
import { NoiseTexture } from "@/components/NoiseTexture";
import { PageViewTracker } from "@/components/PageViewTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "اجاره فضای تبلیغاتی | پژو ۲۰۷",
  description:
    "فضای تبلیغاتی روی خودرو پژو ۲۰۷ را اجاره کنید. بالاترین پیشنهاد برنده می‌شود.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <body className="flex min-h-full flex-col antialiased">
        <NoiseTexture />
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
