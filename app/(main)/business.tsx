import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { ArrowLeft, BriefcaseBusiness, Heart, ImagePlus, MessageCircle, MoreHorizontal, Plus, Repeat2, Search, Share2, UserPlus, Users } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors, AppRadii } from '@/constants/app-theme';
import { useMyBusinessPage } from '@/features/business/hooks';
import { router } from '@/lib/navigation/router';

const formatCompact = (value?: number) => {
  const count = Number(value ?? 0);
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return `${count}`;
};

const getPostImage = (post: { media?: Array<{ url?: string; path?: string; thumbnail_url?: string }> }) =>
  post.media?.find((item) => item.thumbnail_url || item.url || item.path)?.thumbnail_url ??
  post.media?.find((item) => item.thumbnail_url || item.url || item.path)?.url ??
  post.media?.find((item) => item.thumbnail_url || item.url || item.path)?.path;

const formatPostTime = (createdAt?: string) => {
  if (!createdAt) return 'now';
  const createdMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdMs)) return 'now';
  const diff = Math.max(0, Date.now() - createdMs);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'now';
  if (diff < hour) return `${Math.floor(diff / minute)}m`;
  if (diff < day) return `${Math.floor(diff / hour)}h`;
  return `${Math.floor(diff / day)}d`;
};

