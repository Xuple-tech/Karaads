import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness, Camera, Loader2, MessageCircle, Plus, Search, UserPlus, Users, X } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CommunityPostCard, type CommunityMedia, type CommunityPost } from "@/components/community-post-card";
import { useAuth } from "@/hooks/use-auth";

interface BusinessPage {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  category?: string | null;
  description?: string | null;
  avatar?: string | null;
  cover?: string | null;
  follower_count: number;
  is_owner?: boolean;
  is_following?: boolean;
}

interface UserSummary {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
}

const BUSINESS_PAGE_CATEGORIES = [
  "Local business",
  "Restaurant",
  "Fashion",
  "Beauty",
  "Real estate",
  "Education",
  "Entertainment",
  "Health",
  "Technology",
  "Shopping",
  "Professional service",
  "Nonprofit",
  "Public figure",
  "Other",
];

const fetchPages = async (): Promise<BusinessPage[]> => {
  const { data } = await axiosInstance.get("/api/business-pages", {
    params: { scope: "mine" },
  });
  return data.data ?? data;
};

const fetchPage = async (slug: string): Promise<BusinessPage> => {
  const { data } = await axiosInstance.get(`/api/business-pages/${slug}`);
  return data.data ?? data;
};

const fetchPagePosts = async (slug: string): Promise<CommunityPost[]> => {
  const { data } = await axiosInstance.get(`/api/business-pages/${slug}/posts`);
  return data.data ?? data;
};

const searchUsers = async (query: string): Promise<UserSummary[]> => {
  const { data } = await axiosInstance.get("/api/users/search", {
    params: { search: query },
  });
  return data.data ?? data;
};

function compactCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function PageAvatar({ page, size = "h-14 w-14" }: { page: BusinessPage; size?: string }) {
  return page.avatar ? (
    <img src={page.avatar} alt={page.name} className={`${size} rounded-2xl object-cover`} />
  ) : (
    <div className={`${size} flex items-center justify-center rounded-2xl bg-primary/15 text-primary`}>
      <BriefcaseBusiness className="h-6 w-6" />
    </div>
  );
}

