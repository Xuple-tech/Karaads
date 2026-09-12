import { useWindowDimensions } from 'react-native';

const BASE_WIDTH = 390;

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const scaleByWidth = (screenWidth: number, value: number, minFactor = 0.88, maxFactor = 1.18) => {
  const factor = clamp(screenWidth / BASE_WIDTH, minFactor, maxFactor);
  return Math.round(value * factor);
};

export const useResponsiveMetrics = () => {
  const { width, height } = useWindowDimensions();
  const shortest = Math.min(width, height);
  const isSmallScreen = shortest < 360;
  const isTablet = shortest >= 768;
  const contentMaxWidth = isTablet ? 760 : undefined;
  const horizontalPadding = isSmallScreen ? 12 : isTablet ? 22 : 16;
  const scale = clamp(shortest / BASE_WIDTH, 0.88, 1.18);

  return {
    width,
    height,
    shortest,
    isSmallScreen,
    isTablet,
    contentMaxWidth,
    horizontalPadding,
    scale,
    byWidth: (value: number, minFactor?: number, maxFactor?: number) =>
      scaleByWidth(width, value, minFactor, maxFactor),
  };
};
