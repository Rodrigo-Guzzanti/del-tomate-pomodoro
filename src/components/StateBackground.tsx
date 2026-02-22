import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import type { PomodoroMode } from '../hooks/usePomodoro';

export type BackgroundVariant = 'idle' | 'focus' | 'break';

type StateBackgroundProps = {
  mode: PomodoroMode;
  isPaused: boolean;
  variant: BackgroundVariant;
};

const ENABLE_BG_TRANSITIONS = true;

// Ambient / “macOS planet” vibe
const TRANSITION_MS = 2500;
const MORPH_SCALE_FROM = 1.60;
const MORPH_SCALE_TO = 1.0;
const MORPH_DRIFT_Y_FROM = 10;
const MORPH_DRIFT_Y_TO = 0;

const BACKGROUND_SOURCES: Record<BackgroundVariant, ImageSourcePropType> = {
  idle: require('../../assets/backgrounds/idle.png'),
  focus: require('../../assets/backgrounds/focus.png'),
  break: require('../../assets/backgrounds/break.png'),
};

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

function BGImage({ source, style }: { source: ImageSourcePropType; style: any }) {
  if (ExpoImageComponent) {
    return (
      <ExpoImageComponent
        source={source}
        style={style}
        contentFit="contain"
        contentPosition="center"
        transition={0}
      />
    );
  }

  return (
    <Animated.Image
      source={source}
      style={style}
      resizeMode="contain"
      fadeDuration={Platform.OS === 'android' ? 0 : undefined}
    />
  );
}

export default function StateBackground({ variant }: StateBackgroundProps) {
  const v = useMemo(() => resolveVariant(variant), [variant]);

  // Two persistent layers (A/B) — no unmount/mount => no blink.
  const [srcA, setSrcA] = useState<BackgroundVariant>(v);
  const [srcB, setSrcB] = useState<BackgroundVariant>(v);

  const activeIsARef = useRef(true);

  const opacityA = useRef(new Animated.Value(1)).current;
  const opacityB = useRef(new Animated.Value(0)).current;

  const scaleA = useRef(new Animated.Value(1)).current;
  const scaleB = useRef(new Animated.Value(1)).current;

  const driftYA = useRef(new Animated.Value(0)).current;
  const driftYB = useRef(new Animated.Value(0)).current;

  const transitionId = useRef(0);

  // Initial sync
  useEffect(() => {
    setSrcA(v);
    setSrcB(v);

    activeIsARef.current = true;

    opacityA.setValue(1);
    opacityB.setValue(0);

    scaleA.setValue(1);
    scaleB.setValue(1);

    driftYA.setValue(0);
    driftYB.setValue(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ENABLE_BG_TRANSITIONS) {
      setSrcA(v);
      activeIsARef.current = true;

      opacityA.stopAnimation();
      opacityB.stopAnimation();
      opacityA.setValue(1);
      opacityB.setValue(0);

      scaleA.stopAnimation();
      scaleB.stopAnimation();
      scaleA.setValue(1);
      scaleB.setValue(1);

      driftYA.stopAnimation();
      driftYB.stopAnimation();
      driftYA.setValue(0);
      driftYB.setValue(0);
      return;
    }

    const activeIsA = activeIsARef.current;
    const activeVariant = activeIsA ? srcA : srcB;
    if (activeVariant === v) return;

    transitionId.current += 1;
    const myId = transitionId.current;

    const inOp = activeIsA ? opacityB : opacityA;
    const outOp = activeIsA ? opacityA : opacityB;

    const inScale = activeIsA ? scaleB : scaleA;
    const outScale = activeIsA ? scaleA : scaleB;

    const inDriftY = activeIsA ? driftYB : driftYA;
    const outDriftY = activeIsA ? driftYA : driftYB;

    // Load new image into the inactive layer
    if (activeIsA) {
      setSrcB(v);
    } else {
      setSrcA(v);
    }

    // Reset before anim
    inOp.stopAnimation();
    outOp.stopAnimation();
    inScale.stopAnimation();
    outScale.stopAnimation();
    inDriftY.stopAnimation();
    outDriftY.stopAnimation();

    inOp.setValue(0);
    outOp.setValue(1);

    // Morph only on the incoming layer
    inScale.setValue(MORPH_SCALE_FROM);
    outScale.setValue(1);

    inDriftY.setValue(MORPH_DRIFT_Y_FROM);
    outDriftY.setValue(0);

    Animated.parallel([
      Animated.timing(inOp, {
        toValue: 1,
        duration: TRANSITION_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(outOp, {
        toValue: 0,
        duration: TRANSITION_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(inScale, {
        toValue: MORPH_SCALE_TO,
        duration: TRANSITION_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(inDriftY, {
        toValue: MORPH_DRIFT_Y_TO,
        duration: TRANSITION_MS,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
      if (myId !== transitionId.current) return;

      // Swap active layer
      activeIsARef.current = !activeIsARef.current;

      // Normalize end state (avoid drift/scale accumulation)
      if (activeIsARef.current) {
        opacityA.setValue(1);
        opacityB.setValue(0);
      } else {
        opacityA.setValue(0);
        opacityB.setValue(1);
      }

      scaleA.setValue(1);
      scaleB.setValue(1);

      driftYA.setValue(0);
      driftYB.setValue(0);
    });
  }, [v, srcA, srcB, opacityA, opacityB, scaleA, scaleB, driftYA, driftYB]);

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.View
        style={[
          styles.image,
          {
            opacity: opacityA,
            transform: [{ scale: scaleA }, { translateY: driftYA }],
          },
        ]}
      >
        <BGImage source={BACKGROUND_SOURCES[srcA]} style={styles.image} />
      </Animated.View>

      <Animated.View
        style={[
          styles.image,
          {
            opacity: opacityB,
            transform: [{ scale: scaleB }, { translateY: driftYB }],
          },
        ]}
      >
        <BGImage source={BACKGROUND_SOURCES[srcB]} style={styles.image} />
      </Animated.View>
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