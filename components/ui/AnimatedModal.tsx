import { useEffect, useState, type ReactNode } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '@/constants/motion';
import { colors } from '@/constants/theme';

export type AnimatedModalVariant = 'fade' | 'sheet' | 'slide';

interface AnimatedModalProps {
  visible: boolean;
  onRequestClose: () => void;
  children: ReactNode;
  variant?: AnimatedModalVariant;
  overlayStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  dismissOnOverlayPress?: boolean;
}

const SHEET_OFFSET = 420;
const SLIDE_OFFSET = 640;

export function AnimatedModal({
  visible,
  onRequestClose,
  children,
  variant = 'fade',
  overlayStyle,
  contentStyle,
  dismissOnOverlayPress = true,
}: AnimatedModalProps) {
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
    }

    progress.value = withTiming(
      visible ? 1 : 0,
      {
        duration: visible ? motion.normal : motion.fast,
        easing: visible ? motion.easing : motion.easingIn,
      },
      (finished) => {
        if (finished && !visible) {
          runOnJS(setMounted)(false);
        }
      },
    );
  }, [progress, visible]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const fadeContentStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.94 + progress.value * 0.06 }],
  }));

  const sheetContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * SHEET_OFFSET }],
  }));

  const slideContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * SLIDE_OFFSET }],
  }));

  if (!mounted) {
    return null;
  }

  const contentAnimatedStyle =
    variant === 'sheet'
      ? sheetContentStyle
      : variant === 'slide'
        ? slideContentStyle
        : fadeContentStyle;

  const overlayLayoutStyle =
    variant === 'fade' ? styles.fadeOverlay : variant === 'sheet' ? styles.sheetOverlay : styles.slideOverlay;

  const contentLayoutStyle =
    variant === 'fade' ? styles.fadeContent : variant === 'sheet' ? styles.sheetContent : styles.slideContent;

  const handleOverlayPress = () => {
    if (dismissOnOverlayPress) {
      onRequestClose();
    }
  };

  const overlayToneStyle = variant === 'slide' ? styles.opaqueOverlay : null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onRequestClose}>
      <Animated.View
        style={[styles.overlay, overlayToneStyle, overlayLayoutStyle, overlayAnimatedStyle, overlayStyle]}
      >
        <Pressable style={styles.overlayPress} onPress={handleOverlayPress} />
        <Animated.View style={[contentLayoutStyle, contentAnimatedStyle, contentStyle]}>
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  opaqueOverlay: {
    backgroundColor: colors.background,
  },
  overlayPress: {
    ...StyleSheet.absoluteFillObject,
  },
  fadeOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetOverlay: {
    justifyContent: 'flex-end',
  },
  slideOverlay: {
    justifyContent: 'flex-end',
  },
  fadeContent: {
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: 24,
  },
  sheetContent: {
    width: '100%',
  },
  slideContent: {
    flex: 1,
    width: '100%',
  },
});
