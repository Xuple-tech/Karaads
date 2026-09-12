import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store';
import { appKeyValueStorage } from '@/lib/storage/secure-store';
import type { UserSummary } from '@/lib/types/domain';
import { profileService } from './service';

export const MY_PROFILE_KEY = ['profile', 'me'] as const;

export const useMyProfile = () => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: MY_PROFILE_KEY,
    queryFn: () => profileService.getProfileBundle(),
    enabled: Boolean(token),
    retry: 1,
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
  });
};

export const usePublicProfile = (username: string) => {
  const viewerUserId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ['profile', username],
    queryFn: async () => applyFollowOverride(await profileService.byUsername(username), viewerUserId),
    enabled: Boolean(username),
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

export const useFollowers = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['profile', userId, 'followers'],
    queryFn: () => profileService.followers(userId),
    enabled: Boolean(userId) && enabled,
  });
};

export const useFollowing = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['profile', userId, 'following'],
    queryFn: () => profileService.following(userId),
    enabled: Boolean(userId) && enabled,
  });
};

export const useFollowToggle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isFollowing }: { userId: string; isFollowing?: boolean }) => {
      if (isFollowing) {
        await profileService.unfollow(userId);
      } else {
        await profileService.follow(userId);
      }
    },
    onMutate: async ({ userId, isFollowing }) => {
      const nextFollowing = !Boolean(isFollowing);
      followOverrides.set(userId, nextFollowing);
      await persistFollowOverride(userId, nextFollowing);
      patchFollowStateInCache(queryClient, userId, nextFollowing);

      return { userId, previousFollowing: Boolean(isFollowing), nextFollowing };
    },
    onError: (_error, _variables, context) => {
      if (!context?.userId) return;
      followOverrides.set(context.userId, context.previousFollowing);
      persistFollowOverride(context.userId, context.previousFollowing).catch(() => undefined);
      patchFollowStateInCache(queryClient, context.userId, context.previousFollowing);
    },
    onSuccess: (_data, _variables, context) => {
      if (!context?.userId) return;
      followOverrides.set(context.userId, context.nextFollowing);
      persistFollowOverride(context.userId, context.nextFollowing).catch(() => undefined);
      patchFollowStateInCache(queryClient, context.userId, context.nextFollowing);
    },
    onSettled: async (_data, _error, _variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: MY_PROFILE_KEY }),
      ]);

      if (context?.userId) {
        patchFollowStateInCache(queryClient, context.userId, context.nextFollowing);
      }
    },
  });
};

const followOverrides = new Map<string, boolean>();
const loadedFollowOverrideKeys = new Set<string>();

const getFollowOverrideStorageKey = (viewerUserId?: string): string =>
  `karaads_follow_overrides_${viewerUserId ?? useAuthStore.getState().user?.id ?? 'guest'}`;

const loadStoredFollowOverrides = async (viewerUserId?: string): Promise<void> => {
  const storageKey = getFollowOverrideStorageKey(viewerUserId);
  if (loadedFollowOverrideKeys.has(storageKey)) return;
  loadedFollowOverrideKeys.add(storageKey);

  const raw = await appKeyValueStorage.getItem(storageKey).catch(() => null);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    Object.entries(parsed).forEach(([userId, value]) => {
      if (typeof value === 'boolean') {
        followOverrides.set(userId, value);
      }
    });
  } catch {
    // Ignore corrupted local state; fresh follow actions will rewrite it.
  }
};

const persistFollowOverride = async (userId: string, isFollowing: boolean): Promise<void> => {
  const storageKey = getFollowOverrideStorageKey();
  await loadStoredFollowOverrides();
  const next: Record<string, boolean> = {};
  followOverrides.forEach((value, key) => {
    next[key] = value;
  });
  next[userId] = isFollowing;
  await appKeyValueStorage.setItem(storageKey, JSON.stringify(next));
};

const applyFollowOverride = async <T extends UserSummary | null | undefined>(user: T, viewerUserId?: string): Promise<T> => {
  await loadStoredFollowOverrides(viewerUserId);
  if (!user?.id || !followOverrides.has(user.id)) return user;
  return patchUserFollowState(user, followOverrides.get(user.id) ?? false) as T;
};

const patchUserFollowState = <T extends UserSummary>(user: T, isFollowing: boolean): T => {
  const currentCount = user.followers_count ?? 0;
  const wasFollowing = Boolean(user.is_following);
  const delta = isFollowing === wasFollowing ? 0 : isFollowing ? 1 : -1;

  return {
    ...user,
    is_following: isFollowing,
    followers_count: Math.max(0, currentCount + delta),
  };
};

const patchFollowStateInCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  isFollowing: boolean,
) => {
  queryClient.getQueryCache().findAll().forEach((query) => {
    queryClient.setQueryData(query.queryKey, (current: unknown) =>
      patchFollowStateInValue(current, userId, isFollowing),
    );
  });
};

const patchFollowStateInValue = (value: unknown, userId: string, isFollowing: boolean): unknown => {
  if (!value) return value;

  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const patched = patchFollowStateInValue(item, userId, isFollowing);
      if (patched !== item) changed = true;
      return patched;
    });
    return changed ? next : value;
  }

  if (typeof value !== 'object') return value;

  const record = value as Record<string, unknown>;
  let changed = false;
  const next: Record<string, unknown> = { ...record };

  if (record.id === userId && ('username' in record || 'followers_count' in record || 'is_following' in record)) {
    Object.assign(next, patchUserFollowState(record as UserSummary, isFollowing));
    changed = true;
  }

  for (const [key, item] of Object.entries(record)) {
    const patched = patchFollowStateInValue(item, userId, isFollowing);
    if (patched !== item) {
      next[key] = patched;
      changed = true;
    }
  }

  return changed ? next : value;
};
