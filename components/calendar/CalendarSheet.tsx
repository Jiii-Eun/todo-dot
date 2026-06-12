import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { AnimatedModal } from '@/components/ui/AnimatedModal';
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
    <AnimatedModal visible={visible} onRequestClose={onClose} variant="sheet">
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
    </AnimatedModal>
  );
}

const styles = StyleSheet.create({
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
