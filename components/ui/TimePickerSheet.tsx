import { useLayoutEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
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
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { width: sheetWidth }]}
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
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
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
    marginBottom: spacing.md,
  },
  error: {
    marginTop: spacing.sm,
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.md,
  },
  action: {
    flex: 1,
  },
});
