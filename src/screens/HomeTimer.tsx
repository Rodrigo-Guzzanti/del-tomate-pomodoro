import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';

export default function HomeTimer() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Del Tomate</Text>
        <Text style={styles.title}>Timer</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Tarea activa</Text>
        <View style={styles.selector}>
          <Text style={styles.selectorText}>Elegir tarea</Text>
        </View>

        <View style={styles.timerBlock}>
          <Text style={styles.timerState}>Work</Text>
          <Text style={styles.timer}>25:00</Text>
          <Text style={styles.timerNote}>Sincronizado con el reloj</Text>
        </View>

        <View style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Start</Text>
        </View>
      </View>

      <View style={styles.tomatoRow}>
        <View style={styles.tomatoDot} />
        <View style={styles.tomatoDot} />
        <View style={styles.tomatoDotEmpty} />
        <Text style={styles.tomatoLabel}>2/5 tomates</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.cream,
  },
  header: {
    marginTop: spacing.lg,
  },
  kicker: {
    fontSize: typography.size.sm,
    color: colors.charcoalSoft,
    fontFamily: typography.family.medium,
  },
  title: {
    marginTop: spacing.xs,
    fontSize: typography.size.xxl,
    color: colors.charcoal,
    fontFamily: typography.family.semibold,
  },
  card: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sectionLabel: {
    fontSize: typography.size.sm,
    color: colors.charcoalSoft,
    fontFamily: typography.family.medium,
  },
  selector: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
  },
  selectorText: {
    fontSize: typography.size.md,
    color: colors.charcoal,
    fontFamily: typography.family.medium,
  },
  timerBlock: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  timerState: {
    fontSize: typography.size.sm,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.tomato,
    fontFamily: typography.family.semibold,
  },
  timer: {
    marginTop: spacing.sm,
    fontSize: typography.size.xxl,
    color: colors.charcoal,
    fontFamily: typography.family.semibold,
  },
  timerNote: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    color: colors.charcoalSoft,
    fontFamily: typography.family.regular,
  },
  primaryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.tomato,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.size.lg,
    color: colors.white,
    fontFamily: typography.family.semibold,
  },
  tomatoRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tomatoDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.tomato,
  },
  tomatoDotEmpty: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.tomato,
  },
  tomatoLabel: {
    fontSize: typography.size.sm,
    color: colors.charcoalSoft,
    fontFamily: typography.family.medium,
  },
});
