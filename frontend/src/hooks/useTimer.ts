import { useState, useEffect, useRef } from 'react';

interface UseTimerReturn {
  time: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export const useTimer = (initialSeconds = 0): UseTimerReturn => {
  const [time, setTime] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const start = () => setIsRunning(true);
  const stop = () => {
    setIsRunning(false);
    setTime(0);
  };
  const pause = () => setIsRunning(false);
  const resume = () => setIsRunning(true);
  const reset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return { time, isRunning, start, stop, pause, resume, reset };
};
