import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { LiveChatSheet } from '@/components/live/live-chat-sheet';
import { LiveChat } from '@/components/live-chat';
import { useLiveStream } from '@/hooks/use-live-stream';
import { useLiveKitStream } from '@/hooks/use-livekit-stream';
import { ArrowLeft, Eye, Heart, MessageCircle, Radio, RefreshCw, Share2, SmilePlus, Volume2 } from 'lucide-react';

interface LiveStream {
    id: string;
    title: string;
    description?: string | null;
    status: 'draft' | 'live' | 'ended';
    visibility: 'everyone' | 'followers';
    viewer_count: number;
    peak_viewer_count?: number;
    reaction_count?: number;
    share_count?: number;
    health_status?: string | null;
    health_meta?: Record<string, unknown> | null;
    likes_count?: number;
    user_liked?: boolean;
    started_at?: string | null;
    ended_at?: string | null;
    replay_post_id?: string | null;
    viewer_joined?: boolean;
    user?: {
        id: string;
        name: string;
        username?: string;
        avatar?: string;
        is_following?: boolean;
    };
}

const resolveAvatarUrl = (url?: string | null): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return url.startsWith('/') ? url : `/${url}`;
};

const initials = (value?: string | null): string => {
    const trimmed = (value ?? '').trim();
    if (!trimmed) return 'H';
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

function HostActivityCard({ stream, compact = false }: { stream: LiveStream; compact?: boolean }) {
    const hostName = stream.user?.name ?? 'Host';
    const avatar = resolveAvatarUrl(stream.user?.avatar);

    return (
        <div className="pointer-events-auto inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-black/35 px-2 py-1.5 text-white shadow-[0_16px_38px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white bg-slate-800 text-xs font-black text-white">
                {avatar ? (
                    <img src={avatar} alt={hostName} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        {initials(hostName)}
                    </div>
                )}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black bg-[#f02849]" />
            </div>
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff8a00] px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-white">
                        Live
                    </span>
                    <p className="truncate text-xs font-black">{hostName}</p>
                </div>
                <p className="truncate text-[10px] font-medium text-white/70">
                    {compact ? 'is live now' : `${hostName} is live now · ${stream.title}`}
                </p>
            </div>
        </div>
    );
}

function LiveRailButton({
    label,
    count,
    active,
    onClick,
    disabled,
    children,
}: {
    label: string;
    count?: string | number;
    active?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="group flex flex-col items-center gap-1 text-white disabled:opacity-50"
        >
            <span
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/15 shadow-[0_16px_34px_rgba(0,0,0,0.35)] backdrop-blur-xl transition group-active:scale-95 ${
                    active
                        ? 'border-[#ff2d55]/70 bg-gradient-to-br from-[#ff2d55] to-[#ff8a00] text-white'
                        : 'bg-black/28 text-white'
                }`}
            >
                {children}
            </span>
            <span className="max-w-16 text-center text-[10px] font-black leading-tight drop-shadow">
                {count ?? label}
            </span>
        </button>
    );
}

function FloatingReactions({ reactions }: { reactions: Array<{ id: string; value: string }> }) {
    return (
        <div className="pointer-events-none absolute bottom-[30%] right-16 z-30 flex flex-col-reverse gap-2">
            {reactions.slice(-6).map((reaction) => (
                <span
                    key={reaction.id}
                    className="animate-[live-float_1.8s_ease-out_forwards] text-3xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
                >
                    {reaction.value}
                </span>
            ))}
        </div>
    );
}

function DelayedLivePlayer({ streamId, active }: { streamId: string; active: boolean }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [ready, setReady] = useState(false);
    const [message, setMessage] = useState('Preparing live video...');

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !active || !streamId || typeof MediaSource === 'undefined') {
            return;
        }

        let stopped = false;
        let mediaSource: MediaSource | null = new MediaSource();
        let sourceBuffer: SourceBuffer | null = null;
        let polling = false;
        let lastIndex = -1;
        const queue: ArrayBuffer[] = [];
        const objectUrl = URL.createObjectURL(mediaSource);
        video.src = objectUrl;
        video.muted = true;

        const appendNext = () => {
            if (!sourceBuffer || sourceBuffer.updating || queue.length === 0) return;
            const next = queue.shift();
            if (!next) return;
            try {
                sourceBuffer.appendBuffer(next);
            } catch {
                queue.unshift(next);
            }
        };

        const createSourceBuffer = (serverMimeType?: string | null) => {
            if (sourceBuffer || !mediaSource || mediaSource.readyState !== 'open') {
                return Boolean(sourceBuffer);
            }

            const candidates = [
                serverMimeType,
                'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
                'video/mp4',
                'video/webm;codecs=vp8,opus',
                'video/webm',
            ]
                .filter((type): type is string => Boolean(type))
                .filter((type) => MediaSource.isTypeSupported(type));

            const mimeType = candidates[0];
            if (!mimeType) {
                setMessage('Live playback is not supported on this browser.');
                return false;
            }

            try {
                sourceBuffer = mediaSource.addSourceBuffer(mimeType);
                sourceBuffer.mode = 'sequence';
                sourceBuffer.addEventListener('updateend', appendNext);
                return true;
            } catch {
                setMessage('Live playback is not supported on this browser.');
                return false;
            }
        };

        const pollChunks = async () => {
            if (polling || stopped) return;
            polling = true;

            try {
                const { data } = await axiosInstance.get(`/api/live/streams/${streamId}/archive/chunks`, {
                    params: { after: lastIndex },
                });
                const chunks = Array.isArray(data?.data) ? data.data : [];
                const hasSourceBuffer = createSourceBuffer(String(data?.mime_type ?? 'video/webm'));

                if (!hasSourceBuffer) {
                    return;
                }

                if (chunks.length === 0) {
                    setMessage('Waiting for live video...');
                    return;
                }

                for (const chunk of chunks) {
                    if (stopped) break;
                    const index = Number(chunk?.index ?? -1);
                    const url = String(chunk?.url ?? '');
                    if (index <= lastIndex || !url) continue;
                    const response = await axiosInstance.get(url, { responseType: 'arraybuffer' });
                    queue.push(response.data);
                    lastIndex = index;
                }

                appendNext();
                setReady(true);
                setMessage('Playing live with a short delay');
                video.play().catch(() => {});
            } catch {
                setMessage('Reconnecting live video...');
            } finally {
                polling = false;
            }
        };

        const onSourceOpen = () => {
            if (!mediaSource || stopped) return;
            pollChunks().catch(() => {});
        };

        mediaSource.addEventListener('sourceopen', onSourceOpen);
        const interval = window.setInterval(() => {
            pollChunks().catch(() => {});
        }, 1200);

        return () => {
            stopped = true;
            window.clearInterval(interval);
            try {
                sourceBuffer?.removeEventListener('updateend', appendNext);
            } catch {
                // ignore
            }
            try {
                if (mediaSource?.readyState === 'open') {
                    mediaSource.endOfStream();
                }
            } catch {
                // ignore
            }
            mediaSource?.removeEventListener('sourceopen', onSourceOpen);
            mediaSource = null;
            video.removeAttribute('src');
            video.load();
            URL.revokeObjectURL(objectUrl);
        };
    }, [active, streamId]);

    return (
        <div className="absolute inset-0">
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                controls={ready}
                className={`h-full w-full bg-black object-contain transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
            />
            {!ready ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35 text-center">
                    <div className="rounded-3xl border border-white/15 bg-black/45 px-5 py-4 text-sm font-black text-white shadow-2xl backdrop-blur-xl">
                        {message}
                    </div>
                </div>
            ) : (
                <div className="absolute left-4 top-20 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white/80 backdrop-blur">
                    {message}
                </div>
            )}
        </div>
    );
}

