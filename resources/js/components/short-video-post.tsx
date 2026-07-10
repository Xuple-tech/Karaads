import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PostOwnerActions } from '@/components/post-owner-actions';
import {
    Heart,
    MessageCircle,
    Repeat2,
    Share2,
    Bookmark,
    Play,
    Volume2,
    VolumeX
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from '@/components/page-head';
import axios from 'axios';
import CommentSection from './comment';

interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    is_verified?: boolean;
}

interface Media {
    id: string;
    path: string;
    type: string;
    mime_type?: string;
}

interface Post {
    id: string;
    content: string;
    type: 'post' | 'repost';
    created_at: string;
    like_count: number;
    comment_count: number;
    repost_count: number;
    save_count?: number;
    media: Media[];
    user: User;
    user_liked: boolean;
    user_reshared: boolean;
    user_saved?: boolean;
    original_post?: Post;
}

interface ShortVideoPostProps {
  post: Post;
  currentUserId?: string;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  variant?: "card" | "fullscreen";
  onPostUpdated?: (postId: string, updates: { content: string; media: Media[] }) => void;
  onPostDeleted?: (postId: string) => void;
}

export function ShortVideoPost({
  post: initialPost,
  currentUserId,
  isActive,
  isMuted,
  onToggleMute,
  variant = "card",
  onPostUpdated,
  onPostDeleted,
}: ShortVideoPostProps) {
    const [post, setPost] = useState(initialPost);
    const [isLiking, setIsLiking] = useState(false);
    const [isPlaying, setIsPlaying] = useState(isActive);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const isOwner = Boolean(currentUserId && String(currentUserId) === String(post.user.id));

    useEffect(() => {
        setPost(initialPost);
    }, [initialPost]);

    useEffect(() => {
        if (isActive) {
            setIsPlaying(true);
            videoRef.current?.play().catch(() => setIsPlaying(false));
        } else {
            setIsPlaying(false);
            videoRef.current?.pause();
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
            }
        }
    }, [isActive]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleLike = async () => {
        if (isLiking) return;

        // Optimistic update
        const isCurrentlyLiked = post.user_liked;
        setPost(prev => ({
            ...prev,
            user_liked: !isCurrentlyLiked,
            like_count: isCurrentlyLiked ? prev.like_count - 1 : prev.like_count + 1
        }));

        if (!isCurrentlyLiked) {
            setShowHeartAnimation(true);
            setTimeout(() => setShowHeartAnimation(false), 1000);
        }

        setIsLiking(true);
        try {
            const endpoint = isCurrentlyLiked
                ? `/api/posts/${post.id}/unlike`
                : `/api/posts/${post.id}/like`;
            await axios.post(endpoint);
        } catch {
            // Revert on error
            setPost(prev => ({
                ...prev,
                user_liked: isCurrentlyLiked,
                like_count: isCurrentlyLiked ? prev.like_count + 1 : prev.like_count - 1
            }));
        } finally {
            setIsLiking(false);
        }
    };

    const handleSave = async () => {
        const isCurrentlySaved = post.user_saved;
        setPost(prev => ({
            ...prev,
            user_saved: !isCurrentlySaved,
            save_count: isCurrentlySaved ? (prev.save_count || 0) - 1 : (prev.save_count || 0) + 1
        }));

        try {
            const endpoint = isCurrentlySaved
                ? `/api/posts/${post.id}/unsave`
                : `/api/posts/${post.id}/save`;
            await axios.post(endpoint);
        } catch {
            setPost(prev => ({
                ...prev,
                user_saved: isCurrentlySaved,
                save_count: isCurrentlySaved ? (prev.save_count || 0) + 1 : (prev.save_count || 0) - 1
            }));
        }
    };

    const handleReshare = async () => {
        const isCurrentlyReshared = !!post.user_reshared;
        setPost(prev => ({
            ...prev,
            user_reshared: !isCurrentlyReshared,
            repost_count: isCurrentlyReshared ? prev.repost_count - 1 : prev.repost_count + 1
        }));

        try {
            const endpoint = isCurrentlyReshared
                ? `/api/posts/${post.id}/unreshare`
                : `/api/posts/${post.id}/reshare`;
            await axios.post(endpoint);
        } catch {
            setPost(prev => ({
                ...prev,
                user_reshared: isCurrentlyReshared,
                repost_count: isCurrentlyReshared ? prev.repost_count + 1 : prev.repost_count - 1
            }));
        }
    };

    const formatCount = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    const isRepost = post.type === 'repost' && !!post.original_post;
    const mediaItem = isRepost ? post.original_post?.media?.[0] : post.media?.[0];
    const isVideo = mediaItem?.type === 'video' || mediaItem?.mime_type?.startsWith('video/');

    const displayContent = isRepost ? post.original_post?.content : post.content;

    const isFullscreen = variant === "fullscreen";

    return (
        <div
            className={`karads-mobile relative w-full snap-start bg-[#0b0e13] flex items-center justify-center ${
                isFullscreen ? "h-screen" : ""
            }`}
        >
            <div
                className={`${
                    isFullscreen
                        ? "w-full h-full lg:max-w-[480px] xl:max-w-[520px] lg:px-4 lg:py-6"
                        : "w-full px-4 pt-4 pb-6 lg:max-w-[760px] lg:px-6 lg:mx-auto"
                }`}
            >
                <div
                    className={`relative w-full overflow-hidden bg-[#11141a] ${
                        isFullscreen
                            ? "h-full rounded-none shadow-none lg:rounded-[32px] lg:border lg:border-white/10 lg:shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
                            : "h-[68vh] md:h-[50vh] lg:h-[60vh] rounded-[32px] shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
                    }`}
                >
                    <div className="absolute inset-0" onClick={handlePlayPause}>
                        {mediaItem ? (
                            isVideo ? (
                                <video
                                    ref={videoRef}
                                    src={mediaItem.path}
                                    className="h-full w-full  object-contain"
                                    loop
                                    playsInline
                                    muted={isMuted}
                                />
                            ) : (
                                <img
                                    src={mediaItem.path}
                                    alt="Post content"
                                    className="h-full w-full o"
                                />
                            )
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1f2b] via-[#151821] to-[#0f1117] p-6 text-center text-sm text-white/70">
                                {displayContent}
                            </div>
                        )}
                    </div>

                    {isVideo && (
                        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white">
                            <Play className="h-3 w-3" />
                            Live
                        </div>
                    )}

                    {!isPlaying && isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="rounded-full bg-black/40 p-4 backdrop-blur-sm">
                                <Play className="w-8 h-8 text-white fill-white" />
                            </div>
                        </div>
                    )}

                    {isVideo && (
                        <div className="absolute top-4 right-4 z-20">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleMute();
                                }}
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-6 right-4 flex flex-col items-center gap-4">
                        <div className="relative mb-1">
                            <Link href={`/@${post.user.username}`}>
                                <div className="relative">
                                    <Avatar className="h-11 w-11 border-2 border-white/60 transition-transform active:scale-90">
                                        <AvatarImage src={post.user.avatar} />
                                        <AvatarFallback>{post.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#0b0e13] bg-white text-black">
                                        <span className="text-xs font-bold leading-none">+</span>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-white/15 text-white backdrop-blur-sm transition-transform active:scale-90 hover:bg-white/25"
                                onClick={handleLike}
                            >
                                <Heart className={`h-5 w-5 ${post.user_liked ? 'fill-red-500 text-red-500' : 'text-current'}`} />
                            </Button>
                            <span className="text-xs font-semibold text-white drop-shadow-md">{formatCount(post.like_count)}</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <CommentSection
                                post={post}
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-full bg-white/15 text-white backdrop-blur-sm transition-transform active:scale-90 hover:bg-white/25"
                                    >
                                        <MessageCircle className="h-5 w-5 text-current" />
                                    </Button>
                                }
                            />
                            <span className="text-xs font-semibold text-white drop-shadow-md">{formatCount(post.comment_count)}</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-white/15 text-white backdrop-blur-sm transition-transform active:scale-90 hover:bg-white/25"
                                onClick={handleSave}
                            >
                                <Bookmark className={`h-5 w-5 ${post.user_saved ? 'fill-yellow-500 text-yellow-500' : 'text-current'}`} />
                            </Button>
                            <span className="text-xs font-semibold text-white drop-shadow-md">{formatCount(post.save_count || 0)}</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-white/15 text-white backdrop-blur-sm transition-transform active:scale-90 hover:bg-white/25"
                                onClick={handleReshare}
                            >
                                <Repeat2 className={`h-5 w-5 ${post.user_reshared ? 'text-green-500' : 'text-current'}`} />
                            </Button>
                            <span className="text-xs font-semibold text-white drop-shadow-md">{formatCount(post.repost_count)}</span>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-white/15 text-white backdrop-blur-sm transition-transform active:scale-90 hover:bg-white/25"
                                onClick={() => {
                                    const url = `${window.location.origin}/posts/${post.id}`;
                                    navigator.clipboard.writeText(url);
                                }}
                            >
                                <Share2 className="h-5 w-5 text-current" />
                            </Button>
                            <span className="text-xs font-semibold text-white drop-shadow-md">Share</span>
                        </div>

                        {isOwner && (
                            <div className="flex flex-col items-center gap-1">
                                <PostOwnerActions
                                    postId={post.id}
                                    content={post.content}
                                    media={post.media}
                                    onPostUpdated={(updates) => {
                                        setPost((prev) => ({ ...prev, content: updates.content, media: updates.media }));
                                        onPostUpdated?.(post.id, updates);
                                    }}
                                    onPostDeleted={() => {
                                        onPostDeleted?.(post.id);
                                    }}
                                />
                                <span className="text-xs font-semibold text-white drop-shadow-md">Manage</span>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-6 left-5 right-20 space-y-3 text-white">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 overflow-hidden rounded-full border border-white/40">
                                {post.user.avatar ? (
                                    <img src={post.user.avatar} alt={post.user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                                        {post.user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold">{post.user.name}</p>
                                <p className="text-xs text-white/70">@{post.user.username}</p>
                            </div>
                            <button className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#0b0e13]">
                                Follow
                            </button>
                        </div>
                        <p className="text-sm text-white/90 line-clamp-2">{displayContent}</p>
                        <div className="flex gap-3 text-xs text-white/60">
                            <span>#Lifestyle</span>
                            <span>#Music</span>
                        </div>
                    </div>
                </div>
            </div>

            {showHeartAnimation && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in duration-300 fade-out">
                    <Heart className="w-32 h-32 text-red-500 fill-red-500 drop-shadow-lg" />
                </div>
            )}
        </div>
    );
}
