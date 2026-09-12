/**
 * One-time wiring that connects the theme Proxy in app-theme.ts to the
 * zustand theme store without introducing a circular dependency.
 *
 * Import this module in the root layout (or any early entry point) BEFORE
 * anything reads AppColors/AppGradients.
 */
import { _initThemeResolver } from '@/constants/app-theme';
import { useThemeStore } from '@/features/settings/theme-store';

_initThemeResolver(() => useThemeStore.getState().resolvedTheme);
