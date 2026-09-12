import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, Search, Video } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeTabsView } from '@/components/navigation/swipe-tabs-view';
import { Avatar } from '@/components/ui/avatar';
import { AppColors, AppRadii } from '@/constants/app-theme';
import { useAuthStore } from '@/features/auth/store';
import { useBrowseSearch } from '@/features/browse/hooks';
import { useFeed } from '@/features/feed/hooks';
import { router } from '@/lib/navigation/router';
import type { Post, UserSummary } from '@/lib/types/domain';
import { useResponsiveMetrics } from '@/lib/ui/responsive';
import { getDisplayPost, getPrimaryMedia, isRenderablePost } from '@/lib/utils/post';

const formatCompact = (value: number | undefined) => {
  const count = value ?? 0;
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return `${count}`;
};

const displayName = (user?: UserSummary | null) => user?.name?.trim() || user?.username?.trim() || 'Creator';

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const { contentMaxWidth, horizontalPadding } = useResponsiveMetrics();
  const me = useAuthStore((state) => state.user);
  const feed = useFeed();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const results = useBrowseSearch(query);
  const feedPosts = useMemo(
    () => (feed.data?.pages.flatMap((page) => page.posts) ?? []).filter(isRenderablePost),
    [feed.data],
  );
  const billboardUsers = useMemo(() => {
    const seen = new Set<string>();
    const users = feedPosts
      .map((post) => post.user)
      .filter((user): user is UserSummary => Boolean(user?.id || user?.username))
      .filter((user) => {
        const key = user.id ?? user.username;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    return users.slice(0, 4);
  }, [feedPosts]);
  const featuredPost = feedPosts[0] ?? results.data?.posts?.[0] ?? null;
  const searchUsers = results.data?.users ?? [];
  const searchPosts = results.data?.posts ?? [];
  const showResults = query.length > 1;

  return (
    <SwipeTabsView>
      <View style={styles.container}>
        <View style={[styles.pageShell, contentMaxWidth ? { maxWidth: contentMaxWidth } : null]}>
          <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.content,
                  {
                    paddingTop: insets.top + 28,
                    paddingHorizontal: horizontalPadding,
                  },
                ]}>
            <View style={styles.header}>
              <Avatar uri={me?.avatar} name={me?.name ?? 'You'} size={38} />
              <Text style={styles.title}>Discover</Text>
              <Pressable style={styles.headerSearchBtn}>
                <Search size={19} stroke={AppColors.white} />
              </Pressable>
            </View>

            <View style={styles.searchWrap}>
              <Search size={18} stroke="rgba(255,255,255,0.48)" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search creators, ads, or sounds..."
                placeholderTextColor="rgba(255,255,255,0.42)"
                style={styles.searchInput}
                autoCapitalize="none"
              />
            </View>

            <Pressable style={styles.kwatiChip} onPress={() => router.push('KwatiAi')}>
              <View style={styles.kwatiChipIcon}>
                <FontAwesome6 name="fingerprint" size={17} color={AppColors.white} />
              </View>
              <Text style={styles.kwatiChipText}>Kwati AI</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Billboard</Text>
            <View style={styles.billboardGrid}>
              {(billboardUsers.length ? billboardUsers : [me, undefined, me, undefined]).slice(0, 4).map((user, index) => (
                <BillboardCard
                  key={`${user?.id ?? 'placeholder'}-${index}`}
                  user={user}
                  index={index}
                  onPress={() => {
                    if (!user?.username) return;
                    router.push('ProfileByUsername', { username: user.username });
                  }}
                />
              ))}
            </View>

            {featuredPost ? <FeaturedPost post={featuredPost} /> : null}

            {showResults ? (
              <View style={styles.resultsBlock}>
                <Text style={styles.resultsTitle}>{results.isFetching ? 'Searching...' : 'Search results'}</Text>
                {searchUsers.length ? (
                  <View style={styles.peopleList}>
                    {searchUsers.slice(0, 6).map((user) => (
                      <Pressable
                        key={user.id}
                        style={styles.resultUserRow}
                        onPress={() => router.push('ProfileByUsername', { username: user.username })}>
                        <Avatar uri={user.avatar} name={user.name} size={36} />
                        <View style={styles.resultUserText}>
                          <Text style={styles.resultUserName}>{user.name}</Text>
                          <Text style={styles.resultUserHandle}>@{user.username}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                ) : null}

                <FlatList
                  scrollEnabled={false}
                  data={searchPosts.slice(0, 5)}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.resultPostList}
                  renderItem={({ item }) => <ResultPostRow post={item} />}
                  ListEmptyComponent={
                    results.isFetching ? null : <Text style={styles.emptyText}>No posts found for this search.</Text>
                  }
                />
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </SwipeTabsView>
  );
}

const BillboardCard = ({ user, index, onPress }: { user?: UserSummary | null; index: number; onPress: () => void }) => {
  const name = displayName(user);
  const title = index === 1 ? 'Zirka\nEvent' : name.replace(/\s+/, '\n');
  const subtitle = index === 1 ? 'Most Engage Host' : 'Fall of Humanity';
  const gradient = index === 3 ? ['#211B31', '#121722'] : index === 1 ? ['#202A2D', '#111927'] : ['#1B2630', '#111621'];

  return (
    <Pressable style={styles.billboardCard} onPress={onPress}>
      <LinearGradient colors={gradient as [string, string]} style={StyleSheet.absoluteFill} />
      <Text style={styles.billboardName} numberOfLines={2}>{title}</Text>
      <Text style={styles.billboardSub} numberOfLines={1}>{subtitle}</Text>
      {index !== 1 ? (
        <View style={styles.billboardActions}>
          <View style={styles.billboardIcon}>
            <Phone size={15} stroke={AppColors.white} />
          </View>
          <View style={styles.billboardIcon}>
            <Video size={15} stroke={AppColors.white} />
          </View>
        </View>
      ) : null}
    </Pressable>
  );
};

const FeaturedPost = ({ post }: { post: Post }) => {
  const displayPost = getDisplayPost(post);
  const media = getPrimaryMedia(displayPost);
  const imageUri = media?.thumbnail_url ?? media?.url ?? media?.path;

  return (
    <Pressable
      style={styles.featuredCard}
      onPress={() => router.push('PostDetail', { postId: post.id })}>
      {imageUri ? (
        <ExpoImage source={{ uri: imageUri }} style={styles.featuredImage} contentFit="cover" />
      ) : (
        <LinearGradient colors={['#173122', '#09111E']} style={styles.featuredImage} />
      )}
      <View style={styles.earnPill}>
        <Text style={styles.earnText}>Earn ₦0.80</Text>
      </View>
      <View style={styles.featuredPlus}>
        <Text style={styles.featuredPlusText}>+</Text>
      </View>
      <View style={styles.featuredViews}>
        <FontAwesome6 name="eye" size={10} color={AppColors.white} />
        <Text style={styles.featuredViewsText}>{formatCompact(post.view_count)}</Text>
      </View>
    </Pressable>
  );
};

const ResultPostRow = ({ post }: { post: Post }) => {
  const displayPost = getDisplayPost(post);
  const media = getPrimaryMedia(displayPost);
  const imageUri = media?.thumbnail_url ?? media?.url ?? media?.path;

  return (
    <Pressable
      style={styles.resultPostRow}
      onPress={() => router.push('PostDetail', { postId: post.id })}>
      {imageUri ? <ExpoImage source={{ uri: imageUri }} style={styles.resultPostThumb} contentFit="cover" /> : <View style={styles.resultPostThumb} />}
      <View style={styles.resultPostText}>
        <Text style={styles.resultPostTitle} numberOfLines={1}>{post.user?.name ?? 'KaraAds post'}</Text>
        <Text style={styles.resultPostMeta} numberOfLines={2}>{post.content ?? displayPost.content ?? 'View post'}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020712',
  },
  pageShell: {
    width: '100%',
    flex: 1,
    alignSelf: 'center',
    backgroundColor: '#09111E',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.14)',
  },
  content: {
    paddingBottom: 150,
  },
  kwatiDashboard: {
    flex: 1,
    backgroundColor: '#0A1220',
  },
  kwatiHeader: {
    minHeight: 108,
    marginHorizontal: 14,
    marginTop: 0,
    borderRadius: 28,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0,216,255,0.24)',
    overflow: 'hidden',
  },
  kwatiBackBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  kwatiHeaderTitleWrap: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  kwatiStatusPill: {
    minHeight: 20,
    borderRadius: 10,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,216,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(0,216,255,0.24)',
  },
  kwatiStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#35F6FF',
  },
  kwatiStatusText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 8,
    fontFamily: undefined, fontWeight: '800',
  },
  kwatiHeaderTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontFamily: undefined, fontWeight: '800',
  },
  kwatiHeaderSubtitle: {
    color: 'rgba(255,255,255,0.60)',
    fontSize: 10,
    fontFamily: undefined, fontWeight: '700',
  },
  kwatiLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,216,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(139,244,255,0.44)',
  },
  kwatiLogoK: {
    position: 'absolute',
    bottom: 6,
    color: AppColors.white,
    fontSize: 11,
    fontFamily: undefined, fontWeight: '800',
  },
  kwatiScroll: {
    flex: 1,
  },
  kwatiScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 28,
  },
  kwatiAskCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,216,255,0.24)',
    padding: 24,
    gap: 15,
    overflow: 'hidden',
  },
  kwatiAskTitle: {
    color: AppColors.white,
    fontSize: 17,
    fontFamily: undefined, fontWeight: '800',
  },
  kwatiAskCopy: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 15,
    lineHeight: 25,
    fontFamily: undefined, fontWeight: '400',
  },
  kwatiPromptPill: {
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  kwatiPromptPillText: {
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: undefined, fontWeight: '800',
  },
  kwatiMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  kwatiMessageLogo: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,216,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(0,216,255,0.35)',
  },
  kwatiMessageLogoK: {
    position: 'absolute',
    bottom: 7,
    color: AppColors.white,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '800',
  },
  kwatiMessageBubble: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.055)',
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  kwatiMessageText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    lineHeight: 25,
    fontFamily: undefined, fontWeight: '400',
  },
  kwatiInputBar: {
    minHeight: 112,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 24,
    paddingTop: 24,
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'rgba(15,16,32,0.92)',
  },
  kwatiInput: {
    flex: 1,
    height: 60,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.045)',
    color: AppColors.white,
    paddingHorizontal: 18,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '600',
  },
  kwatiSendBtn: {
    width: 60,
    height: 60,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,216,255,0.28)',
  },
  header: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: AppColors.white,
    fontSize: 18,
    fontFamily: undefined, fontWeight: '800',
  },
  headerSearchBtn: {
    width: 39,
    height: 39,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  searchWrap: {
    height: 45,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  searchInput: {
    flex: 1,
    color: AppColors.white,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '700',
    minWidth: 0,
  },
  kwatiChip: {
    alignSelf: 'flex-start',
    minHeight: 42,
    borderRadius: 21,
    paddingLeft: 10,
    paddingRight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    backgroundColor: 'rgba(0,216,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0,216,255,0.32)',
  },
  kwatiChipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,216,255,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  kwatiChipText: {
    color: AppColors.white,
    fontSize: 16,
    fontFamily: undefined, fontWeight: '800',
  },
  sectionTitle: {
    color: AppColors.white,
    fontSize: 23,
    fontFamily: undefined, fontWeight: '800',
    marginTop: 42,
    marginBottom: 18,
  },
  billboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  billboardCard: {
    width: '47%',
    aspectRatio: 0.96,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    padding: 18,
    justifyContent: 'space-between',
  },
  billboardName: {
    color: AppColors.white,
    fontSize: 17,
    lineHeight: 21,
    fontFamily: undefined, fontWeight: '800',
  },
  billboardSub: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: undefined, fontWeight: '600',
  },
  billboardActions: {
    position: 'absolute',
    right: 14,
    top: 34,
    gap: 10,
  },
  billboardIcon: {
    width: 31,
    height: 31,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  featuredCard: {
    height: 244,
    marginTop: 32,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
  },
  earnPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    minHeight: 30,
    paddingHorizontal: 16,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16C9FF',
  },
  earnText: {
    color: AppColors.white,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '800',
  },
  featuredPlus: {
    position: 'absolute',
    right: 12,
    bottom: 60,
    width: 55,
    height: 55,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.86)',
  },
  featuredPlusText: {
    color: '#060B12',
    fontSize: 30,
    fontFamily: undefined, fontWeight: '800',
    marginTop: -3,
  },
  featuredViews: {
    position: 'absolute',
    right: 14,
    bottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredViewsText: {
    color: AppColors.white,
    fontSize: 11,
    fontFamily: undefined, fontWeight: '800',
  },
  resultsBlock: {
    marginTop: 24,
    gap: 12,
  },
  resultsTitle: {
    color: AppColors.white,
    fontSize: 18,
    fontFamily: undefined, fontWeight: '800',
  },
  peopleList: {
    gap: 9,
  },
  resultUserRow: {
    minHeight: 58,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  resultUserText: {
    flex: 1,
    minWidth: 0,
  },
  resultUserName: {
    color: AppColors.white,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '800',
  },
  resultUserHandle: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 12,
    fontFamily: undefined, fontWeight: '600',
  },
  resultPostList: {
    gap: 9,
  },
  resultPostRow: {
    minHeight: 70,
    borderRadius: 16,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  resultPostThumb: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#172033',
  },
  resultPostText: {
    flex: 1,
    minWidth: 0,
  },
  resultPostTitle: {
    color: AppColors.white,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '800',
  },
  resultPostMeta: {
    color: 'rgba(255,255,255,0.60)',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: undefined, fontWeight: '600',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.48)',
    textAlign: 'center',
    paddingVertical: 12,
    fontFamily: undefined, fontWeight: '600',
  },
});
