import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing } from '@/constants/theme';
import { toDateString } from '@/lib/time/formatTime';

interface DatePickerSheetProps {
  visible: boolean;
  value: Date;
  title?: string;
  minDate?: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}

export function DatePickerSheet({
  visible,
  value,
  title = '날짜 선택',
  minDate,
  onClose,
  onConfirm,
}: DatePickerSheetProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const handleDayPress = (date: Date) => {
    setDraft(date);
  };

  const handleConfirm = () => {
    onConfirm(draft);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.selected}>{toDateString(draft)}</Text>

          <CalendarGrid
            selectedDate={draft}
            onSelectDate={handleDayPress}
            minSelectableDate={minDate}
            maxHeightRatio={0.38}
          />

          <View style={styles.actions}>
            <Button label="취소" variant="secondary" onPress={onClose} style={styles.action} />
            <Button label="확인" onPress={handleConfirm} style={styles.action} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
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
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  action: {
    flex: 1,
  },
});
