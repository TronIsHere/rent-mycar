"use client";

import { useMemo } from "react";
import { useGLTF, Center } from "@react-three/drei";
import { Box3, Color, DoubleSide, Material, Mesh, Object3D, Vector3 } from "three";

const BODY_PAINT = new Color("#0d0d0d");
const WINDOW_GLASS = new Color("#3b82d9");
const HEADLIGHT = new Color("#ffb347");
const TAILLIGHT = new Color("#e81919");

function getMeshContext(mesh: Mesh) {
  const names: string[] = [];
  let current: Object3D | null = mesh;

  while (current) {
    if (current.name) names.push(current.name.toLowerCase());
    current = current.parent;
  }

  return names.join(" ");
}

function cloneMeshMaterials(mesh: Mesh) {
  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map((material) => material.clone());
    return;
  }

  mesh.material = mesh.material.clone();
}

function setColor(material: Material, color: Color) {
  if ("color" in material && material.color instanceof Color) {
    material.color.copy(color);
  }
}

function setEmissive(material: Material, color: Color, intensity = 0.6) {
  if ("emissive" in material && material.emissive instanceof Color) {
    material.emissive.copy(color);
  }
  if ("emissiveIntensity" in material && typeof material.emissiveIntensity === "number") {
    material.emissiveIntensity = intensity;
  }
}

function setPbr(
  material: Material,
  {
    metalness,
    roughness,
  }: {
    metalness?: number;
    roughness?: number;
  },
) {
  if ("metalness" in material && typeof material.metalness === "number" && metalness !== undefined) {
    material.metalness = metalness;
  }
  if ("roughness" in material && typeof material.roughness === "number" && roughness !== undefined) {
    material.roughness = roughness;
  }
}

function setTransparent(
  material: Material,
  opacity = 0.45,
  depthWrite = false,
) {
  material.transparent = true;
  material.opacity = opacity;
  material.depthWrite = depthWrite;
}

function applyWindowGlass(material: Material) {
  setColor(material, WINDOW_GLASS);
  setTransparent(material, 0.68);
  setPbr(material, { metalness: 0.08, roughness: 0.18 });
  material.side = DoubleSide;
}

function applyHeadlight(material: Material) {
  setColor(material, HEADLIGHT);
  setEmissive(material, HEADLIGHT, 0.9);
  setTransparent(material, 0.72);
  setPbr(material, { metalness: 0.05, roughness: 0.3 });
}

function applyHeadlightLens(material: Material) {
  setColor(material, HEADLIGHT);
  setEmissive(material, HEADLIGHT, 0.35);
  setTransparent(material, 0.5);
  setPbr(material, { metalness: 0.1, roughness: 0.15 });
}

function applyTaillight(material: Material) {
  setColor(material, TAILLIGHT);
  setEmissive(material, TAILLIGHT, 1);
  setTransparent(material, 0.78);
  setPbr(material, { metalness: 0.05, roughness: 0.35 });
}

function applyTaillightLens(material: Material) {
  setColor(material, TAILLIGHT);
  setEmissive(material, TAILLIGHT, 0.55);
  setTransparent(material, 0.65);
  setPbr(material, { metalness: 0.1, roughness: 0.25 });
}

function applyClearGlass(material: Material) {
  setColor(material, new Color("#ffffff"));
  if ("emissive" in material && material.emissive instanceof Color) {
    material.emissive.set("#000000");
  }
  if ("emissiveIntensity" in material && typeof material.emissiveIntensity === "number") {
    material.emissiveIntensity = 0;
  }
  setTransparent(material, 0.35);
  setPbr(material, { metalness: 0.1, roughness: 0.15 });
  material.side = DoubleSide;
}

function applyBodyPaint(material: Material) {
  if (material.name !== "body") return;

  setColor(material, BODY_PAINT);
  setPbr(material, { metalness: 0.45, roughness: 0.22 });
}

function applyMeshMaterialStyle(mesh: Mesh, material: Material) {
  const context = getMeshContext(mesh);
  let isTransparentPart = false;

  applyBodyPaint(material);

  if (material.name === "G_Black 0" && context.includes("roof_panorama")) {
    applyWindowGlass(material);
    isTransparentPart = true;
  } else if (material.name === "long" || material.name === "fog") {
    applyHeadlight(material);
    isTransparentPart = true;
  } else if (
    material.name === "rr" ||
    material.name === "rev" ||
    material.name === "rrrrf" ||
    material.name === "ree"
  ) {
    applyTaillight(material);
    isTransparentPart = true;
  } else if (
    (material.name === "povll" || material.name === "povrr") &&
    context.includes("headlightframe")
  ) {
    applyHeadlight(material);
    isTransparentPart = true;
  } else if (
    (material.name === "povll" || material.name === "povrr") &&
    context.includes("taillightframe")
  ) {
    applyTaillight(material);
    isTransparentPart = true;
  } else if (material.name === "In_P207") {
    if (
      context.includes("windshield") ||
      context.includes("sideglass") ||
      context.includes("doorglass") ||
      context.includes("tailgate")
    ) {
      applyWindowGlass(material);
      isTransparentPart = true;
    } else if (context.includes("headlightglass")) {
      applyHeadlightLens(material);
      isTransparentPart = true;
    } else if (
      context.includes("hatch_taillight_l") ||
      context.includes("hatch_taillight_r")
    ) {
      applyClearGlass(material);
      isTransparentPart = true;
    } else if (
      context.includes("taillight") &&
      !context.includes("taillightframe")
    ) {
      applyTaillightLens(material);
      isTransparentPart = true;
    }
  }

  if (isTransparentPart) {
    mesh.renderOrder = 1;
  }
}

export function CarModel() {
  const { scene } = useGLTF("/207.glb");

  const scale = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    return 2.2 / maxDim;
  }, [scene]);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ("isMesh" in child && child.isMesh) {
        const mesh = child as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        cloneMeshMaterials(mesh);

        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        for (const material of materials) {
          applyMeshMaterialStyle(mesh, material);
        }
      }
    });
    return clone;
  }, [scene]);

  return (
    <Center>
      <primitive object={model} scale={scale} />
    </Center>
  );
}

useGLTF.preload("/207.glb");
