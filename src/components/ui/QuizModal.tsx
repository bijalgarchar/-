import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CHAPTER_QUIZ } from '../../data/chapterData';
import { sounds } from '../../utils/audio';
import { ModelId } from '../../types/chapter';
import { X, Award, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (id: ModelId) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  onSelectModel
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const currentQ = CHAPTER_QUIZ[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      sounds.playSuccess();
      setScore((s) => s + 1);
    } else {
      sounds.playClick();
    }
  };

  const handleNext = () => {
    sounds.playClick();
    if (currentIdx + 1 < CHAPTER_QUIZ.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleRestart = () => {
    sounds.playClick();
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-100">સ્વાદથી પાચન સુધી - ક્વિઝ</h3>
              <p className="text-[11px] text-slate-400">ધોરણ ૫ ના પ્રકરણ આધારિત કસોટી</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          {!isCompleted ? (
            <div>
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                <span>પ્રશ્ન {currentIdx + 1} / {CHAPTER_QUIZ.length}</span>
                <span className="text-amber-400 font-bold">સ્કોર: {score}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mb-4 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / CHAPTER_QUIZ.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <h4 className="text-sm md:text-base font-bold text-slate-100 mb-4 leading-relaxed">
                {currentQ.questionGu}
              </h4>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {currentQ.optionsGu.map((opt, idx) => {
                  let optStyle = 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700';
                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      optStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (idx === selectedOpt) {
                      optStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 font-semibold';
                    } else {
                      optStyle = 'bg-slate-800/40 opacity-50 border-slate-800 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-3 rounded-xl border text-left text-xs md:text-sm transition-all flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {isAnswered && idx === selectedOpt && idx !== currentQ.correctIndex && (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {isAnswered && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 mb-4 animate-fade-in">
                  <span className="font-semibold text-amber-400 block mb-1">સમજૂતી (Explanation):</span>
                  <p className="leading-relaxed">{currentQ.explanationGu}</p>
                </div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-100">અભિનંદન! ક્વિઝ પૂર્ણ થઈ!</h4>
                <p className="text-xs text-slate-400 mt-1">તમે પ્રકરણ ૩ ના વિજ્ઞાનને ખૂબ સારી રીતે સમજ્યા છો.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 inline-block px-8">
                <span className="text-xs text-slate-400 block mb-1">તમારો સ્કોર</span>
                <span className="text-3xl font-extrabold text-amber-400 font-mono">
                  {score} / {CHAPTER_QUIZ.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          {!isCompleted ? (
            <>
              {currentQ.modelTarget && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onSelectModel(currentQ.modelTarget!);
                    onClose();
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
                >
                  આનું 3D મોડેલ જુઓ
                </button>
              )}
              <div className="ml-auto">
                {isAnswered && (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                  >
                    <span>{currentIdx + 1 < CHAPTER_QUIZ.length ? 'આગળ વધો' : 'પરિણામ જુઓ'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={handleRestart}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ફરીથી રમો</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
              >
                3D મોડેલ્સ જુઓ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
