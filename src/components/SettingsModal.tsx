import { useEffect, useMemo, useState } from 'react';
import { BlurView } from 'expo-blur';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography } from '../theme/tokens';

type SettingsDraft = {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
};

type SettingsModalProps = {
  visible: boolean;
  initial: SettingsDraft;
  onCancel: () => void;
  onSave: (next: SettingsDraft) => void;
};

const LIMITS = {
  focusMin: { min: 1, max: 90 },
  shortBreakMin: { min: 1, max: 30 },
  longBreakMin: { min: 1, max: 60 },
} as const;

type DraftKey = keyof SettingsDraft;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function sanitizeDraft(draft: SettingsDraft): SettingsDraft {
  return {
    focusMin: clamp(draft.focusMin, LIMITS.focusMin.min, LIMITS.focusMin.max),
    shortBreakMin: clamp(
      draft.shortBreakMin,
      LIMITS.shortBreakMin.min,
      LIMITS.shortBreakMin.max
    ),
    longBreakMin: clamp(
      draft.longBreakMin,
      LIMITS.longBreakMin.min,
      LIMITS.longBreakMin.max
    ),
  };
}

function SettingRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (nextValue: number) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.control}>
        <View pointerEvents="none" style={styles.controlHighlight} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          disabled={value <= min}
          hitSlop={10}
          onPress={() => onChange(value - 1)}
          style={({ pressed }) => [
            styles.controlButton,
            value <= min && styles.controlButtonDisabled,
            pressed && value > min && styles.controlButtonPressed,
          ]}
        >
          <Text style={styles.controlGlyph}>-</Text>
        </Pressable>

        <Text
          accessibilityRole="text"
          accessibilityLabel={`${label} value ${value} minutes`}
          style={styles.controlValue}
        >
          {value}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          disabled={value >= max}
          hitSlop={10}
          onPress={() => onChange(value + 1)}
          style={({ pressed }) => [
            styles.controlButton,
            value >= max && styles.controlButtonDisabled,
            pressed && value < max && styles.controlButtonPressed,
          ]}
        >
          <Text style={styles.controlGlyph}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function SettingsModal({
  visible,
  initial,
  onCancel,
  onSave,
}: SettingsModalProps) {
  const normalizedInitial = useMemo(
    () => sanitizeDraft(initial),
    [initial.focusMin, initial.shortBreakMin, initial.longBreakMin]
  );
  const [draft, setDraft] = useState<SettingsDraft>(normalizedInitial);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setDraft(normalizedInitial);
  }, [normalizedInitial, visible]);

  const updateValue = (key: DraftKey, value: number) => {
    const { min, max } = LIMITS[key];
    setDraft((prev) => ({
      ...prev,
      [key]: clamp(value, min, max),
    }));
  };

  const handleSave = () => {
    onSave(sanitizeDraft(draft));
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Close settings"
        />

        <View style={styles.card}>
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.cardOverlay} />

          <SettingRow
            label="Focus"
            value={draft.focusMin}
            min={LIMITS.focusMin.min}
            max={LIMITS.focusMin.max}
            onChange={(next) => updateValue('focusMin', next)}
          />
          <SettingRow
            label="Short break"
            value={draft.shortBreakMin}
            min={LIMITS.shortBreakMin.min}
            max={LIMITS.shortBreakMin.max}
            onChange={(next) => updateValue('shortBreakMin', next)}
          />
          <SettingRow
            label="Long break"
            value={draft.longBreakMin}
            min={LIMITS.longBreakMin.min}
            max={LIMITS.longBreakMin.max}
            onChange={(next) => updateValue('longBreakMin', next)}
          />

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel settings changes"
              onPress={onCancel}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save settings"
              onPress={handleSave}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
            >
              <Text style={styles.okText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.56)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    backgroundColor: '#081e25',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 30, 37, 0.68)',
  },
  row: {
    gap: spacing.sm,
  },
  rowLabel: {
    fontSize: typography.size.md,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.86)',
    fontFamily: typography.family.medium,
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 8,
    paddingVertical: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(8, 30, 37, 0.36)',
  },

controlButton: {
  width: 38,
  height: 38,
  borderRadius: 999,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.08)',
},
  
  controlButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  controlButtonDisabled: {
    opacity: 0.35,
  },
  controlGlyph: {
    fontSize: 30,
    lineHeight: 34,
    color: 'rgba(255,255,255,0.92)',
    fontFamily: typography.family.medium,
  },
  controlValue: {
    minWidth: 64,
    textAlign: 'center',
    fontSize: 34,
    lineHeight: 42,
    color: 'rgba(255,255,255,0.94)',
    fontFamily: typography.family.bold,
  },
  actions: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionButton: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  actionPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  controlHighlight: {
    position: 'absolute',
    width: '64%',
    height: '165%',
    top: '-70%',
    left: '-6%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    opacity: 0.25,
    transform: [{ rotate: '-25deg' }],
  },
  cancelText: {
    fontSize: typography.size.md,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.72)',
    fontFamily: typography.family.medium,
  },
  okText: {
    fontSize: typography.size.md,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.98)',
    fontFamily: typography.family.bold,
  },
});
