import React, { useState } from 'react';
import { ModelId, OrganDetail } from '../../types/chapter';
import { CHAPTER_MODELS } from '../../data/chapterData';
import { sounds } from '../../utils/audio';
import { Volume2, VolumeX, BookOpen, Sparkles, ChevronRight, ChevronLeft, Lightbulb } from 'lucide-react';

interface ModelInfoPanelProps {
  currentModelId: ModelId;
  selectedOrgan: OrganDetail | null;
  onClearSelectedOrgan: () => void;
}

export const ModelInfoPanel: React.FC<ModelInfoPanelProps> = ({
  currentModelId,
  selectedOrgan,
  onClearSelectedOrgan
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const modelMeta = CHAPTER_MODELS.find((m) => m.id === currentModelId) || CHAPTER_MODELS[0];

  const handleReadAloud = (text: string) => {
    if (isSpeaking) {
      sounds.stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      sounds.speak(text, () => setIsSpeaking(false));
    }
  };

  return (
    <aside
      className={`fixed right-4 top-20 bottom-4 z-20 w-80 md:w-96 bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${
        isCollapsed ? 'translate-x-[calc(100%+1.5rem)]' : 'translate-x-0'
      }`}
    >
      {/* Toggle collapse tab button */}
      <button
        onClick={() => {
          sounds.playClick();
          setIsCollapsed(!isCollapsed);
        }}
        className="absolute -left-10 top-6 p-2 bg-slate-900/95 border border-slate-700 rounded-l-xl text-slate-300 hover:text-amber-400 shadow-xl transition-colors"
        title={isCollapsed ? 'માહિતી પેનલ ખોલો' : 'માહિતી પેનલ સંકેલો'}
      >
        {isCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {modelMeta.tagGu}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{modelMeta.textbookPage}</span>
          </div>
          <h2 className="text-base font-bold text-slate-100 leading-tight">
            {selectedOrgan ? selectedOrgan.nameGu : modelMeta.titleGu}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {selectedOrgan ? selectedOrgan.nameEn : modelMeta.titleEn}
          </p>
        </div>

        <button
          onClick={() =>
            handleReadAloud(
              selectedOrgan
                ? `${selectedOrgan.nameGu}. ${selectedOrgan.descGu}. ${selectedOrgan.factsGu.join('. ')}`
                : `${modelMeta.titleGu}. ${modelMeta.shortDescGu}`
            )
          }
          title={isSpeaking ? 'વાંચવાનું બંધ કરો' : 'ગુજરાતીમાં સાંભળો'}
          className={`p-2 rounded-xl transition-all ${
            isSpeaking
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Body content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-300">
        {selectedOrgan ? (
          /* Detailed Organ View */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                પસંદ કરેલું અંગ:
              </span>
              <button
                onClick={onClearSelectedOrgan}
                className="text-[10px] text-slate-400 hover:text-slate-200 underline"
              >
                સંપૂર્ણ પરિચય જુઓ
              </button>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 leading-relaxed text-slate-200">
              {selectedOrgan.descGu}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                મહત્વપૂર્ણ તથ્યો (Facts):
              </h4>
              <ul className="space-y-1.5">
                {selectedOrgan.factsGu.map((fact, idx) => (
                  <li
                    key={idx}
                    className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed text-[11px]"
                  >
                    • {fact}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          /* General Chapter Section Information */
          <div className="space-y-3">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 leading-relaxed text-slate-200">
              {modelMeta.shortDescGu}
            </div>

            {/* Model-specific guidance */}
            {currentModelId === 'digestive-system' && (
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-200">મુખ્ય અવયવોનું કાર્ય:</h4>
                <div className="space-y-1 text-[11px]">
                  <div className="p-2 rounded bg-slate-800/40 border border-slate-800">
                    <span className="font-bold text-amber-300">મોં:</span> લાળરસ દ્વારા સ્ટાર્ચનું પાચન.
                  </div>
                  <div className="p-2 rounded bg-slate-800/40 border border-slate-800">
                    <span className="font-bold text-red-300">જઠર:</span> પાચકરસ અને એસિડ વડે ખોરાક વલોવાય છે.
                  </div>
                  <div className="p-2 rounded bg-slate-800/40 border border-slate-800">
                    <span className="font-bold text-yellow-300">નાનું આંતરડું:</span> પોષક તત્વોનું લોહીમાં શોષણ.
                  </div>
                </div>
              </div>
            )}

            {currentModelId === 'tongue-taste' && (
              <div className="space-y-2 text-[11px]">
                <h4 className="font-semibold text-slate-200">પુસ્તકનું રહસ્ય (Secret):</h4>
                <p className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  જો જીભને ચોખ્ખા કપડાંથી સાફ કરીને સૂકવી નાખવામાં આવે, તો ત્યાં ખાંડ કે ગોળ મૂકવાથી સ્વાદ કેમ
                  નથી આવતો? કારણ કે સ્વાદ ઓળખવા માટે <span className="text-amber-400 font-semibold">લાળરસનું હોવું અનિવાર્ય છે!</span>
                </p>
              </div>
            )}

            {currentModelId === 'beaumont-stomach' && (
              <div className="space-y-2 text-[11px]">
                <h4 className="font-semibold text-slate-200">ડો. બ્યુમોન્ટનું તારણ:</h4>
                <p className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  જ્યારે માર્ટીન દુઃખી કે ગુસ્સામાં હોય ત્યારે તેના પેટમાં પાચન સરખું થતું નહોતું!
                  આપણું પેટ ફક્ત પાચકરસ નથી રેડતું, પણ સ્નાયુઓ દ્વારા ખોરાકને ઝડપથી વલોવે પણ છે.
                </p>
              </div>
            )}

            {currentModelId === 'glucose-drip' && (
              <div className="space-y-2 text-[11px]">
                <h4 className="font-semibold text-slate-200">ગ્લુકોઝ કેમ ચમત્કારી છે?</h4>
                <p className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  સામાન્ય ખોરાકને પચતાં કલાકો લાગે છે, પરંતુ ગ્લુકોઝ સીધું લોહીમાં પ્રવેશીને થાકેલા અને બીમાર
                  શરીરના દરેક કોષને મિનિટોમાં જીવંત ઊર્જા પ્રદાન કરે છે.
                </p>
              </div>
            )}

            {currentModelId === 'chewing-teeth' && (
              <div className="space-y-2 text-[11px]">
                <h4 className="font-semibold text-slate-200">૩૨ વાર કેમ ચાવવું?</h4>
                <p className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  આપણી લાળમાં ટાયલિન (Amylase) નામનો ઉત્સેચક છે. તે રોટલીના સ્વાદિષ્ટ સ્ટાર્ચને તોડીને સાદી સાકર
                  બનાવી દે છે, જેથી રોટલી ધીમે ધીમે એકદમ મીઠી લાગવા માંડે છે!
                </p>
              </div>
            )}

            {currentModelId === 'balanced-diet' && (
              <div className="space-y-2 text-[11px]">
                <h4 className="font-semibold text-slate-200">કાલહાંડી અને ગોમતીની વાત:</h4>
                <p className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  ઓડિશાના કાલહાંડી જિલ્લામાં અઢળક ડાંગર પાકે છે અને ગોડાઉન ચોખાથી ભરેલા હોય છે, છતાં ગોમતી જેવા
                  ગરીબ મજૂરોના બાળકો ભૂખથી પીડાય છે. પોષણક્ષમ આહાર એ દરેક બાળકનો માનવ અધિકાર છે!
                </p>
              </div>
            )}

            {currentModelId === 'custom-importer' && (
              <div className="space-y-2 text-[11px]">
                <h4 className="font-semibold text-slate-200">બાહ્ય 3D મૉડેલ સપોર્ટ:</h4>
                <p className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  અહીં તમે ઉપલબ્ધ મૂળ મેડિકલ મૉડેલ્સ (Z-Anatomy Organs, Skeleton, Vessels) જોઈ શકો છો, અથવા
                  બહારથી તમારી પોતાની કોઈપણ <span className="text-amber-400 font-semibold">.GLB / .GLTF</span> ફાઈલ કે વેબ લિંક મૂકીને 3D માં એક્સપ્લોર કરી શકો છો!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50 rounded-b-2xl text-[11px] text-slate-400 flex items-center justify-between">
        <span>ધોરણ ૫ પાઠ્યપુસ્તક આધારિત</span>
        <span className="text-amber-400 font-medium">જીવંત 3D મોડેલ</span>
      </div>
    </aside>
  );
};
