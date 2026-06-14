import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { motion } from '@/constants/motion';
import { colors, radius, spacing } from '@/constants/theme';
import { toastShadow } from '@/lib/styles/shadow';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  const insets = useSafeAreaInsets();

  if (!message) return null;

  return (
    <View
      style={[styles.container, { bottom: insets.bottom + spacing.lg }]}
    >
      <Animated.View
        entering={FadeInUp.duration(motion.normal).easing(motion.easing)}
        exiting={FadeOutDown.duration(motion.fast).easing(motion.easingIn)}
        style={styles.toast}
      >
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    zIndex: 100,
    pointerEvents: 'box-none',
  },
  toast: {
    maxWidth: 320,
    backgroundColor: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    ...toastShadow,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
