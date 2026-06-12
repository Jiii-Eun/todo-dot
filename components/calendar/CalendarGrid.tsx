import { useEffect, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import { formatMonthYear } from '@/lib/time/formatTime';

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

interface CalendarGridProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  minSelectableDate?: Date;
  maxHeightRatio?: number;
}

export function CalendarGrid({
  selectedDate,
  onSelectDate,
  minSelectableDate,
  maxHeightRatio = 0.42,
}: CalendarGridProps) {
  const { width, height } = useWindowDimensions();
  const [viewDate, setViewDate] = useState(selectedDate);

  useEffect(() => {
    setViewDate(selectedDate);
  }, [selectedDate]);

  const horizontalPadding = spacing.lg * 2;
  const gridWidth = Math.min(width - horizontalPadding, 420);
  const maxGridHeight = height * maxHeightRatio;
  const cellSize = Math.min(gridWidth / 7, maxGridHeight / 8, 48);

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
    <View style={[styles.wrapper, { width: cellSize * 7 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => setViewDate(subMonths(viewDate, 1))} hitSlop={8}>
          <Text style={styles.nav}>{'<'}</Text>
        </Pressable>
        <Text style={styles.month}>{formatMonthYear(viewDate)}</Text>
        <Pressable onPress={() => setViewDate(addMonths(viewDate, 1))} hitSlop={8}>
          <Text style={styles.nav}>{'>'}</Text>
        </Pressable>
      </View>

      <View style={styles.weekdays}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={[styles.weekday, { width: cellSize }]}>
            {day}
          </Text>
        ))}
      </View>

      <View style={[styles.grid, { width: cellSize * 7 }]}>
        {days.map((day) => {
          const selected = isSameDay(day, selectedDate);
          const inMonth = isSameMonth(day, viewDate);
          const disabled = isDisabled(day);

          return (
            <Pressable
              key={day.toISOString()}
              disabled={disabled}
              onPress={() => onSelectDate(day)}
              style={[
                styles.dayCell,
                {
                  width: cellSize,
                  height: cellSize,
                },
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nav: {
    fontSize: 20,
    color: colors.primary,
    paddingHorizontal: spacing.sm,
  },
  month: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  weekday: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  dayDisabled: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 14,
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
