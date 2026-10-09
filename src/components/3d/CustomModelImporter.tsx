import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { SceneContainer } from './SceneContainer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import { normalizeModelBounds } from '../../utils/modelLoader';
import { sounds } from '../../utils/audio';
import { Upload, Globe, Check, AlertCircle, Loader2, Sparkles, Box } from 'lucide-react';

interface PresetModel {
  nameGu: string;
  nameEn: string;
  url: string;
  descriptionGu: string;
}

const PRESET_MODELS: PresetModel[] = [
  {
    nameGu: 'ઓરિજિનલ ગુજરાતી સમતોલ થાળી',
    nameEn: 'Original Gujarati Balanced Thali',
    url: '/models/glb/thali_gujarati_original.glb',
    descriptionGu: 'રોટલી, દાળ, શાક, ભાત, કચુંબર અને દહીં સાથેની મૂળ સમતોલ આહાર થાળી.'
  },
  {
    nameGu: 'ઓરિજિનલ જંક ફૂડ થાળી',
    nameEn: 'Original Fast-Food Junk Thali',
    url: '/models/glb/thali_junk_original.glb',
    descriptionGu: 'બર્ગર, ફ્રેન્ચ ફ્રાઈઝ અને સોડા કેન સાથેની મૂળ જંક ફૂડ પ્લેટ.'
  },
  {
    nameGu: 'ઓરિજિનલ માનવ જીભ (Realistic Tongue)',
    nameEn: 'Human Oral Tongue & Papillae (Original)',
    url: '/models/glb/tongue_realistic.glb',
    descriptionGu: 'જીભની વાસ્તવિક સપાટી, પેપિલા અને સ્વાદ કેન્દ્રો ધરાવતું મૂળ 3D મૉડેલ.'
  },
  {
    nameGu: 'અસલી દાંત અને જડબું (Original Teeth & Jaw)',
    nameEn: 'Complete 28 Teeth & Mandible (Original)',
    url: '/models/glb/teeth_jaw_original.glb',
    descriptionGu: 'માનવ જડબું (Mandible, Maxilla) અને ૨૮ અસલી દાંત (કાપવાના, રાક્ષસી, દાઢ) ધરાવતું મૂળ 3D મૉડેલ.'
  },
  {
    nameGu: 'સંપૂર્ણ આંતરિક પાચન અંગો (Clean Digestive)',
    nameEn: 'Full Digestive Organs (Purified)',
    url: '/models/glb/organs.glb',
    descriptionGu: 'માનવ શરીરના તમામ આંતરિક પાચન અંગો (જઠર, યકૃત, આંતરડું, અન્નનળી)નું અસલી વૈજ્ઞાનિક મૉડેલ.'
  },
  {
    nameGu: 'માનવ કંકાલતંત્ર અને જડબું',
    nameEn: 'Human Skeleton & Skull (Original)',
    url: '/models/glb/skeleton.glb',
    descriptionGu: 'દાંત, જડબું, પાંસળીઓ અને કરોડરજ્જુ ધરાવતું મૂળ કંકાલતંત્ર મૉડેલ.'
  },
  {
    nameGu: 'રક્તવાહિની તંત્ર (Vascular Tree)',
    nameEn: 'Cardiovascular Vessels (Original)',
    url: '/models/glb/vessels.glb',
    descriptionGu: 'શરીરની અસલી નસો (શિરાઓ અને ધમનીઓ) જ્યાં ગ્લુકોઝ અને પોષકતત્ત્વોનું વહન થાય છે.'
  }
];

