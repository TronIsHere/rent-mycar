"use client";

import { useEffect, useRef, useState } from "react";
import { Marquee } from "@/components/Marquee";

export const PROMO_MARQUEE_ITEMS = [
  "چشم‌های بیشتری تبلیغ شما را می‌بینند",
  "خودروی شما، بیلبورد متحرک شما",
  "هر روز هزاران نگاه به برند شما",
  "تبلیغتان در خیابان زنده می‌ماند",
  "برندتان در حرکت است",
  "دیده شدن در سراسر شهر",
  "تبلیغ روی خودرو، تأثیر واقعی",
  "پیشنهاد بده، جایگاهت را بگیر",
  "ماشین حرکت می‌کند، برندتان دیده می‌شود",
  "فضای تبلیغ روی پژو ۲۰۷",
  "اجاره فضا، رشد دیده‌شدن",
  "حضور برند در مسیر روزانه مردم",
] as const;

type KineticMarqueeProps = {
  items?: readonly string[];
  speed?: number;
  variant?: "accent" | "inverse";
  direction?: "left" | "right";
  className?: string;
};

export function KineticMarquee({
  items = PROMO_MARQUEE_ITEMS,
  speed = 60,
  variant = "accent",
  direction = "right",
  className = "",
}: KineticMarqueeProps) {
  const segmentRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(40);

  useEffect(() => {
    const segment = segmentRef.current;
    if (!segment) return;

    const updateDuration = () => {
      const width = segment.offsetWidth;
      if (width > 0) {
        setDuration(width / speed);
      }
    };

    updateDuration();

    const resizeObserver = new ResizeObserver(updateDuration);
    resizeObserver.observe(segment);

    return () => resizeObserver.disconnect();
  }, [items, speed]);

  const bandClass =
    variant === "accent" ? "marquee-band" : "marquee-band-inverse";

  return (
    <div
      className={`marquee-motion overflow-hidden py-3 ${bandClass} ${className}`}
      aria-hidden
    >
      <Marquee
        className="p-0"
        duration={duration}
        gap="0"
        pauseOnHover
        reverse={direction === "left"}
        repeat={2}
        segmentRef={segmentRef}
      >
        {items.map((item) => (
          <span
            key={item}
            className="mx-6 flex shrink-0 items-center gap-6 text-sm font-bold tracking-wide md:text-base lg:text-lg"
          >
            <span>{item}</span>
            <span className="opacity-40">✦</span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
