import { ComponentPropsWithoutRef, CSSProperties, Ref } from "react";

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  repeat?: number;
  duration?: number;
  gap?: string;
  segmentRef?: Ref<HTMLDivElement>;
  children: React.ReactNode;
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  duration = 40,
  gap = "1rem",
  segmentRef,
  style,
  ...props
}: MarqueeProps) {
  const cssVars = {
    "--marquee-duration": `${duration}s`,
    "--marquee-segments": String(repeat),
    "--marquee-gap": gap,
    ...style,
  } as CSSProperties;

  return (
    <div
      {...props}
      dir="ltr"
      style={cssVars}
      className={joinClasses(
        "overflow-hidden p-2",
        pauseOnHover && "marquee-pause-on-hover",
        className,
      )}
    >
      <div
        className={joinClasses(
          "marquee-track flex w-max",
          vertical ? "marquee-track-vertical flex-col" : "flex-row",
          reverse && "marquee-track-reverse",
        )}
        style={{ gap: "var(--marquee-gap)" }}
      >
        {Array.from({ length: repeat }, (_, index) => (
          <div
            key={index}
            ref={index === 0 ? segmentRef : undefined}
            className={joinClasses(
              "flex shrink-0",
              vertical ? "flex-col" : "flex-row",
            )}
            style={{ gap: "var(--marquee-gap)" }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
