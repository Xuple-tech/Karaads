import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthBootstrap } from '@/features/auth/auth-bootstrap';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <AuthBootstrap>{children}</AuthBootstrap>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};
