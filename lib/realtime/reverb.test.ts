type EventCallback = (payload?: unknown) => void;

const channelListeners = new Map<string, Map<string, EventCallback[]>>();
const connectionListeners = new Map<string, EventCallback[]>();

const ensureChannelEvent = (channel: string, eventName: string) => {
  if (!channelListeners.has(channel)) {
    channelListeners.set(channel, new Map<string, EventCallback[]>());
  }

  const events = channelListeners.get(channel)!;
  if (!events.has(eventName)) {
    events.set(eventName, []);
  }

  return events.get(eventName)!;
};

const emitChannel = (channel: string, eventName: string, payload: unknown) => {
  const events = channelListeners.get(channel);
  events?.get(eventName)?.forEach((listener) => listener(payload));
};

const emitConnection = (eventName: string) => {
  connectionListeners.get(eventName)?.forEach((listener) => listener());
};

class MockEcho {
  private(channelName: string) {
    return {
      listen: (eventName: string, callback: EventCallback) => {
        ensureChannelEvent(channelName, eventName).push(callback);
        return this;
      },
    };
  }

  leave(channelName: string) {
    channelListeners.delete(channelName);
  }

  disconnect() {
    channelListeners.clear();
  }
}

class MockPusher {
  connection = {
    bind: (eventName: string, callback: EventCallback) => {
      if (!connectionListeners.has(eventName)) {
        connectionListeners.set(eventName, []);
      }
      connectionListeners.get(eventName)!.push(callback);
    },
  };
}

jest.mock('laravel-echo', () => {
  return jest.fn().mockImplementation(() => new MockEcho());
});

jest.mock('pusher-js/react-native', () => {
  return jest.fn().mockImplementation(() => new MockPusher());
});

