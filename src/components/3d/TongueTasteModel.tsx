import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SceneContainer } from './SceneContainer';
import { TASTE_ZONES, FOOD_TASTE_ITEMS } from '../../data/chapterData';
import { TasteZone, FoodTasteItem } from '../../types/chapter';
import { sounds } from '../../utils/audio';
import { createTongueMucosaTexture } from '../../utils/thaliTextures';
import { Sparkles, Brain, Loader2, Droplets, DropletOff, RotateCcw } from 'lucide-react';

interface TongueTasteModelProps {
  onSelectTaste?: (zone: TasteZone) => void;
}

export const TongueTasteModel: React.FC<TongueTasteModelProps> = ({ onSelectTaste }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<TasteZone>(TASTE_ZONES[0]);
  const [activeFood, setActiveFood] = useState<FoodTasteItem>(FOOD_TASTE_ITEMS[0]);
  const [showMicroscope, setShowMicroscope] = useState(false);
  const [hasSaliva, setHasSaliva] = useState(true); // Page 25 saliva experiment
  const [salivaAlert, setSalivaAlert] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const tongueGroupRef = useRef<THREE.Group | null>(null);
  const microscopeGroupRef = useRef<THREE.Group | null>(null);
  const droppedFoodGroupRef = useRef<THREE.Group | null>(null);
  const nervePulsesRef = useRef<THREE.Points | null>(null);
  const tongueMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  // Surface taste zone glow meshes
  const zoneOverlaysRef = useRef<Map<string, THREE.Mesh>>(new Map());

  const handleSceneReady = (scene: THREE.Scene) => {
    sceneRef.current = scene;

    const mainTongueGroup = new THREE.Group();
    tongueGroupRef.current = mainTongueGroup;
    scene.add(mainTongueGroup);

    // ==========================================================
    // 1. ANATOMICAL 3D HUMAN TONGUE BODY (ઓરિજિનલ શરીરરચના અનુસાર જીભ)
    // ==========================================================
    // Create organic, curved tongue surface with median groove & anatomical curvature
    const tongueGeo = new THREE.CylinderGeometry(0.55, 0.75, 1.8, 36, 24);
    // Deform vertices to match human tongue anatomy:
    // Flatter at tip, arched dorsum in middle, median groove along center (x=0), V-notch at back
    const posAttr = tongueGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      let x = posAttr.getX(i);
      let y = posAttr.getY(i);
      let z = posAttr.getZ(i);

      // Flatten z-thickness (tongue is wider than thick)
      z *= 0.42;

      // Curve upward at dorsum
      const normY = (y + 0.9) / 1.8; // 0 at root, 1 at tip
      if (normY > 0.3) {
        // Dorsal arch
        z += Math.sin(normY * Math.PI) * 0.18;
      }

      // Median Sulcus groove (મધ્ય ખાંચ) along the center line (x=0)
      if (Math.abs(x) < 0.25 && z > 0) {
        const grooveDepth = (1 - Math.abs(x) / 0.25) * 0.045;
        z -= grooveDepth;
      }

      // Taper at the apex (tip of tongue)
      if (normY > 0.75) {
        const taper = 1 - (normY - 0.75) * 1.5;
        x *= Math.max(0.2, taper);
        z *= Math.max(0.3, taper);
      }

      posAttr.setXYZ(i, x, y, z);
    }
    tongueGeo.computeVertexNormals();

    const tongueTexture = createTongueMucosaTexture();
    const tongueMat = new THREE.MeshPhysicalMaterial({
      map: tongueTexture,
      color: 0xf43f5e,
      roughness: 0.28,
      metalness: 0.05,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
      emissive: 0x991b1b,
      emissiveIntensity: 0.14,
      side: THREE.DoubleSide
    });
    tongueMaterialRef.current = tongueMat;

    const tongueMesh = new THREE.Mesh(tongueGeo, tongueMat);
    // Orient tongue so dorsum faces forward-up toward viewer
    tongueMesh.rotation.x = -Math.PI / 2.3;
    tongueMesh.position.set(0, 0, 0.15);
    tongueMesh.castShadow = true;
    tongueMesh.receiveShadow = true;
    mainTongueGroup.add(tongueMesh);

    // ==========================================================
    // 2. V-SHAPED CIRCUMVALLATE PAPILLAE (કડવા સ્વાદની મોટી કલિકાઓ)
    // ==========================================================
    const papillaGeo = new THREE.CylinderGeometry(0.04, 0.048, 0.03, 16);
    const papillaMat = new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      roughness: 0.3,
      emissive: 0x881337,
      emissiveIntensity: 0.25
    });

    const vPapillaeCount = 9;
    for (let i = 0; i < vPapillaeCount; i++) {
      const pMesh = new THREE.Mesh(papillaGeo, papillaMat);
      const t = (i / (vPapillaeCount - 1)) * 2 - 1; // -1 to 1
      const px = t * 0.45;
      const py = 0.22 - Math.abs(t) * 0.15;
      const pz = -0.42 + Math.abs(t) * 0.2;
      pMesh.position.set(px, py, pz);
      mainTongueGroup.add(pMesh);
    }

    // ==========================================================
    // 3. ORAL CAVITY FRAMING: MANDIBLE, TEETH & GUMS (વાસ્તવિક મોં અને દાંત)
    // ==========================================================
    const oralFrameGroup = new THREE.Group();

    // Lower Dental Arch (દાંતની કમાન)
    const toothGeo = new THREE.BoxGeometry(0.065, 0.12, 0.08);
    const toothMat = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.2,
      metalness: 0.05
    });
    const gumMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      roughness: 0.4
    });

    // Arch of 14 lower teeth
    const teethCount = 14;
    for (let i = 0; i < teethCount; i++) {
      const angle = (i / (teethCount - 1)) * Math.PI * 0.82 + Math.PI * 0.09;
      const r = 0.76;
      const tx = Math.cos(angle) * r;
      const tz = Math.sin(angle) * r + 0.15;

      const tooth = new THREE.Mesh(toothGeo, toothMat);
      tooth.position.set(tx, -0.05, tz);
      tooth.rotation.y = -angle + Math.PI / 2;
      oralFrameGroup.add(tooth);

      // Pink gum base
      const gum = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.08, 12), gumMat);
      gum.position.set(tx, -0.12, tz);
      oralFrameGroup.add(gum);
    }

    // Throat background & soft palate with Uvula (કાકડા)
    const uvulaGeo = new THREE.SphereGeometry(0.065, 16, 16);
    uvulaGeo.scale(0.8, 1.8, 0.8);
    const uvulaMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.4,
      emissive: 0x9f1239,
      emissiveIntensity: 0.2
    });
    const uvula = new THREE.Mesh(uvulaGeo, uvulaMat);
    uvula.position.set(0, 0.65, -0.75);
    oralFrameGroup.add(uvula);

    mainTongueGroup.add(oralFrameGroup);

    // ==========================================================
    // 4. ELEGANT 3D TASTE ZONES (૪ સ્વાદ ઝોન સરફેસ ઓવરલે)
    // ==========================================================
    // Zone 1: Sweet (Tip / અગ્ર ભાગ) - Amber/Gold
    const sweetGeo = new THREE.SphereGeometry(0.24, 24, 16);
    sweetGeo.scale(1.2, 0.12, 0.8);
    const sweetMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.7
    });
    const sweetMesh = new THREE.Mesh(sweetGeo, sweetMat);
    sweetMesh.position.set(0, 0.16, 0.78);
    mainTongueGroup.add(sweetMesh);
    zoneOverlaysRef.current.set('sweet', sweetMesh);

    // Zone 2: Salty (Front Lateral / આગળની બંને બાજુ) - Cyan
    const saltyGroup = new THREE.Group();
    const saltyMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.7
    });
    const saltyLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.42, 16), saltyMat);
    saltyLeft.position.set(-0.46, 0.16, 0.38);
    saltyLeft.rotation.z = Math.PI / 2.3;
    const saltyRight = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.42, 16), saltyMat);
    saltyRight.position.set(0.46, 0.16, 0.38);
    saltyRight.rotation.z = -Math.PI / 2.3;
    saltyGroup.add(saltyLeft, saltyRight);
    mainTongueGroup.add(saltyGroup);
    zoneOverlaysRef.current.set('salty', saltyLeft);

    // Zone 3: Sour (Back Lateral / પાછળની બંને બાજુ) - Vibrant Yellow
    const sourGroup = new THREE.Group();
    const sourMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: 0xca8a04,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.7
    });
    const sourLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.44, 16), sourMat);
    sourLeft.position.set(-0.52, 0.2, -0.12);
    sourLeft.rotation.z = Math.PI / 2.3;
    const sourRight = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.44, 16), sourMat);
    sourRight.position.set(0.52, 0.2, -0.12);
    sourRight.rotation.z = -Math.PI / 2.3;
    sourGroup.add(sourLeft, sourRight);
    mainTongueGroup.add(sourGroup);
    zoneOverlaysRef.current.set('sour', sourLeft);

    // Zone 4: Bitter (Rear Base / પાછળનો ઊંડો ભાગ) - Emerald Green
    const bitterGeo = new THREE.SphereGeometry(0.36, 24, 16);
    bitterGeo.scale(1.3, 0.14, 0.6);
    const bitterMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.7
    });
    const bitterMesh = new THREE.Mesh(bitterGeo, bitterMat);
    bitterMesh.position.set(0, 0.26, -0.48);
    mainTongueGroup.add(bitterMesh);
    zoneOverlaysRef.current.set('bitter', bitterMesh);

    // ==========================================================
    // 5. DROPPED 3D FOOD CONTAINER
    // ==========================================================
    const foodGroup = new THREE.Group();
    droppedFoodGroupRef.current = foodGroup;
    mainTongueGroup.add(foodGroup);
    // Initialize with Jaggery (Sweet)
    rebuild3DFood('sweet', foodGroup);

    // ==========================================================
    // 6. BRAIN TASTE RECEPTION CENTER & ELECTRICAL SYNAPSE PULSES
    // ==========================================================
    const brainGeo = new THREE.IcosahedronGeometry(0.32, 2);
    const brainMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      wireframe: true,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.7
    });
    const brainMesh = new THREE.Mesh(brainGeo, brainMat);
    brainMesh.position.set(0, 1.7, 0.1);
    mainTongueGroup.add(brainMesh);

    // Pulsing neural particle stream connecting tongue to brain
    const nerveCount = 45;
    const nerveGeo = new THREE.BufferGeometry();
    const nervePos = new Float32Array(nerveCount * 3);
    for (let i = 0; i < nerveCount; i++) {
      nervePos[i * 3] = (Math.random() - 0.5) * 0.35;
      nervePos[i * 3 + 1] = 0.4 + Math.random() * 1.25;
      nervePos[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
    }
    nerveGeo.setAttribute('position', new THREE.BufferAttribute(nervePos, 3));
    const nerveMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.05,
      transparent: true,
      opacity: 0.85
    });
    const nervePoints = new THREE.Points(nerveGeo, nerveMat);
    mainTongueGroup.add(nervePoints);
    nervePulsesRef.current = nervePoints;

    // ==========================================================
    // 7. MICROSCOPIC TASTE BUD VIEW (સૂક્ષ્મ સ્વાદ કલિકા)
    // ==========================================================
    const microGroup = new THREE.Group();
    microscopeGroupRef.current = microGroup;
    microGroup.visible = false;
    scene.add(microGroup);

    // Papilla mound cutaway
    const moundGeo = new THREE.CylinderGeometry(0.7, 1.2, 1.1, 32);
    const moundMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.35 });
    const moundMesh = new THREE.Mesh(moundGeo, moundMat);
    microGroup.add(moundMesh);

    // Central onion-shaped Taste Bud
    const budGeo = new THREE.SphereGeometry(0.52, 24, 24);
    budGeo.scale(0.85, 1.35, 0.85);
    const budMat = new THREE.MeshPhysicalMaterial({
      color: 0xfef08a,
      roughness: 0.25,
      transparent: true,
      opacity: 0.85
    });
    const budMesh = new THREE.Mesh(budGeo, budMat);
    budMesh.position.set(0, 0.2, 0);
    microGroup.add(budMesh);

    // Receptor cells (સ્વાદ ગ્રાહી કોષો) with microvilli hairs
    for (let c = 0; c < 8; c++) {
      const cellGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.95, 12);
      const cellMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.25
      });
      const cell = new THREE.Mesh(cellGeo, cellMat);
      cell.position.set(Math.sin(c * 0.8) * 0.2, 0.2, Math.cos(c * 0.8) * 0.2);
      microGroup.add(cell);
    }

    // Sensory nerve fiber bundle (ચેતા તંતુઓ)
    const nerveFiberGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.85, 16);
    const nerveFiberMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });
    const nerveFiber = new THREE.Mesh(nerveFiberGeo, nerveFiberMat);
    nerveFiber.position.set(0, -0.65, 0);
    microGroup.add(nerveFiber);

    setIsLoading(false);
  };

  // Build authentic 3D food model on the tongue
  const rebuild3DFood = (taste: string, container: THREE.Group) => {
    while (container.children.length > 0) {
      container.remove(container.children[0]);
    }

    if (taste === 'sweet') {
      // 🍯 દેશી ગોળનો ટુકડો (Organic Jaggery cube)
      const gurGeo = new THREE.BoxGeometry(0.18, 0.16, 0.18);
      const gurMat = new THREE.MeshStandardMaterial({
        color: 0xb45309,
        roughness: 0.35,
        emissive: 0x78350f,
        emissiveIntensity: 0.2
      });
      const gur = new THREE.Mesh(gurGeo, gurMat);
      gur.position.set(0, 0.32, 0.78);
      container.add(gur);
    } else if (taste === 'salty') {
      // 🧂 સિંધવ મીઠું (Rock Salt crystals heap)
      const saltGroup = new THREE.Group();
      saltGroup.position.set(0.46, 0.3, 0.38);
      for (let i = 0; i < 6; i++) {
        const c = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.05 + Math.random() * 0.03),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.1 })
        );
        c.position.set((Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.08);
        saltGroup.add(c);
      }
      container.add(saltGroup);
    } else if (taste === 'sour') {
      // 🍋 તાજું લીંબુ (Fresh Lemon slice)
      const lemonGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16);
      const lemonMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.2,
        emissive: 0xeab308,
        emissiveIntensity: 0.3
      });
      const lemon = new THREE.Mesh(lemonGeo, lemonMat);
      lemon.position.set(0.52, 0.34, -0.12);
      lemon.rotation.x = Math.PI / 4;
      container.add(lemon);
    } else if (taste === 'bitter') {
      // 🌿 કારેલું (Bitter Gourd slice)
      const karelaGeo = new THREE.TorusGeometry(0.12, 0.04, 12, 24);
      const karelaMat = new THREE.MeshStandardMaterial({
        color: 0x15803d,
        roughness: 0.4,
        emissive: 0x14532d,
        emissiveIntensity: 0.3
      });
      const karela = new THREE.Mesh(karelaGeo, karelaMat);
      karela.position.set(0, 0.4, -0.48);
      karela.rotation.x = Math.PI / 2;
      container.add(karela);
    }
  };

  // Animation Update
  const handleUpdate = (delta: number) => {
    // Neural pulse particle stream animation
    if (nervePulsesRef.current && hasSaliva) {
      const posAttr = nervePulsesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) + delta * 0.8;
        if (y > 1.7) y = 0.4;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }

    // Subtle breathing pulse on the tongue group
    if (tongueGroupRef.current) {
      tongueGroupRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.04;
    }
  };

  // Apply Food Testing Interaction
  const applyFoodToZone = (food: FoodTasteItem) => {
    setActiveFood(food);
    const targetZone = TASTE_ZONES.find((z) => z.id === food.primaryTaste) || TASTE_ZONES[0];
    setSelectedZone(targetZone);
    if (onSelectTaste) onSelectTaste(targetZone);

    if (!hasSaliva) {
      // Page 25 Dry Tongue Experiment Result
      sounds.playClick();
      setSalivaAlert(
        `⚠️ સુકી જીભ પર સ્વાદ અનુભવાતો નથી! "${food.nameGu}" ના રસાયણો લાળરસ વગર ઓગળી શકતા નથી. સ્વાદ માટે લાળરસ અનિવાર્ય છે!`
      );
      if (droppedFoodGroupRef.current) {
        rebuild3DFood(food.primaryTaste, droppedFoodGroupRef.current);
      }
      return;
    }

    setSalivaAlert(null);
    if (droppedFoodGroupRef.current) {
      rebuild3DFood(food.primaryTaste, droppedFoodGroupRef.current);
    }

    sounds.playTasteChime(
      food.primaryTaste === 'sweet' ? 880 :
      food.primaryTaste === 'sour' ? 700 :
      food.primaryTaste === 'salty' ? 600 : 450
    );
  };

  // Toggle Saliva Sheen and Behavior (Page 25 Experiment)
  const toggleSaliva = (enable: boolean) => {
    setHasSaliva(enable);
    sounds.playClick();
    if (tongueMaterialRef.current) {
      // In dry mode, clearcoat is 0, roughness is high (matte dry tongue)
      tongueMaterialRef.current.clearcoat = enable ? 0.85 : 0.0;
      tongueMaterialRef.current.roughness = enable ? 0.28 : 0.65;
    }
    if (!enable) {
      setSalivaAlert('પાન ૨૫ પ્રયોગ: જીભ સુકાઈ ગઈ છે! હવે ખોરાક મૂકીને તપાસો.');
    } else {
      setSalivaAlert(null);
    }
  };

  useEffect(() => {
    if (tongueGroupRef.current && microscopeGroupRef.current) {
      tongueGroupRef.current.visible = !showMicroscope;
      microscopeGroupRef.current.visible = showMicroscope;
    }
  }, [showMicroscope]);

  return (
    <div className="relative w-full h-full">
      <SceneContainer
        onSceneReady={handleSceneReady}
        onUpdate={handleUpdate}
        cameraPosition={[0, 1.7, 2.6]}
        targetPosition={[0, 0.12, 0.1]}
      />

      {isLoading && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-slate-200">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-xs font-semibold">ઓરિજિનલ 3D જીભ (Realistic Anatomical Human Tongue) લોડ થઈ રહી છે...</p>
          <span className="text-[11px] text-slate-400">Loading Human Oral Cavity & Papillae</span>
        </div>
      )}

      {/* Top Left: 4 Taste Zones Selector & Saliva Mode Toggle */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-sm bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-amber-400">ઓરિજિનલ 3D જીભ મૉડેલ</span>
          <div className="flex items-center gap-1.5">
            {/* Page 25 Saliva Experiment Toggle */}
            <button
              onClick={() => toggleSaliva(!hasSaliva)}
              className={`text-[10px] px-2 py-1 rounded flex items-center gap-1 font-semibold transition-all border ${
                hasSaliva
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                  : 'bg-rose-500/25 text-rose-300 border-rose-500/40'
              }`}
              title="પાન ૨૫ પ્રયોગ: લાળરસ વગર vs લાળરસ સાથે"
            >
              {hasSaliva ? (
                <>
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span>લાળરસ સાથે</span>
                </>
              ) : (
                <>
                  <DropletOff className="w-3 h-3 text-rose-400" />
                  <span>સુકી જીભ (પાન ૨૫)</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setShowMicroscope(!showMicroscope);
              }}
              className="text-[10px] px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 font-medium transition-colors"
            >
              {showMicroscope ? 'જીભ પર પાછા' : '🔬 સ્વાદ કલિકા'}
            </button>
          </div>
        </div>

        {/* 4 Taste Zones Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {TASTE_ZONES.map((zone) => {
            const isSelected = selectedZone.id === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedZone(zone);
                  if (onSelectTaste) onSelectTaste(zone);
                }}
                className={`p-2 rounded-lg text-left text-xs transition-all border ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/20 shadow-sm'
                    : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
                  <span className="font-bold text-slate-100">{zone.tasteGu.split(' ')[0]}</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">{zone.locationGu}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Saliva Alert Banner if triggered */}
      {salivaAlert && (
        <div className="absolute top-20 left-4 right-4 sm:right-auto sm:max-w-md z-20 bg-rose-950/90 text-rose-200 border border-rose-500/50 p-2.5 rounded-xl backdrop-blur-md shadow-2xl flex items-start gap-2 text-xs">
          <DropletOff className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{salivaAlert}</p>
            <p className="text-[10px] text-rose-300/80 mt-0.5">
              પુસ્તક પાન ૨૫: લાળરસ ખોરાકના સ્વાદ રસાયણોને ઓગાળીને સ્વાદ કલિકાઓ સુધી પહોંચાડે છે.
            </p>
          </div>
          <button
            onClick={() => setSalivaAlert(null)}
            className="text-rose-400 hover:text-rose-200 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bottom Panel: Interactive Food Tasting Game from Textbook */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-lg z-10 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/70 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-100">હેન્સી અને સરોજની સ્વાદ રમત (પાન ૨૩)</h4>
              <p className="text-[11px] text-slate-400">ખોરાક પસંદ કરી જીભ પર મૂકો:</p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Brain className="w-3.5 h-3.5 text-purple-400" /> મગજમાં સિગ્નલ
          </span>
        </div>

        {/* Food Badges Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-2.5">
          {FOOD_TASTE_ITEMS.map((food) => {
            const isActive = activeFood.id === food.id;
            return (
              <button
                key={food.id}
                onClick={() => applyFoodToZone(food)}
                className={`p-1.5 rounded-lg text-center transition-all flex flex-col items-center justify-center border ${
                  isActive
                    ? 'bg-amber-500/25 border-amber-400 text-amber-300 scale-105 shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/50 text-slate-300'
                }`}
              >
                <span className="text-lg leading-none mb-1">{food.icon}</span>
                <span className="text-[10px] font-medium leading-tight truncate w-full">
                  {food.nameGu.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Food Detail Card */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-amber-400 font-semibold mb-1">
            <span>{activeFood.nameGu} ({activeFood.nameEn})</span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${selectedZone.color}25`,
                color: selectedZone.color
              }}
            >
              {selectedZone.tasteGu}
            </span>
          </div>
          <p className="text-slate-300 text-[11px] mb-1">{activeFood.descriptionGu}</p>
          <div className="text-[10px] text-slate-400 italic bg-slate-900/80 p-1.5 rounded border border-slate-800/70">
            📖 પુસ્તક સંદર્ભ: {activeFood.bookReference}
          </div>
        </div>
      </div>
    </div>
  );
};
