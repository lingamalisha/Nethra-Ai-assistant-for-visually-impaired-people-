export type AssistantMode = 'text_ocr' | 'scene_describe' | 'currency';

export type SupportedLanguage = 'en' | 'hi' | 'kn';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  speechLocale: string;
}

export interface CameraState {
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  facingMode: 'environment' | 'user';
}

export interface ProcessingResult {
  mode: AssistantMode;
  text?: string;
  detectedLanguage?: string;
  confidence?: number;
  processingTimeMs?: number;
  isUncertain?: boolean;
  warning?: string | null;
  disclaimer?: string;
}
