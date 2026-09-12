import type { ColorSchemeName } from 'react-native';
import { create } from 'zustand';

import { DarkAppColors, LightAppColors, type AppPalette } from '@/constants/app-theme';
import type { AppearanceTheme } from '@/features/settings/service';
import { appKeyValueStorage } from '@/lib/storage/secure-store';

type ResolvedTheme = 'light' | 'dark';

type ThemeState = {
  preference: AppearanceTheme;
  systemTheme: ResolvedTheme;
  resolvedTheme: ResolvedTheme;
  setSystemTheme: (scheme: ColorSchemeName) => void;
  setPreference: (preference: AppearanceTheme) => void;
};

const THEME_STORAGE_KEY = 'karaads_theme_preference';

const normalizeSystem = (scheme: ColorSchemeName): ResolvedTheme => {
  return scheme === 'light' ? 'light' : 'dark';
};

const resolveTheme = (preference: AppearanceTheme, systemTheme: ResolvedTheme): ResolvedTheme => {
  if (preference === 'system') {
    return systemTheme;
  }
  return preference;
};

const isAppearanceTheme = (value: string | null): value is AppearanceTheme => {
  return value === 'light' || value === 'dark' || value === 'system';
};

export const useThemeStore = create<ThemeState>()((set, get) => ({
  preference: 'system',
  systemTheme: 'dark',
  resolvedTheme: 'dark',
  setSystemTheme: (scheme) => {
    const nextSystem = normalizeSystem(scheme);
    const { preference } = get();
    set({
      systemTheme: nextSystem,
      resolvedTheme: resolveTheme(preference, nextSystem),
    });
  },
  setPreference: (preference) => {
    const { systemTheme } = get();
    set({
      preference,
      resolvedTheme: resolveTheme(preference, systemTheme),
    });
    appKeyValueStorage.setItem(THEME_STORAGE_KEY, preference).catch(() => undefined);
  },
}));

appKeyValueStorage
  .getItem(THEME_STORAGE_KEY)
  .then((preference) => {
    if (!isAppearanceTheme(preference)) {
      return;
    }

    const { systemTheme } = useThemeStore.getState();
    useThemeStore.setState({
      preference,
      resolvedTheme: resolveTheme(preference, systemTheme),
    });
  })
  .catch(() => undefined);

export const getThemePalette = (): AppPalette => {
  return useThemeStore.getState().resolvedTheme === 'light' ? LightAppColors : DarkAppColors;
};
