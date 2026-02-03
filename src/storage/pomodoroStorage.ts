import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PomodoroMode } from '../hooks/usePomodoro';

export type PomodoroStoredState = {
  mode: PomodoroMode;
  isRunning: boolean;
  currentSegment: 'focus' | 'shortBreak' | 'longBreak';
  pomodorosCompleted: number;
  endTimestampMs: number | null;
  remainingSeconds: number;
  durations: {
    focus: number;
    shortBreak: number;
    longBreak: number;
  };
  updatedAt: number;
};

const STORAGE_KEY = 'pomodoro.state.v1';

export async function loadPomodoroState(): Promise<PomodoroStoredState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as PomodoroStoredState;
  } catch {
    return null;
  }
}

export async function savePomodoroState(state: PomodoroStoredState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors to avoid breaking the timer.
  }
}

export async function clearPomodoroState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors to avoid breaking the timer.
  }
}
