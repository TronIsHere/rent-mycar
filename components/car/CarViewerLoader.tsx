"use client";

import { useProgress } from "@react-three/drei";
import { CarModelLoadingOverlay } from "@/components/car/CarModelLoadingOverlay";

export function CarViewerLoader() {
  const { active, progress } = useProgress();

  if (!active) return null;

  return <CarModelLoadingOverlay progress={progress} />;
}
