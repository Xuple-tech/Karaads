import { MediaCarousel } from '@/components/media-carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { useFetch } from '@/hooks/use-fetch';
// AppLayout removed - wrapped by ProtectedRoute
import { Head } from '@/components/page-head';
import {
    Flame,
    Heart,
    MessageCircle,
    Repeat2,
    Search,
    Share,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface Post {
    id: string;
    content: string;
    created_at: string;
    like_count: number;
    comment_count: number;
    repost_count: number;
    media?: Array<{ id: string; file_path: string; file_type: string }>;
    user: User;
    user_liked: boolean;
}

export default function BrowsePage() {
    const [activeTab, setActiveTab] = useState('trending');
    const [selectedSearch, setSelectedSearch] = useState('');

    // Fetch trending posts
    const {
        data: postsData,
        loading: postsLoading,
        error: postsError,
        refetch: refetchPosts,
    } = useFetch<{ data: Post[] }>('/api/posts/trending', {
        skip: activeTab !== 'trending',
    });

    // Fetch feed posts
    const { data: feedData, loading: feedLoading } = useFetch<{ data: Post[] }>(
        '/api/posts/feed',
        {
            skip: activeTab !== 'for-you',
        },
    );

    // Fetch all posts
    const { data: allPostsData, loading: allPostsLoading } = useFetch<{
        data: Post[];
    }>('/api/posts', {
        skip: activeTab !== 'recent',
    });

    const posts =
        activeTab === 'trending'
            ? postsData?.data || []
            : activeTab === 'for-you'
              ? feedData?.data || []
              : allPostsData?.data || [];

    const loading =
        activeTab === 'trending'
            ? postsLoading
            : activeTab === 'for-you'
              ? feedLoading
              : allPostsLoading;

    const categories = [
        { name: 'For you', id: 'for-you', icon: Sparkles },
        { name: 'Trending', id: 'trending', icon: TrendingUp },
        { name: 'Recent', id: 'recent', icon: Flame },
    ];

    return (
        <>
            <Head title="Browse" />
            <div className="min-h-screen">
                {/* Header */}
                <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="p-3">
                        <div className="relative mb-4">
                            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={selectedSearch}
                                onChange={(e) =>
                                    setSelectedSearch(e.target.value)
                                }
                                className="w-full rounded-full border-0 bg-accent py-3 pr-4 pl-12 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>

                        {/* Category Tabs */}
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`flex items-center gap-2 rounded-full px-4 py-2 whitespace-nowrap transition-colors ${
                                        activeTab === cat.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-accent text-muted-foreground hover:bg-accent/80'
                                    }`}
                                >
                                    <cat.icon className="h-4 w-4" />
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-1">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Spinner />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Sparkles className="mb-4 h-12 w-12 opacity-50" />
                            <p>No posts yet. Be the first to post!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div
                                key={post.id}
                                className="cursor-pointer border-b border-border px-4 py-3 transition-colors hover:bg-accent/50"
                            >
                                <div className="flex gap-4">
                                    {/* Avatar */}
                                    <Avatar className="h-12 w-12 flex-shrink-0">
                                        <AvatarImage src={post.user.avatar} />
                                        <AvatarFallback>
                                            {post.user.name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold">
                                                {post.user.name}
                                            </p>
                                            <p className="text-muted-foreground">
                                                @
                                                {post.user.email?.split('@')[0]}
                                            </p>
                                            <p className="text-muted-foreground">
                                                ·
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(
                                                    post.created_at,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <p className="mt-2 text-sm break-words whitespace-pre-wrap">
                                            {post.content}
                                        </p>

                                        {/* Media */}
                                        {post.media && post.media.length > 0 && (
                                            <div className="mt-3 overflow-hidden rounded-xl bg-muted">
                                                <MediaCarousel
                                                    items={post.media}
                                                    resetKey={post.id}
                                                    className="overflow-hidden rounded-xl"
                                                    trackClassName="max-h-96 touch-pan-x"
                                                    renderItem={(media) => {
                                                        const isVideo =
                                                            media.file_type ===
                                                            'video';
                                                        return isVideo ? (
                                                            <video
                                                                src={
                                                                    media.file_path
                                                                }
                                                                className="max-h-96 w-full bg-black object-contain"
                                                                muted
                                                                playsInline
                                                                preload="metadata"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={
                                                                    media.file_path
                                                                }
                                                                alt="Post media"
                                                                className="max-h-96 w-full object-cover"
                                                            />
                                                        );
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Engagement Stats */}
                                        <div className="mt-3 flex gap-6 text-sm text-muted-foreground">
                                            <button className="group flex items-center gap-2 hover:text-blue-500">
                                                <MessageCircle className="h-4 h-8 w-4 w-8 rounded-full p-2 group-hover:bg-blue-500/20" />
                                                {post.comment_count}
                                            </button>
                                            <button className="group flex items-center gap-2 hover:text-green-500">
                                                <Repeat2 className="h-4 h-8 w-4 w-8 rounded-full p-2 group-hover:bg-green-500/20" />
                                                {post.repost_count}
                                            </button>
                                            <button className="group flex items-center gap-2 hover:text-red-500">
                                                <Heart
                                                    className="h-4 h-8 w-4 w-8 rounded-full p-2 group-hover:bg-red-500/20"
                                                    fill={
                                                        post.user_liked
                                                            ? 'currentColor'
                                                            : 'none'
                                                    }
                                                />
                                                {post.like_count}
                                            </button>
                                            <button className="group flex items-center gap-2 hover:text-blue-500">
                                                <Share className="h-4 h-8 w-4 w-8 rounded-full p-2 group-hover:bg-blue-500/20" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
