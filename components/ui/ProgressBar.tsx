import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '@/constants/motion';
import { colors, radius } from '@/constants/theme';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  sublabel?: string;
}

export function ProgressBar({ percentage, label, sublabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const progress = useSharedValue(clamped);
  const [displayPercentage, setDisplayPercentage] = useState(clamped);

  useEffect(() => {
    progress.value = withTiming(clamped, {
      duration: motion.normal,
      easing: motion.easing,
    });
  }, [clamped, progress]);

  useAnimatedReaction(
    () => progress.value,
    (value) => {
      runOnJS(setDisplayPercentage)(Math.round(value));
    },
  );

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.container}>
      {(label || sublabel) && (
        <View style={styles.header}>
          {label ? <Text style={styles.label}>{label}</Text> : null}
          <View style={styles.right}>
            <Text style={styles.percentage}>{displayPercentage}%</Text>
            {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
          </View>
        </View>
      )}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
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
