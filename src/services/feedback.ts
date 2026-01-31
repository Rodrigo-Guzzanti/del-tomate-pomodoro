import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

type SoundKey = 'start' | 'focusEnd' | 'breakEnd';

const soundAssets: Record<SoundKey, number> = {
  start: require('../../assets/sounds/start-sound.mp3'),
  focusEnd: require('../../assets/sounds/focus_end.mp3'),
  breakEnd: require('../../assets/sounds/break_end.mp3'),
};

const soundCache: Partial<Record<SoundKey, Audio.Sound>> = {};
const soundLoaders: Partial<Record<SoundKey, Promise<Audio.Sound>>> = {};

const loadSound = async (key: SoundKey) => {
  if (soundCache[key]) {
    return soundCache[key];
  }
  if (soundLoaders[key]) {
    return soundLoaders[key]!;
  }

  soundLoaders[key] = Audio.Sound.createAsync(soundAssets[key])
    .then(({ sound }) => {
      soundCache[key] = sound;
      delete soundLoaders[key];
      return sound;
    })
    .catch((error) => {
      delete soundLoaders[key];
      throw error;
    });

  return soundLoaders[key]!;
};

const playSound = async (key: SoundKey) => {
  try {
    const sound = await loadSound(key);
    await sound.replayAsync();
  } catch (error) {
    // Swallow errors to avoid interrupting the timer flow.
  }
};

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const playStartSound = async () => playSound('start');
export const playFocusEndSound = async () => playSound('focusEnd');
export const playBreakEndSound = async () => playSound('breakEnd');

export const hapticStart = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await delay(70);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Swallow errors to avoid interrupting the timer flow.
  }
};

export const hapticEnd = async () => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    // Swallow errors to avoid interrupting the timer flow.
  }
};
