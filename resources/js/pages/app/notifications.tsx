import { Button } from '@/components/ui/button';
import { MobileActionSheet } from '@/components/mobile-action-sheet';
import { MobileEmptyState } from '@/components/mobile-empty-state';
import { MobilePageShell } from '@/components/mobile-page-shell';
import { MobileSegmentedControl } from '@/components/mobile-segmented-control';
import { MobileTopBar } from '@/components/mobile-top-bar';
import { VerifiedBadge } from '@/components/verified-badge';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';
import { useUnreadMessagesCount } from '@/hooks/use-unread-messages-count';
import axiosInstance from '@/lib/axios';
import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePage } from '@/components/page-head';
import {
    AtSign,
    Bell,
    BriefcaseBusiness,
    Heart,
    MessageCircle,
    MessageCircleMore,
    Repeat2,
    Radio,
    Settings,
    TrendingUp,
    UserPlus,
} from 'lucide-react';
import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationUser {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string;
    followers_count: number;
    following_count: number;
    is_verified: boolean;
    created_at: string;
    is_following?: boolean;
}

type NotificationType = 'like' | 'follow' | 'mention' | 'reply' | 'repost' | 'comment';
type ExtendedNotificationType = NotificationType | 'message' | 'daily_report' | 'page_invite' | 'live_stream';

interface DailyReportMetrics {
    views: number;
    likes: number;
    comments: number;
    comment_likes: number;
    posts_count: number;
    date: string;
}

interface Notification {
    id: string;
    type: ExtendedNotificationType;
    user: NotificationUser;
    action: string;
    content?: string;
    created_at: string;
    conversation_id?: string;
    related_id?: string;
    comment_id?: string;
    metrics?: DailyReportMetrics;
    page?: {
        id: string;
        name: string;
        slug: string;
        category?: string | null;
        avatar?: string | null;
        follower_count?: number;
    };
    live_stream?: {
        id: string;
        title?: string | null;
        viewer_count?: number;
        started_at?: string | null;
    };
}

