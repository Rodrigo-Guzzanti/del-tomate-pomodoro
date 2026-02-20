import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task } from '../types/task';

const TASKS_KEY = 'dt_tasks_v1';
const ACTIVE_TASK_ID_KEY = 'dt_active_task_id_v1';

export async function loadTasks(): Promise<Task[]> {
  try {
    const raw = await AsyncStorage.getItem(TASKS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isTaskLike).map((task) => ({
      id: task.id,
      title: task.title.trim(),
      createdAt: task.createdAt,
    }));
  } catch {
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export async function loadActiveTaskId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_TASK_ID_KEY);
}

export async function saveActiveTaskId(taskId: string | null): Promise<void> {
  if (!taskId) {
    await AsyncStorage.removeItem(ACTIVE_TASK_ID_KEY);
    return;
  }
  await AsyncStorage.setItem(ACTIVE_TASK_ID_KEY, taskId);
}

function isTaskLike(value: unknown): value is Task {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const maybeTask = value as Partial<Task>;
  return (
    typeof maybeTask.id === 'string' &&
    typeof maybeTask.title === 'string' &&
    typeof maybeTask.createdAt === 'string'
  );
}

