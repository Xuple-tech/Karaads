import { MobileEmptyState } from "@/components/mobile-empty-state";
import { MobilePageShell } from "@/components/mobile-page-shell";
import { Head, Link } from "@/components/page-head";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import {
  PhoneCall,
  Search,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

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
  media?: Array<{
    id: string;
    path?: string;
    thumbnail?: string | null;
    type?: string;
    mime_type?: string;
  }>;
  user?: {
    name?: string;
    username?: string;
    avatar?: string;
  };
}

type SearchTab = "posts" | "people";

const suggestedSearches = [
  {
    label: "Kwati AI",
    href: "/kwati-ai",
    iconSrc: "/kwati-ai-icon.png",
  },
];

function normalizeList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown[] }).data)
  ) {
    return (payload as { data: T[] }).data;
  }

  return [];
}

function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-5 pb-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="min-h-[140px] rounded-[26px] border border-border bg-muted p-5"
        >
          <Skeleton className="h-7 w-28 bg-muted" />
          <Skeleton className="mt-2 h-4 w-20 bg-muted" />
          <div className="mt-8 space-y-3">
            <Skeleton className="h-10 w-10 rounded-full bg-muted" />
            <Skeleton className="h-10 w-10 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionCircle({ icon: Icon }: { icon: typeof PhoneCall }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted text-foreground backdrop-blur">
      <Icon className="h-4.5 w-4.5" />
    </div>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialTab: SearchTab =
    searchParams.get("type") === "people" ? "people" : "posts";

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [searchTab, setSearchTab] = useState<SearchTab>(initialTab);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (location.pathname !== "/search") return;

    const q = debouncedQuery.trim();
    const params = new URLSearchParams();

    if (q.length > 0) params.set("q", q);
    if (searchTab === "people") params.set("type", "people");

    const qs = params.toString();
    const target = qs ? `/search?${qs}` : "/search";
    const current = `${location.pathname}${location.search}`;

    if (current !== target) {
      navigate(target, { replace: true });
    }
  }, [debouncedQuery, location.pathname, location.search, navigate, searchTab]);

  const hasQuery = debouncedQuery.length > 0;

  const postsQuery = useQuery({
    queryKey: ["search-page", "posts", debouncedQuery],
    enabled: hasQuery && searchTab === "posts",
    queryFn: async (): Promise<PostResult[]> => {
      const response = await axiosInstance.get("/api/posts", {
        params: { search: debouncedQuery },
      });
      return normalizeList<PostResult>(response.data);
    },
    staleTime: 10_000,
  });

  const usersQuery = useQuery({
    queryKey: ["search-page", "users", debouncedQuery],
    enabled: hasQuery && searchTab === "people",
    queryFn: async (): Promise<UserResult[]> => {
      const response = await axiosInstance.get("/api/users", {
        params: { search: debouncedQuery },
      });
      return normalizeList<UserResult>(response.data);
    },
    staleTime: 10_000,
  });

  const discoverUsersQuery = useQuery({
    queryKey: ["search-page", "discover-users"],
    enabled: !hasQuery,
    queryFn: async (): Promise<UserResult[]> => {
      const response = await axiosInstance.get("/api/users");
      return normalizeList<UserResult>(response.data);
    },
    staleTime: 30_000,
  });

  const discoverPostsQuery = useQuery({
    queryKey: ["search-page", "discover-posts"],
    enabled: !hasQuery,
    queryFn: async (): Promise<PostResult[]> => {
      const response = await axiosInstance.get("/api/posts/trending");
      return normalizeList<PostResult>(response.data);
    },
    staleTime: 30_000,
  });

  const isLoading = searchTab === "posts" ? postsQuery.isLoading : usersQuery.isLoading;
  const posts = useMemo(() => postsQuery.data ?? [], [postsQuery.data]);
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const billboardUsers = useMemo(
    () => (discoverUsersQuery.data ?? []).slice(0, 4),
    [discoverUsersQuery.data],
  );
  const featuredPost = useMemo(
    () => (discoverPostsQuery.data ?? []).find((post) => (post.media?.length ?? 0) > 0) ?? null,
    [discoverPostsQuery.data],
  );

  const featuredMedia = featuredPost?.media?.[0];
  const featuredImage = featuredMedia?.thumbnail || featuredMedia?.path || null;

  const openSuggestedSearch = (href: string) => {
    navigate(href);
  };

  const focusSearchInput = () => {
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.scrollIntoView({
        block: "center",
        inline: "nearest",
      });
    });
  };

  const openProfile = () => {
    navigate(auth?.user?.username ? `/@${auth.user.username}` : "/profile");
  };

  return (
    <>
      <Head title="Discover" />
      <MobilePageShell withBottomNavSpacing={false} contentClassName="pb-5">
        <div className="px-3 pt-4">
          <div className="mx-auto max-w-[430px] overflow-hidden rounded-[38px] border border-border bg-card shadow-sm">
            <div className="px-4 pb-6 pt-5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Open profile"
                  onClick={openProfile}
                  data-no-swipe="true"
                  className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border bg-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition active:scale-[0.97]"
                >
                  {auth?.user?.avatar ? (
                    <img
                      src={auth.user.avatar}
                      alt={auth.user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-foreground">
                      {auth?.user?.name?.charAt(0)?.toUpperCase() || "K"}
                    </div>
                  )}
                </button>

                <h1 className="text-[16px] font-extrabold tracking-tight text-foreground">
                  Discover
                </h1>

                <button
                  type="button"
                  aria-label="Focus search"
                  onClick={focusSearchInput}
                  data-no-swipe="true"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted text-foreground backdrop-blur transition active:scale-[0.97]"
                >
                  <Search className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    id="discover-search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search creators, ads, or sounds..."
                    className="h-12 rounded-[18px] border-border bg-muted/30 pl-11 text-[15px] text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestedSearches.map((item) => {
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => openSuggestedSearch(item.href)}
                        className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-2 text-xs font-bold text-cyan-700 dark:text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/15"
                      >
                        <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-cyan-400/50 bg-cyan-100 dark:bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.4),_rgba(8,32,50,0.92)_72%)]">
                          <img
                            src={item.iconSrc}
                            alt={`${item.label} icon`}
                            className="h-full w-full object-contain p-0.5"
                            loading="lazy"
                          />
                        </span>
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {hasQuery ? (
                  <div className="mt-3 flex gap-2">
                    {[
                      { id: "posts" as const, label: "Posts" },
                      { id: "people" as const, label: "People" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSearchTab(tab.id)}
                        className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                          searchTab === tab.id
                            ? "bg-foreground text-background"
                            : "border border-border bg-muted/30 text-muted-foreground"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {hasQuery ? (
                <>
                  {isLoading ? <div className="mt-5"><SearchResultsSkeleton /></div> : null}

                  {!isLoading && searchTab === "posts" ? (
                    posts.length > 0 ? (
                      <div className="mt-5 space-y-3">
                        {posts.map((post) => (
                          <Link
                            key={post.id}
                            href={`/app/moments?post=${encodeURIComponent(post.id)}`}
                            className="block rounded-[24px] border border-border bg-muted/50 p-4"
                          >
                            <p className="text-sm font-extrabold text-foreground">
                              {post.user?.name || "Unknown"}
                              {post.user?.username ? ` @${post.user.username}` : ""}
                            </p>
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                              {post.content?.trim() || "Open post"}
                            </p>
                            <p className="mt-3 text-xs font-medium text-muted-foreground">
                              {post.like_count ?? 0} likes . {post.comment_count ?? 0} comments
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-6">
                        <MobileEmptyState
                          icon={Search}
                          title="No posts found"
                          description={`No posts matched "${debouncedQuery}".`}
                        />
                      </div>
                    )
                  ) : null}

                  {!isLoading && searchTab === "people" ? (
                    users.length > 0 ? (
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {users.map((user) => {
                          const CardInner = (
                            <>
                              <Avatar className="h-12 w-12 border border-border">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="bg-muted text-foreground">
                                  {(user.name || "?").charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="mt-4">
                                <p className="line-clamp-2 text-[15px] font-extrabold leading-6 text-foreground">
                                  {user.name}
                                </p>
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                  {user.username ? `@${user.username}` : "Member"}
                                </p>
                                <p className="mt-5 text-[11px] font-semibold text-muted-foreground">
                                  {user.bio || "Karaads creator"}
                                </p>
                              </div>
                            </>
                          );

                          const classes =
                            "block min-h-[180px] rounded-[26px] border border-border bg-card p-4";

                          return user.username ? (
                            <Link key={user.id} href={`/@${user.username}`} className={classes}>
                              {CardInner}
                            </Link>
                          ) : (
                            <div key={user.id} className={classes}>
                              {CardInner}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-6">
                        <MobileEmptyState
                          icon={Users}
                          title="No people found"
                          description={`No users matched "${debouncedQuery}".`}
                        />
                      </div>
                    )
                  ) : null}
                </>
              ) : (
                <>
                  <div className="mt-7">
                    <h2 className="text-[18px] font-extrabold text-foreground">Billboard</h2>
                  </div>

                  {discoverUsersQuery.isLoading ? (
                    <div className="mt-4">
                      <SearchResultsSkeleton />
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {billboardUsers.map((user, index) => {
                        const showDetails = index === 0 || index === 1 || index === 3;
                        const cardTone =
                          index === 3
                            ? "bg-card"
                            : "bg-card";

                        return (
                          <Link
                            key={user.id}
                            href={user.username ? `/@${user.username}` : "/search"}
                            className={`relative min-h-[142px] overflow-hidden rounded-[26px] border border-border ${cardTone} p-4 shadow-sm`}
                          >
                            <div className="pr-10">
                              {showDetails ? (
                                <>
                                  <p className="line-clamp-2 text-[16px] font-extrabold leading-8 text-foreground">
                                    {user.name}
                                  </p>
                                  <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                                    {user.bio || "Fall of Humanity"}
                                  </p>
                                </>
                              ) : (
                                <p className="text-[11px] font-semibold text-muted-foreground">
                                  {user.bio || "Fall of Humanity"}
                                </p>
                              )}
                            </div>

                            <div className="absolute bottom-4 right-4 flex flex-col gap-2.5">
                              <ActionCircle icon={PhoneCall} />
                              <ActionCircle icon={Video} />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {featuredPost ? (
                    <Link
                      href={`/app/moments?post=${encodeURIComponent(featuredPost.id)}`}
                      className="relative mt-8 block overflow-hidden rounded-[30px] border border-border bg-card"
                    >
                      <div className="absolute right-4 top-4 z-10 rounded-full bg-[#10b6ff] px-4 py-2 text-xs font-extrabold text-foreground shadow-[0_10px_24px_rgba(16,182,255,0.35)]">
                        Earn ₦0.80
                      </div>

                      {featuredMedia?.type === "video" || featuredMedia?.mime_type?.startsWith("video/") ? (
                        <video
                          src={featuredMedia.path}
                          className="h-[250px] w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                          poster={featuredMedia.thumbnail || undefined}
                        />
                      ) : featuredImage ? (
                        <img
                          src={featuredImage}
                          alt={featuredPost.content || "Featured post"}
                          className="h-[250px] w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-[250px] w-full bg-muted" />
                      )}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="line-clamp-2 text-sm font-bold text-foreground">
                          {featuredPost.content?.trim() || "Featured creator moment"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {featuredPost.user?.username
                            ? `@${featuredPost.user.username}`
                            : featuredPost.user?.name || "Karaads"}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div className="mt-8 rounded-[30px] border border-border bg-muted/30 p-6 text-center">
                      <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-3 text-sm font-semibold text-muted-foreground">
                        Featured posts will appear here.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </MobilePageShell>
    </>
  );
}
