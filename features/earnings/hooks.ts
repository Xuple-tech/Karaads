import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { earningsService } from './service';

export const EARNINGS_QUERY_KEY = ['earnings', 'summary'] as const;
export const EARNINGS_QUEUE_QUERY_KEY = ['earnings', 'queue'] as const;
export const EARNINGS_BANKS_QUERY_KEY = ['earnings', 'banks'] as const;
export const EARNINGS_HISTORY_QUERY_KEY = ['earnings', 'history'] as const;
export const EARNINGS_POST_HISTORY_QUERY_KEY = ['earnings', 'post-history'] as const;
export const EARNINGS_WITHDRAWALS_QUERY_KEY = ['earnings', 'withdrawals'] as const;

export const useEarningsSummary = () => {
  return useQuery({
    queryKey: EARNINGS_QUERY_KEY,
    queryFn: earningsService.getSummary,
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnMount: 'always',
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: false,
  });
};

export const useEarningsQueue = (enabled = false) => {
  return useQuery({
    queryKey: EARNINGS_QUEUE_QUERY_KEY,
    queryFn: () => earningsService.getQueue(10),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchInterval: enabled ? 30 * 1000 : false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useEarningsHistory = () => {
  return useQuery({
    queryKey: EARNINGS_HISTORY_QUERY_KEY,
    queryFn: () => earningsService.getHistory(20),
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const usePostEarningsHistory = () => {
  return useQuery({
    queryKey: EARNINGS_POST_HISTORY_QUERY_KEY,
    queryFn: () => earningsService.getPostEarnings(20),
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useWithdrawalHistory = () => {
  return useQuery({
    queryKey: EARNINGS_WITHDRAWALS_QUERY_KEY,
    queryFn: () => earningsService.getWithdrawals(100),
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useWithdrawalBanks = (enabled = false) => {
  return useQuery({
    queryKey: EARNINGS_BANKS_QUERY_KEY,
    queryFn: earningsService.getWithdrawalBanks,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useResolveBankAccount = () => {
  return useMutation({ mutationFn: earningsService.resolveBankAccount });
};

export const useRequestWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: earningsService.requestWithdrawal,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: EARNINGS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: EARNINGS_QUEUE_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: EARNINGS_WITHDRAWALS_QUERY_KEY }),
      ]);
    },
  });
};
