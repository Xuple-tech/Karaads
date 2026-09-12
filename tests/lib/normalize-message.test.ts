import { normalizeMessage } from '@/lib/api/normalize';

describe('normalizeMessage', () => {
  it('preserves attachment metadata for media messages', () => {
    const message = normalizeMessage({
      id: 'm-1',
      conversation_id: 'c-1',
      message_type: 'audio',
      attachments: [
        {
          id: 'a-1',
          url: '/storage/messages/voice-note.m4a',
          mime_type: 'audio/m4a',
          name: 'voice-note.m4a',
          duration: 12,
        },
      ],
      user: {
        id: 'u-1',
        name: 'Alex',
        username: 'alex',
      },
      created_at: '2026-03-27T12:00:00.000Z',
    });

    expect(message.message_type).toBe('audio');
    expect(message.attachments).toHaveLength(1);
    expect(message.attachments?.[0]?.url).toContain('/storage/messages/voice-note.m4a');
    expect(message.attachments?.[0]?.mime_type).toBe('audio/m4a');
    expect(message.attachments?.[0]?.duration).toBe(12);
    expect(message.content).toBe('[Voice note]');
  });
});
