import React from 'react';
import { GLOSSARY_TERMS } from '../../data/chapterData';
import { sounds } from '../../utils/audio';
import { X, BookOpen, Volume2 } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-100">વૈજ્ઞાનિક શબ્દકોષ (Scientific Glossary)</h3>
              <p className="text-[11px] text-slate-400">પ્રકરણ ૩ ના મહત્વપૂર્ણ પારિભાષિક શબ્દો</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {GLOSSARY_TERMS.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">{item.termGu}</span>
                <button
                  onClick={() => sounds.speak(`${item.termGu}. ${item.meaningGu}`)}
                  title="સાંભળો"
                  className="p-1 text-slate-400 hover:text-amber-400 rounded hover:bg-slate-800 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] text-cyan-400 block font-mono">{item.termEn}</span>
              <p className="text-xs text-slate-300 leading-relaxed">{item.meaningGu}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
          >
            બંધ કરો
          </button>
        </div>
      </div>
    </div>
  );
};
