import { useIsFocused } from '@react-navigation/native';
import { useEvent } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Bookmark, Ellipsis, Heart, MessageCircle, Play, Repeat2, Share2, Video } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Share as NativeShare,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SwipeTabsView } from '@/components/navigation/swipe-tabs-view';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AppColors, AppRadii } from '@/constants/app-theme';
import { useAuthStore } from '@/features/auth/store';
import { useAddComment, useDeletePost, useLikeToggle, usePostComments, useSaveToggle } from '@/features/feed/hooks';
import { useMoments } from '@/features/moment/hooks';
import { momentService } from '@/features/moment/service';
import { useFollowToggle } from '@/features/profile/hooks';
import { router, useLocalSearchParams } from '@/lib/navigation/router';
import { postCacheStorage } from '@/lib/storage/post-cache';
import { appKeyValueStorage } from '@/lib/storage/secure-store';
import type { Comment, MomentPost } from '@/lib/types/domain';
import { getDisplayPost, getPrimaryMedia, hasRenderableMedia, isMomentPost } from '@/lib/utils/post';

const MOMENT_CAPTION_TRIM_LENGTH = 120;

const SPONSORED_MIN_GAP = 3;
const SPONSORED_MAX_GAP = 6;

const hashSeed = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
};

const interleaveSponsoredMoments = (moments: MomentPost[]): MomentPost[] => {
  const sponsored = moments.filter((m) => (m.type ?? '').toLowerCase() === 'ad');
  const regular = moments.filter((m) => (m.type ?? '').toLowerCase() !== 'ad');
  if (!sponsored.length || !regular.length) return moments;

  const seedSource = moments.map((m) => m.id).join('|');
  let seed = hashSeed(seedSource);
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const nextGap = () => SPONSORED_MIN_GAP + Math.floor(rand() * (SPONSORED_MAX_GAP - SPONSORED_MIN_GAP + 1));

  const result: MomentPost[] = [];
  let adIndex = 0;
  let counter = 0;
  let insertionGap = nextGap();

  regular.forEach((m) => {
    result.push(m);
    counter++;
    if (adIndex < sponsored.length && counter >= insertionGap) {
      result.push(sponsored[adIndex]);
      adIndex++;
      counter = 0;
      insertionGap = nextGap();
    }
  });

  return result;
};

const isFriendUser = (user: MomentPost['user'] | undefined) => {
  if (!user) return false;
  const relation = user as Record<string, unknown>;
  const isFollowing = Boolean(user.is_following ?? relation.is_following ?? relation.following);
  const isFollowerOfMe = Boolean(relation.is_follower ?? relation.follows_you ?? relation.is_followed_by);
  return Boolean(isFollowing || isFollowerOfMe);
};

