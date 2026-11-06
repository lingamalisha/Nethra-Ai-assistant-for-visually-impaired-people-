import { useCallback, useEffect, useRef, useState } from 'react';
import { SupportedLanguage } from '../types';
import { soundEffects } from '../services/soundEffects';

// Type definitions for browser Web Speech Recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export type VoiceAction =
  | 'read'
  | 'describe'
  | 'currency'
  | 'repeat'
  | 'slower'
  | 'faster'
  | 'stop'
  | 'change_language';

interface VoiceCommandMatch {
  action: VoiceAction;
  targetLang?: SupportedLanguage;
}

/**
 * Command dictionary with trilingual synonyms and phonetic variants
 */
const COMMAND_MAP: { action: VoiceAction; patterns: string[]; targetLang?: SupportedLanguage }[] = [
  // Read Text Commands
  {
    action: 'read',
    patterns: [
      'read', 'read this', 'scan', 'scan text', 'read text',
      'padho', 'yeh padho', 'text padho', 'padhiye', 'kuch likha hai',
      'odi', 'idannu odi', 'akshara odi', 'pathya odi', 'odiri'
    ],
  },
  // Scene Description Commands
  {
    action: 'describe',
    patterns: [
      'describe', 'describe scene', 'what is this', 'what is around me', 'surroundings', 'look',
      'varnan', 'varnan karo', 'kya hai', 'aas paas kya hai', 'dekho',
      'vivarisi', 'idu enu', 'suttalu enide', 'nodu', 'nodiri', 'vivara'
    ],
  },
  // Currency Identification Commands
  {
    action: 'currency',
    patterns: [
      'currency', 'money', 'cash', 'check money', 'note', 'rupee', 'rupees', 'count cash',
      'paise', 'note pehchano', 'rupaye', 'kitne rupaye', 'paisa',
      'hana', 'hana nodu', 'notu', 'notu gurutisu', 'eshtu rupaayi', 'rupaayi'
    ],
  },
  // Repeat Last Speech
  {
    action: 'repeat',
    patterns: [
      'repeat', 'say again', 'again', 'repeat that', 'what did you say',
      'dohraen', 'phir se bolo', 'dobara bolo', 'phir se',
      'mattomme helu', 'punaravartisi', 'inondu sala helu', 'matthe helu'
    ],
  },
  // Speech Rate Adjustments
  {
    action: 'slower',
    patterns: [
      'slower', 'slow', 'speak slowly', 'decrease speed',
      'dheere', 'dheere bolo', 'dhime', 'speed kam karo',
      'nidhana', 'nidhanavagi helu', 'swalpa nidhana'
    ],
  },
  {
    action: 'faster',
    patterns: [
      'faster', 'fast', 'speak quickly', 'increase speed',
      'tez', 'tez bolo', 'jaldi bolo', 'speed badao',
      'vega', 'vegavagi helu', 'swalpa bega'
    ],
  },
  // Stop / Silence
  {
    action: 'stop',
    patterns: [
      'stop', 'quiet', 'shut up', 'pause', 'silence',
      'ruko', 'shant', 'ruk jao', 'band karo',
      'nillisu', 'saaku', 'shantavagiri', 'nilsu'
    ],
  },
  // Change Language
  {
    action: 'change_language',
    patterns: [
      'change language', 'switch language', 'language',
      'bhasha badlo', 'bhasha',
      'bhashe badalisi', 'bhashe'
    ],
  },
];

export function useVoiceRecognition(
  onCommand: (action: VoiceAction, rawTranscript: string) => void,
  currentLanguage: SupportedLanguage
) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Set locale based on user selection
    recognition.lang =
      currentLanguage === 'kn' ? 'kn-IN' : currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      soundEffects.playTap();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      setLastTranscript(transcript);

      // Match against command dictionary
      let matchedAction: VoiceAction | null = null;
      for (const entry of COMMAND_MAP) {
        if (entry.patterns.some((pattern) => transcript.includes(pattern))) {
          matchedAction = entry.action;
          break;
        }
      }

      if (matchedAction) {
        soundEffects.playSuccess();
        onCommand(matchedAction, transcript);
      } else {
        soundEffects.playAlert();
        // Fallback: If utterance contains keywords like "hindi", "kannada", "english"
        if (transcript.includes('kannada') || transcript.includes('ಕನ್ನಡ')) {
          onCommand('change_language', transcript);
        } else if (transcript.includes('hindi') || transcript.includes('हिन्दी')) {
          onCommand('change_language', transcript);
        } else if (transcript.includes('english')) {
          onCommand('change_language', transcript);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('SpeechRecognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        // Ignored
      }
    };
  }, [currentLanguage, onCommand]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.lang =
        currentLanguage === 'kn' ? 'kn-IN' : currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';
      recognitionRef.current.start();
    } catch {
      // If already started, stop and restart
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
    }
  }, [currentLanguage]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // Ignored
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    lastTranscript,
    startListening,
    stopListening,
    toggleListening,
  };
}
