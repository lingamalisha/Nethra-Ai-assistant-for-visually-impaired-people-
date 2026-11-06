import React from 'react';
import { FileText, Compass, Banknote, Mic, Volume2, Square, Play, RotateCcw } from 'lucide-react';
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
        return currentLanguage === 'kn' ? 'ಹಣ ಗುರುತಿಸಿ (Currency)' : currentLanguage === 'hi' ? 'नोट पहचानें (Currency)' : 'Recognize Currency';
    }
  };

  return (
    <div
      role="region"
      aria-label="Assistant control pad"
      className="w-full bg-zinc-950/95 border-t-2 border-zinc-800 p-4 pb-6 backdrop-blur-lg flex flex-col gap-3 select-none"
    >
      {/* Primary Action Row: Large Central Capture Button + Voice + Audio Player Controls */}
      <div className="grid grid-cols-4 gap-2.5 items-stretch">
        {/* Voice Command / Mic Trigger */}
        <button
          onClick={() => {
            soundEffects.playTap();
            onStartVoiceCommand();
          }}
          disabled={isProcessing}
          aria-label={isListeningVoice ? 'Voice assistant is listening' : 'Start voice command in English, Hindi, or Kannada'}
          className={`col-span-1 min-h-[72px] rounded-2xl flex flex-col items-center justify-center p-2 font-bold transition-all border-2 active:scale-95 focus-visible:outline-4 focus-visible:outline-white ${
            isListeningVoice
              ? 'bg-red-600 border-red-400 text-white animate-pulse'
              : 'bg-zinc-900 border-zinc-700 text-yellow-400 hover:border-yellow-400'
          }`}
        >
          <Mic className={`w-7 h-7 mb-1 ${isListeningVoice ? 'animate-bounce' : ''}`} aria-hidden="true" />
          <span className="text-[11px] leading-tight text-center">
            {isListeningVoice ? 'Listening' : 'Voice'}
          </span>
        </button>

        {/* Huge High-Contrast Capture Button */}
        <button
          onClick={() => {
            onCapture();
          }}
          disabled={isProcessing}
          aria-label={`Capture photo and ${getCaptureLabel()}`}
          className={`col-span-2 min-h-[72px] rounded-2xl flex items-center justify-center gap-3 p-3 font-extrabold text-lg uppercase tracking-wider transition-all border-4 shadow-xl active:scale-95 focus-visible:outline-4 focus-visible:outline-white ${
            isProcessing
              ? 'bg-zinc-800 border-yellow-400/50 text-zinc-400 cursor-wait'
              : 'bg-yellow-400 border-yellow-300 text-black hover:bg-yellow-300'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center">
                <span className="w-2.5 h-2.5 bg-black rounded-full" />
              </span>
              <span className="text-base font-black truncate">{getCaptureLabel()}</span>
            </div>
          )}
        </button>

        {/* Audio Stop / Replay Controls */}
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
          className="col-span-1 min-h-[72px] rounded-2xl flex flex-col items-center justify-center p-2 font-bold transition-all border-2 bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-yellow-400 active:scale-95 focus-visible:outline-4 focus-visible:outline-white"
        >
          {isSpeaking ? (
            <>
              <Square className="w-6 h-6 text-red-400 mb-1" aria-hidden="true" />
              <span className="text-[11px] text-red-400">Stop</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-6 h-6 text-yellow-400 mb-1" aria-hidden="true" />
              <span className="text-[11px] text-zinc-300">Repeat</span>
            </>
          )}
        </button>
      </div>

      {/* Mode Selector Row: 3 Wide Tactile Tabs (Text, Scene, Currency) */}
      <div
        role="tablist"
        aria-label="Assistant modes"
        className="grid grid-cols-3 gap-2"
      >
        {/* Tab 1: Read Text (OCR) */}
        <button
          role="tab"
          aria-selected={currentMode === 'text_ocr'}
          aria-label="Read Text mode. Extracts and reads printed text in English, Hindi, or Kannada."
          onClick={() => {
            soundEffects.playModeChange();
            onSelectMode('text_ocr');
          }}
          className={`min-h-[54px] rounded-xl flex items-center justify-center gap-2 px-2 py-2 font-bold text-xs transition-all border-2 active:scale-95 focus-visible:outline-4 focus-visible:outline-white ${
            currentMode === 'text_ocr'
              ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400 shadow-md'
              : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
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
          className={`min-h-[54px] rounded-xl flex items-center justify-center gap-2 px-2 py-2 font-bold text-xs transition-all border-2 active:scale-95 focus-visible:outline-4 focus-visible:outline-white ${
            currentMode === 'scene_describe'
              ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400 shadow-md'
              : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
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
          className={`min-h-[54px] rounded-xl flex items-center justify-center gap-2 px-2 py-2 font-bold text-xs transition-all border-2 active:scale-95 focus-visible:outline-4 focus-visible:outline-white ${
            currentMode === 'currency'
              ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400 shadow-md'
              : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <Banknote className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="truncate">Currency</span>
        </button>
      </div>
    </div>
  );
};
