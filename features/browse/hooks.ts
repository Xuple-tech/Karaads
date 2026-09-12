import { useQuery } from '@tanstack/react-query';

import { browseService } from './service';

export const useBrowseSearch = (query: string) => {
  return useQuery({
    queryKey: ['browse', query],
    queryFn: () => browseService.search(query),
    enabled: query.trim().length > 1,
  });
};