export const CustomModelImporter: React.FC = () => {
  const [activeUrl, setActiveUrl] = useState<string>(PRESET_MODELS[0].url);
  const [customInputUrl, setCustomInputUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<{ meshCount: number; vertexCount: number } | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const importedRootRef = useRef<THREE.Group | null>(null);

  const loadModelFromSource = async (source: string | ArrayBuffer) => {
    if (!sceneRef.current) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await MeshoptDecoder.ready;
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);

      const handleSuccess = (gltf: { scene: THREE.Group }) => {
        if (importedRootRef.current && sceneRef.current) {
          sceneRef.current.remove(importedRootRef.current);
        }

        const model = gltf.scene;
        importedRootRef.current = model;

        // Count meshes and vertices
        let meshCount = 0;
        let vertexCount = 0;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            const name = (m.name || '').toLowerCase();
            // Filter lines & genital parts
            if (
              name.includes('-line') || name.includes('.line') ||
              name.includes('penis') || name.includes('genital') || name.includes('scrotum') ||
              name.includes('testis') || name.includes('testicle') || name.includes('urethra') ||
              name.includes('prostate') || name.includes('epididymis') || name.includes('glans') ||
              name.includes('corpus') || name.includes('pudend')
            ) {
              m.visible = false;
              return;
            }
            meshCount++;
            if (m.geometry && m.geometry.attributes.position) {
              vertexCount += m.geometry.attributes.position.count;
            }
            m.castShadow = true;
            m.receiveShadow = true;
          }
        });

        setModelInfo({ meshCount, vertexCount });

        // Normalize bounds to fit camera
        normalizeModelBounds(model, 2.4);

        sceneRef.current?.add(model);
        setIsLoading(false);
        sounds.playSuccess();
      };

      if (typeof source === 'string') {
        loader.load(
          source,
          handleSuccess,
          undefined,
          (err) => {
            console.error('Error loading 3D model:', err);
            setErrorMsg('મૉડેલ લોડ કરવામાં ભૂલ આવી. કૃપા કરીને યોગ્ય GLB/GLTF લિંક તપાસો.');
            setIsLoading(false);
          }
        );
      } else {
        loader.parse(
          source,
          '',
          handleSuccess,
          (err) => {
            console.error('Error parsing 3D file:', err);
            setErrorMsg('ફાઈલ પ્રોસેસ કરવામાં ભૂલ આવી. ખાતરી કરો કે આ માન્ય .glb ફાઈલ છે.');
            setIsLoading(false);
          }
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('મૉડેલ પ્રોસેસિંગમાં સમસ્યા આવી.');
      setIsLoading(false);
    }
  };

  const handleSceneReady = (scene: THREE.Scene) => {
    sceneRef.current = scene;
    loadModelFromSource(activeUrl);
  };

  // Local File Upload Handler (.glb / .gltf)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        loadModelFromSource(buffer);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputUrl.trim()) return;
    sounds.playClick();
    setActiveUrl(customInputUrl.trim());
    loadModelFromSource(customInputUrl.trim());
  };

  return (
    <div className="relative w-full h-full">
      <SceneContainer
        onSceneReady={handleSceneReady}
        cameraPosition={[0, 0.4, 3.2]}
        targetPosition={[0, 0, 0]}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-slate-200">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-xs font-semibold">3D મૉડેલ પ્રોસેસ થઈ રહ્યું છે...</p>
        </div>
      )}

      {/* Top Banner & Preset Selector */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-md bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/70 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-amber-500/20 text-amber-400 rounded-lg">
            <Box className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-100">ઓરિજિનલ 3D મોડેલ લાઇબ્રેરી</h4>
            <p className="text-[11px] text-slate-400">અસલી ઓપન-સોર્સ મેડિકલ મૉડેલ્સ</p>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="grid grid-cols-1 gap-1.5 mt-1">
          {PRESET_MODELS.map((preset) => {
            const isSelected = activeUrl === preset.url;
            return (
              <button
                key={preset.url}
                onClick={() => {
                  sounds.playClick();
                  setActiveUrl(preset.url);
                  loadModelFromSource(preset.url);
                }}
                className={`p-2 rounded-lg text-left text-xs transition-all border ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold'
                    : 'bg-slate-800/70 hover:bg-slate-700 border-slate-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span>{preset.nameGu}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="text-[10px] text-slate-400 font-normal">{preset.descriptionGu}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Panel: Upload or External URL Loader */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xl z-10 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/70 shadow-2xl">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-cyan-500/20 text-cyan-400 rounded-md">
              <Globe className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-100">બહારથી કોઈપણ 3D મૉડેલ ઉમેરો (Custom GLB)</h4>
              <p className="text-[11px] text-slate-400">કોમ્પ્યુટરમાંથી અપલોડ કરો અથવા વેબ લિંક નાખો:</p>
            </div>
          </div>

          {modelInfo && (
            <div className="text-[10px] font-mono text-cyan-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              {modelInfo.meshCount} Meshes · {Math.round(modelInfo.vertexCount / 1000)}k Verts
            </div>
          )}
        </div>

        {/* Upload & Link Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          {/* File Picker */}
          <label className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 text-xs text-slate-300 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>.GLB / .GLTF ફાઈલ પસંદ કરો</span>
            <input
              type="file"
              accept=".glb,.gltf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* URL Form */}
          <form onSubmit={handleLoadCustomUrl} className="flex gap-1.5">
            <input
              type="url"
              placeholder="https://.../model.glb"
              value={customInputUrl}
              onChange={(e) => setCustomInputUrl(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
            >
              લોડ કરો
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-900/50">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
