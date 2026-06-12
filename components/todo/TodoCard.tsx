import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PRIORITY_COLORS, PRIORITY_STARS } from '@/constants/priority';
import { colors, radius, spacing } from '@/constants/theme';
import { cardShadow } from '@/lib/styles/shadow';
import type { Todo } from '@/types/todo';

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onPress: (todo: Todo) => void;
}

export function TodoCard({ todo, onToggle, onEdit, onDelete, onPress }: TodoCardProps) {
  const borderColor = PRIORITY_COLORS[todo.priority];

  return (
    <Pressable
      onPress={() => onPress(todo)}
      style={({ pressed }) => [
        styles.card,
        cardShadow,
        { borderLeftColor: borderColor },
        pressed && styles.pressed,
      ]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.isCompleted }}
        onPress={() => onToggle(todo.id)}
        style={styles.iconButton}
      >
        <Text style={styles.checkboxIcon}>{todo.isCompleted ? '☑' : '□'}</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={[styles.title, todo.isCompleted && styles.completedTitle]} numberOfLines={1}>
          {todo.title}
        </Text>
        <Text style={styles.time}>
          {todo.startTime} ~ {todo.endTime}
        </Text>
      </View>

      <Text style={styles.star}>{PRIORITY_STARS[todo.priority]}</Text>

      <Pressable
        accessibilityLabel="할 일 수정"
        onPress={() => onEdit(todo)}
        style={styles.iconButton}
      >
        <Text style={styles.editIcon}>✏️</Text>
      </Pressable>

      <Pressable
        accessibilityLabel="할 일 삭제"
        onPress={() => onDelete(todo)}
        style={styles.iconButton}
      >
        <Text style={styles.deleteIcon}>🗑</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
  },
  pressed: {
    opacity: 0.92,
  },
  iconButton: {
    padding: spacing.xs,
  },
  checkboxIcon: {
    fontSize: 20,
    color: colors.primary,
  },
  content: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  time: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  star: {
    fontSize: 14,
    marginHorizontal: spacing.xs,
  },
  editIcon: {
    fontSize: 16,
  },
  deleteIcon: {
    fontSize: 16,
  },
});
