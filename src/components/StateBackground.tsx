import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import type { PomodoroMode } from '../hooks/usePomodoro';

export type BackgroundVariant = 'idle' | 'focus' | 'break';

type StateBackgroundProps = {
  mode: PomodoroMode;
  isPaused: boolean;
  variant: BackgroundVariant;
};

const BACKGROUND_SOURCES: Record<BackgroundVariant, ImageSourcePropType> = {
  idle: require('../../assets/backgrounds/idle.png'),
  focus: require('../../assets/backgrounds/focus.png'),
  break: require('../../assets/backgrounds/break.png'),
};

const TRANSITION_MS = 340;
const INCOMING_SCALE_START = 1.02;
const INCOMING_SCALE_END = 1;

type ExpoImageComponentType = ComponentType<Record<string, unknown>>;
let ExpoImageComponent: ExpoImageComponentType | null = null;
try {
  const loaded = require('expo-image') as { Image?: ExpoImageComponentType };
  ExpoImageComponent = loaded.Image ?? null;
} catch {
  ExpoImageComponent = null;
}

function resolveVariant(variant: BackgroundVariant): BackgroundVariant {
  return BACKGROUND_SOURCES[variant] ? variant : 'idle';
}

export default function StateBackground({ mode, isPaused, variant }: StateBackgroundProps) {
  const [currentVariant, setCurrentVariant] = useState<BackgroundVariant>(() => resolveVariant(variant));
  const [incomingVariant, setIncomingVariant] = useState<BackgroundVariant | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(INCOMING_SCALE_START)).current;
  const frameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const transitionIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    const preloadAssets = async () => {
      try {
        const { Asset } = require('expo-asset') as {
          Asset: {
            loadAsync: (sources: ImageSourcePropType[]) => Promise<unknown>;
          };
        };

        await Asset.loadAsync([BACKGROUND_SOURCES.idle, BACKGROUND_SOURCES.focus, BACKGROUND_SOURCES.break,]);
      } catch {
        // Ignore preload failures; background fallback still works.
      }
    };

    void preloadAssets();
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      transitionIdRef.current += 1;
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      fade.stopAnimation();
      scale.stopAnimation();
    };
  }, [fade, scale]);

  useEffect(() => {
    const next = resolveVariant(variant);
    if (isPaused || mode === 'paused' || next === currentVariant || next === incomingVariant) {
      return;
    }

    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    fade.stopAnimation();
    scale.stopAnimation();
    fade.setValue(0);
    scale.setValue(INCOMING_SCALE_START);
    transitionIdRef.current += 1;
    const myId = transitionIdRef.current;
    setIncomingVariant(next);
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      if (!mountedRef.current || myId !== transitionIdRef.current) {
        return;
      }

      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: TRANSITION_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: INCOMING_SCALE_END,
          duration: TRANSITION_MS,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished || !mountedRef.current || myId !== transitionIdRef.current) {
          return;
        }

        setCurrentVariant(next);
        setIncomingVariant(null);
        fade.setValue(0);
        scale.setValue(INCOMING_SCALE_START);
      });
    });
  }, [currentVariant, fade, incomingVariant, isPaused, mode, scale, variant]);

  return (
    <View pointerEvents="none" style={styles.container}>
      {ExpoImageComponent ? (
        <ExpoImageComponent
          source={BACKGROUND_SOURCES[currentVariant]}
          style={styles.image}
          contentFit="contain"
          contentPosition="center"
          transition={0}
        />
      ) : (
        <Animated.Image
          source={BACKGROUND_SOURCES[currentVariant]}
          style={styles.image}
          resizeMode="contain"
          fadeDuration={Platform.OS === 'android' ? 0 : undefined}
        />
      )}

      {incomingVariant ? (
        <Animated.View style={[styles.image, { opacity: fade, transform: [{ scale }] }]}>
          {ExpoImageComponent ? (
            <ExpoImageComponent
              source={BACKGROUND_SOURCES[incomingVariant]}
              style={styles.image}
              contentFit="contain"
              contentPosition="center"
              transition={0}
            />
          ) : (
            <Animated.Image
              source={BACKGROUND_SOURCES[incomingVariant]}
              style={styles.image}
              resizeMode="contain"
              fadeDuration={Platform.OS === 'android' ? 0 : undefined}
            />
          )}
        </Animated.View>
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
});
