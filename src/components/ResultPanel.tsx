import React from 'react';
import { Volume2, Copy, X, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
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

  const getTheme = () => {
    switch (result.mode) {
      case 'text_ocr':
        return {
          title: 'Extracted Text',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotColor: 'bg-emerald-500',
          speakBg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
        };
      case 'scene_describe':
        return {
          title: 'Scene Description',
          badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
          dotColor: 'bg-sky-500',
          speakBg: 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200',
        };
      case 'currency':
        return {
          title: 'Currency Identification',
          badgeBg: 'bg-violet-50 text-violet-800 border-violet-200',
          dotColor: 'bg-violet-500',
          speakBg: 'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      role="region"
      aria-label="Vision recognition results"
      className="absolute bottom-36 left-3 right-3 max-h-[48%] overflow-y-auto bg-white/95 border border-slate-200/90 rounded-3xl p-4.5 shadow-xl backdrop-blur-md z-20 flex flex-col gap-3 transition-all"
    >
      {/* Header with Title Badge & Action Buttons */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${theme.badgeBg}`}>
          <span className={`w-2 h-2 rounded-full ${theme.dotColor}`} aria-hidden="true" />
          <span>{theme.title}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Read Aloud Button */}
          <button
            onClick={() => {
              soundEffects.playTap();
              onSpeak();
            }}
            aria-label="Read text aloud"
            className={`min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-xl border active:scale-95 transition-all focus-visible:outline-3 focus-visible:outline-indigo-500 ${theme.speakBg}`}
          >
            <Volume2 className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            aria-label="Copy text to clipboard"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200/60 active:scale-95 transition-all focus-visible:outline-3 focus-visible:outline-indigo-500"
          >
            <Copy className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Dismiss Button */}
          <button
            onClick={() => {
              soundEffects.playTap();
              onClear();
            }}
            aria-label="Dismiss results panel"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200/60 active:scale-95 transition-all focus-visible:outline-3 focus-visible:outline-indigo-500"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Uncertainty or Guidance Warning Callout */}
      {result.isUncertain && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="block font-bold text-amber-950">Notice</strong>
            {result.warning || "I'm not sure about this result. Please reposition the camera and try again."}
          </div>
        </div>
      )}

      {/* Main Extracted or Generated Prose */}
      <div className="text-base font-normal text-slate-800 leading-relaxed select-text whitespace-pre-wrap">
        {result.text}
      </div>

      {/* Reassuring Safety Disclaimer */}
      {result.disclaimer && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
          <span>{result.disclaimer}</span>
        </div>
      )}
    </div>
  );
};
