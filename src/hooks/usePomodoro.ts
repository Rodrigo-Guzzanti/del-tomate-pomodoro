import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-native';
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

export type PomodoroMode = 'idle' | 'focus' | 'shortBreak' | 'longBreak' | 'paused';
type SegmentMode = 'focus' | 'shortBreak' | 'longBreak';
export type PomodoroSettings = {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  longBreakEvery: number;
};

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

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  longBreakEvery: 4,
};

const MIN_MAX = {
  focusMin: { min: 1, max: 90 },
  shortBreakMin: { min: 1, max: 30 },
  longBreakMin: { min: 1, max: 60 },
} as const;

type DurationSeconds = {
  focus: number;
  shortBreak: number;
  longBreak: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function sanitizeSettings(next: Partial<PomodoroSettings>): PomodoroSettings {
  return {
    focusMin: clamp(
      Math.round(next.focusMin ?? DEFAULT_SETTINGS.focusMin),
      MIN_MAX.focusMin.min,
      MIN_MAX.focusMin.max
    ),
    shortBreakMin: clamp(
      Math.round(next.shortBreakMin ?? DEFAULT_SETTINGS.shortBreakMin),
      MIN_MAX.shortBreakMin.min,
      MIN_MAX.shortBreakMin.max
    ),
    longBreakMin: clamp(
      Math.round(next.longBreakMin ?? DEFAULT_SETTINGS.longBreakMin),
      MIN_MAX.longBreakMin.min,
      MIN_MAX.longBreakMin.max
    ),
    longBreakEvery: Math.max(1, Math.round(next.longBreakEvery ?? DEFAULT_SETTINGS.longBreakEvery)),
  };
}

function durationsFromSettings(settings: PomodoroSettings): DurationSeconds {
  return {
    focus: settings.focusMin * 60,
    shortBreak: settings.shortBreakMin * 60,
    longBreak: settings.longBreakMin * 60,
  };
}

function settingsFromDurationSeconds(durations: DurationSeconds): PomodoroSettings {
  return sanitizeSettings({
    focusMin: Math.round(durations.focus / 60),
    shortBreakMin: Math.round(durations.shortBreak / 60),
    longBreakMin: Math.round(durations.longBreak / 60),
    longBreakEvery: DEFAULT_SETTINGS.longBreakEvery,
  });
}

const LABELS: Record<SegmentMode, string> = {
  focus: 'Foco',
  shortBreak: 'Descanso',
  longBreak: 'Descanso largo',
};

export function usePomodoro(options: PomodoroOptions = {}) {
  const initialSettings = useMemo(
    () =>
      sanitizeSettings({
        ...DEFAULT_SETTINGS,
        focusMin: options.focusDuration
          ? Math.round(options.focusDuration / 60)
          : options.durations
            ? Math.round(options.durations.focus / 60)
            : DEFAULT_SETTINGS.focusMin,
        shortBreakMin: options.shortBreakDuration
          ? Math.round(options.shortBreakDuration / 60)
          : options.durations
            ? Math.round(options.durations.shortBreak / 60)
            : DEFAULT_SETTINGS.shortBreakMin,
        longBreakMin: options.longBreakDuration
          ? Math.round(options.longBreakDuration / 60)
          : options.durations
            ? Math.round(options.durations.longBreak / 60)
            : DEFAULT_SETTINGS.longBreakMin,
      }),
    [
      options.durations,
      options.focusDuration,
      options.shortBreakDuration,
      options.longBreakDuration,
    ]
  );
  const [settings, setSettings] = useState<PomodoroSettings>(initialSettings);
  const durations = useMemo(() => durationsFromSettings(settings), [settings]);

  const autoStart = options.autoStart ?? false;

  const [mode, setModeState] = useState<PomodoroMode>('idle');
  const [currentSegment, setCurrentSegment] = useState<SegmentMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(durations.focus);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);

  const endTimestampRef = useRef<number | null>(null);
  const transitioningRef = useRef(false);
  const pomodorosCompletedRef = useRef(0);
  const currentSegmentRef = useRef<SegmentMode>('focus');
  const rehydratedRef = useRef(false);
  const modeRef = useRef<PomodoroMode>('idle');
  const userInteractedRef = useRef(false);
  const settingsRef = useRef<PomodoroSettings>(settings);

  const setModeDebug = useCallback((nextMode: PomodoroMode, reason: string) => {
    const prevMode = modeRef.current;
    if (__DEV__) {
      if (prevMode !== nextMode) {
        console.log('[Pomodoro/mode]', `${prevMode} -> ${nextMode}`, { reason });
      } else {
        console.log('[Pomodoro/mode]', `${prevMode} (no-op)`, { reason });
      }
    }
    modeRef.current = nextMode;
    setModeState(nextMode);
  }, []);

  useEffect(() => {
    pomodorosCompletedRef.current = pomodorosCompleted;
  }, [pomodorosCompleted]);

  useEffect(() => {
    currentSegmentRef.current = currentSegment;
  }, [currentSegment]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

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
      settings?: PomodoroSettings;
      durations?: DurationSeconds;
    }) => {
      const persistedSettings = nextState.settings ?? settingsRef.current;
      const persistedDurations = nextState.durations ?? durationsFromSettings(persistedSettings);
      void savePomodoroState({
        ...nextState,
        settings: persistedSettings,
        durations: persistedDurations,
        updatedAt: Date.now(),
      });
    },
    []
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
      unstable_batchedUpdates(() => {
        setCurrentSegment(nextSegment);
        setModeDebug(nextSegment, 'startSegment');
        setRemainingSeconds(duration);
        if (shouldRun) {
          setIsRunning(true);
          endTimestampRef.current = startTimestampMs + duration * 1000;
        } else {
          setIsRunning(false);
          endTimestampRef.current = null;
        }
      });
      currentSegmentRef.current = nextSegment;
      persistState({
        mode: nextSegment,
        isRunning: shouldRun,
        currentSegment: nextSegment,
        pomodorosCompleted: nextPomodorosCompleted,
        endTimestampMs: shouldRun ? startTimestampMs + duration * 1000 : null,
        remainingSeconds: duration,
      });
      if (shouldRun) {
        void cancelPomodoroNotifications();
        void schedulePomodoroNotification(
          nextSegment === 'focus' ? 'focus' : 'break',
          duration
        );
        if (withFeedback) {
          void playStartSound();
          void hapticStart();
        }
      }
    },
    [durations, persistState, setModeDebug]
  );

  const advanceSegment = useCallback(() => {
    const segment = currentSegmentRef.current;
    if (segment === 'focus') {
      const nextCount = pomodorosCompletedRef.current + 1;
      setPomodorosCompleted(nextCount);
      const nextSegment: SegmentMode =
        nextCount % settingsRef.current.longBreakEvery === 0
          ? 'longBreak'
          : 'shortBreak';
      if (__DEV__) {
        console.log('[Pomodoro/transition]', {
          from: 'focus',
          to: nextSegment,
          pomodorosCompleted: nextCount,
        });
      }
      startSegment(nextSegment, autoStart, { pomodorosCompleted: nextCount });
    } else {
      if (__DEV__) {
        console.log('[Pomodoro/transition]', {
          from: segment,
          to: 'focus',
          pomodorosCompleted: pomodorosCompletedRef.current,
        });
      }
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
      if (userInteractedRef.current) {
        rehydratedRef.current = true;
        return;
      }

      const restoredSettings = saved.settings
        ? sanitizeSettings(saved.settings)
        : saved.durations
          ? settingsFromDurationSeconds(saved.durations)
          : initialSettings;
      const restoredDurations = durationsFromSettings(restoredSettings);

      let nextSegment = saved.currentSegment;
      let nextPomodorosCompleted = saved.pomodorosCompleted;
      let nextMode: PomodoroMode = saved.mode;
      let nextIsRunning = saved.isRunning;
      let nextRemainingSeconds = saved.remainingSeconds;
      let nextEndTimestampMs = saved.endTimestampMs ?? null;

      if (nextMode === 'paused') {
        nextMode = nextSegment;
        nextIsRunning = false;
        nextEndTimestampMs = null;
      }

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
              nextPomodorosCompleted % restoredSettings.longBreakEvery === 0
                ? 'longBreak'
                : 'shortBreak';
          } else {
            nextSegment = 'focus';
          }

          const duration = restoredDurations[nextSegment];
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
        nextMode = nextSegment;
        nextEndTimestampMs = null;
      }

      unstable_batchedUpdates(() => {
        setSettings(restoredSettings);
        setCurrentSegment(nextSegment);
        setPomodorosCompleted(nextPomodorosCompleted);
        setModeDebug(nextMode, 'rehydrate');
        setIsRunning(nextIsRunning);
        setRemainingSeconds(nextRemainingSeconds);
      });
      settingsRef.current = restoredSettings;
      endTimestampRef.current = nextEndTimestampMs;
      currentSegmentRef.current = nextSegment;
      pomodorosCompletedRef.current = nextPomodorosCompleted;

      persistState({
        mode: nextMode,
        isRunning: nextIsRunning,
        currentSegment: nextSegment,
        pomodorosCompleted: nextPomodorosCompleted,
        endTimestampMs: nextEndTimestampMs,
        remainingSeconds: nextRemainingSeconds,
        settings: restoredSettings,
        durations: restoredDurations,
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
  }, [autoStart, initialSettings, persistState, setModeDebug]);

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
    if (isRunning) {
      return;
    }
    userInteractedRef.current = true;
    const nextSegment: SegmentMode =
      mode === 'idle'
        ? 'focus'
        : mode === 'focus' || mode === 'shortBreak' || mode === 'longBreak'
          ? mode
          : currentSegmentRef.current;
    const modeDuration = durations[nextSegment];
    const needsModeDuration = remainingSeconds <= 0;
    const duration = needsModeDuration ? modeDuration : remainingSeconds;
    const startTimestampMs = Date.now();
    const nextEndTimestamp = startTimestampMs + duration * 1000;
    unstable_batchedUpdates(() => {
      setCurrentSegment(nextSegment);
      if (mode !== nextSegment) {
        setModeDebug(nextSegment, 'start');
      }
      setIsRunning(true);
      if (needsModeDuration) {
        setRemainingSeconds(modeDuration);
      }
    });
    currentSegmentRef.current = nextSegment;
    endTimestampRef.current = nextEndTimestamp;
    if (__DEV__) {
      console.log('[Pomodoro/start]', {
        modeBeforeStart: mode,
        modeAfterStart: nextSegment,
        remainingBeforeStart: remainingSeconds,
        remainingAfterStart: needsModeDuration ? modeDuration : remainingSeconds,
      });
    }
    void cancelPomodoroNotifications();
    void schedulePomodoroNotification(
      nextSegment === 'focus' ? 'focus' : 'break',
      duration
    );
    void playStartSound();
    void hapticStart();
    persistState({
      mode: nextSegment,
      isRunning: true,
      currentSegment: nextSegment,
      pomodorosCompleted: pomodorosCompletedRef.current,
      endTimestampMs: nextEndTimestamp,
      remainingSeconds: duration,
    });
  }, [durations, isRunning, mode, remainingSeconds, setModeDebug]);

  const pause = useCallback(() => {
    if (!isRunning) {
      return;
    }
    userInteractedRef.current = true;
    const remaining = getRemainingSeconds();
    unstable_batchedUpdates(() => {
      setRemainingSeconds(remaining);
      setIsRunning(false);
    });
    endTimestampRef.current = null;
    void playStartSound();
    void cancelPomodoroNotifications();
    const persistedMode: PomodoroMode =
      mode === 'focus' || mode === 'shortBreak' || mode === 'longBreak'
        ? mode
        : currentSegmentRef.current;
    persistState({
      mode: persistedMode,
      isRunning: false,
      currentSegment: currentSegmentRef.current,
      pomodorosCompleted: pomodorosCompletedRef.current,
      endTimestampMs: null,
      remainingSeconds: remaining,
    });
  }, [getRemainingSeconds, isRunning, mode, persistState]);

  const resume = useCallback(() => {
    if (isRunning) {
      return;
    }
    userInteractedRef.current = true;
    const resumedSegment: SegmentMode =
      mode === 'focus' || mode === 'shortBreak' || mode === 'longBreak'
        ? mode
        : currentSegmentRef.current;
    const needsModeDuration = remainingSeconds <= 0;
    const duration = needsModeDuration ? durations[resumedSegment] : remainingSeconds;
    const startTimestampMs = Date.now();
    const nextEndTimestamp = startTimestampMs + duration * 1000;
    unstable_batchedUpdates(() => {
      setCurrentSegment(resumedSegment);
      if (mode !== resumedSegment) {
        setModeDebug(resumedSegment, 'resume');
      }
      setIsRunning(true);
      if (needsModeDuration) {
        setRemainingSeconds(duration);
      }
    });
    endTimestampRef.current = nextEndTimestamp;
    void cancelPomodoroNotifications();
    void schedulePomodoroNotification(
      resumedSegment === 'focus' ? 'focus' : 'break',
      duration
    );
    void playStartSound();
    void hapticStart();
    persistState({
      mode: resumedSegment,
      isRunning: true,
      currentSegment: resumedSegment,
      pomodorosCompleted: pomodorosCompletedRef.current,
      endTimestampMs: nextEndTimestamp,
      remainingSeconds: duration,
    });
  }, [durations, isRunning, mode, persistState, remainingSeconds, setModeDebug]);

  const reset = useCallback(() => {
    userInteractedRef.current = true;
    unstable_batchedUpdates(() => {
      setIsRunning(false);
      setModeDebug('idle', 'reset');
      setCurrentSegment('focus');
      setRemainingSeconds(durations.focus);
      setPomodorosCompleted(0);
    });
    endTimestampRef.current = null;
    transitioningRef.current = false;
    currentSegmentRef.current = 'focus';
    pomodorosCompletedRef.current = 0;
    void cancelPomodoroNotifications();
    void clearPomodoroState();
  }, [durations.focus, setModeDebug]);

  const skipBreak = useCallback(() => {
    if (mode !== 'shortBreak' && mode !== 'longBreak') {
      return;
    }
    userInteractedRef.current = true;
    startSegment('focus', true);
  }, [mode, startSegment]);

  const updateSettings = useCallback(
    (
      partialOrNextSettings: Partial<PomodoroSettings> | PomodoroSettings
    ) => {
      userInteractedRef.current = true;
      const prevSettings = settingsRef.current;
      const nextSettings = sanitizeSettings({
        ...prevSettings,
        ...partialOrNextSettings,
      });
      const nextDurations = durationsFromSettings(nextSettings);

      setSettings(nextSettings);
      settingsRef.current = nextSettings;

      let nextRemaining = remainingSeconds;
      if (!isRunning) {
        const remainingSegment: SegmentMode =
          mode === 'idle' || mode === 'paused'
            ? currentSegmentRef.current
            : mode;
        nextRemaining = nextDurations[remainingSegment];
        setRemainingSeconds(nextRemaining);
      }

      const currentMode: PomodoroMode = modeRef.current;
      const persistedRemaining = isRunning
        ? getRemainingSeconds()
        : nextRemaining;

      // Keep the active running session unchanged; new durations apply on the next segment.
      persistState({
        mode: currentMode,
        isRunning,
        currentSegment: currentSegmentRef.current,
        pomodorosCompleted: pomodorosCompletedRef.current,
        endTimestampMs: endTimestampRef.current,
        remainingSeconds: persistedRemaining,
        settings: nextSettings,
        durations: nextDurations,
      });
    },
    [getRemainingSeconds, isRunning, mode, persistState, remainingSeconds]
  );

  const labelMode: SegmentMode =
    mode === 'paused' || mode === 'idle' ? currentSegment : mode;

  return {
    mode,
    isRunning,
    remainingSeconds,
    pomodorosCompleted,
    settings,
    label: LABELS[labelMode],
    start,
    pause,
    resume,
    reset,
    skipBreak,
    updateSettings,
  };
}
