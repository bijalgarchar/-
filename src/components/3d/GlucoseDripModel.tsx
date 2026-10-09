import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SceneContainer } from './SceneContainer';
import { sounds } from '../../utils/audio';
import { loadGLTFModel } from '../../utils/modelLoader';
import { Activity, Droplet, Zap, Heart, RotateCcw, Loader2 } from 'lucide-react';

export const GlucoseDripModel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dripRate, setDripRate] = useState<number>(30);
  const [energyLevel, setEnergyLevel] = useState<number>(35);
  const [isDripping, setIsDripping] = useState<boolean>(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const dropMeshRef = useRef<THREE.Mesh | null>(null);
  const bloodCellsRef = useRef<THREE.InstancedMesh | null>(null);
  const glucoseMoleculesRef = useRef<THREE.InstancedMesh | null>(null);
  const vesselsGroupRef = useRef<THREE.Group | null>(null);

  const dropAnimRef = useRef({ y: 0.85, speed: 1.2 });

  const handleSceneReady = async (scene: THREE.Scene) => {
    sceneRef.current = scene;

    // ----------------------------------------------------
    // LEFT SIDE: 3D IV STAND & GLUCOSE BOTTLE
    // ----------------------------------------------------
    const standGroup = new THREE.Group();
    standGroup.position.set(-1.1, 0, 0);
    scene.add(standGroup);

    // Chrome IV pole
    const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 3.2, 16);
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2
    });
    const pole = new THREE.Mesh(poleGeo, chromeMat);
    pole.position.y = 0.4;
    standGroup.add(pole);

    // IV Stand base spider legs
    for (let i = 0; i < 4; i++) {
      const legGeo = new THREE.BoxGeometry(0.04, 0.04, 0.5);
      const leg = new THREE.Mesh(legGeo, chromeMat);
      leg.position.set(0, -1.15, 0.25);
      leg.rotation.y = (i * Math.PI) / 2;
      standGroup.add(leg);
    }

    // Top Hanger Arm
    const armGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 12);
    const arm = new THREE.Mesh(armGeo, chromeMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(0.18, 1.8, 0);
    standGroup.add(arm);

    // Glucose Bottle Body
    const bottleGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.75, 24);
    const bottleMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 0.35,
      transparent: true,
      roughness: 0.1,
      ior: 1.45
    });
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    bottle.position.set(0.28, 1.35, 0);
    standGroup.add(bottle);

    // Cap
    const capGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(0.28, 0.81, 0);
    standGroup.add(cap);

    // Glucose Saline Liquid inside bottle
    const liquidGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.6, 24);
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1
    });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.set(0.28, 1.35, 0);
    standGroup.add(liquid);

    // Drip Chamber
    const chamberGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.22, 16);
    const chamberMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      transparent: true,
      opacity: 0.4
    });
    const chamber = new THREE.Mesh(chamberGeo, chamberMat);
    chamber.position.set(0.28, 0.65, 0);
    standGroup.add(chamber);

    // Animated Falling Drop
    const dropGeo = new THREE.SphereGeometry(0.022, 12, 12);
    dropGeo.scale(0.8, 1.4, 0.8);
    const dropMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4
    });
    const drop = new THREE.Mesh(dropGeo, dropMat);
    drop.position.set(0.28, 0.7, 0);
    standGroup.add(drop);
    dropMeshRef.current = drop;

    // Flexible Infusion Tube
    const tubeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.28, 0.54, 0),
      new THREE.Vector3(0.28, 0.1, 0.1),
      new THREE.Vector3(0.6, -0.2, 0.2),
      new THREE.Vector3(1.2, -0.4, 0.1)
    ]);
    const tubeGeo = new THREE.TubeGeometry(tubeCurve, 32, 0.018, 12, false);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.6,
      roughness: 0.2
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    standGroup.add(tube);

    // ----------------------------------------------------
    // RIGHT SIDE: AUTHENTIC VASCULAR NETWORK & MAGNIFIED VESSEL
    // ----------------------------------------------------
    const vesselGroup = new THREE.Group();
    vesselGroup.position.set(1.2, -0.2, 0);
    scene.add(vesselGroup);

    try {
      setIsLoading(true);

      // Load authentic human blood vessels model
      const vesselsGltf = await loadGLTFModel('/models/glb/vessels.glb');
      vesselsGroupRef.current = vesselsGltf;

      const vesselBox = new THREE.Box3().setFromObject(vesselsGltf);
      const center = vesselBox.getCenter(new THREE.Vector3());
      const size = vesselBox.getSize(new THREE.Vector3());
      const scaleFactor = 1.6 / Math.max(size.x, size.y, size.z);

      vesselsGltf.scale.setScalar(scaleFactor);
      vesselsGltf.position.set(
        -center.x * scaleFactor + 0.3,
        -center.y * scaleFactor + 0.1,
        -center.z * scaleFactor - 0.4
      );

      // Blue vein & red artery shader
      vesselsGltf.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const name = (mesh.name || '').toLowerCase();
          if (name.includes('-line') || name.includes('.line')) {
            mesh.visible = false;
            return;
          }
          const isVein = name.includes('vein') || name.includes('vena') || name.includes('jugular');
          mesh.material = new THREE.MeshStandardMaterial({
            color: isVein ? 0x0284c7 : 0xdc2626,
            roughness: 0.4,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide
          });
        }
      });
      vesselGroup.add(vesselsGltf);

      // Magnified cross-section transparent vessel
      const mainVesselGeo = new THREE.CylinderGeometry(0.55, 0.55, 2.6, 32, 1, true);
      const mainVesselMat = new THREE.MeshPhysicalMaterial({
        color: 0xbe123c,
        roughness: 0.3,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const mainVessel = new THREE.Mesh(mainVesselGeo, mainVesselMat);
      mainVessel.rotation.z = Math.PI / 2;
      vesselGroup.add(mainVessel);

      // Red Blood Cells
      const rbcCount = 35;
      const rbcGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16);
      rbcGeo.scale(1, 1, 0.9);
      const rbcMat = new THREE.MeshStandardMaterial({
        color: 0x991b1b,
        roughness: 0.4
      });
      const rbcInstanced = new THREE.InstancedMesh(rbcGeo, rbcMat, rbcCount);
      const dummyRBC = new THREE.Object3D();
      for (let i = 0; i < rbcCount; i++) {
        dummyRBC.position.set(
          (Math.random() - 0.5) * 2.2,
          (Math.random() - 0.5) * 0.65,
          (Math.random() - 0.5) * 0.65
        );
        dummyRBC.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        dummyRBC.updateMatrix();
        rbcInstanced.setMatrixAt(i, dummyRBC.matrix);
      }
      vesselGroup.add(rbcInstanced);
      bloodCellsRef.current = rbcInstanced;

      // Glowing Glucose Molecules
      const glucCount = 45;
      const glucGeo = new THREE.OctahedronGeometry(0.045, 0);
      const glucMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
        roughness: 0.1
      });
      const glucInstanced = new THREE.InstancedMesh(glucGeo, glucMat, glucCount);
      const dummyGluc = new THREE.Object3D();
      for (let i = 0; i < glucCount; i++) {
        dummyGluc.position.set(
          (Math.random() - 0.5) * 2.0,
          (Math.random() - 0.5) * 0.55,
          (Math.random() - 0.5) * 0.55
        );
        dummyGluc.scale.setScalar(0.7 + Math.random() * 0.5);
        dummyGluc.updateMatrix();
        glucInstanced.setMatrixAt(i, dummyGluc.matrix);
      }
      vesselGroup.add(glucInstanced);
      glucoseMoleculesRef.current = glucInstanced;

      // Cannula needle
      const needleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 12);
      const needleMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.8 });
      const needle = new THREE.Mesh(needleGeo, needleMat);
      needle.position.set(0, 0.55, 0);
      needle.rotation.z = -0.4;
      vesselGroup.add(needle);

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load blood vessel model:', err);
      setIsLoading(false);
    }
  };

  const handleUpdate = (delta: number) => {
    if (isDripping && dropMeshRef.current) {
      dropAnimRef.current.y -= delta * (dripRate / 20);
      if (dropAnimRef.current.y < 0.58) {
        dropAnimRef.current.y = 0.74;
        sounds.playDrip();
        setEnergyLevel((prev) => Math.min(100, prev + 0.15));
      }
      dropMeshRef.current.position.y = dropAnimRef.current.y;
    }

    if (bloodCellsRef.current) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < 35; i++) {
        bloodCellsRef.current.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        dummy.position.x += delta * 0.8;
        if (dummy.position.x > 1.2) dummy.position.x = -1.2;
        dummy.rotation.x += delta * 0.5;
        dummy.updateMatrix();
        bloodCellsRef.current.setMatrixAt(i, dummy.matrix);
      }
      bloodCellsRef.current.instanceMatrix.needsUpdate = true;
    }

    if (glucoseMoleculesRef.current) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < 45; i++) {
        glucoseMoleculesRef.current.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        dummy.position.x += delta * 1.1;
        if (dummy.position.x > 1.2) dummy.position.x = -1.2;
        dummy.rotation.y += delta * 1.2;
        dummy.updateMatrix();
        glucoseMoleculesRef.current.setMatrixAt(i, dummy.matrix);
      }
      glucoseMoleculesRef.current.instanceMatrix.needsUpdate = true;
    }
  };

  const handleResetEnergy = () => {
    sounds.playClick();
    setEnergyLevel(20);
  };

  return (
    <div className="relative w-full h-full">
      <SceneContainer
        onSceneReady={handleSceneReady}
        onUpdate={handleUpdate}
        cameraPosition={[0, 0.6, 3.6]}
        targetPosition={[0, 0.4, 0]}
      />

      {isLoading && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-slate-200">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs font-semibold">અસલી 3D રક્તવાહિની (Vessels) મૉડેલ લોડ થઈ રહ્યું છે...</p>
        </div>
      )}

      {/* Top Banner */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-md z-10 bg-slate-900/85 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 bg-cyan-500/20 text-cyan-400 rounded-md">
            <Activity className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-slate-100">સાનિયાની સ્થિતિ અને ગ્લુકોઝ ડ્રિપ</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          ઝાડા-ઉલટી થવાથી સાનિયાના પેટમાં કશું જ ટકતું ન હતું અને ચક્કર આવતા હતા. ડોક્ટરે સમજાવ્યું:
          <span className="text-cyan-300 font-medium"> “ગ્લુકોઝ બોટલ જમ્યા વગર પણ તને તરત જ તાકાત આપશે!”</span>
        </p>
      </div>

      {/* Bottom Panel */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-lg z-10 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/70 shadow-2xl">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400">
              <Zap className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-100">રક્તવાહિનીમાં ગ્લુકોઝનું સીધું શોષણ</h4>
              <p className="text-[11px] text-slate-400">પાચન વગર સીધું કોષો સુધી પહોંચે છે</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playClick();
                setIsDripping(!isDripping);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                isDripping
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {isDripping ? 'ડ્રિપ ચાલુ છે' : 'ડ્રિપ રોકો'}
            </button>
            <button
              onClick={handleResetEnergy}
              title="રીસેટ"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Energy Meter Bar */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Heart className={`w-3.5 h-3.5 ${energyLevel > 50 ? 'text-red-400 fill-red-400' : 'text-slate-400'}`} />
              શરીરની તાકાત (Energy Level)
            </span>
            <span className="font-mono text-cyan-400 font-bold text-xs">{Math.round(energyLevel)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                energyLevel < 40 ? 'bg-amber-500' : energyLevel < 80 ? 'bg-cyan-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${energyLevel}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>{energyLevel < 40 ? '⚠️ નબળાઈ અને ચક્કર' : energyLevel < 80 ? '⚡ તાકાત પાછી આવે છે' : '✅ સંપૂર્ણ સ્વસ્થ'}</span>
            <span>ગ્લુકોઝ સીધું લોહીમાં ભળે છે</span>
          </div>
        </div>

        {/* Drip Rate Slider */}
        <div className="flex items-center justify-between gap-3 text-xs bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-300 flex items-center gap-1 text-[11px]">
            <Droplet className="w-3.5 h-3.5 text-cyan-400" /> ડ્રિપ ઝડપ:
          </span>
          <input
            type="range"
            min="10"
            max="80"
            value={dripRate}
            onChange={(e) => setDripRate(Number(e.target.value))}
            className="w-32 accent-cyan-400"
          />
          <span className="font-mono text-cyan-300 text-[11px]">{dripRate} ટીપાં/મિનિટ</span>
        </div>
      </div>
    </div>
  );
};
