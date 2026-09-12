import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { referralsService } from './service';

export const REFERRAL_STATS_QUERY_KEY = ['referrals', 'stats'] as const;

export const useReferralStats = () => {
  return useQuery({
    queryKey: REFERRAL_STATS_QUERY_KEY,
    queryFn: referralsService.getStats,
    retry: 1,
  });
};

export const useRegisterReferralCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => referralsService.registerCode(code),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: REFERRAL_STATS_QUERY_KEY });
    },
  });
};
