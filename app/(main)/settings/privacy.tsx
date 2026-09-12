import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Eye, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeStackView } from '@/components/navigation/swipe-stack-view';
import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import { useSavePrivacySettings, useSettings } from '@/features/settings/hooks';
import { router } from '@/lib/navigation/router';

export default function PrivacySettingsScreen() {
  const insets = useSafeAreaInsets();
  const settingsQuery = useSettings();
  const savePrivacy = useSavePrivacySettings();

  const [messagePermission, setMessagePermission] = useState<'everyone' | 'following' | 'nobody'>('everyone');
  const [defaultVisibility, setDefaultVisibility] = useState<'everyone' | 'followers' | 'private'>('everyone');

  useEffect(() => {
    if (!settingsQuery.data) return;
    setMessagePermission(settingsQuery.data.message_permission);
    setDefaultVisibility(settingsQuery.data.default_post_visibility);
  }, [settingsQuery.data]);

  const isMessagesRestricted = messagePermission !== 'everyone';
  const isPostsRestricted = defaultVisibility !== 'everyone';

  const toggleMessages = (restricted: boolean) => {
    const next = restricted ? 'following' : 'everyone';
    setMessagePermission(next);
    savePrivacy.mutate({ message_permission: next, default_post_visibility: defaultVisibility });
  };

  const toggleVisibility = (restricted: boolean) => {
    const next = restricted ? 'followers' : 'everyone';
    setDefaultVisibility(next);
    savePrivacy.mutate({ message_permission: messagePermission, default_post_visibility: next });
  };

  return (
    <SwipeStackView>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={AppColors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Privacy</Text>
          <View style={styles.spacer} />
        </View>

        {settingsQuery.isLoading ? (
          <ActivityIndicator color={AppColors.accent} style={{ marginTop: 40 }} />
        ) : (
          <LinearGradient colors={AppGradients.cardSurface} style={styles.card}>
            <SettingSwitch
              icon={<Eye size={16} color={AppColors.white} />}
              iconGradient={AppGradients.accentBlue}
              title="Restrict messages"
              subtitle="Only people you follow can message you."
              value={isMessagesRestricted}
              onChange={toggleMessages}
            />
            <View style={styles.divider} />
            <SettingSwitch
              icon={<Users size={16} color={AppColors.white} />}
              iconGradient={AppGradients.accentPurple}
              title="Followers-only posts"
              subtitle="New posts default to followers-only visibility."
              value={isPostsRestricted}
              onChange={toggleVisibility}
            />
          </LinearGradient>
        )}
      </View>
    </SwipeStackView>
  );
}

const SettingSwitch = ({
  icon,
  iconGradient,
  title,
  subtitle,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  iconGradient: readonly string[];
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) => {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchLeft}>
        <LinearGradient colors={iconGradient as [string, string]} style={styles.iconWrap}>
          {icon}
        </LinearGradient>
        <View style={styles.switchMeta}>
          <Text style={styles.switchTitle}>{title}</Text>
          <Text style={styles.switchSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor={AppColors.white}
        trackColor={{ false: '#1E2B47', true: AppColors.accentStrong }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  title: {
    color: AppColors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  spacer: {
    width: 42,
    height: 42,
  },
  card: {
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: 'rgba(91,178,255,0.2)',
    padding: 4,
    shadowColor: '#2E90FF',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(42,49,77,0.6)',
    marginHorizontal: 10,
  },
  switchRow: {
    minHeight: 72,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchMeta: {
    flex: 1,
    gap: 3,
  },
  switchTitle: {
    color: AppColors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  switchSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
});

