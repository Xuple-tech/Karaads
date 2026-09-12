import { conversationCallReducer, initialConversationCallState } from './hooks';

describe('conversationCallReducer', () => {
  it('handles outgoing call start and connection transitions', () => {
    const started = conversationCallReducer(initialConversationCallState, {
      type: 'start_succeeded',
      payload: {
        call_id: 'call-1',
        conversation_id: 'c-1',
        status: 'ringing',
      },
      conversationId: 'c-1',
    } as never);

    expect(started.status).toBe('ringing');
    expect(started.callId).toBe('call-1');
    expect(started.notes[0].text).toBe('You started a call');

    const accepted = conversationCallReducer(started, {
      type: 'accepted_event',
      conversationId: 'c-1',
      event: {
        call_id: 'call-1',
        conversation_id: 'c-1',
        from_user_id: 'u-2',
        type: 'CallAccepted',
      },
    } as never);

    expect(accepted.status).toBe('accepted');
    expect(accepted.notes.some((note) => note.text === 'Call connected')).toBe(true);
  });

  it('handles incoming call accept and end with deduped notes', () => {
    const incoming = conversationCallReducer(initialConversationCallState, {
      type: 'incoming_event',
      conversationId: 'c-1',
      event: {
        call_id: 'call-2',
        conversation_id: 'c-1',
        from_user_id: 'u-3',
        type: 'IncomingCall',
        caller: { id: 'u-3', name: 'Alex', username: 'alex' },
      },
    } as never);

    expect(incoming.status).toBe('ringing');
    expect(incoming.direction).toBe('incoming');
    expect(incoming.notes[0].text).toContain('is calling');

    const ended = conversationCallReducer(incoming, {
      type: 'ended_event',
      conversationId: 'c-1',
      event: {
        call_id: 'call-2',
        conversation_id: 'c-1',
        from_user_id: 'u-3',
        type: 'CallEnded',
      },
    } as never);

    const endedAgain = conversationCallReducer(ended, {
      type: 'ended_event',
      conversationId: 'c-1',
      event: {
        call_id: 'call-2',
        conversation_id: 'c-1',
        from_user_id: 'u-3',
        type: 'CallEnded',
      },
    } as never);

    expect(ended.status).toBe('ended');
    expect(ended.notes.some((note) => note.text === 'Call ended')).toBe(true);
    expect(endedAgain.notes).toHaveLength(ended.notes.length);
  });

  it('treats incoming calls as incoming even if participant role metadata is wrong', () => {
    const incoming = conversationCallReducer(initialConversationCallState, {
      type: 'incoming_event',
      conversationId: 'c-1',
      direction: 'incoming',
      event: {
        call_id: 'call-3',
        conversation_id: 'c-1',
        from_user_id: 'u-9',
        initiator_id: 'u-9',
        type: 'IncomingCall',
        caller: { id: 'u-9', name: 'Taylor', username: 'taylor' },
        participants: [
          { id: 'u-1', role: 'initiator' },
          { id: 'u-9', role: 'recipient' },
        ],
      },
    } as never);

    expect(incoming.status).toBe('ringing');
    expect(incoming.direction).toBe('incoming');
    expect(incoming.notes[0].text).toContain('Taylor is calling');
  });
});
