let preloaded = false;

export function preloadCarModel() {
  if (preloaded || typeof window === "undefined") return;
  preloaded = true;

  void import("@react-three/drei").then(({ useGLTF }) => {
    useGLTF.preload("/207.glb");
  });
}
