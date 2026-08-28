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
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      />
    </svg>
  );
}

const ICONS = {
  x: XIcon,
  instagram: InstagramIcon,
} as const;

const BRAND_STYLES = {
  x: "bg-black text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200",
  instagram:
    "bg-linear-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white shadow-sm hover:brightness-110",
} as const;

function SocialLink({
  social,
  size,
  showHandle,
}: {
  social: (typeof SOCIAL_LINKS)[number];
  size: "sm" | "md";
  showHandle: boolean;
}) {
  const Icon = ICONS[social.id];
  const buttonSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";

  const iconButton = (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition ${buttonSize} ${BRAND_STYLES[social.id]}`}
    >
      <Icon className={iconSize} />
    </span>
  );

  if (showHandle) {
    return (
      <a
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-foreground transition hover:border-accent"
        aria-label={`${social.label}: ${social.handle}`}
      >
        {iconButton}
        <span dir="ltr" className="font-medium">
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
      className="inline-flex"
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
