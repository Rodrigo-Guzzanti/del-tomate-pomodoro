import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type PomodoroMode = 'idle' | 'focus' | 'shortBreak' | 'longBreak' | 'paused';
type SegmentMode = 'focus' | 'shortBreak' | 'longBreak';

type PomodoroOptions = {
  focusDuration?: number;
  shortBreakDuration?: number;
  longBreakDuration?: number;
  autoStart?: boolean;
};

const DEFAULT_DURATIONS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const LABELS: Record<SegmentMode, string> = {
  focus: 'Foco',
  shortBreak: 'Descanso',
  longBreak: 'Descanso largo',
};

export function usePomodoro(options: PomodoroOptions = {}) {
  const durations = useMemo(
    () => ({
      focus: options.focusDuration ?? DEFAULT_DURATIONS.focus,
      shortBreak: options.shortBreakDuration ?? DEFAULT_DURATIONS.shortBreak,
      longBreak: options.longBreakDuration ?? DEFAULT_DURATIONS.longBreak,
    }),
    [options.focusDuration, options.shortBreakDuration, options.longBreakDuration]
  );

  const autoStart = options.autoStart ?? false;

  const [mode, setMode] = useState<PomodoroMode>('idle');
  const [currentSegment, setCurrentSegment] = useState<SegmentMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(durations.focus);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);

  const endTimestampRef = useRef<number | null>(null);
  const transitioningRef = useRef(false);
  const pomodorosCompletedRef = useRef(0);
  const currentSegmentRef = useRef<SegmentMode>('focus');

  useEffect(() => {
    pomodorosCompletedRef.current = pomodorosCompleted;
  }, [pomodorosCompleted]);

  useEffect(() => {
    currentSegmentRef.current = currentSegment;
  }, [currentSegment]);

  const getRemainingSeconds = useCallback(() => {
    if (!endTimestampRef.current) {
      return remainingSeconds;
    }
    const diffMs = endTimestampRef.current - Date.now();
    return Math.max(0, Math.ceil(diffMs / 1000));
  }, [remainingSeconds]);

  const startSegment = useCallback(
    (nextSegment: SegmentMode, shouldRun: boolean) => {
      const duration = durations[nextSegment];
      setCurrentSegment(nextSegment);
      setMode(nextSegment);
      setRemainingSeconds(duration);
      if (shouldRun) {
        setIsRunning(true);
        endTimestampRef.current = Date.now() + duration * 1000;
      } else {
        setIsRunning(false);
        endTimestampRef.current = null;
      }
    },
    [durations]
  );

  const advanceSegment = useCallback(() => {
    const segment = currentSegmentRef.current;
    if (segment === 'focus') {
      const nextCount = pomodorosCompletedRef.current + 1;
      setPomodorosCompleted(nextCount);
      const nextSegment: SegmentMode =
        nextCount % 4 === 0 ? 'longBreak' : 'shortBreak';
      startSegment(nextSegment, autoStart);
    } else {
      startSegment('focus', autoStart);
    }
  }, [autoStart, startSegment]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const tick = () => {
      if (transitioningRef.current) {
        return;
      }
      const remaining = getRemainingSeconds();
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        transitioningRef.current = true;
        advanceSegment();
        transitioningRef.current = false;
      }
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [advanceSegment, getRemainingSeconds, isRunning]);

  const start = useCallback(() => {
    if (isRunning || mode === 'paused') {
      return;
    }
    const duration = remainingSeconds || durations[currentSegment];
    setMode(currentSegment);
    setIsRunning(true);
    endTimestampRef.current = Date.now() + duration * 1000;
  }, [currentSegment, durations, isRunning, mode, remainingSeconds]);

  const pause = useCallback(() => {
    if (!isRunning) {
      return;
    }
    const remaining = getRemainingSeconds();
    setRemainingSeconds(remaining);
    setIsRunning(false);
    setMode('paused');
    endTimestampRef.current = null;
  }, [getRemainingSeconds, isRunning]);

  const resume = useCallback(() => {
    if (mode !== 'paused') {
      return;
    }
    setMode(currentSegment);
    setIsRunning(true);
    endTimestampRef.current = Date.now() + remainingSeconds * 1000;
  }, [currentSegment, mode, remainingSeconds]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setMode('idle');
    setCurrentSegment('focus');
    setRemainingSeconds(durations.focus);
    setPomodorosCompleted(0);
    endTimestampRef.current = null;
  }, [durations.focus]);

  const skipBreak = useCallback(() => {
    if (mode !== 'shortBreak' && mode !== 'longBreak') {
      return;
    }
    startSegment('focus', true);
  }, [mode, startSegment]);

  const labelMode: SegmentMode =
    mode === 'paused' || mode === 'idle' ? currentSegment : mode;

  return {
    mode,
    isRunning,
    remainingSeconds,
    pomodorosCompleted,
    label: LABELS[labelMode],
    start,
    pause,
    resume,
    reset,
    skipBreak,
  };
}
