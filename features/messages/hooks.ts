import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store';
import type { Conversation, Message } from '@/lib/types/domain';
import { messagesService } from './service';

export const CONVERSATIONS_KEY = ['messages', 'conversations'] as const;
export const conversationThreadKey = (conversationId: string) => ['messages', 'thread', conversationId] as const;

type ConversationCacheUpdateOptions = {
  currentUserId?: string;
  isConversationOpen?: boolean;
};

export const upsertConversationFromRealtimeMessage = (
  queryClient: QueryClient,
  conversationId: string,
  message: Message,
  options: ConversationCacheUpdateOptions = {},
) => {
  queryClient.setQueryData<Conversation[]>(CONVERSATIONS_KEY, (current = []) => {
    const isIncoming = Boolean(message.user_id && options.currentUserId && message.user_id !== options.currentUserId);
    const unreadDelta = isIncoming && !options.isConversationOpen ? 1 : 0;
    const existing = current.find((item) => item.id === conversationId);

    if (existing) {
      return current.map((item) => {
        if (item.id !== conversationId) {
          return item;
        }

        return {
          ...item,
          last_message: message,
          unread_count: options.isConversationOpen ? 0 : Number(item.unread_count ?? 0) + unreadDelta,
        };
      });
    }

    return [
      {
        id: conversationId,
        type: 'private',
        name: message.user?.name ?? 'Conversation',
        participants: message.user ? [message.user] : [],
        last_message: message,
        unread_count: unreadDelta,
      },
      ...current,
    ];
  });
};

export const useConversations = () => {
  return useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: messagesService.getConversations,
    retry: 1,
    refetchInterval: false,
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useConversationMessages = (conversationId: string, _usePollingFallback: boolean) => {
  return useQuery({
    queryKey: conversationThreadKey(conversationId),
    queryFn: () => messagesService.getMessages(conversationId),
    enabled: Boolean(conversationId),
    retry: 1,
    refetchInterval: false,
    staleTime: 30 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async ({ content, replyToId }: { content: string; replyToId?: string }) => {
      return messagesService.sendMessage(conversationId, content, replyToId);
    },
    onMutate: async ({ content }) => {
      await queryClient.cancelQueries({ queryKey: conversationThreadKey(conversationId) });

      const previous = queryClient.getQueryData<Message[]>(conversationThreadKey(conversationId)) ?? [];
      const optimisticId = `temp-${Date.now()}`;
      const optimistic: Message = {
        id: optimisticId,
        content,
        created_at: new Date().toISOString(),
        status: 'pending',
        user_id: currentUser?.id,
        user: currentUser ?? undefined,
        client_id: `${Date.now()}`,
      };

      queryClient.setQueryData<Message[]>(conversationThreadKey(conversationId), [...previous, optimistic]);
      upsertConversationFromRealtimeMessage(queryClient, conversationId, optimistic, {
        currentUserId: currentUser?.id,
        isConversationOpen: true,
      });

      return { previous, optimisticId, content };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      const failedMessage: Message = {
        id: context.optimisticId,
        content: context.content,
        created_at: new Date().toISOString(),
        status: 'failed',
        user_id: currentUser?.id,
        user: currentUser ?? undefined,
      };

      queryClient.setQueryData(conversationThreadKey(conversationId), [...context.previous, failedMessage]);
      upsertConversationFromRealtimeMessage(queryClient, conversationId, failedMessage, {
        currentUserId: currentUser?.id,
        isConversationOpen: true,
      });
    },
    onSuccess: (message) => {
      queryClient.setQueryData<Message[]>(conversationThreadKey(conversationId), (current = []) => {
        const withoutPending = current.filter((item) => !item.id.startsWith('temp-'));
        return [...withoutPending, { ...message, status: 'sent' }];
      });
      upsertConversationFromRealtimeMessage(queryClient, conversationId, { ...message, status: 'sent' }, {
        currentUserId: currentUser?.id,
        isConversationOpen: true,
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: conversationThreadKey(conversationId) });
      await queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
};

export const useSendMediaMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (input: {
      uri: string;
      name: string;
      mimeType: string;
      caption?: string;
      kind: 'image' | 'video' | 'audio';
    }) => {
      return messagesService.sendMediaMessage(conversationId, input);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: conversationThreadKey(conversationId) });
      const previous = queryClient.getQueryData<Message[]>(conversationThreadKey(conversationId)) ?? [];
      const optimisticId = `temp-media-${Date.now()}`;
      const prefix = input.kind === 'audio' ? '[Voice note]' : input.kind === 'video' ? '[Video]' : '[Image]';
      const optimistic: Message = {
        id: optimisticId,
        content: [prefix, input.caption?.trim()].filter(Boolean).join(' '),
        message_type: input.kind,
        attachments: [
          {
            url: input.uri,
            path: input.uri,
            mime_type: input.mimeType,
            type: input.kind,
            name: input.name,
          },
        ],
        created_at: new Date().toISOString(),
        status: 'pending',
        user_id: currentUser?.id,
        user: currentUser ?? undefined,
      };
      queryClient.setQueryData<Message[]>(conversationThreadKey(conversationId), [...previous, optimistic]);
      upsertConversationFromRealtimeMessage(queryClient, conversationId, optimistic, {
        currentUserId: currentUser?.id,
        isConversationOpen: true,
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData<Message[]>(conversationThreadKey(conversationId), (current = []) =>
        current.map((item) => (item.id.startsWith('temp-media-') ? { ...item, status: 'failed' } : item)),
      );
    },
    onSuccess: (message) => {
      queryClient.setQueryData<Message[]>(conversationThreadKey(conversationId), (current = []) => {
        const withoutPending = current.filter((item) => !item.id.startsWith('temp-media-'));
        return [...withoutPending, { ...message, status: 'sent' }];
      });
      upsertConversationFromRealtimeMessage(queryClient, conversationId, { ...message, status: 'sent' }, {
        currentUserId: currentUser?.id,
        isConversationOpen: true,
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: conversationThreadKey(conversationId) });
      await queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
};