interface NotificationsResponse {
    data: Notification[];
    links?: {
        next?: string | null;
        prev?: string | null;
    };
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const NOTIFICATIONS_QUERY_KEY = ['notifications', 'list'] as const;

function normalizeNotification(raw: unknown): Notification | null {
    if (!raw || typeof raw !== 'object') return null;

    const data = raw as Partial<Notification> & {
        related_id?: string;
        post_id?: string;
        post?: { id?: string };
        comment?: { id?: string; post_id?: string };
        live_stream?: Partial<NonNullable<Notification['live_stream']>>;
        stream?: Partial<NonNullable<Notification['live_stream']>> & { user?: Partial<NotificationUser> };
        user?: Partial<NotificationUser>;
        metrics?: Partial<DailyReportMetrics>;
        page?: Partial<NonNullable<Notification['page']>>;
    };

    const user = data.user || data.stream?.user;
    if (!user?.id) return null;

    const createdAt = data.created_at || new Date().toISOString();
    const type = (data.type || 'mention') as ExtendedNotificationType;
    const liveStreamId =
        typeof data.live_stream?.id === 'string'
            ? data.live_stream.id
            : typeof data.stream?.id === 'string'
                ? data.stream.id
                : undefined;
    const relatedId =
        typeof data.related_id === 'string'
            ? data.related_id
            : typeof data.post_id === 'string'
                ? data.post_id
                : typeof data.post?.id === 'string'
                    ? data.post.id
                    : typeof data.comment?.post_id === 'string'
                        ? data.comment.post_id
                        : liveStreamId;

    return {
        id: data.id || `${type}-${relatedId || createdAt}-${user.id}`,
        type,
        action: data.action || '',
        content: data.content,
        related_id: relatedId,
        comment_id:
            typeof data.comment_id === 'string'
                ? data.comment_id
                : typeof data.comment?.id === 'string'
                    ? data.comment.id
                    : undefined,
        conversation_id: typeof (data as { conversation_id?: unknown }).conversation_id === 'string'
            ? (data as { conversation_id?: string }).conversation_id
            : undefined,
        metrics: data.metrics
            ? {
                views: Number(data.metrics.views ?? 0),
                likes: Number(data.metrics.likes ?? 0),
                comments: Number(data.metrics.comments ?? 0),
                comment_likes: Number(data.metrics.comment_likes ?? 0),
                posts_count: Number(data.metrics.posts_count ?? 0),
                date: String(data.metrics.date ?? createdAt.slice(0, 10)),
            }
            : undefined,
        page: data.page?.slug && data.page?.name
            ? {
                id: String(data.page.id ?? data.page.slug),
                name: String(data.page.name),
                slug: String(data.page.slug),
                category: typeof data.page.category === 'string' ? data.page.category : null,
                avatar: typeof data.page.avatar === 'string' ? data.page.avatar : null,
                follower_count: Number(data.page.follower_count ?? 0),
            }
            : undefined,
        live_stream: liveStreamId
            ? {
                id: liveStreamId,
                title:
                    typeof data.live_stream?.title === 'string'
                        ? data.live_stream.title
                        : typeof data.stream?.title === 'string'
                            ? data.stream.title
                            : null,
                viewer_count: Number(data.live_stream?.viewer_count ?? data.stream?.viewer_count ?? 0),
                started_at:
                    typeof data.live_stream?.started_at === 'string'
                        ? data.live_stream.started_at
                        : typeof data.stream?.started_at === 'string'
                            ? data.stream.started_at
                            : null,
            }
            : undefined,
        created_at: createdAt,
        user: {
            id: user.id,
            name: user.name || 'Unknown user',
            username: user.username || 'user',
            email: user.email || '',
            avatar: user.avatar,
            bio: user.bio,
            followers_count: user.followers_count || 0,
            following_count: user.following_count || 0,
            is_verified: Boolean(user.is_verified),
            created_at: user.created_at || createdAt,
            is_following:
                typeof user.is_following === 'boolean'
                    ? user.is_following
                    : undefined,
        },
    };
}

function getNotificationIdentity(notification: Notification): string {
    return [
        notification.type,
        notification.user.id,
        notification.related_id || '',
        notification.conversation_id || '',
        notification.action,
        notification.content || '',
        notification.created_at,
    ].join('|');
}

function dedupeNotifications(items: Notification[]): Notification[] {
    const seen = new Set<string>();

    return items.filter((notification) => {
        const identity = getNotificationIdentity(notification);
        if (seen.has(identity)) return false;
        seen.add(identity);
        return true;
    });
}

function normalizeNotificationResponse(payload: unknown): NotificationsResponse {
    if (Array.isArray(payload)) {
        return {
            data: payload
                .map(normalizeNotification)
                .filter((item): item is Notification => Boolean(item)),
            links: { next: null, prev: null },
            meta: {
                current_page: 1,
                last_page: 1,
                per_page: payload.length,
                total: payload.length,
            },
        };
    }

    if (
        payload &&
        typeof payload === 'object' &&
        'data' in payload &&
        Array.isArray((payload as { data?: unknown[] }).data)
    ) {
        const record = payload as {
            data: unknown[];
            links?: {
                next?: string | null;
                prev?: string | null;
            };
            meta?: {
                current_page?: number;
                last_page?: number;
                per_page?: number;
                total?: number;
            };
        };

        const normalized = record.data
            .map(normalizeNotification)
            .filter((item): item is Notification => Boolean(item));

        return {
            data: normalized,
            links: {
                next: record.links?.next ?? null,
                prev: record.links?.prev ?? null,
            },
            meta: {
                current_page: record.meta?.current_page ?? 1,
                last_page: record.meta?.last_page ?? 1,
                per_page: record.meta?.per_page ?? normalized.length,
                total: record.meta?.total ?? normalized.length,
            },
        };
    }

    return {
        data: [],
        links: { next: null, prev: null },
        meta: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 0,
        },
    };
}

