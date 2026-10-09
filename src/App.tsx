import React, { useState } from 'react';
import { ModelId, OrganDetail } from './types/chapter';
import { CHAPTER_MODELS } from './data/chapterData';
import { sounds } from './utils/audio';
import { TopNav } from './components/ui/TopNav';
import { ModelInfoPanel } from './components/ui/ModelInfoPanel';
import { QuizModal } from './components/ui/QuizModal';
import { GlossaryModal } from './components/ui/GlossaryModal';

// 3D Models
import { DigestiveSystemModel } from './components/3d/DigestiveSystemModel';
import { TongueTasteModel } from './components/3d/TongueTasteModel';
import { BeaumontStomachModel } from './components/3d/BeaumontStomachModel';
import { GlucoseDripModel } from './components/3d/GlucoseDripModel';
import { ChewingJawModel } from './components/3d/ChewingJawModel';
import { BalancedDietModel } from './components/3d/BalancedDietModel';
import { CustomModelImporter } from './components/3d/CustomModelImporter';

export default function App() {
  const [currentModelId, setCurrentModelId] = useState<ModelId>('digestive-system');
  const [selectedOrgan, setSelectedOrgan] = useState<OrganDetail | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [quizOpen, setQuizOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const handleSelectModel = (id: ModelId) => {
    sounds.playClick();
    setCurrentModelId(id);
    setSelectedOrgan(null);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setSoundEnabled(next);
    if (next) sounds.playClick();
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* 1. Compliant Top Navigation Bar (3 zones) */}
      <TopNav
        currentModelId={currentModelId}
        onSelectModel={handleSelectModel}
        onOpenQuiz={() => setQuizOpen(true)}
        onOpenGlossary={() => setGlossaryOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* 2. Main 3D Interactive Viewport */}
      <main className="relative flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
        {currentModelId === 'digestive-system' && (
          <DigestiveSystemModel
            selectedOrgan={selectedOrgan}
            onSelectOrgan={(organ) => setSelectedOrgan(organ)}
          />
        )}

        {currentModelId === 'tongue-taste' && <TongueTasteModel />}

        {currentModelId === 'beaumont-stomach' && <BeaumontStomachModel />}

        {currentModelId === 'glucose-drip' && <GlucoseDripModel />}

        {currentModelId === 'chewing-teeth' && <ChewingJawModel />}

        {currentModelId === 'balanced-diet' && <BalancedDietModel />}

        {currentModelId === 'custom-importer' && <CustomModelImporter />}

        {/* 3. Floating Quick Switcher Carousel / Bottom Bar */}
        <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-20 items-center gap-1.5 p-1.5 bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-2xl">
          {CHAPTER_MODELS.map((item, idx) => {
            const isActive = currentModelId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectModel(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/40'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">{idx + 1}</span>
                <span>{item.titleGu.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Educational Science Drawer / Info Panel */}
        <ModelInfoPanel
          currentModelId={currentModelId}
          selectedOrgan={selectedOrgan}
          onClearSelectedOrgan={() => setSelectedOrgan(null)}
        />
      </main>

      {/* 5. Modals */}
      <QuizModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        onSelectModel={handleSelectModel}
      />

      <GlossaryModal
        isOpen={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
      />
    </div>
  );
}
