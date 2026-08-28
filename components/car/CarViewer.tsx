"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { CarScene } from "@/components/car/CarScene";
import { CarViewerLoader } from "@/components/car/CarViewerLoader";
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
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 8, 5]} intensity={1.4} />
      <directionalLight position={[-4, 3, -2]} intensity={0.4} />
      <CarScene
        zones={zones}
        selectedSlug={selectedSlug}
        onSelectZone={onSelectZone}
      />
      <OrbitControls
        enablePan={false}
        minDistance={2.0}
        maxDistance={5}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
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
    <div className="viewer-gradient relative h-full w-full touch-none overflow-hidden rounded-2xl">
      <Canvas
        camera={{ position: [2.1, 1.3, 2.7], fov: 42, near: 0.1, far: 100 }}
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
      <CarViewerLoader />
    </div>
  );
}
