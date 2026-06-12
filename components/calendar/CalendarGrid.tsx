import { useEffect, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import { formatMonthYear } from '@/lib/time/formatTime';

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;
const WEEKEND_INDEXES = new Set([5, 6]);
const CELL_SIZE = 40;
const GRID_WIDTH = CELL_SIZE * 7;

interface CalendarGridProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  minSelectableDate?: Date;
}

export function CalendarGrid({
  selectedDate,
  onSelectDate,
  minSelectableDate,
}: CalendarGridProps) {
  const [viewDate, setViewDate] = useState(selectedDate);

  useEffect(() => {
    setViewDate(selectedDate);
  }, [selectedDate]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const isDisabled = (day: Date) => {
    if (!minSelectableDate) return false;
    return startOfDay(day) < startOfDay(minSelectableDate);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="이전 달"
          onPress={() => setViewDate(subMonths(viewDate, 1))}
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
        >
          <Text style={styles.nav}>{'<'}</Text>
        </Pressable>
        <Text style={styles.month}>{formatMonthYear(viewDate)}</Text>
        <Pressable
          accessibilityLabel="다음 달"
          onPress={() => setViewDate(addMonths(viewDate, 1))}
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
        >
          <Text style={styles.nav}>{'>'}</Text>
        </Pressable>
      </View>

      <View style={styles.weekdays}>
        {WEEKDAYS.map((day, index) => (
          <Text
            key={day}
            style={[
              styles.weekday,
              { width: CELL_SIZE },
              WEEKEND_INDEXES.has(index) && styles.weekdayWeekend,
            ]}
          >
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day) => {
          const selected = isSameDay(day, selectedDate);
          const inMonth = isSameMonth(day, viewDate);
          const disabled = isDisabled(day);
          const today = isToday(day);

          return (
            <Pressable
              key={day.toISOString()}
              disabled={disabled}
              onPress={() => onSelectDate(day)}
              style={[
                styles.dayCell,
                {
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                },
                today && !selected && styles.dayToday,
                selected && styles.daySelected,
                disabled && styles.dayDisabled,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  !inMonth && styles.dayMuted,
                  selected && styles.dayTextSelected,
                  disabled && styles.dayTextDisabled,
                ]}
              >
                {day.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    width: GRID_WIDTH + spacing.md * 2,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  navButtonPressed: {
    backgroundColor: colors.primaryLight,
    opacity: 0.85,
  },
  nav: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  month: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  weekdays: {
    flexDirection: 'row',
    width: GRID_WIDTH,
    alignSelf: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekday: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  weekdayWeekend: {
    color: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: GRID_WIDTH,
    alignSelf: 'center',
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  dayToday: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayDisabled: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  dayMuted: {
    color: colors.textMuted,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextDisabled: {
    color: colors.textMuted,
  },
});
