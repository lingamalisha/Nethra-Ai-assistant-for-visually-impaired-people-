import React from 'react';
import { Volume2, Copy, X, AlertCircle, ShieldAlert } from 'lucide-react';
import { ProcessingResult } from '../types';
import { soundEffects } from '../services/soundEffects';

interface ResultPanelProps {
  result: ProcessingResult | null;
  onClear: () => void;
  onSpeak: () => void;
  isSpeaking: boolean;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  result,
  onClear,
  onSpeak,
  isSpeaking,
}) => {
  if (!result) return null;

  const handleCopy = () => {
    if (result.text) {
      soundEffects.playTap();
      navigator.clipboard.writeText(result.text).catch(() => {});
    }
  };

  return (
    <div
      role="region"
      aria-label="Vision recognition results"
      className="absolute bottom-36 left-3 right-3 max-h-[46%] overflow-y-auto bg-zinc-950/95 border-2 border-yellow-400 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-20 flex flex-col gap-3"
    >
      {/* Header with Title & Action Triggers */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full" aria-hidden="true" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-yellow-400">
            {result.mode === 'text_ocr' && 'Extracted Text'}
            {result.mode === 'scene_describe' && 'Scene Description'}
            {result.mode === 'currency' && 'Currency Identification'}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundEffects.playTap();
              onSpeak();
            }}
            aria-label="Read text aloud"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 active:scale-95 transition-all focus-visible:outline-4 focus-visible:outline-white"
          >
            <Volume2 className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            onClick={handleCopy}
            aria-label="Copy text to clipboard"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 bg-zinc-900 border border-zinc-700 hover:border-yellow-400 text-zinc-200 rounded-lg active:scale-95 transition-all focus-visible:outline-4 focus-visible:outline-white"
          >
            <Copy className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            onClick={() => {
              soundEffects.playTap();
              onClear();
            }}
            aria-label="Dismiss results panel"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 bg-zinc-900 border border-zinc-700 hover:border-red-400 text-zinc-300 hover:text-red-400 rounded-lg active:scale-95 transition-all focus-visible:outline-4 focus-visible:outline-white"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Uncertainty or Warning Callout */}
      {result.isUncertain && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-200 text-xs leading-relaxed"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="block font-bold text-amber-300">Low Confidence Warning</strong>
            {result.warning || "I'm not sure about this result. Please reposition the camera and try again."}
          </div>
        </div>
      )}

      {/* Result Prose Content */}
      <div className="text-base font-medium text-zinc-100 leading-relaxed select-text whitespace-pre-wrap">
        {result.text}
      </div>

      {/* Safety Disclaimer */}
      {result.disclaimer && (
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-900 text-[11px] text-zinc-400">
          <ShieldAlert className="w-3.5 h-3.5 text-zinc-500 shrink-0" aria-hidden="true" />
          <span>{result.disclaimer}</span>
        </div>
      )}
    </div>
  );
};
