import { useLayoutEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
      <View style={styles.sheet}>
        <Pressable style={styles.body} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>

          {visible ? (
            <ThemedTimePicker active value={draft} minTime={minTime} onChange={setDraft} />
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
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
