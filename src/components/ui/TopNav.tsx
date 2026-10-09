import React from 'react';
import { ModelId } from '../../types/chapter';
import { CHAPTER_MODELS } from '../../data/chapterData';
import { sounds } from '../../utils/audio';
import { Volume2, VolumeX, HelpCircle, BookOpen, Layers } from 'lucide-react';

interface TopNavProps {
  currentModelId: ModelId;
  onSelectModel: (id: ModelId) => void;
  onOpenQuiz: () => void;
  onOpenGlossary: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentModelId,
  onSelectModel,
  onOpenQuiz,
  onOpenGlossary,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 backdrop-blur-md z-30 shrink-0">
      {/* Zone 1: Brand title, single line text element wordmark */}
      <div className="flex items-center gap-2">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectModel('digestive-system');
          }}
          className="text-base md:text-lg font-bold tracking-tight text-amber-400 whitespace-nowrap hover:text-amber-300 transition-colors"
        >
          સ્વાદથી પાચન સુધી
        </a>
        <span className="hidden sm:inline text-xs font-mono text-slate-500">
          ધોરણ ૫
        </span>
      </div>

      {/* Zone 2: 4-6 nav links, single-line labels */}
      <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-medium text-slate-300">
        {CHAPTER_MODELS.map((m) => {
          const isActive = currentModelId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                sounds.playClick();
                onSelectModel(m.id);
              }}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                  : 'hover:text-white hover:bg-slate-900 text-slate-400'
              }`}
            >
              {m.titleGu.split(' ')[0]}
            </button>
          );
        })}
      </nav>

      {/* Mobile/Tablet Model Dropdown */}
      <div className="lg:hidden flex items-center">
        <select
          value={currentModelId}
          onChange={(e) => {
            sounds.playClick();
            onSelectModel(e.target.value as ModelId);
          }}
          className="bg-slate-900 text-slate-200 text-xs border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          {CHAPTER_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.titleGu}
            </option>
          ))}
        </select>
      </div>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'અવાજ બંધ કરો' : 'અવાજ ચાલુ કરો'}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onOpenGlossary();
          }}
          title="શબ્દકોષ"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 transition-colors hidden sm:flex items-center gap-1.5 text-xs"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span className="hidden md:inline">શબ્દકોષ</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onOpenQuiz();
          }}
          className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm shadow-amber-500/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>ક્વિઝ રમો</span>
        </button>
      </div>
    </header>
  );
};