export default function LiveShow() {
    const { streamId } = useParams<{ streamId: string }>();
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [stream, setStream] = useState<LiveStream | null>(null);
    const [loading, setLoading] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [liking, setLiking] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [following, setFollowing] = useState(false);
    const [audioUnlocked, setAudioUnlocked] = useState(false);
    const [playbackNeedsTap, setPlaybackNeedsTap] = useState(false);
    const [delayedFallback, setDelayedFallback] = useState(false);
    const [forceP2PFallback, setForceP2PFallback] = useState(false);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    const livekit = useLiveKitStream({
        streamId: streamId || '',
        role: 'viewer',
        enabled: stream?.status === 'live',
    });
    const p2pEnabled = stream?.status === 'live' && (livekit.status === 'disabled' || livekit.status === 'failed' || forceP2PFallback);
    const { viewers, remoteStream, connectionState, reactions, sendSignal, requestReconnect } = useLiveStream({
        streamId: streamId || '',
        role: 'viewer',
        currentUserId: auth?.user?.id || '',
        hostUserId: stream?.user?.id || '',
        enabled: p2pEnabled,
    });
    const effectiveRemoteStream = livekit.remoteStream ?? remoteStream;
    const effectiveConnectionState = livekit.connected
        ? 'connected'
        : livekit.status === 'connecting'
          ? 'connecting'
          : connectionState;
    const audienceCount = Math.max(
        Number(stream?.viewer_count ?? 0),
        viewers.filter((viewer) => viewer.id !== stream?.user?.id).length,
    );
    const isHost = Boolean(auth?.user?.id && stream?.user?.id && String(auth.user.id) === String(stream.user.id));
    const canInteract = Boolean(auth?.user?.id);
    const hasConnectedWebrtc = Boolean(effectiveRemoteStream) && effectiveConnectionState === 'connected';

    useEffect(() => {
        if (stream?.status !== 'live' || livekit.remoteStream || livekit.status === 'disabled' || livekit.status === 'failed') {
            setForceP2PFallback(false);
            return;
        }

        if (livekit.status !== 'connecting' && livekit.status !== 'connected') {
            return;
        }

        const timeout = window.setTimeout(() => {
            setForceP2PFallback(true);
        }, livekit.status === 'connected' ? 900 : 1100);

        return () => window.clearTimeout(timeout);
    }, [livekit.remoteStream, livekit.status, stream?.status]);

    const fetchStream = useCallback(async () => {
        if (!streamId) return;
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/api/live/streams/${streamId}`);
            setStream(data?.data ?? data);
        } finally {
            setLoading(false);
        }
    }, [streamId]);

    useEffect(() => {
        fetchStream().catch(() => {});
    }, [fetchStream]);

    useEffect(() => {
        if (!window.Echo || !streamId) return;
        const channel = window.Echo.channel('live.global');
        channel.listen('.live.stream.ended', (payload: any) => {
            if (payload?.stream?.id === streamId) {
                fetchStream().catch(() => {});
            }
        });
        return () => {
            try {
                window.Echo.leaveChannel('live.global');
            } catch {
                // ignore
            }
        };
    }, [fetchStream, streamId]);

    useEffect(() => {
        if (stream?.status !== 'live' || hasConnectedWebrtc) {
            setDelayedFallback(false);
            return;
        }

        const timeout = window.setTimeout(() => {
            setDelayedFallback(true);
        }, 450);

        return () => window.clearTimeout(timeout);
    }, [hasConnectedWebrtc, stream?.status]);

    const bindRemoteVideo = useCallback(
        (node: HTMLVideoElement | null) => {
            remoteVideoRef.current = node;
            if (!node) return;
            if (node.srcObject !== effectiveRemoteStream) {
                node.srcObject = effectiveRemoteStream;
            }
            if (effectiveRemoteStream) {
                node.muted = !audioUnlocked;
                node.play().catch(() => {
                    node.muted = true;
                    setPlaybackNeedsTap(true);
                    node.play().catch(() => {});
                });
            }
        },
        [audioUnlocked, effectiveRemoteStream],
    );

    const enableLiveSound = useCallback(() => {
        const node = remoteVideoRef.current;
        setAudioUnlocked(true);
        setPlaybackNeedsTap(false);
        if (!node) return;
        node.muted = false;
        node.play().catch(() => {
            node.muted = true;
            setAudioUnlocked(false);
            setPlaybackNeedsTap(true);
        });
    }, []);

    const handleShare = useCallback(async () => {
        if (!stream || sharing) return;
        setSharing(true);
        try {
            const shareUrl = `${window.location.origin}/live/${stream.id}`;
            await axiosInstance.post(`/api/live/streams/${stream.id}/share`);
            setStream((current) =>
                current
                    ? { ...current, share_count: (current.share_count ?? 0) + 1 }
                    : current,
            );

            if (navigator.share) {
                await navigator.share({
                    title: stream.title,
                    text: stream.description || `${stream.user?.name ?? 'A creator'} is live on Karaads`,
                    url: shareUrl,
                });
            } else {
                await navigator.clipboard?.writeText(shareUrl);
            }
        } catch {
            // Browser sharing can be cancelled by the user; keep the live page calm.
        } finally {
            setSharing(false);
        }
    }, [sharing, stream]);

    const handleFollowCreator = useCallback(async () => {
        if (!stream?.user?.id || isHost || following) return;
        setFollowing(true);
        try {
            const isFollowing = Boolean(stream.user.is_following);
            await axiosInstance.post(`/api/users/${stream.user.id}/${isFollowing ? 'unfollow' : 'follow'}`);
            setStream((current) =>
                current?.user
                    ? {
                        ...current,
                        user: {
                            ...current.user,
                            is_following: !isFollowing,
                        },
                    }
                    : current,
            );
        } catch {
            // ignore
        } finally {
            setFollowing(false);
        }
    }, [following, isHost, stream]);

    useEffect(() => {
        const node = remoteVideoRef.current;
        if (!node || !effectiveRemoteStream) return;

        if (node.srcObject !== effectiveRemoteStream) {
            node.srcObject = effectiveRemoteStream;
        }
        node.muted = !audioUnlocked;
        node.play().catch(() => {
            node.muted = true;
            setPlaybackNeedsTap(true);
            node.play().catch(() => {});
        });
    }, [audioUnlocked, effectiveRemoteStream]);

    useEffect(() => {
        if (!effectiveRemoteStream || stream?.status !== 'live') return;

        let lastTime = -1;
        let stalledTicks = 0;

        const interval = window.setInterval(() => {
            if (document.visibilityState === 'hidden') return;

            const node = remoteVideoRef.current;
            if (!node) return;

            const hasLiveVideoTrack = effectiveRemoteStream
                .getVideoTracks()
                .some((track) => track.readyState === 'live' && !track.muted);

            if (!hasLiveVideoTrack) {
                stalledTicks += 1;
            } else if (node.paused) {
                node.play().catch(() => {});
                stalledTicks += 1;
            } else if (node.readyState < 2) {
                stalledTicks += 1;
            } else if (lastTime >= 0 && Math.abs(node.currentTime - lastTime) < 0.05) {
                stalledTicks += 1;
            } else {
                stalledTicks = 0;
            }

            lastTime = node.currentTime;

            if (stalledTicks >= 3) {
                stalledTicks = 0;
                setPlaybackNeedsTap(false);
                livekit.restart();
                requestReconnect();
            }
        }, 1500);

        return () => window.clearInterval(interval);
    }, [effectiveRemoteStream, livekit.restart, requestReconnect, stream?.status]);

    const handleLike = useCallback(async () => {
        if (!stream?.id || liking || !canInteract) return;
        setLiking(true);
        const previous = stream;
        setStream((current) => current
            ? {
                ...current,
                user_liked: !current.user_liked,
                likes_count: Math.max(0, (current.likes_count ?? 0) + (current.user_liked ? -1 : 1)),
            }
            : current,
        );

        try {
            const { data } = await axiosInstance.post(`/api/live/streams/${stream.id}/like`);
            setStream((current) => current
                ? {
                    ...current,
                    user_liked: Boolean(data?.liked),
                    likes_count: Number(data?.likes_count ?? current.likes_count ?? 0),
                }
                : current,
            );
        } catch {
            setStream(previous);
        } finally {
            setLiking(false);
        }
    }, [canInteract, liking, stream]);

    const sendReaction = useCallback((value: string) => {
        if (!auth?.user?.id) return;
        sendSignal({ type: 'reaction', from: auth.user.id, reaction: value });
    }, [auth?.user?.id, sendSignal]);

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-5xl px-4 pt-6 text-white">
                Loading stream...
            </div>
        );
    }

    if (!stream) {
        return (
            <div className="mx-auto w-full max-w-5xl px-4 pt-6 text-white">
                Stream not found.
            </div>
        );
    }

    if (stream.status !== 'live') {
        return (
            <div className="mx-auto w-full max-w-5xl px-4 pt-6 text-white">
                <div className="live-surface p-4">
                    <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-white/75">
                        Was live
                    </div>
                    <h1 className="mt-3 text-2xl font-semibold">
                        {stream.user?.name ?? 'Host'} was live
                    </h1>
                    <p className="mt-1 text-sm text-white/60">{stream.title}</p>
                    {stream.replay_post_id ? (
                        <Button
                            className="mt-3"
                            onClick={() => navigate(`/app/moments?post=${encodeURIComponent(stream.replay_post_id)}`)}
                        >
                            Watch Replay
                        </Button>
                    ) : null}
                </div>
            </div>
        );
    }

    const videoStage = (
        <div className="relative h-full min-h-[100svh] overflow-hidden bg-[#05070d] lg:min-h-0 lg:rounded-[28px]">
            <div className="absolute inset-0">
                <video
                    ref={bindRemoteVideo}
                    autoPlay
                    muted={!audioUnlocked}
                    playsInline
                    onClick={enableLiveSound}
                    className={`h-full w-full bg-black object-contain transition duration-500 ${delayedFallback && !hasConnectedWebrtc ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'}`}
                    preload="auto"
                />
                {streamId ? <DelayedLivePlayer streamId={streamId} active={delayedFallback && !hasConnectedWebrtc} /> : null}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.12),transparent_32%),linear-gradient(180deg,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.04)_32%,rgba(0,0,0,0.42)_58%,rgba(0,0,0,0.9)_100%)]" />
            </div>

            <div className="absolute left-3 right-3 top-[calc(8px+env(safe-area-inset-top))] z-40 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => navigate('/live')}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/28 text-white shadow-lg backdrop-blur-xl"
                    aria-label="Back"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <HostActivityCard stream={stream} compact />
                {!isHost && stream.user ? (
                    <button
                        type="button"
                        onClick={handleFollowCreator}
                        disabled={following}
                        className="hidden shrink-0 rounded-full bg-white px-3 py-2 text-[11px] font-black text-[#111827] shadow-lg backdrop-blur-xl disabled:opacity-60 sm:inline-flex"
                    >
                        {stream.user.is_following ? 'Following' : 'Follow'}
                    </button>
                ) : null}
                <div className="ml-auto flex items-center gap-1.5 rounded-full border border-white/15 bg-black/28 px-3 py-2 text-[11px] font-black text-white shadow-lg backdrop-blur-xl">
                    <Eye className="h-3.5 w-3.5" />
                    {audienceCount}
                </div>
            </div>

            {!hasConnectedWebrtc && !delayedFallback ? (
                <div className="absolute inset-0 z-30 flex items-center justify-center px-6">
                    <div className="rounded-3xl border border-white/15 bg-black/55 px-5 py-4 text-center text-sm font-semibold text-white/85 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                        <Radio className="mx-auto mb-2 h-5 w-5 animate-pulse text-[#ff2d55]" />
                        <p>Loading {stream.user?.name ?? 'host'} live...</p>
                    {['failed', 'disconnected', 'closed'].includes(String(effectiveConnectionState)) ? (
                            <p className="mt-1 text-xs font-medium text-white/60">The connection dropped. Try again.</p>
                        ) : (
                            <p className="mt-1 text-xs font-medium text-white/60">Opening the live video now.</p>
                        )}
                        <button
                            type="button"
                            onClick={requestReconnect}
                            className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#111827] shadow-[0_12px_30px_rgba(255,255,255,0.18)]"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Retry connection
                        </button>
                    </div>
                </div>
            ) : null}

            {effectiveRemoteStream && (!audioUnlocked || playbackNeedsTap) ? (
                <button
                    type="button"
                    onClick={enableLiveSound}
                    className="absolute left-1/2 top-[calc(70px+env(safe-area-inset-top))] z-40 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs font-black text-white shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                >
                    <Volume2 className="h-4 w-4" />
                    Tap for sound
                </button>
            ) : null}

            <FloatingReactions reactions={reactions} />

            <div className="absolute bottom-[calc(112px+env(safe-area-inset-bottom))] right-3 z-40 flex flex-col items-center gap-3">
                <LiveRailButton
                    label="Likes"
                    count={(stream.likes_count ?? 0).toLocaleString()}
                    onClick={handleLike}
                    disabled={liking || !canInteract}
                    active={Boolean(stream.user_liked)}
                >
                    <Heart className={`h-6 w-6 ${stream.user_liked ? 'fill-current' : ''}`} />
                </LiveRailButton>
                <LiveRailButton label="Chat" onClick={() => setChatOpen(true)} disabled={!canInteract}>
                    <MessageCircle className="h-6 w-6" />
                </LiveRailButton>
                <LiveRailButton
                    label="Share"
                    count={(stream.share_count ?? 0).toLocaleString()}
                    onClick={handleShare}
                    disabled={sharing}
                >
                    <Share2 className="h-6 w-6" />
                </LiveRailButton>
                <LiveRailButton label="Emoji" onClick={() => sendReaction('🔥')} disabled={!canInteract}>
                    <SmilePlus className="h-6 w-6" />
                </LiveRailButton>
            </div>

            <div className="absolute bottom-[calc(108px+env(safe-area-inset-bottom))] left-3 right-20 z-30 max-h-[26vh]">
                <LiveChat
                    streamId={stream.id}
                    currentUserId={auth?.user?.id}
                    variant="floating"
                    showHeader={false}
                    compact
                    className="h-full max-h-[26vh]"
                />
            </div>

            <div className="absolute bottom-[calc(14px+env(safe-area-inset-bottom))] left-3 right-20 z-40">
                <div className="mb-2 flex gap-2">
                    {['❤️', '😂', '🔥', '👏'].map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => sendReaction(emoji)}
                            disabled={!canInteract}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/32 text-base shadow-lg backdrop-blur-xl active:scale-95"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
                <p className="line-clamp-1 text-base font-black text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.8)]">
                    {stream.title}
                </p>
                {stream.description ? (
                    <p className="mt-0.5 line-clamp-1 text-xs font-medium text-white/72">{stream.description}</p>
                ) : null}
                <button
                    type="button"
                    onClick={() => setChatOpen(true)}
                    disabled={!canInteract}
                    className="mt-2 flex h-10 w-full max-w-[360px] items-center rounded-full border border-white/15 bg-white/12 px-4 text-left text-sm font-semibold text-white/78 shadow-lg backdrop-blur-xl"
                >
                    {canInteract ? 'Add a live comment...' : 'Log in to comment...'}
                </button>
            </div>

            <LiveChatSheet
                open={chatOpen}
                onOpenChange={setChatOpen}
                streamId={stream.id}
                currentUserId={auth?.user?.id}
            />
        </div>
    );

    return (
        <div className="fixed inset-0 z-40 bg-black text-white">
            <div className="mx-auto h-[100svh] w-full max-w-[520px] overflow-hidden bg-[#05070d] shadow-[0_0_80px_rgba(0,0,0,0.75)] lg:grid lg:max-w-none lg:grid-cols-[minmax(360px,520px)_minmax(360px,1fr)] lg:justify-center lg:gap-5 lg:bg-[#030712] lg:p-5">
                {videoStage}
                <aside className="hidden min-h-0 flex-col gap-4 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] lg:flex">
                    <HostActivityCard stream={stream} compact />
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                        <div className="text-sm font-black">{stream.title}</div>
                        {stream.description ? <p className="mt-1 text-xs text-white/60">{stream.description}</p> : null}
                        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-white/65">
                            <span>{audienceCount} watching</span>
                            <span>·</span>
                            <span>{(stream.likes_count ?? 0).toLocaleString()} likes</span>
                            <span>·</span>
                            <span>{(stream.share_count ?? 0).toLocaleString()} shares</span>
                        </div>
                        {!isHost && stream.user ? (
                            <button
                                type="button"
                                onClick={handleFollowCreator}
                                disabled={following}
                                className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-xs font-black text-[#111827] disabled:opacity-60"
                            >
                                {stream.user.is_following ? 'Following creator' : 'Follow creator'}
                            </button>
                        ) : null}
                    </div>
                    <LiveChat
                        streamId={stream.id}
                        currentUserId={auth?.user?.id}
                        variant="panel"
                        className="min-h-0 flex-1"
                    />
                </aside>
        </div>
        </div>
    );
}
