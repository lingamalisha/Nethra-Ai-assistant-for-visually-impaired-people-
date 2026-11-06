import React from 'react';
import { Camera, RefreshCw, AlertTriangle, Eye } from 'lucide-react';
import { CameraState } from '../types';

interface CameraViewportProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  onRetry: () => void;
  onFlip: () => void;
  onScreenTap?: () => void;
  modeLabel: string;
}

export const CameraViewport: React.FC<CameraViewportProps> = ({
  videoRef,
  cameraState,
  onRetry,
  onFlip,
  onScreenTap,
  modeLabel,
}) => {
  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center cursor-pointer select-none"
      onClick={onScreenTap}
      role="region"
      aria-label={`Live camera viewfinder. Currently in ${modeLabel} mode. Tap anywhere on camera to capture and analyze.`}
    >
      {/* Underlying HTML5 video stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-hidden="true"
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          cameraState.isStreaming ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Tactile Framing & High-Contrast Corner Crosshairs */}
      <div
        className="absolute inset-4 pointer-events-none border-2 border-yellow-400/40 rounded-3xl"
        aria-hidden="true"
      >
        {/* Corner guide brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-400 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-400 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-400 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-400 rounded-br-xl" />

        {/* Center Optical Target */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-dashed border-yellow-400/60 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Camera Loading State */}
      {cameraState.isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-center p-6 z-10"
        >
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xl font-bold text-yellow-400">Initializing Rear Camera...</p>
          <p className="text-sm text-zinc-300 mt-2">Adjusting optical sensor and focus for vision assistant</p>
        </div>
      )}

      {/* Permission Denied or Camera Error State */}
      {cameraState.error && !cameraState.isLoading && (
        <div
          role="alert"
          aria-live="assertive"
          className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center text-center p-8 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-20 h-20 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center mb-4">
            <AlertTriangle className="w-10 h-10 text-red-400" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Camera Access Required</h2>
          <p className="text-base text-zinc-300 max-w-md mb-6 leading-relaxed">
            {cameraState.error}
          </p>

          <button
            onClick={onRetry}
            aria-label="Grant camera permission and retry"
            className="flex items-center justify-center gap-3 min-h-[56px] w-full max-w-xs px-6 bg-yellow-400 text-black font-extrabold text-base rounded-2xl shadow-lg hover:bg-yellow-300 active:scale-95 transition-all focus-visible:outline-4 focus-visible:outline-white"
          >
            <RefreshCw className="w-5 h-5" aria-hidden="true" />
            <span>Enable Camera</span>
          </button>
        </div>
      )}

      {/* Subtle top badge showing active mode and flip button */}
      <div
        className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 bg-black/80 border border-yellow-400/50 px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <Eye className="w-4 h-4 text-yellow-400 shrink-0" aria-hidden="true" />
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
            {modeLabel}
          </span>
        </div>

        <button
          onClick={onFlip}
          aria-label={`Flip camera. Currently using ${cameraState.facingMode === 'environment' ? 'rear' : 'front'} camera.`}
          className="min-w-[48px] min-h-[48px] flex items-center justify-center bg-black/80 border border-zinc-700 hover:border-yellow-400 rounded-full text-zinc-200 hover:text-yellow-400 backdrop-blur-md active:scale-90 transition-all focus-visible:outline-yellow-400"
        >
          <Camera className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
