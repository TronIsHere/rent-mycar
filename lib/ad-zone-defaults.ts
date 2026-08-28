import type { AdZoneTransform } from "@/lib/compute-ad-zones";
import type { ZoneSlug } from "@/lib/zones";

const DOOR_LEFT: AdZoneTransform = {
  position: [0.496, -0.076, 0.156],
  rotation: [0, Math.PI / 2, 0],
  size: [0.36, 0.16],
};

const DOOR_REAR_LEFT: AdZoneTransform = {
  position: [0.496, -0.078, -0.354],
  rotation: [0, Math.PI / 2, 0],
  size: [0.29, 0.16],
};

function mirrorDoorRight(left: AdZoneTransform): AdZoneTransform {
  return {
    position: [-left.position[0], left.position[1], left.position[2]],
    rotation: [left.rotation[0], -left.rotation[1], left.rotation[2]],
    size: [left.size[0], left.size[1]],
  };
}

/** Permanent ad placements tuned on the 207 model. */
export const PERMANENT_AD_ZONE_TRANSFORMS: Record<ZoneSlug, AdZoneTransform> = {
  hood: {
    position: [0.0022, 0.1334, 0.7197],
    rotation: [-1.3788, 0, 0],
    size: [0.3826, 0.2154],
  },
  roof: {
    position: [0.0006, 0.393, -0.3027],
    rotation: [-Math.PI / 2, 0, 0],
    size: [0.3035, 0.3751],
  },
  "door-left": DOOR_LEFT,
  "door-right": mirrorDoorRight(DOOR_LEFT),
  "door-rear-left": DOOR_REAR_LEFT,
  "door-rear-right": mirrorDoorRight(DOOR_REAR_LEFT),
  rear: {
    position: [-0.019, 0.107, -1.04],
    rotation: [0.6458, Math.PI, 0],
    size: [0.4349, 0.0789],
  },
};

export function getPermanentZoneTransform(slug: ZoneSlug): AdZoneTransform {
  return PERMANENT_AD_ZONE_TRANSFORMS[slug];
}
