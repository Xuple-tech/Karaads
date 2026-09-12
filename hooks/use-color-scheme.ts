import { Appearance, type ColorSchemeName } from 'react-native';

export const useColorScheme = (): ColorSchemeName => {
  return Appearance.getColorScheme();
};
