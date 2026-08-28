"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { prepareCarModel } from "@/lib/car-model-prep";

export function CarModel() {
  const { scene } = useGLTF("/207.glb");
  const model = useMemo(() => prepareCarModel(scene), [scene]);

  return <primitive object={model} />;
}

useGLTF.preload("/207.glb");
