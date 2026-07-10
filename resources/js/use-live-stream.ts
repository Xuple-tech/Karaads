import { useCallback, useEffect, useRef, useState } from 'react';
import { createPeerConnection } from '@/lib/webrtc';
import { initializeEcho } from '@/utils/echo';
import axiosInstance from '@/lib/axios';

export type LiveRole = 'host' | 'viewer';

export interface LiveViewer {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    joined_at?: string | null;
    watch_minutes?: number;
}

interface SignalPayload {
    id?: number;
    type: 'viewer-join' | 'offer' | 'answer' | 'ice' | 'reaction';
    from: string | number;
    to?: string | number;
    sdp?: string;
    candidate?: RTCIceCandidateInit;
    reaction?: string;
    force?: boolean;
    sent_at?: string;
}

interface UseLiveStreamOptions {
    streamId: string;
    role: LiveRole;
    currentUserId: string | number;
    hostUserId?: string | number | null;
    localStream?: MediaStream | null;
    enabled?: boolean;
}

const normalizeUserId = (value?: string | number | null): string => String(value ?? '');
const PEER_NEGOTIATION_GRACE_MS = 8000;
const PEER_DISCONNECT_GRACE_MS = 6000;

const isTerminalPeerState = (state: RTCPeerConnectionState): boolean =>
    state === 'failed' || state === 'closed';

