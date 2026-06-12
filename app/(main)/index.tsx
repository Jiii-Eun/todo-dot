import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { addDays, subDays } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityBarChart } from '@/components/charts/ActivityBarChart';
import { CalendarSheet } from '@/components/calendar/CalendarSheet';
import { TodoCard } from '@/components/todo/TodoCard';
import { TodoFormModal } from '@/components/todo/TodoFormModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Logo } from '@/components/ui/Logo';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors, spacing } from '@/constants/theme';
import { useTodoContext } from '@/contexts/TodoProvider';
import { useUserContext } from '@/contexts/UserProvider';
import { buildActivityDistribution } from '@/lib/time/activityDistribution';
import { formatDateDisplay } from '@/lib/time/formatTime';
import { calculateAchievementRate } from '@/lib/time/sortTodos';
import type { Todo } from '@/types/todo';
import type { TodoFormValues } from '@/types/todo';

export default function MainScreen() {
  const router = useRouter();
  const { user, isLoading, displayName, deleteAccount, logout } = useUserContext();
  const {
    getTodosForDate,
    createTodo,
    updateTodo,
    toggleComplete,
    deleteTodo,
    isLoading: todosLoading,
  } = useTodoContext();

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);

  const todos = useMemo(() => getTodosForDate(selectedDate), [getTodosForDate, selectedDate]);
  const achievement = useMemo(() => calculateAchievementRate(todos), [todos]);
  const activityBuckets = useMemo(() => buildActivityDistribution(todos), [todos]);

  if (isLoading || todosLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/" />;
  }

  const openCreateForm = () => {
    setEditingTodo(null);
    setFormVisible(true);
  };

  const handleSave = async (values: TodoFormValues) => {
    if (editingTodo) {
      await updateTodo(editingTodo.id, values);
    } else {
      await createTodo(values);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const isSeries = Boolean(deleteTarget.seriesId);
    await deleteTodo(deleteTarget.id, isSeries);
    setDeleteTarget(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Logo size="sm" />
        <Text style={styles.userName}>{displayName}</Text>
      </View>

      <Pressable style={styles.dateNav} onPress={() => setCalendarVisible(true)}>
        <Pressable onPress={() => setSelectedDate((d) => subDays(d, 1))}>
          <Text style={styles.navArrow}>{'<'}</Text>
        </Pressable>
        <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
        <Pressable onPress={() => setSelectedDate((d) => addDays(d, 1))}>
          <Text style={styles.navArrow}>{'>'}</Text>
        </Pressable>
      </Pressable>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.summary}>
            <ProgressBar
              label="오늘 달성률"
              percentage={achievement.percentage}
              sublabel={`${achievement.completed}/${achievement.total} 완료`}
            />
            <View style={styles.chartWrap}>
              <ActivityBarChart buckets={activityBuckets} />
            </View>
            <Pressable style={styles.fab} onPress={openCreateForm}>
              <Text style={styles.fabText}>+ 할 일 추가</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <TodoCard
            todo={item}
            onToggle={toggleComplete}
            onEdit={(todo) => {
              setEditingTodo(todo);
              setFormVisible(true);
            }}
            onDelete={setDeleteTarget}
            onPress={(todo) => router.push(`/focus/${todo.id}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>등록된 할 일이 없습니다.</Text>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable
              onPress={() => {
                void logout();
              }}
            >
              <Text style={styles.footerLink}>계정 전환</Text>
            </Pressable>
            <Pressable onPress={() => setDeleteAccountVisible(true)}>
              <Text style={styles.deleteAccount}>계정 삭제</Text>
            </Pressable>
          </View>
        }
      />

      <CalendarSheet
        visible={calendarVisible}
        selectedDate={selectedDate}
        onClose={() => setCalendarVisible(false)}
        onSelectDate={setSelectedDate}
      />

      <TodoFormModal
        visible={formVisible}
        selectedDate={selectedDate}
        editingTodo={editingTodo}
        onClose={() => {
          setFormVisible(false);
          setEditingTodo(null);
        }}
        onSave={handleSave}
      />

      <ConfirmModal
        visible={Boolean(deleteTarget)}
        title="할 일을 삭제하시겠습니까?"
        description={
          deleteTarget?.seriesId
            ? '이 일정과 모든 반복 일정을 삭제하시겠습니까?'
            : '삭제된 할 일은 복구할 수 없습니다.'
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <ConfirmModal
        visible={deleteAccountVisible}
        title="계정을 삭제하시겠습니까?"
        description="계정과 모든 할 일, 반복 규칙이 영구적으로 삭제됩니다."
        onCancel={() => setDeleteAccountVisible(false)}
        onConfirm={() => {
          void deleteAccount();
          setDeleteAccountVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  navArrow: {
    fontSize: 18,
    color: colors.primary,
    paddingHorizontal: spacing.sm,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  summary: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  chartWrap: {
    marginTop: spacing.sm,
  },
  fab: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  footerLink: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  deleteAccount: {
    color: colors.danger,
    fontSize: 13,
  },
});
