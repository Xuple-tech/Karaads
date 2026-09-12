import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { AppColors, AppRadii } from '@/constants/app-theme';
import { useAuthStore } from '@/features/auth/store';
import { useEarningsSummary } from '@/features/earnings/hooks';
import { useMyProfile } from '@/features/profile/hooks';
import { getErrorMessage } from '@/lib/errors/get-error-message';
import { router } from '@/lib/navigation/router';
import type { Post } from '@/lib/types/domain';
import { getPostTextContent, getPrimaryMedia } from '@/lib/utils/post';

const money = (value: number, currency = 'NGN') => {
  const symbol = currency.toUpperCase() === 'NGN' ? '\u20A6' : currency.toUpperCase() === 'USD' ? '$' : `${currency.toUpperCase()} `;
  return `${symbol}${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)}`;
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cachedUser = useAuthStore((state) => state.user);
  const profile = useMyProfile();
  const earnings = useEarningsSummary();
  const user = profile.data?.user ?? cachedUser;
  const posts = profile.data?.posts ?? [];
  const stats = useMemo(() => [
    { label: 'Posts', value: posts.length },
    { label: 'Followers', value: user?.followers_count ?? 0 },
    { label: 'Following', value: user?.following_count ?? 0 },
  ], [posts.length, user?.followers_count, user?.following_count]);
  const tileSize = Math.floor((width - 40) / 3);
  const refresh = useCallback(() => {
    void Promise.all([profile.refetch(), earnings.refetch()]);
  }, [earnings.refetch, profile.refetch]);

  useFocusEffect(useCallback(() => {
    refresh();
  }, [refresh]));

  if (profile.isLoading && !user) {
    return <View style={styles.center}><ActivityIndicator size="large" color={AppColors.accent} /></View>;
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlatList
        data={posts}
        numColumns={3}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.gridRow}
        refreshControl={<RefreshControl refreshing={profile.isRefetching || earnings.isRefetching} onRefresh={refresh} tintColor={AppColors.accent} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.topBar}>
              <Text style={styles.topTitle}>Profile</Text>
              <Pressable style={styles.iconButton} onPress={() => router.push('Settings')}>
                <Ionicons name="settings-outline" size={22} color={AppColors.textPrimary} />
              </Pressable>
            </View>
            <View style={styles.profileCard}>
              <Avatar uri={user?.avatar} name={user?.name} size={88} showRing online={user?.is_online} />
              <View style={styles.nameRow}>
                <Text style={styles.name}>{user?.name || 'KaraAds user'}</Text>
                {user?.is_verified ? <Ionicons name="checkmark-circle" size={20} color={AppColors.accent} /> : null}
              </View>
              <Text style={styles.username}>@{user?.username || 'user'}</Text>
              {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
              <View style={styles.walletCard}>
                <View style={styles.walletIcon}><Ionicons name="wallet-outline" size={21} color={AppColors.accent} /></View>
                <View style={styles.walletCopy}>
                  <Text style={styles.walletLabel}>Available balance</Text>
                  <Text style={styles.walletValue}>
                    {earnings.isLoading && !earnings.data ? 'Loading...' : money(earnings.data?.availableBalance ?? 0, earnings.data?.currency)}
                  </Text>
                </View>
                <Pressable onPress={() => router.push('MainTabs', { screen: 'Earn' })} hitSlop={10}>
                  <Ionicons name="chevron-forward" size={20} color={AppColors.textMuted} />
                </Pressable>
              </View>
              <View style={styles.stats}>
                {stats.map((item) => (
                  <View key={item.label} style={styles.stat}>
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.actions}>
                <Pressable style={styles.primaryButton} onPress={() => router.push('SettingsAccount')}>
                  <Text style={styles.primaryButtonText}>Edit profile</Text>
                </Pressable>
                {!user?.is_verified ? (
                  <Pressable style={styles.badgeButton} onPress={() => router.push('BadgePayment')}>
                    <Ionicons name="shield-checkmark-outline" size={17} color={AppColors.accent} />
                    <Text style={styles.badgeButtonText}>Get verified</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
            {profile.isError ? (
              <Pressable style={styles.errorBox} onPress={() => profile.refetch()}>
                <Text style={styles.errorText}>{getErrorMessage(profile.error, 'Could not refresh profile.')}</Text>
                <Text style={styles.retryText}>Tap to retry</Text>
              </Pressable>
            ) : null}
            <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Posts</Text><Ionicons name="grid-outline" size={19} color={AppColors.textSecondary} /></View>
          </>
        }
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="images-outline" size={38} color={AppColors.textMuted} /><Text style={styles.emptyTitle}>No posts yet</Text></View>}
        renderItem={({ item }) => <PostGridTile post={item} size={tileSize} />}
      />
    </View>
  );
}

function PostGridTile({ post, size }: { post: Post; size: number }) {
  const media = getPrimaryMedia(post);
  const uri = media?.thumbnail_url || media?.url || media?.path;
  const isVideo = `${media?.type ?? media?.mime_type ?? ''}`.toLowerCase().includes('video');
  const text = getPostTextContent(post);
  return (
    <Pressable style={[styles.gridTile, { width: size, height: size }]} onPress={() => router.push('PostDetail', { postId: post.id, source: 'profile' })}>
      {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} /> : <Text style={styles.gridText} numberOfLines={5}>{text || 'Post'}</Text>}
      {isVideo ? <View style={styles.playBadge}><Ionicons name="play" size={16} color="#FFFFFF" /></View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.background },
  content: { paddingBottom: 30 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.background },
  topBar: { height: 58, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { color: AppColors.textPrimary, fontSize: 26, fontWeight: '800' },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.surfaceMuted },
  profileCard: { marginHorizontal: 16, padding: 20, alignItems: 'center', borderRadius: AppRadii.xl, borderWidth: 1, borderColor: AppColors.border, backgroundColor: AppColors.surface },
  nameRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { color: AppColors.textPrimary, fontSize: 22, fontWeight: '800' },
  username: { marginTop: 2, color: AppColors.textMuted, fontSize: 14 },
  bio: { marginTop: 10, color: AppColors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  walletCard: { width: '100%', marginTop: 16, padding: 13, flexDirection: 'row', alignItems: 'center', borderRadius: AppRadii.md, backgroundColor: AppColors.surfaceMuted },
  walletIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(59,130,246,0.12)' },
  walletCopy: { flex: 1, marginLeft: 11 },
  walletLabel: { color: AppColors.textMuted, fontSize: 12 },
  walletValue: { marginTop: 2, color: AppColors.textPrimary, fontSize: 20, fontWeight: '800' },
  stats: { width: '100%', marginTop: 18, paddingVertical: 14, flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: AppColors.border },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: AppColors.textPrimary, fontSize: 18, fontWeight: '800' },
  statLabel: { marginTop: 2, color: AppColors.textMuted, fontSize: 12 },
  actions: { width: '100%', marginTop: 16, flexDirection: 'row', gap: 10 },
  primaryButton: { flex: 1, minHeight: 45, borderRadius: AppRadii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.accent },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
  badgeButton: { flex: 1, minHeight: 45, borderRadius: AppRadii.pill, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: AppColors.accent },
  badgeButtonText: { color: AppColors.accent, fontWeight: '700' },
  errorBox: { margin: 16, padding: 13, borderRadius: 12, backgroundColor: 'rgba(248,113,113,0.1)' },
  errorText: { color: AppColors.danger, textAlign: 'center' },
  retryText: { marginTop: 4, color: AppColors.textSecondary, textAlign: 'center', fontSize: 12 },
  sectionHeading: { marginTop: 24, marginHorizontal: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: AppColors.textPrimary, fontSize: 18, fontWeight: '800' },
  gridRow: { paddingHorizontal: 16, gap: 4, marginBottom: 4 },
  gridTile: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: AppColors.surfaceMuted },
  gridText: { padding: 10, color: AppColors.textSecondary, fontSize: 12, lineHeight: 16, textAlign: 'center' },
  playBadge: { position: 'absolute', top: 7, right: 7, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.62)' },
  empty: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { color: AppColors.textSecondary, fontSize: 15 },
});
