import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dotSize = size === 'lg' ? 18 : size === 'md' ? 14 : 10;
  const fontSize = size === 'lg' ? 28 : size === 'md' ? 22 : 18;

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2 }]} />
      <Text style={[styles.text, { fontSize }]}>
        <Text style={styles.brand}>.Todo Dot</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    backgroundColor: colors.primary,
  },
  text: {
    fontWeight: '700',
    color: colors.text,
  },
  brand: {
    color: colors.text,
  },
});