export default function BusinessPagesPage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [selectedInvitees, setSelectedInvitees] = useState<UserSummary[]>([]);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  const isDetail = Boolean(slug);
  const pagesQuery = useQuery({
    queryKey: ["business-pages", "mine"],
    queryFn: fetchPages,
    enabled: !isDetail,
  });
  const pageQuery = useQuery({
    queryKey: ["business-pages", slug],
    queryFn: () => fetchPage(slug as string),
    enabled: isDetail,
  });
  const postsQuery = useQuery({
    queryKey: ["business-pages", slug, "posts"],
    queryFn: () => fetchPagePosts(slug as string),
    enabled: isDetail,
  });
  const inviteSearchQuery = useQuery({
    queryKey: ["business-page-invite-users", inviteSearch],
    queryFn: () => searchUsers(inviteSearch),
    enabled: inviteOpen && inviteSearch.trim().length > 0,
    staleTime: 10_000,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      if (description.trim()) formData.append("description", description);
      if (avatar) formData.append("avatar", avatar);
      if (cover) formData.append("cover", cover);

      const { data } = await axiosInstance.post("/api/business-pages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data ?? data;
    },
    onSuccess: (page: BusinessPage) => {
      queryClient.invalidateQueries({ queryKey: ["business-pages", "mine"] });
      setName("");
      setCategory("");
      setDescription("");
      setAvatar(null);
      setCover(null);
      navigate(`/pages/${page.slug}`);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? "Unable to create business page.");
    },
  });

  const followMutation = useMutation({
    mutationFn: async ({ page, following }: { page: BusinessPage; following: boolean }) => {
      const endpoint = following ? "unfollow" : "follow";
      const { data } = await axiosInstance.post(`/api/business-pages/${page.slug}/${endpoint}`);
      return data.data ?? data;
    },
    onSuccess: (updated: BusinessPage) => {
      queryClient.setQueryData(["business-pages", updated.slug], updated);
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async ({
      page,
      userIds,
      inviteAllFollowing,
    }: {
      page: BusinessPage;
      userIds?: string[];
      inviteAllFollowing?: boolean;
    }) => {
      const { data } = await axiosInstance.post(`/api/business-pages/${page.slug}/invite`, {
        ...(inviteAllFollowing ? { invite_all_following: true } : { user_ids: userIds ?? [] }),
      });
      return data;
    },
    onSuccess: (data) => {
      setInviteMessage(data?.message ?? "Invite sent.");
      setSelectedInvitees([]);
      setInviteSearch("");
    },
    onError: (err: any) => {
      setInviteMessage(err?.response?.data?.message ?? "Unable to send invites.");
    },
  });

  const pages = pagesQuery.data ?? [];
  const page = pageQuery.data;
  const posts = postsQuery.data ?? [];
  const canCreate = name.trim().length >= 2 && category.trim().length > 0 && !createMutation.isPending;
  const postsQueryKey = ["business-pages", slug, "posts"] as const;

  const updatePostInPage = (postId: string, updater: (post: CommunityPost) => CommunityPost) => {
    queryClient.setQueryData<CommunityPost[]>(postsQueryKey, (current = []) =>
      current.map((post) => (post.id === postId ? updater(post) : post)),
    );
  };

  const replacePostInPage = (updated: CommunityPost) => {
    queryClient.setQueryData<CommunityPost[]>(postsQueryKey, (current = []) =>
      current.map((post) => (post.id === updated.id ? updated : post)),
    );
  };

  const handleLike = async (post: CommunityPost) => {
    const nextLiked = !post.user_liked;
    updatePostInPage(post.id, (item) => ({
      ...item,
      user_liked: nextLiked,
      like_count: Math.max(0, item.like_count + (nextLiked ? 1 : -1)),
    }));

    try {
      const endpoint = nextLiked ? "like" : "unlike";
      const { data } = await axiosInstance.post(`/api/posts/${post.id}/${endpoint}`);
      replacePostInPage(data.data ?? data);
    } catch {
      updatePostInPage(post.id, (item) => ({
        ...item,
        user_liked: post.user_liked,
        like_count: post.like_count,
      }));
    }
  };

  const handleReshare = async (post: CommunityPost) => {
    const nextReshared = !post.user_reshared;
    updatePostInPage(post.id, (item) => ({
      ...item,
      user_reshared: nextReshared,
      repost_count: Math.max(0, item.repost_count + (nextReshared ? 1 : -1)),
    }));

    try {
      const endpoint = nextReshared ? "reshare" : "unreshare";
      await axiosInstance.post(`/api/posts/${post.id}/${endpoint}`);
    } catch {
      updatePostInPage(post.id, (item) => ({
        ...item,
        user_reshared: post.user_reshared,
        repost_count: post.repost_count,
      }));
    }
  };

  const handleSave = async (post: CommunityPost) => {
    const nextSaved = !post.user_saved;
    updatePostInPage(post.id, (item) => ({
      ...item,
      user_saved: nextSaved,
      save_count: Math.max(0, (item.save_count ?? 0) + (nextSaved ? 1 : -1)),
    }));

    try {
      const endpoint = nextSaved ? "save" : "unsave";
      const { data } = await axiosInstance.post(`/api/posts/${post.id}/${endpoint}`);
      replacePostInPage(data.data ?? data);
    } catch {
      updatePostInPage(post.id, (item) => ({
        ...item,
        user_saved: post.user_saved,
        save_count: post.save_count,
      }));
    }
  };

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/posts/${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Karaads page post",
          text: "Check out this page post on Karaads",
          url,
        });
        return;
      } catch {
        return;
      }
    }

    await navigator.clipboard?.writeText(url).catch(() => {});
  };

  const handlePostUpdated = (
    postId: string,
    updates: { content: string; media: CommunityMedia[] },
  ) => {
    updatePostInPage(postId, (item) => ({
      ...item,
      content: updates.content,
      media: updates.media,
    }));
  };

  const handlePostDeleted = (postId: string) => {
    queryClient.setQueryData<CommunityPost[]>(postsQueryKey, (current = []) =>
      current.filter((post) => post.id !== postId),
    );
  };

  const openPageChat = (targetPage: BusinessPage) => {
    if (targetPage.is_owner) {
      navigate("/messages");
      return;
    }

    navigate(`/messages/${targetPage.owner_user_id}?page=${encodeURIComponent(targetPage.slug)}`);
  };

  const toggleInvitee = (user: UserSummary) => {
    setInviteMessage(null);
    setSelectedInvitees((current) =>
      current.some((item) => item.id === user.id)
        ? current.filter((item) => item.id !== user.id)
        : [...current, user],
    );
  };

  const sendPageInvites = (targetPage: BusinessPage) => {
    if (selectedInvitees.length === 0) {
      setInviteMessage("Select at least one person to invite.");
      return;
    }

    inviteMutation.mutate({
      page: targetPage,
      userIds: selectedInvitees.map((user) => user.id),
    });
  };

  const inviteAllFollowing = (targetPage: BusinessPage) => {
    setInviteMessage(null);
    inviteMutation.mutate({
      page: targetPage,
      inviteAllFollowing: true,
    });
  };

  if (isDetail) {
    return (
      <div className="min-h-screen bg-background px-4 pb-28 pt-5 text-foreground lg:pb-12">
        <div className="mx-auto max-w-5xl">
          {pageQuery.isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : page ? (
            <>
              <div className="overflow-hidden rounded-[34px] border border-border bg-card shadow-md">
                <div className="h-44 bg-muted">
                  {page.cover ? <img src={page.cover} alt={page.name} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="-mt-10 flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-end gap-4">
                    <div className="rounded-[28px] border-4 border-card bg-card">
                      <PageAvatar page={page} size="h-24 w-24" />
                    </div>
                    <div className="pb-2">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
                        {page.category || "Business page"}
                      </p>
                      <h1 className="mt-1 text-3xl font-black">{page.name}</h1>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {compactCount(page.follower_count)} followers
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pb-2">
                    {page.is_owner ? (
                      <>
                        <Button
                          className="rounded-full bg-primary font-black text-primary-foreground hover:bg-primary/90"
                          onClick={() => navigate(`/post/create?page=${encodeURIComponent(page.id)}`)}
                        >
                          Post as page
                        </Button>
                        <Button
                          className="rounded-full border border-border bg-muted font-black text-foreground hover:bg-muted/80"
                          onClick={() => {
                            setInviteOpen(true);
                            setInviteMessage(null);
                          }}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Invite people
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          className="rounded-full border border-border bg-background font-black text-foreground hover:bg-muted"
                          disabled={followMutation.isPending}
                          onClick={() => followMutation.mutate({ page, following: Boolean(page.is_following) })}
                        >
                          {page.is_following ? "Following" : "Follow page"}
                        </Button>
                        <Button
                          className="rounded-full bg-primary px-5 font-black text-primary-foreground hover:bg-primary/90"
                          onClick={() => openPageChat(page)}
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Chat
                        </Button>
                      </>
                    )}
                    <Button variant="outline" className="rounded-full border-border bg-muted text-foreground" onClick={() => navigate("/pages")}>
                      My pages
                    </Button>
                  </div>
                </div>
                {page.description ? (
                  <p className="border-t border-border px-5 py-4 text-sm leading-6 text-muted-foreground">
                    {page.description}
                  </p>
                ) : null}
              </div>

              {page.is_owner && inviteOpen ? (
                <div className="mt-4 rounded-[30px] border border-border bg-card p-4 shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
                        Page invites
                      </p>
                      <h2 className="mt-1 text-xl font-black">Invite people to join your page</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        They will see the invite on their Notifications page.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-border bg-muted/30 p-2 text-muted-foreground hover:bg-muted"
                      onClick={() => setInviteOpen(false)}
                      aria-label="Close invite panel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-muted/30 px-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      value={inviteSearch}
                      onChange={(event) => {
                        setInviteSearch(event.target.value);
                        setInviteMessage(null);
                      }}
                      placeholder="Search users to invite"
                      className="h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                  </div>

                  <Button
                    className="mt-3 h-11 w-full rounded-2xl border border-border bg-muted font-black text-foreground hover:bg-muted/80"
                    disabled={inviteMutation.isPending}
                    onClick={() => inviteAllFollowing(page)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite all users I follow
                  </Button>

                  {selectedInvitees.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedInvitees.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1.5 text-xs font-black text-primary"
                          onClick={() => toggleInvitee(user)}
                        >
                          {user.name}
                          <X className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3 max-h-64 overflow-y-auto rounded-2xl border border-border">
                    {inviteSearch.trim().length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">Search for people by name or username.</p>
                    ) : inviteSearchQuery.isLoading ? (
                      <p className="p-4 text-sm text-muted-foreground">Searching...</p>
                    ) : (inviteSearchQuery.data ?? []).length > 0 ? (
                      (inviteSearchQuery.data ?? [])
                        .filter((user) => user.id !== auth?.user?.id)
                        .map((user) => {
                          const selected = selectedInvitees.some((item) => item.id === user.id);

                          return (
                            <button
                              key={user.id}
                              type="button"
                              className="flex w-full items-center justify-between gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-muted/30"
                              onClick={() => toggleInvitee(user)}
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-black">
                                    {(user.name || user.username || "U").slice(0, 1).toUpperCase()}
                                  </span>
                                )}
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-black text-foreground">{user.name}</span>
                                  <span className="block truncate text-xs text-muted-foreground">@{user.username || "user"}</span>
                                </span>
                              </span>
                              <span className={`rounded-full px-3 py-1 text-xs font-black ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                {selected ? "Selected" : "Invite"}
                              </span>
                            </button>
                          );
                        })
                    ) : (
                      <p className="p-4 text-sm text-muted-foreground">No users found.</p>
                    )}
                  </div>

                  {inviteMessage ? (
                    <p className="mt-3 rounded-2xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                      {inviteMessage}
                    </p>
                  ) : null}

                  <Button
                    className="mt-4 h-12 w-full rounded-2xl bg-primary font-black text-primary-foreground hover:bg-primary/90"
                    disabled={inviteMutation.isPending}
                    onClick={() => sendPageInvites(page)}
                  >
                    {inviteMutation.isPending ? "Sending invites..." : "Send invite"}
                  </Button>
                </div>
              ) : null}

              <div className="mx-auto mt-5 grid w-full max-w-[430px] gap-4 lg:max-w-[720px]">
                {postsQuery.isLoading ? (
                  <div className="rounded-3xl border border-border bg-muted/20 p-6 text-muted-foreground">
                    Loading posts...
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <CommunityPostCard
                      key={post.id}
                      post={post}
                      currentUserId={auth?.user?.id}
                      isFollowing={false}
                      followBusy={false}
                      showFollowButton
                      onFollow={() => {}}
                      onLike={handleLike}
                      onReshare={handleReshare}
                      onShare={handleShare}
                      onSave={handleSave}
                      onPostUpdated={handlePostUpdated}
                      onPostDeleted={handlePostDeleted}
                      autoPlayVideo
                    />
                  ))
                ) : (
                  <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center">
                    <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                    <h2 className="mt-3 text-lg font-black">No page posts yet</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Posts made as this page will appear here and on Home.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center">
              Page not found.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-28 pt-5 text-foreground lg:pb-12">
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[390px_minmax(0,1fr)]">
        <section className="rounded-[32px] border border-border bg-card p-5 shadow-md">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Create business page</p>
          <h1 className="mt-2 text-2xl font-black">Build a page for your business</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Page posts appear on Home with a Follow page button, like a Facebook page.
          </p>

          {error ? <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-100">{error}</p> : null}

          <div className="mt-5 space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Page name" className="h-12 rounded-2xl border-border bg-background text-foreground" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/50"
            >
              <option value="">Select page category</option>
              {BUSINESS_PAGE_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your business" className="min-h-28 rounded-2xl border-border bg-background text-foreground" />
            <label className="block rounded-2xl border border-dashed border-border bg-muted/10 p-4 text-sm text-muted-foreground">
              Avatar image
              <input type="file" accept="image/*" className="mt-2 block text-xs" onChange={(e) => setAvatar(e.target.files?.[0] ?? null)} />
            </label>
            <label className="block rounded-2xl border border-dashed border-border bg-muted/10 p-4 text-sm text-muted-foreground">
              Cover image
              <input type="file" accept="image/*" className="mt-2 block text-xs" onChange={(e) => setCover(e.target.files?.[0] ?? null)} />
            </label>
            <Button className="h-12 w-full rounded-2xl bg-primary font-black text-primary-foreground hover:bg-primary/90" disabled={!canCreate} onClick={() => createMutation.mutate()}>
              {createMutation.isPending ? "Creating..." : "Create page"}
            </Button>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">Your pages</p>
              <h2 className="text-2xl font-black">Business pages</h2>
            </div>
            <Plus className="h-5 w-5 text-primary" />
          </div>

          {pagesQuery.isLoading ? (
            <div className="rounded-3xl border border-border bg-muted/20 p-8 text-muted-foreground">Loading pages...</div>
          ) : pages.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  role="button"
                  tabIndex={0}
                  className="rounded-3xl border border-border bg-card p-4 text-left transition hover:bg-muted/50"
                  onClick={() => navigate(`/pages/${page.slug}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/pages/${page.slug}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <PageAvatar page={page} />
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black">{page.name}</h3>
                      <p className="truncate text-xs text-muted-foreground">{page.category || "Business page"}</p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{page.description || "No description yet."}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-primary">{compactCount(page.follower_count)} followers</p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-black text-foreground transition hover:bg-primary hover:text-primary-foreground"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        openPageChat(page);
                      }}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-muted/20 p-10 text-center">
              <BriefcaseBusiness className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-3 text-xl font-black">No business pages yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create one to start posting as your business.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
