import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircularCountdown } from '@/components/focus/CircularCountdown';
import { PRIORITY_STARS } from '@/constants/priority';
import { colors, spacing } from '@/constants/theme';
import { useTodoContext } from '@/contexts/TodoProvider';
import { useCountdown } from '@/hooks/useCountdown';

export default function FocusScreen() {
  const router = useRouter();
  const { todoId } = useLocalSearchParams<{ todoId: string }>();
  const { todos } = useTodoContext();

  const todo = useMemo(
    () => todos.find((item) => item.id === todoId) ?? null,
    [todos, todoId],
  );

  const countdown = useCountdown(todo);

  if (!todo) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.missing}>할 일을 찾을 수 없습니다.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="뒤로 가기">
          <Text style={styles.back}>{'←'}</Text>
        </Pressable>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {todo.title}
          </Text>
          <Text style={styles.star}>{PRIORITY_STARS[todo.priority]}</Text>
        </View>
      </View>

      <Text style={styles.schedule}>
        {todo.startTime} ~ {todo.endTime}
      </Text>

      <View style={styles.center}>
        <CircularCountdown
          display={countdown.display}
          progress={countdown.progress}
          isOvertime={countdown.isOvertime}
          overtimeText={countdown.overtimeText}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.timeInfo}>
          <Text style={styles.timeLabel}>시작 시간</Text>
          <Text style={styles.timeValue}>{todo.startTime}</Text>
        </View>
        <View style={styles.timeInfo}>
          <Text style={styles.timeLabel}>종료 시간</Text>
          <Text style={styles.timeValue}>{todo.endTime}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  back: {
    fontSize: 24,
    color: colors.text,
    padding: spacing.xs,
  },
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  star: {
    fontSize: 16,
  },
  schedule: {
    marginTop: spacing.sm,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: spacing.xl,
  },
  timeInfo: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  missing: {
    textAlign: 'center',
    marginTop: spacing.xl,
    color: colors.textSecondary,
  },
  backLink: {
    textAlign: 'center',
    marginTop: spacing.md,
    color: colors.primary,
  },
});
