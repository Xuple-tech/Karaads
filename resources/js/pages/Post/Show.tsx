import { MobileActionSheet } from "@/components/mobile-action-sheet";
import { MomentPost, MomentsReelPost } from "@/components/moments-reel-post";
import { Head, usePage } from "@/components/page-head";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealtimePosts } from "@/hooks/use-realtime-posts";
import { useFetch } from "@/hooks/use-fetch";
import axiosInstance from "@/lib/axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Copy, Loader2, Share2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

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
  thumbnail?: string;
  type: string;
  mime_type?: string;
}

interface Post {
  id: string;
  content: string;
  type: "post" | "repost";
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

interface PostsResponse {
  data: Post[];
  links: { next: string | null };
  meta: { current_page: number; last_page: number };
}

interface PostShowProps {
  postId: string;
}

function normalizeToMomentPost(post: Post): MomentPost {
  return {
    ...post,
    user: {
      ...post.user,
    },
    media: post.media || [],
    original_post: post.original_post
      ? normalizeToMomentPost(post.original_post)
      : undefined,
  };
}

function ReelSkeleton() {
  return (
    <div className="mx-auto h-screen w-full max-w-[430px] overflow-hidden bg-[#0b0e13] sm:max-w-[460px] md:max-w-[560px] lg:max-w-[680px] xl:max-w-[760px]">
      <div className="flex h-full w-full flex-col justify-end p-4">
        <div className="mb-[96px] space-y-4 rounded-2xl bg-black/30 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36 bg-white/10" />
              <Skeleton className="h-3 w-24 bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-5 w-full bg-white/10" />
          <Skeleton className="h-5 w-4/5 bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function PostShow({ postId }: PostShowProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { auth } = usePage<{ auth?: { user?: User } }>().props;
  const currentUser = auth?.user;
  const shouldOpenComments = searchParams.get("comments") === "1";

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [followingByUser, setFollowingByUser] = useState<Record<string, boolean>>({});
  const [followBusyByUser, setFollowBusyByUser] = useState<Record<string, boolean>>({});
  const [followStatusResolved, setFollowStatusResolved] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const wheelScrollLockRef = useRef(false);

  const normalizedPosts = useMemo(() => posts.map(normalizeToMomentPost), [posts]);

  const { data: initialPost, loading: initialPostLoading } = useFetch<Post>(
    `/api/posts/${postId}`,
  );

  const fetchFollowingMap = useCallback(async () => {
    if (!currentUser?.id) {
      setFollowStatusResolved(false);
      setFollowingByUser({});
      return;
    }

    try {
      const response = await axiosInstance.get<{ data: Array<{ id: string }> }>(
        "/api/users/following",
      );
      const nextMap: Record<string, boolean> = {};
      for (const user of response.data?.data ?? []) {
        nextMap[user.id] = true;
      }
      setFollowingByUser(nextMap);
      setFollowStatusResolved(true);
    } catch {
      setFollowStatusResolved(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    void fetchFollowingMap();
  }, [fetchFollowingMap]);

  const fetchMorePosts = useCallback(
    async (pageNum: number) => {
      if (loading || (!hasMore && pageNum > 1)) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get<PostsResponse>("/api/posts", {
          params: { page: pageNum },
        });
        const data = response.data;
        const existingIds = new Set(posts.map((p) => p.id));
        const nextPosts = (data.data || []).filter(
          (p) => p.id !== postId && !existingIds.has(p.id),
        );
        setPosts((prev) => [...prev, ...nextPosts]);
        setHasMore(Boolean(data.links?.next) && data.meta.current_page < data.meta.last_page);
        setPage(data.meta.current_page);
      } catch (error) {
        console.error("Failed to fetch more posts:", error);
      } finally {
        setLoading(false);
      }
    },
    [hasMore, loading, postId, posts],
  );

  useEffect(() => {
    if (!initialPost) return;
    setPosts([initialPost]);
    setActiveIndex(0);
    void fetchMorePosts(1);
  }, [initialPost?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useRealtimePosts({
    userId: currentUser?.id,
    onPostCreated: () => {},
    onPostLiked: () => {},
    onError: (error) => console.error("WebSocket error:", error),
  });

  useEffect(() => {
    const root = containerRef.current;
    if (!root || posts.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number((entry.target as HTMLElement).dataset.index);
          if (!Number.isNaN(idx)) setActiveIndex(idx);
        }
      },
      { root, threshold: 0.72 },
    );

    itemRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [posts.length]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || normalizedPosts.length < 2) return;

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
      const nextIndex = Math.max(0, Math.min(normalizedPosts.length - 1, activeIndex + direction));
      if (nextIndex === activeIndex) return;

      const nextNode = itemRefs.current[nextIndex];
      if (!nextNode) return;

      wheelScrollLockRef.current = true;
      setActiveIndex(nextIndex);
      root.scrollTo({ top: nextNode.offsetTop, behavior: "smooth" });

      window.setTimeout(() => {
        wheelScrollLockRef.current = false;
      }, 620);
    };

    root.addEventListener("wheel", handleWheel, { passive: false });
    return () => root.removeEventListener("wheel", handleWheel);
  }, [activeIndex, normalizedPosts.length]);

  useEffect(() => {
    if (activeIndex >= posts.length - 2 && hasMore && !loading) {
      void fetchMorePosts(page + 1);
    }
  }, [activeIndex, posts.length, hasMore, loading, page, fetchMorePosts]);

  const updatePostById = useCallback((targetId: string, updater: (post: Post) => Post) => {
    const updatePostInTree = (post: Post): Post => {
      if (post.id === targetId) {
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

    setPosts((prev) => prev.map(updatePostInTree));
  }, []);

  const handleLike = useCallback(async (post: MomentPost) => {
    const currentlyLiked = Boolean(post.user_liked);
    updatePostById(post.id, (item) => ({
      ...item,
      user_liked: !currentlyLiked,
      like_count: currentlyLiked ? Math.max(0, item.like_count - 1) : item.like_count + 1,
    }));
    try {
      await axiosInstance.post(
        currentlyLiked ? `/api/posts/${post.id}/unlike` : `/api/posts/${post.id}/like`,
      );
    } catch {
      updatePostById(post.id, (item) => ({
        ...item,
        user_liked: currentlyLiked,
        like_count: currentlyLiked ? item.like_count + 1 : Math.max(0, item.like_count - 1),
      }));
    }
  }, [updatePostById]);

  const handleReshare = useCallback(async (post: MomentPost) => {
    const currentlyReshared = Boolean(post.user_reshared);
    updatePostById(post.id, (item) => ({
      ...item,
      user_reshared: !currentlyReshared,
      repost_count: currentlyReshared ? Math.max(0, item.repost_count - 1) : item.repost_count + 1,
    }));
    try {
      await axiosInstance.post(
        currentlyReshared ? `/api/posts/${post.id}/unreshare` : `/api/posts/${post.id}/reshare`,
      );
    } catch {
      updatePostById(post.id, (item) => ({
        ...item,
        user_reshared: currentlyReshared,
        repost_count: currentlyReshared ? item.repost_count + 1 : Math.max(0, item.repost_count - 1),
      }));
    }
  }, [updatePostById]);

  const handleFollow = useCallback(async (userId: string) => {
    if (!followStatusResolved) return;
    if (followBusyByUser[userId]) return;
    const wasFollowing = Boolean(followingByUser[userId]);
    setFollowBusyByUser((prev) => ({ ...prev, [userId]: true }));
    setFollowingByUser((prev) => ({ ...prev, [userId]: !wasFollowing }));
    try {
      await axiosInstance.post(`/api/users/${userId}/${wasFollowing ? "unfollow" : "follow"}`);
    } catch {
      setFollowingByUser((prev) => ({ ...prev, [userId]: wasFollowing }));
    } finally {
      setFollowBusyByUser((prev) => ({ ...prev, [userId]: false }));
    }
  }, [followBusyByUser, followStatusResolved, followingByUser]);

  const handlePostUpdated = useCallback((id: string, updates: { content: string; media: Media[] }) => {
    updatePostById(id, (item) => ({ ...item, content: updates.content, media: updates.media }));
  }, [updatePostById]);

  const handlePostDeleted = useCallback((id: string) => {
    setPosts((prev) => prev.filter((item) => item.id !== id));
    if (id === postId) {
      if (window.history.length > 1) return navigate(-1);
      navigate("/app");
    }
  }, [navigate, postId]);

  const activePost = posts[activeIndex];

  return (
    <>
      <Head title={activePost?.content?.slice(0, 30) || "Post"} />
      <div className="relative h-[100dvh] w-full overflow-hidden bg-[#0b0e13] xl:px-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-50">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent" />
          <div className="pointer-events-auto px-4 pt-[max(calc(env(safe-area-inset-top)+12px),12px)]">
            <div className="mx-auto flex w-full items-center justify-between md:max-w-[560px] lg:max-w-[680px] xl:max-w-[760px]">
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                    return;
                  }
                  navigate("/app");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/55 backdrop-blur-xl"
                aria-label="Back"
              >
                <ChevronLeft className="h-5 w-5 text-white/90" />
              </button>

              <p className="karads-heading text-sm font-semibold text-white/90">
                {activePost?.user?.username ? `@${activePost.user.username}` : "Post"}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const url = `${window.location.origin}/posts/${postId}`;
                    if (navigator.share) {
                      try {
                        await navigator.share({ url });
                        return;
                      } catch {}
                    }
                    await navigator.clipboard.writeText(url);
                    toast.success("Link copied");
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/55 backdrop-blur-xl"
                  aria-label="Share post"
                >
                  <Share2 className="h-4 w-4 text-white/90" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowActions(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/55 backdrop-blur-xl"
                  aria-label="More actions"
                >
                  <span className="text-lg leading-none text-white/90">⋯</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="karads-mobile dark mx-auto h-[100dvh] w-full overflow-y-auto snap-y snap-proximity scroll-smooth no-scrollbar overscroll-contain bg-[#0b0e13] sm:max-w-[460px] md:max-w-[560px] lg:max-w-[680px] xl:max-w-[760px] xl:rounded-[32px] xl:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          style={{
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
            overscrollBehaviorY: "contain",
          }}
        >
          {normalizedPosts.length === 0 && initialPostLoading ? (
            <div className="flex h-[100dvh] w-full items-center justify-center text-white">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            normalizedPosts.map((post, index) => {
              const canFollow = Boolean(
                followStatusResolved && currentUser?.id && String(currentUser.id) !== String(post.user.id),
              );
              return (
                <div
                  key={post.id}
                  ref={(node) => { itemRefs.current[index] = node; }}
                  data-index={index}
                  className="h-[100dvh] w-full snap-start"
                >
                  <MomentsReelPost
                    post={post}
                    currentUserId={currentUser?.id}
                    isActive={index === activeIndex}
                    isMuted={isMuted}
                    onToggleMute={() => setIsMuted((prev) => !prev)}
                    onLike={handleLike}
                    onReshare={handleReshare}
                    onFollow={handleFollow}
                    onPostUpdated={(id, updates) => handlePostUpdated(id, updates as { content: string; media: Media[] })}
                    onPostDeleted={handlePostDeleted}
                    isFollowing={Boolean(followingByUser[post.user.id])}
                    isFollowBusy={Boolean(followBusyByUser[post.user.id])}
                    canFollow={canFollow}
                    autoOpenComments={shouldOpenComments && index === 0}
                  />
                </div>
              );
            })
          )}
          {loading && normalizedPosts.length > 0 ? (
            <div className="h-[100dvh] w-full snap-start">
              <ReelSkeleton />
            </div>
          ) : null}
        </div>

        <MobileActionSheet open={showActions} onOpenChange={setShowActions} title="Post">
          <div className="space-y-2">
            <button
              type="button"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-left text-sm text-white"
              onClick={async () => {
                const url = `${window.location.origin}/posts/${postId}`;
                await navigator.clipboard.writeText(url);
                toast.success("Link copied");
                setShowActions(false);
              }}
            >
              <span className="inline-flex items-center gap-2"><Copy className="h-4 w-4" /> Copy link</span>
            </button>
          </div>
        </MobileActionSheet>
      </div>
    </>
  );
}
