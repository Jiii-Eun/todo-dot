import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { navigateToMainScreen } from '@/lib/navigation/routes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircularCountdown } from '@/components/focus/CircularCountdown';
import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { PRIORITY_STARS } from '@/constants/priority';
import { colors, spacing } from '@/constants/theme';
import { useTodoContext } from '@/contexts/TodoProvider';
import { useCountdown } from '@/hooks/useCountdown';
import { toDateString } from '@/lib/time/formatTime';

export default function FocusScreen() {
  const { todoId, date } = useLocalSearchParams<{ todoId: string; date?: string }>();
  const { todos } = useTodoContext();

  const viewingDate = date ?? toDateString(new Date());

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    navigateToMainScreen();
  };

  const todo = useMemo(
    () => todos.find((item) => item.id === todoId) ?? null,
    [todos, todoId],
  );

  const countdown = useCountdown(todo, viewingDate);

  if (!todo) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missingWrap}>
          <Text style={styles.missing}>할 일을 찾을 수 없습니다.</Text>
          <Pressable
            onPress={handleGoBack}
            accessibilityRole="button"
            accessibilityLabel="돌아가기"
            style={styles.backButton}
          >
            <Text style={styles.backLink}>돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const caption = countdown.isWaiting
    ? '시작 전'
    : countdown.isOvertime
      ? '초과 시간'
      : '남은 시간';

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenEntrance style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} accessibilityLabel="뒤로 가기">
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
      <Text style={styles.dailyHint}>오늘 하루 기준 · 자정 이후 새로 시작</Text>

      <View style={styles.center}>
        <CircularCountdown
          display={countdown.display}
          progress={countdown.progress}
          isOvertime={countdown.isOvertime}
          overtimeText={countdown.overtimeText}
          caption={caption}
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
      </ScreenEntrance>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  screen: {
    flex: 1,
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
  dailyHint: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
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
  missingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  missing: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.textSecondary,
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  backLink: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});