function NotificationsSkeleton() {
    return (
        <div className='divide-y divide-gray-900'>
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='px-4 py-4'>
                    <div className='flex gap-3'>
                        <Skeleton className='h-12 w-12 rounded-full flex-shrink-0' />
                        <div className='flex-1 min-w-0 space-y-2'>
                            <div className='flex items-start justify-between gap-2'>
                                <div className='flex-1 space-y-2'>
                                    <Skeleton className='h-4 w-32' />
                                    <Skeleton className='h-3 w-40' />
                                </div>
                                <Skeleton className='h-3 w-12 flex-shrink-0' />
                            </div>
                            <Skeleton className='h-16 w-full rounded-lg' />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function NotificationsPage() {
    const page = usePage();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { count: unreadMessagesCount } = useUnreadMessagesCount();
    const [activeTab, setActiveTab] = useState<'all' | 'likes' | 'follows' | 'mentions'>('all');
    const [followBusyByUser, setFollowBusyByUser] = useState<Record<string, boolean>>({});
    const [showActions, setShowActions] = useState(false);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    const currentUserId = (page.props.auth as any)?.user?.id;

    const {
        data: notificationsData,
        isLoading: loading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: NOTIFICATIONS_QUERY_KEY,
        initialPageParam: 1,
        queryFn: async ({ pageParam }): Promise<NotificationsResponse> => {
            const response = await axiosInstance.get('/api/users/notifications', {
                params: { page: pageParam, per_page: 20 },
            });
            return normalizeNotificationResponse(response.data);
        },
        getNextPageParam: (lastPage) => {
            const currentPage = lastPage.meta?.current_page ?? 1;
            const lastPageNumber = lastPage.meta?.last_page ?? 1;
            const hasMore =
                Boolean(lastPage.links?.next) && currentPage < lastPageNumber;

            return hasMore ? currentPage + 1 : undefined;
        },
        staleTime: 30_000,
    });

    const notifications = useMemo(
        () => dedupeNotifications(notificationsData?.pages.flatMap((page) => page.data) ?? []),
        [notificationsData],
    );

    useEffect(() => {
        const target = loaderRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage().catch(() => {});
                }
            },
            { rootMargin: '420px 0px' },
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const followBackMutation = useMutation({
        mutationFn: ({ userId }: { userId: string }) => axiosInstance.post(`/api/users/${userId}/follow`),
        onMutate: async ({ userId }) => {
            await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
            const previous = queryClient.getQueryData<InfiniteData<NotificationsResponse>>(NOTIFICATIONS_QUERY_KEY);

            queryClient.setQueryData<InfiniteData<NotificationsResponse>>(NOTIFICATIONS_QUERY_KEY, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        data: page.data.map((item) =>
                            item.user.id === userId
                                ? {
                                    ...item,
                                    user: {
                                        ...item.user,
                                        is_following: true,
                                    },
                                }
                                : item,
                        ),
                    })),
                };
            },
            );
            setFollowBusyByUser((prev) => ({ ...prev, [userId]: true }));

            return { previous, userId };
        },
        onError: (_error, _variables, context) => {
            if (context?.previous !== undefined) {
                queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
            }
        },
        onSettled: (_data, _error, variables) => {
            setFollowBusyByUser((prev) => ({ ...prev, [variables.userId]: false }));
        },
    });

    useRealtimeNotifications({
        userId: currentUserId,
        onNotificationReceived: (incoming) => {
            const normalized = normalizeNotification(incoming);
            if (!normalized) return;

            queryClient.setQueryData<InfiniteData<NotificationsResponse>>(NOTIFICATIONS_QUERY_KEY, (old) => {
                if (!old) {
                    return {
                        pageParams: [1],
                        pages: [
                            {
                                data: [normalized],
                                links: { next: null, prev: null },
                                meta: {
                                    current_page: 1,
                                    last_page: 1,
                                    per_page: 20,
                                    total: 1,
                                },
                            },
                        ],
                    };
                }

                const firstPage = old.pages[0] ?? {
                    data: [],
                    links: { next: null, prev: null },
                    meta: {
                        current_page: 1,
                        last_page: 1,
                        per_page: 20,
                        total: 0,
                    },
                };
                const incomingIdentity = getNotificationIdentity(normalized);
                const alreadyExists = old.pages.some((page) =>
                    page.data.some((item) => getNotificationIdentity(item) === incomingIdentity),
                );

                if (alreadyExists) {
                    return old;
                }

                const deduped = firstPage.data.filter(
                    (item) => getNotificationIdentity(item) !== incomingIdentity,
                );
                const updatedFirstPage = {
                    ...firstPage,
                    data: [normalized, ...deduped],
                    meta: firstPage.meta
                        ? {
                            ...firstPage.meta,
                            total: (firstPage.meta.total ?? deduped.length) + 1,
                        }
                        : firstPage.meta,
                };

                return {
                    ...old,
                    pages: [updatedFirstPage, ...old.pages.slice(1)],
                };
            });
        },
        onUserFollowed: (user) => {
            console.log(`${user.name} followed you`);
        },
        onError: (error) => {
            console.error('Notification WebSocket error:', error);
        },
    });

    const getIcon = (type: ExtendedNotificationType) => {
        switch (type) {
            case 'like':
                return <Heart className='h-5 w-5 fill-[#fe2c55] text-[#fe2c55]' />;
            case 'follow':
                return <UserPlus className='h-5 w-5 text-blue-400' />;
            case 'page_invite':
                return <BriefcaseBusiness className='h-5 w-5 text-cyan-300' />;
            case 'live_stream':
                return <Radio className='h-5 w-5 text-red-400' />;
            case 'message':
                return <MessageCircle className='h-5 w-5 text-cyan-400' />;
            case 'reply':
            case 'comment':
                return <MessageCircle className='h-5 w-5 text-green-400' />;
            case 'mention':
                return <AtSign className='h-5 w-5 text-purple-400' />;
            case 'repost':
                return <Repeat2 className='h-5 w-5 text-orange-400' />;
            case 'daily_report':
                return <TrendingUp className='h-5 w-5 text-emerald-300' />;
            default:
                return <TrendingUp className='h-5 w-5 text-gray-400' />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const tabs: Array<{ id: 'all' | 'likes' | 'follows' | 'mentions'; label: string }> = [
        { id: 'all', label: 'All' },
        { id: 'likes', label: 'Likes' },
        { id: 'follows', label: 'Follows' },
        { id: 'mentions', label: 'Mentions' },
    ];

    const filteredNotifications = useMemo(
        () =>
            activeTab === 'all'
                ? notifications
                : notifications.filter((n) => {
                    if (activeTab === 'likes') return n.type === 'like';
                    if (activeTab === 'follows') return n.type === 'follow' || n.type === 'page_invite';
                    if (activeTab === 'mentions') return n.type === 'mention' || n.type === 'reply' || n.type === 'comment' || n.type === 'message';
                    return true;
                }),
        [activeTab, notifications],
    );

    const getNotificationTarget = (notification: Notification): string => {
        if (notification.type === 'message' && notification.conversation_id) {
            return `/messages/c/${notification.conversation_id}`;
        }

        if (notification.type === 'page_invite') {
            const pageSlug = notification.page?.slug || notification.related_id;
            return pageSlug ? `/pages/${encodeURIComponent(pageSlug)}` : '/pages';
        }

        if (notification.type === 'live_stream') {
            const streamId = notification.live_stream?.id || notification.related_id;
            return streamId ? `/live/${encodeURIComponent(streamId)}` : '/live';
        }

        if (notification.related_id && ['comment', 'reply'].includes(notification.type)) {
            const params = new URLSearchParams({ comments: '1' });
            if (notification.comment_id) {
                params.set('comment', notification.comment_id);
            }

            return `/posts/${encodeURIComponent(notification.related_id)}?${params.toString()}`;
        }

        if (notification.related_id && ['like', 'mention', 'repost'].includes(notification.type)) {
            return `/posts/${encodeURIComponent(notification.related_id)}`;
        }

        if (notification.type === 'daily_report') {
            return '/profile';
        }

        return `/@${notification.user.username}`;
    };

    const openNotification = (notification: Notification) => {
        navigate(getNotificationTarget(notification));
    };

    const openNotificationUser = (
        event: MouseEvent<HTMLButtonElement>,
        notification: Notification,
    ) => {
        event.preventDefault();
        event.stopPropagation();
        navigate(`/@${notification.user.username}`);
    };

    useEffect(() => {
        if (!window.Echo) return;

        const channel = window.Echo.channel('live.global');

        channel.listen('.live.stream.started', (payload: any) => {
            const stream = payload?.stream;
            if (!stream?.id || !stream?.user?.id || String(stream.user.id) === String(currentUserId)) {
                return;
            }

            const normalized = normalizeNotification({
                id: `live-stream-${stream.id}`,
                type: 'live_stream',
                user: stream.user,
                action: 'is live now',
                content: stream.title || 'Tap to join the live stream.',
                related_id: stream.id,
                created_at: stream.started_at || new Date().toISOString(),
                live_stream: {
                    id: stream.id,
                    title: stream.title,
                    viewer_count: stream.viewer_count,
                    started_at: stream.started_at,
                },
            });

            if (!normalized) return;

            queryClient.setQueryData<InfiniteData<NotificationsResponse>>(NOTIFICATIONS_QUERY_KEY, (old) => {
                if (!old) {
                    return {
                        pageParams: [1],
                        pages: [{
                            data: [normalized],
                            links: { next: null, prev: null },
                            meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
                        }],
                    };
                }

                const alreadyExists = old.pages.some((page) =>
                    page.data.some((item) => item.type === 'live_stream' && item.related_id === stream.id),
                );

                if (alreadyExists) return old;

                const firstPage = old.pages[0] ?? {
                    data: [],
                    links: { next: null, prev: null },
                    meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
                };

                return {
                    ...old,
                    pages: [
                        {
                            ...firstPage,
                            data: [normalized, ...firstPage.data],
                            meta: firstPage.meta
                                ? { ...firstPage.meta, total: (firstPage.meta.total ?? firstPage.data.length) + 1 }
                                : firstPage.meta,
                        },
                        ...old.pages.slice(1),
                    ],
                };
            });
        });

        channel.listen('.live.stream.ended', (payload: any) => {
            const streamId = payload?.stream?.id;
            if (!streamId) return;

            queryClient.setQueryData<InfiniteData<NotificationsResponse>>(NOTIFICATIONS_QUERY_KEY, (old) => {
                if (!old) return old;

                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        data: page.data.filter((item) => !(item.type === 'live_stream' && item.related_id === streamId)),
                    })),
                };
            });
        });

        return () => {
            channel.stopListening('.live.stream.started');
            channel.stopListening('.live.stream.ended');
        };
    }, [currentUserId, queryClient]);

    return (
        <>
            <MobilePageShell
                header={
                    <div className='sticky top-0 z-[70]' data-no-swipe='true'>
                        <MobileTopBar
                            title='Notifications'
                            leftAction={{
                                icon: Bell,
                                label: 'Notifications',
                                onClick: () => navigate('/notifications'),
                            }}
                            rightActions={[
                                {
                                    icon: MessageCircleMore,
                                    label: 'Messages',
                                    onClick: () => navigate('/messages'),
                                    badgeCount: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
                                },
                                {
                                    icon: Settings,
                                    label: 'Notification actions',
                                    onClick: () => setShowActions(true),
                                },
                            ]}
                        />
                        <div className='mobile-header-glass -mt-px border-b-0 pb-3'>
                            <div className='mobile-safe-x mobile-page-padding mobile-content-max flex justify-center'>
                                <div className='overflow-x-auto no-scrollbar'>
                                    <MobileSegmentedControl
                                        value={activeTab}
                                        options={tabs}
                                        onChange={(value) => setActiveTab(value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                withBottomNavSpacing={false}
            >
                <div className='mobile-content-max'>
                {loading ? (
                    <NotificationsSkeleton />
                ) : filteredNotifications.length === 0 ? (
                    <MobileEmptyState
                        icon={Bell}
                        title='No notifications yet'
                        description="When someone follows you or likes your post, you'll see it here."
                    />
                ) : (
                    <div className='divide-y divide-gray-900'>
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className='px-4 py-4 transition-colors hover:bg-background'
                                data-no-swipe='true'
                            >
                                <div className='flex gap-3'>
                                    <button
                                        type='button'
                                        className='relative flex-shrink-0 cursor-pointer'
                                        onClick={(event) => openNotificationUser(event, notification)}
                                        data-no-swipe='true'
                                        aria-label={`View ${notification.user.name}'s profile`}
                                    >
                                        <div className='h-12 w-12 rounded-full overflow-hidden border-2 border-gray-800 bg-gradient-to-br from-purple-600 to-pink-600'>
                                            {notification.user.avatar ? (
                                                <img
                                                    src={notification.user.avatar}
                                                    alt={notification.user.name}
                                                    className='w-full h-full object-cover'
                                                />
                                            ) : (
                                                <div className='w-full h-full flex items-center justify-center text-white text-lg font-bold'>
                                                    {notification.user.username[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className='absolute -bottom-1 -right-1 bg-black rounded-full p-1 border-2 border-black'>
                                            <div className='bg-background rounded-full p-1'>
                                                {getIcon(notification.type)}
                                            </div>
                                        </div>
                                    </button>

                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-start justify-between gap-2 mb-1'>
                                            <div className='flex-1 min-w-0'>
                                                <div className='flex items-center gap-0 flex-wrap'>
                                                    <button
                                                        type='button'
                                                        className='font-semibold text-white truncate hover:underline cursor-pointer'
                                                        onClick={(event) => openNotificationUser(event, notification)}
                                                        data-no-swipe='true'
                                                    >
                                                        {notification.user.name}
                                                    </button>
                                                    {notification.user.is_verified && (
                                                        <VerifiedBadge compact className='ml-0' />
                                                    )}
                                                </div>
                                                <button
                                                    type='button'
                                                    className='mt-0.5 block w-full text-left text-sm text-gray-400'
                                                    onClick={() => openNotification(notification)}
                                                    data-no-swipe='true'
                                                >
                                                    {notification.action}
                                                </button>
                                            </div>
                                            <button
                                                type='button'
                                                className='flex-shrink-0 text-xs text-gray-500'
                                                onClick={() => openNotification(notification)}
                                                data-no-swipe='true'
                                                aria-label='Open notification'
                                            >
                                                {formatTime(notification.created_at)}
                                            </button>
                                        </div>

                                        {notification.content && (
                                            <button
                                                type='button'
                                                className={`mt-2 block w-full rounded-lg border p-3 text-left transition-colors active:border-gray-700 ${
                                                    notification.type === 'daily_report'
                                                        ? 'border-emerald-400/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(8,13,26,0.95),rgba(14,165,233,0.10))]'
                                                        : notification.type === 'live_stream'
                                                            ? 'border-red-400/30 bg-[linear-gradient(135deg,rgba(239,68,68,0.20),rgba(8,13,26,0.96),rgba(251,113,133,0.12))]'
                                                        : 'border-gray-800 bg-background'
                                                }`}
                                                onClick={() => openNotification(notification)}
                                                data-no-swipe='true'
                                                aria-label='Open notification content'
                                            >
                                                <p className='text-sm text-gray-300 line-clamp-2'>
                                                    {notification.content}
                                                </p>
                                                {notification.type === 'daily_report' && notification.metrics ? (
                                                    <div className='mt-3 grid grid-cols-2 gap-2'>
                                                        <div className='rounded-xl border border-white/10 bg-white/5 p-2'>
                                                            <div className='text-base font-black text-white'>
                                                                {notification.metrics.views.toLocaleString()}
                                                            </div>
                                                            <div className='text-[11px] font-semibold text-white/50'>Views</div>
                                                        </div>
                                                        <div className='rounded-xl border border-white/10 bg-white/5 p-2'>
                                                            <div className='text-base font-black text-white'>
                                                                {notification.metrics.likes.toLocaleString()}
                                                            </div>
                                                            <div className='text-[11px] font-semibold text-white/50'>Post likes</div>
                                                        </div>
                                                        <div className='rounded-xl border border-white/10 bg-white/5 p-2'>
                                                            <div className='text-base font-black text-white'>
                                                                {notification.metrics.comments.toLocaleString()}
                                                            </div>
                                                            <div className='text-[11px] font-semibold text-white/50'>Comments</div>
                                                        </div>
                                                        <div className='rounded-xl border border-white/10 bg-white/5 p-2'>
                                                            <div className='text-base font-black text-white'>
                                                                {notification.metrics.comment_likes.toLocaleString()}
                                                            </div>
                                                            <div className='text-[11px] font-semibold text-white/50'>Comment likes</div>
                                                        </div>
                                                    </div>
                                                ) : null}
                                                {notification.type === 'live_stream' ? (
                                                    <div className='mt-3 flex items-center justify-between gap-3'>
                                                        <span className='inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white'>
                                                            <span className='h-2 w-2 rounded-full bg-white' />
                                                            Live now
                                                        </span>
                                                        <span className='rounded-full bg-white px-3 py-1 text-xs font-black text-[#101421]'>
                                                            Join live
                                                        </span>
                                                    </div>
                                                ) : null}
                                            </button>
                                        )}

                                        {notification.type === 'page_invite' && notification.page ? (
                                            <button
                                                type='button'
                                                className='mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-left transition hover:bg-cyan-300/15'
                                                onClick={() => openNotification(notification)}
                                                data-no-swipe='true'
                                            >
                                                <span className='flex min-w-0 items-center gap-3'>
                                                    {notification.page.avatar ? (
                                                        <img
                                                            src={notification.page.avatar}
                                                            alt={notification.page.name}
                                                            className='h-12 w-12 rounded-2xl object-cover'
                                                        />
                                                    ) : (
                                                        <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-100'>
                                                            <BriefcaseBusiness className='h-5 w-5' />
                                                        </span>
                                                    )}
                                                    <span className='min-w-0'>
                                                        <span className='block truncate text-sm font-black text-white'>
                                                            {notification.page.name}
                                                        </span>
                                                        <span className='block truncate text-xs text-white/50'>
                                                            {notification.page.category || 'Business page'} • {(notification.page.follower_count ?? 0).toLocaleString()} followers
                                                        </span>
                                                    </span>
                                                </span>
                                                <span className='shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground'>
                                                    View page
                                                </span>
                                            </button>
                                        ) : null}

                                        {notification.type === 'follow' && (
                                            notification.user.is_following === false ? (
                                            <Button
                                                disabled={Boolean(followBusyByUser[notification.user.id])}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    followBackMutation.mutate({ userId: notification.user.id });
                                                }}
                                                data-no-swipe='true'
                                            >
                                                Follow Back
                                            </Button>
                                            ) : null
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {hasNextPage ? <div ref={loaderRef} className='h-8' /> : null}
                {isFetchingNextPage ? <NotificationsSkeleton /> : null}
                </div>
            </MobilePageShell>
            <MobileActionSheet open={showActions} onOpenChange={setShowActions} title='Notifications'>
                <div className='space-y-2'>
                    <button
                        type='button'
                        className='h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-left text-sm text-white'
                        onClick={() => {
                            setActiveTab('all');
                            setShowActions(false);
                        }}
                    >
                        Show all notifications
                    </button>
                </div>
            </MobileActionSheet>
        </>
    );
}
