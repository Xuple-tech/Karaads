import { NavigationContainer, type NavigationContainerRef } from '@react-navigation/native';
import React, { createRef } from 'react';
// @ts-expect-error - no types for react-test-renderer
import renderer from 'react-test-renderer';

import { MainStackNavigator } from '@/lib/navigation/MainStackNavigator';
import { MainTabsNavigator } from '@/lib/navigation/MainTabsNavigator';
import type { RootStackParamList } from '@/lib/navigation/types';

jest.mock('@/features/messages/hooks', () => ({
  useConversations: () => ({ data: [] }),
}));

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  const noopGesture = {
    runOnJS: () => noopGesture,
    direction: () => noopGesture,
    onEnd: () => noopGesture,
  };
  return {
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    Gesture: {
      Fling: () => noopGesture,
      Exclusive: () => noopGesture,
    },
    Directions: { LEFT: 1, RIGHT: 2 },
    GestureHandlerRootView: View,
  };
});

const stubScreen = (name: string) => {
  const Stub = () => null;
  Stub.displayName = name;
  return Stub;
};

jest.mock('@/app/(main)/(tabs)/browse', () => stubScreen('Browse'));
jest.mock('@/app/(main)/(tabs)/earn', () => stubScreen('Earn'));
jest.mock('@/app/(main)/(tabs)/home', () => stubScreen('Home'));
jest.mock('@/app/(main)/(tabs)/messages/index', () => stubScreen('MessagesList'));
jest.mock('@/app/(main)/(tabs)/profile/index', () => stubScreen('Profile'));
jest.mock('@/app/(main)/(tabs)/moment', () => stubScreen('Moment'));
jest.mock('@/app/(main)/(tabs)/post/[postId]', () => stubScreen('PostDetail'));
jest.mock('@/app/(main)/(tabs)/profile/[username]', () => stubScreen('ProfileByUsername'));
jest.mock('@/app/(main)/(tabs)/settings', () => stubScreen('Settings'));
jest.mock('@/app/(main)/messages/compose', () => stubScreen('MessagesCompose'));
jest.mock('@/app/(main)/messages/[conversationId]', () => stubScreen('Conversation'));
jest.mock('@/app/(main)/posts/create', () => stubScreen('PostsCreate'));
jest.mock('@/app/(main)/notifications/index', () => stubScreen('Notifications'));
jest.mock('@/app/(main)/kwati-ai', () => stubScreen('KwatiAi'));
jest.mock('@/app/(main)/business', () => stubScreen('Business'));
jest.mock('@/app/(main)/business/create', () => stubScreen('BusinessCreate'));
jest.mock('@/app/(main)/business/post-create', () => stubScreen('BusinessPostCreate'));
jest.mock('@/app/(main)/badge-payment', () => stubScreen('BadgePayment'));
jest.mock('@/app/(main)/ads-management', () => stubScreen('AdsManagement'));
jest.mock('@/app/(main)/ads-create', () => stubScreen('AdsCreate'));
jest.mock('@/app/(main)/posts/boost/[postId]', () => stubScreen('PostBoost'));
jest.mock('@/app/(main)/referrals', () => stubScreen('Referrals'));
jest.mock('@/app/(main)/live-streams/index', () => stubScreen('LiveStreams'));
jest.mock('@/app/(main)/live-streams/[id]', () => stubScreen('LiveStreamDetail'));
jest.mock('@/app/(main)/settings/account', () => stubScreen('SettingsAccount'));
jest.mock('@/app/(main)/settings/privacy', () => stubScreen('SettingsPrivacy'));
jest.mock('@/app/(main)/settings/security', () => stubScreen('SettingsSecurity'));
jest.mock('@/app/(main)/settings/calls', () => stubScreen('SettingsCalls'));
jest.mock('@/app/(main)/earn/withdraw', () => stubScreen('EarningsWithdraw'));

const renderWithNavigation = async (Component: React.ComponentType) => {
  const ref = createRef<NavigationContainerRef<RootStackParamList>>();
  let tree: renderer.ReactTestRenderer;
  await renderer.act(async () => {
    tree = renderer.create(
      <NavigationContainer ref={ref}>
        <Component />
      </NavigationContainer>,
    );
  });
  const names = ref.current?.getRootState()?.routeNames ?? [];
  renderer.act(() => {
    tree.unmount();
  });
  return names;
};

describe('routing layout', () => {
  it('registers conversation and compose routes in the main stack', async () => {
    const names = await renderWithNavigation(MainStackNavigator);

    expect(names).toContain('MainTabs');
    expect(names).toContain('MessagesCompose');
    expect(names).toContain('Conversation');
  });

  it('keeps conversation route out of the tab navigator', async () => {
    const names = await renderWithNavigation(MainTabsNavigator);

    expect(names).toContain('Messages');
    expect(names).not.toContain('Conversation');
    expect(names).not.toContain('MessagesCompose');
  });
});
