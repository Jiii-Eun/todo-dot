import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { AnimatedModal, SHEET_HEIGHT_RATIO } from '@/components/ui/AnimatedModal';
import { colors, radius, spacing } from '@/constants/theme';
import { formatDateDisplay } from '@/lib/time/formatTime';

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
      <View style={[styles.sheet, { height: height * SHEET_HEIGHT_RATIO }]}>
        <Pressable style={styles.body} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>날짜 선택</Text>
          <Text style={styles.selected}>{formatDateDisplay(selectedDate)}</Text>
          <ScrollView
            style={styles.calendarScroll}
            contentContainerStyle={styles.calendarScrollContent}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <CalendarGrid selectedDate={selectedDate} onSelectDate={handleSelect} />
          </ScrollView>
        </Pressable>
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
    paddingBottom: spacing.xl,
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
  calendarScroll: {
    flex: 1,
  },
  calendarScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
});
