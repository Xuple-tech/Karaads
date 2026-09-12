import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View, type ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PostCard } from '@/components/ui/post-card';
import { AppColors } from '@/constants/app-theme';
import { useLikeToggle, useRepostToggle, useSaveToggle } from '@/features/feed/hooks';
import { feedService } from '@/features/feed/service';
import { useMyProfile } from '@/features/profile/hooks';
import { router, useLocalSearchParams } from '@/lib/navigation/router';
import type { Post } from '@/lib/types/domain';

export default function PostDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ postId?: string; source?: string }>();
  const postId = Array.isArray(params.postId) ? params.postId[0] : params.postId ?? '';
  const fromProfile = params.source === 'profile';
  const profile = useMyProfile();
  const selected = useQuery({ queryKey: ['post', postId], queryFn: () => feedService.getPost(postId), enabled: Boolean(postId) });
  const like = useLikeToggle();
  const save = useSaveToggle();
  const repost = useRepostToggle();
  const [activePostId, setActivePostId] = useState(postId);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 65 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken<Post>[] }) => {
    const visible = viewableItems.find((item) => item.isViewable)?.item;
    setActivePostId(visible?.id ?? '');
  }).current;

  const posts = useMemo(() => {
    const profilePosts = fromProfile ? profile.data?.posts ?? [] : [];
    const selectedPost = profilePosts.find((post) => post.id === postId) ?? selected.data;
    if (!selectedPost) return profilePosts;
    const selectedIndex = profilePosts.findIndex((post) => post.id === postId);
    if (selectedIndex < 0) return [selectedPost];
    return [selectedPost, ...profilePosts.slice(selectedIndex + 1), ...profilePosts.slice(0, selectedIndex)];
  }, [fromProfile, postId, profile.data?.posts, selected.data]);

  const refresh = () => void Promise.all([profile.refetch(), selected.refetch()]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color={AppColors.textPrimary} /></Pressable>
        <Text style={styles.title}>{fromProfile ? 'Profile posts' : 'Post'}</Text>
        <View style={styles.spacer} />
      </View>
      {posts.length === 0 && (profile.isLoading || selected.isLoading) ? (
        <View style={styles.center}><ActivityIndicator size="large" color={AppColors.accent} /></View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(post) => post.id}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={profile.isRefetching || selected.isRefetching} onRefresh={refresh} tintColor={AppColors.accent} />}
          ListHeaderComponent={fromProfile && posts.length > 1 ? <Text style={styles.hint}>Swipe up to see more posts</Text> : null}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.empty}>This post could not be loaded.</Text></View>}
          renderItem={({ item }: { item: Post }) => (
            <View style={styles.postWrap}>
              <PostCard
                post={item}
                isActive={item.id === activePostId}
                onLike={(post) => like.mutate({ postId: post.id, liked: Boolean(post.user_liked) })}
                onSave={(post) => save.mutate(post.id)}
                onRepost={(post) => repost.mutate({ postId: post.id, reposted: Boolean(post.user_reshared) })}
                onAuthorPress={(username) => username ? router.push('ProfileByUsername', { username }) : undefined}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.background },
  header: { height: 58, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: AppColors.border },
  back: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.surfaceMuted },
  title: { color: AppColors.textPrimary, fontSize: 19, fontWeight: '800' },
  spacer: { width: 42 },
  list: { paddingTop: 10, paddingBottom: 40 },
  hint: { paddingVertical: 8, color: AppColors.textMuted, fontSize: 12, textAlign: 'center' },
  postWrap: { marginHorizontal: 12, marginBottom: 12 },
  center: { flex: 1, minHeight: 220, alignItems: 'center', justifyContent: 'center' },
  empty: { color: AppColors.textMuted },
});
