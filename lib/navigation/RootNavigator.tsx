import { DarkTheme, DefaultTheme, NavigationContainer, type LinkingOptions, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useMemo } from 'react';
import { View } from 'react-native';

import LoginScreen from '@/app/(auth)/login';
import RegisterScreen from '@/app/(auth)/register';
import VerifyAccountScreen from '@/app/(auth)/verify';
import ForgotPasswordScreen from '@/app/(auth)/forgot-password';
import AccountSetupScreen from '@/app/(auth)/account-setup';
import OnboardingScreen from '@/app/onboarding';
import { AppColors } from '@/constants/app-theme';
import { useAuthStore } from '@/features/auth/store';
import { useAppTheme } from '@/hooks/use-app-theme';

import { MainStackNavigator } from './MainStackNavigator';
import { navigationRef } from './router';
import { useOnboardingStore } from './onboarding-store';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['karaads://'],
  config: {
    screens: {
      Onboarding: 'onboarding',
      Login: 'login',
      Register: 'register',
      Main: {
        screens: {
          MainTabs: {
            screens: {
              Home: 'home',
              Browse: 'browse',
              Earn: 'earn',
              Messages: 'messages',
              Profile: 'profile',
            },
          },
          Notifications: 'notifications',
        },
      },
    },
  },
};

export function RootNavigator() {
  const authStatus = useAuthStore((state) => state.status);
  const onboardingSeen = useOnboardingStore((state) => state.seen);
  const onboardingHydrated = useOnboardingStore((state) => state.hydrated);
  const { colors, isLight } = useAppTheme();

  useEffect(() => {
    useOnboardingStore.getState().hydrate();
  }, []);

  const navigationTheme: Theme = useMemo(
    () => ({
      ...(isLight ? DefaultTheme : DarkTheme),
      colors: {
        ...(isLight ? DefaultTheme.colors : DarkTheme.colors),
        primary: colors.accentStrong,
        background: colors.background,
        card: colors.background,
        text: colors.textPrimary,
        border: colors.border,
        notification: colors.accent,
      },
    }),
    [colors, isLight],
  );

  if (!onboardingHydrated) {
    return <View style={{ flex: 1, backgroundColor: AppColors.background }} />;
  }

  // React Navigation doesn't reliably auto-switch the active screen when the
  // conditionally-rendered screen set changes shape (e.g. a Group of auth
  // screens swapping for a single "Main" screen) while the app is already
  // running — it only picks up the new set on the next fresh mount. Keying
  // the Navigator by phase forces a clean remount on every transition so the
  // switch is immediate instead of requiring an app restart.
  const phase = !onboardingSeen ? 'onboarding' : authStatus !== 'authenticated' ? 'auth' : 'main';

  return (
    <NavigationContainer ref={navigationRef} linking={linking} theme={navigationTheme}>
      <Stack.Navigator key={phase} screenOptions={{ headerShown: false }}>
        {phase === 'onboarding' ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : phase === 'auth' ? (
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Verify" component={VerifyAccountScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="AccountSetup" component={AccountSetupScreen} />
          </Stack.Group>
        ) : (
          <Stack.Screen name="Main" component={MainStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
