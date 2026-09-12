import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

jest.mock('@/features/auth/store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({
      token: 'token',
      user: { id: 'u-1', name: 'Me', username: 'me' },
      status: 'authenticated',
      hydrated: true,
    }),
}));

const mockAddNotificationResponseReceivedListener = jest.fn(() => ({ remove: jest.fn() }));
jest.mock('expo-notifications', () => ({
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('@/lib/navigation/router', () => ({
  router: {
    push: jest.fn(),
    getCurrentRoute: () => ({ name: 'MainTabs', params: {} }),
  },
  navigationRef: {
    addListener: jest.fn(() => () => undefined),
  },
}));

const mockGetPermission = jest.fn();
const mockGetInbox = jest.fn();
const mockSendStackedFromInbox = jest.fn();
const mockSendStackedLocal = jest.fn();

jest.mock('@/features/notifications/service', () => {
  const actual = jest.requireActual('@/features/notifications/service');
  return {
    ...actual,
    notificationService: {
      ...actual.notificationService,
      getPermission: (...args: unknown[]) => mockGetPermission(...args),
      getInbox: (...args: unknown[]) => mockGetInbox(...args),
      sendStackedFromInbox: (...args: unknown[]) => mockSendStackedFromInbox(...args),
      sendStackedLocal: (...args: unknown[]) => mockSendStackedLocal(...args),
    },
  };
});

let connectionStateListener: ((connected: boolean) => void) | null = null;
let notificationListener: ((event: Record<string, unknown>) => void) | null = null;
let activityListener: ((event: Record<string, unknown>) => void) | null = null;

const mockReverbService = {
  connect: jest.fn(),
  subscribeUser: jest.fn(),
  subscribeNotifications: jest.fn(),
  subscribeFeed: jest.fn(),
  onConnectionState: jest.fn((listener: (connected: boolean) => void) => {
    connectionStateListener = listener;
    listener(false);
    return () => {
      connectionStateListener = null;
    };
  }),
  onMessage: jest.fn(() => () => undefined),
  onCallEvent: jest.fn(() => () => undefined),
  onNotificationEvent: jest.fn((listener: (event: Record<string, unknown>) => void) => {
    notificationListener = listener;
    return () => {
      notificationListener = null;
    };
  }),
  onActivityEvent: jest.fn((listener: (event: Record<string, unknown>) => void) => {
    activityListener = listener;
    return () => {
      activityListener = null;
    };
  }),
  unsubscribeUser: jest.fn(),
  unsubscribeNotifications: jest.fn(),
  unsubscribeFeed: jest.fn(),
};

jest.mock('@/lib/realtime/reverb', () => ({
  reverbService: mockReverbService,
}));

describe('PushEventManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    connectionStateListener = null;
    notificationListener = null;
    activityListener = null;
    mockGetPermission.mockResolvedValue('granted');
    mockGetInbox.mockResolvedValue([]);
    mockSendStackedFromInbox.mockResolvedValue(undefined);
    mockSendStackedLocal.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('upserts realtime notifications, sends local alert, and resyncs on reconnect', async () => {
    const { PushEventManager } = require('@/features/notifications/push-event-manager');
    const { NOTIFICATION_INBOX_KEY } = require('@/features/notifications/inbox-hooks');
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    render(<PushEventManager />, { wrapper });

    await waitFor(() => {
      expect(mockReverbService.subscribeNotifications).toHaveBeenCalledWith('u-1');
    });

    await act(async () => {
      notificationListener?.({
        notification: {
          id: 'n-1',
          title: 'New like',
          body: 'Someone liked your post',
          created_at: '2026-03-07T10:00:00.000Z',
        },
      });
    });

    const inbox = queryClient.getQueryData(NOTIFICATION_INBOX_KEY) as Array<{ id: string }>;
    expect(inbox[0].id).toBe('n-1');
    expect(mockSendStackedFromInbox).toHaveBeenCalledTimes(1);

    await act(async () => {
      connectionStateListener?.(true);
    });
  });

  it('invalidates activity queries and skips local alert for self-authored activity', async () => {
    const { PushEventManager } = require('@/features/notifications/push-event-manager');
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    render(<PushEventManager />, { wrapper });

    await waitFor(() => {
      expect(mockReverbService.subscribeFeed).toHaveBeenCalledWith('u-1');
    });

    await act(async () => {
      activityListener?.({
        id: 'p-9',
        actor_id: 'u-2',
        title: 'New post',
        body: 'Posted to feed',
        type: 'post',
      });
    });
    expect(mockSendStackedLocal).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['feed'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['moments'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile', 'me'] });

    await act(async () => {
      activityListener?.({
        id: 'p-10',
        actor_id: 'u-1',
        title: 'Self post',
        body: 'My own post',
        type: 'post',
      });
    });
    expect(mockSendStackedLocal).toHaveBeenCalledTimes(1);
  });
});
