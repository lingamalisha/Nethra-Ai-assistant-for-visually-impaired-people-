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
        className="flex items-center gap-2 min-h-[48px] px-3 py-2 bg-yellow-400 text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow-md hover:bg-yellow-300 active:scale-95 transition-all focus-visible:outline-4 focus-visible:outline-white shrink-0"
      >
        <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
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
          className="flex items-center gap-2 min-h-[48px] px-3 py-2 bg-zinc-800 text-yellow-400 border border-yellow-400 font-semibold text-xs rounded-lg hover:bg-zinc-700 active:scale-95 transition-all focus-visible:outline-4 focus-visible:outline-yellow-400 shrink-0"
        >
          <Smartphone className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">Install App</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border-2 border-yellow-400 p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h2 id="ios-modal-title" className="text-lg font-bold text-yellow-400">
                  Install on iOS Safari
                </h2>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close installation instructions"
                  className="p-2 text-zinc-400 hover:text-white rounded-lg focus-visible:outline-yellow-400"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-zinc-200">
                <p>1. Tap the <strong>Share</strong> button at the bottom of Safari.</p>
                <p>2. Scroll down and choose <strong>Add to Home Screen</strong>.</p>
                <p>3. Tap <strong>Add</strong> to use this assistant offline like a native app.</p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full min-h-[48px] rounded-xl bg-yellow-400 text-black font-bold text-sm hover:bg-yellow-300"
              >
                Close Instructions
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
