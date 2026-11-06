import React from 'react';
import { FileText, Compass, Banknote, Mic, Square, RotateCcw } from 'lucide-react';
import { AssistantMode, SupportedLanguage } from '../types';
import { soundEffects } from '../services/soundEffects';

interface ControlGridProps {
  currentMode: AssistantMode;
  onSelectMode: (mode: AssistantMode) => void;
  onCapture: () => void;
  isProcessing: boolean;
  isSpeaking: boolean;
  onStopSpeech: () => void;
  onReplaySpeech: () => void;
  onStartVoiceCommand: () => void;
  isListeningVoice: boolean;
  currentLanguage: SupportedLanguage;
}

export const ControlGrid: React.FC<ControlGridProps> = ({
  currentMode,
  onSelectMode,
  onCapture,
  isProcessing,
  isSpeaking,
  onStopSpeech,
  onReplaySpeech,
  onStartVoiceCommand,
  isListeningVoice,
  currentLanguage,
}) => {
  const getCaptureLabel = () => {
    switch (currentMode) {
      case 'text_ocr':
        return currentLanguage === 'kn' ? 'ಓದಿ (Read Text)' : currentLanguage === 'hi' ? 'पढ़िए (Read Text)' : 'Read Text';
      case 'scene_describe':
        return currentLanguage === 'kn' ? 'ವಿವರಿಸಿ (Describe)' : currentLanguage === 'hi' ? 'वर्णन करें (Describe)' : 'Describe Scene';
      case 'currency':
        return currentLanguage === 'kn' ? 'ಹಣ ನೋಡಿ (Currency)' : currentLanguage === 'hi' ? 'नोट पहचानें (Currency)' : 'Recognize Currency';
    }
  };

  return (
    <div
      role="region"
      aria-label="Assistant control pad"
      className="w-full bg-white/95 border-t border-slate-200/80 p-4 pb-6 backdrop-blur-md flex flex-col gap-3 select-none shadow-lg"
    >
      {/* Primary Action Row: Voice + Central Large Capture Button + Audio Repeat/Stop */}
      <div className="grid grid-cols-4 gap-2.5 items-stretch">
        {/* Voice Command Button in Pastel Lavender */}
        <button
          onClick={() => {
            soundEffects.playTap();
            onStartVoiceCommand();
          }}
          disabled={isProcessing}
          aria-label={isListeningVoice ? 'Voice assistant is listening' : 'Start voice command in English, Hindi, or Kannada'}
          className={`col-span-1 min-h-[72px] rounded-2xl flex flex-col items-center justify-center p-2 font-medium transition-all border active:scale-95 focus-visible:outline-3 focus-visible:outline-indigo-500 ${
            isListeningVoice
              ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs animate-pulse'
              : 'bg-indigo-50/80 hover:bg-indigo-100/80 border-indigo-200/80 text-indigo-700 shadow-xs'
          }`}
        >
          <Mic className={`w-6 h-6 mb-1 ${isListeningVoice ? 'animate-bounce text-rose-600' : 'text-indigo-600'}`} aria-hidden="true" />
          <span className="text-[11px] font-semibold leading-tight text-center">
            {isListeningVoice ? 'Listening' : 'Voice'}
          </span>
        </button>

        {/* Large Friendly Capture Button in Calm Emerald */}
        <button
          onClick={() => {
            onCapture();
          }}
          disabled={isProcessing}
          aria-label={`Capture photo and ${getCaptureLabel()}`}
          className={`col-span-2 min-h-[72px] rounded-2xl flex items-center justify-center gap-2.5 p-3 font-bold text-base transition-all shadow-sm active:scale-98 focus-visible:outline-3 focus-visible:outline-emerald-500 ${
            isProcessing
              ? 'bg-slate-200 text-slate-500 cursor-wait'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 shadow-md'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-3 border-slate-400 border-t-slate-700 rounded-full animate-spin" />
              <span className="text-sm font-medium">Analyzing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-white/90" />
              <span className="text-base font-bold truncate tracking-tight">{getCaptureLabel()}</span>
            </div>
          )}
        </button>

        {/* Audio Repeat / Stop Button in Calm Amber/Slate */}
        <button
          onClick={() => {
            soundEffects.playTap();
            if (isSpeaking) {
              onStopSpeech();
            } else {
              onReplaySpeech();
            }
          }}
          aria-label={isSpeaking ? 'Stop current speech playback' : 'Repeat last announcement'}
          className="col-span-1 min-h-[72px] rounded-2xl flex flex-col items-center justify-center p-2 font-medium transition-all border bg-amber-50/80 hover:bg-amber-100/80 border-amber-200/80 text-amber-800 shadow-xs active:scale-95 focus-visible:outline-3 focus-visible:outline-amber-500"
        >
          {isSpeaking ? (
            <>
              <Square className="w-6 h-6 text-rose-600 mb-1" aria-hidden="true" />
              <span className="text-[11px] font-semibold text-rose-700">Stop</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-6 h-6 text-amber-700 mb-1" aria-hidden="true" />
              <span className="text-[11px] font-semibold text-amber-800">Repeat</span>
            </>
          )}
        </button>
      </div>

      {/* Mode Selector Row: 3 Wide Tactile Tabs with Calm Pastel Accents */}
      <div
        role="tablist"
        aria-label="Assistant modes"
        className="grid grid-cols-3 gap-2"
      >
        {/* Tab 1: Read Text */}
        <button
          role="tab"
          aria-selected={currentMode === 'text_ocr'}
          aria-label="Read Text mode. Extracts and reads printed text in English, Hindi, or Kannada."
          onClick={() => {
            soundEffects.playModeChange();
            onSelectMode('text_ocr');
          }}
          className={`min-h-[50px] rounded-xl flex items-center justify-center gap-1.5 px-2 py-2 font-semibold text-xs transition-all border active:scale-95 focus-visible:outline-3 focus-visible:outline-emerald-500 ${
            currentMode === 'text_ocr'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
              : 'bg-slate-50/90 border-slate-200/70 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className={`w-4 h-4 shrink-0 ${currentMode === 'text_ocr' ? 'text-emerald-600' : 'text-slate-500'}`} aria-hidden="true" />
          <span className="truncate">Read Text</span>
        </button>

        {/* Tab 2: Describe Scene */}
        <button
          role="tab"
          aria-selected={currentMode === 'scene_describe'}
          aria-label="Describe Scene mode. Uses AI to describe your surroundings and objects."
          onClick={() => {
            soundEffects.playModeChange();
            onSelectMode('scene_describe');
          }}
          className={`min-h-[50px] rounded-xl flex items-center justify-center gap-1.5 px-2 py-2 font-semibold text-xs transition-all border active:scale-95 focus-visible:outline-3 focus-visible:outline-sky-500 ${
            currentMode === 'scene_describe'
              ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-xs'
              : 'bg-slate-50/90 border-slate-200/70 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Compass className={`w-4 h-4 shrink-0 ${currentMode === 'scene_describe' ? 'text-sky-600' : 'text-slate-500'}`} aria-hidden="true" />
          <span className="truncate">Describe</span>
        </button>

        {/* Tab 3: Currency Recognition */}
        <button
          role="tab"
          aria-selected={currentMode === 'currency'}
          aria-label="Indian Currency mode. Identifies rupee notes from 10 to 2000 rupees offline."
          onClick={() => {
            soundEffects.playModeChange();
            onSelectMode('currency');
          }}
          className={`min-h-[50px] rounded-xl flex items-center justify-center gap-1.5 px-2 py-2 font-semibold text-xs transition-all border active:scale-95 focus-visible:outline-3 focus-visible:outline-violet-500 ${
            currentMode === 'currency'
              ? 'bg-violet-50 border-violet-300 text-violet-800 shadow-xs'
              : 'bg-slate-50/90 border-slate-200/70 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Banknote className={`w-4 h-4 shrink-0 ${currentMode === 'currency' ? 'text-violet-600' : 'text-slate-500'}`} aria-hidden="true" />
          <span className="truncate">Currency</span>
        </button>
      </div>
    </div>
  );
};
