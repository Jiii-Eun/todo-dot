import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { colors, radius, spacing } from '@/constants/theme';

interface CalendarSheetProps {
  visible: boolean;
  selectedDate: Date;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
}

export function CalendarSheet({
  visible,
  selectedDate,
  onClose,
  onSelectDate,
}: CalendarSheetProps) {
  const { height } = useWindowDimensions();

  const handleSelect = (date: Date) => {
    onSelectDate(date);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { maxHeight: height * 0.55 }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />
          <CalendarGrid
            selectedDate={selectedDate}
            onSelectDate={handleSelect}
            maxHeightRatio={0.35}
          />
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
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
});
