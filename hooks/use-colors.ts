import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { DarkAppColors, LightAppColors, type AppPalette } from '@/constants/app-theme';
import { useThemeStore } from '@/features/settings/theme-store';

/**
 * Reactive hook that returns the current theme palette.
 * Re-renders the component when the resolved theme changes.
 *
 * Use this inside components instead of importing AppColors directly
 * when the component needs to respond to live theme switches.
 */
export function useColors(): AppPalette {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  return resolvedTheme === 'light' ? LightAppColors : DarkAppColors;
}

/**
 * Style factory helper – creates a hook that memoises StyleSheet.create
 * output per-theme.  Use to migrate screens away from module-level
 * StyleSheet.create that captured AppColors at import time.
 *
 * Usage:
 *   const useStyles = makeStyles((colors) => ({
 *     container: { backgroundColor: colors.background },
 *   }));
 *
 *   function MyScreen() {
 *     const styles = useStyles();
 *     ...
 *   }
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: AppPalette) => T,
) {
  return function useStyles(): T {
    const colors = useColors();
    return useMemo(
      () => StyleSheet.create(factory(colors)),
      [colors],
    );
  };
}
