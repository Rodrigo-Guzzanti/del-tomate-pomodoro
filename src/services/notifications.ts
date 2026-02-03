import * as Notifications from 'expo-notifications';

type PomodoroNotificationKind = 'focus' | 'break';

const NOTIFICATION_CONTENT: Record<PomodoroNotificationKind, { title: string; body: string }> = {
  focus: {
    title: 'Foco terminado',
    body: 'Hora de descansar.',
  },
  break: {
    title: 'Descanso terminado',
    body: 'Hora de enfocarte.',
  },
};

export async function schedulePomodoroNotification(
  kind: PomodoroNotificationKind,
  secondsFromNow: number
): Promise<void> {
  try {
    if (secondsFromNow <= 0) {
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: NOTIFICATION_CONTENT[kind],
      trigger: {
        seconds: Math.max(1, Math.round(secondsFromNow)),
      },
    });
  } catch {
    // Ignore notification errors to avoid breaking the timer.
  }
}

export async function cancelPomodoroNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Ignore notification errors to avoid breaking the timer.
  }
}
