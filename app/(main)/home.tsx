import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { navigateToWelcomeScreen } from '@/lib/navigation/routes';
import { addDays, isSameDay, startOfDay, subDays } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityBarChart } from '@/components/charts/ActivityBarChart';
import { CalendarSheet } from '@/components/calendar/CalendarSheet';
import { TodoCard } from '@/components/todo/TodoCard';
import { TodoFormModal } from '@/components/todo/TodoFormModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Logo } from '@/components/ui/Logo';
import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Toast } from '@/components/ui/Toast';
import { colors, radius, spacing } from '@/constants/theme';
import { useTodoContext } from '@/contexts/TodoProvider';
import { useUserContext } from '@/contexts/UserProvider';
import { useToast } from '@/hooks/useToast';
import { buildTodoActivityBars } from '@/lib/time/activityDistribution';
import { formatDateDisplay, toDateString } from '@/lib/time/formatTime';
import { calculateAchievementRate } from '@/lib/time/sortTodos';
import type { Todo } from '@/types/todo';
import type { TodoFormValues } from '@/types/todo';

export default function MainScreen() {
  const { user, isLoading, displayName, deleteAccount, switchAccount, setEntryMode } =
    useUserContext();
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
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState('');
  const [accountActionError, setAccountActionError] = useState('');
  const { message: toastMessage, showToast } = useToast();

  const todos = useMemo(() => getTodosForDate(selectedDate), [getTodosForDate, selectedDate]);
  const achievement = useMemo(() => calculateAchievementRate(todos), [todos]);
  const activityBars = useMemo(() => buildTodoActivityBars(todos), [todos]);
  const isTodaySelected = useMemo(
    () => isSameDay(startOfDay(selectedDate), startOfDay(new Date())),
    [selectedDate],
  );

  if (isLoading || todosLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return null;
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
      showToast('할 일이 등록되었습니다.');
    }
  };

  const handleSwitchAccount = async () => {
    setAccountActionError('');
    try {
      setEntryMode('login');
      await switchAccount();
      navigateToWelcomeScreen();
    } catch {
      setAccountActionError('계정 전환에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteAccountError('');
    const result = await deleteAccount();
    setDeletingAccount(false);

    if (!result.success) {
      setDeleteAccountError(result.message);
      return;
    }

    setDeleteAccountVisible(false);
    setEntryMode('create');
    navigateToWelcomeScreen();
  };

  const openDeleteAccountModal = () => {
    setAccountActionError('');
    setDeleteAccountError('');
    setDeleteAccountVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const isSeries = Boolean(deleteTarget.seriesId);
    await deleteTodo(deleteTarget.id, isSeries);
    setDeleteTarget(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenEntrance style={styles.screen}>
      <View style={styles.header}>
        <Logo size="sm" />
        <Text style={styles.userName}>{displayName}</Text>
      </View>

      <View style={styles.dateNavWrap}>
        <View style={styles.dateNav}>
          <Pressable
            accessibilityLabel="이전 날짜"
            onPress={() => setSelectedDate((d) => subDays(d, 1))}
            style={styles.navArrowButton}
          >
            <Text style={styles.navArrow}>{'<'}</Text>
          </Pressable>
          <View style={styles.dateCenter}>
            <Pressable
              accessibilityLabel="날짜 선택"
              onPress={() => setCalendarVisible(true)}
              style={styles.dateTextButton}
            >
              <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
            </Pressable>
            {!isTodaySelected ? (
              <Pressable
                accessibilityLabel="오늘로 이동"
                onPress={() => setSelectedDate(startOfDay(new Date()))}
                style={styles.todayButton}
              >
                <Text style={styles.todayButtonText}>오늘로 이동</Text>
              </Pressable>
            ) : null}
          </View>
          <Pressable
            accessibilityLabel="다음 날짜"
            onPress={() => setSelectedDate((d) => addDays(d, 1))}
            style={styles.navArrowButton}
          >
            <Text style={styles.navArrow}>{'>'}</Text>
          </Pressable>
        </View>
      </View>

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
              <ActivityBarChart bars={activityBars} />
            </View>
            <Pressable style={styles.fab} onPress={openCreateForm}>
              <Text style={styles.fabText}>+ 할 일 추가</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item, index }) => (
          <TodoCard
            todo={item}
            index={index}
            onToggle={toggleComplete}
            onEdit={(todo) => {
              setEditingTodo(todo);
              setFormVisible(true);
            }}
            onDelete={setDeleteTarget}
            onPress={(todo) =>
              router.push(`/focus/${todo.id}?date=${toDateString(selectedDate)}`)
            }
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>등록된 할 일이 없습니다.</Text>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {accountActionError ? (
              <Text style={styles.accountError}>{accountActionError}</Text>
            ) : null}
            <View style={styles.footerActions}>
              <Pressable onPress={() => void handleSwitchAccount()}>
                <Text style={styles.footerLink}>계정 전환</Text>
              </Pressable>
              <Pressable onPress={openDeleteAccountModal}>
                <Text style={styles.deleteAccount}>계정 삭제</Text>
              </Pressable>
            </View>
          </View>
        }
      />
      </ScreenEntrance>

      <Toast message={toastMessage} />

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
        title="진짜 삭제하시겠습니까?"
        description={
          deleteAccountError ||
          '다시 복구할 수 없습니다. 계정과 모든 할 일, 반복 규칙이 영구적으로 삭제됩니다.'
        }
        confirmText={deletingAccount ? '삭제 중…' : '삭제'}
        confirmDisabled={deletingAccount}
        onCancel={() => {
          if (deletingAccount) return;
          setDeleteAccountVisible(false);
        }}
        onConfirm={() => void handleDeleteAccount()}
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
  screen: {
    flex: 1,
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
  dateNavWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  dateCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  todayButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  navArrowButton: {
    paddingHorizontal: spacing.sm,
  },
  navArrow: {
    fontSize: 18,
    color: colors.primary,
  },
  dateTextButton: {
    paddingVertical: spacing.xs,
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
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountError: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
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