export default function BusinessPageScreen() {
  const insets = useSafeAreaInsets();
  const businessPage = useMyBusinessPage();
  const page = businessPage.data;
  const posts = page?.posts ?? [];
  const pageName = page?.name ?? 'Business Page';
  const category = (page?.category ?? 'Tech').toUpperCase();
  const openPagePostComposer = () => router.push('BusinessPostCreate');

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 120 }]}>
        <View style={styles.pageCard}>
          <View style={styles.coverFrame}>
            {page?.cover ? <Image source={{ uri: page.cover }} style={styles.heroCover} contentFit="cover" /> : null}
            <LinearGradient colors={['rgba(4,9,18,0.02)', 'rgba(4,9,18,0.12)', 'rgba(7,12,26,0.45)']} style={StyleSheet.absoluteFill} />
            <View style={styles.coverNav}>
              <Pressable style={styles.coverIconBtn} onPress={() => router.back()}>
                <ArrowLeft size={18} stroke={AppColors.textPrimary} />
              </Pressable>
              <View style={styles.coverRightActions}>
                <Pressable style={styles.coverIconBtn}>
                <Search size={17} stroke={AppColors.textPrimary} />
                </Pressable>
                <Pressable style={styles.coverIconBtn}>
                  <MoreHorizontal size={18} stroke={AppColors.textPrimary} />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.pageInfo}>
            <View style={styles.logoWrap}>
              {page?.avatar ? (
                <Image source={{ uri: page.avatar }} style={styles.logoImage} contentFit="cover" />
              ) : (
                <Text style={styles.logoFallback}>{pageName.slice(0, 2).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.identityBlock}>
              <Text style={styles.category}>{category}</Text>
              <Text style={styles.businessName} numberOfLines={1}>{pageName}</Text>
              <View style={styles.followerRow}>
                <Users size={20} stroke={AppColors.textMuted} />
                <Text style={styles.followersText}>{formatCompact(page?.followers_count ?? 0)} followers</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable style={styles.primaryAction} onPress={openPagePostComposer}>
                <Text style={styles.primaryActionText}>Post as page</Text>
              </Pressable>
              <Pressable style={styles.secondaryAction} onPress={() => router.push('MainTabs', { screen: 'Messages' })}>
                <UserPlus size={20} stroke={AppColors.textPrimary} />
                <Text style={styles.secondaryActionText}>Invite people</Text>
              </Pressable>
            </View>

            <View style={styles.secondaryRow}>
              <Pressable style={styles.myPagesBtn} onPress={() => router.push('MainTabs', { screen: 'Messages' })}>
                <Text style={styles.myPagesText}>My pages</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.bioStrip}>
            <Text style={styles.bioText}>{page?.description ?? 'software'}</Text>
          </View>
        </View>

        <Pressable style={styles.composerCard} onPress={openPagePostComposer}>
          <View style={styles.composerLogo}>
            {page?.avatar ? <Image source={{ uri: page.avatar }} style={styles.composerLogoImage} contentFit="cover" /> : <BriefcaseBusiness size={22} stroke={AppColors.accent} />}
          </View>
          <View style={styles.composerBody}>
            <Text style={styles.composerTitle}>Post as {pageName}</Text>
            <Text style={styles.composerPlaceholder}>Write something for your page...</Text>
          </View>
          <View style={styles.composerAction}>
            <Plus size={20} stroke="#07101D" />
          </View>
        </Pressable>

        <View style={styles.postsList}>
          {posts.slice(0, 6).map((post, index) => (
            <View key={post.id} style={styles.feedCard}>
              <View style={styles.postHeader}>
                <View style={styles.postPageLogo}>
                  {page?.avatar ? <Image source={{ uri: page.avatar }} style={styles.postPageLogoImage} contentFit="cover" /> : <BriefcaseBusiness size={18} stroke={AppColors.accent} />}
                </View>
                <View style={styles.postHeaderText}>
                  <Text style={styles.postPageName} numberOfLines={1}>{pageName}</Text>
                  <Text style={styles.postTime}>{formatPostTime(post.created_at)} · Page post</Text>
                </View>
                <Pressable style={styles.postMoreBtn}>
                  <MoreHorizontal size={19} stroke={AppColors.textMuted} />
                </Pressable>
              </View>

              {post.content ? <Text style={styles.postBodyText}>{post.content}</Text> : null}

              {getPostImage(post) ? (
                <View style={styles.postMediaFrame}>
                  <Image source={{ uri: getPostImage(post) }} style={styles.postMedia} contentFit="cover" />
                  <View style={styles.mediaCountPill}>
                    <Text style={styles.mediaCountText}>{index + 1}/{Math.max(posts.length, 1)}</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.postStatsRow}>
                <Text style={styles.postStatsText}>{formatCompact(post.like_count)} likes</Text>
                <Text style={styles.postStatsText}>{formatCompact(post.comment_count)} comments</Text>
                <Text style={styles.postStatsText}>{formatCompact(post.view_count)} views</Text>
              </View>

              <View style={styles.postActionRow}>
                <Pressable style={styles.postActionBtn}>
                  <Heart size={18} stroke={AppColors.textPrimary} />
                  <Text style={styles.postActionText}>Like</Text>
                </Pressable>
                <Pressable style={styles.postActionBtn}>
                  <MessageCircle size={18} stroke={AppColors.textPrimary} />
                  <Text style={styles.postActionText}>Comment</Text>
                </Pressable>
                <Pressable style={styles.postActionBtn}>
                  <Repeat2 size={18} stroke={AppColors.textPrimary} />
                  <Text style={styles.postActionText}>Repost</Text>
                </Pressable>
                <Pressable style={styles.postActionBtn}>
                  <Share2 size={18} stroke={AppColors.textPrimary} />
                  <Text style={styles.postActionText}>Share</Text>
                </Pressable>
              </View>
            </View>
          ))}
          {!posts.length ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No business posts yet</Text>
              <Text style={styles.emptyText}>{page ? 'Create your first page post.' : 'Create your business page details, then add posts.'}</Text>
              {!page ? (
                <Pressable style={styles.emptyAction} onPress={() => router.push('BusinessCreate')}>
                  <Text style={styles.emptyActionText}>Create Page</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.emptyAction} onPress={openPagePostComposer}>
                  <Text style={styles.emptyActionText}>Create Page Post</Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppColors.background },
  content: { paddingHorizontal: 14, gap: 20 },
  pageCard: {
    borderRadius: 34,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(67,78,112,0.72)',
    backgroundColor: '#090E1E',
  },
  coverFrame: {
    height: 250,
    backgroundColor: 'rgba(8,15,28,0.84)',
  },
  heroCover: { ...StyleSheet.absoluteFillObject },
  coverNav: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverRightActions: { flexDirection: 'row', gap: 8 },
  coverIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(4,9,18,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pageInfo: {
    paddingHorizontal: 28,
    paddingTop: 0,
    paddingBottom: 34,
  },
  logoWrap: {
    width: 138,
    height: 138,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.white,
    borderWidth: 3,
    borderColor: '#090D1C',
    marginTop: -94,
    marginLeft: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoFallback: {
    color: '#0B1020',
    fontSize: 38,
    fontFamily: undefined, fontWeight: '800',
  },
  identityBlock: {
    marginLeft: 166,
    marginTop: -105,
    minHeight: 112,
    justifyContent: 'center',
    gap: 7,
  },
  category: {
    color: '#7DEBFF',
    fontSize: 17,
    letterSpacing: 8,
    fontFamily: undefined, fontWeight: '800',
  },
  businessName: {
    color: AppColors.textPrimary,
    fontSize: 42,
    lineHeight: 47,
    fontFamily: undefined, fontWeight: '800',
  },
  followerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  followersText: {
    color: AppColors.textMuted,
    fontSize: 19,
    fontFamily: undefined, fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 30,
  },
  primaryAction: {
    flex: 1,
    minHeight: 62,
    borderRadius: AppRadii.pill,
    backgroundColor: '#13D7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: { color: '#07101D', fontSize: 19, fontFamily: undefined, fontWeight: '800' },
  secondaryAction: {
    flex: 1.42,
    minHeight: 62,
    borderRadius: AppRadii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  secondaryActionText: { color: AppColors.textPrimary, fontSize: 19, fontFamily: undefined, fontWeight: '800' },
  secondaryRow: { flexDirection: 'row', marginTop: 16 },
  myPagesBtn: {
    minHeight: 56,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  myPagesText: { color: AppColors.textPrimary, fontSize: 20, fontFamily: undefined, fontWeight: '700' },
  bioStrip: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  bioText: { color: AppColors.textSecondary, fontSize: 21, fontFamily: undefined, fontWeight: '600' },
  composerCard: {
    minHeight: 88,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(67,78,112,0.62)',
    backgroundColor: '#0B1020',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
  },
  composerLogo: {
    width: 54,
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  composerLogoImage: { width: '100%', height: '100%' },
  composerBody: { flex: 1, minWidth: 0, gap: 4 },
  composerTitle: { color: AppColors.textPrimary, fontSize: 15, fontFamily: undefined, fontWeight: '800' },
  composerPlaceholder: { color: AppColors.textMuted, fontSize: 14, fontFamily: undefined, fontWeight: '600' },
  composerAction: {
    width: 42,
    height: 42,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.accent,
  },
  postsList: { gap: 18 },
  feedCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(67,78,112,0.62)',
    backgroundColor: '#0B1020',
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  postPageLogo: {
    width: 46,
    height: 46,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  postPageLogoImage: { width: '100%', height: '100%' },
  postHeaderText: { flex: 1, minWidth: 0 },
  postPageName: { color: AppColors.textPrimary, fontSize: 16, fontFamily: undefined, fontWeight: '800' },
  postTime: { color: AppColors.textMuted, fontSize: 12, marginTop: 2, fontFamily: undefined, fontWeight: '600' },
  postMoreBtn: { width: 34, height: 34, borderRadius: AppRadii.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  postBodyText: { color: AppColors.textPrimary, fontSize: 15, lineHeight: 21, paddingHorizontal: 16, paddingBottom: 12, fontFamily: undefined, fontWeight: '600' },
  postMediaFrame: {
    minHeight: 230,
    backgroundColor: 'rgba(8,15,28,0.84)',
  },
  postMedia: { width: '100%', height: 270 },
  mediaCountPill: {
    position: 'absolute',
    top: 22,
    right: 22,
    minHeight: 44,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6,10,21,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  mediaCountText: { color: AppColors.textPrimary, fontSize: 16, fontFamily: undefined, fontWeight: '800' },
  textOnlyPost: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 },
  textOnlyPostText: { color: AppColors.textPrimary, fontSize: 20, lineHeight: 27, textAlign: 'center', fontFamily: undefined, fontWeight: '800' },
  postStatsRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  postStatsText: { color: AppColors.textMuted, fontSize: 12, fontFamily: undefined, fontWeight: '700' },
  postActionRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  postActionBtn: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  postActionText: { color: AppColors.textPrimary, fontSize: 12, fontFamily: undefined, fontWeight: '800' },
  emptyCard: { borderRadius: 24, padding: 18, backgroundColor: '#0B1020', borderWidth: 1, borderColor: 'rgba(67,78,112,0.62)', gap: 6 },
  emptyTitle: { color: AppColors.textPrimary, fontSize: 14, fontFamily: undefined, fontWeight: '800' },
  emptyText: { color: AppColors.textMuted, fontSize: 12, lineHeight: 17, fontFamily: undefined, fontWeight: '600' },
  emptyAction: { alignSelf: 'flex-start', minHeight: 36, borderRadius: AppRadii.pill, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.accent, marginTop: 6 },
  emptyActionText: { color: '#07101D', fontSize: 13, fontFamily: undefined, fontWeight: '800' },
});
