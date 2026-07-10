import { MobileFeedHeader } from '@/components/mobile-feed-header';
import { MomentPost, MomentsReelPost } from '@/components/moments-reel-post';
import { AdRender } from '@/components/ads/ad-render';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useRealtimePosts } from '@/hooks/use-realtime-posts';
import { DeliveryResponse, requestAdDeliveries, trackAdEvent } from '@/lib/ads-delivery';
import axiosInstance from '@/lib/axios';
import { isPostMediaReadyForDisplay } from '@/lib/post-media-readiness';
import { getSafeExternalUrl } from '@/lib/url-guard';
import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface PostsResponse {
    data: MomentPost[];
    links: {
        next: string | null;
    };
    meta: {
        current_page: number;
        last_page: number;
    };
}

const FOLLOWING_QUERY_KEY = ['moments', 'following-map'] as const;

function PostSkeleton() {
    return (
        <div className='mx-auto h-screen w-full max-w-[430px] overflow-hidden bg-background sm:max-w-[460px] md:max-w-[560px] lg:max-w-[680px] xl:max-w-[760px]'>
            <div className='flex h-full w-full flex-col justify-end p-4'>
                <div className='mb-[96px] space-y-4 rounded-2xl bg-black/30 p-4 backdrop-blur-md'>
                    <div className='flex items-center gap-3'>
                        <Skeleton className='h-10 w-10 rounded-full bg-muted' />
                        <div className='flex-1 space-y-2'>
                            <Skeleton className='h-4 w-36 bg-muted' />
                            <Skeleton className='h-3 w-24 bg-muted' />
                        </div>
                    </div>
                    <Skeleton className='h-5 w-full bg-muted' />
                    <Skeleton className='h-5 w-4/5 bg-muted' />
                    <div className='flex gap-4 pt-2'>
                        <Skeleton className='h-5 w-12 rounded bg-muted' />
                        <Skeleton className='h-5 w-12 rounded bg-muted' />
                        <Skeleton className='h-5 w-12 rounded bg-muted' />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MomentsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { auth } = useAuth();
    const [searchParams] = useSearchParams();
    const feedMode = searchParams.get('feed') === 'following' ? 'following' : 'for-you';
    const requestedPostId = searchParams.get('post');
    const shouldOpenComments = searchParams.get('comments') === '1';

    const [followBusyByUser, setFollowBusyByUser] = useState<Record<string, boolean>>({});
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [momentsChromeHidden, setMomentsChromeHiddenState] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const postRefs = useRef<Array<HTMLDivElement | null>>([]);
    const wheelScrollLockRef = useRef(false);
    const scrollSettleTimerRef = useRef<number | null>(null);
    const requestedPostScrollKeyRef = useRef<string | null>(null);
    const lastScrollTopRef = useRef(0);
    const adSessionIdRef = useRef<string>(
        typeof window !== 'undefined' && 'crypto' in window && 'randomUUID' in window.crypto
            ? window.crypto.randomUUID()
            : `moments-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    const postShuffleSeedRef = useRef<string>(
        typeof window !== 'undefined' && 'crypto' in window && 'randomUUID' in window.crypto
            ? window.crypto.randomUUID()
            : `moments-posts-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );

    const postsQueryKey = useMemo(
        () => ['moments', 'posts', feedMode, postShuffleSeedRef.current] as const,
        [feedMode],
    );

    const setMomentsChromeHidden = useCallback((hidden: boolean) => {
        setMomentsChromeHiddenState(hidden);
        window.dispatchEvent(new CustomEvent('karaads:moments-chrome', { detail: { hidden } }));
    }, []);

    const {
        data: postsData,
        isLoading: postsLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: postsQueryKey,
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
            const response = await axiosInstance.get<PostsResponse>('/api/posts/moments', {
                params: {
                    feed: feedMode,
                    page: pageParam,
                    shuffle_seed: postShuffleSeedRef.current,
                },
            });
            return response.data;
        },
        getNextPageParam: (lastPage) => {
            const hasMore = Boolean(lastPage.links.next) && lastPage.meta.current_page < lastPage.meta.last_page;
            if (!hasMore) return undefined;
            return lastPage.meta.current_page + 1;
        },
    });

    const posts = useMemo(() => postsData?.pages.flatMap((page) => page.data) ?? [], [postsData]);
    const { data: requestedPost } = useQuery({
        queryKey: ['moments', 'requested-post', requestedPostId],
        queryFn: async () => {
            const response = await axiosInstance.get<MomentPost>(`/api/posts/${requestedPostId}`);
            return (response.data as any)?.data ?? response.data;
        },
        enabled: Boolean(requestedPostId),
        staleTime: 60_000,
    });
    const readyPosts = useMemo(
        () => posts.filter((post) => isPostMediaReadyForDisplay(post)),
        [posts],
    );
    const mergedPosts = useMemo(() => {
        if (!requestedPost || !isPostMediaReadyForDisplay(requestedPost)) return readyPosts;
        const alreadyExists = readyPosts.some((post) => String(post.id) === String(requestedPost.id));
        if (alreadyExists) return readyPosts;
        return [requestedPost, ...readyPosts];
    }, [readyPosts, requestedPost]);
    const requiredMomentAds = useMemo(
        () => {
            const consumedAdsEstimate = Math.floor(Math.max(0, activeIndex) / 4) + 2;
            return Math.max(8, Math.min(20, consumedAdsEstimate + 6));
        },
        [activeIndex],
    );

    const { data: momentAds = [] } = useQuery({
        queryKey: ['moments', 'ads', feedMode, requiredMomentAds],
        queryFn: () =>
            requestAdDeliveries({
                count: requiredMomentAds,
                surface: 'moments',
                slot: 'main',
                sessionSeed: `${adSessionIdRef.current}-${feedMode}`,
                context: { feed: feedMode, page: 'moments' },
                cacheKey: `moments:feed:${feedMode}:goal-v2`,
                cacheTtlMs: 30_000,
                persistCache: false,
                allowCreativeRepeats: true,
            }),
        enabled: posts.length > 0,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: 'always',
        placeholderData: (previous) => previous,
        retry: 1,
    });

    const feedItems = useMemo(() => {
        const items: Array<{ kind: 'post'; post: MomentPost } | { kind: 'ad'; ad: DeliveryResponse; key: string }> = [];
        let adIndex = 0;
        mergedPosts.forEach((post, index) => {
            items.push({ kind: 'post', post });
            const shouldInsertAd = index % 3 === 1 && adIndex < momentAds.length;
            if (shouldInsertAd) {
                const ad = momentAds[adIndex++];
                items.push({ kind: 'ad', ad, key: `moments-ad-${ad.delivery_id}-${index}` });
            }
        });
        return items;
    }, [mergedPosts, momentAds]);

    const { data: followingByUser = {}, isSuccess: followingMapReady } = useQuery({
        queryKey: FOLLOWING_QUERY_KEY,
        queryFn: async () => {
            const response = await axiosInstance.get<{ data: Array<{ id: string }> }>('/api/users/following');
            const followingMap: Record<string, boolean> = {};
            for (const user of response.data?.data ?? []) {
                followingMap[user.id] = true;
            }
            return followingMap;
        },
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        setActiveIndex(0);
        requestedPostScrollKeyRef.current = null;
        lastScrollTopRef.current = 0;
        setMomentsChromeHidden(false);
    }, [feedMode, setMomentsChromeHidden]);

    useEffect(() => {
        setMomentsChromeHidden(false);

        return () => {
            window.dispatchEvent(new CustomEvent('karaads:moments-chrome', { detail: { hidden: false } }));
        };
    }, [setMomentsChromeHidden]);

    useEffect(() => {
        requestedPostScrollKeyRef.current = null;
    }, [requestedPostId]);

    useEffect(() => {
        setActiveIndex((current) => Math.max(0, Math.min(current, Math.max(0, feedItems.length - 1))));
    }, [feedItems.length]);

    useEffect(() => {
        if (!requestedPostId || feedItems.length === 0) return;
        const scrollKey = `${feedMode}:${requestedPostId}`;
        if (requestedPostScrollKeyRef.current === scrollKey) return;

        const requestedIndex = feedItems.findIndex(
            (item) => item.kind === 'post' && String(item.post.id) === String(requestedPostId),
        );
        if (requestedIndex < 0) return;

        requestedPostScrollKeyRef.current = scrollKey;
        setActiveIndex(requestedIndex);
        const targetNode = postRefs.current[requestedIndex];
        if (targetNode) {
            targetNode.scrollIntoView({ block: 'start', behavior: 'auto' });
        }
    }, [feedItems, feedMode, requestedPostId]);

    useEffect(() => {
        return () => {
            if (scrollSettleTimerRef.current) {
                window.clearTimeout(scrollSettleTimerRef.current);
            }
        };
    }, []);

    useRealtimePosts({
        userId: '',
        onPostCreated: () => {
            queryClient.invalidateQueries({ queryKey: postsQueryKey }).catch(() => {});
        },
        onPostLiked: () => {},
        onError: (error) => console.error('WebSocket error:', error),
    });

    useEffect(() => {
        const root = containerRef.current;
        if (!root || feedItems.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const idxAttr = (entry.target as HTMLElement).dataset.index;
                    const idx = Number(idxAttr);
                    if (!Number.isNaN(idx)) {
                        setActiveIndex(idx);
                    }
                });
            },
            {
                root,
                threshold: 0.72,
            },
        );

        postRefs.current.forEach((node) => {
            if (node) observer.observe(node);
        });

        return () => observer.disconnect();
    }, [feedItems]);

    useEffect(() => {
        const root = containerRef.current;
        if (!root || feedItems.length < 2) return;

        const snapToNearestPost = (behavior: ScrollBehavior = 'smooth') => {
            const currentTop = root.scrollTop;
            let nearestIndex = activeIndex;
            let nearestDistance = Number.POSITIVE_INFINITY;

            postRefs.current.forEach((node, index) => {
                if (!node) return;
                const distance = Math.abs(node.offsetTop - currentTop);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = index;
                }
            });

            const nextNode = postRefs.current[nearestIndex];
            if (!nextNode) return;

            setActiveIndex(nearestIndex);
            root.scrollTo({ top: nextNode.offsetTop, behavior });
        };

        const handleScroll = () => {
            if (wheelScrollLockRef.current) return;
            const currentTop = root.scrollTop;
            const scrollDelta = currentTop - lastScrollTopRef.current;
            if (Math.abs(scrollDelta) > 18) {
                setMomentsChromeHidden(scrollDelta > 0);
                lastScrollTopRef.current = currentTop;
            }

            if (scrollSettleTimerRef.current) {
                window.clearTimeout(scrollSettleTimerRef.current);
            }

            scrollSettleTimerRef.current = window.setTimeout(() => {
                snapToNearestPost('smooth');
            }, 130);
        };

        const handleWheel = (event: WheelEvent) => {
            const target = event.target as HTMLElement | null;
            if (
                target?.closest(
                    'button, a, input, textarea, select, [role="dialog"], [data-no-reel-nav]',
                )
            ) {
                return;
            }

            if (Math.abs(event.deltaY) < 12) return;
            event.preventDefault();
            if (wheelScrollLockRef.current) return;

            const direction = event.deltaY > 0 ? 1 : -1;
            setMomentsChromeHidden(direction > 0);
            const nextIndex = Math.max(0, Math.min(feedItems.length - 1, activeIndex + direction));
            if (nextIndex === activeIndex) return;

            const nextNode = postRefs.current[nextIndex];
            if (!nextNode) return;

            wheelScrollLockRef.current = true;
            setActiveIndex(nextIndex);
            root.scrollTo({ top: nextNode.offsetTop, behavior: 'smooth' });

            window.setTimeout(() => {
                wheelScrollLockRef.current = false;
            }, 620);
        };

        root.addEventListener('scroll', handleScroll, { passive: true });
        root.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            root.removeEventListener('scroll', handleScroll);
            root.removeEventListener('wheel', handleWheel);
            if (scrollSettleTimerRef.current) {
                window.clearTimeout(scrollSettleTimerRef.current);
            }
        };
    }, [activeIndex, feedItems.length, setMomentsChromeHidden]);

    useEffect(() => {
        if (activeIndex >= mergedPosts.length - 2 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage().catch(() => {});
        }
    }, [activeIndex, mergedPosts.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const advanceToNextItem = useCallback(() => {
        setActiveIndex((currentIndex) => {
            const nextIndex = Math.min(feedItems.length - 1, currentIndex + 1);
            if (nextIndex === currentIndex) return currentIndex;

            const nextNode = postRefs.current[nextIndex];
            if (nextNode) {
                nextNode.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }

            return nextIndex;
        });
    }, [feedItems.length]);

    const updatePost = useCallback((postId: string, updater: (post: MomentPost) => MomentPost) => {
        queryClient.setQueryData<InfiniteData<PostsResponse>>(postsQueryKey, (old) => {
            if (!old) return old;

            const updatePostInTree = (post: MomentPost): MomentPost => {
                if (post.id === postId) {
                    return updater(post);
                }

                if (post.original_post) {
                    return {
                        ...post,
                        original_post: updatePostInTree(post.original_post),
                    };
                }

                return post;
            };

            return {
                ...old,
                pages: old.pages.map((page) => ({
                    ...page,
                    data: page.data.map(updatePostInTree),
                })),
            };
        });
    }, [postsQueryKey, queryClient]);

    const removePost = useCallback((postId: string) => {
        queryClient.setQueryData<InfiniteData<PostsResponse>>(postsQueryKey, (old) => {
            if (!old) return old;

            return {
                ...old,
                pages: old.pages.map((page) => ({
                    ...page,
                    data: page.data.filter((item) => item.id !== postId),
                })),
            };
        });
    }, [postsQueryKey, queryClient]);

    const likeMutation = useMutation({
        mutationFn: ({ postId, currentlyLiked }: { postId: string; currentlyLiked: boolean }) =>
            axiosInstance.post(currentlyLiked ? `/api/posts/${postId}/unlike` : `/api/posts/${postId}/like`),
        onMutate: ({ postId, currentlyLiked }) => {
            updatePost(postId, (item) => ({
                ...item,
                user_liked: !currentlyLiked,
                like_count: currentlyLiked ? Math.max(0, item.like_count - 1) : item.like_count + 1,
            }));

            return { postId, currentlyLiked };
        },
        onError: (_error, _variables, context) => {
            if (!context) return;
            updatePost(context.postId, (item) => ({
                ...item,
                user_liked: context.currentlyLiked,
                like_count: context.currentlyLiked ? item.like_count + 1 : Math.max(0, item.like_count - 1),
            }));
        },
    });

    const reshareMutation = useMutation({
        mutationFn: ({ postId, currentlyReshared }: { postId: string; currentlyReshared: boolean }) =>
            axiosInstance.post(
                currentlyReshared ? `/api/posts/${postId}/unreshare` : `/api/posts/${postId}/reshare`,
            ),
        onMutate: ({ postId, currentlyReshared }) => {
            updatePost(postId, (item) => ({
                ...item,
                user_reshared: !currentlyReshared,
                repost_count: currentlyReshared ? Math.max(0, item.repost_count - 1) : item.repost_count + 1,
            }));

            return { postId, currentlyReshared };
        },
        onError: (_error, _variables, context) => {
            if (!context) return;
            updatePost(context.postId, (item) => ({
                ...item,
                user_reshared: context.currentlyReshared,
                repost_count: context.currentlyReshared ? item.repost_count + 1 : Math.max(0, item.repost_count - 1),
            }));
        },
    });

    const followMutation = useMutation({
        mutationFn: ({ userId, wasFollowing }: { userId: string; wasFollowing: boolean }) =>
            axiosInstance.post(`/api/users/${userId}/${wasFollowing ? 'unfollow' : 'follow'}`),
        onMutate: async ({ userId, wasFollowing }) => {
            await queryClient.cancelQueries({ queryKey: FOLLOWING_QUERY_KEY });
            const previousFollowing = queryClient.getQueryData<Record<string, boolean>>(FOLLOWING_QUERY_KEY) || {};

            queryClient.setQueryData<Record<string, boolean>>(FOLLOWING_QUERY_KEY, (old = {}) => ({
                ...old,
                [userId]: !wasFollowing,
            }));
            setFollowBusyByUser((prev) => ({ ...prev, [userId]: true }));

            return { previousFollowing, userId };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousFollowing) {
                queryClient.setQueryData(FOLLOWING_QUERY_KEY, context.previousFollowing);
            }
        },
        onSettled: (_data, _error, variables) => {
            setFollowBusyByUser((prev) => ({ ...prev, [variables.userId]: false }));
        },
    });

    const handleLike = useCallback((post: MomentPost) => {
        likeMutation.mutate({ postId: post.id, currentlyLiked: Boolean(post.user_liked) });
    }, [likeMutation]);

    const handleReshare = useCallback((post: MomentPost) => {
        reshareMutation.mutate({ postId: post.id, currentlyReshared: Boolean(post.user_reshared) });
    }, [reshareMutation]);

    const handleFollow = useCallback((userId: string) => {
        if (!followingMapReady) return;
        if (followBusyByUser[userId]) return;
        const wasFollowing = Boolean(followingByUser[userId]);
        followMutation.mutate({ userId, wasFollowing });
    }, [followBusyByUser, followingByUser, followMutation, followingMapReady]);

    const handlePostUpdated = useCallback((postId: string, updates: { content: string; media: MomentPost['media'] }) => {
        updatePost(postId, (item) => ({ ...item, content: updates.content, media: updates.media }));
    }, [updatePost]);

    const handlePostDeleted = useCallback((postId: string) => {
        removePost(postId);
    }, [removePost]);

    return (
        <div className='relative h-[100dvh] w-full overflow-hidden bg-background xl:px-6'>
            <MobileFeedHeader
                activeTab={feedMode}
                onTabChange={(tab) => navigate(tab === 'following' ? '/app?feed=following' : '/app')}
                onNotificationsClick={() => navigate('/notifications')}
                className={`pt-[max(env(safe-area-inset-top),0px)] transition-all duration-300 ease-out ${
                    momentsChromeHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
                }`}
            />

            <div
                ref={containerRef}
                className='karads-mobile mx-auto h-[100dvh] w-full max-w-[430px] overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar overscroll-contain bg-background sm:max-w-[460px] md:max-w-[560px] lg:max-w-[680px] xl:max-w-[760px] xl:rounded-[32px] xl:shadow-sm xl:ring-1 xl:ring-border'
                style={{
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y',
                    overscrollBehaviorY: 'contain',
                    scrollSnapType: 'y mandatory',
                }}
            >
                {mergedPosts.length === 0 && postsLoading ? (
                    <PostSkeleton />
                ) : (
                    feedItems.map((item, index) => {
                        if (item.kind === 'ad') {
                            return (
                                <div
                                    key={item.key}
                                    ref={(node) => {
                                        postRefs.current[index] = node;
                                    }}
                                    data-index={index}
                                    className='h-[100dvh] w-full snap-start snap-always'
                                >
                                    <MomentsAdSlide
                                        ad={item.ad}
                                        isActive={index === activeIndex}
                                        onAutoAdvance={() => {
                                            const nextIndex = Math.min(feedItems.length - 1, index + 1);
                                            const nextNode = postRefs.current[nextIndex];
                                            if (!nextNode || nextIndex === index) return;

                                            setActiveIndex(nextIndex);
                                            nextNode.scrollIntoView({ block: 'start', behavior: 'smooth' });
                                        }}
                                    />
                                </div>
                            );
                        }

                        const post = item.post;
                        if (!post || !post.user) return null;

                        const canFollow = Boolean(
                            followingMapReady && auth?.user?.id && String(post.user.id) !== String(auth.user.id),
                        );
                        return (
                            <div
                                key={post.id}
                                ref={(node) => {
                                    postRefs.current[index] = node;
                                }}
                                data-index={index}
                                className='h-[100dvh] w-full snap-start snap-always'
                            >
                                <MomentsReelPost
                                    post={post}
                                    currentUserId={auth?.user?.id}
                                    isActive={index === activeIndex}
                                    isNearActive={Math.abs(index - activeIndex) <= 1}
                                    isMuted={isMuted}
                                    onToggleMute={() => setIsMuted((prev) => !prev)}
                                    onLike={handleLike}
                                    onReshare={handleReshare}
                                    onFollow={handleFollow}
                                    onPostUpdated={handlePostUpdated}
                                    onPostDeleted={handlePostDeleted}
                                    isFollowing={Boolean(followingByUser[post.user.id])}
                                    isFollowBusy={Boolean(followBusyByUser[post.user.id])}
                                    canFollow={canFollow}
                                    onVideoEnded={advanceToNextItem}
                                    autoOpenComments={shouldOpenComments && String(post.id) === String(requestedPostId)}
                                />
                            </div>
                        );
                    })
                )}

                {isFetchingNextPage && mergedPosts.length > 0 && (
                    <div className='h-[100dvh] w-full snap-start snap-always'>
                        <PostSkeleton />
                    </div>
                )}
            </div>
        </div>
    );
}

