// Android's direct Gradle entry bypasses React Native's usual bootstrap entry,
// so initialize its globals (FormData, fetch, URL, etc.) before app modules.
import 'react-native/Libraries/Core/InitializeCore';
import '@/polyfills/localStorage-polyfill';
// Wire theme store → AppColors/AppGradients proxy (must run before any color access)
import '@/constants/app-theme-init';

import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppErrorBoundary } from '@/components/providers/app-error-boundary';
import { AppProviders } from '@/components/providers/app-providers';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { IncomingCallManager } from '@/features/calls/incoming-call-manager';
import { PushEventManager } from '@/features/notifications/push-event-manager';
import { PushTokenSyncManager } from '@/features/notifications/push-token-sync-manager';
import { useAppTheme } from '@/hooks/use-app-theme';
import { RootNavigator } from '@/lib/navigation/RootNavigator';

export default function App() {
  const { isLight } = useAppTheme();
  useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  return (
    <AppErrorBoundary>
      <AppProviders>
        <IncomingCallManager />
        <PushEventManager />
        <PushTokenSyncManager />
        <RootNavigator />
        <OfflineBanner />
      </AppProviders>
      <StatusBar style={isLight ? 'dark' : 'light'} />
    </AppErrorBoundary>
  );
}

// android/app/build.gradle points Metro's entryFile directly at this file
// (bypassing expo/AppEntry.js) to dodge a Windows-junction path-resolution
// issue, so registration has to happen here instead of the usual AppEntry.
registerRootComponent(App);
