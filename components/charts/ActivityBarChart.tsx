import { useEffect } from 'react';
import { StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  ACTIVITY_AXIS_LABELS,
  type ActivityBucket,
} from '@/lib/time/activityDistribution';
import { motion } from '@/constants/motion';
import { colors, spacing } from '@/constants/theme';

interface ActivityBarChartProps {
  buckets: ActivityBucket[];
}

const REF_CHART_WIDTH = 280;
const CHART_HEIGHT = 80;
const AXIS_HOUR_MAX = 24;
const BAR_WIDTH = REF_CHART_WIDTH / AXIS_HOUR_MAX - 1;
const BAR_WIDTH_PERCENT = (BAR_WIDTH / REF_CHART_WIDTH) * 100;

interface AnimatedChartBarProps {
  targetHeight: number;
  hour: number;
}

function AnimatedChartBar({ targetHeight, hour }: AnimatedChartBarProps) {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withTiming(targetHeight, {
      duration: motion.normal,
      easing: motion.easing,
    });
  }, [height, targetHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    backgroundColor: colors.primaryLight,
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          left: `${(hour / AXIS_HOUR_MAX) * 100}%`,
          width: `${BAR_WIDTH_PERCENT}%`,
        },
        animatedStyle,
      ]}
    />
  );
}

function getAxisLabelStyle(hour: number): TextStyle {
  if (hour === 0) return { left: '0%' };
  if (hour === AXIS_HOUR_MAX) return { right: 0 };
  return {
    left: `${(hour / AXIS_HOUR_MAX) * 100}%`,
    transform: [{ translateX: '-50%' }],
  };
}

function getGridLineStyle(hour: number): ViewStyle {
  if (hour === 0) return { left: '0%' };
  if (hour === AXIS_HOUR_MAX) return { right: 0 };
  return { left: `${(hour / AXIS_HOUR_MAX) * 100}%` };
}

function HourGridLines() {
  return (
    <>
      {ACTIVITY_AXIS_LABELS.map((hour) => (
        <View key={hour} style={[styles.gridLine, getGridLineStyle(hour)]} />
      ))}
    </>
  );
}

export function ActivityBarChart({ buckets }: ActivityBarChartProps) {
  const maxValue = Math.max(1, ...buckets.map((bucket) => bucket.value));
  const activeBuckets = buckets.filter((bucket) => bucket.value > 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>시간대별 활동 분포</Text>
      <View style={styles.plotArea}>
        <View style={styles.chart}>
          <HourGridLines />
          {activeBuckets.map((bucket) => {
            const barHeight = Math.max(
              4,
              (bucket.value / maxValue) * (CHART_HEIGHT - 10),
            );

            return (
              <AnimatedChartBar
                key={bucket.hour}
                hour={bucket.hour}
                targetHeight={barHeight}
              />
            );
          })}
        </View>
        <View style={styles.axis}>
          {ACTIVITY_AXIS_LABELS.map((hour) => (
            <Text key={hour} style={[styles.axisLabel, getAxisLabelStyle(hour)]}>
              {hour}시
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  plotArea: {
    width: '100%',
  },
  chart: {
    position: 'relative',
    height: CHART_HEIGHT,
    width: '100%',
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    height: CHART_HEIGHT,
    width: 0,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 2,
  },
  axis: {
    position: 'relative',
    height: 16,
    marginTop: spacing.xs,
    width: '100%',
  },
  axisLabel: {
    position: 'absolute',
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
