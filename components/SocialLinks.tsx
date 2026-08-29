import { useId } from "react";
import { SOCIAL_LINKS } from "@/lib/socials";

type SocialLinksProps = {
  className?: string;
  showHandles?: boolean;
  size?: "sm" | "md";
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="#000000"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

function InstagramIcon({
  className,
  gradientId,
}: {
  className?: string;
  gradientId: string;
}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <defs>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      />
    </svg>
  );
}

function SocialIcon({
  socialId,
  className,
  gradientId,
}: {
  socialId: (typeof SOCIAL_LINKS)[number]["id"];
  className: string;
  gradientId: string;
}) {
  if (socialId === "instagram") {
    return <InstagramIcon className={className} gradientId={gradientId} />;
  }

  return <XIcon className={className} />;
}

function SocialLink({
  social,
  size,
  showHandle,
}: {
  social: (typeof SOCIAL_LINKS)[number];
  size: "sm" | "md";
  showHandle: boolean;
}) {
  const gradientId = useId();
  const buttonSize = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";

  const iconButton = (
    <span
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center border-2 transition-colors duration-200 hover:border-foreground ${buttonSize} ${
        social.id === "x"
          ? "border-white/20 bg-white hover:bg-white/90"
          : "border-border bg-card hover:bg-muted"
      }`}
    >
      <SocialIcon
        socialId={social.id}
        className={iconSize}
        gradientId={gradientId}
      />
    </span>
  );

  if (showHandle) {
    return (
      <a
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex cursor-pointer items-center gap-2 border-2 border-border bg-card px-3 py-2 text-xs font-bold transition-colors duration-200 hover:border-foreground hover:bg-muted"
        aria-label={`${social.label}: ${social.handle}`}
      >
        {iconButton}
        <span dir="ltr" className="font-bold">
          @{social.handle}
        </span>
      </a>
    );
  }

  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex cursor-pointer"
      aria-label={`${social.label}: ${social.handle}`}
      title={`@${social.handle}`}
    >
      {iconButton}
    </a>
  );
}

export function SocialLinks({
  className = "",
  showHandles = false,
  size = "md",
}: SocialLinksProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {SOCIAL_LINKS.map((social) => (
        <SocialLink
          key={social.id}
          social={social}
          size={size}
          showHandle={showHandles}
        />
      ))}
    </div>
  );
}
