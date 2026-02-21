import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import StateBackground, { type BackgroundVariant } from '../components/StateBackground';
import { usePomodoro, type PomodoroMode } from '../hooks/usePomodoro';
import { typography } from '../theme/tokens';

export default function HomeTimer() {
  const { mode, isRunning, remainingSeconds, start, pause, resume, reset } = usePomodoro();

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

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <StateBackground mode={mode} isPaused={mode === 'paused'} variant={variant} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" style={styles.settingsButton}>
            <Text style={styles.settingsGlyph}>⚙</Text>
          </Pressable>
        </View>

        <View style={styles.centerArea}>
          
          <View style={styles.timerPillShell}>
            <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />

            <View style={styles.timerPillOverlay} />
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
          {!isRunning ? (
            <Pressable
              onPress={onStartPress}
              accessibilityRole="button"
              style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}
            >
              <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.startButtonOverlay} />
              <Text style={styles.startButtonText}>Start</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={pause}
              accessibilityRole="button"
              style={({ pressed }) => [styles.pauseLinkTouch, pressed && styles.pauseLinkPressed]}
            >
              <Text style={styles.pauseLinkText}>Pause</Text>
              <View style={styles.pauseUnderline} />
            </Pressable>
          )}
        </View>
      </SafeAreaView>
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
    opacity: 0.88,
  },
  startButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,30,37,0.20)',
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