function MomentsAdSlide({
    ad,
    isActive,
    onAutoAdvance,
}: {
    ad: DeliveryResponse;
    isActive: boolean;
    onAutoAdvance: () => void;
}) {
    const creative = ad.creative;
    const rootRef = useRef<HTMLDivElement | null>(null);
    const impressionSentRef = useRef(false);
    const viewCompleteSentRef = useRef(false);
    const autoAdvanceSentRef = useRef(false);
    const onAutoAdvanceRef = useRef(onAutoAdvance);
    const [secondsLeft, setSecondsLeft] = useState(5);
    const safeTargetUrl = getSafeExternalUrl(creative?.target_url || null);

    useEffect(() => {
        onAutoAdvanceRef.current = onAutoAdvance;
    }, [onAutoAdvance]);

    useEffect(() => {
        autoAdvanceSentRef.current = false;
        setSecondsLeft(5);
    }, [ad.delivery_id]);

    useEffect(() => {
        if (!isActive) {
            setSecondsLeft(5);
            return;
        }

        const startedAt = Date.now();
        const interval = window.setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
            setSecondsLeft(Math.max(0, 5 - elapsedSeconds));
        }, 250);

        const timeout = window.setTimeout(() => {
            if (autoAdvanceSentRef.current) return;
            autoAdvanceSentRef.current = true;
            onAutoAdvanceRef.current();
        }, 5_000);

        return () => {
            window.clearInterval(interval);
            window.clearTimeout(timeout);
        };
    }, [isActive]);

    useEffect(() => {
        const node = rootRef.current;
        const signature = ad.tracking?.signature;
        const sessionId = ad.tracking?.session_id;
        if (!node || !ad.delivery_id || !signature || !sessionId) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.55);
                if (!visible || impressionSentRef.current) return;
                impressionSentRef.current = true;

                trackAdEvent({
                    deliveryId: ad.delivery_id,
                    eventType: 'impression',
                    sessionId,
                    signature,
                    idempotencyKey: `moments-impression-${ad.delivery_id}`,
                    meta: { surface: 'moments', slot: 'main' },
                });
            },
            { threshold: [0.55] },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [ad.delivery_id, ad.tracking?.session_id, ad.tracking?.signature]);

    const handleClick = () => {
        const signature = ad.tracking?.signature;
        const sessionId = ad.tracking?.session_id;
        if (!ad.delivery_id || !signature || !sessionId) return;
        trackAdEvent({
            deliveryId: ad.delivery_id,
            eventType: 'click',
            sessionId,
            signature,
            idempotencyKey: `moments-click-${ad.delivery_id}-${Date.now()}`,
            meta: { surface: 'moments', slot: 'main' },
        });
    };

    const handleVideoQualifiedView = (payload: {
        watchSeconds: number;
        durationSeconds: number;
        watchRatio: number;
    }) => {
        const signature = ad.tracking?.signature;
        const sessionId = ad.tracking?.session_id;
        if (!ad.delivery_id || !signature || !sessionId || viewCompleteSentRef.current) return;

        viewCompleteSentRef.current = true;
        trackAdEvent({
            deliveryId: ad.delivery_id,
            eventType: 'view_complete',
            sessionId,
            signature,
            idempotencyKey: `moments-view-complete-${ad.delivery_id}`,
            meta: {
                surface: 'moments',
                slot: 'main',
                watch_seconds: payload.watchSeconds,
                video_duration_seconds: payload.durationSeconds,
                watch_ratio: payload.watchRatio,
            },
        });
    };

    if (!creative) return null;

    return (
        <div ref={rootRef} className='relative h-full w-full overflow-hidden bg-black'>
            <AdRender
                renderMode={creative ? (ad.render_mode || 'internal_asset') : 'internal_asset'}
                mediaUrl={creative.media_url}
                mediaType={creative.media_type}
                title={creative.title || 'Sponsored'}
                externalPayload={creative.external_payload}
                onVideoQualifiedView={handleVideoQualifiedView}
                className='h-full w-full object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent' />
            <div className='absolute left-4 right-4 top-[max(18px,env(safe-area-inset-top))] z-10'>
                <div className='h-1 overflow-hidden rounded-full bg-white/20'>
                    <div
                        className='h-full rounded-full bg-white transition-[width] duration-300 ease-linear'
                        style={{ width: `${Math.max(0, Math.min(100, ((5 - secondsLeft) / 5) * 100))}%` }}
                    />
                </div>
                <div className='mt-2 inline-flex rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur'>
                    Ad ends in {secondsLeft}s
                </div>
            </div>
            <div className='absolute bottom-[100px] left-0 right-0 p-4 text-white'>
                <div className='mx-auto max-w-[430px] rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur'>
                    <div className='mb-2 inline-flex items-center rounded-full border border-white/20 bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]'>
                        Sponsored
                    </div>
                    <h3 className='text-lg font-semibold'>{creative.title || 'Sponsored content'}</h3>
                    {creative.description ? <p className='mt-1 line-clamp-2 text-sm text-white/80'>{creative.description}</p> : null}
                    {safeTargetUrl ? (
                        <a
                            href={safeTargetUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={handleClick}
                            className='mt-3 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black'
                        >
                            Learn more
                        </a>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
