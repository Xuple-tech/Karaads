import { inferStackType, normalizeNotification } from './service';

describe('notificationService helpers', () => {
  it('maps follow, like, comment, share, and message notifications into push-friendly copy', () => {
    const follow = normalizeNotification({
      id: 'n-follow',
      type: 'followed',
      actor: { name: 'Ada' },
      created_at: '2026-03-29T00:00:00.000Z',
    });
    expect(follow.title).toBe('Ada started following you');

    const like = normalizeNotification({
      id: 'n-like',
      type: 'post_liked',
      actor: { name: 'Tman' },
      body: 'Nice one',
      created_at: '2026-03-29T00:00:00.000Z',
    });
    expect(like.title).toBe('Tman liked your post');

    const comment = normalizeNotification({
      id: 'n-comment',
      type: 'comment_added',
      actor: { name: 'Mira' },
      message: 'This is clean',
      created_at: '2026-03-29T00:00:00.000Z',
    });
    expect(comment.title).toBe('Mira commented on your post');
    expect(comment.body).toBe('This is clean');

    const share = normalizeNotification({
      id: 'n-share',
      type: 'post_shared',
      actor: { name: 'Joel' },
      created_at: '2026-03-29T00:00:00.000Z',
    });
    expect(share.title).toBe('Joel shared your post');

    const message = normalizeNotification({
      id: 'n-message',
      type: 'chat_message',
      actor: { name: 'Nina' },
      content: 'Hey there',
      created_at: '2026-03-29T00:00:00.000Z',
    });
    expect(message.title).toBe('Nina sent you a message');
    expect(message.body).toBe('Hey there');
  });

  it('infers the correct notification stacks for chat, calls, posts, and generic activity', () => {
    expect(inferStackType({ type: 'chat_message', title: 'New message', body: 'Hello' })).toBe('messages');
    expect(inferStackType({ type: 'incoming_call', title: 'Call update', body: 'Missed call' })).toBe('calls');
    expect(inferStackType({ type: 'post_shared', title: 'Shared your post', body: 'Boosting reach' })).toBe('posts');
    expect(inferStackType({ type: 'followed', title: 'New follower', body: 'Profile update' })).toBe('activity');
  });
});
