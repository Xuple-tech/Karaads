import { MediaCarousel } from '@/components/media-carousel';
import { Link } from '@/components/page-head';
import { useRealtimePostInteractions } from '@/hooks/use-realtime-post-interactions';
import { getSafeExternalUrl, getSafeMediaUrl } from '@/lib/url-guard';
import { Heart, MessageCircle, Repeat2, Share, TrendingUp, Volume2, VolumeX } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

interface PostCardProps {
    post: {
        id: string;
        content: string;
        type: string;
        user: {
            id: string;
            name: string;
            username: string;
            avatar?: string;
        };
        like_count: number;
        comment_count: number;
        repost_count: number;
        media?: Array<{ id: string; url: string }>;
        music_url?: string | null;
        music_title?: string | null;
        created_at: string;
        user_liked?: boolean;
        monetization?: {
            id: string;
            is_monetized: boolean;
            estimated_earnings: number;
            status: string;
        };
        ad_spaces?: Array<{
            id: string;
            position: string;
            size: string;
            type: string;
        }>;
        ads?: Array<{
            id: string;
            title: string;
            media_url: string;
            target_url: string;
        }>;
    };
    onLike?: (postId: string) => Promise<void>;
    onComment?: (postId: string, content: string) => Promise<void>;
    onReshare?: (postId: string) => Promise<void>;
    currentUserId?: string;
}

