import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SceneContainer } from './SceneContainer';
import { BEAUMONT_TABLE } from '../../data/chapterData';
import { BeaumontExperimentFood } from '../../types/chapter';
import { sounds } from '../../utils/audio';
import { loadGLTFModel } from '../../utils/modelLoader';
import { Play, RotateCcw, Beaker, Loader2 } from 'lucide-react';

export const BeaumontStomachModel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState<BeaumontExperimentFood>(BEAUMONT_TABLE[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [windowOpen, setWindowOpen] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const stomachGroupRef = useRef<THREE.Group | null>(null);
  const beakerGroupRef = useRef<THREE.Group | null>(null);
  const stomachLiquidRef = useRef<THREE.Mesh | null>(null);
  const beakerLiquidRef = useRef<THREE.Mesh | null>(null);
  const windowFlapRef = useRef<THREE.Mesh | null>(null);
  const stomachFoodParticleRef = useRef<THREE.Mesh | null>(null);
  const beakerFoodParticleRef = useRef<THREE.Mesh | null>(null);

  const handleSceneReady = async (scene: THREE.Scene) => {
    sceneRef.current = scene;

    // Laboratory Table Surface
    const tableGeo = new THREE.BoxGeometry(6, 0.2, 4);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.1
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = -1.1;
    scene.add(tableMesh);

    // ----------------------------------------------------
    // LEFT SIDE: SOLDIER MARTIN'S "WINDOW STOMACH" (બારીવાળું પેટ)
    // ----------------------------------------------------
    const martinGroup = new THREE.Group();
    stomachGroupRef.current = martinGroup;
    martinGroup.position.set(-1.4, 0.1, 0);
    scene.add(martinGroup);

    try {
      setIsLoading(true);

      // Load authentic original organs model and extract real Stomach
      const organsGltf = await loadGLTFModel('/models/glb/organs.glb');
      let originalStomachMesh: THREE.Mesh | null = null;

      organsGltf.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const name = (mesh.name || '').toLowerCase();
          if (name.includes('stomach') && !name.includes('-line') && !originalStomachMesh) {
            originalStomachMesh = mesh.clone(true);
          }
        }
      });

      if (originalStomachMesh !== null) {
        const stomMesh = originalStomachMesh as THREE.Mesh;
        const stomBox = new THREE.Box3().setFromObject(stomMesh);
        const center = stomBox.getCenter(new THREE.Vector3());
        const size = stomBox.getSize(new THREE.Vector3());
        const targetScale = 1.1 / Math.max(size.x, size.y, size.z);

        stomMesh.scale.setScalar(targetScale);
        stomMesh.position.set(
          -center.x * targetScale,
          -center.y * targetScale,
          -center.z * targetScale
        );
        stomMesh.material = new THREE.MeshPhysicalMaterial({
          color: 0xdc2626,
          roughness: 0.35,
          transmission: 0.3,
          thickness: 0.2,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide
        });
        martinGroup.add(stomMesh);
      } else {
        const fallbackGeo = new THREE.SphereGeometry(0.48, 24, 24);
        fallbackGeo.scale(1.2, 0.9, 0.8);
        const fallbackMesh = new THREE.Mesh(
          fallbackGeo,
          new THREE.MeshStandardMaterial({ color: 0xdc2626 })
        );
        martinGroup.add(fallbackMesh);
      }

      // Torso outline for medical context
      const torsoGeo = new THREE.CylinderGeometry(0.7, 0.65, 2.0, 32);
      torsoGeo.scale(1.1, 1, 0.7);
      const torsoMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.6,
        transparent: true,
        opacity: 0.35
      });
      const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
      martinGroup.add(torsoMesh);

      // The Historical Fistula / Window Aperture (બારી)
      const windowRingGeo = new THREE.TorusGeometry(0.24, 0.04, 16, 32);
      const windowRingMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        roughness: 0.4
      });
      const windowRing = new THREE.Mesh(windowRingGeo, windowRingMat);
      windowRing.position.set(0.1, 0, 0.45);
      martinGroup.add(windowRing);

      // Skin Flap / Window Door (ચામડીની બારી)
      const flapGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.03, 24);
      const flapMat = new THREE.MeshStandardMaterial({
        color: 0xf87171,
        roughness: 0.5,
        transparent: true,
        opacity: 0.85
      });
      const flapMesh = new THREE.Mesh(flapGeo, flapMat);
      flapMesh.rotation.x = Math.PI / 2;
      flapMesh.position.set(0.1, 0, 0.47);
      martinGroup.add(flapMesh);
      windowFlapRef.current = flapMesh;

      // Churning gastric juice inside Martin's stomach
      const gastricJuiceGeo = new THREE.SphereGeometry(0.36, 20, 20);
      gastricJuiceGeo.scale(1.1, 0.7, 0.7);
      const gastricJuiceMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.2,
        emissive: 0xb45309,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.85
      });
      const gastricJuice = new THREE.Mesh(gastricJuiceGeo, gastricJuiceMat);
      gastricJuice.position.set(0, -0.05, 0.05);
      martinGroup.add(gastricJuice);
      stomachLiquidRef.current = gastricJuice;

      // Food particle inside Martin's stomach
      const foodStomachGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const foodStomachMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const foodStomach = new THREE.Mesh(foodStomachGeo, foodStomachMat);
      foodStomach.position.set(0.05, 0.05, 0.1);
      martinGroup.add(foodStomach);
      stomachFoodParticleRef.current = foodStomach;

      // Rubber Tube used by Dr. Beaumont to extract gastric juice
      const tubeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.08, 0, 0.3),
        new THREE.Vector3(0.3, 0.2, 0.5),
        new THREE.Vector3(0.7, 0.1, 0.6),
        new THREE.Vector3(1.1, -0.3, 0.4)
      ]);
      const tubeGeo = new THREE.TubeGeometry(tubeCurve, 32, 0.028, 12, false);
      const tubeMat = new THREE.MeshPhysicalMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.7,
        roughness: 0.2
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      martinGroup.add(tubeMesh);

      // ----------------------------------------------------
      // RIGHT SIDE: LABORATORY GLASS BEAKER (પ્યાલામાં પ્રયોગ)
      // ----------------------------------------------------
      const beakerGroup = new THREE.Group();
      beakerGroupRef.current = beakerGroup;
      beakerGroup.position.set(1.4, -0.2, 0);
      scene.add(beakerGroup);

      // Laboratory Stand
      const standBaseGeo = new THREE.BoxGeometry(0.8, 0.06, 0.8);
      const standBaseMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
      const standBase = new THREE.Mesh(standBaseGeo, standBaseMat);
      standBase.position.y = -0.7;
      beakerGroup.add(standBase);

      const standRodGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.6, 16);
      const standRod = new THREE.Mesh(standRodGeo, standBaseMat);
      standRod.position.set(-0.35, 0.1, -0.3);
      beakerGroup.add(standRod);

      // Glass Beaker Cylinder
      const beakerGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.95, 32, 1, true);
      const beakerMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.95,
        opacity: 0.2,
        transparent: true,
        roughness: 0.08,
        ior: 1.5,
        thickness: 0.08,
        side: THREE.DoubleSide
      });
      const beakerMesh = new THREE.Mesh(beakerGeo, beakerMat);
      beakerMesh.position.y = -0.15;
      beakerGroup.add(beakerMesh);

      // Beaker Bottom
      const beakerBottomGeo = new THREE.CircleGeometry(0.45, 32);
      const beakerBottom = new THREE.Mesh(beakerBottomGeo, beakerMat);
      beakerBottom.rotation.x = -Math.PI / 2;
      beakerBottom.position.y = -0.62;
      beakerGroup.add(beakerBottom);

      // Extracted Gastric Juice in Beaker (Static liquid at 30°C)
      const beakerJuiceGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.55, 32);
      const beakerJuiceMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.7,
        roughness: 0.2
      });
      const beakerJuice = new THREE.Mesh(beakerJuiceGeo, beakerJuiceMat);
      beakerJuice.position.y = -0.35;
      beakerGroup.add(beakerJuice);
      beakerLiquidRef.current = beakerJuice;

      // Thermometer (30°C Body Temp maintainer)
      const thermGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.85, 16);
      const thermMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
      const therm = new THREE.Mesh(thermGeo, thermMat);
      therm.position.set(0.2, 0.1, 0.1);
      therm.rotation.z = -0.2;
      beakerGroup.add(therm);

      // Food particle inside beaker
      const foodBeakerGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const foodBeakerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const foodBeaker = new THREE.Mesh(foodBeakerGeo, foodBeakerMat);
      foodBeaker.position.set(-0.05, -0.35, 0.05);
      beakerGroup.add(foodBeaker);
      beakerFoodParticleRef.current = foodBeaker;

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load authentic stomach model:', err);
      setIsLoading(false);
    }
  };

  const handleUpdate = (delta: number) => {
    if (stomachLiquidRef.current) {
      const time = performance.now() * 0.004;
      stomachLiquidRef.current.scale.x = 1.1 + Math.sin(time) * 0.14;
      stomachLiquidRef.current.scale.y = 0.7 + Math.cos(time * 1.5) * 0.1;
      stomachLiquidRef.current.rotation.y += delta * 0.8;
    }

    if (windowFlapRef.current) {
      const targetZ = windowOpen ? 0.7 : 0.47;
      const targetRot = windowOpen ? 0.8 : 0;
      windowFlapRef.current.position.z += (targetZ - windowFlapRef.current.position.z) * 0.1;
      windowFlapRef.current.rotation.y += (targetRot - windowFlapRef.current.rotation.y) * 0.1;
    }

    if (isRunning) {
      setProgress((prev) => {
        const next = prev + delta * 0.15;
        if (next >= 1) {
          setIsRunning(false);
          sounds.playSuccess();
          return 1;
        }
        return next;
      });

      const ratio = selectedFood.timeStomachHours / selectedFood.timeBeakerHours;
      const stomachDigestedRatio = Math.min(1, progress / ratio);
      const beakerDigestedRatio = progress;

      if (stomachFoodParticleRef.current) {
        const s = Math.max(0.01, 1 - stomachDigestedRatio);
        stomachFoodParticleRef.current.scale.set(s, s, s);
      }
      if (beakerFoodParticleRef.current) {
        const s = Math.max(0.01, 1 - beakerDigestedRatio * 0.6);
        beakerFoodParticleRef.current.scale.set(s, s, s);
      }
    }
  };

  const handleStartExperiment = () => {
    sounds.playClick();
    sounds.playChurn();
    setProgress(0);
    setIsRunning(true);
  };

  const handleReset = () => {
    sounds.playClick();
    setIsRunning(false);
    setProgress(0);
    if (stomachFoodParticleRef.current) stomachFoodParticleRef.current.scale.set(1, 1, 1);
    if (beakerFoodParticleRef.current) beakerFoodParticleRef.current.scale.set(1, 1, 1);
  };

  return (
    <div className="relative w-full h-full">
      <SceneContainer
        onSceneReady={handleSceneReady}
        onUpdate={handleUpdate}
        cameraPosition={[0, 0.8, 3.8]}
        targetPosition={[0, -0.1, 0]}
      />

      {isLoading && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-slate-200">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-xs font-semibold">અસલી 3D જઠર (Stomach) મૉડેલ લોડ થઈ રહ્યું છે...</p>
        </div>
      )}

      {/* Top Banner: Story Context */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-md z-10 bg-slate-900/85 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 shadow-xl">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-amber-400">ઇ.સ. ૧૮૨૨: ડો. બ્યુમોન્ટ અને માર્ટિન</span>
          <button
            onClick={() => {
              sounds.playClick();
              setWindowOpen(!windowOpen);
            }}
            className={`text-[10px] px-2 py-0.5 rounded font-medium border transition-colors ${
              windowOpen
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {windowOpen ? 'બારી ખુલ્લી છે (Fistula Open)' : 'બારી બંધ કરો'}
          </button>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          માર્ટિન નામના સૈનિકને ગોળી વાગ્યા પછી પેટમાં કાણું (બારી) રહી ગયું. ડોક્ટરે તેમાંથી પાચકરસ કાઢીને
          સાબિત કર્યું કે ખોરાક બહાર કરતાં પેટમાં ઘણો ઝડપથી પચે છે!
        </p>
      </div>

      {/* Bottom Panel: Textbook Digestion Race Experiment */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xl z-10 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/70 shadow-2xl">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-rose-500/20 rounded-lg text-rose-400">
              <Beaker className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-100">પાચન સમય સરખામણી પ્રયોગ</h4>
              <p className="text-[11px] text-slate-400">પુસ્તકના કોષ્ટકમાંથી વાનગી પસંદ કરો:</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleStartExperiment}
              disabled={isRunning}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isRunning
                  ? 'bg-amber-500/50 text-slate-900 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'પ્રયોગ ચાલુ છે...' : 'પ્રયોગ શરૂ કરો'}</span>
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6 Food Buttons from Page 31 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2.5">
          {BEAUMONT_TABLE.map((item) => {
            const isSel = selectedFood.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedFood(item);
                  setProgress(0);
                  setIsRunning(false);
                }}
                className={`p-1.5 rounded-lg text-left text-[11px] transition-all border ${
                  isSel
                    ? 'bg-rose-500/20 border-rose-400 text-rose-200 font-medium'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="font-semibold truncate">{item.nameGu}</div>
                <div className="text-[10px] text-slate-400">પેટ: {item.timeStomachGu.split(' ')[0]} ક.</div>
              </button>
            );
          })}
        </div>

        {/* Real-time Side-by-Side Comparison Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
          <div className="p-2 rounded-md bg-red-950/40 border border-red-900/40">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-red-300">🔴 માર્ટિનના પેટમાં (Stomach)</span>
              <span className="font-mono text-amber-400 text-[11px]">{selectedFood.timeStomachGu}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mb-1 overflow-hidden">
              <div
                className="bg-red-500 h-full rounded-full transition-all duration-200"
                style={{
                  width: `${Math.min(100, (progress / (selectedFood.timeStomachHours / selectedFood.timeBeakerHours)) * 100)}%`
                }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              સ્નાયુઓ ખોરાકને સતત વલોવે છે (ઝડપી પાચન!)
            </p>
          </div>

          <div className="p-2 rounded-md bg-yellow-950/40 border border-yellow-900/40">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-yellow-300">🧪 બહાર પ્યાલામાં (Beaker 30°C)</span>
              <span className="font-mono text-amber-400 text-[11px]">{selectedFood.timeBeakerGu}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mb-1 overflow-hidden">
              <div
                className="bg-yellow-500 h-full rounded-full transition-all duration-200"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              પ્રવાહી સ્થિર હોવાથી બમણો સમય લાગે છે!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
