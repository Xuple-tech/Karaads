import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdsCreateScreen from '@/app/(main)/ads-create';
import AdsManagementScreen from '@/app/(main)/ads-management';
import BadgePaymentScreen from '@/app/(main)/badge-payment';
import BusinessScreen from '@/app/(main)/business';
import BusinessCreateScreen from '@/app/(main)/business/create';
import BusinessPostCreateScreen from '@/app/(main)/business/post-create';
import EarningsWithdrawScreen from '@/app/(main)/earn/withdraw';
import KwatiAiScreen from '@/app/(main)/kwati-ai';
import LiveStreamDetailScreen from '@/app/(main)/live-streams/[id]';
import LiveStreamsScreen from '@/app/(main)/live-streams/index';
import ConversationScreen from '@/app/(main)/messages/[conversationId]';
import MessagesComposeScreen from '@/app/(main)/messages/compose';
import NotificationsScreen from '@/app/(main)/notifications/index';
import PostBoostScreen from '@/app/(main)/posts/boost/[postId]';
import PostsCreateScreen from '@/app/(main)/posts/create';
import ReferralsScreen from '@/app/(main)/referrals';
import SettingsAccountScreen from '@/app/(main)/settings/account';
import SettingsCallsScreen from '@/app/(main)/settings/calls';
import SettingsPrivacyScreen from '@/app/(main)/settings/privacy';
import SettingsSecurityScreen from '@/app/(main)/settings/security';
import MomentScreen from '@/app/(main)/(tabs)/moment';
import PostDetailScreen from '@/app/(main)/(tabs)/post/[postId]';
import ProfileByUsernameScreen from '@/app/(main)/(tabs)/profile/[username]';
import SettingsScreen from '@/app/(main)/(tabs)/settings';

import { MainTabsNavigator } from './MainTabsNavigator';
import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
      <Stack.Screen name="Moment" component={MomentScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="ProfileByUsername" component={ProfileByUsernameScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="MessagesCompose" component={MessagesComposeScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Conversation" component={ConversationScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="PostsCreate" component={PostsCreateScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="KwatiAi" component={KwatiAiScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Business" component={BusinessScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="BusinessCreate" component={BusinessCreateScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="BusinessPostCreate" component={BusinessPostCreateScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="BadgePayment" component={BadgePaymentScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="AdsManagement" component={AdsManagementScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="AdsCreate" component={AdsCreateScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="PostBoost" component={PostBoostScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Referrals" component={ReferralsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="LiveStreams" component={LiveStreamsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="LiveStreamDetail" component={LiveStreamDetailScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="SettingsAccount" component={SettingsAccountScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="SettingsPrivacy" component={SettingsPrivacyScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="SettingsSecurity" component={SettingsSecurityScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="SettingsCalls" component={SettingsCallsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="EarningsWithdraw" component={EarningsWithdrawScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
