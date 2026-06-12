import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/constants/theme';

interface CircularCountdownProps {
  display: string;
  progress: number;
  isOvertime: boolean;
  overtimeText?: string;
  caption?: string;
}

const SIZE = 260;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CircularCountdown({
  display,
  progress,
  isOvertime,
  overtimeText,
  caption,
}: CircularCountdownProps) {
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const ringColor = isOvertime ? colors.danger : colors.primary;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.border}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={ringColor}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.caption}>{caption ?? (isOvertime ? '초과 시간' : '남은 시간')}</Text>
        <Text style={[styles.timer, isOvertime && styles.overtime]}>{display}</Text>
        {overtimeText ? <Text style={styles.overtimeSub}>{overtimeText}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  caption: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  timer: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  overtime: {
    color: colors.danger,
  },
  overtimeSub: {
    marginTop: 8,
    fontSize: 14,
    color: colors.danger,
  },
});
