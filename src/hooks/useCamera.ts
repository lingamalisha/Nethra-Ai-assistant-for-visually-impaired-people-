import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraState } from '../types';
import { soundEffects } from '../services/soundEffects';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>({
    isStreaming: false,
    isLoading: true,
    error: null,
    permissionStatus: 'prompt',
    facingMode: 'environment',
  });

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const startCamera = useCallback(async (facing: 'environment' | 'user' = 'environment') => {
    setCameraState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      facingMode: facing,
    }));

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Camera API is not supported on this browser or environment.',
        permissionStatus: 'unsupported',
      }));
      return;
    }

    // Stop existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      // Primary attempt: rear camera with high-resolution constraints
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      setCameraState({
        isStreaming: true,
        isLoading: false,
        error: null,
        permissionStatus: 'granted',
        facingMode: facing,
      });
    } catch (err: unknown) {
      console.warn('Camera primary constraints failed, trying fallback...', err);

      // Fallback attempt: any video stream
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;

        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.muted = true;
          await videoRef.current.play();
        }

        setCameraState({
          isStreaming: true,
          isLoading: false,
          error: null,
          permissionStatus: 'granted',
          facingMode: facing,
        });
      } catch (fallbackErr: unknown) {
        const errorMsg =
          fallbackErr instanceof Error
            ? fallbackErr.name === 'NotAllowedError' || fallbackErr.name === 'PermissionDeniedError'
              ? 'Camera permission was denied. Please allow camera access in browser settings.'
              : `Unable to access camera: ${fallbackErr.message}`
            : 'Camera could not be started.';

        setCameraState({
          isStreaming: false,
          isLoading: false,
          error: errorMsg,
          permissionStatus: 'denied',
          facingMode: facing,
        });
      }
    }
  }, []);

  const flipCamera = useCallback(() => {
    soundEffects.playTap();
    const nextFacing = cameraState.facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextFacing);
  }, [cameraState.facingMode, startCamera]);

  const captureFrame = useCallback((): { blob: Blob; dataUrl: string } | null => {
    if (!videoRef.current || !cameraState.isStreaming) {
      return null;
    }

    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, width, height);

    soundEffects.playShutter();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Convert dataUrl to Blob synchronously or via buffer
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });

    return { blob, dataUrl };
  }, [cameraState.isStreaming]);

  useEffect(() => {
    startCamera('environment');
    return () => {
      stopStream();
    };
  }, [startCamera, stopStream]);

  return {
    videoRef,
    cameraState,
    startCamera,
    stopStream,
    flipCamera,
    captureFrame,
  };
}
