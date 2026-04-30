import { useState, useRef, useEffect } from 'react';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  recordedBlob: Blob | null;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  playback: () => void;
  pausePlayback: () => void;
  isPlaying: boolean;
  currentPlaybackTime: number;
  playbackDuration: number;
  clearRecording: () => void;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create hidden audio element for playback
    const audio = new Audio();
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('timeupdate', () => {
      setCurrentPlaybackTime(audio.currentTime);
      setPlaybackDuration(audio.duration);
    });
    audioElementRef.current = audio;

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Track recording time
      recordingTimeIntervalRef.current = window.setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsRecording(false);

      if (recordingTimeIntervalRef.current) {
        clearInterval(recordingTimeIntervalRef.current);
        recordingTimeIntervalRef.current = null;
      }
    }
  };

  const playback = () => {
    if (recordedBlob && audioElementRef.current) {
      const url = URL.createObjectURL(recordedBlob);
      audioElementRef.current.src = url;
      audioElementRef.current.play();
    }
  };

  const pausePlayback = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  };

  const clearRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    setCurrentPlaybackTime(0);
    setPlaybackDuration(0);
    if (audioElementRef.current) {
      audioElementRef.current.src = '';
    }
  };

  return {
    isRecording,
    recordedBlob,
    recordingTime,
    startRecording,
    stopRecording,
    playback,
    pausePlayback,
    isPlaying,
    currentPlaybackTime,
    playbackDuration,
    clearRecording,
  };
};
