import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundEffects } from '../services/soundEffects';

interface PWAInstallButtonProps {
  onAnnounce?: (msg: string) => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ onAnnounce }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    soundEffects.playTap();
    if (onAnnounce) onAnnounce('Opening application installation prompt');
    await install();
  };

  const handleIOSClick = () => {
    soundEffects.playTap();
    setShowIOSGuide(true);
    if (onAnnounce) onAnnounce('Displaying instructions to add app to your iOS home screen');
  };

  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        aria-label="Install Vision Assistant App on device for offline access"
        className="flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs rounded-xl shadow-xs active:scale-95 transition-all focus-visible:outline-3 focus-visible:outline-indigo-500 shrink-0"
      >
        <Download className="w-4 h-4 shrink-0 text-indigo-600" aria-hidden="true" />
        <span className="whitespace-nowrap">Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={handleIOSClick}
          aria-label="Install app on iPhone instructions"
          className="flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs rounded-xl shadow-xs active:scale-95 transition-all focus-visible:outline-3 focus-visible:outline-indigo-500 shrink-0"
        >
          <Smartphone className="w-4 h-4 shrink-0 text-indigo-600" aria-hidden="true" />
          <span className="whitespace-nowrap">Install App</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          >
            <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 text-slate-800 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 id="ios-modal-title" className="text-base font-bold text-slate-900">
                  Install on iPhone / iPad
                </h2>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close installation instructions"
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>1. Tap the <strong>Share</strong> button at the bottom of Safari.</p>
                <p>2. Scroll down and choose <strong>Add to Home Screen</strong>.</p>
                <p>3. Tap <strong>Add</strong> to use this assistant offline anytime.</p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full min-h-[48px] rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-xs"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
