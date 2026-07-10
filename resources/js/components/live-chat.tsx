import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmojiStickerPicker } from '@/components/emoji-sticker-picker';
import { cn } from '@/lib/utils';
import { initializeEcho } from '@/utils/echo';

interface LiveUser {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    avatar_variants?: {
        sm?: string | null;
        md?: string | null;
        lg?: string | null;
    } | null;
}

interface LiveChatMessage {
    id: string;
    message: string;
    is_pinned?: boolean;
    pinned_at?: string | null;
    is_deleted?: boolean;
    created_at: string;
    user: LiveUser;
}

interface LiveChatProps {
    streamId: string;
    currentUserId?: string | number;
    className?: string;
    variant?: 'panel' | 'sheet' | 'floating';
    showHeader?: boolean;
    compact?: boolean;
    canModerate?: boolean;
}

const resolveAvatarUrl = (url?: string | null): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return url.startsWith('/') ? url : `/${url}`;
};

const initials = (value?: string | null) => {
    const trimmed = (value ?? '').trim();
    if (!trimmed) return 'U';
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const normalizeUserId = (value?: string | number | null): string => String(value ?? '');

export function LiveChat({
    streamId,
    currentUserId,
    className,
    variant = 'panel',
    showHeader = true,
    compact = false,
    canModerate = false,
}: LiveChatProps) {
    const [messages, setMessages] = useState<LiveChatMessage[]>([]);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const sortedMessages = useMemo(
        () =>
            messages.filter((item) => !item.is_deleted).sort(
                (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime(),
            ),
        [messages],
    );
    const pinnedMessage = useMemo(
        () =>
            sortedMessages
                .filter((item) => item.is_pinned)
                .sort(
                    (a, b) =>
                        new Date(b.pinned_at ?? b.created_at).getTime() -
                        new Date(a.pinned_at ?? a.created_at).getTime(),
                )[0],
        [sortedMessages],
    );

    useEffect(() => {
        if (!streamId) return;
        let mounted = true;

        const fetchMessages = async () => {
            const { data } = await axiosInstance.get(
                `/api/live/streams/${streamId}/chat`,
            );
            const payload = data?.data ?? data ?? [];
            if (!mounted) return;
            setMessages(payload);
        };

        fetchMessages().catch(() => {});

        return () => {
            mounted = false;
        };
    }, [streamId]);

    useEffect(() => {
        if (!streamId) return;

        initializeEcho();
        if (!window.Echo) return;

        const channel = window.Echo.join(`presence.live.${streamId}`);
        channel.listen('.live.chat.message', (data: any) => {
            if (!data?.message) return;
            setMessages((prev) => {
                const exists = prev.some((item) => item.id === data.message.id);
                if (exists) return prev;
                return [...prev, data.message];
            });
        });
        channel.listen('.live.chat.message.updated', (data: any) => {
            if (!data?.message?.id) return;
            setMessages((prev) => {
                const next = prev.map((item) =>
                    item.id === data.message.id ? { ...item, ...data.message } : item,
                );
                if (data.message.is_pinned) {
                    return next.map((item) =>
                        item.id === data.message.id ? item : { ...item, is_pinned: false, pinned_at: null },
                    );
                }
                return next;
            });
        });

        return () => {
            try {
                channel.stopListening('.live.chat.message');
                channel.stopListening('.live.chat.message.updated');
            } catch {
                // ignore
            }
        };
    }, [streamId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [sortedMessages.length]);

    const sendMessage = useCallback(async () => {
        if (!message.trim() || sending) return;
        setSending(true);
        try {
            const { data } = await axiosInstance.post(
                `/api/live/streams/${streamId}/chat`,
                { message: message.trim() },
            );
            const payload = data?.data ?? data;
            if (payload?.id) {
                setMessages((prev) => [...prev, payload]);
            }
            setMessage('');
        } catch {
            // ignore
        } finally {
            setSending(false);
        }
    }, [message, sending, streamId]);

    const togglePinMessage = useCallback(async (item: LiveChatMessage) => {
        if (!canModerate) return;
        try {
            const { data } = await axiosInstance.post(
                `/api/live/streams/${streamId}/chat/${item.id}/pin`,
            );
            const payload = data?.data ?? data;
            if (!payload?.id) return;
            setMessages((prev) =>
                prev.map((messageItem) => {
                    if (messageItem.id === payload.id) return { ...messageItem, ...payload };
                    if (payload.is_pinned) return { ...messageItem, is_pinned: false, pinned_at: null };
                    return messageItem;
                }),
            );
        } catch {
            // ignore
        }
    }, [canModerate, streamId]);

    const removeMessage = useCallback(async (item: LiveChatMessage) => {
        if (!currentUserId && !canModerate) return;
        try {
            await axiosInstance.delete(`/api/live/streams/${streamId}/chat/${item.id}`);
            setMessages((prev) =>
                prev.map((messageItem) =>
                    messageItem.id === item.id
                        ? { ...messageItem, is_deleted: true, is_pinned: false, pinned_at: null }
                        : messageItem,
                ),
            );
        } catch {
            // ignore
        }
    }, [canModerate, currentUserId, streamId]);

    return (
        <div className={className}>
            <div
                className={cn(
                    'flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-white',
                    variant === 'sheet' && 'bg-[#11151c] shadow-[0_18px_50px_rgba(0,0,0,0.35)]',
                    variant === 'floating' && 'gap-1.5 rounded-none border-0 bg-transparent p-0 shadow-none',
                )}
            >
                {showHeader ? (
                    <div className={cn('text-sm font-semibold text-white', variant === 'sheet' && 'text-base')}>
                        Live Comments
                    </div>
                ) : null}
                {pinnedMessage ? (
                    <div className="rounded-2xl border border-amber-300/25 bg-amber-300/12 px-3 py-2 text-xs text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                        <div className="mb-0.5 font-black uppercase tracking-wide text-amber-100">
                            Pinned
                        </div>
                        <div className="line-clamp-2 font-semibold">
                            {pinnedMessage.user?.name ?? 'Viewer'}: {pinnedMessage.message}
                        </div>
                    </div>
                ) : null}
                <div className={cn('flex-1 min-h-0 overflow-y-auto pr-1 no-scrollbar', variant === 'floating' && 'max-h-[26vh] [mask-image:linear-gradient(180deg,transparent_0%,black_18%,black_100%)]')}>
                    {sortedMessages.length === 0 ? (
                        <p className="text-xs text-white/50">No messages yet.</p>
                    ) : (
                        sortedMessages.map((item) => {
                            const isOwn = currentUserId
                                ? normalizeUserId(item.user?.id) === normalizeUserId(currentUserId)
                                : false;
                            const displayName = isOwn ? 'You' : item.user?.name ?? 'Viewer';

                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        'mb-3 flex w-full gap-2',
                                        variant === 'floating' ? 'justify-start' : isOwn ? 'justify-end' : 'justify-start',
                                    )}
                                >
                                    {variant === 'floating' || !isOwn ? (
                                        <div
                                            className={cn(
                                                'shrink-0 overflow-hidden rounded-full bg-white/10 font-semibold text-white/70',
                                                variant === 'floating' ? 'h-6 w-6 text-[9px]' : 'h-8 w-8 text-[11px]',
                                            )}
                                        >
                                            {item.user?.avatar ? (
                                                <img
                                                    src={resolveAvatarUrl(item.user.avatar)}
                                                    alt={displayName}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    {initials(displayName)}
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                    <div
                                        className={cn(
                                            'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
                                            compact && 'max-w-[92%] px-2.5 py-1.5 text-xs shadow-[0_8px_24px_rgba(0,0,0,0.22)]',
                                            variant === 'floating'
                                                ? 'rounded-[18px] border border-white/10 bg-black/26 text-white backdrop-blur-md'
                                                : isOwn ? 'bg-white text-black' : 'bg-white/10 text-white',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'text-[10px] font-semibold uppercase tracking-wide',
                                                variant === 'floating' ? 'text-white/80' : isOwn ? 'text-black/60' : 'text-white/60',
                                            )}
                                        >
                                            {displayName}
                                            {item.user?.username && !isOwn
                                                ? ` · @${item.user.username}`
                                                : ''}
                                        </div>
                                        <div className={cn('mt-1 text-sm leading-relaxed', compact && 'text-[11px] leading-snug')}>
                                            {item.message}
                                        </div>
                                        {variant !== 'floating' ? (
                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wide">
                                                {canModerate ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePinMessage(item)}
                                                        className="text-sky-200 hover:text-white"
                                                    >
                                                        {item.is_pinned ? 'Unpin' : 'Pin'}
                                                    </button>
                                                ) : null}
                                                {canModerate || isOwn ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMessage(item)}
                                                        className="text-red-200 hover:text-white"
                                                    >
                                                        Remove
                                                    </button>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>
                {variant !== 'floating' ? (
                <div className="flex items-center gap-2">
                    <EmojiStickerPicker
                        onSelect={(value) => setMessage((current) => `${current}${value}`)}
                        className="shrink-0"
                    />
                    <Input
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder={currentUserId ? 'Add a live comment...' : 'Log in to comment'}
                        className={cn(
                            'bg-black/40 text-white placeholder:text-white/40',
                            compact && 'h-9 rounded-full border-white/10 bg-black/45 text-xs',
                        )}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                sendMessage();
                            }
                        }}
                        disabled={!currentUserId}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={sending || !currentUserId}
                        className={cn(compact && 'h-9 rounded-full px-3 text-xs')}
                    >
                        Comment
                    </Button>
                </div>
                ) : null}
            </div>
        </div>
    );
}
