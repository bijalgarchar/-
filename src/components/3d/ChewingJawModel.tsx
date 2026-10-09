import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SceneContainer } from './SceneContainer';
import { sounds } from '../../utils/audio';
import { loadGLTFModel } from '../../utils/modelLoader';
import { Sparkles, Utensils, RotateCcw, Play, Loader2, Info } from 'lucide-react';

export const ChewingJawModel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chewCount, setChewCount] = useState<number>(0);
  const [isAutoChewing, setIsAutoChewing] = useState<boolean>(false);
  const [selectedToothType, setSelectedToothType] = useState<string>('all');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const lowerJawRef = useRef<THREE.Group | null>(null);
  const upperJawRef = useRef<THREE.Group | null>(null);
  const foodMeshRef = useRef<THREE.Group | null>(null);
  const salivaParticlesRef = useRef<THREE.Points | null>(null);
  const teethMeshesRef = useRef<THREE.Mesh[]>([]);

  const handleSceneReady = async (scene: THREE.Scene) => {
    sceneRef.current = scene;

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    try {
      setIsLoading(true);

      // Load authentic 31-part Teeth and Jaw original model
      const teethJawGltf = await loadGLTFModel('/models/glb/teeth_jaw_original.glb');

      // Re-center and normalize size
      const box = new THREE.Box3().setFromObject(teethJawGltf);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const targetScale = 2.4 / Math.max(size.x, size.y, size.z);

      teethJawGltf.scale.setScalar(targetScale);
      teethJawGltf.position.set(
        -center.x * targetScale,
        -center.y * targetScale,
        -center.z * targetScale
      );

      // Extract Upper Maxilla and Lower Mandible Groups
      let upperArch: THREE.Group | null = null;
      let lowerArch: THREE.Group | null = null;
      const allTeeth: THREE.Mesh[] = [];

      teethJawGltf.traverse((child) => {
        if (child.name === 'Maxilla_Upper_Arch') {
          upperArch = child as THREE.Group;
        } else if (child.name === 'Mandible_Lower_Arch') {
          lowerArch = child as THREE.Group;
        }

        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const name = mesh.name.toLowerCase();
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (name.includes('tooth')) {
            allTeeth.push(mesh);
            mesh.material = new THREE.MeshPhysicalMaterial({
              color: 0xfafafa,
              roughness: 0.15,
              metalness: 0.05,
              clearcoat: 0.6,
              clearcoatRoughness: 0.1,
              side: THREE.DoubleSide
            });
          } else {
            // Mandible or Maxilla Bone
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xf1f5f9,
              roughness: 0.45,
              metalness: 0.05,
              side: THREE.DoubleSide
            });
          }
        }
      });

      teethMeshesRef.current = allTeeth;
      upperJawRef.current = upperArch;
      lowerJawRef.current = lowerArch;
      mainGroup.add(teethJawGltf);

      // ----------------------------------------------------
      // FOOD PIECE (Roti / Bread / Rice bolus)
      // ----------------------------------------------------
      const foodGroup = new THREE.Group();
      foodGroup.position.set(0, -0.05, 0.4);
      mainGroup.add(foodGroup);
      foodMeshRef.current = foodGroup;

      for (let c = 0; c < 24; c++) {
        const chunkGeo = new THREE.DodecahedronGeometry(0.045, 0);
        const chunkMat = new THREE.MeshStandardMaterial({
          color: 0xfde047,
          roughness: 0.7
        });
        const chunk = new THREE.Mesh(chunkGeo, chunkMat);
        chunk.position.set(
          (Math.random() - 0.5) * 0.22,
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.22
        );
        foodGroup.add(chunk);
      }

      // ----------------------------------------------------
      // SALIVA PARTICLES (લાળરસ શ્રાવ)
      // ----------------------------------------------------
      const salivaCount = 60;
      const salivaGeo = new THREE.BufferGeometry();
      const salivaPos = new Float32Array(salivaCount * 3);
      for (let i = 0; i < salivaCount; i++) {
        salivaPos[i * 3] = (Math.random() - 0.5) * 0.6;
        salivaPos[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
        salivaPos[i * 3 + 2] = 0.2 + (Math.random() - 0.5) * 0.4;
      }
      salivaGeo.setAttribute('position', new THREE.BufferAttribute(salivaPos, 3));
      const salivaMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.038,
        transparent: true,
        opacity: 0.65
      });
      const salivaPoints = new THREE.Points(salivaGeo, salivaMat);
      mainGroup.add(salivaPoints);
      salivaParticlesRef.current = salivaPoints;

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load authentic teeth/jaw model:', err);
      setIsLoading(false);
    }
  };

  // Perform single chew action (Mandible mastication)
  const performChew = () => {
    sounds.playChew();
    setChewCount((prev) => {
      const next = prev + 1;
      if (next >= 32) {
        setIsAutoChewing(false);
        sounds.playSuccess();
      }
      return next;
    });

    if (lowerJawRef.current) {
      const currentY = lowerJawRef.current.position.y;
      const currentRotX = lowerJawRef.current.rotation.x;

      // Animate TMJ jaw drop and bite
      lowerJawRef.current.position.y = currentY - 0.07;
      lowerJawRef.current.rotation.x = currentRotX + 0.06;

      setTimeout(() => {
        if (lowerJawRef.current) {
          lowerJawRef.current.position.y = currentY;
          lowerJawRef.current.rotation.x = currentRotX;
        }
      }, 110);
    }

    if (foodMeshRef.current) {
      foodMeshRef.current.children.forEach((child) => {
        child.position.x += (Math.random() - 0.5) * 0.015;
        child.position.z += (Math.random() - 0.5) * 0.015;
        child.scale.setScalar(Math.max(0.25, 1 - chewCount * 0.022));
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoChewing) {
      interval = setInterval(() => {
        setChewCount((prev) => {
          if (prev >= 32) {
            setIsAutoChewing(false);
            sounds.playSuccess();
            return 32;
          }
          sounds.playChew();
          if (lowerJawRef.current) {
            const currentY = lowerJawRef.current.position.y;
            const currentRotX = lowerJawRef.current.rotation.x;
            lowerJawRef.current.position.y = currentY - 0.06;
            lowerJawRef.current.rotation.x = currentRotX + 0.05;
            setTimeout(() => {
              if (lowerJawRef.current) {
                lowerJawRef.current.position.y = currentY;
                lowerJawRef.current.rotation.x = currentRotX;
              }
            }, 90);
          }
          return prev + 1;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isAutoChewing]);

  // Filter / Highlight tooth types
  const handleSelectToothType = (type: string) => {
    setSelectedToothType(type);
    sounds.playClick();

    teethMeshesRef.current.forEach((mesh) => {
      const name = mesh.name.toLowerCase();
      const mat = mesh.material as THREE.MeshPhysicalMaterial;

      let isMatch = false;
      if (type === 'all') isMatch = true;
      else if (type === 'incisor' && name.includes('incisor')) isMatch = true;
      else if (type === 'canine' && name.includes('canine')) isMatch = true;
      else if (type === 'premolar' && name.includes('premolar')) isMatch = true;
      else if (type === 'molar' && name.includes('molar') && !name.includes('premolar')) isMatch = true;

      if (type === 'all') {
        mat.color.set(0xfafafa);
        mat.emissive.set(0x000000);
      } else if (isMatch) {
        mat.color.set(0xfef08a);
        mat.emissive.set(0xeab308);
        mat.emissiveIntensity = 0.35;
      } else {
        mat.color.set(0x94a3b8);
        mat.emissive.set(0x000000);
      }
    });
  };

  const handleReset = () => {
    sounds.playClick();
    setChewCount(0);
    setIsAutoChewing(false);
    if (foodMeshRef.current) {
      foodMeshRef.current.children.forEach((child) => {
        child.position.set(
          (Math.random() - 0.5) * 0.22,
          (Math.random() - 0.5) * 0.08,
          (Math.random() - 0.5) * 0.22
        );
        child.scale.set(1, 1, 1);
      });
    }
  };

  const sweetnessPercent = Math.min(100, Math.round((chewCount / 32) * 100));

  return (
    <div className="relative w-full h-full">
      <SceneContainer
        onSceneReady={handleSceneReady}
        cameraPosition={[0, 0.3, 2.5]}
        targetPosition={[0, 0, 0]}
      />

      {isLoading && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-slate-200">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-xs font-semibold">અસલી 3D દાંત અને જડબું (Original 28 Teeth & Mandible) લોડ થઈ રહ્યું છે...</p>
          <span className="text-[11px] text-slate-400">Loading Original BodyParts3D Dental Arch Anatomy</span>
        </div>
      )}

      {/* Top Banner & Tooth Type Inspector */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-sm bg-slate-900/85 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-400">ઓરિજિનલ દાંત અને જડબું (Original 3D Model):</span>
          <span className="text-[10px] text-slate-400 font-mono">૨૮ અસલી દાંત</span>
        </div>

        {/* Tooth category chips */}
        <div className="grid grid-cols-2 gap-1 text-[11px]">
          <button
            onClick={() => handleSelectToothType('all')}
            className={`px-2 py-1 rounded transition-colors text-left ${
              selectedToothType === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            બધા દાંત (All 28)
          </button>
          <button
            onClick={() => handleSelectToothType('incisor')}
            className={`px-2 py-1 rounded transition-colors text-left ${
              selectedToothType === 'incisor'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            કાપવાના (Incisors - ૮)
          </button>
          <button
            onClick={() => handleSelectToothType('canine')}
            className={`px-2 py-1 rounded transition-colors text-left ${
              selectedToothType === 'canine'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            રાક્ષસી (Canines - ૪)
          </button>
          <button
            onClick={() => handleSelectToothType('molar')}
            className={`px-2 py-1 rounded transition-colors text-left ${
              selectedToothType === 'molar'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            દાઢ (Molars - ૧૬)
          </button>
        </div>
      </div>

      {/* Bottom Panel: Interactive Chewing Controls */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-lg z-10 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/70 shadow-2xl">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>ચાવવાની સંખ્યા:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs">
                {chewCount} / ૩૨ વખત
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {chewCount < 5
                ? '૩-૪ વાર ચાવવાથી સ્વાદ બદલાતો નથી.'
                : chewCount < 20
                ? 'લાળરસ ભળી રહ્યો છે, ખોરાક પોચો થાય છે.'
                : '૩૨ વાર ચાવવાથી રોટલી એકદમ મીઠી લાગે છે!'}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={performChew}
              disabled={chewCount >= 32}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              ચાવો! (Chew)
            </button>
            <button
              onClick={() => setIsAutoChewing(!isAutoChewing)}
              className={`p-1.5 rounded-lg text-xs border transition-colors ${
                isAutoChewing
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isAutoChewing ? 'animate-pulse' : ''}`} />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Saliva & Sweetness Indicator */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              લાળરસનું રૂપાંતરણ (સ્ટાર્ચ ➔ ખાંડ/ગ્લુકોઝ)
            </span>
            <span className="font-mono text-amber-400 font-bold">{sweetnessPercent}% મીઠાશ</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mb-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-pink-500 h-full rounded-full transition-all duration-200"
              style={{ width: `${sweetnessPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>દાંતનું કામ: ખોરાક પીસવો</span>
            <span className="text-cyan-400">લાળરસનું કામ: પાચન અને મુલાયમ બનાવવું</span>
          </div>
        </div>
      </div>
    </div>
  );
};
