import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/store';
import { postCacheStorage } from '@/lib/storage/post-cache';
import type { MomentPost } from '@/lib/types/domain';
import { momentService } from './service';

export const MOMENT_QUERY_KEY = ['moments'] as const;

type MomentPage = { moments: MomentPost[]; source: 'moments' | 'feed' | 'cache' };
type MomentInfiniteData = InfiniteData<MomentPage, number>;

const buildCachedMomentData = (moments: MomentPost[]): MomentInfiniteData => ({
  pages: [{ moments, source: 'cache' }],
  pageParams: [1],
});

export const useMoments = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    let cancelled = false;

    postCacheStorage.readRecentMoments(userId).then((moments) => {
      if (cancelled || moments.length === 0) {
        return;
      }

      queryClient.setQueryData<MomentInfiniteData>(MOMENT_QUERY_KEY, (current) => current ?? buildCachedMomentData(moments));
    });

    return () => {
      cancelled = true;
    };
  }, [queryClient, userId]);

  return useInfiniteQuery<MomentPage, Error, MomentInfiniteData, typeof MOMENT_QUERY_KEY, number>({
    queryKey: MOMENT_QUERY_KEY,
    staleTime: 30 * 1000,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => momentService.getMoments(pageParam),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.moments.length === 0) {
        return undefined;
      }

      return pages.length + 1;
    },
  });
};
