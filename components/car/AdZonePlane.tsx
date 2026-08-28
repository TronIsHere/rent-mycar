"use client";

import { useMemo } from "react";
import { Edges, useTexture } from "@react-three/drei";
import { CanvasTexture, SRGBColorSpace, type Texture } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { AdZoneWithTransform } from "@/lib/types";
import { useIsDark } from "@/components/ThemeToggle";

type AdZonePlaneProps = {
  zone: AdZoneWithTransform;
  adImageUrl?: string | null;
  selected: boolean;
  editMode?: boolean;
  onSelect: (slug: string) => void;
};

function createPlaceholderTexture(label: string, isDark: boolean, width: number, height: number) {
  const canvas = document.createElement("canvas");
  const aspect = width / height;
  canvas.height = 256;
  canvas.width = Math.round(canvas.height * aspect);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = isDark ? "#1e1e1e" : "#e8e8e8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = isDark ? "#666666" : "#999999";
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

function ZonePlaneMesh({
  zone,
  map,
  selected,
  editMode,
  onSelect,
}: {
  zone: AdZoneWithTransform;
  map: Texture;
  selected: boolean;
  editMode: boolean;
  onSelect: (slug: string) => void;
}) {
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(zone.slug);
  };

  const opacity = editMode ? (selected ? 0.92 : 0.72) : selected ? 1 : 0.88;

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
      <meshBasicMaterial map={map} transparent opacity={opacity} toneMapped={false} />
      {editMode && (
        <Edges
          color={selected ? "#ffffff" : "#888888"}
          linewidth={selected ? 2 : 1}
        />
      )}
    </mesh>
  );
}

function PlaceholderPlane({
  zone,
  selected,
  editMode = false,
  onSelect,
}: Omit<AdZonePlaneProps, "adImageUrl"> & { editMode?: boolean }) {
  const isDark = useIsDark();
  const texture = useMemo(
    () => createPlaceholderTexture(zone.label, isDark, zone.size[0], zone.size[1]),
    [zone.label, zone.size, isDark],
  );

  if (!texture) return null;

  return (
    <ZonePlaneMesh
      zone={zone}
      map={texture}
      selected={selected}
      editMode={editMode}
      onSelect={onSelect}
    />
  );
}

function AdImagePlane({
  zone,
  adImageUrl,
  selected,
  editMode = false,
  onSelect,
}: AdZonePlaneProps & { adImageUrl: string }) {
  const texture = useTexture(adImageUrl);

  return (
    <ZonePlaneMesh
      zone={zone}
      map={texture}
      selected={selected}
      editMode={editMode}
      onSelect={onSelect}
    />
  );
}

export function AdZonePlane({
  zone,
  adImageUrl,
  selected,
  editMode = false,
  onSelect,
}: AdZonePlaneProps) {
  if (adImageUrl) {
    return (
      <AdImagePlane
        zone={zone}
        adImageUrl={adImageUrl}
        selected={selected}
        editMode={editMode}
        onSelect={onSelect}
      />
    );
  }

  return (
    <PlaceholderPlane
      zone={zone}
      selected={selected}
      editMode={editMode}
      onSelect={onSelect}
    />
  );
}
