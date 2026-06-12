import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { ACTIVITY_AXIS_LABELS, type ActivityBucket } from '@/lib/time/activityDistribution';
import { colors, spacing } from '@/constants/theme';

interface ActivityBarChartProps {
  buckets: ActivityBucket[];
}

const CHART_HEIGHT = 80;
const CHART_WIDTH = 280;

export function ActivityBarChart({ buckets }: ActivityBarChartProps) {
  const maxValue = Math.max(1, ...buckets.map((b) => b.value));
  const barWidth = CHART_WIDTH / buckets.length - 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>시간대별 활동 분포</Text>
      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        {buckets.map((bucket, index) => {
          const barHeight = (bucket.value / maxValue) * (CHART_HEIGHT - 10);
          const x = index * (barWidth + 1);
          const y = CHART_HEIGHT - barHeight;
          return (
            <Rect
              key={bucket.hour}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={2}
              fill={bucket.value > 0 ? colors.primaryLight : colors.border}
            />
          );
        })}
      </Svg>
      <View style={styles.axis}>
        {ACTIVITY_AXIS_LABELS.map((hour) => (
          <Text key={hour} style={styles.axisLabel}>
            {hour}시
          </Text>
        ))}
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
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  axisLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
