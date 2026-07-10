import { MobileEmptyState } from "@/components/mobile-empty-state";
import { MobilePageShell } from "@/components/mobile-page-shell";
import { MobileTopBar } from "@/components/mobile-top-bar";
import { Head, Link } from "@/components/page-head";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Hash, Search } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { hashtagPath, normalizeHashtag } from "@/lib/hashtag";

interface PostResult {
  id: string;
  content: string;
  hashtags?: string[];
  like_count?: number;
  comment_count?: number;
  user?: {
    name?: string;
    username?: string;
    avatar?: string;
  };
}

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

function HashtagResultsSkeleton() {
  return (
    <div className="space-y-3 px-3 pb-4 pt-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-3/4" />
          <Skeleton className="mt-3 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export default function HashtagPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tag = "" } = useParams<{ tag: string }>();

  const normalizedTag = useMemo(() => normalizeHashtag(tag), [tag]);
  const canonicalPath = useMemo(() => hashtagPath(tag), [tag]);

  useEffect(() => {
    if (!canonicalPath) return;
    if (location.pathname !== canonicalPath) {
      navigate(canonicalPath, { replace: true });
    }
  }, [canonicalPath, location.pathname, navigate]);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["hashtag-page", "posts", normalizedTag],
    enabled: normalizedTag.length > 0,
    queryFn: async (): Promise<PostResult[]> => {
      const response = await axiosInstance.get(
        `/api/posts/hashtag/${encodeURIComponent(normalizedTag)}`,
      );
      return normalizeList<PostResult>(response.data);
    },
    staleTime: 10_000,
  });

  return (
    <>
      <Head title={normalizedTag ? `#${normalizedTag}` : "Hashtag"} />
      <MobilePageShell
        header={
          <MobileTopBar
            title={normalizedTag ? `#${normalizedTag}` : "Hashtag"}
            subtitle="Posts for this hashtag"
          />
        }
        contentClassName="pb-24"
      >
        <section className="px-3 pb-3 pt-2">
          <div className="rounded-2xl border border-white/10 bg-[#10141f]/85 px-4 py-3 text-sm text-white/80">
            Showing posts tagged with{" "}
            <span className="font-semibold text-white">
              #{normalizedTag || "tag"}
            </span>
          </div>
        </section>

        {isLoading ? <HashtagResultsSkeleton /> : null}

        {!isLoading && normalizedTag.length === 0 ? (
          <MobileEmptyState
            icon={Hash}
            title="Invalid hashtag"
            description="This hashtag URL is not valid."
          />
        ) : null}

        {!isLoading && normalizedTag.length > 0 && posts.length > 0 ? (
          <div className="space-y-3 px-2 pb-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/app/moments?post=${encodeURIComponent(post.id)}`}
                className="block rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm font-semibold text-white">
                  {post.user?.name || "Unknown"}
                  {post.user?.username ? ` @${post.user.username}` : ""}
                </p>
                <p className="mt-1 line-clamp-3 text-sm text-white/75">
                  {post.content?.trim() || "Open post"}
                </p>
                <p className="mt-2 text-xs text-white/50">
                  {post.like_count ?? 0} likes . {post.comment_count ?? 0}{" "}
                  comments
                </p>
              </Link>
            ))}
          </div>
        ) : null}

        {!isLoading && normalizedTag.length > 0 && posts.length === 0 ? (
          <MobileEmptyState
            icon={Search}
            title={`No posts for #${normalizedTag}`}
            description="Try another hashtag."
          />
        ) : null}
      </MobilePageShell>
    </>
  );
}
