import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

export default function Categories() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categorías</Text>
      <Text style={styles.subtitle}>Gestión de categorías (placeholder)</Text>
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
