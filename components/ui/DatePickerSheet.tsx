import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { AnimatedModal, SHEET_HEIGHT_RATIO } from '@/components/ui/AnimatedModal';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing } from '@/constants/theme';
import { toDateString } from '@/lib/time/formatTime';

interface DatePickerSheetProps {
  visible: boolean;
  value: Date | null;
  title?: string;
  minDate?: Date;
  fallbackDate?: Date;
  optional?: boolean;
  onClose: () => void;
  onConfirm: (date: Date | null) => void;
}

export function DatePickerSheet({
  visible,
  value,
  title = '날짜 선택',
  minDate,
  fallbackDate,
  optional = false,
  onClose,
  onConfirm,
}: DatePickerSheetProps) {
  const { height } = useWindowDimensions();
  const [draft, setDraft] = useState<Date>(value ?? fallbackDate ?? new Date());
  const [hasSelection, setHasSelection] = useState(value != null);

  useEffect(() => {
    if (!visible) return;
    setDraft(value ?? fallbackDate ?? new Date());
    setHasSelection(value != null);
  }, [visible, value, fallbackDate]);

  const handleDayPress = (date: Date) => {
    if (optional && hasSelection && draft.getTime() === date.getTime()) {
      setHasSelection(false);
      return;
    }

    setDraft(date);
    setHasSelection(true);
  };

  const handleConfirm = () => {
    onConfirm(hasSelection ? draft : null);
    onClose();
  };

  return (
    <AnimatedModal visible={visible} onRequestClose={onClose} variant="sheet">
      <View style={[styles.sheet, { height: height * SHEET_HEIGHT_RATIO }]}>
        <Pressable style={styles.body} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.selected, !hasSelection && styles.selectedEmpty]}>
            {hasSelection ? toDateString(draft) : '설정 안 함 (계속 반복)'}
          </Text>

          <ScrollView
            style={styles.calendarScroll}
            contentContainerStyle={styles.calendarScrollContent}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <CalendarGrid
              selectedDate={hasSelection ? draft : fallbackDate ?? draft}
              onSelectDate={handleDayPress}
              minSelectableDate={minDate}
            />
          </ScrollView>
        </Pressable>

        <View style={styles.footer}>
          <Button label="취소" variant="secondary" compact onPress={onClose} style={styles.footerButton} />
          <Button label="확인" compact onPress={handleConfirm} style={styles.footerButton} />
        </View>
      </View>
    </AnimatedModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    width: '100%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  selected: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  selectedEmpty: {
    color: colors.textMuted,
  },
  calendarScroll: {
    flex: 1,
  },
  calendarScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  footer: {
    flexShrink: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: {
    flex: 1,
  },
});
