import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SceneContainer } from './SceneContainer';
import { ORGANS_DATA } from '../../data/chapterData';
import { OrganDetail } from '../../types/chapter';
import { sounds } from '../../utils/audio';
import { loadGLTFModel } from '../../utils/modelLoader';
import { Play, Pause, RotateCcw, Eye, Bone, Sparkles, Loader2, Layers } from 'lucide-react';

interface DigestiveSystemModelProps {
  selectedOrgan: OrganDetail | null;
  onSelectOrgan: (organ: OrganDetail) => void;
}

export const DigestiveSystemModel: React.FC<DigestiveSystemModelProps> = ({
  selectedOrgan,
  onSelectOrgan,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingBolus, setIsPlayingBolus] = useState(false);
  const [bolusStep, setBolusStep] = useState<number>(0);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [xrayMode, setXrayMode] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const organsRootRef = useRef<THREE.Group | null>(null);
  const skeletonRootRef = useRef<THREE.Group | null>(null);
  const bolusMeshRef = useRef<THREE.Mesh | null>(null);
  const organMeshesMap = useRef<Map<string, THREE.Mesh[]>>(new Map());

  // Bolus trajectory curve following authentic anatomical path
  const bolusCurveRef = useRef<THREE.CatmullRomCurve3 | null>(null);
  const bolusProgressRef = useRef<number>(0);

  useEffect(() => {
    // Exact anatomical coordinates matching organs.glb coordinate space (y: ~0.8 to ~1.6m, scaled to fit)
    const points = [
      new THREE.Vector3(0, 0.72, 0.08),   // Mouth / Pharynx
      new THREE.Vector3(0, 0.58, 0.03),   // Upper Esophagus
      new THREE.Vector3(0.01, 0.38, 0.01),// Mid Esophagus
      new THREE.Vector3(0.04, 0.22, 0.04),// Cardia / Stomach Entry
      new THREE.Vector3(0.12, 0.12, 0.08),// Stomach Body Churn
      new THREE.Vector3(0.02, 0.04, 0.06),// Pylorus
      new THREE.Vector3(0.01, -0.04, 0.05),// Duodenum
      new THREE.Vector3(-0.06, -0.15, 0.07),// Small Intestine (Jejunum)
      new THREE.Vector3(0.05, -0.22, 0.08),// Small Intestine (Ileum)
      new THREE.Vector3(0.18, -0.25, 0.05),// Cecum & Appendix
      new THREE.Vector3(0.18, -0.05, 0.05),// Ascending Colon
      new THREE.Vector3(0, 0.02, 0.08),   // Transverse Colon
      new THREE.Vector3(-0.18, -0.05, 0.05),// Descending Colon
      new THREE.Vector3(-0.12, -0.26, 0.04),// Sigmoid Colon
      new THREE.Vector3(0, -0.35, 0.02),  // Rectum & Anus
    ];
    bolusCurveRef.current = new THREE.CatmullRomCurve3(points);
  }, []);

  const handleSceneReady = async (scene: THREE.Scene) => {
    sceneRef.current = scene;

    const mainGroup = new THREE.Group();
    // Center the human anatomy around viewport center
    mainGroup.position.set(0, 0.1, 0);
    scene.add(mainGroup);

    try {
      setIsLoading(true);

      // 1. LOAD AUTHENTIC ORIGINAL ORGANS MODEL (organs.glb)
      const organsGltf = await loadGLTFModel('/models/glb/organs.glb');
      organsRootRef.current = organsGltf;

      // Normalize scale so human torso fits nicely in 3D scene (target height ~ 1.8 units)
      const organsBox = new THREE.Box3().setFromObject(organsGltf);
      const organsCenter = organsBox.getCenter(new THREE.Vector3());
      const organsSize = organsBox.getSize(new THREE.Vector3());
      const scaleFactor = 1.8 / organsSize.y;

      organsGltf.scale.setScalar(scaleFactor);
      organsGltf.position.set(
        -organsCenter.x * scaleFactor,
        -organsCenter.y * scaleFactor + 0.1,
        -organsCenter.z * scaleFactor
      );

      // Organize and color original anatomical meshes
      const organsMap = new Map<string, THREE.Mesh[]>();
      organsMap.set('mouth', []);
      organsMap.set('esophagus', []);
      organsMap.set('stomach', []);
      organsMap.set('liver', []);
      organsMap.set('pancreas', []);
      organsMap.set('small-intestine', []);
      organsMap.set('large-intestine', []);
      organsMap.set('rectum', []);

      organsGltf.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const name = (mesh.name || '').toLowerCase();

          // Strictly hide lines, annotations, debug helpers
          if (name.includes('-line') || name.includes('.line') || name.includes('.g') || name.includes('how_to')) {
            mesh.visible = false;
            return;
          }

          // STRICT SCHOOL SAFETY FILTER: Completely remove and hide any genital, pelvic, reproductive, or urinary structures
          if (
            name.includes('penis') || name.includes('genital') || name.includes('scrotum') ||
            name.includes('testis') || name.includes('testicle') || name.includes('urethra') ||
            name.includes('prostate') || name.includes('epididymis') || name.includes('bladder') ||
            name.includes('glans') || name.includes('corpus') || name.includes('corpora') ||
            name.includes('pudend') || name.includes('vulva') || name.includes('erectile') ||
            name.includes('spermatic') || name.includes('prepuce') || name.includes('pelvis') ||
            name.includes('pelvic') || name.includes('kidney') || name.includes('ureter') ||
            name.includes('adrenal') || name.includes('suprarenal') || name.includes('lung') ||
            name.includes('bronch') || name.includes('trachea') || name.includes('thymus') ||
            name.includes('thyroid') || name.includes('peritone') || name.includes('fascia') ||
            name.includes('omentum') || name.includes('meso')
          ) {
            mesh.visible = false;
            return;
          }

          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Only show and color explicit digestive organs for Grade 5 Chapter 3
          if (name.includes('stomach') || name.includes('gastric') || name.includes('cardia') || name.includes('pylorus')) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xef4444,
              roughness: 0.35,
              metalness: 0.05,
              emissive: 0x991b1b,
              emissiveIntensity: 0.15,
              side: THREE.DoubleSide
            });
            organsMap.get('stomach')?.push(mesh);
          } else if (name.includes('liver')) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x881337,
              roughness: 0.45,
              metalness: 0.05,
              side: THREE.DoubleSide
            });
            organsMap.get('liver')?.push(mesh);
          } else if (name.includes('gall') || name.includes('cystic') || name.includes('bile_duct')) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x15803d,
              roughness: 0.3,
              emissive: 0x14532d,
              emissiveIntensity: 0.2,
              side: THREE.DoubleSide
            });
            organsMap.get('liver')?.push(mesh);
          } else if (name.includes('pancreas')) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xf59e0b,
              roughness: 0.5,
              side: THREE.DoubleSide
            });
            organsMap.get('pancreas')?.push(mesh);
          } else if (name.includes('oesophag') || name.includes('esophag')) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xfb923c,
              roughness: 0.4,
              side: THREE.DoubleSide
            });
            organsMap.get('esophagus')?.push(mesh);
          } else if (name.includes('tongue') || name.includes('mouth') || name.includes('pharynx') || name.includes('salivary') || name.includes('parotid') || name.includes('sublingual') || name.includes('submandibular') || name.includes('uvula') || name.includes('palate') || name.includes('gingiva')) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xf43f5e,
              roughness: 0.35,
              emissive: 0xbe123c,
              emissiveIntensity: 0.2,
              side: THREE.DoubleSide
            });
            organsMap.get('mouth')?.push(mesh);
          } else if (name.includes('duodenum') || name.includes('jejunum') || name.includes('ileum') || name.includes('small_intestine')) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xeab308,
              roughness: 0.45,
              side: THREE.DoubleSide
            });
            organsMap.get('small-intestine')?.push(mesh);
          } else if (name.includes('colon') || name.includes('caecum') || name.includes('cecum') || name.includes('appendix') || name.includes('large_intestine') || name.includes('taenia')) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x84cc16,
              roughness: 0.5,
              side: THREE.DoubleSide
            });
            organsMap.get('large-intestine')?.push(mesh);
          } else if (name.includes('rectum') || name.includes('anus') || name.includes('anal')) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x65a30d,
              roughness: 0.5,
              side: THREE.DoubleSide
            });
            organsMap.get('rectum')?.push(mesh);
          } else {
            // Strictly hide all unrelated non-digestive tissues
            mesh.visible = false;
          }
        }
      });

      organMeshesMap.current = organsMap;
      mainGroup.add(organsGltf);

      // 2. LOAD AUTHENTIC ORIGINAL SKELETON MODEL (Upper Torso & Ribcage only)
      const skeletonGltf = await loadGLTFModel('/models/glb/skeleton.glb');
      skeletonRootRef.current = skeletonGltf;

      skeletonGltf.scale.setScalar(scaleFactor);
      skeletonGltf.position.set(
        -organsCenter.x * scaleFactor,
        -organsCenter.y * scaleFactor + 0.1,
        -organsCenter.z * scaleFactor
      );

      // Apply pearl translucent bone shader & strictly hide lower body / pelvis / legs
      skeletonGltf.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const name = (mesh.name || '').toLowerCase();

          // Hide lines and annotations
          if (name.includes('-line') || name.includes('.line') || name.includes('.g')) {
            mesh.visible = false;
            return;
          }

          // STRICT FILTER: Completely hide pelvic, hip, pubic, genital, coccyx, femur, leg and foot bones
          if (
            name.includes('pelvis') || name.includes('pelvic') || name.includes('pubis') ||
            name.includes('pubic') || name.includes('ischium') || name.includes('ischial') ||
            name.includes('coccyx') || name.includes('sacrum') || name.includes('sacral') ||
            name.includes('femur') || name.includes('hip') || name.includes('ilium') ||
            name.includes('iliac') || name.includes('patella') || name.includes('tibia') ||
            name.includes('fibula') || name.includes('foot') || name.includes('feet') ||
            name.includes('calcaneus') || name.includes('talus') || name.includes('cuneiform') ||
            name.includes('cuboid') || name.includes('navicular') || name.includes('metatarsal') ||
            name.includes('trochanter') || name.includes('acetabulum')
          ) {
            mesh.visible = false;
            return;
          }

          mesh.material = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            roughness: 0.4,
            metalness: 0.1,
            transparent: true,
            opacity: 0.3,
            depthWrite: true,
            side: THREE.DoubleSide
          });
        }
      });

      mainGroup.add(skeletonGltf);

      // 3. Glowing Food Particle Bolus
      const bolusGeo = new THREE.SphereGeometry(0.038, 16, 16);
      const bolusMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.0,
        roughness: 0.1
      });
      const bolusMesh = new THREE.Mesh(bolusGeo, bolusMat);
      bolusMesh.position.set(0, 0.72, 0.08);
      mainGroup.add(bolusMesh);
      bolusMeshRef.current = bolusMesh;

      // Small light on the bolus
      const bolusLight = new THREE.PointLight(0x38bdf8, 1.5, 0.6);
      bolusMesh.add(bolusLight);

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load authentic 3D models:', err);
      setIsLoading(false);
    }
  };

  // Animation Loop Update
  const handleUpdate = (delta: number) => {
    // Bolus travel animation
    if (isPlayingBolus && bolusCurveRef.current && bolusMeshRef.current) {
      bolusProgressRef.current = (bolusProgressRef.current + delta * 0.14) % 1;
      const pos = bolusCurveRef.current.getPointAt(bolusProgressRef.current);
      bolusMeshRef.current.position.copy(pos);

      // Trigger sounds at key organs
      if (bolusProgressRef.current < 0.03) {
        sounds.playChew();
      } else if (bolusProgressRef.current > 0.22 && bolusProgressRef.current < 0.25) {
        sounds.playChurn();
      }

      // Update step indicator
      if (bolusProgressRef.current < 0.12) {
        setBolusStep(0); // Mouth
      } else if (bolusProgressRef.current < 0.28) {
        setBolusStep(1); // Esophagus
      } else if (bolusProgressRef.current < 0.52) {
        setBolusStep(2); // Stomach
      } else if (bolusProgressRef.current < 0.78) {
        setBolusStep(3); // Small Intestine
      } else {
        setBolusStep(4); // Large Intestine
      }
    }
  };

  // Skeleton visibility toggle
  useEffect(() => {
    if (skeletonRootRef.current) {
      skeletonRootRef.current.visible = showSkeleton;
    }
  }, [showSkeleton]);

  // X-Ray Mode
  useEffect(() => {
    if (skeletonRootRef.current) {
      skeletonRootRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          mat.wireframe = xrayMode;
          mat.opacity = xrayMode ? 0.15 : 0.3;
        }
      });
    }
    if (organsRootRef.current) {
      organsRootRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && child.visible) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          mat.wireframe = xrayMode;
        }
      });
    }
  }, [xrayMode]);

  // Highlight selected organ
  useEffect(() => {
    organMeshesMap.current.forEach((meshes, organId) => {
      const isSelected = selectedOrgan && selectedOrgan.id === organId;
      meshes.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (isSelected) {
          mat.emissive.set(0xfbbf24);
          mat.emissiveIntensity = 0.5;
        } else {
          // Revert normal emissive
          if (organId === 'stomach') {
            mat.emissive.set(0x991b1b);
            mat.emissiveIntensity = 0.15;
          } else {
            mat.emissive.set(0x000000);
            mat.emissiveIntensity = 0;
          }
        }
      });
    });
  }, [selectedOrgan]);

  const toggleBolusPlay = () => {
    sounds.playClick();
    setIsPlayingBolus(!isPlayingBolus);
  };

  const resetBolus = () => {
    sounds.playClick();
    bolusProgressRef.current = 0;
    if (bolusMeshRef.current && bolusCurveRef.current) {
      bolusMeshRef.current.position.copy(bolusCurveRef.current.getPointAt(0));
    }
    setBolusStep(0);
  };

  const stepsGu = [
    { name: '૧. મોં અને દાંત', note: 'ખોરાક ચવાય છે અને લાળરસ ભળે છે' },
    { name: '૨. અન્નનળી', note: 'તરંગ જેવી ગતિથી જઠર તરફ વહન' },
    { name: '૩. જઠર (પેટ)', note: 'ખોરાક વલોવાય છે અને પાચકરસ ઉમેરાય છે' },
    { name: '૪. નાનું આંતરડું', note: 'પોષક તત્વોનું સંપૂર્ણ શોષણ થાય છે' },
    { name: '૫. મોટું આંતરડું', note: 'પાણીનું શોષણ અને ઉત્સર્જન' }
  ];

  return (
    <div className="relative w-full h-full">
      <SceneContainer
        onSceneReady={handleSceneReady}
        onUpdate={handleUpdate}
        cameraPosition={[0, 0.1, 2.6]}
        targetPosition={[0, 0.05, 0]}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-slate-200">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-xs font-semibold">અસલી 3D એનાટોમી મૉડેલ લોડ થઈ રહ્યું છે...</p>
          <span className="text-[11px] text-slate-400">Loading Original Z-Anatomy 3D Medical Organs</span>
        </div>
      )}

      {/* Floating Organ Selector Pills */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 max-w-md bg-slate-900/85 backdrop-blur-md p-2 rounded-xl border border-slate-700/60 shadow-xl">
        <div className="w-full text-[11px] font-semibold text-slate-400 px-1 mb-0.5 flex items-center justify-between">
          <span className="text-amber-400 font-bold">અસલી માનવ શરીરરચના (Original 3D Anatomy):</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSkeleton(!showSkeleton)}
              className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                showSkeleton ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <Bone className="w-3 h-3 text-amber-400" /> કંકાલ
            </button>
            <button
              onClick={() => setXrayMode(!xrayMode)}
              className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                xrayMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Eye className="w-3 h-3" /> X-Ray
            </button>
          </div>
        </div>

        {ORGANS_DATA.map((organ) => {
          const isSelected = selectedOrgan?.id === organ.id;
          return (
            <button
              key={organ.id}
              onClick={() => {
                sounds.playClick();
                onSelectOrgan(organ);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/40'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: organ.color }}
              />
              <span>{organ.nameGu.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Food Journey Simulation HUD */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-10 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/70 shadow-2xl">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-100">ખોરાક પરિભ્રમણ યાત્રા</h4>
              <p className="text-[11px] text-slate-400">ખોરાકનો કણ કેવી રીતે પસાર થાય છે?</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleBolusPlay}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isPlayingBolus
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isPlayingBolus ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingBolus ? 'વિરામ' : 'શરૂ કરો'}</span>
            </button>
            <button
              onClick={resetBolus}
              title="ફરીથી શરૂ કરો"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Bolus Step Card */}
        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-amber-400 font-semibold block">{stepsGu[bolusStep].name}</span>
            <span className="text-slate-300 text-[11px]">{stepsGu[bolusStep].note}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
            તબક્કો {bolusStep + 1}/5
          </span>
        </div>
      </div>
    </div>
  );
};
