"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { AdZoneConfig } from "@/lib/zones";

type ZoneHotspotProps = {
  zone: AdZoneConfig;
  active: boolean;
};

export function ZoneHotspot({ zone, active }: ZoneHotspotProps) {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    const scale = 1 + Math.sin(clock.elapsedTime * 4) * 0.15;
    ref.current.scale.setScalar(scale);
  });

  if (!active) return null;

  return (
    <mesh ref={ref} position={zone.position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color="#888888" transparent opacity={0.85} />
    </mesh>
  );
}
