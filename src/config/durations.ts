type DurationConfig = {
  focus: number;
  shortBreak: number;
  longBreak: number;
};

export function getDefaultDurations(devDurations: boolean): DurationConfig {
  if (devDurations) {
    return {
      focus: 5,
      shortBreak: 3,
      longBreak: 5,
    };
  }

  return {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };
}
