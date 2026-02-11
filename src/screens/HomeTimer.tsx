import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { usePomodoro } from '../hooks/usePomodoro';
import { cancelPomodoroNotifications } from '../services/notifications';
import { clearPomodoroState } from '../storage/pomodoroStorage';
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
    reset,
    skipBreak,
  } = usePomodoro();

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const primaryLabel = isRunning ? 'Pausar' : mode === 'paused' ? 'Reanudar' : 'Iniciar';
  const onPrimaryPress = isRunning ? pause : mode === 'paused' ? resume : start;

  const totalPomodoros = 4;
  const showSkipBreak = mode === 'shortBreak' || mode === 'longBreak';

  const isPaused = mode === 'paused';
  const isReady = !isRunning && !isPaused;

  const backgroundAnim = useRef(new Animated.Value(isReady ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(backgroundAnim, {
      toValue: isReady ? 0 : 1,
      duration: 420,
      useNativeDriver: false,
    }).start();
  }, [backgroundAnim, isReady]);

  const screenBackground = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary, colors.textDark],
  });

  const ui = {
    textSecondary: isReady ? colors.textDark : colors.white,
    textSecondaryOpacity: isReady ? 0.85 : 0.65,
    timerState: isReady ? colors.textDark : colors.white,
    timerPrimary: colors.white,
    timerNote: isPaused ? colors.secondaryBlue : isReady ? colors.textDark : colors.white,
    timerNoteOpacity: isPaused || isReady ? 1 : 0.65,
    glassBackground: isReady ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)',
    glassBorder: isReady ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.18)',
    glassHighlight: 'rgba(255,255,255,0.06)',
    tomatoLabel: isReady ? colors.textDark : colors.white,
    tomatoLabelOpacity: isReady ? 0.7 : 0.6,
    tomatoDot: isReady ? 'rgba(255,255,255,0.92)' : colors.primary,
    tomatoDotEmpty: isReady ? 'rgba(8,30,37,0.36)' : 'rgba(255,255,255,0.35)',
    primaryButtonBackground: isReady ? colors.textDark : colors.primary,
    secondaryButtonBorder: isReady ? colors.primary : 'rgba(255,255,255,0.3)',
    secondaryButtonText: isReady ? colors.primary : colors.white,
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: screenBackground }]}>
      <View style={styles.content}>
        <View style={styles.taskBlock}>
          <Text
            style={[
              styles.sectionLabel,
              { color: ui.textSecondary, opacity: ui.textSecondaryOpacity },
            ]}
          >
            Tarea activa
          </Text>
          <Pressable
            onPress={() => {}}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.selector,
              styles.glassPill,
              { backgroundColor: ui.glassBackground, borderColor: ui.glassBorder },
              pressed && styles.selectorPressed,
            ]}
          >
            <View
              pointerEvents="none"
              style={[styles.glassHighlight, { backgroundColor: ui.glassHighlight }]}
            />
            <Text
              style={[
                styles.selectorText,
                { color: ui.textSecondary, opacity: ui.textSecondaryOpacity },
              ]}
            >
              Elegir tarea
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.timerBlock,
            styles.glassPanel,
            { backgroundColor: ui.glassBackground, borderColor: ui.glassBorder },
          ]}
        >
          <View
            pointerEvents="none"
            style={[styles.glassHighlight, { backgroundColor: ui.glassHighlight }]}
          />
          <Text style={[styles.timerState, { color: ui.timerState }]}>{label}</Text>
          <Text style={[styles.timer, { color: ui.timerPrimary }]}>{timeLabel}</Text>
          <Text style={[styles.timerNote, { color: ui.timerNote, opacity: ui.timerNoteOpacity }]}>
            {mode === 'paused' ? 'Pausado' : isRunning ? 'En curso' : 'Listo para iniciar'}
          </Text>
        </View>

        <View style={styles.progressRow}>
          {Array.from({ length: totalPomodoros }).map((_, index) => (
            <View
              key={`pomodoro-${index}`}
              style={[
                index < pomodorosCompleted ? styles.tomatoDot : styles.tomatoDotEmpty,
                {
                  backgroundColor: index < pomodorosCompleted ? ui.tomatoDot : 'transparent',
                  borderColor: ui.tomatoDotEmpty,
                },
              ]}
            />
          ))}
          <Text
            style={[styles.tomatoLabel, { color: ui.tomatoLabel, opacity: ui.tomatoLabelOpacity }]}
          >
            {pomodorosCompleted}/{totalPomodoros} tomates
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onPrimaryPress}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: ui.primaryButtonBackground },
          pressed && styles.primaryButtonPressed,
        ]}
      >
        <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
      </Pressable>

      {showSkipBreak && (
        <Pressable
          onPress={skipBreak}
          style={({ pressed }) => [
            styles.secondaryButton,
            { borderColor: ui.secondaryButtonBorder },
            pressed && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: ui.secondaryButtonText }]}>
            Saltar descanso
          </Text>
        </Pressable>
      )}

      {__DEV__ && (
        <Pressable
          onPress={() => {
            reset();
            void clearPomodoroState();
            void cancelPomodoroNotifications();
          }}
          style={({ pressed }) => [
            styles.debugButton,
            { borderColor: ui.secondaryButtonBorder },
            pressed && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={[styles.debugButtonText, { color: ui.secondaryButtonText }]}>
            Reset (debug)
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskBlock: {
    width: '100%',
    marginBottom: spacing.xl,
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
    overflow: 'hidden',
    position: 'relative',
  },
  glassPill: {
    borderRadius: radius.md,
    borderWidth: 1,
  },
  selectorPressed: {
    opacity: 0.85,
  },
  selectorText: {
    fontSize: typography.size.md,
    color: colors.textDark,
    fontFamily: typography.family.medium,
  },
  timerBlock: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  glassPanel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
  },
  timerState: {
    fontSize: typography.size.sm,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    fontFamily: typography.family.bold,
  },
  timer: {
    marginTop: spacing.sm,
    fontSize: 56,
    fontFamily: typography.family.bold,
    letterSpacing: -1,
  },
  timerNote: {
    marginTop: spacing.xs,
    fontSize: typography.size.sm,
    fontFamily: typography.family.regular,
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
    borderWidth: 1,
  },
  tomatoDotEmpty: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
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
  debugButton: {
    marginTop: spacing.sm,
    width: '100%',
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.medium,
  },
});
