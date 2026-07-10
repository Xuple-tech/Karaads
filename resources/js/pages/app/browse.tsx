import { MobileEmptyState } from '@/components/mobile-empty-state';
import { MobilePageShell } from '@/components/mobile-page-shell';
import { MobileSegmentedControl } from '@/components/mobile-segmented-control';
import { MobileTopBar } from '@/components/mobile-top-bar';
import { Head, Link } from '@/components/page-head';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import axiosInstance from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { Search, Sparkles, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface UserResult {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    bio?: string;
}

interface PostResult {
    id: string;
    content: string;
    like_count?: number;
    comment_count?: number;
    user?: {
        name?: string;
        username?: string;
        avatar?: string;
    };
}

type SearchTab = 'posts' | 'people';

const TRENDING_KEYWORDS = [
    'music',
    'comedy',
    'fashion',
    'sports',
    'motivation',
    'dance',
    'gaming',
    'business',
    'food',
    'travel',
] as const;

function normalizeList<T>(payload: unknown): T[] {
    if (Array.isArray(payload)) return payload as T[];

    if (
        payload &&
        typeof payload === 'object' &&
        'data' in payload &&
        Array.isArray((payload as { data?: unknown[] }).data)
    ) {
        return (payload as { data: T[] }).data;
    }

    return [];
}

function SearchResultsSkeleton() {
    return (
        <div className="space-y-3 px-3 pb-4 pt-2">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="mt-3 h-3 w-24" />
                </div>
            ))}
        </div>
    );
}

export default function SearchPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') ?? '';
    const initialTab: SearchTab = searchParams.get('type') === 'people' ? 'people' : 'posts';

    const [searchInput, setSearchInput] = useState(initialQuery);
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
    const [searchTab, setSearchTab] = useState<SearchTab>(initialTab);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchInput.trim()), 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        const q = debouncedQuery.trim();
        const params = new URLSearchParams();

        if (q.length > 0) params.set('q', q);
        if (searchTab === 'people') params.set('type', 'people');

        const qs = params.toString();
        navigate(qs ? `/search?${qs}` : '/search', { replace: true });
    }, [debouncedQuery, navigate, searchTab]);

    const hasQuery = debouncedQuery.length > 0;

    const postsQuery = useQuery({
        queryKey: ['search-page', 'posts', debouncedQuery],
        enabled: hasQuery && searchTab === 'posts',
        queryFn: async (): Promise<PostResult[]> => {
            const response = await axiosInstance.get('/api/posts', {
                params: { search: debouncedQuery },
            });
            return normalizeList<PostResult>(response.data);
        },
        staleTime: 10_000,
    });

    const usersQuery = useQuery({
        queryKey: ['search-page', 'users', debouncedQuery],
        enabled: hasQuery && searchTab === 'people',
        queryFn: async (): Promise<UserResult[]> => {
            const response = await axiosInstance.get('/api/users', {
                params: { search: debouncedQuery },
            });
            return normalizeList<UserResult>(response.data);
        },
        staleTime: 10_000,
    });

    const isLoading = searchTab === 'posts' ? postsQuery.isLoading : usersQuery.isLoading;
    const posts = useMemo(() => postsQuery.data ?? [], [postsQuery.data]);
    const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

    return (
        <>
            <Head title="Search" />
            <MobilePageShell
                header={<MobileTopBar title="Search" subtitle="Find posts and people" />}
                contentClassName="pb-24"
            >
                <section className="px-3 pb-3 pt-2">
                    <div className="rounded-2xl border border-white/10 bg-[#10141f]/85 p-3">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                            <Input
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Search posts or people"
                                className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/45"
                            />
                        </div>

                        <div className="mt-3">
                            <MobileSegmentedControl
                                value={searchTab}
                                onChange={(value) => setSearchTab(value)}
                                options={[
                                    { id: 'posts', label: 'Posts' },
                                    { id: 'people', label: 'People' },
                                ]}
                            />
                        </div>
                    </div>
                </section>

                {isLoading ? <SearchResultsSkeleton /> : null}

                {!isLoading && hasQuery && searchTab === 'posts' ? (
                    posts.length > 0 ? (
                        <div className="space-y-3 px-2 pb-4">
                            {posts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/app/moments?post=${encodeURIComponent(post.id)}`}
                                    className="block rounded-2xl border border-white/10 bg-white/5 p-4"
                                >
                                    <p className="text-sm font-semibold text-white">
                                        {post.user?.name || 'Unknown'}
                                        {post.user?.username ? ` @${post.user.username}` : ''}
                                    </p>
                                    <p className="mt-1 line-clamp-3 text-sm text-white/75">
                                        {post.content?.trim() || 'Open post'}
                                    </p>
                                    <p className="mt-2 text-xs text-white/50">
                                        {post.like_count ?? 0} likes . {post.comment_count ?? 0} comments
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <MobileEmptyState
                            icon={Search}
                            title="No posts found"
                            description={`No posts matched \"${debouncedQuery}\".`}
                        />
                    )
                ) : null}

                {!isLoading && hasQuery && searchTab === 'people' ? (
                    users.length > 0 ? (
                        <div className="space-y-2 px-3 pb-4">
                            {users.map((user) => {
                                const card = (
                                    <>
                                        <Avatar className="h-12 w-12 border border-white/15">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback className="bg-white/10 text-white">
                                                {(user.name || '?').charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                                            <p className="truncate text-xs text-white/60">
                                                {user.username ? `@${user.username}` : 'Member'}
                                            </p>
                                            {user.bio ? <p className="mt-0.5 truncate text-xs text-white/50">{user.bio}</p> : null}
                                        </div>
                                    </>
                                );

                                const cardClasses = 'flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3';

                                if (!user.username) {
                                    return (
                                        <div key={user.id} className={cardClasses}>
                                            {card}
                                        </div>
                                    );
                                }

                                return (
                                    <Link key={user.id} href={`/@${user.username}`} className={cardClasses}>
                                        {card}
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <MobileEmptyState
                            icon={Users}
                            title="No people found"
                            description={`No users matched \"${debouncedQuery}\".`}
                        />
                    )
                ) : null}

                {!hasQuery ? (
                    <section className="px-3 pb-4">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="mb-3 flex items-center gap-2">
                                {/* <Sparkles className="h-4 w-4 text-white/65" /> */}
                                <p className="text-sm font-semibold text-white">Trending keywords</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {TRENDING_KEYWORDS.map((keyword) => (
                                    <button
                                        key={keyword}
                                        type="button"
                                        onClick={() => setSearchInput(keyword)}
                                        className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/90 hover:bg-white/10"
                                    >
                                        #{keyword}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                ) : null}
            </MobilePageShell>
        </>
    );
}
