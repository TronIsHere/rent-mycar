"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { CarModel } from "@/components/car/CarModel";
import { AdZonePlane } from "@/components/car/AdZonePlane";
import { ZoneHotspot } from "@/components/car/ZoneHotspot";
import { AD_ZONES } from "@/lib/zones";
import type { ZoneWithBid } from "@/lib/types";

type CarViewerProps = {
  zones: ZoneWithBid[];
  selectedSlug: string | null;
  onSelectZone: (slug: string) => void;
};

function SceneContent({
  zones,
  selectedSlug,
  onSelectZone,
}: CarViewerProps) {
  const zoneMap = new Map(zones.map((zone) => [zone.slug, zone]));

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} />
      <directionalLight position={[-4, 3, -2]} intensity={0.4} />
      <CarModel />
      {AD_ZONES.map((zone) => {
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
      {AD_ZONES.map((zone) => (
        <ZoneHotspot
          key={`hotspot-${zone.slug}`}
          zone={zone}
          active={selectedSlug === zone.slug}
        />
      ))}
      <OrbitControls
        enablePan={false}
        minDistance={2.8}
        maxDistance={7}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0.6, 0]}
      />
    </>
  );
}

export function CarViewer({
  zones,
  selectedSlug,
  onSelectZone,
}: CarViewerProps) {
  return (
    <div className="viewer-gradient h-full w-full touch-none overflow-hidden rounded-2xl">
      <Canvas
        camera={{ position: [3.5, 2.2, 4.5], fov: 42, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <SceneContent
            zones={zones}
            selectedSlug={selectedSlug}
            onSelectZone={onSelectZone}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
