import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store';
import { kwatiAiService, type KwatiChatMessage } from './service';

export const KWATI_AI_MESSAGES_KEY = ['kwati-ai', 'messages'] as const;

const messageKey = (message: Pick<KwatiChatMessage, 'role' | 'content'>) =>
  `${message.role}:${message.content.trim().replace(/\s+/g, ' ').toLowerCase()}`;

const dedupeMessages = (messages: KwatiChatMessage[]) => {
  const seen = new Set<string>();
  return messages.filter((message) => {
    const key = messageKey(message);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const useKwatiMessages = () => {
  const token = useAuthStore((state) => state.token);
  return useQuery({
    queryKey: KWATI_AI_MESSAGES_KEY,
    queryFn: kwatiAiService.getMessages,
    enabled: Boolean(token),
  });
};

export const useSendKwatiMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => kwatiAiService.sendMessage(content),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: KWATI_AI_MESSAGES_KEY });
      const previous = queryClient.getQueryData<KwatiChatMessage[]>(KWATI_AI_MESSAGES_KEY) ?? [];
      const optimistic: KwatiChatMessage = {
        id: `temp-kwati-${Date.now()}`,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
        status: 'pending',
      };
      queryClient.setQueryData<KwatiChatMessage[]>(KWATI_AI_MESSAGES_KEY, dedupeMessages([...previous, optimistic]));
      return { previous, optimisticId: optimistic.id };
    },
    onError: (error, variables, context) => {
      if (!context) return;
      const message = error instanceof Error ? error.message : 'Kwati AI is unavailable right now.';
      queryClient.setQueryData<KwatiChatMessage[]>(
        KWATI_AI_MESSAGES_KEY,
        dedupeMessages([
          ...context.previous,
          {
            id: context.optimisticId,
            role: 'user',
            content: variables,
            created_at: new Date().toISOString(),
            status: 'sent',
          },
          {
            id: `kwati-assistant-error-${Date.now()}`,
            role: 'assistant',
            content: message,
            created_at: new Date().toISOString(),
            status: 'sent',
          },
        ]),
      );
    },
    onSuccess: (messages, _variables, context) => {
      queryClient.setQueryData<KwatiChatMessage[]>(KWATI_AI_MESSAGES_KEY, (current = []) => {
        const withoutPending = context?.optimisticId ? current.filter((item) => item.id !== context.optimisticId) : current;
        const seenIds = new Set(withoutPending.map((item) => item.id));
        return dedupeMessages([...withoutPending, ...messages.filter((item) => !seenIds.has(item.id))]);
      });
    },
    onSettled: () => {
      // Keep the optimistic conversation on screen. The website Kwati endpoint
      // returns the reply but does not expose mobile chat history yet, so a
      // refetch can replace the visible conversation with an empty response.
    },
  });
};
