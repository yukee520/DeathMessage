import { useEffect, useRef, useState } from 'react';

export interface UseTypingDelayOptions {
  minMs?: number;
  maxMs?: number;
}

export interface UseTypingDelayResult {
  isTyping: boolean;
  start: (durationMs?: number) => void;
  stop: () => void;
}

export function useTypingDelay(
  options: UseTypingDelayOptions = {},
): UseTypingDelayResult {
  const { minMs = 600, maxMs = 1800 } = options;
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const stop = (): void => {
    clear();
    setIsTyping(false);
  };

  const start = (durationMs?: number): void => {
    clear();
    setIsTyping(true);
    const duration =
      durationMs ?? Math.floor(Math.random() * (maxMs - minMs)) + minMs;
    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      timeoutRef.current = null;
    }, duration);
  };

  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  return { isTyping, start, stop };
}