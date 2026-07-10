import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MobileActionSheet } from "@/components/mobile-action-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetch } from "@/hooks/use-fetch";
import { useInitials } from "@/hooks/use-initials";
import { useIsMobile } from "@/hooks/use-mobile";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Link } from "@/components/page-head";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface UserPreview {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  avatar_variants?: {
    sm?: string | null;
    md?: string | null;
    lg?: string | null;
    original?: string | null;
  } | null;
  is_following?: boolean;
}

interface UserListModalProps {
  userId: string;
  type: "followers" | "following";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onFollowStateChanged?: (payload: {
    userId: string;
    isFollowing: boolean;
    listType: "followers" | "following";
  }) => void;
}

export function UserListModal({
  userId,
  type,
  open,
  onOpenChange,
  title,
  onFollowStateChanged,
}: UserListModalProps) {
  const isMobile = useIsMobile();
  const dialogTitle = useMemo(
    () => title || (type === "followers" ? "Followers" : "Following"),
    [title, type],
  );
  const endpoint = `/api/users/${userId}/${type}?limit=100`;
  const { data: users, loading } = useFetch<UserPreview[]>(endpoint, {
    skip: !open,
  });

  const [localUsers, setLocalUsers] = useState<UserPreview[]>([]);
  const [followBusyByUser, setFollowBusyByUser] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (users) {
      setLocalUsers(users);
    }
  }, [users]);

  const handleFollowToggle = async (user: UserPreview) => {
    const isFollowing = user.is_following;
    if (typeof isFollowing !== "boolean" || followBusyByUser[user.id]) return;

    setFollowBusyByUser((prev) => ({ ...prev, [user.id]: true }));
    try {
      const url = `/api/users/${user.id}/${isFollowing ? "unfollow" : "follow"}`;

      // Optimistic update
      setLocalUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_following: !isFollowing } : u
        )
      );

      const response = await axiosInstance.post(url);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Failed to update follow status");
      }
      onFollowStateChanged?.({
        userId: user.id,
        isFollowing: !isFollowing,
        listType: type,
      });
    } catch (error) {
      // Revert optimistic update
      setLocalUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_following: user.is_following } : u
        )
      );
      toast.error("Failed to update follow status");
    } finally {
      setFollowBusyByUser((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const content = (
    <div className="flex-1 overflow-y-auto py-2">
      {loading && !localUsers.length ? (
        <UserListSkeleton />
      ) : localUsers.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center text-white/40">
          <p>No {type} found</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {localUsers.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              followBusy={Boolean(followBusyByUser[user.id])}
              onFollowToggle={() => handleFollowToggle(user)}
              onClose={() => onOpenChange(false)}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <MobileActionSheet
        open={open}
        onOpenChange={onOpenChange}
        title={dialogTitle}
      >
        <div className="-mx-3 max-h-[70vh] overflow-y-auto py-1">{content}</div>
      </MobileActionSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden flex flex-col h-[70vh] sm:h-[60vh] bg-[#121212] border-white/10 rounded-3xl">
        <DialogHeader className="p-4 border-b border-white/5">
          <DialogTitle className="text-center text-white">
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>

        {content}
      </DialogContent>
    </Dialog>
  );
}

function UserListSkeleton() {
  return (
    <div className="space-y-1 px-2 py-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`user-list-skeleton-${index}`}
          className="flex items-center justify-between rounded-xl px-2 py-2"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24 bg-white/10" />
              <Skeleton className="h-3 w-20 bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function UserListItem({
  user,
  followBusy,
  onFollowToggle,
  onClose,
}: {
  user: UserPreview;
  followBusy: boolean;
  onFollowToggle: () => void;
  onClose: () => void;
}) {
  const getInitials = useInitials();
  const avatarSrc = user.avatar_variants?.sm || user.avatar;
  const showFollowButton = typeof user.is_following === "boolean";

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
      <Link
        href={`/@${user.username}`}
        onClick={onClose}
        className="flex items-center gap-3 min-w-0"
      >
        <Avatar className="h-10 w-10 ring-1 ring-white/10">
          {avatarSrc ? (
            <AvatarImage src={avatarSrc} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-neutral-700 to-neutral-800 text-white font-bold text-xs">
            {getInitials(user.name || user.username)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-white truncate">
            {user.name}
          </span >
          <span className="text-xs text-white/50 truncate">
            @{user.username}
          </span>
        </div>
      </Link>

      {showFollowButton ? (
        <Button
          size="sm"
          variant={user.is_following ? "outline" : "default"}
          className={cn(
            "rounded-full h-8 px-4 text-xs font-bold transition-all",
            user.is_following
              ? "border-white/20 bg-white/5 text-white hover:bg-white/10"
              : "bg-white text-black hover:bg-white/90"
          )}
          disabled={followBusy}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFollowToggle();
          }}
        >
          {followBusy ? "..." : user.is_following ? "Following" : "Follow"}
        </Button>
      ) : null}
    </div>
  );
}
