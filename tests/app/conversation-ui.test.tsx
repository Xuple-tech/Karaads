import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import ConversationScreen from '@/app/(main)/messages/[conversationId]';

const mockMutateAsync = jest.fn();

jest.mock('@/lib/navigation/router', () => ({
  useLocalSearchParams: () => ({ conversationId: 'c-1' }),
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
    replace: jest.fn(),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/features/auth/store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({
      token: 'token',
      user: { id: 'u-1', name: 'Me', username: 'me' },
    }),
}));

jest.mock('@/features/messages/hooks', () => {
  const actual = jest.requireActual('@/features/messages/hooks');
  return {
    ...actual,
    useConversations: () => ({
      data: [
        {
          id: 'c-1',
          name: 'Alex',
          unread_count: 0,
          participants: [{ id: 'u-2', name: 'Alex', username: 'alex' }],
        },
      ],
    }),
    useConversationMessages: () => ({
      data: [
        {
          id: 'm-1',
          content: 'hi',
          created_at: '2026-02-24T00:00:00.000Z',
          user_id: 'u-2',
          user: { id: 'u-2', name: 'Alex', username: 'alex' },
        },
      ],
      isLoading: false,
    }),
    useSendMessage: () => ({
      mutateAsync: mockMutateAsync,
      isPending: false,
    }),
  };
});

jest.mock('@/features/calls/hooks', () => ({
  useConversationCall: () => ({
    callId: 'call-1',
    status: 'ringing',
    direction: 'incoming',
    notes: [
      {
        id: 'note-1',
        kind: 'call-note',
        conversation_id: 'c-1',
        call_id: 'call-1',
        text: 'Alex is calling',
        created_at: '2026-02-24T00:00:01.000Z',
      },
    ],
    canStart: false,
    canAccept: true,
    canDecline: true,
    canEnd: false,
    startCall: jest.fn(),
    acceptCall: jest.fn(),
    declineCall: jest.fn(),
    endCall: jest.fn(),
    syncActiveCall: jest.fn().mockResolvedValue(undefined),
    applyRealtimeEvent: jest.fn(),
  }),
}));

jest.mock('@/lib/realtime/reverb', () => ({
  reverbService: {
    connect: jest.fn(),
    subscribeUser: jest.fn(),
    subscribeConversation: jest.fn(),
    subscribeCall: jest.fn(),
    onConnectionState: jest.fn(() => () => undefined),
    onMessage: jest.fn(() => () => undefined),
    onCallEvent: jest.fn(() => () => undefined),
    unsubscribeConversation: jest.fn(),
    unsubscribeUser: jest.fn(),
    unsubscribeCall: jest.fn(),
  },
}));

describe('conversation ui', () => {
  it('renders call timeline notes and incoming controls', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const screen = render(<ConversationScreen />, { wrapper });

    expect(screen.getByText('Alex is calling')).toBeTruthy();
    expect(screen.getByText('Accept')).toBeTruthy();
    expect(screen.getByText('Decline')).toBeTruthy();
  });
});
