import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Categories, HomeTimer, Settings, Stats, Tasks } from './src/screens';
import { colors, typography } from './src/theme/tokens';

type RootStackParamList = {
  HomeTimer: undefined;
  Tasks: undefined;
  Categories: undefined;
  Stats: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    Satoshi: require('./assets/fonts/Satoshi-Variable.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="HomeTimer"
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: {
            fontFamily: typography.family.primary,
            fontWeight: typography.weight.bold,
            color: colors.textDark,
          },
          headerTintColor: colors.textDark,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="HomeTimer"
          component={HomeTimer}
          options={{ title: 'Del Tomate', headerShown: false }}
        />
        <Stack.Screen name="Tasks" component={Tasks} options={{ title: 'Tareas' }} />
        <Stack.Screen
          name="Categories"
          component={Categories}
          options={{ title: 'Categorías' }}
        />
        <Stack.Screen name="Stats" component={Stats} options={{ title: 'Stats' }} />
        <Stack.Screen name="Settings" component={Settings} options={{ title: 'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
