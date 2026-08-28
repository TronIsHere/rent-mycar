"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { AdZonePlane } from "@/components/car/AdZonePlane";
import { ZoneHotspot } from "@/components/car/ZoneHotspot";
import { getPermanentZoneTransform } from "@/lib/ad-zone-defaults";
import { prepareCarModel } from "@/lib/car-model-prep";
import { AD_ZONES } from "@/lib/zones";
import type { AdZoneWithTransform, ZoneWithBid } from "@/lib/types";

type CarSceneProps = {
  zones: ZoneWithBid[];
  selectedSlug: string | null;
  onSelectZone: (slug: string) => void;
};

export function CarScene({
  zones,
  selectedSlug,
  onSelectZone,
}: CarSceneProps) {
  const { scene } = useGLTF("/207.glb");

  const { model, adZones } = useMemo(() => {
    const preparedModel = prepareCarModel(scene);
    const resolvedZones = AD_ZONES.map((zone) => ({
      ...zone,
      ...getPermanentZoneTransform(zone.slug),
    })) satisfies AdZoneWithTransform[];
    return { model: preparedModel, adZones: resolvedZones };
  }, [scene]);

  const zoneMap = new Map(zones.map((zone) => [zone.slug, zone]));

  return (
    <>
      <primitive object={model} />
      {adZones.map((zone) => {
        const data = zoneMap.get(zone.slug);
        return (
          <AdZonePlane
            key={zone.slug}
            zone={zone}
            adImageUrl={data?.winningBid?.adImageUrl}
            selected={selectedSlug === zone.slug}
            onSelect={onSelectZone}
          />
        );
      })}
      {adZones.map((zone) => (
        <ZoneHotspot
          key={`hotspot-${zone.slug}`}
          zone={zone}
          active={selectedSlug === zone.slug}
        />
      ))}
    </>
  );
}

useGLTF.preload("/207.glb");
