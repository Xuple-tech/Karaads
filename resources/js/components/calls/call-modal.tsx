import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCall } from '@/contexts/call-context';
import type { CallPeerUser } from '@/contexts/call-context';
import { useAuth } from '@/hooks/use-auth';
import { useFetch } from '@/hooks/use-fetch';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link2, Mic, MicOff, MoreHorizontal, Phone, PhoneOff, Plus, Video, VideoOff, UserX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

function initials(value: string) {
    const trimmed = (value || '').trim();
    if (!trimmed) return 'U';
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function resolveAvatarUrl(value?: string | null): string | undefined {
    if (!value) return undefined;
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
        return value;
    }
    return value.startsWith('/') ? value : `/${value}`;
}

function buildAvatarFallback(name?: string, username?: string): string {
    const label = encodeURIComponent(name?.trim() || username?.trim() || 'User');
    return `https://ui-avatars.com/api/?name=${label}&background=1f2937&color=ffffff`;
}

function formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const total = Math.floor(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remainingSeconds = total % 60;
    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function getStatusPresentation(status: string, isAudioOnly: boolean) {
    switch (status) {
        case 'incoming':
            return { label: `Incoming ${isAudioOnly ? 'audio' : 'video'} call`, badge: 'Incoming' };
        case 'awaiting_approval':
            return { label: 'Waiting for host approval', badge: 'Pending' };
        case 'calling':
            return { label: 'Calling participant', badge: 'Calling' };
        case 'restoring':
            return { label: 'Restoring active call', badge: 'Restoring' };
        case 'connecting':
            return { label: 'Connecting secure media', badge: 'Connecting' };
        case 'reconnecting':
            return { label: 'Network changed, reconnecting', badge: 'Reconnecting' };
        case 'in_call':
            return { label: 'Connected', badge: 'In call' };
        default:
            return { label: 'Call', badge: 'Call' };
    }
}

export function CallModal() {
    const { auth } = useAuth();
    const currentUser = auth?.user ?? null;
    const isMobile = useIsMobile();

    const {
        state,
        acceptCall,
        declineCall,
        hangup,
        toggleCamera,
        toggleMic,
        inviteToCall,
        kickFromCall,
        copyJoinLink,
        approveJoinRequest,
        rejectJoinRequest,
    } = useCall();
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [showMobileTools, setShowMobileTools] = useState(false);
    const [inviteSearch, setInviteSearch] = useState('');

    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
    const remoteAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
    const audioAutoplayToastShownRef = useRef(false);
    const [connectedAtMs, setConnectedAtMs] = useState<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const bindVideoStream = useCallback((node: HTMLVideoElement | null, stream: MediaStream | null) => {
        if (!node) return;

        if (!stream) {
            if (node.srcObject) {
                node.srcObject = null;
            }
            return;
        }

        if (node.srcObject !== stream) {
            node.srcObject = stream;
        }

        const playPromise = node.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                // autoplay can be blocked transiently; video will still render once allowed
            });
        }
    }, []);

    const bindAudioStream = useCallback((node: HTMLAudioElement | null, stream: MediaStream | null) => {
        if (!node) return;

        if (!stream) {
            if (node.srcObject) {
                node.srcObject = null;
            }
            return;
        }

        if (node.srcObject !== stream) {
            node.srcObject = stream;
        }

        const playPromise = node.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                if (!audioAutoplayToastShownRef.current) {
                    audioAutoplayToastShownRef.current = true;
                    toast('Tap anywhere to enable call audio.');
                }
            });
        }
    }, []);

    const resumeMediaPlayback = useCallback(() => {
        const mediaNodes: HTMLMediaElement[] = [];
        if (localVideoRef.current) {
            mediaNodes.push(localVideoRef.current);
        }
        for (const node of Object.values(remoteVideoRefs.current)) {
            if (node) {
                mediaNodes.push(node);
            }
        }
        for (const node of Object.values(remoteAudioRefs.current)) {
            if (node) {
                mediaNodes.push(node);
            }
        }

        for (const node of mediaNodes) {
            if (!node.srcObject) continue;
            const playPromise = node.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    // iOS can temporarily block background-resumed media until next user gesture
                });
            }
        }
    }, []);

    useEffect(() => {
        bindVideoStream(localVideoRef.current, state.localStream);
    }, [bindVideoStream, state.localStream, state.status]);

    useEffect(() => {
        if (state.status !== 'idle') return;
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        Object.values(remoteVideoRefs.current).forEach((node) => {
            if (node) {
                node.srcObject = null;
            }
        });
        Object.values(remoteAudioRefs.current).forEach((node) => {
            if (node) {
                node.srcObject = null;
            }
        });
        audioAutoplayToastShownRef.current = false;
        setShowInviteDialog(false);
        setShowMobileTools(false);
    }, [state.status]);

    useEffect(() => {
        const streams =
            state.remoteStreams && typeof state.remoteStreams === 'object'
                ? state.remoteStreams
                : {};
        const activeIds = new Set(Object.keys(streams));
        Object.entries(remoteVideoRefs.current).forEach(([id, node]) => {
            if (!activeIds.has(id) && node) {
                node.srcObject = null;
            }
        });
        Object.entries(remoteAudioRefs.current).forEach(([id, node]) => {
            if (!activeIds.has(id) && node) {
                node.srcObject = null;
            }
        });
        Object.entries(streams).forEach(([id, stream]) => {
            bindVideoStream(remoteVideoRefs.current[id], stream);
            bindAudioStream(remoteAudioRefs.current[id], stream);
        });
    }, [bindAudioStream, bindVideoStream, state.remoteStreams]);

    useEffect(() => {
        if (state.status === 'idle') return;
        const retryPlayback = () => {
            resumeMediaPlayback();
        };

        window.addEventListener('pointerdown', retryPlayback, { passive: true });
        window.addEventListener('keydown', retryPlayback);
        return () => {
            window.removeEventListener('pointerdown', retryPlayback);
            window.removeEventListener('keydown', retryPlayback);
        };
    }, [resumeMediaPlayback, state.status]);

    useEffect(() => {
        if (state.status === 'idle') return;

        const timeoutIds: number[] = [];
        const replayWithRetry = () => {
            resumeMediaPlayback();
            timeoutIds.push(window.setTimeout(() => resumeMediaPlayback(), 200));
            timeoutIds.push(window.setTimeout(() => resumeMediaPlayback(), 900));
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                replayWithRetry();
            }
        };

        const handleFocus = () => {
            replayWithRetry();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('pageshow', handleFocus);
        replayWithRetry();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('pageshow', handleFocus);
            timeoutIds.forEach((id) => window.clearTimeout(id));
        };
    }, [resumeMediaPlayback, state.status]);

    const remoteEntries = useMemo(() => {
        const streams =
            state.remoteStreams && typeof state.remoteStreams === 'object'
                ? state.remoteStreams
                : {};
        return Object.entries(streams);
    }, [state.remoteStreams]);
    const participantById = useMemo(() => {
        const map = new Map<string, CallPeerUser>();
        for (const participant of state.participants) {
            map.set(participant.id, participant);
        }
        return map;
    }, [state.participants]);
    const connectedParticipantIdSet = useMemo(() => new Set(state.connectedParticipantIds), [state.connectedParticipantIds]);
    const callParticipantIdSet = useMemo(() => new Set(state.callParticipantIds), [state.callParticipantIds]);
    const remoteStreamIdSet = useMemo(
        () => new Set(remoteEntries.map(([participantId]) => participantId)),
        [remoteEntries],
    );
    const audioParticipants = useMemo(() => {
        const map = new Map<string, CallPeerUser>();
        for (const participant of state.participants) {
            map.set(participant.id, participant);
        }
        if (state.peer?.id && !map.has(state.peer.id)) {
            map.set(state.peer.id, state.peer);
        }
        if (currentUser?.id && !map.has(currentUser.id)) {
            map.set(currentUser.id, {
                id: currentUser.id,
                name: currentUser.name || currentUser.username || 'You',
                username: currentUser.username,
                avatar: currentUser.avatar || undefined,
            });
        }
        for (const participantId of state.callParticipantIds) {
            if (!map.has(participantId)) {
                map.set(participantId, { id: participantId, name: 'Participant' });
            }
        }
        for (const participantId of Object.keys(state.remoteStreams || {})) {
            if (!map.has(participantId)) {
                map.set(participantId, { id: participantId, name: 'Participant' });
            }
        }
        return Array.from(map.values());
    }, [currentUser?.avatar, currentUser?.id, currentUser?.name, currentUser?.username, state.callParticipantIds, state.participants, state.peer, state.remoteStreams]);

    useEffect(() => {
        if (state.status === 'in_call') {
            setConnectedAtMs((previous) => previous ?? Date.now());
            return;
        }

        if (!['connecting', 'reconnecting'].includes(state.status)) {
            setConnectedAtMs(null);
            setElapsedSeconds(0);
        }
    }, [state.status]);

    useEffect(() => {
        if (!connectedAtMs) return;
        const update = () => {
            setElapsedSeconds(Math.max(0, Math.floor((Date.now() - connectedAtMs) / 1000)));
        };

        update();
        const timer = window.setInterval(update, 1_000);
        return () => {
            window.clearInterval(timer);
        };
    }, [connectedAtMs]);

    const peerName = useMemo(() => state.peer?.name || state.peer?.username || 'Unknown', [state.peer?.name, state.peer?.username]);
    const followingUrl = showInviteDialog
        ? `/api/users/following${inviteSearch.trim() ? `?search=${encodeURIComponent(inviteSearch.trim())}` : ''}`
        : '';
    const { data: followingUsers = [], loading: loadingFollowing } = useFetch<CallPeerUser[]>(
        followingUrl,
        { skip: !showInviteDialog, cacheMs: 10_000 },
    );
    const invitableUsers = useMemo(
        () => (followingUsers || []).filter((u) => !state.participants.some((p) => p.id === u.id)),
        [followingUsers, state.participants],
    );

    if (state.status === 'idle') return null;

    const showIncoming = state.status === 'incoming';
    const showCalling = state.status === 'calling';
    const showRestoring = state.status === 'restoring';
    const showAwaitingApproval = state.status === 'awaiting_approval';
    const showInCall = state.status === 'connecting' || state.status === 'reconnecting' || state.status === 'in_call' || showRestoring;
    const isAudioOnly = state.mode === 'audio';
    const participantCount = state.callParticipantIds.length || state.participants.length || 1;
    const maxParticipants = Math.max(2, state.maxParticipants || 8);
    const atCapacity = participantCount >= maxParticipants;
    const callDurationLabel = showInCall && connectedAtMs ? formatDuration(elapsedSeconds) : null;

    const isHost = state.role === 'caller';
    const statusPresentation = getStatusPresentation(state.status, isAudioOnly);
    const remoteCount = remoteEntries.length;
    const remoteGridClassName = remoteCount <= 1
        ? 'grid-cols-1'
        : remoteCount <= 4
            ? 'grid-cols-2'
            : 'grid-cols-2 xl:grid-cols-3';
    const stageTitle = showIncoming
        ? 'Answer this call'
        : showCalling
            ? 'Dialing'
            : showRestoring
                ? 'Restoring session'
                : showAwaitingApproval
                    ? 'Join request sent'
                    : isAudioOnly
                        ? 'Audio call'
                        : 'Video call';

    const participantsList = (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {audioParticipants.length > 0 ? audioParticipants.map((participant) => {
                const participantName = participant.name || participant.username || 'Participant';
                const isCurrentUser = participant.id === currentUser?.id;
                const isJoined = connectedParticipantIdSet.has(participant.id)
                    || remoteStreamIdSet.has(participant.id)
                    || participant.state === 'joined'
                    || (isCurrentUser && showInCall);

                return (
                    <div key={participant.id} className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border border-white/20">
                                <AvatarImage src={resolveAvatarUrl(participant.avatar)} alt={participantName} />
                                <AvatarFallback>{initials(participantName)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-white">{participantName}</p>
                                <p className="truncate text-[11px] text-white/60">@{participant.username || 'user'}</p>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isJoined ? 'bg-emerald-500/20 text-emerald-100' : 'bg-white/10 text-white/70'}`}>
                                {isJoined ? 'Joined' : 'Invited'}
                            </span>
                            {isHost && participant.id !== state.initiatorId ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-200 hover:bg-red-500/20"
                                    onClick={() => kickFromCall(participant.id)}
                                    title="Kick user"
                                >
                                    <UserX className="h-3.5 w-3.5" />
                                </Button>
                            ) : null}
                        </div>
                    </div>
                );
            }) : (
                <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-center text-xs text-white/65">
                    No participant data yet.
                </div>
            )}
        </div>
    );

    const pendingJoinRequestsPanel = state.pendingJoinRequests.length > 0 ? (
        <div className="rounded-xl border border-white/15 bg-black/25 p-2">
            <p className="mb-2 text-xs font-medium text-white/75">Join requests</p>
            <div className="space-y-2">
                {state.pendingJoinRequests.map((request) => (
                    <div key={request.id} className="rounded-lg border border-white/10 bg-white/5 p-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                                <AvatarImage
                                    src={resolveAvatarUrl(request.requested_by.avatar)}
                                    alt={request.requested_by.name}
                                />
                                <AvatarFallback>{initials(request.requested_by.name)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-white">{request.requested_by.name}</p>
                                <p className="truncate text-[11px] text-white/60">@{request.requested_by.username || 'user'}</p>
                            </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="call-success h-7 flex-1 rounded-full"
                                onClick={() => approveJoinRequest(request.id)}
                                disabled={atCapacity}
                            >
                                Approve
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="call-danger h-7 flex-1 rounded-full"
                                onClick={() => rejectJoinRequest(request.id)}
                            >
                                Reject
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ) : null;

    const invitePickerPanel = showInviteDialog ? (
        <div className="rounded-xl border border-white/15 bg-black/25 p-2">
            <Input
                value={inviteSearch}
                onChange={(e) => setInviteSearch(e.target.value)}
                placeholder="Search people you follow"
                className="mb-2 h-9 border-white/20 bg-white/10 text-white placeholder:text-white/60"
            />
            <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
                {loadingFollowing ? (
                    <p className="py-4 text-center text-xs text-white/60">Loading...</p>
                ) : invitableUsers.length === 0 ? (
                    <p className="py-4 text-center text-xs text-white/60">No available users</p>
                ) : (
                    invitableUsers.map((user) => (
                        <button
                            key={user.id}
                            type="button"
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-white/10"
                            onClick={() => {
                                inviteToCall(user.id);
                                setShowInviteDialog(false);
                            }}
                            disabled={atCapacity}
                        >
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={resolveAvatarUrl(user.avatar)} alt={user.name} />
                                <AvatarFallback>{initials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-white">{user.name}</p>
                                <p className="truncate text-[11px] text-white/60">@{user.username || 'user'}</p>
                            </div>
                            <Plus className="h-4 w-4 text-white/70" />
                        </button>
                    ))
                )}
            </div>
        </div>
    ) : null;

    const hostToolsPanel = isHost ? (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-2.5">
            <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-white">Host tools</span>
                {state.pendingJoinRequests.length > 0 ? (
                    <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] text-white/80">
                        {state.pendingJoinRequests.length} request{state.pendingJoinRequests.length === 1 ? '' : 's'}
                    </span>
                ) : null}
            </div>
            <div className="space-y-2">
                <div className="flex gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 flex-1 rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20"
                        onClick={() => setShowInviteDialog((prev) => !prev)}
                        disabled={atCapacity}
                        title={atCapacity ? 'Call is full' : 'Invite user'}
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Invite
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 flex-1 rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20"
                        onClick={copyJoinLink}
                    >
                        <Link2 className="mr-1 h-3.5 w-3.5" /> Copy link
                    </Button>
                </div>
                {pendingJoinRequestsPanel}
                {invitePickerPanel}
            </div>
        </div>
    ) : null;

    return (
        <div className="fixed inset-0 z-[600000] overflow-hidden text-white animate-in fade-in duration-200">
            <div className="absolute inset-0 call-warm-bg" />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="pointer-events-none absolute inset-0 opacity-70">
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/65 to-transparent" />
            </div>

            <div className="relative flex h-full flex-col p-3 sm:p-4 lg:p-6">
                <header className="call-glass karads-mobile mb-3 rounded-2xl border border-white/10 px-3 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] sm:px-4">
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                        <Avatar className="h-10 w-10 border border-white/25 ring-1 ring-white/10 sm:h-11 sm:w-11">
                            <AvatarImage
                                src={resolveAvatarUrl(state.peer?.avatar)}
                                alt={peerName}
                                onError={(e) => {
                                    e.currentTarget.src = buildAvatarFallback(state.peer?.name, state.peer?.username);
                                }}
                            />
                            <AvatarFallback>{initials(peerName)}</AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">{statusPresentation.badge}</p>
                            <p className="karads-heading truncate text-base font-semibold leading-tight text-white sm:text-lg">{peerName}</p>
                            <p className="truncate text-xs text-white/75">{statusPresentation.label}</p>
                        </div>

                        <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                            <span className="call-chip rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/85">{isAudioOnly ? 'Audio' : 'Video'}</span>
                            <span className="call-chip rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/85">{participantCount}/{maxParticipants}</span>
                            {callDurationLabel ? (
                                <span className="call-chip rounded-full border border-emerald-300/15 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-50">{callDurationLabel}</span>
                            ) : null}
                            {state.callId && !isMobile ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-full border-white/20 bg-white/8 text-white shadow-none hover:bg-white/18"
                                    onClick={copyJoinLink}
                                >
                                    <Link2 className="mr-1 h-3.5 w-3.5" /> Copy link
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </header>

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_20rem] lg:gap-4">
                    <section className="call-glass relative min-h-0 overflow-hidden rounded-3xl border border-white/10 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.28)] sm:p-4">
                        <div className="pointer-events-none absolute inset-0 opacity-20">
                            <div className="absolute left-0 top-0 h-44 w-44 rounded-full bg-amber-400/40 blur-3xl" />
                            <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-orange-500/35 blur-3xl" />
                        </div>

                        <div className="relative flex h-full min-h-[16rem] flex-col">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="karads-heading text-sm font-semibold tracking-wide text-white/95 sm:text-base">{stageTitle}</h2>
                                {showInCall ? (
                                    <span className="call-chip rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-50">
                                        {state.status === 'reconnecting' ? 'Reconnecting...' : 'Live'}
                                    </span>
                                ) : null}
                            </div>

                            {showInCall ? (
                                isAudioOnly ? (
                                    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
                                        <div className="grid flex-1 auto-rows-min gap-2 overflow-y-auto pr-1">
                                            {audioParticipants.map((participant) => {
                                                const participantName = participant.name || participant.username || 'Participant';
                                                const participantUsername = participant.username ? `@${participant.username}` : 'Participant';
                                                const isParticipantHost = participant.id === state.initiatorId || participant.role === 'initiator';
                                                const isCurrentUser = participant.id === currentUser?.id;
                                                const isConnected = connectedParticipantIdSet.has(participant.id)
                                                    || remoteStreamIdSet.has(participant.id)
                                                    || (isCurrentUser && showInCall);

                                                let statusLabel = 'Invited';
                                                let statusClassName = 'border-amber-400/40 bg-amber-500/15 text-amber-100';

                                                if (participant.state === 'declined') {
                                                    statusLabel = 'Declined';
                                                    statusClassName = 'border-red-400/40 bg-red-500/20 text-red-100';
                                                } else if (participant.state === 'left' || participant.state === 'kicked') {
                                                    statusLabel = 'Left';
                                                    statusClassName = 'border-white/25 bg-white/10 text-white/80';
                                                } else if (isConnected || participant.state === 'joined') {
                                                    statusLabel = 'Joined';
                                                    statusClassName = 'border-emerald-400/45 bg-emerald-500/20 text-emerald-100';
                                                } else if (!callParticipantIdSet.has(participant.id) && !participant.state) {
                                                    statusLabel = 'Pending';
                                                }

                                                return (
                                                    <article
                                                        key={participant.id}
                                                        className="call-glass animate-in fade-in slide-in-from-bottom-1 duration-300 rounded-2xl px-3 py-2"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 border border-white/25">
                                                                <AvatarImage
                                                                    src={resolveAvatarUrl(participant.avatar)}
                                                                    alt={participantName}
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = buildAvatarFallback(participant.name, participant.username);
                                                                    }}
                                                                />
                                                                <AvatarFallback>{initials(participantName)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-semibold text-white">{participantName}</p>
                                                                <p className="truncate text-xs text-white/65">{participantUsername}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusClassName}`}>
                                                                    {statusLabel}
                                                                </span>
                                                                {isParticipantHost ? (
                                                                    <span className="rounded-full border border-sky-400/35 bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-100">Host</span>
                                                                ) : null}
                                                                {isCurrentUser ? (
                                                                    <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/85">You</span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>

                                        <div className="hidden" aria-hidden>
                                            {remoteEntries.map(([participantId, stream]) => (
                                                <audio
                                                    key={`remote-audio-${participantId}`}
                                                    ref={(node) => {
                                                        remoteAudioRefs.current[participantId] = node;
                                                        bindAudioStream(node, stream);
                                                    }}
                                                    autoPlay
                                                    playsInline
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative flex min-h-0 flex-1">
                                        {remoteCount > 0 ? (
                                            <div className={`grid h-full w-full min-h-0 flex-1 gap-2 overflow-y-auto pr-1 ${remoteGridClassName}`}>
                                                {remoteEntries.map(([participantId]) => {
                                                    const participant = participantById.get(participantId);
                                                    const label = participant?.name || participant?.username || 'Participant';

                                                    return (
                                                        <article
                                                            key={participantId}
                                                        className="animate-in fade-in slide-in-from-bottom-1 duration-300 relative min-h-[10rem] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
                                                        >
                                                            <video
                                                                ref={(node) => {
                                                                    remoteVideoRefs.current[participantId] = node;
                                                                    bindVideoStream(node, state.remoteStreams?.[participantId] || null);
                                                                }}
                                                                autoPlay
                                                                playsInline
                                                                className="h-full w-full bg-black object-cover"
                                                            />
                                                            <span className="pointer-events-none absolute bottom-2 left-2 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[11px] text-white shadow-sm">{label}</span>
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center rounded-2xl border border-white/20 bg-black/40 text-sm text-white/70">
                                                Waiting for participant video...
                                            </div>
                                        )}

                                        <aside className={`absolute right-2 top-2 z-20 w-28 overflow-hidden rounded-xl border border-white/20 bg-black/70 shadow-[0_10px_24px_rgba(0,0,0,0.35)] sm:w-32 ${remoteCount > 0 ? '' : 'invisible'}`}>
                                            <video
                                                ref={(node) => {
                                                    localVideoRef.current = node;
                                                    bindVideoStream(node, state.localStream);
                                                }}
                                                autoPlay
                                                muted
                                                playsInline
                                                className="h-20 w-full bg-black object-cover sm:h-24"
                                            />
                                            <p className="px-2 py-1 text-[10px] text-white/90">You</p>
                                        </aside>

                                        {remoteCount === 0 ? (
                                            <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/25 bg-black/65">
                                                <video
                                                    ref={(node) => {
                                                        localVideoRef.current = node;
                                                        bindVideoStream(node, state.localStream);
                                                    }}
                                                    autoPlay
                                                    muted
                                                    playsInline
                                                    className="h-full w-full bg-black object-cover"
                                                />
                                                {!state.localStream ? (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                        <Avatar className="h-14 w-14 border border-white/30">
                                                            <AvatarImage src={resolveAvatarUrl(currentUser?.avatar)} alt="You" />
                                                            <AvatarFallback>{initials('You')}</AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                ) : null}
                                                <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/65 px-2.5 py-1 text-[11px] text-white">You</span>
                                            </div>
                                        ) : null}
                                    </div>
                                )
                            ) : (
                                <div className="flex flex-1 items-center justify-center">
                                    <article className="call-glass w-full max-w-xl rounded-3xl p-6 text-center">
                                        <Avatar className="mx-auto h-20 w-20 border border-white/25 sm:h-24 sm:w-24">
                                            <AvatarImage
                                                src={resolveAvatarUrl(state.peer?.avatar)}
                                                alt={peerName}
                                                onError={(e) => {
                                                    e.currentTarget.src = buildAvatarFallback(state.peer?.name, state.peer?.username);
                                                }}
                                            />
                                            <AvatarFallback>{initials(peerName)}</AvatarFallback>
                                        </Avatar>
                                        <h3 className="karads-heading mt-4 text-xl font-semibold text-white">{peerName}</h3>
                                        <p className="mt-1 text-sm text-white/70">
                                            {showIncoming
                                                ? `Incoming ${isAudioOnly ? 'audio' : 'video'} request`
                                                : showCalling
                                                    ? `Calling ${peerName}...`
                                                    : showRestoring
                                                        ? 'Restoring your active call session...'
                                                        : showAwaitingApproval
                                                            ? 'The host needs to approve your request before you join.'
                                                            : 'Preparing call...'}
                                        </p>
                                    </article>
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="call-glass hidden min-h-0 overflow-hidden rounded-3xl border border-white/10 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.28)] sm:p-4 md:block">
                        <div className="flex h-full min-h-[14rem] flex-col">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="karads-heading text-sm font-semibold text-white sm:text-base">Participants</h3>
                                <span className="call-chip rounded-full px-2 py-1 text-[11px] text-white/85">{participantCount}/{maxParticipants}</span>
                            </div>

                            {participantsList}
                            {hostToolsPanel ? <div className="mt-3">{hostToolsPanel}</div> : null}
                        </div>
                    </aside>
                </div>

                <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-3 sm:px-4 lg:px-6"
                    style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
                >
                    <div className="pointer-events-auto mx-auto max-w-xl">
                        <div className="call-glass rounded-2xl border border-white/10 bg-black/20 px-2.5 py-2.5 shadow-[0_14px_30px_rgba(0,0,0,0.3)] sm:px-3 sm:py-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                                {showIncoming ? (
                                    <>
                                        <Button className="call-success h-11 flex-1 rounded-full border" onClick={() => acceptCall()}>
                                            <Phone className="mr-2 h-4 w-4" /> Accept
                                        </Button>
                                        <Button variant="outline" className="call-danger h-11 flex-1 rounded-full" onClick={() => declineCall()}>
                                            <PhoneOff className="mr-2 h-4 w-4" /> Decline
                                        </Button>
                                    </>
                                ) : showAwaitingApproval ? (
                                    <Button variant="outline" className="call-danger h-11 w-full rounded-full" onClick={() => hangup()}>
                                        <PhoneOff className="mr-2 h-4 w-4" /> Cancel request
                                    </Button>
                                ) : showCalling || showRestoring ? (
                                    <Button variant="outline" className="call-danger h-11 w-full rounded-full" onClick={() => hangup()}>
                                        <PhoneOff className="mr-2 h-4 w-4" /> {showRestoring ? 'Stop restore' : 'Cancel'}
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="call-control h-11 w-11 rounded-full border-white/15 bg-white/10 shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:bg-white/20"
                                            onClick={toggleMic}
                                            title={state.isMicEnabled ? 'Mute' : 'Unmute'}
                                        >
                                            {state.isMicEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                                        </Button>
                                        {!isAudioOnly ? (
                                            <Button
                                                variant="outline"
                                                className="call-control h-11 w-11 rounded-full border-white/15 bg-white/10 shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:bg-white/20"
                                                onClick={toggleCamera}
                                                title={state.isCameraEnabled ? 'Camera off' : 'Camera on'}
                                            >
                                                {state.isCameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                                            </Button>
                                        ) : null}
                                        {isMobile && isHost ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="call-control h-11 w-11 rounded-full border-white/15 bg-white/10 shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:bg-white/20"
                                                onClick={() => setShowMobileTools(true)}
                                                title="Call tools"
                                            >
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        ) : null}
                                        <Button className="call-danger h-11 flex-1 rounded-full border border-red-200/20 shadow-[0_10px_20px_rgba(127,29,29,0.28)]" onClick={() => hangup()}>
                                            <PhoneOff className="mr-2 h-4 w-4" /> End call
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isMobile && isHost ? (
                    <Sheet open={showMobileTools} onOpenChange={setShowMobileTools}>
                        <SheetContent
                            side="bottom"
                            overlayClassName="z-[100001] bg-black/70"
                            className="z-[100001] max-h-[85vh] rounded-t-3xl border-white/15 bg-[#090c11] px-4 pt-3 pb-4 text-white shadow-[0_-20px_60px_rgba(0,0,0,0.5)]"
                            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
                        >
                            <SheetHeader className="px-0 pb-2 pt-0">
                                <SheetTitle className="text-left text-white">Call tools</SheetTitle>
                            </SheetHeader>
                            <div
                                className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1"
                            >
                                <div className="rounded-2xl border border-white/12 bg-white/5 p-3 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
                                    <div className="mb-2 flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-white">Participants</h3>
                                        <span className="call-chip rounded-full px-2 py-1 text-[11px] text-white/85">
                                            {participantCount}/{maxParticipants}
                                        </span>
                                    </div>
                                    <div className="max-h-64 overflow-hidden">
                                        {participantsList}
                                    </div>
                                </div>

                                {hostToolsPanel}
                            </div>
                        </SheetContent>
                    </Sheet>
                ) : null}
            </div>
        </div>
    );
    
}