export function PostCard({
    post,
    onLike,
    onComment,
    onReshare,
    currentUserId,
}: PostCardProps) {
    const [isLiked, setIsLiked] = useState(post.user_liked);
    const [likeCount, setLikeCount] = useState(post.like_count);
    const [commentCount, setCommentCount] = useState(post.comment_count);
    const [reshareCount, setReshareCount] = useState(post.repost_count);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [brokenAdThumbs, setBrokenAdThumbs] = useState<Record<string, boolean>>({});
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isOwner = Boolean(currentUserId && String(currentUserId) === String(post.user.id));

    // Handle real-time interactions
    useRealtimePostInteractions({
        onLike: (data) => {
            if (data.post_id === post.id) {
                setLikeCount(data.like_count || likeCount + 1);
            }
        },
        onUnlike: (data) => {
            if (data.id === post.id) {
                setLikeCount(data.like_count || Math.max(0, likeCount - 1));
            }
        },
        onComment: (data) => {
            if (data.post_id === post.id) {
                setCommentCount((prev) => prev + 1);
            }
        },
        onReshare: (data) => {
            if (data.original_post_id === post.id) {
                setReshareCount((prev) => prev + 1);
            }
        },
    });

    const handleLike = useCallback(async () => {
        if (!onLike) return;

        try {
            await onLike(post.id);
            setIsLiked(!isLiked);
            setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    }, [isLiked, post.id, onLike]);

    const handleReshare = useCallback(async () => {
        if (!onReshare) return;

        try {
            await onReshare(post.id);
            setReshareCount((prev) => prev + 1);
        } catch (error) {
            console.error('Failed to reshare post:', error);
        }
    }, [post.id, onReshare]);

    const handleComment = useCallback(
        async (content: string) => {
            if (!onComment) return;

            try {
                await onComment(post.id, content);
                setCommentCount((prev) => prev + 1);
                setShowCommentInput(false);
            } catch (error) {
                console.error('Failed to comment:', error);
            }
        },
        [post.id, onComment],
    );

    const toggleMusic = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isMusicPlaying) {
            audio.pause();
            audio.currentTime = 0;
            setIsMusicPlaying(false);
            return;
        }

        audio.play().then(() => {
            setIsMusicPlaying(true);
        }).catch(() => {
            setIsMusicPlaying(false);
        });
    }, [isMusicPlaying]);

    return (
        <article className="border-b border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900/50">
            {/* Header with user info */}
            <div className="mb-3 flex gap-3">
                <Link
                    href={`/users/${post.user.username}`}
                    className="flex-shrink-0"
                >
                    {post.user.avatar ? (
                        <img
                            src={post.user.avatar}
                            alt={post.user.name}
                            className="h-12 w-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 font-bold text-white">
                            {post.user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                        </div>
                    )}
                </Link>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-1">
                        <Link
                            href={`/users/${post.user.username}`}
                            className="font-bold text-gray-900 hover:underline dark:text-white"
                        >
                            {post.user.name}
                        </Link>
                        <span className="text-gray-500 dark:text-gray-400">
                            @{post.user.username}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                            &middot;
                        </span>
                        <time className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(post.created_at).toLocaleDateString()}
                        </time>
                    </div>
                </div>
            </div>

            {/* Post content */}
            <div className="mb-3 break-words whitespace-pre-wrap text-gray-900 dark:text-white">
                {post.content}
            </div>

            {/* Media */}
            {post.media && post.media.length > 0 && (
                <div className="relative mb-3 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
                    {post.music_url ? <audio ref={audioRef} src={post.music_url} preload="metadata" onEnded={() => setIsMusicPlaying(false)} /> : null}
                    <MediaCarousel
                        items={post.media}
                        resetKey={post.id}
                        className="overflow-hidden rounded-2xl"
                        trackClassName="max-h-500px"
                        renderItem={(media) => (
                            <img
                                src={media.url}
                                alt="Post media"
                                className="max-h-500px w-full object-cover"
                            />
                        )}
                    />
                    {post.music_url ? (
                        <button
                            type="button"
                            onClick={toggleMusic}
                            className="absolute right-6 top-6 z-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs text-white backdrop-blur"
                        >
                            {isMusicPlaying ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                            <span>{post.music_title || 'Music'}</span>
                        </button>
                    ) : null}
                </div>
            )}

            {/* Monetization Info */}
            {post.monetization?.is_monetized && (
                <div className="mb-3 flex items-center gap-2 rounded border border-blue-200 bg-blue-50 p-2 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    <TrendingUp className="h-4 w-4" />
                    <span>
                        Monetized - Est. earnings: $
                        {post.monetization.estimated_earnings.toFixed(2)}
                    </span>
                </div>
            )}

            {/* Ads Display */}
            {post.ads && post.ads.length > 0 && (
                <div className="mb-3 rounded border border-gray-300 bg-gray-100 p-2 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    <div className="mb-2 font-semibold">Sponsored Content</div>
                    {post.ads.map((ad) => {
                        const safeTargetUrl = getSafeExternalUrl(ad.target_url || null);
                        const safeMediaUrl = getSafeMediaUrl(ad.media_url || null);
                        const thumbBroken = Boolean(brokenAdThumbs[ad.id]);

                        if (!safeTargetUrl && !safeMediaUrl) {
                            return null;
                        }

                        const adContent = (
                            <>
                                {safeMediaUrl && !thumbBroken ? (
                                    <img
                                        src={safeMediaUrl}
                                        alt={ad.title}
                                        className="h-12 w-12 rounded object-cover"
                                        loading="lazy"
                                        decoding="async"
                                        referrerPolicy="no-referrer"
                                        onError={() => {
                                            setBrokenAdThumbs((prev) => ({ ...prev, [ad.id]: true }));
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200 text-[10px] font-semibold uppercase text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                        Ad
                                    </div>
                                )}
                                <span>{ad.title}</span>
                            </>
                        );

                        if (safeTargetUrl) {
                            return (
                                <a
                                    key={ad.id}
                                    href={safeTargetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 transition-opacity hover:opacity-80"
                                >
                                    {adContent}
                                </a>
                            );
                        }

                        return (
                            <div key={ad.id} className="flex items-center gap-2 opacity-75">
                                {adContent}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Interaction Stats */}
            <div className="mb-3 flex gap-4 border-t border-gray-100 py-2 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                {commentCount > 0 && (
                    <button className="transition-colors hover:text-blue-500">
                        {commentCount} comment{commentCount !== 1 ? 's' : ''}
                    </button>
                )}
                {reshareCount > 0 && (
                    <button className="transition-colors hover:text-green-500">
                        {reshareCount} reshare{reshareCount !== 1 ? 's' : ''}
                    </button>
                )}
                {likeCount > 0 && (
                    <button className="transition-colors hover:text-red-500">
                        {likeCount} like{likeCount !== 1 ? 's' : ''}
                    </button>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-around border-t border-gray-100 pt-2 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <button
                    onClick={() => setShowCommentInput(!showCommentInput)}
                    className="group flex flex-1 items-center justify-center gap-2 rounded-full py-2 transition-colors hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20"
                    title="Comment"
                >
                    <MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="hidden text-sm sm:inline">
                        {commentCount}
                    </span>
                </button>

                <button
                    onClick={handleReshare}
                    className="group flex flex-1 items-center justify-center gap-2 rounded-full py-2 transition-colors hover:bg-green-50 hover:text-green-500 dark:hover:bg-green-900/20"
                    title="Reshare"
                >
                    <Repeat2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="hidden text-sm sm:inline">
                        {reshareCount}
                    </span>
                </button>

                <button
                    onClick={handleLike}
                    className={`group flex flex-1 items-center justify-center gap-2 rounded-full py-2 transition-colors ${
                        isLiked
                            ? 'text-red-500 hover:text-red-600'
                            : 'hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20'
                    }`}
                    title={isLiked ? 'Unlike' : 'Like'}
                >
                    <Heart
                        className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                            isLiked ? 'fill-current' : ''
                        }`}
                    />
                    <span className="hidden text-sm sm:inline">
                        {likeCount}
                    </span>
                </button>

                <button
                    className="group flex flex-1 items-center justify-center gap-2 rounded-full py-2 transition-colors hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20"
                    title="Share"
                >
                    <Share className="h-5 w-5 transition-transform group-hover:scale-110" />
                </button>

                {isOwner && (
                    <Link
                        href={`/ads/create?mode=boost&post=${encodeURIComponent(post.id)}`}
                        className="group flex flex-1 items-center justify-center py-2"
                        title="Boost post"
                    >
                        <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 transition-colors group-hover:border-amber-400 group-hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:group-hover:bg-amber-900/50">
                            Boost post
                        </span>
                    </Link>
                )}
            </div>

            {/* Comment Input */}
            {showCommentInput && (
                <div className="mt-3 border-t border-gray-100 p-3 dark:border-gray-800">
                    <CommentInput
                        onSubmit={handleComment}
                        onCancel={() => setShowCommentInput(false)}
                    />
                </div>
            )}
        </article>
    );
}

function CommentInput({
    onSubmit,
    onCancel,
}: {
    onSubmit: (content: string) => void;
    onCancel: () => void;
}) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content);
            setContent('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a comment..."
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                rows={3}
            />
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? 'Posting...' : 'Post'}
                </button>
            </div>
        </form>
    );
}
