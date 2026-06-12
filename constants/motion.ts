import { Platform } from 'react-native';
import { Easing } from 'react-native-reanimated';

export const motion = {
  fast: 180,
  normal: 280,
  slow: 360,
  easing: Platform.OS === 'web' ? Easing.ease : Easing.out(Easing.cubic),
  easingIn: Platform.OS === 'web' ? Easing.ease : Easing.in(Easing.cubic),
} as const;
