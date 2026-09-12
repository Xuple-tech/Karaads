import { useQuery } from '@tanstack/react-query';

import { monetizationService } from './service';

export const MONETIZATION_STATUS_QUERY_KEY = ['monetization', 'status'] as const;

export const useMonetizationStatus = () => {
  return useQuery({
    queryKey: MONETIZATION_STATUS_QUERY_KEY,
    queryFn: monetizationService.getStatus,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};
