import { Box3, Object3D, Vector3 } from "three";
import type { ZoneSlug } from "@/lib/zones";

export type AdZoneTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
};

type Surface = "top" | "left" | "right" | "back";

type ZoneMeshConfig = {
  meshes: string[];
  surface: Surface;
  sizeScale?: [number, number];
};

const AD_ZONE_MESH_CONFIG: Record<ZoneSlug, ZoneMeshConfig> = {
  hood: { meshes: ["hatch_hood"], surface: "top", sizeScale: [0.92, 0.88] },
  roof: {
    meshes: ["Roof_Panorama_Extra", "Roof_Panorama_Extra_001"],
    surface: "top",
    sizeScale: [0.95, 0.92],
  },
  "door-left": { meshes: ["hatch_door_L"], surface: "left", sizeScale: [0.88, 0.82] },
  "door-right": { meshes: ["hatch_door_R"], surface: "right", sizeScale: [0.88, 0.82] },
  "door-rear-left": { meshes: ["hatch_sideglass_L"], surface: "left", sizeScale: [0.88, 0.82] },
  "door-rear-right": { meshes: ["hatch_sideglass_R"], surface: "right", sizeScale: [0.88, 0.82] },
  rear: { meshes: ["hatch_bumper_R"], surface: "back", sizeScale: [0.88, 0.75] },
};

const SURFACE_INSET = 0.003;

function unionMeshBounds(root: Object3D, meshNames: string[]) {
  const box = new Box3();
  let found = false;

  for (const name of meshNames) {
    const obj = root.getObjectByName(name);
    if (!obj) continue;
    obj.updateMatrixWorld(true);
    const partBox = new Box3().setFromObject(obj);
    if (!partBox.isEmpty()) {
      box.union(partBox);
      found = true;
    }
  }

  return found ? box : null;
}

function toTuple3(vector: Vector3): [number, number, number] {
  return [vector.x, vector.y, vector.z];
}

function computeZoneTransform(
  box: Box3,
  surface: Surface,
  sizeScale: [number, number] = [1, 1],
): AdZoneTransform {
  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());

  switch (surface) {
    case "top":
      return {
        position: toTuple3(new Vector3(center.x, box.max.y + SURFACE_INSET, center.z)),
        rotation: [-Math.PI / 2, 0, 0],
        size: [size.x * sizeScale[0], size.z * sizeScale[1]],
      };
    case "left":
      return {
        position: toTuple3(new Vector3(box.max.x + SURFACE_INSET, center.y, center.z)),
        rotation: [0, Math.PI / 2, 0],
        size: [size.z * sizeScale[0], size.y * sizeScale[1]],
      };
    case "right":
      return {
        position: toTuple3(new Vector3(box.min.x - SURFACE_INSET, center.y, center.z)),
        rotation: [0, -Math.PI / 2, 0],
        size: [size.z * sizeScale[0], size.y * sizeScale[1]],
      };
    case "back":
      return {
        position: toTuple3(new Vector3(center.x, center.y, box.min.z - SURFACE_INSET)),
        rotation: [0, Math.PI, 0],
        size: [size.x * sizeScale[0], size.y * sizeScale[1]],
      };
  }
}

export function computeAllAdZoneTransforms(
  modelRoot: Object3D,
): Record<ZoneSlug, AdZoneTransform> {
  modelRoot.updateMatrixWorld(true);
  const transforms = {} as Record<ZoneSlug, AdZoneTransform>;

  for (const slug of Object.keys(AD_ZONE_MESH_CONFIG) as ZoneSlug[]) {
    const config = AD_ZONE_MESH_CONFIG[slug];
    const box = unionMeshBounds(modelRoot, config.meshes);
    if (!box) continue;
    transforms[slug] = computeZoneTransform(box, config.surface, config.sizeScale);
  }

  return transforms;
}
