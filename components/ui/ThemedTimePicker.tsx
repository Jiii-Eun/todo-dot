import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import { applyTimeToDate, compareTimeOnly } from '@/lib/time/compareTime';
import { formatTime } from '@/lib/time/formatTime';

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const ITEM_HEIGHT = 44;

interface ThemedTimePickerProps {
  value: Date;
  minTime?: Date;
  onChange: (date: Date) => void;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function isMinuteDisabled(hour: number, minute: number, minTime?: Date): boolean {
  if (!minTime) return false;
  const candidate = applyTimeToDate(minTime, hour, minute);
  return compareTimeOnly(candidate, minTime) <= 0;
}

function isHourDisabled(hour: number, minTime?: Date): boolean {
  if (!minTime) return false;
  const lastMinuteInHour = applyTimeToDate(minTime, hour, 59);
  return compareTimeOnly(lastMinuteInHour, minTime) <= 0;
}

export function ThemedTimePicker({ value, minTime, onChange }: ThemedTimePickerProps) {
  const hourRef = useRef<ScrollView>(null);
  const minuteRef = useRef<ScrollView>(null);
  const hour = value.getHours();
  const minute = value.getMinutes();

  useEffect(() => {
    hourRef.current?.scrollTo({ y: Math.max(0, hour * ITEM_HEIGHT - ITEM_HEIGHT * 2), animated: false });
    minuteRef.current?.scrollTo({ y: Math.max(0, minute * ITEM_HEIGHT - ITEM_HEIGHT * 2), animated: false });
  }, [hour, minute, value]);

  const selectHour = (nextHour: number) => {
    if (isHourDisabled(nextHour, minTime)) return;
    let nextMinute = minute;
    while (isMinuteDisabled(nextHour, nextMinute, minTime) && nextMinute < 59) {
      nextMinute += 1;
    }
    onChange(applyTimeToDate(value, nextHour, nextMinute));
  };

  const selectMinute = (nextMinute: number) => {
    if (isMinuteDisabled(hour, nextMinute, minTime)) return;
    onChange(applyTimeToDate(value, hour, nextMinute));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.preview}>{formatTime(value)}</Text>

      <View style={styles.pickerFrame}>
        <View style={styles.selectionHighlight} pointerEvents="none" />

        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.columnLabel}>시</Text>
            <ScrollView
              ref={hourRef}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {HOURS.map((item) => {
                const selected = item === hour;
                const disabled = isHourDisabled(item, minTime);
                return (
                  <Pressable
                    key={item}
                    disabled={disabled}
                    onPress={() => selectHour(item)}
                    style={[styles.item, selected && styles.itemSelected, disabled && styles.itemDisabled]}
                  >
                    <Text style={[styles.itemText, selected && styles.itemTextSelected, disabled && styles.itemTextDisabled]}>
                      {pad(item)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <Text style={styles.separator}>:</Text>

          <View style={styles.column}>
            <Text style={styles.columnLabel}>분</Text>
            <ScrollView
              ref={minuteRef}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {MINUTES.map((item) => {
                const selected = item === minute;
                const disabled = isMinuteDisabled(hour, item, minTime);
                return (
                  <Pressable
                    key={item}
                    disabled={disabled}
                    onPress={() => selectMinute(item)}
                    style={[styles.item, selected && styles.itemSelected, disabled && styles.itemDisabled]}
                  >
                    <Text style={[styles.itemText, selected && styles.itemTextSelected, disabled && styles.itemTextDisabled]}>
                      {pad(item)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  preview: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontVariant: ['tabular-nums'],
  },
  pickerFrame: {
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: '#FAF5FF',
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },
  selectionHighlight: {
    position: 'absolute',
    top: '50%',
    left: spacing.md,
    right: spacing.md,
    marginTop: 6,
    height: ITEM_HEIGHT,
    backgroundColor: colors.primary,
    opacity: 0.12,
    borderRadius: radius.md,
    zIndex: 0,
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  scroll: {
    height: ITEM_HEIGHT * 5,
    width: '100%',
  },
  scrollContent: {
    paddingVertical: ITEM_HEIGHT * 2,
  },
  separator: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginHorizontal: spacing.sm,
    marginTop: 18,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  itemSelected: {
    backgroundColor: colors.primary,
  },
  itemDisabled: {
    opacity: 0.3,
  },
  itemText: {
    fontSize: 18,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  itemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  itemTextDisabled: {
    color: colors.textMuted,
  },
});
