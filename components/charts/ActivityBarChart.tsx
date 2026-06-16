import { useEffect } from 'react';
import { StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  ACTIVITY_AXIS_LABELS,
  type TodoActivityBar,
} from '@/lib/time/activityDistribution';
import { motion } from '@/constants/motion';
import { colors, spacing } from '@/constants/theme';

interface ActivityBarChartProps {
  bars: TodoActivityBar[];
}

const CHART_HEIGHT = 80;
const AXIS_HOUR_MAX = 24;
const MINUTES_PER_DAY = AXIS_HOUR_MAX * 60;
const USABLE_HEIGHT = CHART_HEIGHT - 10;
const LANE_GAP = 2;
const MIN_BAR_WIDTH_PERCENT = 0.8;

interface AnimatedChartBarProps {
  bar: TodoActivityBar;
  barHeight: number;
}

function AnimatedChartBar({ bar, barHeight }: AnimatedChartBarProps) {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withTiming(barHeight, {
      duration: motion.normal,
      easing: motion.easing,
    });
  }, [barHeight, height]);

  const durationMinutes = bar.endMinutes - bar.startMinutes;
  const leftPercent = (bar.startMinutes / MINUTES_PER_DAY) * 100;
  const widthPercent = Math.max(
    MIN_BAR_WIDTH_PERCENT,
    (durationMinutes / MINUTES_PER_DAY) * 100,
  );
  const bottom = bar.lane * (barHeight + LANE_GAP);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    backgroundColor: bar.color,
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          bottom,
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

export function ActivityBarChart({ bars }: ActivityBarChartProps) {
  const maxLanes = Math.max(1, ...bars.map((bar) => bar.lane + 1));
  const barHeight = (USABLE_HEIGHT - (maxLanes - 1) * LANE_GAP) / maxLanes;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>시간대별 활동 분포</Text>
      <View style={styles.plotArea}>
        <View style={styles.chart}>
          <HourGridLines />
          {bars.map((bar) => (
            <AnimatedChartBar key={bar.id} bar={bar} barHeight={barHeight} />
          ))}
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
