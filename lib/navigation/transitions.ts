import { Platform } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { motion } from '@/constants/motion';

const fadeScreen: NativeStackNavigationOptions = {
  animation: 'fade',
  animationDuration: motion.normal,
  animationTypeForReplace: 'push',
};

const slideScreen: NativeStackNavigationOptions = {
  animation: Platform.select({
    ios: 'default',
    android: 'slide_from_right',
    default: 'slide_from_right',
  }),
  animationDuration: motion.slow,
  animationTypeForReplace: 'push',
  gestureEnabled: true,
  fullScreenGestureEnabled: Platform.OS === 'ios',
};

export const stackScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  ...fadeScreen,
};

export const welcomeScreenOptions: NativeStackNavigationOptions = fadeScreen;

export const mainScreenOptions: NativeStackNavigationOptions = fadeScreen;

export const focusScreenOptions: NativeStackNavigationOptions = slideScreen;
