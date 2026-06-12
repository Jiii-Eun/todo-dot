import type { ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { motion } from '@/constants/motion';

interface ScreenEntranceProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
}

export function ScreenEntrance({ children, style, delay = 40 }: ScreenEntranceProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(motion.slow).delay(delay).easing(motion.easing)}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </Animated.View>
  );
}
