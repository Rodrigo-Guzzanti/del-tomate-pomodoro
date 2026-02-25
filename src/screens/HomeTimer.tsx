import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import StateBackground, { type BackgroundVariant } from '../components/StateBackground';
import SettingsModal from '../components/SettingsModal';
import { usePomodoro, type PomodoroMode } from '../hooks/usePomodoro';
import { typography } from '../theme/tokens';
import SettingsIcon from '../../assets/icons/config-icon.svg';

export default function HomeTimer() {
  const {
    mode,
    isRunning,
    remainingSeconds,
    settings,
    start,
    pause,
    resume,
    reset,
    updateSettings,
  } = usePomodoro();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsPressScale = useRef(new Animated.Value(1)).current;
  const settingsOpenProgress = useRef(new Animated.Value(0)).current;
  const toggleT = useRef(new Animated.Value(isRunning ? 1 : 0)).current;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const modeToVariant = (value: PomodoroMode): BackgroundVariant => {
    if (value === 'shortBreak' || value === 'longBreak') {
      return 'break';
    }

    if (value === 'focus') {
      return 'focus';
    }

    return 'idle';
  };

  const lastNonPausedModeRef = useRef<PomodoroMode>(mode === 'paused' ? 'focus' : mode);

  if (mode !== 'paused') {
    lastNonPausedModeRef.current = mode;
  }

  const baseMode = mode === 'paused' ? lastNonPausedModeRef.current : mode;
  const variant = modeToVariant(baseMode);
  if (__DEV__) console.log('[HomeTimer/bg]', { mode, baseMode, variant });

  const onStartPress = mode === 'paused' ? resume : start;
  const settingsRotate = settingsOpenProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '35deg'],
  });
  const startOpacity = toggleT.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const pauseOpacity = toggleT.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
  const startScale = toggleT.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.985],
  });
  const pauseScale = toggleT.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  });

  useEffect(() => {
    Animated.timing(settingsOpenProgress, {
      toValue: settingsOpen ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [settingsOpen, settingsOpenProgress]);

  useEffect(() => {
    Animated.timing(toggleT, {
      toValue: isRunning ? 1 : 0,
      duration: 2100,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isRunning, toggleT]);

  const handleSettingsPressIn = () => {
    Animated.spring(settingsPressScale, {
      toValue: 0.94,
      speed: 26,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleSettingsPressOut = () => {
    Animated.spring(settingsPressScale, {
      toValue: 1,
      speed: 26,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <StateBackground mode={mode} isPaused={mode === 'paused'} variant={variant} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open timer settings"
            onPressIn={handleSettingsPressIn}
            onPressOut={handleSettingsPressOut}
            onPress={() => setSettingsOpen(true)}
            style={styles.settingsButton}
          >
            <Animated.View
              style={{
                transform: [{ scale: settingsPressScale }, { rotate: settingsRotate }],
              }}
            >
              <Text style={styles.settingsGlyph}>
                <SettingsIcon width={20} height={20} />
              </Text>
            </Animated.View>
          </Pressable>
        </View>

        <View style={styles.centerArea}>
          
          <View style={styles.timerPillShell}>
            <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />

            <View style={styles.timerPillOverlay} />
            <View pointerEvents="none" style={styles.timerPillHighlight} />
            <Text style={styles.timerValue}>{timeLabel}</Text>
            {__DEV__ ? (
              <Pressable
                onLongPress={reset}
                delayLongPress={500}
                style={StyleSheet.absoluteFill}
                accessibilityLabel="Debug reset"
              />
            ) : null}
          </View>

          <View style={styles.activeTaskWrap}>
            <Text style={styles.activeTaskText}>#Active task</Text>
            <View style={styles.activeTaskUnderline} />
          </View>
        </View>

        <View style={styles.bottomArea}>
          <View style={styles.actionSlot}>
            <Animated.View
              pointerEvents={isRunning ? 'none' : 'auto'}
              style={[
                styles.actionLayer,
                {
                  opacity: startOpacity,
                  transform: [{ scale: startScale }],
                },
              ]}
            >
              <Pressable
                onPress={onStartPress}
                accessibilityRole="button"
                style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}
              >
                <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.startButtonOverlay} />
                <Text style={styles.startButtonText}>Start</Text>
              </Pressable>
            </Animated.View>

            <Animated.View
              pointerEvents={isRunning ? 'auto' : 'none'}
              style={[
                styles.actionLayer,
                {
                  opacity: pauseOpacity,
                  transform: [{ scale: pauseScale }],
                },
              ]}
            >
              <Pressable
                onPress={pause}
                accessibilityRole="button"
                style={({ pressed }) => [styles.pauseLinkTouch, pressed && styles.pauseLinkPressed]}
              >
                <Text style={styles.pauseLinkText}>Pause</Text>
                <View style={styles.pauseUnderline} />
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>

      <SettingsModal
        visible={settingsOpen}
        initial={{
          focusMin: settings.focusMin,
          shortBreakMin: settings.shortBreakMin,
          longBreakMin: settings.longBreakMin,
        }}
        onCancel={() => setSettingsOpen(false)}
        onSave={(next) => {
          updateSettings(next);
          setSettingsOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#081e25',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 30,
    paddingBottom: 34,
    zIndex: 1,
  },
  header: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  settingsButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsGlyph: {
    fontSize: 22,
    lineHeight: 22,
    color: 'rgba(8,30,37,0.20)',
    fontFamily: typography.family.medium,
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: -16,
  },
  timerPillShell: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 999, 
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 34,
    shadowColor: '#401414',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 10,
  },
  timerPillOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,30,37,0.20)',
  },
  timerValue: {
    fontSize: 60,
    lineHeight: 80,
    fontFamily: typography.family.bold,
    letterSpacing: -1.8,
    color: '#08222b',
  },
  activeTaskWrap: {
    alignItems: 'center',
  },
  activeTaskText: {
    fontSize: 22,
    lineHeight: 48,
    color: '#081e25',
    opacity:0.60,
    fontFamily: typography.family.regular,
    letterSpacing: 0.7,
  },
  activeTaskUnderline: {
    marginTop: 2,
    height: 2,
    width: 190,
    backgroundColor: 'rgba(211, 211, 211, 0.2)',
  },
  bottomArea: {
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 18,
  },
  actionSlot: {
    width: '100%',
    minHeight: 58,
    position: 'relative',
  },
  actionLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    minWidth: 200,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.21)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingVertical: 1,
    paddingHorizontal: 60,
  },
  
  startButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  startButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,30,37,0.20)',
  },
  timerPillHighlight: {
    position: 'absolute',
    width: '85%',
    height: '120%',
    top: '-36%',
    left: '-12%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.09)',
    opacity: 0.22,
    transform: [{ rotate: '-25deg' }],
  },
  startButtonText: {
    fontSize: 32,
    lineHeight: 56,
    fontWeight:"700",
    color: 'rgba(255, 255, 255, 0.90)',
    fontFamily: typography.family.bold,
    letterSpacing: 1.5,
  },
  pauseLinkTouch: {
    minHeight: 44,
    minWidth: 126,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseLinkPressed: {
    opacity: 0.7,
  },
  pauseLinkText: {
    fontSize: 25,
    lineHeight: 38,
    color: 'rgba(231,242,255,0.80)',
    fontFamily: typography.family.medium,
    letterSpacing: -0.3,
  },
  pauseUnderline: {
    marginTop: 4,
    width: 90,
    height: 1,
    backgroundColor: 'rgba(231,242,255,0.50)',
  },
});
