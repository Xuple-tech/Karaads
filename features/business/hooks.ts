import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { businessService, type BusinessPage, type CreateBusinessPageInput, type CreateBusinessPagePostInput } from './service';

export const BUSINESS_PAGE_KEY = ['business', 'my-page'] as const;
export const BUSINESS_PAGES_KEY = ['business', 'my-pages'] as const;
export const BUSINESS_FOLLOWED_PAGES_KEY = ['business', 'followed-pages'] as const;

export const useMyBusinessPages = () => {
  return useQuery({
    queryKey: BUSINESS_PAGES_KEY,
    queryFn: businessService.getMyPages,
    retry: 1,
  });
};

export const useMyBusinessPage = () => {
  return useQuery({
    queryKey: BUSINESS_PAGE_KEY,
    queryFn: businessService.getMyPage,
    retry: 1,
  });
};

export const useCreateBusinessPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBusinessPageInput) => businessService.createPage(input),
    onSuccess: (page: BusinessPage) => {
      queryClient.setQueryData(BUSINESS_PAGE_KEY, page);
      queryClient.setQueryData<BusinessPage[]>(BUSINESS_PAGES_KEY, (current = []) => [
        page,
        ...current.filter((item) => item.id !== page.id),
      ]);
    },
  });
};

export const useCreateBusinessPagePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBusinessPagePostInput) => businessService.createPagePost(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: BUSINESS_PAGE_KEY }),
        queryClient.invalidateQueries({ queryKey: BUSINESS_PAGES_KEY }),
        queryClient.invalidateQueries({ queryKey: ['feed'] }),
      ]);
    },
  });
};

export const useFollowedBusinessPages = () => {
  return useQuery({
    queryKey: BUSINESS_FOLLOWED_PAGES_KEY,
    queryFn: businessService.getFollowedPageMap,
  });
};

export const useFollowBusinessPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId, isFollowing }: { pageId: string; isFollowing: boolean }) => businessService.followPage(pageId, isFollowing),
    onSuccess: (isFollowing, variables) => {
      queryClient.setQueryData<Record<string, boolean>>(BUSINESS_FOLLOWED_PAGES_KEY, (current = {}) => ({
        ...current,
        [variables.pageId]: isFollowing,
      }));
    },
  });
};
