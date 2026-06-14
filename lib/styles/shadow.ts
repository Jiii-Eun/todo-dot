import type { ViewStyle } from 'react-native';

export const cardShadow: ViewStyle = {
  boxShadow: [
    {
      offsetX: 0,
      offsetY: 2,
      blurRadius: 8,
      color: 'rgba(0, 0, 0, 0.05)',
    },
  ],
};

export const toastShadow: ViewStyle = {
  boxShadow: [
    {
      offsetX: 0,
      offsetY: 4,
      blurRadius: 8,
      color: 'rgba(0, 0, 0, 0.12)',
    },
  ],
};
