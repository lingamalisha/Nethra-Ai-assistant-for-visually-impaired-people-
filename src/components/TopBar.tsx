import React from 'react';
import { Wifi, WifiOff, Volume2 } from 'lucide-react';
import { SupportedLanguage } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { soundEffects } from '../services/soundEffects';

interface TopBarProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isOnline: boolean;
  speechRate: number;
  onCycleSpeed: () => void;
  onAnnounce: (msg: string) => void;
}

const LANGUAGES: { code: SupportedLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'EN' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

export const TopBar: React.FC<TopBarProps> = ({
  currentLanguage,
  onLanguageChange,
  isOnline,
  speechRate,
  onCycleSpeed,
  onAnnounce,
}) => {
  return (
    <header
      role="banner"
      className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between gap-2 z-30 select-none shadow-xs"
    >
      {/* Brand & Network State */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" aria-hidden="true" />
          <h1 className="text-sm font-bold tracking-tight text-slate-800">
            Vision<span className="text-emerald-600">Assist</span>
          </h1>
        </div>

        {/* Friendly calm status badge */}
        <div
          role="status"
          aria-label={isOnline ? 'Online mode. Server AI features active.' : 'Offline mode. Local processing active.'}
          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
            isOnline
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 shrink-0 text-amber-600" aria-hidden="true" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Action Zone: Speech Speed, Language Switcher, and PWA Install */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Speed Adjustment Button */}
        <button
          onClick={() => {
            soundEffects.playTap();
            onCycleSpeed();
          }}
          aria-label={`Speech rate ${speechRate}x. Tap to adjust speed.`}
          className="min-h-[44px] px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/70 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all focus-visible:outline-3 focus-visible:outline-indigo-500"
        >
          <Volume2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>{speechRate}x</span>
        </button>

        {/* Trilingual Toggle Buttons in Calm Pastel Pill */}
        <div
          role="group"
          aria-label="Language selection"
          className="flex items-center bg-slate-100/90 border border-slate-200/70 rounded-xl p-1 gap-0.5"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  soundEffects.playTap();
                  onLanguageChange(lang.code);
                  onAnnounce(`Language switched to ${lang.label}`);
                }}
                aria-pressed={isSelected}
                aria-label={`Switch language to ${lang.label}`}
                className={`min-h-[38px] px-2.5 py-1 text-xs font-semibold rounded-lg transition-all active:scale-95 focus-visible:outline-3 focus-visible:outline-indigo-500 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang.native}
              </button>
            );
          })}
        </div>

        {/* PWA In-App Install Prompt */}
        <PWAInstallButton onAnnounce={onAnnounce} />
      </div>
    </header>
  );
};
