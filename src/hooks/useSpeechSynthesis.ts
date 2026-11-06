import { useCallback, useEffect, useRef, useState } from 'react';
import { SupportedLanguage } from '../types';
import { soundEffects } from '../services/soundEffects';

export interface TTSState {
  isSpeaking: boolean;
  isPaused: boolean;
  rate: number;
  lastSpokenText: string | null;
  lastSpokenLang: SupportedLanguage;
  missingVoiceWarning: string | null;
}

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [ttsState, setTtsState] = useState<TTSState>({
    isSpeaking: false,
    isPaused: false,
    rate: 1.0,
    lastSpokenText: null,
    lastSpokenLang: 'en',
    missingVoiceWarning: null,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available system voices
  const updateVoices = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const voiceList = window.speechSynthesis.getVoices();
    setVoices(voiceList);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [updateVoices]);

  // Find voice matching language code (with regional bias towards India)
  const getVoiceForLanguage = useCallback((lang: SupportedLanguage): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    if (lang === 'kn') {
      // Kannada match
      const knVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('kn') ||
          v.name.toLowerCase().includes('kannada')
      );
      return knVoice || null;
    }

    if (lang === 'hi') {
      // Hindi match
      const hiVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('hi') ||
          v.name.toLowerCase().includes('hindi')
      );
      return hiVoice || null;
    }

    // English match: prefer en-IN, then en-GB, en-US
    const enInVoice = voices.find((v) => v.lang.toLowerCase() === 'en-in');
    if (enInVoice) return enInVoice;

    const anyEnVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    return anyEnVoice || voices[0] || null;
  }, [voices]);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setTtsState((prev) => ({ ...prev, isSpeaking: false, isPaused: false }));
  }, []);

  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setTtsState((prev) => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setTtsState((prev) => ({ ...prev, isPaused: false }));
    }
  }, []);

  const speak = useCallback(
    (
      text: string,
      lang: SupportedLanguage = 'en',
      onComplete?: () => void
    ) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn('SpeechSynthesis is not supported in this environment.');
        return;
      }

      // Stop previous utterance
      window.speechSynthesis.cancel();

      if (!text || text.trim() === '') return;

      const targetVoice = getVoiceForLanguage(lang);
      let missingWarning: string | null = null;

      if (!targetVoice && lang !== 'en') {
        const langName = lang === 'kn' ? 'Kannada' : 'Hindi';
        missingWarning = `${langName} voice engine is not pre-installed on this device. Displaying text on screen.`;
        soundEffects.playAlert();
      }

      setTtsState((prev) => ({
        ...prev,
        isSpeaking: true,
        isPaused: false,
        lastSpokenText: text,
        lastSpokenLang: lang,
        missingVoiceWarning: missingWarning,
      }));

      // If voice is missing, speak an alert in English first, then try best effort
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      if (targetVoice) {
        utterance.voice = targetVoice;
        utterance.lang = targetVoice.lang;
      } else {
        // Fallback locale
        utterance.lang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      }

      utterance.rate = ttsState.rate;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setTtsState((prev) => ({ ...prev, isSpeaking: false, isPaused: false }));
        if (onComplete) onComplete();
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        setTtsState((prev) => ({ ...prev, isSpeaking: false, isPaused: false }));
      };

      window.speechSynthesis.speak(utterance);
    },
    [getVoiceForLanguage, ttsState.rate]
  );

  const replay = useCallback(() => {
    if (ttsState.lastSpokenText) {
      speak(ttsState.lastSpokenText, ttsState.lastSpokenLang);
    }
  }, [ttsState.lastSpokenText, ttsState.lastSpokenLang, speak]);

  const setSpeed = useCallback(
    (newRate: number) => {
      const clamped = Math.max(0.6, Math.min(1.8, Number(newRate.toFixed(1))));
      setTtsState((prev) => ({ ...prev, rate: clamped }));
      soundEffects.playTap();
      speak(`Speed set to ${clamped}x`, 'en');
    },
    [speak]
  );

  const increaseSpeed = useCallback(() => {
    setSpeed(ttsState.rate + 0.2);
  }, [ttsState.rate, setSpeed]);

  const decreaseSpeed = useCallback(() => {
    setSpeed(ttsState.rate - 0.2);
  }, [ttsState.rate, setSpeed]);

  return {
    voices,
    ttsState,
    speak,
    stop,
    pause,
    resume,
    replay,
    increaseSpeed,
    decreaseSpeed,
    setSpeed,
  };
}
