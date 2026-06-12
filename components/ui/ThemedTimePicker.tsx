import { useEffect, useRef, type RefObject } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import { applyTimeToDate, compareTimeOnly } from '@/lib/time/compareTime';
import { formatTime } from '@/lib/time/formatTime';

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;

interface ThemedTimePickerProps {
  value: Date;
  minTime?: Date;
  /** true when parent sheet/modal is open — initial scroll runs only on open */
  active?: boolean;
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

function scrollToIndex(ref: RefObject<ScrollView | null>, index: number) {
  const offset = Math.max(0, index * ITEM_HEIGHT - ITEM_HEIGHT * Math.floor(VISIBLE_ROWS / 2));
  ref.current?.scrollTo({ y: offset, animated: false });
}

export function ThemedTimePicker({ value, minTime, active = true, onChange }: ThemedTimePickerProps) {
  const hourRef = useRef<ScrollView>(null);
  const minuteRef = useRef<ScrollView>(null);
  const hour = value.getHours();
  const minute = value.getMinutes();

  useEffect(() => {
    if (!active) return;
    const frame = requestAnimationFrame(() => {
      scrollToIndex(hourRef, value.getHours());
      scrollToIndex(minuteRef, value.getMinutes());
    });
    return () => cancelAnimationFrame(frame);
    // Scroll only when the sheet opens — not when hour/minute change from taps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

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
        <View style={styles.labelRow}>
          <Text style={styles.columnLabel}>시</Text>
          <Text style={styles.separatorLabel}>:</Text>
          <Text style={styles.columnLabel}>분</Text>
        </View>

        <View style={styles.columns}>
          <View style={styles.column}>
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
                    <Text
                      style={[
                        styles.itemText,
                        selected && styles.itemTextSelected,
                        disabled && styles.itemTextDisabled,
                      ]}
                    >
                      {pad(item)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.column}>
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
                    <Text
                      style={[
                        styles.itemText,
                        selected && styles.itemTextSelected,
                        disabled && styles.itemTextDisabled,
                      ]}
                    >
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  columnLabel: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  separatorLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    width: 16,
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  scroll: {
    height: ITEM_HEIGHT * VISIBLE_ROWS,
    width: '100%',
  },
  scrollContent: {
    paddingVertical: ITEM_HEIGHT * 2,
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
