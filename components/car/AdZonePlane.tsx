"use client";

import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { CanvasTexture, SRGBColorSpace } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { AdZoneConfig } from "@/lib/zones";
import { useIsDark } from "@/components/ThemeToggle";

type AdZonePlaneProps = {
  zone: AdZoneConfig;
  adImageUrl?: string | null;
  selected: boolean;
  onSelect: (slug: string) => void;
};

function createPlaceholderTexture(label: string, isDark: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = isDark ? "#1e1e1e" : "#e8e8e8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = isDark ? "#444444" : "#888888";
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.fillStyle = isDark ? "#e0e0e0" : "#121212";
  ctx.font = "bold 36px IRANSans, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = "24px IRANSans, sans-serif";
  ctx.fillStyle = isDark ? "#b0b0b0" : "#888888";
  ctx.fillText("خالی", canvas.width / 2, canvas.height / 2 + 24);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function PlaceholderPlane({
  zone,
  selected,
  onSelect,
}: Omit<AdZonePlaneProps, "adImageUrl">) {
  const isDark = useIsDark();
  const texture = useMemo(
    () => createPlaceholderTexture(zone.label, isDark),
    [zone.label, isDark],
  );

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(zone.slug);
  };

  if (!texture) return null;

  return (
    <mesh
      position={zone.position}
      rotation={zone.rotation}
      onClick={handleClick}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      <planeGeometry args={zone.size} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={selected ? 1 : 0.88}
        toneMapped={false}
      />
    </mesh>
  );
}

function AdImagePlane({
  zone,
  adImageUrl,
  selected,
  onSelect,
}: AdZonePlaneProps & { adImageUrl: string }) {
  const texture = useTexture(adImageUrl);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(zone.slug);
  };

  return (
    <mesh
      position={zone.position}
      rotation={zone.rotation}
      onClick={handleClick}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      <planeGeometry args={zone.size} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={selected ? 1 : 0.95}
        toneMapped={false}
      />
    </mesh>
  );
}

export function AdZonePlane({
  zone,
  adImageUrl,
  selected,
  onSelect,
}: AdZonePlaneProps) {
  if (adImageUrl) {
    return (
      <AdImagePlane
        zone={zone}
        adImageUrl={adImageUrl}
        selected={selected}
        onSelect={onSelect}
      />
    );
  }

  return (
    <PlaceholderPlane zone={zone} selected={selected} onSelect={onSelect} />
  );
}
