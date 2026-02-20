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

const GRAIN_SOURCE = require('../../assets/grain.png');
const TRANSITION_MS = 250;
const EXPO_IMAGE_TRANSITION_MS = 250;

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
  const [incomingReady, setIncomingReady] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const preloadAssets = async () => {
      try {
        const { Asset } = require('expo-asset') as {
          Asset: {
            loadAsync: (sources: ImageSourcePropType[]) => Promise<unknown>;
          };
        };

        await Asset.loadAsync([BACKGROUND_SOURCES.idle, BACKGROUND_SOURCES.focus, BACKGROUND_SOURCES.break, GRAIN_SOURCE]);
      } catch {
        // Ignore preload failures; background fallback still works.
      }
    };

    void preloadAssets();
  }, []);

  useEffect(() => {
    const next = resolveVariant(variant);
    if (isPaused || mode === 'paused' || next === currentVariant || next === incomingVariant) {
      return;
    }

    fade.stopAnimation();
    fade.setValue(0);
    setIncomingReady(false);
    setIncomingVariant(next);
  }, [currentVariant, fade, incomingVariant, isPaused, mode, variant]);

  useEffect(() => {
    if (!incomingVariant || !incomingReady) {
      return;
    }

    Animated.timing(fade, {
      toValue: 1,
      duration: TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        return;
      }

      setCurrentVariant(incomingVariant);
      setIncomingVariant(null);
      setIncomingReady(false);
      fade.setValue(0);
    });
  }, [fade, incomingReady, incomingVariant]);

  return (
    <View pointerEvents="none" style={styles.container}>
      {ExpoImageComponent ? (
        <ExpoImageComponent
          source={BACKGROUND_SOURCES[currentVariant]}
          style={styles.image}
          contentFit="cover"
          contentPosition="center"
          transition={EXPO_IMAGE_TRANSITION_MS}
        />
      ) : (
        <Animated.Image
          source={BACKGROUND_SOURCES[currentVariant]}
          style={styles.image}
          resizeMode="cover"
          fadeDuration={Platform.OS === 'android' ? 0 : undefined}
        />
      )}

      {incomingVariant ? (
        ExpoImageComponent ? (
          <Animated.View style={[styles.image, { opacity: fade }]}>
            <ExpoImageComponent
              source={BACKGROUND_SOURCES[incomingVariant]}
              style={styles.image}
              contentFit="cover"
              contentPosition="center"
              transition={EXPO_IMAGE_TRANSITION_MS}
              onLoad={() => setIncomingReady(true)}
            />
          </Animated.View>
        ) : (
          <Animated.Image
            source={BACKGROUND_SOURCES[incomingVariant]}
            style={[styles.image, { opacity: fade }]}
            resizeMode="cover"
            fadeDuration={Platform.OS === 'android' ? 0 : undefined}
            onLoad={() => setIncomingReady(true)}
          />
        )
      ) : null}

      {ExpoImageComponent ? (
        <ExpoImageComponent
          source={GRAIN_SOURCE}
          style={styles.grain}
          contentFit="cover"
          contentPosition="center"
          transition={EXPO_IMAGE_TRANSITION_MS}
        />
      ) : (
        <Animated.Image
          source={GRAIN_SOURCE}
          style={styles.grain}
          resizeMode="cover"
          fadeDuration={Platform.OS === 'android' ? 0 : undefined}
        />
      )}
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
  grain: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
});