describe('ReverbService', () => {
  beforeEach(() => {
    channelListeners.clear();
    connectionListeners.clear();
    process.env.EXPO_PUBLIC_REVERB_KEY = 'test-key';
  });

  it('dispatches message events to listeners and de-dupes repeated payload IDs', () => {
    const { ReverbService } = require('./reverb');
    const service = new ReverbService();
    const onMessage = jest.fn();

    const unsubscribe = service.onMessage(onMessage);
    service.connect('token');
    service.subscribeConversation('c-1');

    emitChannel('conversation.c-1', 'MessageSent', {
      id: 'm-1',
      content: 'hello',
      created_at: '2026-02-24T00:00:00.000Z',
      conversation_id: 'c-1',
    });
    emitChannel('conversation.c-1', 'MessageSent', {
      id: 'm-1',
      content: 'hello',
      created_at: '2026-02-24T00:00:00.000Z',
      conversation_id: 'c-1',
    });

    expect(onMessage).toHaveBeenCalledTimes(1);

    unsubscribe();
    emitChannel('conversation.c-1', 'MessageSent', {
      id: 'm-2',
      content: 'bye',
      created_at: '2026-02-24T00:00:00.000Z',
      conversation_id: 'c-1',
    });

    expect(onMessage).toHaveBeenCalledTimes(1);
  });

  it('dispatches call events from both user and call channels', () => {
    const { ReverbService } = require('./reverb');
    const service = new ReverbService();
    const onCall = jest.fn();

    service.connect('token');
    service.onCallEvent(onCall);
    service.subscribeUser('u-1');
    service.subscribeCall('call-1');

    emitChannel(
      'App.Models.User.u-1',
      'IncomingCall',
      JSON.stringify({
        event: 'IncomingCall',
        data: JSON.stringify({
          call_id: 'call-1',
          conversation_id: 'c-2',
          from_user_id: 'u-9',
          caller: { id: 'u-9', name: 'Caller', username: 'caller' },
        }),
      }),
    );
    emitChannel('call.call-1', 'CallEnded', {
      call_id: 'call-1',
      conversation_id: 'c-2',
      from_user_id: 'u-9',
    });

    expect(onCall).toHaveBeenCalledTimes(2);
    expect(onCall.mock.calls[0][0].type).toBe('IncomingCall');
    expect(onCall.mock.calls[1][0].type).toBe('CallEnded');
  });

  it('does not de-dupe distinct ICE candidates for the same call', () => {
    const { ReverbService } = require('./reverb');
    const service = new ReverbService();
    const onCall = jest.fn();

    service.connect('token');
    service.onCallEvent(onCall);
    service.subscribeCall('call-ice');

    emitChannel('call.call-ice', 'CallIceCandidate', {
      call_id: 'call-ice',
      conversation_id: 'c-ice',
      from_user_id: 'u-9',
      candidate: { candidate: 'candidate-a', sdpMid: '0', sdpMLineIndex: 0 },
    });
    emitChannel('call.call-ice', 'CallIceCandidate', {
      call_id: 'call-ice',
      conversation_id: 'c-ice',
      from_user_id: 'u-9',
      candidate: { candidate: 'candidate-b', sdpMid: '0', sdpMLineIndex: 0 },
    });

    expect(onCall).toHaveBeenCalledTimes(2);
    expect(onCall.mock.calls[0][0].candidate.candidate).toBe('candidate-a');
    expect(onCall.mock.calls[1][0].candidate.candidate).toBe('candidate-b');
  });

  it('buffers recent call events so late screens can replay signaling', () => {
    const { ReverbService } = require('./reverb');
    const service = new ReverbService();

    service.connect('token');
    service.subscribeCall('call-replay');

    emitChannel('call.call-replay', 'CallOffer', {
      call_id: 'call-replay',
      conversation_id: 'c-replay',
      from_user_id: 'u-9',
      offer_signal_id: 'offer-1',
    });
    emitChannel('call.call-replay', 'CallIceCandidate', {
      call_id: 'call-replay',
      conversation_id: 'c-replay',
      from_user_id: 'u-9',
      candidate: { candidate: 'candidate-a', sdpMid: '0', sdpMLineIndex: 0 },
    });

    const buffered = service.getRecentCallEvents('call-replay');

    expect(buffered).toHaveLength(2);
    expect(buffered[0].type).toBe('CallOffer');
    expect(buffered[1].type).toBe('CallIceCandidate');
  });

  it('dispatches notification and feed activity events with de-dupe', () => {
    const { ReverbService } = require('./reverb');
    const service = new ReverbService();
    const onNotification = jest.fn();
    const onActivity = jest.fn();

    service.connect('token');
    service.onNotificationEvent(onNotification);
    service.onActivityEvent(onActivity);
    service.subscribeNotifications('u-1');
    service.subscribeFeed('u-1');

    emitChannel('notifications.u-1', 'NotificationCreated', {
      notification: {
        id: 'n-1',
        type: 'like',
        title: 'New like',
      },
    });
    emitChannel('notifications.u-1', 'NotificationCreated', {
      notification: {
        id: 'n-1',
        type: 'like',
        title: 'New like',
      },
    });

    emitChannel('feed.u-1', 'PostCreated', {
      data: {
        id: 'p-1',
        actor_id: 'u-2',
        type: 'post',
      },
    });
    emitChannel('feed.u-1', 'PostCreated', {
      data: {
        id: 'p-1',
        actor_id: 'u-2',
        type: 'post',
      },
    });

    expect(onNotification).toHaveBeenCalledTimes(1);
    expect(onActivity).toHaveBeenCalledTimes(1);
    expect(onNotification.mock.calls[0][0].id).toBe('n-1');
    expect(onActivity.mock.calls[0][0].id).toBe('p-1');
  });

  it('notifies connection listeners on connect and disconnect transitions', () => {
    const { ReverbService } = require('./reverb');
    const service = new ReverbService();
    const listener = jest.fn();

    service.onConnectionState(listener);
    service.connect('token');
    emitConnection('connected');
    emitConnection('disconnected');

    expect(listener).toHaveBeenNthCalledWith(1, false);
    expect(listener).toHaveBeenNthCalledWith(2, true);
    expect(listener).toHaveBeenNthCalledWith(3, false);
  });
});
