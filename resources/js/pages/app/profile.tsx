import { Head, Link, router, usePage } from "@/components/page-head";
// AppLayout removed - wrapped by ProtectedRoute
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/verified-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MobileActionSheet } from "@/components/mobile-action-sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileEditDialog } from "@/components/profile-edit-dialog";
import { LocationSetupDialog } from "@/components/location-setup-dialog";
import { LoadingImage, LoadingVideo } from "@/components/post-media-loader";
import { UserListModal } from "@/components/user-list-modal";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import axiosInstance from "@/lib/axios";
import { currencyCode, formatFromNgn } from "@/lib/currency";
import { getPresenceState } from "@/lib/presence";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Eye,
  Loader2,
  Grid3x3,
  Play,
  Heart,
  MessageCircle,
  Rocket,
  Lock,
  Mail,
  Megaphone,
  Wallet,
  TrendingUp,
  BarChart3,
  Bookmark,
  LinkIcon,
  Menu,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  country?: string | null;
  state?: string | null;
  location?: string | null;
  bio?: string;
  avatar?: string;
  avatar_variants?: {
    sm?: string | null;
    md?: string | null;
    lg?: string | null;
    original?: string | null;
  } | null;
  avatar_processing_status?:
    | "queued"
    | "processing"
    | "ready"
    | "failed"
    | "skipped"
    | null;
  avatar_url?: string;
  cover?: string;
  cover_variants?: {
    sm?: string | null;
    md?: string | null;
    lg?: string | null;
    original?: string | null;
  } | null;
  cover_processing_status?:
    | "queued"
    | "processing"
    | "ready"
    | "failed"
    | "skipped"
    | null;
  cover_url?: string;
  status?: "active" | "inactive" | "suspended" | "banned";
  is_online?: boolean;
  last_seen_at?: string | null;
  referral_code?: string;
  referred_by?: string;
  followers_count: number;
  following_count: number;
  created_at: string;
  is_following?: boolean;
  is_blocked?: boolean;
  has_blocked_me?: boolean;
  is_private?: boolean;
  is_verified?: boolean;
  has_verification_badge?: boolean;
  content_validation_agreed_at?: string | null;
  post_email_notifications_enabled?: boolean;
  referrals?: Array<{ id: string; status: string }>;
}

interface Post {
  id: string;
  content: string;
  type: "post" | "repost" | "quote";
  created_at: string;
  like_count: number;
  view_count?: number;
  repost_count?: number;
  comment_count?: number;
  user_id: string;
  user: User;
  user_liked?: boolean;
  user_reshared?: boolean;
  media?: Array<{ path: string; thumbnail?: string; type: string }>;
  original_post?: Post;
}

interface MonetizationDashboard {
  status: {
    is_monetized: boolean;
    activated_at?: string | null;
    fee_amount: number;
    fee_amount_formatted: string;
    can_pay_from_wallet: boolean;
  };
  summary: {
    views: number;
    likes: number;
    comments: number;
    posts_count: number;
  };
  daily: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
    posts_count: number;
  }>;
  posts: Array<{
    post_id: string;
    content: string;
    created_at?: string | null;
    views: number;
    likes: number;
    comments: number;
  }>;
}

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_withdrawn: number;
  pending_withdrawal: number;
  base_currency?: string;
  currency: string;
  display_currency?: string;
  exchange_rate?: number;
  wallet_currency?: string;
  is_active: boolean;
}

interface ReferralStats {
  referral_code: string;
  total_referred: number;
  active_referred: number;
  completed_referrals: number;
  pending_bonus: number;
  completed_bonus: number;
  referral_link: string;
}

interface PageProps {
  initialUser: User;
  isOwnProfile?: boolean;
  [key: string]: unknown;
}

export default function ProfilePage() {
  let { username } = useParams<{ username: string }>();
  const location = useLocation();
  const { auth } = useAuth();
  const page = usePage<PageProps>();
  const inertiaUser = page.props.initialUser;

  // If username is not from route params, try to extract from pathname (for /@username routes)
  if (!username && location.pathname.startsWith("/@")) {
    const match = location.pathname.match(/^\/@([^/]+)/);
    username = match ? match[1] : undefined;
  }

  if (username) {
    username = username.replace("@", "");
  }

  // Determine the API endpoint
  const endpoint = useMemo(() => {
    // For guests, use server-provided profile payload when available.
    if (!auth?.user) {
      if (inertiaUser && (!username || inertiaUser.username === username)) {
        return null;
      }
    }

    const url = username
      ? `/api/users/by-username/${username}`
      : "/api/users/profile";
    return url;
  }, [auth?.user, inertiaUser, username]);

  // Fetch user data if not provided via Inertia
  const {
    data: fetchedUser,
    loading,
    error: fetchError,
  } = useFetch<User>(endpoint || "", {
    skip: !endpoint,
    refetchInterval: 120_000,
  });

  if (fetchError) {
    console.error("Profile fetch error:", fetchError);
  }

  const user = fetchedUser || inertiaUser;

  const isOwnProfile = Boolean(
    auth?.user && user && (auth.user.id === user.id || auth.user.username === user.username),
  );

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground animate-pulse">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">User not found</h1>
        <Link href="/app">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <ProfileContent
      key={user.id}
      initialUser={user}
      isOwnProfile={isOwnProfile}
    />
  );
}

