export type AppPalette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentStrong: string;
  success: string;
  danger: string;
  warning: string;
  white: string;
  black: string;
  controlOffTint: string;
};

export const DarkAppColors: AppPalette = {
  background: '#090B12',
  surface: '#111423',
  surfaceMuted: '#1A1F33',
  border: '#2A314D',
  textPrimary: '#F4F7FF',
  textSecondary: '#A8B2D1',
  textMuted: '#7D86A8',
  accent: '#5AB2FF',
  accentStrong: '#2E90FF',
  success: '#22C55E',
  danger: '#F43F5E',
  warning: '#F59E0B',
  white: '#FFFFFF',
  black: '#0B0D12',
  controlOffTint: '#8BA9D8',
};

export const LightAppColors: AppPalette = {
  background: '#F3F6FC',
  surface: '#FFFFFF',
  surfaceMuted: '#EAF0FA',
  border: '#C6D4EA',
  textPrimary: '#0C1A33',
  textSecondary: '#35507A',
  textMuted: '#5E7399',
  accent: '#3E8DFF',
  accentStrong: '#2F75E8',
  success: '#18A058',
  danger: '#D6405E',
  warning: '#D4870A',
  white: '#FFFFFF',
  black: '#0A0F1A',
  controlOffTint: '#7E9BC9',
};

// ---------------------------------------------------------------------------
// Dynamic palette – reads the current theme from the zustand theme store
// so every property access (AppColors.background, etc.) returns the right
// value for the active light/dark mode.  Works for both inline styles and
// StyleSheet.create when styles are built inside component render paths.
// ---------------------------------------------------------------------------
let _getResolvedTheme: (() => 'light' | 'dark') | undefined;

/** Called once by app-theme-init to wire up the store without a circular import. */
export function _initThemeResolver(getter: () => 'light' | 'dark') {
  _getResolvedTheme = getter;
}

function _currentPalette(): AppPalette {
  if (_getResolvedTheme) {
    return _getResolvedTheme() === 'light' ? LightAppColors : DarkAppColors;
  }
  return DarkAppColors; // fallback before store is ready
}

/**
 * Proxy-based AppColors – every property read is delegated to the current
 * resolved palette.  Safe for inline styles and inside render functions.
 *
 * NOTE: module-level `StyleSheet.create` that captures AppColors.* at import
 * time will snapshot the *initial* theme. Screens that need live theme
 * switching should use `useColors()` or `makeStyles()`.
 */
export const AppColors: AppPalette = new Proxy({} as AppPalette, {
  get(_target, prop: string) {
    return (_currentPalette() as Record<string, string>)[prop];
  },
});

export const AppSpacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
};

export const AppRadii = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
};

// ---------------------------------------------------------------------------
// Gradients – keyed by light / dark
// ---------------------------------------------------------------------------
type GradientMap = Record<string, [string, string] | [string, string, string]>;

const DarkAppGradients: GradientMap = {
  primary: ['#1A65E0', '#3B92FF'],
  primaryDeep: ['#1250B8', '#2E78E8'],
  heroBg: ['#060912', '#0C1428', '#131D35'],
  cardSurface: ['#0E1422', '#131D35'],
  surfaceSubtle: ['#111423', '#161D32'],
  accentBlue: ['#2563EB', '#5AB2FF'],
  accentPurple: ['#2563EB', '#7C3AED'],
  accentGreen: ['#065F46', '#059669'],
  accentOrange: ['#B45309', '#F97316'],
  storyRing: ['#2563EB', '#06B6D4', '#7C3AED'],
  ownBubble: ['#1A65E0', '#3B92FF'],
  fadeDown: ['transparent', 'rgba(9,11,18,0.92)'],
  fadeUp: ['rgba(9,11,18,0.92)', 'transparent'],
  shimmer: ['#111423', '#1E2B4A', '#111423'],
  earnBalance: ['#0A1628', '#162040'],
  earnGreen: ['#022C22', '#065F46'],
  earnBlue: ['#0C1D40', '#1D3A7A'],
  earnPurple: ['#1A0938', '#4C1D95'],
  earnOrange: ['#2D1200', '#7C2D12'],
};

const LightAppGradients: GradientMap = {
  primary: ['#3B92FF', '#1A65E0'],
  primaryDeep: ['#2E78E8', '#1250B8'],
  heroBg: ['#F3F6FC', '#E8EEF9', '#DDE6F5'],
  cardSurface: ['#FFFFFF', '#F3F6FC'],
  surfaceSubtle: ['#FFFFFF', '#F0F4FB'],
  accentBlue: ['#5AB2FF', '#2563EB'],
  accentPurple: ['#7C3AED', '#2563EB'],
  accentGreen: ['#059669', '#065F46'],
  accentOrange: ['#F97316', '#B45309'],
  storyRing: ['#2563EB', '#06B6D4', '#7C3AED'],
  ownBubble: ['#3B92FF', '#1A65E0'],
  fadeDown: ['transparent', 'rgba(243,246,252,0.92)'],
  fadeUp: ['rgba(243,246,252,0.92)', 'transparent'],
  shimmer: ['#EAF0FA', '#D5E1F5', '#EAF0FA'],
  earnBalance: ['#E8EEF9', '#D5E1F5'],
  earnGreen: ['#D1FAE5', '#A7F3D0'],
  earnBlue: ['#DBEAFE', '#BFDBFE'],
  earnPurple: ['#EDE9FE', '#DDD6FE'],
  earnOrange: ['#FFEDD5', '#FED7AA'],
};

/** Dynamic gradients – same proxy approach as AppColors. */
export const AppGradients: GradientMap = new Proxy({} as GradientMap, {
  get(_target, prop: string) {
    const map = _getResolvedTheme?.() === 'light' ? LightAppGradients : DarkAppGradients;
    return (map as Record<string, unknown>)[prop];
  },
});
