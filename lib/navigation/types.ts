import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Verify: { email?: string } | undefined;
  ForgotPassword: undefined;
  AccountSetup: { email?: string } | undefined;
};

export type MainTabsParamList = {
  Home: { pinPostId?: string } | undefined;
  Browse: undefined;
  Earn: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList> | undefined;
  MessagesCompose: { mode?: 'group' } | undefined;
  Conversation: { conversationId: string; mode?: 'video' | 'audio' };
  PostsCreate: {
    mode?: string;
    editPostId?: string;
    content?: string;
    visibility?: string;
    adMode?: string;
    adGoal?: string;
    adBudget?: string;
  } | undefined;
  Notifications: undefined;
  KwatiAi: undefined;
  Business: undefined;
  BusinessCreate: undefined;
  BusinessPostCreate: undefined;
  BadgePayment: undefined;
  AdsManagement: undefined;
  AdsCreate: { mode?: string; adMode?: string; adGoal?: string; adBudget?: string } | undefined;
  Referrals: undefined;
  LiveStreams: undefined;
  LiveStreamDetail: { id: string; host?: string };
  Settings: { section?: string } | undefined;
  SettingsAccount: undefined;
  SettingsPrivacy: undefined;
  SettingsSecurity: undefined;
  SettingsCalls: undefined;
  EarningsWithdraw: undefined;
  Moment: { pinPostId?: string } | undefined;
  ProfileByUsername: { username: string; source?: string };
  PostDetail: { postId: string; focus?: string; commentId?: string; likeId?: string; source?: 'profile' | 'feed' };
  PostBoost: { postId: string };
};

export type RootStackParamList = {
  Onboarding: undefined;
  // Wrapper screen mounting the entire MainStackNavigator. Never navigated to
  // directly by name — navigate to 'MainTabs' or any MainStackParamList
  // screen instead, which resolves inside it via React Navigation's nested
  // action bubbling.
  Main: undefined;
} & AuthStackParamList &
  MainStackParamList;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