export function useLiveStream({
    streamId,
    role,
    currentUserId,
    hostUserId,
    localStream,
    enabled = true,
}: UseLiveStreamOptions) {
    const userId = normalizeUserId(currentUserId);
    const normalizedHostUserId = normalizeUserId(hostUserId);
    const channelRef = useRef<any>(null);
    const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
    const peerCreatedAtRef = useRef<Record<string, number>>({});
    const makingOfferRef = useRef<Record<string, boolean>>({});
    const ignoreOfferRef = useRef<Record<string, boolean>>({});
    const settingRemoteAnswerRef = useRef<Record<string, boolean>>({});
    const pendingIceRef = useRef<Record<string, RTCIceCandidateInit[]>>({});
    const pendingViewersRef = useRef<Set<string>>(new Set());
    const peerDisconnectTimersRef = useRef<Record<string, number>>({});
    const lastSignalIdRef = useRef(0);
    const processedSignalIdsRef = useRef<Set<number>>(new Set());
    const viewRegisteredForStreamRef = useRef<string | null>(null);
    const viewerFallbackAttemptsRef = useRef(0);
    const [viewers, setViewers] = useState<LiveViewer[]>([]);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | 'idle'>('idle');
    const [channelReady, setChannelReady] = useState(false);
    const [reactions, setReactions] = useState<Array<{ id: string; userId: string; value: string }>>([]);
    const announceJoinTimeoutRef = useRef<number | null>(null);
    const announceJoinIntervalRef = useRef<number | null>(null);

    const sendSignal = useCallback((payload: SignalPayload) => {
        if (payload.type === 'reaction' && payload.reaction) {
            setReactions((current) => [
                ...current.slice(-12),
                {
                    id: `${payload.from}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    userId: normalizeUserId(payload.from),
                    value: payload.reaction,
                },
            ]);
        }
        if (channelRef.current) {
            channelRef.current.whisper('signal', payload);
        }

        if (!streamId || !enabled) return;

        axiosInstance
            .post(`/api/live/streams/${streamId}/signal`, {
                type: payload.type,
                to: payload.to !== undefined ? String(payload.to) : undefined,
                sdp: payload.sdp,
                candidate: payload.candidate,
                reaction: payload.reaction,
                force: payload.force,
            })
            .catch(() => {
                // Whisper still gives us a low-latency path if the HTTP fallback fails.
            });
    }, [enabled, streamId]);

    const cleanupPeerConnection = useCallback((userId: string) => {
        const disconnectTimer = peerDisconnectTimersRef.current[userId];
        if (disconnectTimer !== undefined) {
            window.clearTimeout(disconnectTimer);
            delete peerDisconnectTimersRef.current[userId];
        }
        const pc = peerConnectionsRef.current[userId];
        if (pc) {
            try {
                pc.close();
            } catch {
                // ignore
            }
            delete peerConnectionsRef.current[userId];
        }
        delete peerCreatedAtRef.current[userId];
        delete makingOfferRef.current[userId];
        delete ignoreOfferRef.current[userId];
        delete settingRemoteAnswerRef.current[userId];
        delete pendingIceRef.current[userId];
    }, []);

    const clearDisconnectTimer = useCallback((peerId: string) => {
        const disconnectTimer = peerDisconnectTimersRef.current[peerId];
        if (disconnectTimer === undefined) return;
        window.clearTimeout(disconnectTimer);
        delete peerDisconnectTimersRef.current[peerId];
    }, []);

    const schedulePeerCleanup = useCallback(
        (peerId: string, options: { clearRemote?: boolean } = {}) => {
            if (peerDisconnectTimersRef.current[peerId] !== undefined) return;

            peerDisconnectTimersRef.current[peerId] = window.setTimeout(() => {
                const pc = peerConnectionsRef.current[peerId];
                delete peerDisconnectTimersRef.current[peerId];

                if (!pc || pc.connectionState === 'connected') {
                    return;
                }

                cleanupPeerConnection(peerId);
                if (options.clearRemote) {
                    setRemoteStream(null);
                }
            }, PEER_DISCONNECT_GRACE_MS);
        },
        [cleanupPeerConnection],
    );

    const replaceVideoTrack = useCallback(async (track: MediaStreamTrack) => {
        const tasks = Object.values(peerConnectionsRef.current).map(async (pc) => {
            const sender = pc.getSenders().find((item) => item.track?.kind === 'video');
            if (sender) {
                await sender.replaceTrack(track);
                return;
            }

            const stream = localStream ?? new MediaStream([track]);
            pc.addTrack(track, stream);
        });

        await Promise.allSettled(tasks);
    }, [localStream]);

    const ensurePeerState = useCallback((peerId: string) => {
        if (makingOfferRef.current[peerId] === undefined) {
            makingOfferRef.current[peerId] = false;
        }
        if (ignoreOfferRef.current[peerId] === undefined) {
            ignoreOfferRef.current[peerId] = false;
        }
        if (settingRemoteAnswerRef.current[peerId] === undefined) {
            settingRemoteAnswerRef.current[peerId] = false;
        }
        if (!pendingIceRef.current[peerId]) {
            pendingIceRef.current[peerId] = [];
        }
    }, []);

    const flushPendingIce = useCallback(async (peerId: string) => {
        const pc = peerConnectionsRef.current[peerId];
        if (!pc || !pc.remoteDescription) return;
        const pending = pendingIceRef.current[peerId] || [];
        if (pending.length === 0) return;
        pendingIceRef.current[peerId] = [];
        for (const candidate of pending) {
            try {
                await pc.addIceCandidate(candidate);
            } catch {
                // ignore candidate errors
            }
        }
    }, []);

    const createHostPeerConnection = useCallback(
        async (viewerId: string | number, options: { force?: boolean } = {}) => {
            const peerId = normalizeUserId(viewerId);
            if (!peerId || peerId === userId) return;

            if (!localStream) {
                pendingViewersRef.current.add(peerId);
                return;
            }

            const existing = peerConnectionsRef.current[peerId];
            if (existing) {
                const existingAgeMs = Date.now() - (peerCreatedAtRef.current[peerId] ?? 0);
                if (
                    !options.force &&
                    !isTerminalPeerState(existing.connectionState) &&
                    existingAgeMs < PEER_NEGOTIATION_GRACE_MS
                ) {
                    return;
                }
                cleanupPeerConnection(peerId);
            }

            const pc = createPeerConnection({
                onIceCandidate: (candidate) => {
                    sendSignal({
                        type: 'ice',
                        from: userId,
                        to: peerId,
                        candidate,
                    });
                },
            });
            peerCreatedAtRef.current[peerId] = Date.now();

            pc.onconnectionstatechange = () => {
                setConnectionState(pc.connectionState);
                if (pc.connectionState === 'connected') {
                    clearDisconnectTimer(peerId);
                    return;
                }

                if (pc.connectionState === 'disconnected') {
                    schedulePeerCleanup(peerId);
                    return;
                }

                if (isTerminalPeerState(pc.connectionState)) {
                    cleanupPeerConnection(peerId);
                }
            };

            ensurePeerState(peerId);

            const sendOffer = async (options: RTCOfferOptions = {}) => {
                try {
                    if (makingOfferRef.current[peerId] || pc.signalingState !== 'stable') {
                        return;
                    }
                    makingOfferRef.current[peerId] = true;
                    const offer = await pc.createOffer(options);
                    if (pc.signalingState !== 'stable') {
                        return;
                    }
                    await pc.setLocalDescription(offer);
                    sendSignal({
                        type: 'offer',
                        from: userId,
                        to: peerId,
                        sdp: pc.localDescription?.sdp ?? '',
                    });
                } catch {
                    // ignore negotiation errors
                } finally {
                    makingOfferRef.current[peerId] = false;
                }
            };

            pc.onnegotiationneeded = sendOffer;

            localStream.getTracks().forEach((track) => {
                pc.addTrack(track, localStream);
            });

            peerConnectionsRef.current[peerId] = pc;

            window.setTimeout(() => {
                sendOffer().catch(() => {});
            }, 0);
            window.setTimeout(() => {
                if (pc.connectionState !== 'connected' && pc.signalingState === 'stable') {
                    sendOffer({ iceRestart: true }).catch(() => {});
                }
            }, 2500);
            window.setTimeout(() => {
                if (pc.connectionState !== 'connected' && pc.signalingState === 'stable') {
                    sendOffer({ iceRestart: true }).catch(() => {});
                }
            }, 6000);
            window.setTimeout(() => {
                if (pc.connectionState !== 'connected' && pc.signalingState === 'stable') {
                    sendOffer({ iceRestart: true }).catch(() => {});
                }
            }, 10000);
            window.setTimeout(() => {
                if (pc.connectionState !== 'connected' && pc.signalingState === 'stable') {
                    sendOffer({ iceRestart: true }).catch(() => {});
                }
            }, 15000);
        },
        [cleanupPeerConnection, clearDisconnectTimer, ensurePeerState, localStream, schedulePeerCleanup, sendSignal, userId],
    );

    const createViewerPeerConnection = useCallback(
        (hostId: string | number) => {
            const peerId = normalizeUserId(hostId);
            if (!peerId || peerId === userId) return null;

            const existing = peerConnectionsRef.current[peerId];
            if (existing) {
                const existingAgeMs = Date.now() - (peerCreatedAtRef.current[peerId] ?? 0);
                if (
                    isTerminalPeerState(existing.connectionState) ||
                    (existing.connectionState === 'disconnected' && existingAgeMs > PEER_DISCONNECT_GRACE_MS)
                ) {
                    cleanupPeerConnection(peerId);
                } else {
                    return existing;
                }
            }

            const pc = createPeerConnection({
                onIceCandidate: (candidate) => {
                    sendSignal({
                        type: 'ice',
                        from: userId,
                        to: peerId,
                        candidate,
                    });
                },
                onTrack: (stream) => {
                    setRemoteStream(stream);
                    setConnectionState('connected');
                },
            });
            try {
                pc.addTransceiver('video', { direction: 'recvonly' });
                pc.addTransceiver('audio', { direction: 'recvonly' });
            } catch {
                // Older browsers can still receive tracks from the host offer.
            }
            peerCreatedAtRef.current[peerId] = Date.now();

            pc.onconnectionstatechange = () => {
                setConnectionState(pc.connectionState);
                if (pc.connectionState === 'connected') {
                    clearDisconnectTimer(peerId);
                    return;
                }

                if (pc.connectionState === 'disconnected') {
                    schedulePeerCleanup(peerId, { clearRemote: true });
                    return;
                }

                if (isTerminalPeerState(pc.connectionState)) {
                    cleanupPeerConnection(peerId);
                    setRemoteStream(null);
                }
            };

            ensurePeerState(peerId);
            peerConnectionsRef.current[peerId] = pc;
            return pc;
        },
        [cleanupPeerConnection, clearDisconnectTimer, ensurePeerState, schedulePeerCleanup, sendSignal, userId],
    );

    const handleSignal = useCallback(
        async (payload: SignalPayload) => {
            if (!payload || !payload.type) return;
            const from = normalizeUserId(payload.from);
            const to = normalizeUserId(payload.to);
            if (to && to !== userId) return;
            if (!from || from === userId) return;
            const signalId = Number(payload.id ?? 0);
            if (signalId > 0) {
                if (processedSignalIdsRef.current.has(signalId)) return;
                processedSignalIdsRef.current.add(signalId);
                lastSignalIdRef.current = Math.max(lastSignalIdRef.current, signalId);
                if (processedSignalIdsRef.current.size > 500) {
                    processedSignalIdsRef.current = new Set(Array.from(processedSignalIdsRef.current).slice(-240));
                }
            }

            if (payload.type === 'viewer-join' && role === 'host') {
                await createHostPeerConnection(from, { force: Boolean(payload.force) });
                return;
            }

            if (payload.type === 'reaction' && payload.reaction) {
                setReactions((current) => [
                    ...current.slice(-12),
                    {
                        id: `${payload.from}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                        userId: from,
                        value: payload.reaction,
                    },
                ]);
                return;
            }

            if (payload.type === 'offer' && role === 'viewer' && payload.sdp) {
                const peerId = from;
                const pc = createViewerPeerConnection(peerId);
                if (!pc) return;

                ensurePeerState(peerId);
                const makingOffer = makingOfferRef.current[peerId];
                const settingRemoteAnswer = settingRemoteAnswerRef.current[peerId];
                const offerCollision =
                    makingOffer || pc.signalingState !== 'stable' || settingRemoteAnswer;

                const polite = role === 'viewer';
                if (offerCollision && !polite) {
                    ignoreOfferRef.current[peerId] = true;
                    return;
                }
                ignoreOfferRef.current[peerId] = false;

                if (offerCollision) {
                    if (pc.signalingState !== 'stable') {
                        try {
                            await pc.setLocalDescription({ type: 'rollback' as RTCSdpType });
                        } catch {
                            // ignore rollback errors
                        }
                    }
                }

                try {
                    await pc.setRemoteDescription({ type: 'offer', sdp: payload.sdp });
                    await flushPendingIce(peerId);
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    sendSignal({
                        type: 'answer',
                        from: userId,
                        to: peerId,
                        sdp: pc.localDescription?.sdp ?? '',
                    });
                } catch {
                    // ignore offer errors
                }
                return;
            }

            if (payload.type === 'answer' && role === 'host' && payload.sdp) {
                const peerId = from;
                const pc = peerConnectionsRef.current[peerId];
                if (!pc) return;
                if (
                    pc.signalingState !== 'have-local-offer' &&
                    !settingRemoteAnswerRef.current[peerId]
                ) {
                    return;
                }
                try {
                    settingRemoteAnswerRef.current[peerId] = true;
                    await pc.setRemoteDescription({ type: 'answer', sdp: payload.sdp });
                    await flushPendingIce(peerId);
                } catch {
                    // ignore answer errors
                } finally {
                    settingRemoteAnswerRef.current[peerId] = false;
                }
                return;
            }

            if (payload.type === 'ice' && payload.candidate) {
                const peerId = from;
                const pc = peerConnectionsRef.current[peerId];
                if (!pc) return;
                ensurePeerState(peerId);
                if (pc.remoteDescription) {
                    try {
                        await pc.addIceCandidate(payload.candidate);
                    } catch {
                        // ignore candidate errors
                    }
                } else {
                    pendingIceRef.current[peerId].push(payload.candidate);
                }
            }
        },
        [
            createHostPeerConnection,
            createViewerPeerConnection,
            ensurePeerState,
            flushPendingIce,
            role,
            sendSignal,
            userId,
        ],
    );

    useEffect(() => {
        if (!localStream || role !== 'host') return;
        const pending = Array.from(pendingViewersRef.current.values());
        if (pending.length === 0) return;
        pendingViewersRef.current.clear();
        pending.forEach((viewerId) => {
            createHostPeerConnection(viewerId);
        });
    }, [createHostPeerConnection, localStream, role]);

    useEffect(() => {
        if (!enabled || !streamId || !userId) return;

        initializeEcho();
        if (!window.Echo) return;

        const channel = window.Echo.join(`presence.live.${streamId}`);
        channelRef.current = channel;
        setChannelReady(false);

        channel.here((users: LiveViewer[]) => {
            setViewers(users || []);
            setChannelReady(true);
            if (role === 'host') {
                (users || [])
                    .filter((user) => normalizeUserId(user.id) !== userId)
                    .forEach((user) => {
                        createHostPeerConnection(user.id);
                    });
            }
        });

        channel.joining((user: LiveViewer) => {
            setViewers((prev) => {
                if (prev.some((item) => item.id === user.id)) {
                    return prev;
                }
                return [...prev, user];
            });
            if (role === 'host' && normalizeUserId(user.id) !== userId) {
                createHostPeerConnection(user.id);
            }
        });

        channel.leaving((user: LiveViewer) => {
            setViewers((prev) => prev.filter((item) => item.id !== user.id));
            if (role === 'host') {
                cleanupPeerConnection(user.id);
            }
        });

        channel.listenForWhisper('signal', handleSignal);
        channel.listen('.live.signal', (payload: { signal?: SignalPayload } | SignalPayload) => {
            const signal = 'signal' in payload ? payload.signal : payload;
            if (signal) {
                handleSignal(signal);
            }
        });

        return () => {
            try {
                window.Echo.leaveChannel(`presence.live.${streamId}`);
            } catch {
                // ignore
            }
            Object.keys(peerConnectionsRef.current).forEach((peerId) => {
                cleanupPeerConnection(peerId);
            });
            pendingViewersRef.current.clear();
            setChannelReady(false);
            setRemoteStream(null);
            setConnectionState('idle');
            setViewers([]);
            if (announceJoinTimeoutRef.current !== null) {
                window.clearTimeout(announceJoinTimeoutRef.current);
                announceJoinTimeoutRef.current = null;
            }
            if (announceJoinIntervalRef.current !== null) {
                window.clearInterval(announceJoinIntervalRef.current);
                announceJoinIntervalRef.current = null;
            }
        };
    }, [
        cleanupPeerConnection,
        createHostPeerConnection,
        enabled,
        handleSignal,
        role,
        streamId,
        userId,
    ]);

    useEffect(() => {
        if (!enabled || !streamId || !userId) return;

        let stopped = false;
        let polling = false;

        const pollSignals = async () => {
            if (polling || stopped) return;
            polling = true;

            try {
                const { data } = await axiosInstance.get(`/api/live/streams/${streamId}/signals`, {
                    params: { since: lastSignalIdRef.current },
                });
                const signals = Array.isArray(data?.data) ? data.data : [];
                const highestSignalId = signals.reduce((highest: number, signal: SignalPayload) => {
                    const signalId = Number(signal?.id ?? 0);
                    return signalId > highest ? signalId : highest;
                }, lastSignalIdRef.current);

                for (const signal of signals) {
                    if (stopped) break;
                    await handleSignal(signal);
                }

                lastSignalIdRef.current = Math.max(lastSignalIdRef.current, highestSignalId);
            } catch {
                // Reverb/whisper may still deliver; try the mailbox again on the next tick.
            } finally {
                polling = false;
            }
        };

        pollSignals().catch(() => {});
        const interval = window.setInterval(() => {
            pollSignals().catch(() => {});
        }, 1200);

        return () => {
            stopped = true;
            window.clearInterval(interval);
        };
    }, [enabled, handleSignal, streamId, userId]);

    useEffect(() => {
        if (!enabled || role !== 'viewer' || !streamId || !userId) return;
        if (viewRegisteredForStreamRef.current === streamId) return;

        viewRegisteredForStreamRef.current = streamId;
        axiosInstance.post(`/api/live/streams/${streamId}/join`).catch(() => {
            viewRegisteredForStreamRef.current = null;
        });
    }, [enabled, role, streamId, userId]);

    useEffect(() => {
        if (!enabled || role !== 'viewer' || !streamId || !userId || !normalizedHostUserId || remoteStream) {
            return;
        }

        viewerFallbackAttemptsRef.current = 0;
        setConnectionState((current) => (current === 'idle' ? 'connecting' : current));

        const announceViaMailbox = () => {
            if (viewerFallbackAttemptsRef.current >= 30 || remoteStream) return;
            viewerFallbackAttemptsRef.current += 1;

            axiosInstance.post(`/api/live/streams/${streamId}/join`).catch(() => {
                // The signal mailbox below is the important fallback path.
            });

            sendSignal({
                type: 'viewer-join',
                from: userId,
                to: normalizedHostUserId,
                force: true,
            });
        };

        announceViaMailbox();
        const interval = window.setInterval(announceViaMailbox, 2000);

        return () => {
            window.clearInterval(interval);
        };
    }, [enabled, normalizedHostUserId, remoteStream, role, sendSignal, streamId, userId]);

    useEffect(() => {
        if (!channelReady || role !== 'viewer' || !userId) return;
        const announceJoin = () => {
            const host = normalizedHostUserId
                ? viewers.find((viewer) => normalizeUserId(viewer.id) === normalizedHostUserId)
                : viewers.find((viewer) => normalizeUserId(viewer.id) !== userId);
            if (host && !remoteStream) {
                const hostId = normalizeUserId(host.id);
                const pc = peerConnectionsRef.current[hostId];
                const ageMs = Date.now() - (peerCreatedAtRef.current[hostId] ?? 0);
                if (pc && pc.connectionState !== 'connected' && ageMs > PEER_NEGOTIATION_GRACE_MS) {
                    cleanupPeerConnection(hostId);
                }
            }
            sendSignal({
                type: 'viewer-join',
                from: userId,
                ...(normalizedHostUserId ? { to: normalizedHostUserId } : {}),
            });
        };

        announceJoin();
        announceJoinTimeoutRef.current = window.setTimeout(() => {
            announceJoin();
            announceJoinTimeoutRef.current = null;
        }, 1500);
        announceJoinIntervalRef.current = window.setInterval(() => {
            if (remoteStream) {
                if (announceJoinIntervalRef.current !== null) {
                    window.clearInterval(announceJoinIntervalRef.current);
                    announceJoinIntervalRef.current = null;
                }
                return;
            }
            announceJoin();
        }, 4000);

        return () => {
            if (announceJoinTimeoutRef.current !== null) {
                window.clearTimeout(announceJoinTimeoutRef.current);
                announceJoinTimeoutRef.current = null;
            }
            if (announceJoinIntervalRef.current !== null) {
                window.clearInterval(announceJoinIntervalRef.current);
                announceJoinIntervalRef.current = null;
            }
        };
    }, [channelReady, cleanupPeerConnection, normalizedHostUserId, remoteStream, role, sendSignal, streamId, userId, viewers]);

    const requestReconnect = useCallback(() => {
        if (role !== 'viewer' || !userId) return;

        const host = normalizedHostUserId
            ? viewers.find((viewer) => normalizeUserId(viewer.id) === normalizedHostUserId)
            : viewers.find((viewer) => normalizeUserId(viewer.id) !== userId);
        const hostId = normalizeUserId(host?.id ?? normalizedHostUserId);

        if (hostId) {
            cleanupPeerConnection(hostId);
        }

        setRemoteStream(null);
        setConnectionState('connecting');
        sendSignal({
            type: 'viewer-join',
            from: userId,
            ...(hostId ? { to: hostId } : {}),
            force: true,
        });

        window.setTimeout(() => {
            sendSignal({
                type: 'viewer-join',
                from: userId,
                ...(hostId ? { to: hostId } : {}),
                force: true,
            });
        }, 1200);
    }, [cleanupPeerConnection, normalizedHostUserId, role, sendSignal, userId, viewers]);

    return {
        viewers,
        remoteStream,
        connectionState,
        reactions,
        sendSignal,
        requestReconnect,
        replaceVideoTrack,
    };
}
