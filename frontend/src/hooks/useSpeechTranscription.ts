import { useEffect, useRef, useState } from 'react';

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface UseSpeechTranscriptionReturn {
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  isListening: boolean;
  error: string;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
}

export const useSpeechTranscription = (): UseSpeechTranscriptionReturn => {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    const windowWithSpeechRecognition = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const Recognition = windowWithSpeechRecognition.SpeechRecognition || windowWithSpeechRecognition.webkitSpeechRecognition;

    if (!Recognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const value = result[0]?.transcript ?? '';

        if (result.isFinal) {
          finalTranscriptRef.current += value;
        } else {
          interim += value;
        }
      }

      setTranscript(finalTranscriptRef.current.trim());
      setInterimTranscript(interim.trim());
    };

    recognition.onerror = (event: any) => {
      setError(event?.error ? `Speech recognition error: ${event.error}` : 'Speech recognition failed');
      setIsListening(false);
      setInterimTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    setError('');
    setIsListening(true);

    try {
      recognitionRef.current.start();
    } catch (recognitionError) {
      setIsListening(false);
      setError('Speech recognition could not start');
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch {
      // Ignore stop errors when the recognition session is already closed.
    } finally {
      setIsListening(false);
      setInterimTranscript('');
    }
  };

  const clearTranscript = () => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError('');
  };

  return {
    transcript,
    interimTranscript,
    isSupported,
    isListening,
    error,
    startListening,
    stopListening,
    clearTranscript,
  };
};
