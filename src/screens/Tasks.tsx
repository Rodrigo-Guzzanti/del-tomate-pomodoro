import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

export default function Tasks() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tareas</Text>
      <Text style={styles.subtitle}>Listado por categoría (placeholder)</Text>
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