function getInitials(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "U";

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function hashStringToIndex(value: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return modulo === 0 ? 0 : hash % modulo;
}

function gradientClassForSeed(seed: string): string {
  const gradients = [
    "bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500",
    "bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400",
    "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500",
    "bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600",
    "bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500",
    "bg-gradient-to-br from-lime-500 via-green-500 to-emerald-600",
  ];

  return gradients[hashStringToIndex(seed || "user", gradients.length)];
}

function resolveDisplayPost(post: Post): Post {
  let current = post;
  let depth = 0;

  while (current.type === "repost" && current.original_post && depth < 8) {
    current = current.original_post;
    depth += 1;
  }

  return current;
}

function hasDisplayMedia(post: Post): boolean {
  const displayPost = resolveDisplayPost(post);
  return Boolean(displayPost.media && displayPost.media.length > 0);
}

function ProfileContent({
  initialUser,
  isOwnProfile,
}: {
  initialUser: User;
  isOwnProfile: boolean;
}) {
  const { auth, setAuth } = useAuth();
  const agreementPromptStorageKey = useMemo(
    () => `karaads-content-agreement-accepted:${initialUser.id}`,
    [initialUser.id],
  );
  const [user, setUser] = useState<User>(initialUser);
  const [isFollowing, setIsFollowing] = useState(
    Boolean(initialUser.is_following),
  );
  const [followStatusConfirmed, setFollowStatusConfirmed] = useState(
    isOwnProfile || typeof initialUser.is_following === "boolean",
  );
  const [isBlocked, setIsBlocked] = useState(initialUser.is_blocked || false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [userListModal, setUserListModal] = useState<{
    open: boolean;
    type: "followers" | "following";
  }>({ open: false, type: "followers" });
  const [showActions, setShowActions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [showMonetizationDialog, setShowMonetizationDialog] = useState(false);
  const [monetizationDashboard, setMonetizationDashboard] =
    useState<MonetizationDashboard | null>(null);
  const [monetizationLoading, setMonetizationLoading] = useState(false);
  const [isAgreementDialogOpen, setIsAgreementDialogOpen] = useState(false);
  const [isSubmittingAgreement, setIsSubmittingAgreement] = useState(false);
  const [postEmailNotificationsEnabled, setPostEmailNotificationsEnabled] =
    useState(Boolean(initialUser.post_email_notifications_enabled ?? true));
  const [isUpdatingEmailNotifications, setIsUpdatingEmailNotifications] =
    useState(false);
  const [locationPromptDismissed, setLocationPromptDismissed] = useState(false);

  // Infinite scroll state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsNextPage, setPostsNextPage] = useState<number | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
  const [isInitiallyLoading, setIsInitiallyLoading] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [bookmarksCursor, setBookmarksCursor] = useState<string | null>(null);
  const [hasMoreBookmarks, setHasMoreBookmarks] = useState(true);
  const [isLoadingMoreBookmarks, setIsLoadingMoreBookmarks] = useState(false);
  const [isBookmarksInitiallyLoading, setIsBookmarksInitiallyLoading] = useState(true);
  const bookmarksObserverTarget = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const { data: walletData, loading: walletLoading } = useFetch<Wallet>(
    `/api/wallet`,
    { skip: !isOwnProfile },
  );

  const { data: referralStats, loading: referralLoading } =
    useFetch<ReferralStats>(`/api/referrals/stats`, {
      skip: !isOwnProfile || user.status !== "active",
    });

  const loadMonetizationDashboard = useCallback(async () => {
    if (!isOwnProfile) return;

    setMonetizationLoading(true);
    try {
      const response = await axiosInstance.get("/api/users/monetization-dashboard", {
        params: { days: 30 },
      });
      setMonetizationDashboard(response.data);
    } catch (error) {
      console.error("Failed to load monetization dashboard:", error);
      toast.error("Unable to load monetization dashboard");
    } finally {
      setMonetizationLoading(false);
    }
  }, [isOwnProfile]);

  useEffect(() => {
    if (showMonetizationDialog) {
      void loadMonetizationDashboard();
    }
  }, [showMonetizationDialog, loadMonetizationDashboard]);

  const resolveNextPostsPage = (response: any): number | null => {
    const currentPage = Number(response?.meta?.current_page ?? 1);
    const lastPage = Number(response?.meta?.last_page ?? 1);
    return currentPage < lastPage ? currentPage + 1 : null;
  };

  // Load initial posts
  useEffect(() => {
    const loadInitialPosts = async () => {
      setIsInitiallyLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/users/${initialUser.id}/posts`,
          { params: { page: 1, per_page: 36 } }
        );
        const { data: newPosts } = response.data;
        setPosts(newPosts || []);
        const nextPage = resolveNextPostsPage(response.data);
        setPostsNextPage(nextPage);
        setHasMorePosts(Boolean(nextPage));
      } catch (err) {
        console.error("Failed to load initial posts", err);
      } finally {
        setIsInitiallyLoading(false);
      }
    };
    loadInitialPosts();
  }, [initialUser.id]);

  // Load more posts when scrolling
  const loadMorePosts = useCallback(async () => {
    if (!hasMorePosts || isLoadingMorePosts || !postsNextPage) return;

    setIsLoadingMorePosts(true);
    try {
      const response = await axiosInstance.get(
        `/api/users/${initialUser.id}/posts`,
        { params: { page: postsNextPage, per_page: 36 } }
      );
      const { data: newPosts } = response.data;
      setPosts((prev) => [...prev, ...(newPosts || [])]);
      const nextPage = resolveNextPostsPage(response.data);
      setPostsNextPage(nextPage);
      setHasMorePosts(Boolean(nextPage));
    } catch (err) {
      console.error("Failed to load more posts", err);
    } finally {
      setIsLoadingMorePosts(false);
    }
  }, [initialUser.id, postsNextPage, hasMorePosts, isLoadingMorePosts]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePosts && !isLoadingMorePosts && postsNextPage) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMorePosts, isLoadingMorePosts, postsNextPage, loadMorePosts]);

  // Load initial bookmarks (only for own profile)
  useEffect(() => {
    if (!isOwnProfile) {
      setIsBookmarksInitiallyLoading(false);
      return;
    }

    const loadInitialBookmarks = async () => {
      setIsBookmarksInitiallyLoading(true);
      try {
        const response = await axiosInstance.get(`/api/bookmarks`, {
          params: { limit: 20 },
        });
        const { data: newBookmarks, pagination } = response.data;
        setBookmarks(newBookmarks || []);
        setBookmarksCursor(pagination?.next_cursor || null);
        setHasMoreBookmarks(Boolean(pagination?.has_more));
      } catch (err) {
        console.error("Failed to load initial bookmarks", err);
      } finally {
        setIsBookmarksInitiallyLoading(false);
      }
    };
    loadInitialBookmarks();
  }, [isOwnProfile]);

  // Load more bookmarks when scrolling
  const loadMoreBookmarks = useCallback(async () => {
    if (!hasMoreBookmarks || isLoadingMoreBookmarks || !bookmarksCursor || !isOwnProfile)
      return;

    setIsLoadingMoreBookmarks(true);
    try {
      const response = await axiosInstance.get(`/api/bookmarks`, {
        params: { cursor: bookmarksCursor, limit: 20 },
      });
      const { data: newBookmarks, pagination } = response.data;
      setBookmarks((prev) => [...prev, ...(newBookmarks || [])]);
      setBookmarksCursor(pagination?.next_cursor || null);
      setHasMoreBookmarks(Boolean(pagination?.has_more));
    } catch (err) {
      console.error("Failed to load more bookmarks", err);
    } finally {
      setIsLoadingMoreBookmarks(false);
    }
  }, [bookmarksCursor, hasMoreBookmarks, isLoadingMoreBookmarks, isOwnProfile]);

  // Intersection Observer for bookmarks infinite scroll
  useEffect(() => {
    if (!bookmarksObserverTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMoreBookmarks &&
          !isLoadingMoreBookmarks &&
          bookmarksCursor
        ) {
          loadMoreBookmarks();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(bookmarksObserverTarget.current);
    return () => observer.disconnect();
  }, [hasMoreBookmarks, isLoadingMoreBookmarks, bookmarksCursor, loadMoreBookmarks]);

  useEffect(() => {
    setUser(initialUser);
    setLocationPromptDismissed(false);
    setPostEmailNotificationsEnabled(
      Boolean(initialUser.post_email_notifications_enabled ?? true),
    );
  }, [initialUser]);

  const shouldShowLocationSetup = Boolean(
    isOwnProfile &&
      !locationPromptDismissed &&
      ((user.country ?? "").trim() === "" || (user.location ?? "").trim() === ""),
  );

  const handleLocationSaved = useCallback(
    (updatedUser: Record<string, unknown>) => {
      setUser((prev) => ({
        ...prev,
        ...(updatedUser as Partial<User>),
      }));

      if (auth?.user) {
        setAuth({
          ...auth,
          user: {
            ...auth.user,
            ...updatedUser,
          } as typeof auth.user,
        });
      }

      setLocationPromptDismissed(true);
    },
    [auth, setAuth],
  );

  const updatePostEmailNotifications = useCallback(
    async (enabled: boolean) => {
      const previous = postEmailNotificationsEnabled;
      setPostEmailNotificationsEnabled(enabled);
      setUser((prev) => ({
        ...prev,
        post_email_notifications_enabled: enabled,
      }));
      setIsUpdatingEmailNotifications(true);

      try {
        const response = await axiosInstance.patch(
          "/api/users/notification-settings",
          {
            post_email_notifications_enabled: enabled,
          },
        );
        const saved = Boolean(
          response.data?.post_email_notifications_enabled ?? enabled,
        );
        setPostEmailNotificationsEnabled(saved);
        setUser((prev) => ({
          ...prev,
          post_email_notifications_enabled: saved,
        }));
        if (auth?.user) {
          setAuth({
            ...auth,
            user: {
              ...auth.user,
              post_email_notifications_enabled: saved,
            },
          });
        }
        toast.success(
          saved
            ? "Post email notifications are on."
            : "Post email notifications are off.",
        );
      } catch (error) {
        setPostEmailNotificationsEnabled(previous);
        setUser((prev) => ({
          ...prev,
          post_email_notifications_enabled: previous,
        }));
        toast.error("Could not update email notification setting.");
      } finally {
        setIsUpdatingEmailNotifications(false);
      }
    },
    [auth, postEmailNotificationsEnabled, setAuth],
  );

  useEffect(() => {
    if (isOwnProfile) {
      setFollowStatusConfirmed(true);
      setIsFollowing(false);
      return;
    }

    if (typeof initialUser.is_following === "boolean") {
      setFollowStatusConfirmed(true);
      setIsFollowing(initialUser.is_following);
      return;
    }

    setFollowStatusConfirmed(false);
  }, [initialUser.is_following, isOwnProfile]);

  const wallet = walletData;
  const profileUrl = `${window.location.origin}/@${user.username}`;

  const copyProfileLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied");
    } catch {
      toast.error("Unable to copy profile link");
    }
  }, [profileUrl]);

  const shareProfile = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${user.name} on Karaads`,
          text: `Check out @${user.username} on Karaads`,
          url: profileUrl,
        });
      } else {
        await copyProfileLink();
      }
    } catch {
      // Ignore cancelled native shares.
    }
  }, [copyProfileLink, profileUrl, user.name, user.username]);

  const avatarFromPosts = useMemo(() => {
    for (const post of posts) {
      const media = resolveDisplayPost(post).media?.[0];
      if (!media) continue;
      if (media.type === "video") continue;
      return media.thumbnail || media.path;
    }

    // Fall back to a video thumbnail if that's all we have.
    const firstVideo = posts
      .map((post) => resolveDisplayPost(post))
      .find((post) => post.media?.[0]?.type === "video")?.media?.[0];
    return firstVideo?.thumbnail || undefined;
  }, [posts]);

  // Prioritize user's cover picture, fall back to hero image from posts
  const displayCoverImage = useMemo(() => {
    if (user.cover) {
      if (user.cover.startsWith('http') || user.cover.startsWith('/')) {
        return user.cover;
      }

      return `/storage/${user.cover}`;
    }

    // Fall back to hero image from posts
    for (const post of posts) {
      if (post.type === "repost") continue;
      const media = post.media?.[0];
      if (!media) continue;
      if (media.type === "video") continue;
      return media.thumbnail || media.path;
    }
    return undefined;
  }, [user.cover, posts]);

  const avatarSrc = useMemo(() => {
    const preferredAvatar = user.avatar_variants?.md || user.avatar;
    const hasCustomAvatar =
      Boolean(preferredAvatar) &&
      !preferredAvatar?.includes("ui-avatars.com/api");
    if (hasCustomAvatar) return preferredAvatar;
    return avatarFromPosts;
  }, [user.avatar, user.avatar_variants, avatarFromPosts]);

  const avatarFallback = useMemo(() => {
    const initialsSource = user.name || user.username || "User";
    return getInitials(initialsSource);
  }, [user.name, user.username]);

  const avatarGradientClass = useMemo(
    () => gradientClassForSeed(user.username || user.id),
    [user.username, user.id],
  );
  const presence = useMemo(() => getPresenceState(user), [user]);
  const totalLikes = useMemo(
    () =>
      posts.reduce((sum, post) => {
        const displayPost = resolveDisplayPost(post);
        return sum + (displayPost.like_count || 0);
      }, 0),
    [posts],
  );
  const totalViews = useMemo(
    () =>
      posts.reduce((sum, post) => {
        const displayPost = resolveDisplayPost(post);
        return sum + (displayPost.view_count || post.view_count || 0);
      }, 0),
    [posts],
  );

  const formatEngagement = (num: number) => {
    if (num >= 1000000) {
      const val = num / 1000000;
      return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + "M";
    }
    if (num >= 1000) {
      const val = num / 1000;
      return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + "K";
    }
    return num.toString();
  };

  const walletCurrencyLabel = currencyCode(wallet);
  const formatNaira = (amount: number) => formatFromNgn(amount, wallet);

  const handleAgreeToContentValidation = useCallback(async () => {
    setIsSubmittingAgreement(true);
    try {
      const response = await axiosInstance.patch("/api/users/profile", {
        content_validation_agreed: true,
      });
      const updatedUser = response.data?.user?.data || response.data?.user;
      const acceptedAt =
        updatedUser?.content_validation_agreed_at || new Date().toISOString();

      setUser((prev) => ({
        ...prev,
        ...(updatedUser || {}),
        content_validation_agreed_at: acceptedAt,
      }));

      if (typeof window !== "undefined") {
        window.localStorage.setItem(agreementPromptStorageKey, "true");
      }

      setIsAgreementDialogOpen(false);
      toast.success("Content validation agreement accepted");
    } catch (err) {
      console.error("Failed to save content validation agreement", err);
      toast.error("Unable to save your agreement right now");
    } finally {
      setIsSubmittingAgreement(false);
    }
  }, [agreementPromptStorageKey]);

  const handleFollow = async () => {
    if (isBlocked || !followStatusConfirmed) return;
    try {
      if (isFollowing) {
        const response = await axiosInstance.post(
          `/api/users/${user.id}/unfollow`,
        );
        if (response.status === 200 || response.status === 201) {
          setUser((prev) => ({
            ...prev,
            followers_count: prev.followers_count - 1,
          }));
          setIsFollowing(false);
        }
      } else {
        const response = await axiosInstance.post(
          `/api/users/${user.id}/follow`,
        );
        if (response.status === 200 || response.status === 201) {
          setUser((prev) => ({
            ...prev,
            followers_count: prev.followers_count + 1,
          }));
          setIsFollowing(true);
        }
      }
    } catch (err) {
      console.error("Failed to follow/unfollow user", err);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const formData = new FormData();
      formData.append('cover', file);
      const response = await axiosInstance.patch('/api/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = response.data?.user;
      if (updatedUser?.cover) {
        setUser((prev) => ({ ...prev, cover: updatedUser.cover }));
      }
      toast.success('Cover updated');
    } catch {
      toast.error('Failed to update cover');
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleBlockToggle = async () => {
    try {
      if (isBlocked) {
        const response = await axiosInstance.post(
          `/api/users/${user.id}/unblock`,
        );
        if (response.status === 200 || response.status === 201) {
          setIsBlocked(false);
        }
      } else {
        const response = await axiosInstance.post(
          `/api/users/${user.id}/block`,
        );
        if (response.status === 200 || response.status === 201) {
          setIsBlocked(true);
          setIsFollowing(false);
        }
      }
    } catch (err) {
      console.error("Failed to toggle block state", err);
      toast.error("Failed to update block status");
    }
  };

  const PostGridItem = ({ post }: { post: Post }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const displayPost = resolveDisplayPost(post);
    const media = displayPost?.media?.[0];
    const thumbnailSrc = media ? media.thumbnail || media.path : undefined;
    const mediaType = media?.type?.toLowerCase() ?? "";
    const mediaPath = media?.path ?? "";
    const isVideo =
      mediaType === "video" ||
      mediaType.startsWith("video/") ||
      /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(mediaPath);
    const hasVideoPreview = isVideo && Boolean(media?.path);
    const viewCount = displayPost?.view_count ?? post.view_count ?? 0;
    const boostPostId = displayPost?.id ?? post.id;

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !hasVideoPreview) return;

      video.muted = true;
      video.playsInline = true;
      void video.play().catch(() => {
        // Some browsers only allow autoplay after the user has interacted.
      });
    }, [hasVideoPreview, mediaPath]);

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          router.visit(`/app/moments?post=${encodeURIComponent(post.id)}`);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            router.visit(`/app/moments?post=${encodeURIComponent(post.id)}`);
          }
        }}
        className="block rounded-3xl overflow-hidden aspect-[4/5] relative group bg-card border border-white/5"
      >
        {hasVideoPreview ? (
          <>
            <LoadingVideo
              ref={videoRef}
              src={media?.path}
              poster={media?.thumbnail}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
            {isVideo && (
              <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                <Play className="h-3 w-3 text-foreground" />
              </div>
            )}
            {post.type === "repost" && (
              <div className="absolute top-2 left-2 bg-black/60 rounded-full px-2 py-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-foreground" />
                <span className="text-[10px] font-semibold text-foreground">
                  Repost
                </span>
              </div>
            )}
          </>
        ) : thumbnailSrc ? (
          <>
            <LoadingImage
              src={thumbnailSrc}
              alt="Post"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Hide broken preview; fallback layer below handles rendering.
                e.currentTarget.style.display = "none";
              }}
            />
            {post.type === "repost" && (
              <div className="absolute top-2 left-2 bg-black/60 rounded-full px-2 py-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-foreground" />
                <span className="text-[10px] font-semibold text-foreground">
                  Repost
                </span>
              </div>
            )}
          </>
        ) : (
          <div
            className={cn(
              "w-full h-full flex flex-col items-center justify-center p-4",
              gradientClassForSeed(post.id),
            )}
          >
            {post.type === "repost" && (
              <div className="mb-2 text-foreground/80 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Reposted</span>
              </div>
            )}
            <p className="text-foreground text-sm text-center line-clamp-3 italic">
              {displayPost?.content ||
                post.content ||
                (post.type === "repost" ? "Reshared a post" : "")}
            </p>
          </div>
        )}

        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-[0_8px_20px_rgba(0,0,0,0.28)]">
          <Eye className="h-3.5 w-3.5" />
          <span>{formatEngagement(viewCount)}</span>
        </div>

        {isOwnProfile ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              router.visit(`/ads/create?mode=boost&post=${encodeURIComponent(boostPostId)}`);
            }}
            className="absolute right-2 top-2 z-20 flex items-center gap-1 rounded-full border border-border bg-black/70 px-2.5 py-1 text-[11px] font-extrabold text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-black/85"
            title="Boost post"
          >
            <Rocket className="h-3.5 w-3.5" />
            Boost
          </button>
        ) : null}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <div className="flex items-center gap-1 text-foreground">
            <Heart className="h-4 w-4 fill-white" />
            <span className="text-sm font-medium">
              {formatEngagement(post.like_count)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-foreground">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {formatEngagement(post.comment_count || 0)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head title={`${user.name} (@${user.username})`} />
      <LocationSetupDialog
        open={shouldShowLocationSetup}
        user={user}
        onDismiss={() => setLocationPromptDismissed(true)}
        onSaved={handleLocationSaved}
      />

      <div className="karads-mobile mobile-page-bg min-h-screen bg-background pb-24 font-sans text-foreground lg:pb-14">
        {isMobile ? (
          <div className="mx-auto max-w-[430px] px-2 pt-3">
            <div className="relative overflow-hidden rounded-[38px] border border-border bg-card shadow-sm">
              {displayCoverImage ? (
                <div className="absolute inset-x-0 top-0 h-[160px] overflow-hidden">
                  <img
                    src={displayCoverImage}
                    alt={`${user.name} cover`}
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,transparent_55%)]" />
                </div>
              ) : null}
              <div className="pointer-events-none absolute inset-x-0 top-[160px] bottom-0 bg-card" />

              <div className="relative px-5 pb-6 pt-8">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={isOwnProfile ? copyProfileLink : () => window.history.back()}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur-sm"
                  >
                    {isOwnProfile ? <UserPlus className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                  </button>

                  <div className="text-center">
                    <p className="text-[11px] font-bold tracking-[0.24em] text-muted-foreground">
                      PROFILE
                    </p>
                    <div className="mt-1 flex items-center justify-center gap-0 text-foreground">
                      <span className="text-[14px] font-bold">@{user.username}</span>
                      {user.has_verification_badge ? (
                        <VerifiedBadge compact className="-ml-2.5" />
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur-sm"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-7 flex flex-col items-center text-center">
                  <div className="rounded-full bg-[linear-gradient(135deg,#07d7ff,#835dff)] p-[2px]">
                    <Avatar className="h-28 w-28 rounded-full border-4 border-card">
                      {avatarSrc ? (
                        <AvatarImage src={avatarSrc} className="object-cover" />
                      ) : null}
                      <AvatarFallback
                        className={cn(
                          "text-2xl font-extrabold text-foreground",
                          avatarGradientClass,
                        )}
                      >
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="mt-5 flex items-center justify-center gap-0">
                    <h1 className="text-[22px] font-extrabold tracking-tight text-foreground">
                      {user.name}
                    </h1>
                    {user.has_verification_badge ? (
                      <VerifiedBadge className="-ml-3" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-[15px] font-semibold text-muted-foreground">
                    @{user.username}
                  </p>
                  {isOwnProfile && !user.content_validation_agreed_at ? (
                    <button
                      type="button"
                      onClick={() => setIsAgreementDialogOpen(true)}
                      className="mt-3 inline-flex items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200 transition hover:bg-amber-400/18"
                    >
                      Content agreement pending
                    </button>
                  ) : null}
                  <div className="mt-2 flex items-center justify-center gap-2 text-center">
                    <span
                      className={`inline-flex h-2.5 w-2.5 rounded-full ${
                        presence.isOnline
                          ? "bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.85)]"
                          : "bg-muted"
                      }`}
                    />
                    <p
                      className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
                        presence.isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                      }`}
                    >
                      {presence.statusLabel}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {presence.detailLabel}
                    </p>
                  </div>
                  <p className="mt-4 max-w-[290px] text-sm font-medium text-muted-foreground">
                    {user.bio || "Creating the best content & earning daily! 🚀"}
                  </p>
                </div>

                <div className="mt-7 grid grid-cols-3 gap-3 text-center">
                  <button
                    type="button"
                    onClick={() => setUserListModal({ open: true, type: "following" })}
                    className="space-y-1"
                  >
                    <div className="text-[16px] font-extrabold text-foreground">
                      {formatEngagement(user.following_count)}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground">
                      Following
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserListModal({ open: true, type: "followers" })}
                    className="space-y-1"
                  >
                    <div className="text-[16px] font-extrabold text-foreground">
                      {formatEngagement(user.followers_count)}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground">
                      Followers
                    </div>
                  </button>
                  <div className="space-y-1">
                    <div className="text-[16px] font-extrabold text-foreground">
                      {formatEngagement(totalLikes)}
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">Likes</div>
                  </div>
                </div>

                <div
                  className={cn(
                    "mt-6 gap-3",
                    isOwnProfile ? "grid grid-cols-1" : "grid grid-cols-2",
                  )}
                >
                  {isOwnProfile ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 rounded-[14px] border-border bg-muted text-sm font-bold text-foreground hover:bg-muted/80"
                        onClick={shareProfile}
                      >
                        Share Profile
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="h-12 rounded-[14px] bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90"
                        onClick={handleFollow}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="h-12 rounded-[14px] border-border bg-muted text-sm font-bold text-foreground hover:bg-muted/80"
                      >
                        <Link to={`/messages/${user.id}`}>Message</Link>
                      </Button>
                    </>
                  )}
                </div>

                {isOwnProfile ? (
                  <div className="mt-8 rounded-[28px] border border-border bg-muted/30 p-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="h-10 rounded-[14px] border border-border bg-card text-sm font-bold text-foreground hover:bg-muted"
                        onClick={() => setIsEditDialogOpen(true)}
                      >
                        Edit Profile
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-[14px] border border-emerald-300/30 bg-[linear-gradient(90deg,rgba(52,245,164,0.12),rgba(8,210,255,0.08))] text-sm font-bold text-foreground hover:bg-muted"
                        onClick={() => setShowReferralDialog(true)}
                      >
                        Referrals
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 rounded-[14px] border border-[#53786f] bg-[linear-gradient(90deg,bg-muted text-sm font-bold text-foreground hover:bg-muted/80"
                        onClick={() => navigate("/ads")}
                      >
                        Promote
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-[14px] border border-amber-300/30 bg-[linear-gradient(90deg,rgba(255,197,91,0.12),rgba(8,210,255,0.06))] text-sm font-bold text-foreground hover:bg-muted"
                        onClick={() => navigate("/monetization")}
                      >
                        Monetization
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-[14px] border border-[#53786f] bg-[linear-gradient(90deg,bg-muted px-0 text-foreground hover:bg-muted/80"
                        onClick={copyProfileLink}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[17px] font-semibold text-muted-foreground">
                          Wallet
                        </div>
                        <div className="mt-1 text-[24px] font-extrabold tracking-tight text-[#93f7b6]">
                          {walletLoading ? "..." : formatNaira(wallet?.balance ?? 0)}
                        </div>
                      </div>
                      <Button
                        type="button"
                        className="h-11 rounded-full bg-emerald-600 px-6 text-sm font-bold text-white hover:bg-emerald-700"
                        onClick={() => router.visit("/earn?action=withdraw")}
                      >
                        CASH OUT
                      </Button>
                    </div>
                  </div>
                ) : null}

                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => navigate("/monetization")}
                    className="mt-4 flex w-full items-center justify-between gap-4 rounded-[24px] border border-amber-300/30 bg-card p-4 text-left text-foreground shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ffc55b] text-[#06131f] shadow-[0_0_20px_rgba(255,197,91,0.24)]">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold">Monetization dashboard</p>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">
                          See post views, likes, comments, and activation status.
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#07111f]">
                      Open
                    </span>
                  </button>
                ) : null}

                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => navigate("/ads")}
                    className="mt-4 flex w-full items-center justify-between gap-4 rounded-[24px] border border-cyan-300/30 bg-card p-4 text-left text-foreground shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                        <Megaphone className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold">Ads management</p>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">
                          Track views, people reached, clicks, and ad spend.
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#07111f]">
                      Open
                    </span>
                  </button>
                ) : null}

                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => setShowReferralDialog(true)}
                    className="mt-4 flex w-full items-center justify-between gap-4 rounded-[24px] border border-emerald-300/30 bg-card p-4 text-left text-foreground shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#34f5a4] text-[#06131f] shadow-[0_0_20px_rgba(52,245,164,0.24)]">
                        <UserPlus className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold">View referrals</p>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">
                          See your code, referral link, bonuses, and joined users.
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#07111f]">
                      View
                    </span>
                  </button>
                ) : null}

                {isOwnProfile ? (
                  <div className="mt-4 rounded-[24px] border border-border bg-card p-4 text-left">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-[#8eeaff] ring-1 ring-white/10">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-foreground">
                            Email post notifications
                          </p>
                          <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">
                            Get emails when connected users publish new posts.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={postEmailNotificationsEnabled}
                        disabled={isUpdatingEmailNotifications}
                        onClick={() =>
                          updatePostEmailNotifications(
                            !postEmailNotificationsEnabled,
                          )
                        }
                        className={`relative h-8 w-14 shrink-0 rounded-full p-1 transition ${
                          postEmailNotificationsEnabled
                            ? "bg-primary shadow-[0_0_12px_rgba(0,0,0,0.15)]"
                            : "bg-muted"
                        } ${isUpdatingEmailNotifications ? "opacity-70" : ""}`}
                      >
                        <span
                          className={`block h-6 w-6 rounded-full bg-white shadow-lg transition ${
                            postEmailNotificationsEnabled
                              ? "translate-x-6"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ) : null}

                {isOwnProfile && referralStats && !referralLoading ? (
                  <div className="mt-4 rounded-[24px] border border-border bg-muted/30 px-4 py-3 text-left">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      Referral Code
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="font-mono text-sm font-semibold tracking-[0.18em] text-foreground">
                        {referralStats.referral_code}
                      </div>
                      <button
                        type="button"
                        className="text-xs font-semibold text-muted-foreground"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(referralStats.referral_link);
                            toast.success("Referral link copied");
                          } catch {
                            toast.error("Unable to copy referral link");
                          }
                        }}
                      >
                        Copy link
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <Tabs defaultValue="posts" className="w-full">
                <div className="border-b border-border px-4">
                  <TabsList className="grid h-auto w-full grid-cols-3 bg-transparent p-0">
                    <TabsTrigger
                      value="posts"
                      className="rounded-none border-b-2 border-transparent px-0 py-4 text-sm font-bold text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground"
                    >
                      Videos
                    </TabsTrigger>
                    <TabsTrigger
                      value="media"
                      className="rounded-none border-b-2 border-transparent px-0 py-4 text-sm font-bold text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground"
                    >
                      Liked
                    </TabsTrigger>
                    <TabsTrigger
                      value="saved"
                      className="rounded-none border-b-2 border-transparent px-0 py-4 text-sm font-bold text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground"
                    >
                      Saved
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="posts" className="mt-1">
                  {isInitiallyLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                      <div className="mb-4 rounded-full bg-card p-4">
                        <Grid3x3 className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-foreground">No posts yet</h3>
                      <p className="max-w-xs text-muted-foreground">
                        {isOwnProfile
                          ? "When you post photos or videos, they will appear here."
                          : `@${user.username} hasn't posted anything yet.`}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 pb-24">
                      {posts.map((post) => (
                        <PostGridItem key={post.id} post={post} />
                      ))}
                      {isLoadingMorePosts && (
                        <div className="col-span-full flex justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                        </div>
                      )}
                      <div ref={observerTarget} className="col-span-full h-4" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="media" className="mt-1">
                  <div className="grid grid-cols-3 gap-1 pb-24">
                    {posts
                      .filter((p) => hasDisplayMedia(p))
                      .map((post) => (
                        <PostGridItem key={post.id} post={post} />
                      ))}
                    {isLoadingMorePosts && (
                      <div className="col-span-full flex justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                      </div>
                    )}
                    <div ref={observerTarget} className="col-span-full h-4" />
                  </div>
                </TabsContent>

                <TabsContent value="saved" className="mt-1">
                  {!isOwnProfile ? (
                    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                      <Lock className="mb-4 h-8 w-8 text-muted-foreground" />
                      <h3 className="mb-1 text-lg font-bold text-foreground">
                        Saved posts are private
                      </h3>
                      <p className="max-w-xs text-muted-foreground">
                        Only you can see your saved posts.
                      </p>
                    </div>
                  ) : isBookmarksInitiallyLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                  ) : bookmarks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                      <div className="mb-4 rounded-full bg-card p-4">
                        <Bookmark className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-foreground">
                        No saved posts yet
                      </h3>
                      <p className="max-w-xs text-muted-foreground">
                        Save posts by clicking the bookmark icon to find them here later.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 pb-24">
                      {bookmarks.map((post) => (
                        <PostGridItem key={post.id} post={post} />
                      ))}
                      {isLoadingMoreBookmarks && (
                        <div className="col-span-full flex justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                        </div>
                      )}
                      <div ref={bookmarksObserverTarget} className="col-span-full h-4" />
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-4 pt-4 lg:px-6 xl:px-8">
            <div className="relative overflow-hidden rounded-[40px] bg-background shadow-2xl">
              {displayCoverImage ? (
                <img
                  src={displayCoverImage}
                  alt={`${user.name} cover`}
                  className="h-[65vh] w-full object-cover"
                />
              ) : (
                <div className="h-[65vh] w-full bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a]" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {isOwnProfile && (
                <>
                  <button
                    type="button"
                    disabled={coverUploading}
                    onClick={() => coverInputRef.current?.click()}
                    className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-2.5 transition-colors hover:bg-background/95 disabled:opacity-50"
                    title="Change cover picture"
                  >
                    {coverUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-foreground" />
                    ) : (
                      <Camera className="h-5 w-5 text-foreground" />
                    )}
                  </button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </>
              )}

              <div className="absolute bottom-5 left-8 right-8 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar className="h-16 w-16 ring-2 ring-white/20 shadow-xl">
                      {avatarSrc ? (
                        <AvatarImage src={avatarSrc} className="object-cover" />
                      ) : null}
                      <AvatarFallback
                        className={cn(
                          "text-xl font-extrabold text-foreground",
                          avatarGradientClass,
                        )}
                      >
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-0">
                        <h1 className="break-words whitespace-normal text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                          {user.name}
                        </h1>
                        {user.has_verification_badge || user.is_verified ? (
                          <VerifiedBadge className="-ml-1" />
                        ) : null}
                      </div>
                      <p className="break-all whitespace-normal text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span
                          className={`inline-flex h-2.5 w-2.5 rounded-full ${
                            presence.isOnline
                              ? "bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.85)]"
                              : "bg-muted"
                          }`}
                        />
                        <span
                          className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
                            presence.isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                          }`}
                        >
                          {presence.statusLabel}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {presence.detailLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!isOwnProfile ? (
                    <div className="flex flex-nowrap items-center gap-2">
                      {isBlocked ? (
                        <Button
                          variant="outline"
                          className="rounded-full border-border bg-muted px-6 py-6 text-sm font-semibold text-foreground hover:bg-muted/80"
                          onClick={handleBlockToggle}
                        >
                          Unblock
                        </Button>
                      ) : (
                        <>
                          {followStatusConfirmed ? (
                            <Button
                              variant="default"
                              className="rounded-full bg-primary px-8 py-6 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                              onClick={handleFollow}
                            >
                              {isFollowing ? "Following" : "Follow"}
                            </Button>
                          ) : null}
                          <Button
                            asChild
                            className="rounded-full bg-primary px-8 py-6 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                          >
                            <Link to={`/messages/${user.id}`}>Message</Link>
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-full border-red-300/40 bg-red-500/10 px-6 py-6 text-sm font-semibold text-red-100 hover:bg-red-500/20"
                            onClick={handleBlockToggle}
                          >
                            Block
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-3">
                      <Button
                        variant="outline"
                        className="rounded-full border-border bg-primary px-8 py-6 text-sm font-bold text-primary-foreground backdrop-blur-md hover:bg-primary/90"
                        onClick={() => setIsEditDialogOpen(true)}
                      >
                        Edit Profile
                      </Button>
                      <Button
                        type="button"
                        className="rounded-full border-emerald-300/30 bg-emerald-400/15 px-8 py-6 text-sm font-bold text-foreground backdrop-blur-md hover:bg-emerald-400/20"
                        onClick={() => setShowReferralDialog(true)}
                      >
                        Referrals
                      </Button>
                      <Button
                        type="button"
                        className="rounded-full border-amber-300/30 bg-amber-300/15 px-8 py-6 text-sm font-bold text-foreground backdrop-blur-md hover:bg-amber-300/20"
                        onClick={() => navigate("/monetization")}
                      >
                        Monetization
                      </Button>
                      <Button
                        type="button"
                        className="rounded-full border-border bg-muted px-8 py-6 text-sm font-bold text-foreground backdrop-blur-md hover:bg-muted/80"
                        onClick={copyProfileLink}
                      >
                        <LinkIcon />
                        <div className="block">Copy Link</div>
                      </Button>
                    </div>
                  )}
                </div>
                <p className="max-w-[80%] text-base leading-relaxed text-foreground">
                  {user.bio || ""}
                </p>
              </div>
            </div>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <button
                type="button"
                onClick={() => setUserListModal({ open: true, type: "following" })}
                className="group rounded-[26px] border border-border bg-card p-4 text-left text-foreground shadow-sm transition hover:-translate-y-0.5 xl:p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                      Total follow
                    </p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight xl:text-3xl">
                      {formatEngagement(user.following_count)}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-200 ring-1 ring-cyan-200/20 transition group-hover:bg-cyan-300/25 xl:h-12 xl:w-12">
                    <UserPlus className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  People @{user.username} follows
                </p>
              </button>

              <button
                type="button"
                onClick={() => setUserListModal({ open: true, type: "followers" })}
                className="group rounded-[26px] border border-border bg-card p-4 text-left text-foreground shadow-sm transition hover:-translate-y-0.5 xl:p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                      Followers
                    </p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight xl:text-3xl">
                      {formatEngagement(user.followers_count)}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300/15 text-emerald-200 ring-1 ring-emerald-200/20 transition group-hover:bg-emerald-300/25 xl:h-12 xl:w-12">
                    <UserPlus className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  People following this profile
                </p>
              </button>

              <div className="rounded-[26px] border border-border bg-card p-4 text-foreground shadow-sm xl:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                      Total likes
                    </p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight xl:text-3xl">
                      {formatEngagement(totalLikes)}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-300/15 text-rose-200 ring-1 ring-rose-200/20 xl:h-12 xl:w-12">
                    <Heart className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  Across visible uploads
                </p>
              </div>

              <div className="rounded-[26px] border border-border bg-card p-4 text-foreground shadow-sm xl:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                      Total views
                    </p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight xl:text-3xl">
                      {formatEngagement(totalViews)}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-200 ring-1 ring-amber-200/20 xl:h-12 xl:w-12">
                    <Eye className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  Across visible uploads
                </p>
              </div>

              {isOwnProfile ? (
                <div className="group relative overflow-hidden rounded-[26px] border border-emerald-300/25 bg-card p-4 text-foreground shadow-sm transition hover:-translate-y-0.5 xl:p-5">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-300/10 blur-2xl" />
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-100/60">
                        Wallet balance
                      </p>
                      <p className="mt-2 max-w-full truncate text-2xl font-extrabold tracking-tight text-[#93f7b6] xl:text-3xl">
                        {walletLoading ? "..." : formatNaira(wallet?.balance ?? 0)}
                      </p>
                      <p className="mt-3 text-sm font-medium normal-case tracking-normal text-muted-foreground">
                        Available funds
                      </p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/18 text-emerald-100 ring-1 ring-emerald-200/25 transition group-hover:bg-emerald-300/25 xl:h-12 xl:w-12">
                      <Wallet className="h-5 w-5" />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => router.visit("/earn?action=withdraw")}
                    className="relative mt-3 h-8 rounded-full bg-primary px-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary/90"
                  >
                    Withdraw
                  </Button>
                </div>
              ) : null}
            </section>

            {isOwnProfile ? (
              <section className="mt-6 rounded-[28px] border border-border bg-card p-5 text-foreground shadow-sm">
                <div className="flex items-center justify-between gap-5">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-extrabold">Ads management</p>
                      <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
                        See ad views, people reached, clicks, spend, budget remaining, and campaign status.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => navigate("/ads")}
                    className="shrink-0 rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground hover:bg-primary/90"
                  >
                    Open ads
                  </Button>
                </div>
              </section>
            ) : null}

            {isOwnProfile ? (
              <section className="mt-6 rounded-[28px] border border-border bg-card p-5 text-foreground shadow-sm">
                <div className="flex items-center justify-between gap-5">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#34f5a4] text-[#06131f] shadow-[0_0_24px_rgba(52,245,164,0.24)]">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-extrabold">View referrals</p>
                      <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
                        Check your referral code, invite link, referred users, and bonus progress.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowReferralDialog(true)}
                    className="shrink-0 rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground hover:bg-primary/90"
                  >
                    Open referrals
                  </Button>
                </div>
              </section>
            ) : null}

            {isOwnProfile ? (
              <section className="mt-6 rounded-[28px] border border-border bg-card p-5 text-foreground shadow-sm">
                <div className="flex items-center justify-between gap-5">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-[#8eeaff] ring-1 ring-white/10">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-extrabold">
                        Email post notifications
                      </p>
                      <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">
                        Get emails when people you follow, or people connected to you, publish a new post.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={postEmailNotificationsEnabled}
                    disabled={isUpdatingEmailNotifications}
                    onClick={() =>
                      updatePostEmailNotifications(
                        !postEmailNotificationsEnabled,
                      )
                    }
                    className={`relative h-9 w-16 shrink-0 rounded-full p-1 transition ${
                      postEmailNotificationsEnabled
                        ? "bg-primary shadow-[0_0_12px_rgba(0,0,0,0.15)]"
                        : "bg-muted"
                    } ${isUpdatingEmailNotifications ? "opacity-70" : ""}`}
                  >
                    <span
                      className={`block h-7 w-7 rounded-full bg-white shadow-lg transition ${
                        postEmailNotificationsEnabled
                          ? "translate-x-7"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </section>
            ) : null}

            <section className="mt-8 rounded-[32px] border border-border bg-card p-5 shadow-sm">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    Uploaded content
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
                    Posts & uploads
                  </h2>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="rounded-2xl border border-border bg-muted px-4 py-2">
                    <span className="text-muted-foreground">Uploads</span>
                    <span className="ml-2 font-extrabold text-foreground">
                      {formatEngagement(posts.length)}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted px-4 py-2">
                    <span className="text-muted-foreground">Views</span>
                    <span className="ml-2 font-extrabold text-foreground">
                      {formatEngagement(totalViews)}
                    </span>
                  </div>
                </div>
              </div>

              {isInitiallyLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-muted px-4 py-16 text-center">
                  <Grid3x3 className="mb-4 h-9 w-9 text-muted-foreground" />
                  <h3 className="text-lg font-bold text-foreground">No uploads yet</h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {isOwnProfile
                      ? "Your posts, videos, and images will show here on larger screens."
                      : `@${user.username} has not posted anything yet.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 xl:grid-cols-5 2xl:grid-cols-6">
                  {posts.map((post) => (
                    <PostGridItem key={post.id} post={post} />
                  ))}
                  {isLoadingMorePosts ? (
                    <div className="col-span-full flex justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                  ) : null}
                  <div ref={observerTarget} className="col-span-full h-4" />
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <ProfileEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={user}
        onSuccess={(updatedUser) =>
          setUser((prev) => ({ ...prev, ...updatedUser }))
        }
      />
      <Dialog
        open={isAgreementDialogOpen}
        onOpenChange={(open) => {
          if (!open && !user.content_validation_agreed_at) {
            return;
          }

          setIsAgreementDialogOpen(open);
        }}
      >
        <DialogContent
          className="border-border bg-background text-foreground sm:max-w-md"
          onEscapeKeyDown={(event) => {
            if (!user.content_validation_agreed_at) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            if (!user.content_validation_agreed_at) {
              event.preventDefault();
            }
          }}
        >
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-extrabold text-foreground">
              Content Validation Agreement
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-muted-foreground">
              Please confirm that the content you post on Karaads is original,
              lawful, respectful, and follows our community rules.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-2xl border border-border bg-white/4 p-4 text-sm text-foreground">
            <p>
              By tapping agree, you confirm that you will not upload misleading,
              stolen, harmful, or prohibited content.
            </p>
            <p>
              You also understand that breaking this agreement can lead to content
              removal, account restrictions, or loss of monetization access.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="w-full bg-primary font-bold text-primary-foreground hover:bg-primary/90 sm:w-auto"
              onClick={handleAgreeToContentValidation}
              disabled={isSubmittingAgreement}
            >
              {isSubmittingAgreement ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "I Agree"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <UserListModal
        open={userListModal.open}
        onOpenChange={(open) => setUserListModal((prev) => ({ ...prev, open }))}
        type={userListModal.type}
        userId={user.id}
        onFollowStateChanged={({ isFollowing: nowFollowing }) => {
          if (!isOwnProfile) return;
          setUser((prev) => ({
            ...prev,
            following_count: nowFollowing
              ? prev.following_count + 1
              : Math.max(0, prev.following_count - 1),
          }));
        }}
      />
      <Dialog
        open={showMonetizationDialog}
        onOpenChange={setShowMonetizationDialog}
      >
        <DialogContent className="max-h-[86vh] overflow-y-auto border-border bg-[#07111f] text-foreground sm:max-w-[680px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Monetization dashboard
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Track your profile performance. Monetization credits are handled
              quietly in the background once your profile is active.
            </DialogDescription>
          </DialogHeader>

          {monetizationLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading monetization...
            </div>
          ) : monetizationDashboard ? (
            <div className="space-y-4">
              <div
                className={cn(
                  "rounded-3xl border p-5",
                  monetizationDashboard.status.is_monetized
                    ? "border-emerald-300/20 bg-[linear-gradient(135deg,rgba(52,245,164,0.16),rgba(8,210,255,0.08))]"
                    : "border-amber-300/20 bg-[linear-gradient(135deg,rgba(255,197,91,0.17),rgba(8,210,255,0.08))]",
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                      Status
                    </p>
                    <h3 className="mt-2 text-2xl font-black">
                      {monetizationDashboard.status.is_monetized
                        ? "Monetization active"
                        : "Activate monetization"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {monetizationDashboard.status.is_monetized
                        ? "Your eligible views, likes, and comments are being counted automatically."
                        : `Pay ${monetizationDashboard.status.fee_amount_formatted} with Paystack to turn on profile monetization.`}
                    </p>
                  </div>
                  {!monetizationDashboard.status.is_monetized ? (
                    <Button
                      type="button"
                      className="rounded-full bg-[#ffc55b] px-6 font-black text-[#07111f] hover:bg-[#ffd784]"
                      onClick={() => navigate("/monetization")}
                    >
                      Pay with Paystack
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-border bg-white/5 p-4">
                  <div className="text-2xl font-black">
                    {formatEngagement(monetizationDashboard.summary.views)}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-muted-foreground">
                    Views
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-white/5 p-4">
                  <div className="text-2xl font-black">
                    {formatEngagement(monetizationDashboard.summary.likes)}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-muted-foreground">
                    Likes
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-white/5 p-4">
                  <div className="text-2xl font-black">
                    {formatEngagement(monetizationDashboard.summary.comments)}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-muted-foreground">
                    Comments
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-black">Recent post activity</h4>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Last 30 days
                  </span>
                </div>
                <div className="space-y-2">
                  {monetizationDashboard.posts.length > 0 ? (
                    monetizationDashboard.posts.map((post) => (
                      <div
                        key={post.post_id}
                        className="rounded-2xl border border-border bg-card p-3"
                      >
                        <p className="line-clamp-2 text-sm font-semibold text-foreground">
                          {post.content || "Media post"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-muted-foreground">
                          <span>{formatEngagement(post.views)} views</span>
                          <span>{formatEngagement(post.likes)} likes</span>
                          <span>{formatEngagement(post.comments)} comments</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground">
                      No posts to track yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white/5 p-5 text-sm text-muted-foreground">
              Open the dashboard again to load your monetization status.
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent className="border-border bg-[#09111f] text-foreground sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Your referrals</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Share your invite link and track everyone joining through your profile.
            </DialogDescription>
          </DialogHeader>

          {referralLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading referrals...
            </div>
          ) : referralStats ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-emerald-300/20 bg-[linear-gradient(135deg,rgba(52,245,164,0.15),rgba(8,210,255,0.08))] p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  Referral code
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="font-mono text-xl font-black tracking-[0.18em]">
                    {referralStats.referral_code}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full bg-white text-[#07111f] hover:bg-[#e8fff5]"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(referralStats.referral_link);
                        toast.success("Referral link copied");
                      } catch {
                        toast.error("Unable to copy referral link");
                      }
                    }}
                  >
                    Copy link
                  </Button>
                </div>
                <div className="mt-3 break-all rounded-2xl bg-card px-3 py-2 text-xs text-muted-foreground">
                  {referralStats.referral_link}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-white/5 p-4">
                  <div className="text-2xl font-black">{referralStats.total_referred}</div>
                  <div className="mt-1 text-xs font-semibold text-muted-foreground">Total referred</div>
                </div>
                <div className="rounded-2xl border border-border bg-white/5 p-4">
                  <div className="text-2xl font-black">{referralStats.active_referred}</div>
                  <div className="mt-1 text-xs font-semibold text-muted-foreground">Active users</div>
                </div>
                <div className="rounded-2xl border border-border bg-white/5 p-4">
                  <div className="text-2xl font-black">{referralStats.completed_referrals}</div>
                  <div className="mt-1 text-xs font-semibold text-muted-foreground">Completed</div>
                </div>
                <div className="rounded-2xl border border-border bg-white/5 p-4">
                  <div className="text-2xl font-black">{formatNaira(referralStats.completed_bonus)}</div>
                  <div className="mt-1 text-xs font-semibold text-muted-foreground">Bonus earned</div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                Pending bonus: <span className="font-black">{formatNaira(referralStats.pending_bonus)}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white/5 p-5 text-sm text-muted-foreground">
              Referral details are not available yet.
            </div>
          )}
        </DialogContent>
      </Dialog>
      <MobileActionSheet
        open={showActions}
        onOpenChange={setShowActions}
        title="Profile actions"
      >
        <div className="space-y-2">
          <button
            type="button"
            className="h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-left text-sm text-foreground"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  `${window.location.origin}/@${user.username}`,
                );
                toast.success("Profile link copied");
              } catch {
                toast.error("Unable to copy profile link");
              } finally {
                setShowActions(false);
              }
            }}
          >
            Copy profile link
          </button>
          {!isOwnProfile ? (
            <button
              type="button"
              className="h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-left text-sm text-foreground"
              onClick={() => {
                setShowActions(false);
                handleBlockToggle();
              }}
            >
              {isBlocked ? "Unblock user" : "Block user"}
            </button>
          ) : null}
        </div>
      </MobileActionSheet>

      <MobileActionSheet
        open={showSettings}
        onOpenChange={setShowSettings}
        title="Settings"
      >
        <div className="space-y-4 sm:space-y-5">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-emerald-500/25 via-cyan-500/15 to-indigo-700/35 p-4 sm:p-5 text-foreground shadow-lg">
            <div className="text-[11px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Wallet
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-bold leading-tight">
              {formatNaira(wallet?.balance ?? 0)}
            </div>
            <div className="text-[12px] sm:text-sm text-muted-foreground">
              Available balance - {walletCurrencyLabel}
            </div>
          </div>

          <div className="divide-y divide-white/10 rounded-2xl border border-border bg-white/5 shadow-lg">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-4 text-sm sm:text-base text-foreground hover:bg-muted"
              onClick={() => {
                setShowSettings(false);
                router.visit("/earn?action=withdraw");
              }}
            >
              <div>
                <div className="font-semibold">Withdraw earnings</div>
                <div className="text-xs text-muted-foreground">
                  Open your earnings withdrawal page
                </div>
              </div>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-4 text-sm sm:text-base text-foreground hover:bg-muted"
              onClick={() => {
                setShowSettings(false);
                router.visit("/settings/privacy");
              }}
            >
              <div>
                <div className="font-semibold">Privacy settings</div>
                <div className="text-xs text-muted-foreground">
                  Account visibility, data, safety
                </div>
              </div>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-between rounded-2xl border border-red-200/20 bg-red-500/10 px-4 py-4 text-sm sm:text-base text-red-100 shadow-sm hover:border-red-200/40 hover:bg-red-500/15"
            onClick={async () => {
              try {
                await axiosInstance.post("/logout");
              } catch {
                // ignore
              } finally {
                window.location.href = "/login";
              }
            }}
          >
            <div className="font-semibold">Log out</div>
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </MobileActionSheet>
    </>
  );
}
