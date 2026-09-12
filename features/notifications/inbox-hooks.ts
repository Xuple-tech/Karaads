import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store';
import { type NotificationItem, notificationService } from '@/features/notifications/service';

export const NOTIFICATION_INBOX_KEY = ['notifications', 'inbox'] as const;

export const useNotificationInbox = () => {
  const authStatus = useAuthStore((state) => state.status);

  return useQuery({
    queryKey: NOTIFICATION_INBOX_KEY,
    queryFn: notificationService.getInbox,
    enabled: authStatus === 'authenticated',
    refetchInterval: false,
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAllRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_INBOX_KEY });
      const previous = queryClient.getQueryData<NotificationItem[]>(NOTIFICATION_INBOX_KEY);
      const now = new Date().toISOString();
      queryClient.setQueryData<NotificationItem[]>(NOTIFICATION_INBOX_KEY, (current) =>
        (current ?? []).map((item) => ({ ...item, read_at: item.read_at ?? now })),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATION_INBOX_KEY, context.previous);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: NOTIFICATION_INBOX_KEY });
    },
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markRead,
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_INBOX_KEY });
      const previous = queryClient.getQueryData<NotificationItem[]>(NOTIFICATION_INBOX_KEY);
      const now = new Date().toISOString();
      queryClient.setQueryData<NotificationItem[]>(NOTIFICATION_INBOX_KEY, (current) =>
        (current ?? []).map((item) => (item.id === notificationId ? { ...item, read_at: item.read_at ?? now } : item)),
      );
      return { previous };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATION_INBOX_KEY, context.previous);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: NOTIFICATION_INBOX_KEY });
    },
  });
};
