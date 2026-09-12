import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { useAuthStore } from '@/features/auth/store';
import type { Message } from '@/lib/types/domain';
import { useSendMessage } from './hooks';
import { messagesService } from './service';

jest.mock('./service', () => {
  return {
    messagesService: {
      getConversations: jest.fn(),
      getMessages: jest.fn(),
      sendMessage: jest.fn(),
      createConversation: jest.fn(),
    },
  };
});

const mockedMessagesService = jest.mocked(messagesService);

describe('useSendMessage optimistic updates', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    useAuthStore.setState({
      token: 'token',
      user: { id: 'u-1', name: 'Tester', username: 'tester' },
      status: 'authenticated',
      hydrated: true,
    });
  });

  it('writes pending optimistic message then replaces with sent message', async () => {
    const conversationId = 'c-1';
    const threadKey = ['messages', 'thread', conversationId];
    queryClient.setQueryData<Message[]>(threadKey, []);

    let resolveSend: (value: Message) => void = () => undefined;
    const sendPromise = new Promise<Message>((resolve) => {
      resolveSend = resolve;
    });
    mockedMessagesService.sendMessage.mockReturnValueOnce(sendPromise);

    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useSendMessage(conversationId), { wrapper });

    let mutationPromise: Promise<Message>;
    await act(async () => {
      mutationPromise = result.current.mutateAsync({ content: 'hello world' });
    });

    const optimisticThread = queryClient.getQueryData<Message[]>(threadKey) ?? [];
    expect(optimisticThread).toHaveLength(1);
    expect(optimisticThread[0].status).toBe('pending');
    expect(optimisticThread[0].content).toBe('hello world');

    await act(async () => {
      resolveSend({
        id: 'm-1',
        content: 'hello world',
        created_at: new Date().toISOString(),
        status: 'sent',
        user_id: 'u-1',
      });
      await mutationPromise!;
    });

    await waitFor(() => {
      const thread = queryClient.getQueryData<Message[]>(threadKey) ?? [];
      expect(thread).toHaveLength(1);
      expect(thread[0].id).toBe('m-1');
      expect(thread[0].status).toBe('sent');
    });
  });
});
