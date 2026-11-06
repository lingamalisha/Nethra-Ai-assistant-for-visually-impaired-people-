import React from 'react';
import { Wifi, WifiOff, Globe, Volume2, FastForward } from 'lucide-react';
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
      className="w-full bg-zinc-950/95 border-b border-zinc-800 px-3 py-2 flex items-center justify-between gap-2 z-30 select-none"
    >
      {/* Brand & Online State */}
      <div className="flex items-center gap-2 shrink-0">
        <h1 className="text-sm font-extrabold tracking-tight text-yellow-400 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" aria-hidden="true" />
          <span>VisionAssist</span>
        </h1>

        {/* Online / Offline indicator with explicit text + icon */}
        <div
          role="status"
          aria-label={isOnline ? 'Online mode. Server AI features active.' : 'Offline mode. Local processing active.'}
          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
            isOnline
              ? 'border-emerald-600/50 bg-emerald-950/50 text-emerald-400'
              : 'border-amber-600/60 bg-amber-950/60 text-amber-300'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Action Zone: Speech Speed, Language Switcher, and PWA Install */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Speed button */}
        <button
          onClick={() => {
            soundEffects.playTap();
            onCycleSpeed();
          }}
          aria-label={`Speech rate ${speechRate}x. Tap to adjust speed.`}
          className="min-h-[44px] px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-yellow-400 text-zinc-300 hover:text-yellow-400 text-xs font-bold flex items-center gap-1 active:scale-95 focus-visible:outline-4 focus-visible:outline-white"
        >
          <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{speechRate}x</span>
        </button>

        {/* Trilingual Toggle Buttons */}
        <div
          role="group"
          aria-label="Language selection"
          className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg p-0.5"
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
                className={`min-h-[44px] px-2.5 py-1 text-xs font-extrabold rounded-md transition-all active:scale-95 focus-visible:outline-4 focus-visible:outline-white ${
                  isSelected
                    ? 'bg-yellow-400 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
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
