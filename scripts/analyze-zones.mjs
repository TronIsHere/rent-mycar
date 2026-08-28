import { readFileSync } from "fs";
import {
  Box3,
  Euler,
  Group,
  Mesh,
  Object3D,
  Vector3,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const ZONE_MESHES = {
  hood: ["hatch_hood"],
  roof: ["Roof_Panorama_Extra", "Roof_Panorama_Extra_001"],
  "door-left": ["hatch_door_L"],
  "door-right": ["hatch_door_R"],
  rear: ["hatch_bumper_R"],
  side: ["hatch_fender_L"],
};

function unionBox(root, names) {
  const box = new Box3();
  let found = false;
  for (const name of names) {
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

function computeZone(box, surface, inset = 0.003) {
  const center = box.getCenter(new Vector3());
  const size = box.getSize(new Vector3());

  switch (surface) {
    case "top": {
      const y = box.max.y + inset;
      return {
        position: [center.x, y, center.z],
        rotation: [-Math.PI / 2, 0, 0],
        size: [size.x * 0.92, size.z * 0.88],
      };
    }
    case "left": {
      const x = box.max.x + inset;
      return {
        position: [x, center.y, center.z],
        rotation: [0, Math.PI / 2, 0],
        size: [size.z * 0.88, size.y * 0.82],
      };
    }
    case "right": {
      const x = box.min.x - inset;
      return {
        position: [x, center.y, center.z],
        rotation: [0, -Math.PI / 2, 0],
        size: [size.z * 0.88, size.y * 0.82],
      };
    }
    case "back": {
      const z = box.min.z - inset;
      return {
        position: [center.x, center.y, z],
        rotation: [0, Math.PI, 0],
        size: [size.x * 0.88, size.y * 0.75],
      };
    }
  }
}

const buffer = readFileSync("public/207.glb");
const loader = new GLTFLoader();
const gltf = await loader.parseAsync(buffer.buffer, "");

const model = gltf.scene.clone(true);
model.updateMatrixWorld(true);

const rawBox = new Box3().setFromObject(model);
const rawSize = rawBox.getSize(new Vector3());
const scale = 2.2 / Math.max(rawSize.x, rawSize.y, rawSize.z);
model.scale.multiplyScalar(scale);
model.updateMatrixWorld(true);

const scaledBox = new Box3().setFromObject(model);
const scaledCenter = scaledBox.getCenter(new Vector3());
model.position.sub(scaledCenter);
model.updateMatrixWorld(true);

const finalBox = new Box3().setFromObject(model);
console.log("Car size:", finalBox.getSize(new Vector3()).toArray().map((v) => +v.toFixed(4)));
console.log("Car center:", finalBox.getCenter(new Vector3()).toArray().map((v) => +v.toFixed(4)));

const surfaces = {
  hood: "top",
  roof: "top",
  "door-left": "left",
  "door-right": "right",
  rear: "back",
  side: "left",
};

console.log("\nComputed zones:");
for (const [slug, meshNames] of Object.entries(ZONE_MESHES)) {
  const box = unionBox(model, meshNames);
  if (!box) {
    console.log(`${slug}: NOT FOUND`);
    continue;
  }
  const zone = computeZone(box, surfaces[slug]);
  console.log(JSON.stringify({ slug, ...zone }, null, 2));
}
