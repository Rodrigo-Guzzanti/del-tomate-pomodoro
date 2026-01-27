import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
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
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="HomeTimer"
        screenOptions={{
          headerStyle: { backgroundColor: colors.cream },
          headerTitleStyle: {
            fontFamily: typography.family.semibold,
            color: colors.charcoal,
          },
          headerTintColor: colors.charcoal,
          contentStyle: { backgroundColor: colors.cream },
        }}
      >
        <Stack.Screen
          name="HomeTimer"
          component={HomeTimer}
          options={{ title: 'Del Tomate' }}
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
