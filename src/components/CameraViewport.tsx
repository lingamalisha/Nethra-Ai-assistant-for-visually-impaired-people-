import React from 'react';
import { Camera, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
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
      className="relative w-full h-full bg-slate-900 overflow-hidden flex items-center justify-center cursor-pointer select-none"
      onClick={onScreenTap}
      role="region"
      aria-label={`Live camera viewfinder. Currently in ${modeLabel} mode. Tap anywhere on camera to capture and analyze.`}
    >
      {/* HTML5 video stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-hidden="true"
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          cameraState.isStreaming ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Gentle, friendly viewfinder brackets */}
      <div
        className="absolute inset-5 pointer-events-none rounded-3xl border border-white/15"
        aria-hidden="true"
      >
        {/* Soft rounded corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-emerald-400/80 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-emerald-400/80 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-emerald-400/80 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-emerald-400/80 rounded-br-2xl" />

        {/* Center Optical Target (soft subtle pulse) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 border border-dashed border-emerald-300/40 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-400/80 rounded-full" />
          </div>
        </div>
      </div>

      {/* Calming Loading State */}
      {cameraState.isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 z-10"
        >
          <div className="w-12 h-12 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-lg font-semibold text-white">Opening camera...</p>
          <p className="text-xs text-slate-300 mt-1">Preparing clear vision for you</p>
        </div>
      )}

      {/* Friendly Permission Denied / Error State */}
      {cameraState.error && !cameraState.isLoading && (
        <div
          role="alert"
          aria-live="assertive"
          className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl border border-slate-100 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-3 text-amber-600">
              <AlertTriangle className="w-7 h-7" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Camera Access Needed</h2>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              {cameraState.error}
            </p>

            <button
              onClick={onRetry}
              aria-label="Grant camera permission and retry"
              className="flex items-center justify-center gap-2 min-h-[48px] w-full px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-2xl shadow-xs active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Allow Camera</span>
            </button>
          </div>
        </div>
      )}

      {/* Gentle Floating Controls */}
      <div
        className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200/60 px-3 py-1.5 rounded-full shadow-xs backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold text-slate-800 tracking-tight">
            {modeLabel}
          </span>
        </div>

        <button
          onClick={onFlip}
          aria-label={`Flip camera. Currently using ${cameraState.facingMode === 'environment' ? 'rear' : 'front'} camera.`}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-white/90 border border-slate-200/60 hover:bg-white rounded-full text-slate-700 hover:text-emerald-700 shadow-xs backdrop-blur-md active:scale-90 transition-all focus-visible:outline-3 focus-visible:outline-indigo-500"
        >
          <Camera className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
