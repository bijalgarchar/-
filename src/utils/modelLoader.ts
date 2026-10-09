import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';

// Cache for loaded GLTF scenes to avoid re-fetching
const gltfCache = new Map<string, THREE.Group>();

let isMeshoptInitialized = false;
async function initMeshopt() {
  if (!isMeshoptInitialized) {
    await MeshoptDecoder.ready;
    isMeshoptInitialized = true;
  }
}

/**
 * Loads a GLTF / GLB model with MeshoptDecoder support
 */
export async function loadGLTFModel(
  url: string,
  onProgress?: (event: ProgressEvent) => void
): Promise<THREE.Group> {
  if (gltfCache.has(url)) {
    return gltfCache.get(url)!.clone(true);
  }

  await initMeshopt();

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    loader.load(
      url,
      (gltf) => {
        gltfCache.set(url, gltf.scene);
        resolve(gltf.scene.clone(true));
      },
      onProgress,
      (error) => {
        console.error(`Failed to load 3D model from ${url}:`, error);
        reject(error);
      }
    );
  });
}

/**
 * Extracts and isolates specific anatomical organs by name pattern from organs.glb
 */
export function filterOrgansByNames(
  sourceScene: THREE.Group,
  allowedPatterns: string[]
): THREE.Group {
  const result = new THREE.Group();

  sourceScene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      const nameLower = (mesh.name || '').toLowerCase();

      // Skip lines, bounding boxes, or debug helpers
      if (nameLower.includes('-line') || nameLower.includes('.g')) {
        return;
      }

      const isMatch = allowedPatterns.some((pattern) =>
        nameLower.includes(pattern.toLowerCase())
      );

      if (isMatch) {
        const clonedMesh = mesh.clone(true);
        // Ensure standard PBR material
        if (mesh.material) {
          const origMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          clonedMesh.material = new THREE.MeshStandardMaterial({
            color: (origMat as THREE.MeshStandardMaterial).color || 0xef4444,
            roughness: 0.4,
            metalness: 0.1,
            side: THREE.DoubleSide
          });
        }
        result.add(clonedMesh);
      }
    }
  });

  return result;
}

/**
 * Center and scale any 3D object to fit standard viewport unit size
 */
export function normalizeModelBounds(
  object: THREE.Object3D,
  targetSize: number = 2.0
): THREE.Box3 {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxAxis = Math.max(size.x, size.y, size.z);
  if (maxAxis > 0) {
    const scale = targetSize / maxAxis;
    object.scale.setScalar(scale);
  }

  // Re-calculate after scaling and center to origin
  const newBox = new THREE.Box3().setFromObject(object);
  const newCenter = newBox.getCenter(new THREE.Vector3());
  object.position.sub(newCenter);

  return newBox;
}