const formatCompact = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${Math.max(0, value)}`;
};

const getMomentViewsStorageKey = (userId: string | undefined): string => `karaads_moment_views_${userId ?? 'guest'}`;

export default function MomentScreen() {
  const params = useLocalSearchParams<{ pinPostId?: string }>();
  const pinPostId = Array.isArray(params.pinPostId) ? params.pinPostId[0] : params.pinPostId;
  const { height: viewportHeight } = useWindowDimensions();
  const isScreenFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const sessionUser = useAuthStore((state) => state.user);
  const [listHeight, setListHeight] = useState(viewportHeight);
  const momentsQuery = useMoments();
  const deletePost = useDeletePost();
  const [deletingMomentId, setDeletingMomentId] = useState<string | null>(null);
  const [feedTab, setFeedTab] = useState<'for-you' | 'following'>('for-you');
  const [activeMomentId, setActiveMomentId] = useState<string | null>(null);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [viewedMomentIds, setViewedMomentIds] = useState<Set<string>>(new Set());
  const [viewsReady, setViewsReady] = useState(false);
  const playbackControlsRef = useRef(new Map<string, { pause: () => void }>());
  const allMoments = useMemo(() => {
    const seen = new Set<string>();
    const pages = momentsQuery.data?.pages ?? [];
    return pages.flatMap((page) =>
      page.moments.filter((item) => {
        if (!item?.id || seen.has(item.id)) {
          return false;
        }
        seen.add(item.id);
        if (!hasRenderableMedia(item)) {
          return false;
        }
        return page.source === 'moments' || page.source === 'cache' ? true : isMomentPost(item);
      }),
    );
  }, [momentsQuery.data]);

  const moments = useMemo(() => {
    let filtered: MomentPost[];
    if (feedTab === 'for-you') {
      filtered = allMoments;
    } else {
      filtered = allMoments.filter((item) => {
        const postUser = item.user;
        if (!postUser) return false;
        if (postUser.id && sessionUser?.id && postUser.id === sessionUser.id) return true;
        const relation = postUser as Record<string, unknown>;
        const isFollowing = Boolean(postUser.is_following ?? relation.is_following ?? relation.following);
        const isFollowerOfCurrentUser = Boolean(relation.is_follower ?? relation.follows_you ?? relation.is_followed_by);
        return Boolean(isFollowing || isFollowerOfCurrentUser);
      });
    }
    const ordered = (() => {
      if (!pinPostId) return filtered;
      const pinned = filtered.find((item) => item.id === pinPostId);
      if (!pinned) return filtered;
      return [pinned, ...filtered.filter((item) => item.id !== pinPostId)];
    })();
    return interleaveSponsoredMoments(ordered);
  }, [allMoments, feedTab, pinPostId, sessionUser?.id]);

  const momentById = useMemo(() => new Map(moments.map((item) => [item.id, item])), [moments]);
  const viewsStorageKey = useMemo(() => getMomentViewsStorageKey(sessionUser?.id), [sessionUser?.id]);

  useEffect(() => {
    let cancelled = false;
    setViewsReady(false);
    appKeyValueStorage
      .getItem(viewsStorageKey)
      .then((raw) => {
        if (cancelled) return;
        if (!raw) {
          setViewedMomentIds(new Set());
          return;
        }
        try {
          const parsed = JSON.parse(raw) as unknown;
          const ids = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
          setViewedMomentIds(new Set(ids));
        } catch {
          setViewedMomentIds(new Set());
        }
      })
      .finally(() => {
        if (!cancelled) setViewsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [viewsStorageKey]);

  useEffect(() => {
    if (!viewsReady) return;
    const payload = JSON.stringify(Array.from(viewedMomentIds));
    appKeyValueStorage.setItem(viewsStorageKey, payload).catch(() => undefined);
  }, [viewedMomentIds, viewsReady, viewsStorageKey]);

  useEffect(() => {
    setViewCounts((previous) => {
      const next = { ...previous };
      moments.forEach((item) => {
        const baseCount = Math.max(item.view_count ?? 0, 0);
        next[item.id] = Math.max(next[item.id] ?? 0, baseCount);
      });
      return next;
    });
  }, [moments]);

  useEffect(() => {
    if (!isScreenFocused || !viewsReady || !activeMomentId) return;
    if (viewedMomentIds.has(activeMomentId)) return;

    setViewedMomentIds((previous) => {
      const next = new Set(previous);
      next.add(activeMomentId);
      return next;
    });

    const baseCount = Math.max(momentById.get(activeMomentId)?.view_count ?? 0, 0);
    setViewCounts((previous) => ({
      ...previous,
      [activeMomentId]: Math.max((previous[activeMomentId] ?? 0) + 1, baseCount + 1),
    }));

    momentService
      .recordView(activeMomentId)
      .then((serverViewCount) => {
        if (typeof serverViewCount !== 'number') return;
        setViewCounts((previous) => ({
          ...previous,
          [activeMomentId]: Math.max(previous[activeMomentId] ?? 0, serverViewCount),
        }));
      })
      .catch(() => undefined);
  }, [activeMomentId, isScreenFocused, momentById, viewedMomentIds, viewsReady]);

  useEffect(() => {
    if (!sessionUser?.id || !activeMomentId) {
      return;
    }

    const activeMoment = momentById.get(activeMomentId);
    if (!activeMoment) {
      return;
    }

    postCacheStorage.rememberViewedMoment(sessionUser.id, activeMoment).catch(() => undefined);
  }, [activeMomentId, momentById, sessionUser?.id]);

  const pauseNonActivePlayers = useCallback((activeId: string | null) => {
    playbackControlsRef.current.forEach((control, id) => {
      if (!activeId || id !== activeId) {
        control.pause();
      }
    });
  }, []);

  const onRegisterPlaybackControl = useCallback((id: string, control: { pause: () => void }) => {
    playbackControlsRef.current.set(id, control);
    return () => {
      playbackControlsRef.current.delete(id);
    };
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: { item: MomentPost; isViewable?: boolean }[] }) => {
    const next = viewableItems.find((entry) => entry?.isViewable && entry?.item?.id)?.item?.id ?? null;
    setActiveMomentId(next);
    playbackControlsRef.current.forEach((control, id) => {
      if (!next || id !== next) {
        control.pause();
      }
    });
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 85 }).current;

  useEffect(() => {
    if (!activeMomentId && moments.length > 0) {
      setActiveMomentId(moments[0].id);
    }
  }, [activeMomentId, moments]);

  useEffect(() => {
    if (!pinPostId) return;
    const target = moments.find((item) => item.id === pinPostId);
    if (!target) return;
    setActiveMomentId(target.id);
    router.setParams({ pinPostId: undefined });
  }, [moments, pinPostId]);

  useEffect(() => {
    setActiveMomentId(moments[0]?.id ?? null);
  }, [feedTab, moments]);

  useEffect(() => {
    if (!isScreenFocused) {
      pauseNonActivePlayers(null);
      return;
    }
    pauseNonActivePlayers(activeMomentId);
  }, [activeMomentId, isScreenFocused, pauseNonActivePlayers]);

  const onDeleteMoment = async (momentId: string) => {
    setDeletingMomentId(momentId);
    try {
      await deletePost.mutateAsync(momentId);
    } catch {
      Alert.alert('Delete failed', 'Unable to delete this moment right now.');
    } finally {
      setDeletingMomentId(null);
    }
  };

  if (momentsQuery.isLoading) {
    return (
      <SwipeTabsView>
        <View style={styles.loader}>
          <Skeleton width="100%" height={viewportHeight} radius={0} />
        </View>
      </SwipeTabsView>
    );
  }

  return (
    <SwipeTabsView>
      <View style={{ flex: 1 }}>
        <View style={[styles.momentHeader, { paddingTop: insets.top + 8 }]}>
          <View style={styles.momentTabs}>
            <Pressable
              style={[styles.switchPill, feedTab === 'for-you' && styles.switchPillActive]}
              onPress={() => setFeedTab('for-you')}>
              <Text style={[styles.switchText, feedTab === 'for-you' && styles.switchTextActive]}>For You</Text>
            </Pressable>
            <Pressable
              style={[styles.switchPill, feedTab === 'following' && styles.switchPillActive]}
              onPress={() => setFeedTab('following')}>
              <Text style={[styles.switchText, feedTab === 'following' && styles.switchTextActive]}>Following</Text>
            </Pressable>
          </View>
          <Pressable
            style={styles.addPostButton}
            onPress={() => router.push('PostsCreate', { mode: 'moment' })}>
            <Video size={17} stroke={AppColors.white} />
            <View style={styles.addPostPlus}>
              <Text style={styles.addPostPlusText}>+</Text>
            </View>
          </Pressable>
        </View>
        <FlatList
          data={moments}
          keyExtractor={(item) => item.id}
          extraData={`${activeMomentId ?? 'none'}:${isScreenFocused ? '1' : '0'}`}
          onLayout={(event) => {
            const nextHeight = Math.max(1, Math.round(event.nativeEvent.layout.height));
            if (nextHeight !== listHeight) {
              setListHeight(nextHeight);
            }
          }}
          pagingEnabled
          snapToInterval={listHeight}
          decelerationRate="fast"
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={2}
          removeClippedSubviews
          getItemLayout={(_, index) => ({
            length: listHeight,
            offset: listHeight * index,
            index,
          })}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onEndReachedThreshold={0.6}
          onEndReached={() => {
            if (momentsQuery.hasNextPage && !momentsQuery.isFetchingNextPage) {
              momentsQuery.fetchNextPage();
            }
          }}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.y / listHeight);
            const next = moments[index]?.id ?? null;
            setActiveMomentId(next);
            pauseNonActivePlayers(next);
          }}
          renderItem={({ item }) => (
            <MomentCard
              moment={item}
              viewportHeight={listHeight}
              isActive={activeMomentId === item.id}
              isScreenFocused={isScreenFocused}
              sessionUserId={sessionUser?.id}
              deletingMomentId={deletingMomentId}
              onDeleteMoment={onDeleteMoment}
              viewCount={viewCounts[item.id] ?? Math.max(item.view_count ?? 0, 0)}
              onRegisterPlaybackControl={onRegisterPlaybackControl}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {feedTab === 'following' ? 'No moments from people you follow yet.' : 'No moments available right now.'}
            </Text>
          }
        />
      </View>
    </SwipeTabsView>
  );
}

type MomentCardProps = {
  moment: MomentPost;
  viewportHeight: number;
  isActive: boolean;
  isScreenFocused: boolean;
  sessionUserId?: string;
  deletingMomentId: string | null;
  onDeleteMoment: (momentId: string) => Promise<void>;
  viewCount: number;
  onRegisterPlaybackControl: (id: string, control: { pause: () => void }) => () => void;
};

const MomentCard = ({
  moment,
  viewportHeight,
  isActive,
  isScreenFocused,
  sessionUserId,
  deletingMomentId,
  onDeleteMoment,
  viewCount,
  onRegisterPlaybackControl,
}: MomentCardProps) => {
  const insets = useSafeAreaInsets();
  const likeToggle = useLikeToggle();
  const followToggle = useFollowToggle();
  const saveToggle = useSaveToggle();
  const addComment = useAddComment(moment.id);
  const [commentOpen, setCommentOpen] = useState(false);
  const commentsQuery = usePostComments(moment.id, commentOpen);
  const displayPost = getDisplayPost(moment);
  const media = getPrimaryMedia(moment);
  const mediaUri = media?.url ?? media?.path;
  const mediaType = `${media?.type ?? media?.mime_type ?? ''}`.toLowerCase();
  const isVideo = mediaType.includes('video') || /\.(mp4|mov|m4v|webm|avi)$/i.test(mediaUri ?? '');
  const videoPlayer = useVideoPlayer(mediaUri ? { uri: mediaUri } : null, (player) => {
    player.loop = true;
    player.muted = false;
    player.timeUpdateEventInterval = 0.2;
    player.pause();
  });
  const { currentTime } = useEvent(videoPlayer, 'timeUpdate', {
    currentTime: 0,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    bufferedPosition: 0,
  });
  const { duration } = useEvent(videoPlayer, 'sourceLoad', {
    videoSource: null,
    duration: 0,
    availableVideoTracks: [],
    availableSubtitleTracks: [],
    availableAudioTracks: [],
  });
  const { status } = useEvent(videoPlayer, 'statusChange', { status: videoPlayer.status });
  const [paused, setPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(Boolean(moment.user_liked));
  const [likeCount, setLikeCount] = useState(Math.max(moment.like_count ?? 0, displayPost.like_count ?? 0));
  const [isReposted, setIsReposted] = useState(Boolean(moment.user_reshared));
  const [repostCount, setRepostCount] = useState(Math.max(moment.repost_count ?? 0, displayPost.repost_count ?? 0));
  const [isShared, setIsShared] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [isSaved, setIsSaved] = useState(Boolean(moment.user_saved));
  const [saveCount, setSaveCount] = useState(moment.save_count ?? 0);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentCount, setCommentCount] = useState(Math.max(moment.comment_count ?? 0, displayPost.comment_count ?? 0));
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFriendAuthor, setIsFriendAuthor] = useState(isFriendUser(displayPost.user ?? moment.user));
  const burstAnim = useRef(new Animated.Value(0)).current;
  const lastInitPostIdRef = useRef<string | null>(null);
  const lastTapRef = useRef(0);
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = duration > 0 ? Math.min(Math.max(currentTime / duration, 0), 1) : 0;
  const comments = commentsQuery.data ?? [];
  const isOwner = Boolean(displayPost.user?.id && sessionUserId && displayPost.user.id === sessionUserId);
  const isDeleting = deletingMomentId === moment.id;
  const shouldPlay = isVideo && isActive && isScreenFocused && !commentOpen;

  useEffect(() => {
    setIsFriendAuthor(isFriendUser(displayPost.user ?? moment.user));
  }, [displayPost.user, moment.id, moment.user]);
  const safePause = useCallback(() => {
    try {
      videoPlayer.pause();
    } catch {
      // no-op: player can be disposed during rapid screen transitions
    }
  }, [videoPlayer]);
  const safePlay = useCallback(() => {
    try {
      videoPlayer.play();
    } catch {
      // no-op: player can be disposed during rapid screen transitions
    }
  }, [videoPlayer]);

  useEffect(() => {
    if (!isVideo) return;
    const unregister = onRegisterPlaybackControl(moment.id, { pause: safePause });
    return unregister;
  }, [isVideo, moment.id, onRegisterPlaybackControl, safePause]);

  useEffect(() => {
    if (lastInitPostIdRef.current === moment.id) {
      return;
    }

    lastInitPostIdRef.current = moment.id;
    setIsLiked(Boolean(moment.user_liked));
    setLikeCount(Math.max(moment.like_count ?? 0, displayPost.like_count ?? 0));
    setIsReposted(Boolean(moment.user_reshared));
    setRepostCount(Math.max(moment.repost_count ?? 0, displayPost.repost_count ?? 0));
    setIsShared(false);
    setShareCount(0);
    setIsSaved(Boolean(moment.user_saved));
    setSaveCount(moment.save_count ?? 0);
    setCommentCount(Math.max(moment.comment_count ?? 0, displayPost.comment_count ?? 0));
    setCommentOpen(false);
    setCommentDraft('');
  }, [
    displayPost.like_count,
    displayPost.comment_count,
    displayPost.repost_count,
    moment.id,
    moment.like_count,
    moment.repost_count,
    moment.save_count,
    moment.comment_count,
    moment.user_liked,
    moment.user_reshared,
    moment.user_saved,
  ]);

  useEffect(() => {
    if (!isVideo) {
      return;
    }

    videoPlayer.muted = !shouldPlay;
    if (shouldPlay) {
      safePlay();
      setPaused(false);
      return;
    }

    safePause();
    setPaused(true);
  }, [isVideo, safePause, safePlay, shouldPlay, videoPlayer]);

  useEffect(() => {
    return () => {
      safePause();
    };
  }, [safePause]);

  useEffect(() => {
    return () => {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
      }
    };
    }, []);

  const toggleLike = () => {
    const current = isLiked;
    const next = !current;
    setIsLiked(next);
    setLikeCount((count) => Math.max(0, count + (next ? 1 : -1)));
    if (next) {
      burstAnim.setValue(0);
      Animated.sequence([
        Animated.timing(burstAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(burstAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
    likeToggle.mutate(
      { postId: moment.id, liked: current },
      {
        onError: () => {
          setIsLiked(current);
          setLikeCount((count) => Math.max(0, count + (current ? 1 : -1)));
        },
      },
    );
  };

  const toggleRepost = () => {
    setIsReposted((current) => {
      const next = !current;
      setRepostCount((count) => Math.max(0, count + (next ? 1 : -1)));
      return next;
    });
  };

  const onShare = async () => {
    if (isShared) {
      setIsShared(false);
      setShareCount((count) => Math.max(0, count - 1));
      return;
    }

    const result = await NativeShare.share({
      message: displayPost.content ?? moment.content ?? 'Check this moment on KaraAds',
      url: mediaUri,
    });

    if (result.action === NativeShare.sharedAction) {
      setIsShared(true);
      setShareCount((count) => count + 1);
    }
  };

  const onSendComment = async () => {
    const content = commentDraft.trim();
    if (!content) {
      return;
    }

    setCommentDraft('');
    await addComment.mutateAsync(content);
    setCommentCount((count) => Math.max(count + 1, comments.length + 1));
  };

  const toggleSave = () => {
    const current = isSaved;
    const next = !current;
    setIsSaved(next);
    setSaveCount((count) => Math.max(0, count + (next ? 1 : -1)));
    saveToggle.mutate(moment.id, {
      onError: () => {
        setIsSaved(current);
        setSaveCount((count) => Math.max(0, count + (current ? 1 : -1)));
      },
    });
  };

  const togglePlayPause = () => {
    if (!isVideo) {
      return;
    }

    if (videoPlayer.playing) {
      safePause();
      setPaused(true);
      return;
    }

    safePlay();
    setPaused(false);
  };

  const handleMediaTap = () => {
    if (!isVideo) {
      return;
    }

    const now = Date.now();
    const withinDoubleTap = now - lastTapRef.current < 250;

    if (withinDoubleTap) {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }

      toggleLike();
      lastTapRef.current = 0;
      return;
    }

    lastTapRef.current = now;
    singleTapTimerRef.current = setTimeout(() => {
      togglePlayPause();
      singleTapTimerRef.current = null;
    }, 240);
  };

  const onFollowAuthor = () => {
    const authorId = displayPost.user?.id ?? moment.user?.id;
    if (!authorId || isOwner || followToggle.isPending) return;
    const previous = isFriendAuthor;
    const next = !previous;
    setIsFriendAuthor(next);
    followToggle.mutate(
      { userId: authorId, isFollowing: previous },
      { onError: () => setIsFriendAuthor(previous) },
    );
  };

  return (
    <View style={[styles.frame, { height: viewportHeight }]}>
      <Pressable style={styles.mediaTouchLayer} onPress={handleMediaTap}>
        {isVideo ? (
          <VideoView style={styles.media} player={videoPlayer} nativeControls={false} contentFit="contain" />
        ) : (
          <Image source={{ uri: mediaUri }} style={styles.media} />
        )}
        {isVideo && status !== 'readyToPlay' ? (
          <View style={styles.videoLoading}>
            <ActivityIndicator color={AppColors.white} size="large" />
          </View>
        ) : null}
        {isVideo && paused ? (
          <View style={styles.pauseBadge}>
            <Play size={26} stroke={AppColors.white} fill="transparent" />
          </View>
        ) : null}
      </Pressable>
      {isVideo ? (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      ) : null}

      <View style={styles.overlay} pointerEvents="box-none">
        {isOwner ? (
          <Pressable style={[styles.moreButton, { top: insets.top + 8 }]} onPress={() => setMenuOpen(true)}>
            <Ellipsis size={16} stroke={AppColors.white} />
          </Pressable>
        ) : null}

        <View style={styles.bottomMeta}>
          <Pressable
            style={styles.authorRow}
            onPress={() => {
              const username = displayPost.user?.username ?? moment.user?.username;
              if (!username) return;
              router.push('ProfileByUsername', { username });
            }}>
            <Avatar uri={displayPost.user?.avatar ?? moment.user?.avatar} name={displayPost.user?.name ?? moment.user?.name} size={44} />
            <View style={styles.authorTextWrap}>
              <Text style={styles.authorName}>{displayPost.user?.name ?? moment.user?.name ?? 'Creator'}</Text>
              <View style={styles.authorHandleRow}>
                <Text style={styles.authorHandle}>@{displayPost.user?.username ?? moment.user?.username ?? 'unknown'}</Text>
                <Text style={styles.authorViews}>{formatCompact(viewCount)} views</Text>
              </View>
            </View>
          </Pressable>
          {!isOwner && (displayPost.user?.id ?? moment.user?.id) ? (
            <Pressable style={styles.followBtn} onPress={onFollowAuthor} disabled={followToggle.isPending}>
              <Text style={styles.followBtnText}>{followToggle.isPending ? '...' : isFriendAuthor ? 'Following' : 'Follow'}</Text>
            </Pressable>
          ) : null}

          {displayPost.content || moment.content ? (
            <ExpandableMomentCaption content={displayPost.content ?? moment.content ?? ''} />
          ) : null}
        </View>

        <View style={styles.rail}>
          <Pressable style={styles.railItem} onPress={toggleLike}>
            <View>
              <Heart size={22} stroke={isLiked ? AppColors.danger : AppColors.white} fill={isLiked ? AppColors.danger : 'transparent'} />
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.likeBurst,
                  {
                    opacity: burstAnim,
                    transform: [{ scale: burstAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.35] }) }],
                  },
                ]}
              />
            </View>
            <Text style={styles.railText}>{likeCount}</Text>
          </Pressable>
          <Pressable
            style={styles.railItem}
            onPress={() => setCommentOpen(true)}>
            <MessageCircle size={22} stroke={AppColors.white} />
            <Text style={styles.railText}>{commentCount}</Text>
          </Pressable>
          <Pressable style={styles.railItem} onPress={toggleRepost}>
            <Repeat2 size={22} stroke={isReposted ? AppColors.accent : AppColors.white} />
            <Text style={styles.railText}>{repostCount}</Text>
          </Pressable>
          <Pressable style={styles.railItem} onPress={onShare}>
            <Share2 size={22} stroke={isShared ? AppColors.accent : AppColors.white} />
            <Text style={styles.railText}>{shareCount}</Text>
          </Pressable>
          <Pressable style={styles.railItem} onPress={toggleSave}>
            <Bookmark size={22} stroke={isSaved ? AppColors.accent : AppColors.white} fill={isSaved ? AppColors.accent : 'transparent'} />
            <Text style={styles.railText}>{saveCount}</Text>
          </Pressable>
        </View>
      </View>

      {commentOpen ? (
        <View style={styles.commentOverlay} pointerEvents="box-none">
          <Pressable style={styles.commentOverlayBackdrop} onPress={() => setCommentOpen(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={70} style={styles.commentComposerWrap}>
            <View style={styles.commentSheet}>
              <View style={styles.commentSheetGrabberWrap}>
                <View style={styles.commentSheetGrabber} />
              </View>
              <View style={styles.commentSortRow}>
                <Text style={styles.commentSortText}>Most relevant</Text>
              </View>
              <View style={styles.commentSheetHeader}>
                <Text style={styles.commentSheetTitle}>Comments</Text>
                <Text style={styles.commentSheetMeta}>{Math.max(commentCount, comments.length)}</Text>
              </View>
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                style={styles.commentListView}
                contentContainerStyle={styles.commentList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => <CommentRow comment={item} />}
                ListEmptyComponent={
                  commentsQuery.isFetching ? (
                    <View style={styles.commentLoadingWrap}>
                      <ActivityIndicator color={AppColors.accent} />
                    </View>
                  ) : (
                    <Text style={styles.noComments}>No comments yet.</Text>
                  )
                }
              />
              <View style={[styles.commentComposer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                <TextInput
                  value={commentDraft}
                  onChangeText={setCommentDraft}
                  placeholder="Write a comment..."
                  placeholderTextColor={AppColors.textMuted}
                  style={styles.commentInput}
                  multiline
                />
                <Pressable style={styles.commentSend} onPress={onSendComment} disabled={!commentDraft.trim()}>
                  <Text style={styles.commentSendText}>Send</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      ) : null}

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.menuBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} />
          <View style={styles.menuCard}>
            <Pressable
              style={styles.menuItem}
              disabled={isDeleting}
              onPress={() => {
                setMenuOpen(false);
                Alert.alert('Delete moment', 'Are you sure you want to delete this moment?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      onDeleteMoment(moment.id).catch(() => undefined);
                    },
                  },
                ]);
              }}>
              <Text style={styles.menuDangerText}>{isDeleting ? 'Deleting...' : 'Delete moment'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const CommentRow = ({ comment }: { comment: Comment }) => {
  return (
    <View style={styles.commentRow}>
      <Avatar uri={comment.user?.avatar} name={comment.user?.name} size={32} />
      <View style={styles.commentBody}>
        <Text style={styles.commentUser}>{comment.user?.username ? `@${comment.user.username}` : 'user'}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
      </View>
    </View>
  );
};

const ExpandableMomentCaption = ({ content }: { content: string }) => {
  const [expanded, setExpanded] = useState(false);
  const trimmed = content.trim();
  const isLong = trimmed.length > MOMENT_CAPTION_TRIM_LENGTH;
  const preview = isLong ? `${trimmed.slice(0, MOMENT_CAPTION_TRIM_LENGTH).trimEnd()}...` : trimmed;

  if (!trimmed) return null;

  return (
    <Text style={styles.content}>
      {expanded || !isLong ? trimmed : preview}{' '}
      {!expanded && isLong ? (
        <Text style={styles.contentMore} onPress={() => setExpanded(true)}>
          see more
        </Text>
      ) : null}
    </Text>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.background,
  },
  frame: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#03050C',
  },
  media: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mediaTouchLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  videoLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '46%',
    width: 68,
    height: 68,
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 64,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5AB2FF',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  addPostButton: {
    width: 40,
    height: 40,
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(90,178,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },
  momentTabs: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  moreButton: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPostPlus: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 15,
    height: 15,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.accentStrong,
  },
  addPostPlusText: {
    color: AppColors.white,
    fontSize: 11,
    fontFamily: undefined, fontWeight: '700',
  },
  topSwitch: {
    paddingTop: 54,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  switchPill: {
    borderRadius: AppRadii.pill,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  switchPillActive: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: 'transparent',
  },
  switchText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontFamily: undefined, fontWeight: '600',
  },
  switchTextActive: {
    color: '#060C18',
    fontFamily: undefined, fontWeight: '700',
  },
  bottomMeta: {
    marginTop: 'auto',
    marginBottom: 86,
    gap: 10,
    paddingHorizontal: 4,
    paddingRight: 76,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorTextWrap: {
    gap: 2,
  },
  authorName: {
    color: AppColors.white,
    fontSize: 22,
    fontFamily: undefined, fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  authorHandle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    fontFamily: undefined, fontWeight: '400',
  },
  authorHandleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorViews: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontFamily: undefined, fontWeight: '600',
  },
  followBtn: {
    alignSelf: 'flex-start',
    minHeight: 32,
    borderRadius: AppRadii.pill,
    borderWidth: 1,
    borderColor: 'rgba(90,178,255,0.6)',
    backgroundColor: 'rgba(46,144,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  followBtnText: {
    color: AppColors.accent,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '700',
  },
  content: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 21,
    fontFamily: undefined, fontWeight: '400',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  contentMore: {
    color: '#90C9FF',
    fontSize: 14,
    fontFamily: undefined, fontWeight: '700',
  },
  rail: {
    position: 'absolute',
    right: 14,
    bottom: 86,
    alignItems: 'center',
    gap: 16,
  },
  railItem: {
    alignItems: 'center',
    gap: 5,
  },
  railText: {
    color: AppColors.white,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '600',
  },
  likeBurst: {
    position: 'absolute',
    left: -6,
    top: -6,
    width: 34,
    height: 34,
    borderRadius: AppRadii.pill,
    borderWidth: 2,
    borderColor: AppColors.danger,
  },
  commentOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  commentOverlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  commentComposerWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  commentSheet: {
    minHeight: 380,
    maxHeight: '78%',
    borderTopLeftRadius: AppRadii.xl,
    borderTopRightRadius: AppRadii.xl,
    backgroundColor: 'rgba(8,14,26,0.97)',
    borderTopWidth: 1,
    borderColor: 'rgba(46,144,255,0.2)',
  },
  commentSheetGrabberWrap: {
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSheetGrabber: {
    width: 56,
    height: 5,
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(90,178,255,0.35)',
  },
  commentSortRow: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  commentSortText: {
    color: AppColors.textPrimary,
    fontSize: 17,
    fontFamily: undefined, fontWeight: '700',
  },
  commentSheetHeader: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46,144,255,0.15)',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  commentSheetTitle: {
    color: AppColors.white,
    fontSize: 15,
    fontFamily: undefined, fontWeight: '700',
  },
  commentSheetMeta: {
    color: AppColors.textMuted,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '600',
  },
  commentListView: {
    flex: 1,
  },
  commentList: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentLoadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  noComments: {
    color: AppColors.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
    fontFamily: undefined, fontWeight: '400',
  },
  commentRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.12)',
    backgroundColor: 'rgba(14,22,38,0.7)',
    padding: 10,
  },
  commentBody: {
    flex: 1,
    gap: 4,
  },
  commentUser: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '700',
  },
  commentText: {
    color: AppColors.white,
    fontSize: 14,
    lineHeight: 19,
    flexShrink: 1,
    fontFamily: undefined, fontWeight: '400',
  },
  commentComposer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(46,144,255,0.15)',
    backgroundColor: 'rgba(8,14,26,0.97)',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  commentInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.25)',
    backgroundColor: 'rgba(14,22,38,0.8)',
    color: AppColors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: undefined, fontWeight: '400',
  },
  commentSend: {
    height: 48,
    minWidth: 68,
    borderRadius: AppRadii.md,
    backgroundColor: AppColors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  commentSendText: {
    color: AppColors.white,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '700',
  },
  empty: {
    color: AppColors.textMuted,
    textAlign: 'center',
    marginTop: 24,
    fontFamily: undefined, fontWeight: '400',
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCard: {
    width: 240,
    borderRadius: AppRadii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.2)',
    backgroundColor: '#0A1525',
  },
  menuItem: {
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  menuDangerText: {
    color: AppColors.danger,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '700',
  },
});
