import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';
import type { Task } from '../types/task';

type TaskPickerModalProps = {
  visible: boolean;
  isReady: boolean;
  tasks: Task[];
  activeTaskId: string | null;
  onClose: () => void;
  onSelectTask: (taskId: string) => void;
  onCreateTask: (title: string) => Promise<void>;
};

export default function TaskPickerModal({
  visible,
  isReady,
  tasks,
  activeTaskId,
  onClose,
  onSelectTask,
  onCreateTask,
}: TaskPickerModalProps) {
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowCreateInput(false);
      setNewTaskTitle('');
      setIsSaving(false);
    }
  }, [visible]);

  const ui = useMemo(
    () => ({
      textPrimary: isReady ? colors.textDark : colors.white,
      textSecondary: isReady ? 'rgba(8,30,37,0.78)' : 'rgba(255,255,255,0.74)',
      panelBackground: isReady ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.10)',
      panelBorder: isReady ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.20)',
      highlight: 'rgba(255,255,255,0.06)',
      rowBackground: isReady ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
      rowBorder: isReady ? 'rgba(255,255,255,0.26)' : 'rgba(255,255,255,0.16)',
      rowSelectedBorder: colors.secondaryBlue,
      inputBackground: isReady ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)',
      closeBorder: isReady ? 'rgba(8,30,37,0.24)' : 'rgba(255,255,255,0.26)',
      actionText: isReady ? colors.textDark : colors.white,
    }),
    [isReady]
  );

  const handleCreateTask = async () => {
    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await onCreateTask(trimmedTitle);
      setNewTaskTitle('');
      setShowCreateInput(false);
    } finally {
      setIsSaving(false);
    }
  };

  const renderTaskItem = ({ item }: ListRenderItemInfo<Task>) => {
    const isSelected = item.id === activeTaskId;
    return (
      <Pressable
        onPress={() => onSelectTask(item.id)}
        style={({ pressed }) => [
          styles.taskRow,
          {
            backgroundColor: ui.rowBackground,
            borderColor: isSelected ? ui.rowSelectedBorder : ui.rowBorder,
          },
          pressed && styles.taskRowPressed,
        ]}
      >
        <Text style={[styles.taskTitle, { color: ui.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text
          style={[
            styles.checkMark,
            { color: isSelected ? ui.rowSelectedBorder : ui.textSecondary },
          ]}
        >
          {isSelected ? '✓' : '○'}
        </Text>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.panel,
            { backgroundColor: ui.panelBackground, borderColor: ui.panelBorder },
          ]}
        >
          <View style={[styles.glassHighlight, { backgroundColor: ui.highlight }]} />
          <Text style={[styles.title, { color: ui.textPrimary }]}>Elegir tarea</Text>
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={renderTaskItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={[styles.emptyState, { color: ui.textSecondary }]}>
                Aun no hay tareas. Crea una para empezar.
              </Text>
            }
          />

          {showCreateInput ? (
            <View style={styles.createRow}>
              <TextInput
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                placeholder="Titulo de tarea"
                placeholderTextColor={ui.textSecondary}
                style={[
                  styles.input,
                  {
                    color: ui.textPrimary,
                    backgroundColor: ui.inputBackground,
                    borderColor: ui.rowBorder,
                  },
                ]}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateTask}
              />
              <Pressable
                onPress={() => {
                  setShowCreateInput(false);
                  setNewTaskTitle('');
                }}
                style={({ pressed }) => [styles.inlineButton, pressed && styles.inlineButtonPressed]}
              >
                <Text style={[styles.inlineButtonText, { color: ui.textSecondary }]}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  void handleCreateTask();
                }}
                style={({ pressed }) => [styles.inlineButton, pressed && styles.inlineButtonPressed]}
              >
                <Text style={[styles.inlineButtonText, { color: ui.actionText }]}>
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setShowCreateInput(true)}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <Text style={[styles.actionButtonText, { color: ui.actionText }]}>+ Nueva tarea</Text>
            </Pressable>
          )}

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              { borderColor: ui.closeBorder },
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text style={[styles.closeButtonText, { color: ui.textPrimary }]}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.58)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  panel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    overflow: 'hidden',
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 12,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  title: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    marginBottom: spacing.md,
  },
  list: {
    maxHeight: 260,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  emptyState: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.regular,
    paddingVertical: spacing.sm,
  },
  taskRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskRowPressed: {
    opacity: 0.9,
  },
  taskTitle: {
    flex: 1,
    marginRight: spacing.md,
    fontSize: typography.size.md,
    fontFamily: typography.family.medium,
  },
  checkMark: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
  },
  createRow: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.md,
    fontFamily: typography.family.regular,
  },
  inlineButton: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  inlineButtonPressed: {
    opacity: 0.8,
  },
  inlineButtonText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.medium,
  },
  actionButton: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  actionButtonPressed: {
    opacity: 0.86,
  },
  actionButtonText: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
  },
  closeButton: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: typography.size.md,
    fontFamily: typography.family.medium,
  },
});
