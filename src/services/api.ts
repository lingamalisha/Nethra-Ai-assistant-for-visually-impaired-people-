import { AssistantMode, ProcessingResult, SupportedLanguage } from '../types';

export async function callVisionApi(
  mode: AssistantMode,
  imageDataUrl: string,
  language: SupportedLanguage
): Promise<ProcessingResult> {
  const endpoint =
    mode === 'text_ocr'
      ? '/api/ocr'
      : mode === 'scene_describe'
      ? '/api/describe'
      : '/api/currency';

  const payload = {
    image: imageDataUrl,
    language_hint: language,
    target_language: language,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error || `Server responded with status ${response.status}`);
  }

  const data = await response.json();

  return {
    mode,
    text: data.text,
    detectedLanguage: data.primary_language || language,
    confidence: data.confidence,
    processingTimeMs: data.processing_time_ms,
    isUncertain: data.is_uncertain || (data.is_confident === false),
    warning: data.warning,
    disclaimer: data.disclaimer,
  };
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    return res.ok;
  } catch {
    return false;
  }
}
