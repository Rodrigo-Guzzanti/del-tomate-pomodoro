import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

export default function Stats() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stats</Text>
      <Text style={styles.subtitle}>Hoy / Semana / Mes (placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.cream,
  },
  title: {
    fontSize: typography.size.xl,
    color: colors.charcoal,
    fontFamily: typography.family.semibold,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: typography.size.md,
    color: colors.charcoalSoft,
    fontFamily: typography.family.regular,
  },
});
