import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePomodoro } from '../hooks/usePomodoro';
import { colors, radius, spacing, typography } from '../theme/tokens';

export default function HomeTimer() {
  const {
    mode,
    isRunning,
    remainingSeconds,
    pomodorosCompleted,
    label,
    start,
    pause,
    resume,
    skipBreak,
  } = usePomodoro();

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const primaryLabel = isRunning ? 'Pausar' : mode === 'paused' ? 'Reanudar' : 'Iniciar';
  const onPrimaryPress = isRunning ? pause : mode === 'paused' ? resume : start;

  const totalPomodoros = 4;
  const showSkipBreak = mode === 'shortBreak' || mode === 'longBreak';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Del Tomate</Text>
        <Text style={styles.title}>Pomodoro</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Tarea activa</Text>
        <View style={styles.selector}>
          <Text style={styles.selectorText}>Elegir tarea</Text>
        </View>

        <View style={styles.timerBlock}>
          <Text style={styles.timerState}>{label}</Text>
          <Text style={styles.timer}>{timeLabel}</Text>
          <Text style={styles.timerNote}>
            {mode === 'paused' ? 'Pausado' : isRunning ? 'En curso' : 'Listo para iniciar'}
          </Text>
        </View>

        <View style={styles.progressRow}>
          {Array.from({ length: totalPomodoros }).map((_, index) => (
            <View
              key={`pomodoro-${index}`}
              style={index < pomodorosCompleted ? styles.tomatoDot : styles.tomatoDotEmpty}
            />
          ))}
          <Text style={styles.tomatoLabel}>
            {pomodorosCompleted}/{totalPomodoros} tomates
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onPrimaryPress}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
      >
        <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
      </Pressable>

      {showSkipBreak && (
        <Pressable
          onPress={skipBreak}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
        >
          <Text style={styles.secondaryButtonText}>Saltar descanso</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
  },
  kicker: {
    fontSize: typography.size.sm,
    color: colors.textDark,
    fontFamily: typography.family.medium,
  },
  title: {
    marginTop: spacing.xs,
    fontSize: typography.size.xxl,
    color: colors.textDark,
    fontFamily: typography.family.bold,
    letterSpacing: 0.5,
  },
  card: {
    width: '100%',
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sectionLabel: {
    fontSize: typography.size.sm,
    color: colors.textDark,
    fontFamily: typography.family.medium,
  },
  selector: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
  },
  selectorText: {
    fontSize: typography.size.md,
    color: colors.textDark,
    fontFamily: typography.family.medium,
  },
  timerBlock: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  timerState: {
    fontSize: typography.size.sm,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.primary,
    fontFamily: typography.family.bold,
  },
  timer: {
    marginTop: spacing.sm,
    fontSize: 56,
    color: colors.textDark,
    fontFamily: typography.family.bold,
    letterSpacing: -1,
  },
  timerNote: {
    marginTop: spacing.xs,
    fontSize: typography.size.sm,
    color: colors.textDark,
    fontFamily: typography.family.regular,
    opacity: 0.6,
  },
  progressRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tomatoDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  tomatoDotEmpty: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tomatoLabel: {
    fontSize: typography.size.sm,
    color: colors.textDark,
    fontFamily: typography.family.medium,
    opacity: 0.7,
  },
  primaryButton: {
    marginTop: spacing.xl,
    width: '100%',
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    fontSize: typography.size.lg,
    color: colors.white,
    fontFamily: typography.family.bold,
  },
  secondaryButton: {
    marginTop: spacing.sm,
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  secondaryButtonText: {
    fontSize: typography.size.md,
    color: colors.primary,
    fontFamily: typography.family.bold,
  },
});
