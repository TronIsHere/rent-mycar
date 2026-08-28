export type ZoneSlug =
  | "hood"
  | "roof"
  | "door-left"
  | "door-right"
  | "door-rear-left"
  | "door-rear-right"
  | "rear";

export type AdZoneConfig = {
  slug: ZoneSlug;
  label: string;
  minBid: number;
};

export const AD_ZONES: AdZoneConfig[] = [
  {
    slug: "hood",
    label: "کاپوت",
    minBid: 500_000,
  },
  {
    slug: "roof",
    label: "سقف",
    minBid: 300_000,
  },
  {
    slug: "door-left",
    label: "در چپ",
    minBid: 400_000,
  },
  {
    slug: "door-right",
    label: "در راست",
    minBid: 400_000,
  },
  {
    slug: "door-rear-left",
    label: "در عقب چپ",
    minBid: 400_000,
  },
  {
    slug: "door-rear-right",
    label: "در عقب راست",
    minBid: 400_000,
  },
  {
    slug: "rear",
    label: "سپر عقب",
    minBid: 350_000,
  },
];

export function getZoneBySlug(slug: string): AdZoneConfig | undefined {
  return AD_ZONES.find((zone) => zone.slug === slug);
}
