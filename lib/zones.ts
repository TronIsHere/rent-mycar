export type ZoneSlug =
  | "hood"
  | "roof"
  | "door-left"
  | "door-right"
  | "rear"
  | "side";

export type AdZoneConfig = {
  slug: ZoneSlug;
  label: string;
  minBid: number;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
};

export const AD_ZONES: AdZoneConfig[] = [
  {
    slug: "hood",
    label: "کاپوت",
    minBid: 500_000,
    position: [0, 0.85, 1.05],
    rotation: [-Math.PI / 2, 0, 0],
    size: [1.2, 0.7],
  },
  {
    slug: "roof",
    label: "سقف",
    minBid: 300_000,
    position: [0, 1.35, 0],
    rotation: [-Math.PI / 2, 0, 0],
    size: [1.4, 0.9],
  },
  {
    slug: "door-left",
    label: "در چپ",
    minBid: 400_000,
    position: [-0.95, 0.75, 0.1],
    rotation: [0, Math.PI / 2, 0],
    size: [0.9, 0.55],
  },
  {
    slug: "door-right",
    label: "در راست",
    minBid: 400_000,
    position: [0.95, 0.75, 0.1],
    rotation: [0, -Math.PI / 2, 0],
    size: [0.9, 0.55],
  },
  {
    slug: "rear",
    label: "سپر عقب",
    minBid: 350_000,
    position: [0, 0.55, -1.15],
    rotation: [0, Math.PI, 0],
    size: [1.1, 0.45],
  },
  {
    slug: "side",
    label: "بدنه کناری",
    minBid: 450_000,
    position: [-0.75, 0.65, -0.55],
    rotation: [0, Math.PI / 2, 0],
    size: [1.0, 0.5],
  },
];

export function getZoneBySlug(slug: string): AdZoneConfig | undefined {
  return AD_ZONES.find((zone) => zone.slug === slug);
}
