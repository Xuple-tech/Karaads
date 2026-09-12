import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { FEED_QUERY_KEY } from '@/features/feed/hooks';
import { adsService, type BoostPostInput, type CreatePostAdInput } from './service';

export const ADS_DASHBOARD_QUERY_KEY = ['ads', 'dashboard'] as const;

export const useAdsDashboard = () => {
  return useQuery({
    queryKey: ADS_DASHBOARD_QUERY_KEY,
    queryFn: () => adsService.getDashboard(),
    retry: 1,
  });
};

export const useCreatePostAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostAdInput) => adsService.createPostAd(input),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ADS_DASHBOARD_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }),
      ]);
    },
  });
};

export const useBoostPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BoostPostInput) => adsService.boostPost(input),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ADS_DASHBOARD_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }),
      ]);
    },
  });
};
