import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/constants/theme';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  sublabel?: string;
}

export function ProgressBar({ percentage, label, sublabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <View style={styles.container}>
      {(label || sublabel) && (
        <View style={styles.header}>
          {label ? <Text style={styles.label}>{label}</Text> : null}
          <View style={styles.right}>
            <Text style={styles.percentage}>{clamped}%</Text>
            {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
          </View>
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  right: {
    alignItems: 'flex-end',
  },
  percentage: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  sublabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  track: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
});
