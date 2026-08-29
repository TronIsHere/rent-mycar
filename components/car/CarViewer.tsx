"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { CarScene } from "@/components/car/CarScene";
import { CarViewerLoader } from "@/components/car/CarViewerLoader";
import { CarViewerShell } from "@/components/car/CarViewerShell";
import type { ZoneWithBid } from "@/lib/types";

type CarViewerProps = {
  zones: ZoneWithBid[];
  selectedSlug: string | null;
  onSelectZone: (slug: string) => void;
};

type SceneContentProps = CarViewerProps & {
  autoRotate: boolean;
  onInteraction: () => void;
  desktop: boolean;
};

const MOBILE_CAMERA = {
  position: [2.1, 1.3, 2.7] as [number, number, number],
  fov: 42,
  minDistance: 2.0,
  maxDistance: 5,
};

const DESKTOP_CAMERA = {
  position: [1.35, 0.85, 1.65] as [number, number, number],
  fov: 34,
  minDistance: 1.4,
  maxDistance: 3.5,
};

function useDesktopLayout() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return desktop;
}

function SceneContent({
  zones,
  selectedSlug,
  onSelectZone,
  autoRotate,
  onInteraction,
  desktop,
}: SceneContentProps) {
  const camera = desktop ? DESKTOP_CAMERA : MOBILE_CAMERA;

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} />
      <directionalLight position={[-4, 3, -2]} intensity={0.45} />
      <CarScene
        zones={zones}
        selectedSlug={selectedSlug}
        onSelectZone={onSelectZone}
      />
      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={0.6}
        enablePan={false}
        minDistance={camera.minDistance}
        maxDistance={camera.maxDistance}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
        onStart={onInteraction}
      />
    </>
  );
}

export function CarViewer({
  zones,
  selectedSlug,
  onSelectZone,
}: CarViewerProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const desktop = useDesktopLayout();
  const camera = desktop ? DESKTOP_CAMERA : MOBILE_CAMERA;

  const stopAutoRotate = () => setAutoRotate(false);

  return (
    <CarViewerShell
      className="absolute inset-0 touch-none overflow-hidden"
      onPointerDown={stopAutoRotate}
    >
      <Canvas
        camera={{
          position: camera.position,
          fov: camera.fov,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <SceneContent
            zones={zones}
            selectedSlug={selectedSlug}
            onSelectZone={onSelectZone}
            autoRotate={autoRotate}
            onInteraction={stopAutoRotate}
            desktop={desktop}
          />
        </Suspense>
      </Canvas>
      <CarViewerLoader />
    </CarViewerShell>
  );
}
