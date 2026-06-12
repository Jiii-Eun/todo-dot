import { useLayoutEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { AnimatedModal } from '@/components/ui/AnimatedModal';
import { Button } from '@/components/ui/Button';
import { ThemedTimePicker } from '@/components/ui/ThemedTimePicker';
import { colors, radius, spacing } from '@/constants/theme';
import { isTimeAfter } from '@/lib/time/compareTime';

interface TimePickerSheetProps {
  visible: boolean;
  value: Date;
  title: string;
  minTime?: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}

export function TimePickerSheet({
  visible,
  value,
  title,
  minTime,
  onClose,
  onConfirm,
}: TimePickerSheetProps) {
  const { width } = useWindowDimensions();
  const sheetWidth = Math.min(width - spacing.lg * 2, 480);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');

  useLayoutEffect(() => {
    if (visible) {
      setDraft(value);
      setError('');
    }
  }, [visible, value]);

  const handleConfirm = () => {
    if (minTime && !isTimeAfter(draft, minTime)) {
      setError('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }
    onConfirm(draft);
    onClose();
  };

  return (
    <AnimatedModal visible={visible} onRequestClose={onClose} variant="sheet">
      <Pressable
        style={[styles.sheet, { width: sheetWidth, alignSelf: 'center' }]}
        onPress={(event) => event.stopPropagation()}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>

        {visible ? (
          <ThemedTimePicker active value={draft} minTime={minTime} onChange={setDraft} />
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <Button label="취소" variant="secondary" onPress={onClose} style={styles.action} />
          <Button label="확인" onPress={handleConfirm} style={styles.action} />
        </View>
      </Pressable>
    </AnimatedModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    marginBottom: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  error: {
    marginTop: spacing.sm,
    color: colors.danger,
    textAlign: 'center',
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
