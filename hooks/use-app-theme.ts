import { DarkAppColors } from '@/constants/app-theme';

export const useAppTheme = () => {
  return {
    preference: 'dark' as const,
    resolvedTheme: 'dark' as const,
    colors: DarkAppColors,
    isLight: false,
    isDark: true,
  };
};

