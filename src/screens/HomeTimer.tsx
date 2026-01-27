import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';

export default function HomeTimer() {
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
          <Text style={styles.timerState}>Work</Text>
          <Text style={styles.timer}>25:00</Text>
          <Text style={styles.timerNote}>Sesión de enfoque</Text>
        </View>

        <View style={styles.progressRow}>
          <View style={styles.tomatoDot} />
          <View style={styles.tomatoDot} />
          <View style={styles.tomatoDotEmpty} />
          <Text style={styles.tomatoLabel}>2/5 tomates</Text>
        </View>
      </View>

      <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
        <Text style={styles.primaryButtonText}>Iniciar</Text>
      </Pressable>
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
});
