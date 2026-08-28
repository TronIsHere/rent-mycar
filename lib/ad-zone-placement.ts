import type { AdZoneTransform } from "@/lib/compute-ad-zones";
import { PERMANENT_AD_ZONE_TRANSFORMS } from "@/lib/ad-zone-defaults";
import { AD_ZONES, type ZoneSlug } from "@/lib/zones";

export const AD_PLACEMENT_STORAGE_KEY = "rent-mycar-ad-placements-v2";

export type AdZonePlacements = Partial<Record<ZoneSlug, AdZoneTransform>>;

function roundExport(value: number) {
  return Number(value.toFixed(4));
}

export function resolveZoneTransform(
  override: AdZoneTransform | undefined,
  slug?: ZoneSlug,
): AdZoneTransform | null {
  if (override) return override;
  if (slug) return PERMANENT_AD_ZONE_TRANSFORMS[slug];
  return null;
}

export function getEffectivePlacements(
  placements: AdZonePlacements,
): Partial<Record<ZoneSlug, AdZoneTransform>> {
  const result: Partial<Record<ZoneSlug, AdZoneTransform>> = {};
  for (const zone of AD_ZONES) {
    const resolved = resolveZoneTransform(placements[zone.slug], zone.slug);
    if (resolved) result[zone.slug] = resolved;
  }
  return result;
}

export function formatTransformExport(slug: ZoneSlug, transform: AdZoneTransform) {
  const label = AD_ZONES.find((zone) => zone.slug === slug)?.label ?? slug;
  const position = transform.position.map(roundExport);
  const rotation = transform.rotation.map(roundExport);
  const size = transform.size.map(roundExport);

  return `${slug} (${label})
position: [${position.join(", ")}]
rotation: [${rotation.join(", ")}]
size: [${size.join(", ")}]`;
}

export function formatAllPlacementsExport(placements: AdZonePlacements) {
  const effective = getEffectivePlacements(placements);
  const blocks = AD_ZONES.flatMap((zone) => {
    const transform = effective[zone.slug];
    if (!transform) return [];
    const position = transform.position.map(roundExport);
    const rotation = transform.rotation.map(roundExport);
    const size = transform.size.map(roundExport);
    return [
      `  {
    slug: "${zone.slug}",
    label: "${zone.label}",
    position: [${position.join(", ")}],
    rotation: [${rotation.join(", ")}],
    size: [${size.join(", ")}],
  }`,
    ];
  });

  return `// Copy this block and send it to make placements permanent\n[\n${blocks.join(",\n")}\n]`;
}

export async function copyText(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function loadAdZonePlacements(): AdZonePlacements {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(AD_PLACEMENT_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AdZonePlacements;
  } catch {
    return {};
  }
}

export function saveAdZonePlacements(placements: AdZonePlacements) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AD_PLACEMENT_STORAGE_KEY, JSON.stringify(placements));
}

export function clearAdZonePlacements() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AD_PLACEMENT_STORAGE_KEY);
}
