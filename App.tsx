import { Text, View, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍅 Del Tomate</Text>
      <Text style={styles.subtitle}>Pomodoro</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2EE',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    opacity: 0.6,
  },
});
