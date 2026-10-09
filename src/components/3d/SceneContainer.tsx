import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface SceneContainerProps {
  children?: React.ReactNode;
  onSceneReady: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => void;
  onUpdate?: (delta: number) => void;
  cameraPosition?: [number, number, number];
  targetPosition?: [number, number, number];
  autoRotateDefault?: boolean;
}

export const SceneContainer: React.FC<SceneContainerProps> = ({
  onSceneReady,
  onUpdate,
  cameraPosition = [0, 1.2, 4.5],
  targetPosition = [0, 0.5, 0],
  autoRotateDefault = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);
  const [isDragging, setIsDragging] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Orbit state
  const orbitState = useRef({
    spherical: new THREE.Spherical(
      Math.hypot(cameraPosition[0] - targetPosition[0], cameraPosition[1] - targetPosition[1], cameraPosition[2] - targetPosition[2]),
      Math.acos(Math.max(-1, Math.min(1, (cameraPosition[1] - targetPosition[1]) / Math.hypot(cameraPosition[0] - targetPosition[0], cameraPosition[1] - targetPosition[1], cameraPosition[2] - targetPosition[2])))),
      Math.atan2(cameraPosition[0] - targetPosition[0], cameraPosition[2] - targetPosition[2])
    ),
    target: new THREE.Vector3(...targetPosition),
    prevMouse: { x: 0, y: 0 },
    autoRotate: autoRotateDefault,
    isPointerDown: false
  });

  orbitState.current.autoRotate = autoRotate;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.05);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(...cameraPosition);
    camera.lookAt(...targetPosition);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting: Three-Point Studio Lighting (Key, Fill, Rim)
    const ambientLight = new THREE.AmbientLight(0xf1f5f9, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    fillLight.position.set(-4, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 0.8);
    rimLight.position.set(0, -3, -4);
    scene.add(rimLight);

    // Subtle grid platform
    const grid = new THREE.GridHelper(10, 20, 0x334155, 0x1e293b);
    grid.position.y = -1.2;
    scene.add(grid);

    // Notify parent to build model
    onSceneReady(scene, camera, renderer);

    // 5. Mouse/Touch Orbit Controls
    const handlePointerDown = (e: PointerEvent) => {
      orbitState.current.isPointerDown = true;
      orbitState.current.prevMouse = { x: e.clientX, y: e.clientY };
      setIsDragging(true);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!orbitState.current.isPointerDown) return;
      const deltaX = e.clientX - orbitState.current.prevMouse.x;
      const deltaY = e.clientY - orbitState.current.prevMouse.y;
      orbitState.current.prevMouse = { x: e.clientX, y: e.clientY };

      const rotateSpeed = 0.006;
      orbitState.current.spherical.theta -= deltaX * rotateSpeed;
      orbitState.current.spherical.phi = Math.max(
        0.1,
        Math.min(Math.PI - 0.1, orbitState.current.spherical.phi - deltaY * rotateSpeed)
      );
    };

    const handlePointerUp = () => {
      orbitState.current.isPointerDown = false;
      setIsDragging(false);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.0015;
      orbitState.current.spherical.radius = Math.max(
        1.5,
        Math.min(12, orbitState.current.spherical.radius + e.deltaY * zoomSpeed)
      );
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Context lost & restored
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('WebGL Context Lost');
    };
    const handleContextRestored = () => {
      console.info('WebGL Context Restored');
      handleResize();
    };
    dom.addEventListener('webglcontextlost', handleContextLost);
    dom.addEventListener('webglcontextrestored', handleContextRestored);

    // 6. Animation Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (orbitState.current.autoRotate && !orbitState.current.isPointerDown) {
        orbitState.current.spherical.theta += 0.4 * delta;
      }

      // Update camera position from spherical coords
      const offset = new THREE.Vector3().setFromSpherical(orbitState.current.spherical);
      camera.position.copy(orbitState.current.target).add(offset);
      camera.lookAt(orbitState.current.target);

      if (onUpdate) {
        onUpdate(delta);
      }

      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      dom.removeEventListener('pointerdown', handlePointerDown);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('webglcontextlost', handleContextLost);
      dom.removeEventListener('webglcontextrestored', handleContextRestored);
      if (mount && renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const resetView = () => {
    orbitState.current.spherical.radius = Math.hypot(
      cameraPosition[0] - targetPosition[0],
      cameraPosition[1] - targetPosition[1],
      cameraPosition[2] - targetPosition[2]
    );
    orbitState.current.spherical.theta = Math.atan2(cameraPosition[0] - targetPosition[0], cameraPosition[2] - targetPosition[2]);
    orbitState.current.spherical.phi = Math.acos(
      Math.max(-1, Math.min(1, (cameraPosition[1] - targetPosition[1]) / orbitState.current.spherical.radius))
    );
    orbitState.current.target.set(...targetPosition);
  };

  const zoomDelta = (delta: number) => {
    orbitState.current.spherical.radius = Math.max(
      1.5,
      Math.min(12, orbitState.current.spherical.radius + delta)
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <div
        ref={mountRef}
        className={`w-full h-full cursor-grab active:cursor-grabbing ${isDragging ? 'cursor-grabbing' : ''}`}
      />

      {/* Floating 3D Controls HUD */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 p-1.5 bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/60 shadow-lg text-slate-200">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? "ઓટો-રોટેશન બંધ કરો" : "ઓટો-રોટેશન ચાલુ કરો"}
          className={`p-2 rounded-lg text-xs transition-colors flex items-center gap-1 ${
            autoRotate ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          <span className="hidden sm:inline text-xs font-medium">રોટેટ</span>
        </button>

        <div className="w-px h-4 bg-slate-700" />

        <button
          onClick={() => zoomDelta(-0.8)}
          title="નજીક જુઓ (Zoom In)"
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => zoomDelta(0.8)}
          title="દૂર જુઓ (Zoom Out)"
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={resetView}
          title="વ્યૂ રીસેટ કરો"
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Controls Hint */}
      <div className="absolute bottom-3 left-4 z-10 pointer-events-none text-[11px] text-slate-400 bg-slate-900/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800/80">
        🖱️ ફેરવવા માટે ડ્રેગ કરો · ઝૂમ કરવા માટે સ્ક્રોલ કરો
      </div>
    </div>
  );
};
