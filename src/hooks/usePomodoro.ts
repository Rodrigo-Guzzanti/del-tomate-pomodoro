import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Constants from 'expo-constants';
import {
  hapticEnd,
  hapticStart,
  playBreakEndSound,
  playFocusEndSound,
  playStartSound,
} from '../services/feedback';
import {
  cancelPomodoroNotifications,
  schedulePomodoroNotification,
} from '../services/notifications';
import {
  clearPomodoroState,
  loadPomodoroState,
  savePomodoroState,
} from '../storage/pomodoroStorage';
import { getDefaultDurations } from '../config/durations';

export type PomodoroMode = 'idle' | 'focus' | 'shortBreak' | 'longBreak' | 'paused';
type SegmentMode = 'focus' | 'shortBreak' | 'longBreak';

type PomodoroOptions = {
  focusDuration?: number;
  shortBreakDuration?: number;
  longBreakDuration?: number;
  durations?: {
    focus: number;
    shortBreak: number;
    longBreak: number;
  };
  autoStart?: boolean;
};

const LABELS: Record<SegmentMode, string> = {
  focus: 'Foco',
  shortBreak: 'Descanso',
  longBreak: 'Descanso largo',
};

export function usePomodoro(options: PomodoroOptions = {}) {
  const devDurations = Constants.expoConfig?.extra?.devDurations ?? false;
  const durations = useMemo(
    () => ({
      ...(() => {
        const base = options.durations ?? getDefaultDurations(devDurations);
        return {
          focus: options.focusDuration ?? base.focus,
          shortBreak: options.shortBreakDuration ?? base.shortBreak,
          longBreak: options.longBreakDuration ?? base.longBreak,
        };
      })(),
    }),
    [
      devDurations,
      options.durations,
      options.focusDuration,
      options.shortBreakDuration,
      options.longBreakDuration,
    ]
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
  const rehydratedRef = useRef(false);

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

  const persistState = useCallback(
    (nextState: {
      mode: PomodoroMode;
      isRunning: boolean;
      currentSegment: SegmentMode;
      pomodorosCompleted: number;
      endTimestampMs: number | null;
      remainingSeconds: number;
    }) => {
      void savePomodoroState({
        ...nextState,
        durations,
        updatedAt: Date.now(),
      });
    },
    [durations]
  );

  const startSegment = useCallback(
    (
      nextSegment: SegmentMode,
      shouldRun: boolean,
      options?: {
        startTimestampMs?: number;
        withFeedback?: boolean;
        pomodorosCompleted?: number;
      }
    ) => {
      const duration = durations[nextSegment];
      const startTimestampMs = options?.startTimestampMs ?? Date.now();
      const withFeedback = options?.withFeedback ?? true;
      const nextPomodorosCompleted =
        options?.pomodorosCompleted ?? pomodorosCompletedRef.current;
      setCurrentSegment(nextSegment);
      setMode(nextSegment);
      setRemainingSeconds(duration);
      if (shouldRun) {
        setIsRunning(true);
        endTimestampRef.current = startTimestampMs + duration * 1000;
        void cancelPomodoroNotifications();
        void schedulePomodoroNotification(
          nextSegment === 'focus' ? 'focus' : 'break',
          duration
        );
        if (withFeedback) {
          void playStartSound();
          void hapticStart();
        }
      } else {
        setIsRunning(false);
        endTimestampRef.current = null;
      }
      persistState({
        mode: nextSegment,
        isRunning: shouldRun,
        currentSegment: nextSegment,
        pomodorosCompleted: nextPomodorosCompleted,
        endTimestampMs: shouldRun ? startTimestampMs + duration * 1000 : null,
        remainingSeconds: duration,
      });
    },
    [durations, persistState]
  );

  const advanceSegment = useCallback(() => {
    const segment = currentSegmentRef.current;
    if (segment === 'focus') {
      const nextCount = pomodorosCompletedRef.current + 1;
      setPomodorosCompleted(nextCount);
      const nextSegment: SegmentMode =
        nextCount % 4 === 0 ? 'longBreak' : 'shortBreak';
      startSegment(nextSegment, autoStart, { pomodorosCompleted: nextCount });
    } else {
      startSegment('focus', autoStart);
    }
  }, [autoStart, startSegment]);

  useEffect(() => {
    if (rehydratedRef.current) {
      return;
    }

    let isMounted = true;
    const rehydrate = async () => {
      const saved = await loadPomodoroState();
      if (!saved || !isMounted) {
        rehydratedRef.current = true;
        return;
      }

      let nextSegment = saved.currentSegment;
      let nextPomodorosCompleted = saved.pomodorosCompleted;
      let nextMode: PomodoroMode = saved.mode;
      let nextIsRunning = saved.isRunning;
      let nextRemainingSeconds = saved.remainingSeconds;
      let nextEndTimestampMs = saved.endTimestampMs ?? null;

      if (saved.isRunning && saved.endTimestampMs) {
        const nowMs = Date.now();
        let remaining = Math.ceil((saved.endTimestampMs - nowMs) / 1000);
        let advances = 0;
        nextMode = nextSegment;

        while (remaining <= 0 && advances < 2) {
          advances += 1;
          if (nextSegment === 'focus') {
            nextPomodorosCompleted += 1;
            nextSegment =
              nextPomodorosCompleted % 4 === 0 ? 'longBreak' : 'shortBreak';
          } else {
            nextSegment = 'focus';
          }

          const duration = durations[nextSegment];
          if (!autoStart) {
            nextIsRunning = false;
            nextEndTimestampMs = null;
            nextMode = nextSegment;
            nextRemainingSeconds = duration;
            remaining = duration;
            break;
          }

          remaining = duration + remaining;
          nextMode = nextSegment;
          nextIsRunning = true;
          nextRemainingSeconds = Math.max(0, remaining);
          nextEndTimestampMs = nowMs + nextRemainingSeconds * 1000;
        }

        if (remaining > 0 && autoStart) {
          nextMode = nextSegment;
          nextIsRunning = true;
          nextRemainingSeconds = remaining;
          nextEndTimestampMs = nowMs + remaining * 1000;
        } else if (remaining <= 0 && autoStart) {
          nextMode = nextSegment;
          nextIsRunning = true;
          nextRemainingSeconds = 0;
          nextEndTimestampMs = nowMs;
        }
      } else if (saved.isRunning && !saved.endTimestampMs) {
        nextIsRunning = false;
        nextMode = 'paused';
        nextEndTimestampMs = null;
      }

      setCurrentSegment(nextSegment);
      setPomodorosCompleted(nextPomodorosCompleted);
      setMode(nextMode);
      setIsRunning(nextIsRunning);
      setRemainingSeconds(nextRemainingSeconds);
      endTimestampRef.current = nextEndTimestampMs;

      persistState({
        mode: nextMode,
        isRunning: nextIsRunning,
        currentSegment: nextSegment,
        pomodorosCompleted: nextPomodorosCompleted,
        endTimestampMs: nextEndTimestampMs,
        remainingSeconds: nextRemainingSeconds,
      });

      if (nextIsRunning && nextRemainingSeconds > 0) {
        void cancelPomodoroNotifications();
        void schedulePomodoroNotification(
          nextSegment === 'focus' ? 'focus' : 'break',
          nextRemainingSeconds
        );
      }

      rehydratedRef.current = true;
    };

    void rehydrate();
    return () => {
      isMounted = false;
    };
  }, [autoStart, durations, persistState]);

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
        const finishedSegment = currentSegmentRef.current;
        if (finishedSegment === 'focus') {
          void playFocusEndSound();
          void hapticEnd();
        } else {
          void playBreakEndSound();
          void hapticEnd();
        }
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
    const startTimestampMs = Date.now();
    endTimestampRef.current = startTimestampMs + duration * 1000;
    void cancelPomodoroNotifications();
    void schedulePomodoroNotification(
      currentSegment === 'focus' ? 'focus' : 'break',
      duration
    );
    void playStartSound();
    void hapticStart();
    persistState({
      mode: currentSegment,
      isRunning: true,
      currentSegment,
      pomodorosCompleted: pomodorosCompletedRef.current,
      endTimestampMs: endTimestampRef.current,
      remainingSeconds: duration,
    });
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
    void playStartSound();
    void cancelPomodoroNotifications();
    persistState({
      mode: 'paused',
      isRunning: false,
      currentSegment: currentSegmentRef.current,
      pomodorosCompleted: pomodorosCompletedRef.current,
      endTimestampMs: null,
      remainingSeconds: remaining,
    });
  }, [getRemainingSeconds, isRunning, persistState]);

  const resume = useCallback(() => {
    if (mode !== 'paused') {
      return;
    }
    setMode(currentSegment);
    setIsRunning(true);
    const startTimestampMs = Date.now();
    endTimestampRef.current = startTimestampMs + remainingSeconds * 1000;
    void cancelPomodoroNotifications();
    void schedulePomodoroNotification(
      currentSegment === 'focus' ? 'focus' : 'break',
      remainingSeconds
    );
    void playStartSound();
    void hapticStart();
    persistState({
      mode: currentSegment,
      isRunning: true,
      currentSegment,
      pomodorosCompleted: pomodorosCompletedRef.current,
      endTimestampMs: endTimestampRef.current,
      remainingSeconds,
    });
  }, [currentSegment, mode, persistState, remainingSeconds]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setMode('idle');
    setCurrentSegment('focus');
    setRemainingSeconds(durations.focus);
    setPomodorosCompleted(0);
    endTimestampRef.current = null;
    void cancelPomodoroNotifications();
    void clearPomodoroState();
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
