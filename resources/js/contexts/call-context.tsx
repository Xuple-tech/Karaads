import axiosInstance from '@/lib/axios';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { initializeEcho } from '@/utils/echo';
import { CallMediaMode, createPeerConnection, getLocalMedia, stopMediaStream, tunePeerConnectionSenders } from '@/lib/webrtc';
import { useAuth } from '@/hooks/use-auth';
import { startIncomingRingtone, startOutgoingRingback, stopAllRinging } from '@/lib/call-ringing';

type CallStatus =
    'idle'
    | 'incoming'
    | 'calling'
    | 'restoring'
    | 'awaiting_approval'
    | 'connecting'
    | 'reconnecting'
    | 'in_call'
    | 'ended'
    | 'error';
type CallRole = 'caller' | 'callee';

export interface CallPeerUser {
    id: string;
    name: string;
    avatar?: string;
    username?: string;
    state?: 'invited' | 'joined' | 'declined' | 'left' | 'kicked';
    role?: 'initiator' | 'participant';
}

export interface CallJoinRequest {
    id: string;
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    created_at?: string;
    expires_at?: string;
    requested_by: CallPeerUser;
}

const HEARTBEAT_INTERVAL_MS = 25_000;
const ICE_RETRY_BASE_MS = 250;
const ICE_RETRY_MAX_ATTEMPTS = 5;

interface CallState {
    status: CallStatus;
    role?: CallRole;
    callId?: string;
    conversationId?: string;
    initiatorId?: string;
    mode: CallMediaMode;
    peer?: CallPeerUser;
    participants: CallPeerUser[];
    pendingJoinRequests: CallJoinRequest[];
    callParticipantIds: string[];
    connectedParticipantIds: string[];
    maxParticipants: number;
    error?: string;
    isMicEnabled: boolean;
    isCameraEnabled: boolean;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    remoteStreams: Record<string, MediaStream>;
}

interface CallContextValue {
    state: CallState;
    startCall: (conversationId: string, mode?: CallMediaMode) => Promise<void>;
    joinCallById: (callId: string) => Promise<void>;
    inviteToCall: (userId: string) => Promise<void>;
    kickFromCall: (userId: string) => Promise<void>;
    copyJoinLink: () => Promise<void>;
    approveJoinRequest: (requestId: string) => Promise<void>;
    rejectJoinRequest: (requestId: string) => Promise<void>;
    acceptCall: () => Promise<void>;
    declineCall: () => Promise<void>;
    hangup: () => Promise<void>;
    toggleMic: () => void;
    toggleCamera: () => void;
}

const CallContext = createContext<CallContextValue | null>(null);

function normalizeSdp(raw: unknown): string {
    if (typeof raw !== 'string') return '';
    let sdp = raw.trim();

    if (sdp.startsWith('"') && sdp.endsWith('"')) {
        try {
            const parsed = JSON.parse(sdp);
            if (typeof parsed === 'string') {
                sdp = parsed.trim();
            }
        } catch {
            // ignore
        }
    }

    if (sdp.includes('\\r\\n') || sdp.includes('\\n') || sdp.includes('\\r')) {
        sdp = sdp.replace(/\\r\\n/g, '\r\n').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    }

    sdp = sdp.replace(/\u2028|\u2029/g, '\n');
    sdp = sdp.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');
    sdp = sdp.replace(/\r\n|\n|\r/g, '\r\n');
    sdp = sdp.trim();
    if (sdp.length > 0 && !sdp.endsWith('\r\n')) {
        sdp += '\r\n';
    }

    return sdp;
}

function decodeBase64Sdp(raw: unknown): string {
    if (typeof raw !== 'string' || raw.length === 0) return '';
    try {
        return atob(raw);
    } catch {
        return '';
    }
}

function getMediaPermissionMessage(error: any, mode: CallMediaMode): string | null {
    const name = typeof error?.name === 'string' ? error.name : '';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
        return mode === 'audio'
            ? 'Microphone permission is required for audio calls.'
            : 'Microphone permission is required for calls.';
    }
    return null;
}

function resolveMediaErrorMessage(error: any, mode: CallMediaMode, fallback: string): string {
    return error?.response?.data?.message
        ?? getMediaPermissionMessage(error, mode)
        ?? fallback;
}

async function resolveSdpFromPayload(
    callId: string,
    type: 'offer' | 'answer',
    payload: any,
): Promise<string> {
    const direct =
        decodeBase64Sdp(type === 'offer' ? payload?.offer_sdp_b64 : payload?.answer_sdp_b64) ||
        (type === 'offer' ? payload?.offer_sdp : payload?.answer_sdp);

    if (direct) return direct;

    const signalId = type === 'offer' ? payload?.offer_signal_id : payload?.answer_signal_id;
    if (typeof signalId !== 'string' || signalId.length === 0) return '';

    const response = await axiosInstance.get(`/api/calls/${callId}/signals/${type}/${signalId}`);
    return decodeBase64Sdp(response?.data?.sdp_b64) || response?.data?.sdp || '';
}

function initialState(): CallState {
    return {
        status: 'idle',
        mode: 'video',
        participants: [],
        pendingJoinRequests: [],
        callParticipantIds: [],
        connectedParticipantIds: [],
        maxParticipants: 8,
        isMicEnabled: true,
        isCameraEnabled: true,
        localStream: null,
        remoteStream: null,
        remoteStreams: {},
    };
}

export function CallProvider({ children }: { children: React.ReactNode }) {
    const { auth } = useAuth();
    const currentUser = auth?.user ?? null;

    const [state, setState] = useState<CallState>(() => initialState());
    const stateRef = useRef<CallState>(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const userChannelRef = useRef<any>(null);
    const callChannelRef = useRef<any>(null);

    const pcMapRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const localStreamRef = useRef<MediaStream | null>(null);
    const pendingRemoteCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
    const reconnectAttemptsRef = useRef<Map<string, number>>(new Map());
    const makingOfferRef = useRef<Map<string, boolean>>(new Map());
    const ignoreOfferRef = useRef<Map<string, boolean>>(new Map());
    const appliedAnswerSignalIdRef = useRef<Map<string, string>>(new Map());
    const heartbeatTimerRef = useRef<number | null>(null);
    const iceFlushTimerRef = useRef<number | null>(null);
    const outboundIceQueueRef = useRef<Array<{
        callId: string;
        toUserId: string;
        candidate: RTCIceCandidateInit;
        attempt: number;
        nextAt: number;
    }>>([]);
    const hasAttemptedInitialRestoreRef = useRef(false);
    const restoreInFlightRef = useRef(false);

    const normalizeParticipantIds = useCallback((ids: string[] | undefined | null) => {
        if (!Array.isArray(ids)) return [];
        return Array.from(new Set(ids.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)));
    }, []);

    const isPolitePeer = useCallback((remoteUserId: string) => {
        const selfId = currentUser?.id;
        if (!selfId) return true;
        return selfId.localeCompare(remoteUserId) < 0;
    }, [currentUser?.id]);

    const normalizeParticipantSummaries = useCallback((participants: unknown): CallPeerUser[] => {
        if (!Array.isArray(participants)) return [];
        return participants
            .filter((item: any) => item && typeof item.id === 'string')
            .map((item: any) => ({
                id: item.id,
                name: item.name || item.username || 'Unknown',
                avatar: item.avatar,
                username: item.username,
                state: item.state,
                role: item.role,
            }));
    }, []);

    const syncParticipantsFromPayload = useCallback((participants: unknown) => {
        const normalized = normalizeParticipantSummaries(participants);
        if (normalized.length === 0) return;

        const allowedIds = new Set(stateRef.current.callParticipantIds);
        const filtered = allowedIds.size > 0
            ? normalized.filter((user) => allowedIds.has(user.id))
            : normalized;

        setState((prev) => ({
            ...prev,
            participants: filtered,
            peer: filtered.find((p) => p.id !== currentUser?.id) || prev.peer,
        }));
    }, [currentUser?.id, normalizeParticipantSummaries]);

    const upsertParticipant = useCallback((user: CallPeerUser) => {
        setState((prev) => {
            const existing = prev.participants.find((p) => p.id === user.id);
            if (existing) {
                return {
                    ...prev,
                    participants: prev.participants.map((p) => (p.id === user.id ? { ...p, ...user } : p)),
                };
            }
            return { ...prev, participants: [...prev.participants, user], peer: user.id !== currentUser?.id ? user : prev.peer };
        });
    }, [currentUser?.id]);

    const clearPeerConnections = useCallback(() => {
        for (const [, pc] of pcMapRef.current.entries()) {
            try {
                pc.close();
            } catch {
                // ignore
            }
        }
        pcMapRef.current.clear();
        pendingRemoteCandidatesRef.current.clear();
        reconnectAttemptsRef.current.clear();
        makingOfferRef.current.clear();
        ignoreOfferRef.current.clear();
        appliedAnswerSignalIdRef.current.clear();
    }, []);

    const clearIceQueue = useCallback(() => {
        outboundIceQueueRef.current = [];
        if (iceFlushTimerRef.current) {
            window.clearTimeout(iceFlushTimerRef.current);
            iceFlushTimerRef.current = null;
        }
    }, []);

    const stopHeartbeat = useCallback(() => {
        if (heartbeatTimerRef.current) {
            window.clearInterval(heartbeatTimerRef.current);
            heartbeatTimerRef.current = null;
        }
    }, []);

    const clearMedia = useCallback(() => {
        stopMediaStream(localStreamRef.current);
        localStreamRef.current = null;
        setState((prev) => ({
            ...prev,
            localStream: null,
            remoteStream: null,
            remoteStreams: {},
            callParticipantIds: [],
            connectedParticipantIds: [],
            isMicEnabled: true,
            isCameraEnabled: prev.mode === 'audio' ? false : true,
        }));
    }, []);

    const leaveCallChannel = useCallback((callId?: string) => {
        if (!window.Echo || !callId) return;
        try {
            window.Echo.leave(`call.${callId}`);
        } catch {
            // ignore
        }
        callChannelRef.current = null;
    }, []);

    const leaveUserChannel = useCallback(() => {
        if (!window.Echo || !currentUser?.id) return;
        try {
            window.Echo.leave(`App.Models.User.${currentUser.id}`);
        } catch {
            // ignore
        }
        userChannelRef.current = null;
    }, [currentUser?.id]);

    const resetToIdle = useCallback((opts?: { toastMessage?: string }) => {
        const activeCallId = stateRef.current.callId;
        stopAllRinging();
        setState(() => initialState());
        stopHeartbeat();
        clearIceQueue();
        clearPeerConnections();
        clearMedia();
        leaveCallChannel(activeCallId);
        if (opts?.toastMessage) toast(opts.toastMessage);
    }, [clearIceQueue, clearMedia, clearPeerConnections, leaveCallChannel, stopHeartbeat]);

    const ensureEcho = useCallback(() => {
        try {
            initializeEcho();
        } catch {
            // ignore
        }
    }, []);

    const ensureLocalStream = useCallback(async (mode: CallMediaMode) => {
        if (localStreamRef.current) return localStreamRef.current;
        const stream = await getLocalMedia(mode);
        localStreamRef.current = stream;
        setState((prev) => ({
            ...prev,
            localStream: stream,
            isCameraEnabled: mode === 'video',
            mode,
        }));
        return stream;
    }, []);

    const flushOutboundIceQueue = useCallback(async () => {
        iceFlushTimerRef.current = null;

        const now = Date.now();
        const nextQueue: typeof outboundIceQueueRef.current = [];
        let nextWakeAt: number | null = null;

        for (const item of outboundIceQueueRef.current) {
            if (item.nextAt > now) {
                nextQueue.push(item);
                if (nextWakeAt === null || item.nextAt < nextWakeAt) {
                    nextWakeAt = item.nextAt;
                }
                continue;
            }

            try {
                await axiosInstance.post(`/api/calls/${item.callId}/ice`, {
                    to_user_id: item.toUserId,
                    candidate: item.candidate,
                });
            } catch (err: any) {
                const status = err?.response?.status as number | undefined;
                const isTerminal = status === 403 || status === 404 || status === 409;
                if (isTerminal || item.attempt >= ICE_RETRY_MAX_ATTEMPTS) {
                    continue;
                }

                const jitterMs = Math.floor(Math.random() * 200);
                const delayMs = Math.min(4_000, ICE_RETRY_BASE_MS * (2 ** item.attempt)) + jitterMs;
                const retryAt = Date.now() + delayMs;
                nextQueue.push({
                    ...item,
                    attempt: item.attempt + 1,
                    nextAt: retryAt,
                });
                if (nextWakeAt === null || retryAt < nextWakeAt) {
                    nextWakeAt = retryAt;
                }
            }
        }

        outboundIceQueueRef.current = nextQueue;
        if (nextWakeAt !== null) {
            const timeoutMs = Math.max(50, nextWakeAt - Date.now());
            iceFlushTimerRef.current = window.setTimeout(() => {
                flushOutboundIceQueue().catch(() => {
                    // ignore
                });
            }, timeoutMs);
        }
    }, []);

    const enqueueOutboundIceCandidate = useCallback((callId: string, toUserId: string, candidate: RTCIceCandidate) => {
        outboundIceQueueRef.current.push({
            callId,
            toUserId,
            candidate: candidate.toJSON(),
            attempt: 0,
            nextAt: Date.now(),
        });

        if (!iceFlushTimerRef.current) {
            iceFlushTimerRef.current = window.setTimeout(() => {
                flushOutboundIceQueue().catch(() => {
                    // ignore
                });
            }, 0);
        }
    }, [flushOutboundIceQueue]);

    const flushPendingCandidates = useCallback(async (remoteUserId: string) => {
        const pc = pcMapRef.current.get(remoteUserId);
        if (!pc || !pc.remoteDescription) return;

        const queued = pendingRemoteCandidatesRef.current.get(remoteUserId) || [];
        if (queued.length === 0) return;
        pendingRemoteCandidatesRef.current.set(remoteUserId, []);

        for (const candidateInit of queued) {
            try {
                await pc.addIceCandidate(candidateInit);
            } catch {
                // ignore
            }
        }
    }, []);

    const syncCallParticipantIds = useCallback((participantIds: string[] | undefined | null) => {
        const normalized = normalizeParticipantIds(participantIds);
        if (normalized.length === 0) return;

        const allowedIds = new Set(normalized);
        setState((prev) => {
            const nextRemoteStreams = Object.fromEntries(
                Object.entries(prev.remoteStreams).filter(([id]) => allowedIds.has(id)),
            );
            const nextRemoteStreamValues = Object.values(nextRemoteStreams);
            const hasCurrentRemote = prev.remoteStream
                ? nextRemoteStreamValues.some((stream) => stream === prev.remoteStream)
                : false;

            return {
                ...prev,
                callParticipantIds: normalized,
                participants: prev.participants.filter((participant) => allowedIds.has(participant.id)),
                connectedParticipantIds: prev.connectedParticipantIds.filter((id) => allowedIds.has(id)),
                remoteStreams: nextRemoteStreams,
                remoteStream: hasCurrentRemote ? prev.remoteStream : (nextRemoteStreamValues[0] || null),
            };
        });
    }, [normalizeParticipantIds]);

    const syncMaxParticipants = useCallback((maxParticipants: unknown) => {
        const parsed = typeof maxParticipants === 'number'
            ? maxParticipants
            : Number(maxParticipants);
        if (!Number.isFinite(parsed) || parsed < 2) return;
        setState((prev) => ({ ...prev, maxParticipants: parsed }));
    }, []);

    const syncPendingJoinRequests = useCallback((requests: unknown) => {
        if (!Array.isArray(requests)) {
            setState((prev) => ({ ...prev, pendingJoinRequests: [] }));
            return;
        }

        const normalized: CallJoinRequest[] = requests
            .filter((request: any) => request && typeof request.id === 'string')
            .map((request: any) => ({
                id: request.id,
                status: request.status || 'pending',
                created_at: request.created_at,
                expires_at: request.expires_at,
                requested_by: {
                    id: request?.requested_by?.id || '',
                    name: request?.requested_by?.name || request?.requested_by?.username || 'Unknown',
                    avatar: request?.requested_by?.avatar,
                    username: request?.requested_by?.username,
                },
            }))
            .filter((request) => request.requested_by.id);

        setState((prev) => ({ ...prev, pendingJoinRequests: normalized }));
    }, []);

    const parseCallSnapshot = useCallback((call: any) => {
        const callId = (call?.id as string | undefined) || (call?.call_id as string | undefined);
        const conversationId = call?.conversation_id as string | undefined;
        const mode = (call?.mode as CallMediaMode | undefined) ?? 'video';
        const participantIds = normalizeParticipantIds((call?.participant_ids as string[] | undefined) ?? []);
        const acceptedUserIds = normalizeParticipantIds((call?.accepted_user_ids as string[] | undefined) ?? []);
        const participantSummaries = normalizeParticipantSummaries(call?.participants);
        const maxParticipants = Number(call?.max_participants);
        const initiatorId = call?.initiator_id as string | undefined;
        const peer = participantSummaries.find((participant) => participant.id !== currentUser?.id);
        const status = (call?.status as string | undefined) ?? '';

        return {
            callId,
            conversationId,
            mode,
            participantIds,
            acceptedUserIds,
            participantSummaries,
            maxParticipants,
            initiatorId,
            peer,
            status,
        };
    }, [currentUser?.id, normalizeParticipantIds, normalizeParticipantSummaries]);

    const fetchActiveCallSnapshot = useCallback(async () => {
        const response = await axiosInstance.get('/api/calls/active');
        return response?.data?.call ?? response?.data?.data?.call ?? null;
    }, []);

    const setRemoteDescriptionWithRetry = useCallback(async (
        pc: RTCPeerConnection,
        type: 'offer' | 'answer',
        sdp: string,
    ) => {
        try {
            await pc.setRemoteDescription({ type, sdp });
            return;
        } catch {
            const retried = normalizeSdp(sdp);
            if (!retried) {
                throw new Error('Invalid SDP');
            }
            await pc.setRemoteDescription({ type, sdp: retried });
        }
    }, []);

    const ensurePeerConnection = useCallback(async (remoteUserId: string) => {
        const current = pcMapRef.current.get(remoteUserId);
        if (current) return current;

        const callId = stateRef.current.callId;
        if (!callId) throw new Error('Missing call id');

        const pc = createPeerConnection({
            onTrack: (stream) => {
                setState((prev) => {
                    const nextStreams = { ...prev.remoteStreams, [remoteUserId]: stream };
                    return {
                        ...prev,
                        remoteStreams: nextStreams,
                        remoteStream: nextStreams[remoteUserId] || Object.values(nextStreams)[0] || null,
                    };
                });
            },
        });

        const stream = await ensureLocalStream(stateRef.current.mode);
        for (const track of stream.getTracks()) {
            pc.addTrack(track, stream);
        }
        await tunePeerConnectionSenders(pc, stateRef.current.mode);

        pc.onicecandidate = (event) => {
            if (!event.candidate) return;
            enqueueOutboundIceCandidate(callId, remoteUserId, event.candidate);
        };

        const triggerReconnection = () => {
            const currentStatus = stateRef.current.status;
            if (!['connecting', 'in_call', 'reconnecting'].includes(currentStatus)) return;

            setState((prev) => ({
                ...prev,
                status: 'reconnecting',
            }));

            const attempts = reconnectAttemptsRef.current.get(remoteUserId) ?? 0;
            if (attempts >= 2) {
                return;
            }

            reconnectAttemptsRef.current.set(remoteUserId, attempts + 1);

            if (typeof pc.restartIce === 'function') {
                try {
                    pc.restartIce();
                } catch {
                    // ignore
                }
            }

            (async () => {
                if (makingOfferRef.current.get(remoteUserId)) {
                    return;
                }

                if (pc.signalingState !== 'stable') {
                    return;
                }

                makingOfferRef.current.set(remoteUserId, true);
                try {
                    const offer = await pc.createOffer({ iceRestart: true });
                    if (pc.signalingState !== 'stable') {
                        return;
                    }
                    await pc.setLocalDescription(offer);
                    await axiosInstance.post(`/api/calls/${callId}/offer`, {
                        to_user_id: remoteUserId,
                        sdp: offer.sdp,
                    });
                } catch {
                    // ignore
                } finally {
                    makingOfferRef.current.set(remoteUserId, false);
                }
            })();
        };

        pc.onconnectionstatechange = () => {
            const nextState = pc.connectionState;
            if (nextState === 'connected') {
                reconnectAttemptsRef.current.set(remoteUserId, 0);
                setState((prev) => ({
                    ...prev,
                    status: 'in_call',
                    connectedParticipantIds: Array.from(new Set([...prev.connectedParticipantIds, remoteUserId])),
                }));
                return;
            }

            if (nextState === 'disconnected' || nextState === 'failed') {
                triggerReconnection();
            }
        };

        pc.oniceconnectionstatechange = () => {
            const nextState = pc.iceConnectionState;
            if (nextState === 'failed' || nextState === 'disconnected') {
                triggerReconnection();
            }
        };

        pcMapRef.current.set(remoteUserId, pc);
        return pc;
    }, [enqueueOutboundIceCandidate, ensureLocalStream]);

    const createOfferTo = useCallback(async (remoteUserId: string, opts?: { iceRestart?: boolean }) => {
        const callId = stateRef.current.callId;
        if (!callId) return;

        const pc = await ensurePeerConnection(remoteUserId);
        if (makingOfferRef.current.get(remoteUserId)) return;
        if (pc.signalingState !== 'stable') return;

        makingOfferRef.current.set(remoteUserId, true);
        ignoreOfferRef.current.set(remoteUserId, false);
        try {
            const offer = await pc.createOffer(opts?.iceRestart ? { iceRestart: true } : undefined);
            if (pc.signalingState !== 'stable') return;
            await pc.setLocalDescription(offer);

            await axiosInstance.post(`/api/calls/${callId}/offer`, {
                to_user_id: remoteUserId,
                sdp: offer.sdp,
            });
        } finally {
            makingOfferRef.current.set(remoteUserId, false);
        }
    }, [ensurePeerConnection]);

    const restoreFromCallSnapshot = useCallback(async (call: any): Promise<boolean> => {
        if (!currentUser?.id) return false;
        if (restoreInFlightRef.current) return false;

        const parsed = parseCallSnapshot(call);
        if (!parsed.callId || !parsed.conversationId) {
            return false;
        }

        const isInitiator = parsed.initiatorId === currentUser.id;

        if (parsed.status === 'ringing' && !isInitiator) {
            setState((prev) => ({
                ...prev,
                status: 'incoming',
                role: 'callee',
                callId: parsed.callId,
                conversationId: parsed.conversationId,
                initiatorId: parsed.initiatorId,
                mode: parsed.mode,
                peer: parsed.peer,
                participants: parsed.participantSummaries,
                callParticipantIds: parsed.participantIds,
                maxParticipants: Number.isFinite(parsed.maxParticipants) && parsed.maxParticipants >= 2
                    ? parsed.maxParticipants
                    : prev.maxParticipants,
            }));
            return true;
        }

        if (parsed.status === 'ringing' && isInitiator) {
            setState((prev) => ({
                ...prev,
                status: 'calling',
                role: 'caller',
                callId: parsed.callId,
                conversationId: parsed.conversationId,
                initiatorId: parsed.initiatorId,
                mode: parsed.mode,
                peer: parsed.peer,
                participants: parsed.participantSummaries,
                callParticipantIds: parsed.participantIds,
                connectedParticipantIds: parsed.acceptedUserIds.filter((id) => id !== currentUser.id),
                maxParticipants: Number.isFinite(parsed.maxParticipants) && parsed.maxParticipants >= 2
                    ? parsed.maxParticipants
                    : prev.maxParticipants,
            }));
            try {
                await ensureLocalStream(parsed.mode);
            } catch (err: any) {
                toast(resolveMediaErrorMessage(err, parsed.mode, 'Unable to access media devices'));
            }
            return true;
        }

        restoreInFlightRef.current = true;
        try {
            setState((prev) => ({
                ...prev,
                status: 'restoring',
                role: isInitiator ? 'caller' : 'callee',
                callId: parsed.callId,
                conversationId: parsed.conversationId,
                initiatorId: parsed.initiatorId,
                mode: parsed.mode,
                peer: parsed.peer,
                participants: parsed.participantSummaries,
                callParticipantIds: parsed.participantIds,
                connectedParticipantIds: parsed.acceptedUserIds.filter((id) => id !== currentUser.id),
                maxParticipants: Number.isFinite(parsed.maxParticipants) && parsed.maxParticipants >= 2
                    ? parsed.maxParticipants
                    : prev.maxParticipants,
            }));

            await ensureLocalStream(parsed.mode);
            const acceptResponse = await axiosInstance.post(`/api/calls/${parsed.callId}/accept`);
            const participantIds = normalizeParticipantIds(
                (acceptResponse?.data?.participant_ids as string[] | undefined) ?? parsed.participantIds,
            );
            const acceptedUserIds = normalizeParticipantIds(
                (acceptResponse?.data?.accepted_user_ids as string[] | undefined) ?? parsed.acceptedUserIds,
            );

            syncCallParticipantIds(participantIds);
            syncParticipantsFromPayload(acceptResponse?.data?.participants ?? parsed.participantSummaries);
            syncMaxParticipants(acceptResponse?.data?.max_participants ?? parsed.maxParticipants);

            setState((prev) => ({
                ...prev,
                status: 'reconnecting',
                connectedParticipantIds: acceptedUserIds.filter((id) => id !== currentUser.id),
            }));

            const remoteAcceptedUserIds = acceptedUserIds.filter((id) => id !== currentUser.id);
            for (const remoteUserId of remoteAcceptedUserIds) {
                createOfferTo(remoteUserId, { iceRestart: true }).catch(() => {
                    // ignore
                });
            }

            return true;
        } catch (err: any) {
            const status = err?.response?.status as number | undefined;
            if (status === 403 || status === 404 || status === 409) {
                resetToIdle();
                return false;
            }

            toast(err?.response?.data?.message ?? 'Unable to restore active call');
            resetToIdle();
            return false;
        } finally {
            restoreInFlightRef.current = false;
        }
    }, [
        createOfferTo,
        currentUser?.id,
        ensureLocalStream,
        normalizeParticipantIds,
        parseCallSnapshot,
        resetToIdle,
        syncCallParticipantIds,
        syncMaxParticipants,
        syncParticipantsFromPayload,
    ]);

    const handleOffer = useCallback(async (payload: any) => {
        const callId = stateRef.current.callId;
        if (!callId) return;

        const fromUserId = payload?.from_user_id as string | undefined;
        const toUserId = payload?.to_user_id as string | undefined;
        if (!fromUserId || !toUserId || toUserId !== currentUser?.id || fromUserId === currentUser?.id) return;

        const pc = await ensurePeerConnection(fromUserId);
        const offerCollision = !!makingOfferRef.current.get(fromUserId) || pc.signalingState !== 'stable';
        const ignoreOffer = !isPolitePeer(fromUserId) && offerCollision;
        if (ignoreOffer) {
            ignoreOfferRef.current.set(fromUserId, true);
            return;
        }

        ignoreOfferRef.current.set(fromUserId, false);
        if (offerCollision && pc.signalingState === 'have-local-offer') {
            try {
                await pc.setLocalDescription({ type: 'rollback' });
            } catch {
                return;
            }
        }

        if (pc.signalingState !== 'stable') {
            return;
        }

        const offerSdp = await resolveSdpFromPayload(callId, 'offer', payload);
        if (!offerSdp) return;

        await setRemoteDescriptionWithRetry(pc, 'offer', offerSdp);
        await flushPendingCandidates(fromUserId);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await axiosInstance.post(`/api/calls/${callId}/answer`, {
            to_user_id: fromUserId,
            sdp: answer.sdp,
        });

        setState((prev) => ({
            ...prev,
            status: 'in_call',
            connectedParticipantIds: Array.from(new Set([...prev.connectedParticipantIds, fromUserId])),
        }));
    }, [currentUser?.id, ensurePeerConnection, flushPendingCandidates, isPolitePeer, setRemoteDescriptionWithRetry]);

    const handleAnswer = useCallback(async (payload: any) => {
        const callId = stateRef.current.callId;
        if (!callId) return;

        const fromUserId = payload?.from_user_id as string | undefined;
        const toUserId = payload?.to_user_id as string | undefined;
        if (!fromUserId || !toUserId || toUserId !== currentUser?.id || fromUserId === currentUser?.id) return;

        const pc = pcMapRef.current.get(fromUserId);
        if (!pc) return;

        if (ignoreOfferRef.current.get(fromUserId)) {
            return;
        }

        const answerSignalId = payload?.answer_signal_id as string | undefined;
        if (
            typeof answerSignalId === 'string' &&
            answerSignalId.length > 0 &&
            appliedAnswerSignalIdRef.current.get(fromUserId) === answerSignalId
        ) {
            return;
        }

        if (pc.signalingState !== 'have-local-offer') {
            return;
        }

        const answerSdp = await resolveSdpFromPayload(callId, 'answer', payload);
        if (!answerSdp) return;

        await setRemoteDescriptionWithRetry(pc, 'answer', answerSdp);
        if (typeof answerSignalId === 'string' && answerSignalId.length > 0) {
            appliedAnswerSignalIdRef.current.set(fromUserId, answerSignalId);
        }
        await flushPendingCandidates(fromUserId);

        setState((prev) => ({
            ...prev,
            status: 'in_call',
            connectedParticipantIds: Array.from(new Set([...prev.connectedParticipantIds, fromUserId])),
        }));
    }, [currentUser?.id, flushPendingCandidates, setRemoteDescriptionWithRetry]);

    const handleRemoteIce = useCallback(async (payload: any) => {
        const fromUserId = payload?.from_user_id as string | undefined;
        const toUserId = payload?.to_user_id as string | undefined;
        if (!fromUserId || !toUserId || toUserId !== currentUser?.id || fromUserId === currentUser?.id) return;

        const candidate = payload?.candidate;
        if (!candidate) return;

        const pc = pcMapRef.current.get(fromUserId);
        if (!pc) {
            const queued = pendingRemoteCandidatesRef.current.get(fromUserId) || [];
            queued.push(candidate);
            pendingRemoteCandidatesRef.current.set(fromUserId, queued);
            return;
        }

        if (!pc.remoteDescription) {
            const queued = pendingRemoteCandidatesRef.current.get(fromUserId) || [];
            queued.push(candidate);
            pendingRemoteCandidatesRef.current.set(fromUserId, queued);
            return;
        }

        try {
            await pc.addIceCandidate(candidate);
        } catch {
            // ignore
        }
    }, [currentUser?.id]);

    const subscribeToCallChannel = useCallback((callId: string) => {
        if (!window.Echo) return;
        if (callChannelRef.current) return;

        callChannelRef.current = window.Echo.private(`call.${callId}`)
            .listen('.CallOffer', (data: any) => {
                handleOffer(data).catch((err) => {
                    console.error('Failed to handle offer:', err);
                });
            })
            .listen('.CallAnswer', (data: any) => {
                handleAnswer(data).catch((err) => {
                    console.error('Failed to handle answer:', err);
                });
            })
            .listen('.CallIceCandidate', (data: any) => {
                handleRemoteIce(data).catch((err) => {
                    console.error('Failed to handle ICE:', err);
                });
            })
            .listen('.CallAccepted', (data: any) => {
                const callIdFromEvent = data?.call_id as string | undefined;
                const fromUserId = data?.from_user_id as string | undefined;
                const participantIds = (data?.participant_ids as string[] | undefined) ?? [];
                if (!callIdFromEvent || callIdFromEvent !== stateRef.current.callId || !fromUserId) return;
                if (fromUserId === currentUser?.id) return;

                syncCallParticipantIds(participantIds);
                syncParticipantsFromPayload(data?.participants);
                syncMaxParticipants(data?.max_participants);
                setState((prev) => ({
                    ...prev,
                    status: 'connecting',
                    connectedParticipantIds: Array.from(new Set([...prev.connectedParticipantIds, fromUserId])),
                }));
                upsertParticipant({
                    id: fromUserId,
                    name: 'Participant',
                });

                createOfferTo(fromUserId).catch((err) => {
                    console.error('Failed to create offer:', err);
                });
            })
            .listen('.CallDeclined', (data: any) => {
                const callIdFromEvent = data?.call_id as string | undefined;
                const fromUserId = data?.from_user_id as string | undefined;
                if (!callIdFromEvent || callIdFromEvent !== stateRef.current.callId) return;
                if (!fromUserId || fromUserId === currentUser?.id) return;
                syncCallParticipantIds((data?.participant_ids as string[] | undefined) ?? []);
                syncParticipantsFromPayload(data?.participants);
                syncMaxParticipants(data?.max_participants);
                if (stateRef.current.status === 'calling' && stateRef.current.connectedParticipantIds.length === 0) {
                    resetToIdle({ toastMessage: 'Call declined' });
                }
            })
            .listen('.CallEnded', (data: any) => {
                const callIdFromEvent = data?.call_id as string | undefined;
                if (!callIdFromEvent || callIdFromEvent !== stateRef.current.callId) return;
                resetToIdle({ toastMessage: 'Call ended' });
            })
            .listen('.CallParticipantRemoved', (data: any) => {
                const callIdFromEvent = data?.call_id as string | undefined;
                const removedUserId = data?.removed_user_id as string | undefined;
                const participantIds = (data?.participant_ids as string[] | undefined) ?? [];
                const reason = (data?.reason as string | undefined) ?? 'kicked';
                if (!callIdFromEvent || callIdFromEvent !== stateRef.current.callId || !removedUserId) return;

                if (removedUserId === currentUser?.id) {
                    const toastMessage = reason === 'kicked' ? 'You were removed from the call' : 'You left the call';
                    resetToIdle({ toastMessage });
                    return;
                }

                const pc = pcMapRef.current.get(removedUserId);
                if (pc) {
                    try {
                        pc.close();
                    } catch {
                        // ignore
                    }
                    pcMapRef.current.delete(removedUserId);
                }
                reconnectAttemptsRef.current.delete(removedUserId);
                pendingRemoteCandidatesRef.current.delete(removedUserId);
                makingOfferRef.current.delete(removedUserId);
                ignoreOfferRef.current.delete(removedUserId);
                appliedAnswerSignalIdRef.current.delete(removedUserId);

                setState((prev) => ({
                    ...prev,
                    connectedParticipantIds: prev.connectedParticipantIds.filter((id) => id !== removedUserId),
                    participants: prev.participants.filter((p) => p.id !== removedUserId),
                    remoteStreams: Object.fromEntries(
                        Object.entries(prev.remoteStreams).filter(([id]) => id !== removedUserId),
                    ),
                    remoteStream: prev.remoteStreams[removedUserId] ? null : prev.remoteStream,
                }));

                if (participantIds.length > 0) {
                    syncCallParticipantIds(participantIds);
                }
                syncParticipantsFromPayload(data?.participants);
                syncMaxParticipants(data?.max_participants);
            })
            .listen('.CallJoinRequestCreated', (data: any) => {
                const callIdFromEvent = data?.call_id as string | undefined;
                if (!callIdFromEvent || callIdFromEvent !== stateRef.current.callId) return;
                syncPendingJoinRequests(data?.pending_requests ?? []);
            })
            .listen('.CallJoinRequestUpdated', (data: any) => {
                const callIdFromEvent = data?.call_id as string | undefined;
                if (!callIdFromEvent || callIdFromEvent !== stateRef.current.callId) return;
                syncPendingJoinRequests(data?.pending_requests ?? []);
            })
            .error((error: any) => {
                console.error('Call channel error:', error);
            });
    }, [
        createOfferTo,
        currentUser?.id,
        handleAnswer,
        handleOffer,
        handleRemoteIce,
        resetToIdle,
        syncCallParticipantIds,
        syncMaxParticipants,
        syncPendingJoinRequests,
        syncParticipantsFromPayload,
        upsertParticipant,
    ]);

    const subscribeToUserChannel = useCallback(() => {
        if (!currentUser?.id) return;
        ensureEcho();
        if (!window.Echo) return;
        if (userChannelRef.current) return;

        userChannelRef.current = window.Echo.private(`App.Models.User.${currentUser.id}`)
            .listen('.IncomingCall', async (data: any) => {
                const callId = data?.call_id as string | undefined;
                const conversationId = data?.conversation_id as string | undefined;
                const caller = data?.caller as CallPeerUser | undefined;
                const mode = (data?.mode as CallMediaMode | undefined) ?? 'video';
                const initiatorId = data?.initiator_id as string | undefined;
                const participantIds = normalizeParticipantIds(data?.participant_ids as string[] | undefined);
                const participants = normalizeParticipantSummaries(data?.participants);
                const maxParticipants = Number(data?.max_participants);

                if (!callId || !conversationId || !caller) return;

                if (stateRef.current.status !== 'idle') {
                    try {
                        await axiosInstance.post(`/api/calls/${callId}/decline`);
                    } catch {
                        // ignore
                    }
                    return;
                }

                setState((prev) => ({
                    ...prev,
                    status: 'incoming',
                    role: 'callee',
                    callId,
                    conversationId,
                    initiatorId,
                    mode,
                    peer: caller,
                    participants: participants.length > 0 ? participants : [caller],
                    maxParticipants: Number.isFinite(maxParticipants) && maxParticipants >= 2 ? maxParticipants : prev.maxParticipants,
                    callParticipantIds: participantIds,
                }));
            })
            .listen('.CallAccepted', (data: any) => {
                const callIdFromEvent = data?.call_id as string | undefined;
                const fromUserId = data?.from_user_id as string | undefined;
                if (!callIdFromEvent || callIdFromEvent !== stateRef.current.callId || !fromUserId) return;
                if (fromUserId === currentUser.id) return;

                syncCallParticipantIds((data?.participant_ids as string[] | undefined) ?? []);
                syncParticipantsFromPayload(data?.participants);
                syncMaxParticipants(data?.max_participants);

                if (stateRef.current.role === 'caller' && stateRef.current.status === 'calling') {
                    setState((prev) => ({
                        ...prev,
                        status: 'connecting',
                        connectedParticipantIds: Array.from(new Set([...prev.connectedParticipantIds, fromUserId])),
                    }));
                }
            })
            .listen('.CallDeclined', (data: any) => {
                const callIdFromEvent = data?.call_id as string | undefined;
                const fromUserId = data?.from_user_id as string | undefined;
                if (!callIdFromEvent || callIdFromEvent !== stateRef.current.callId || !fromUserId) return;
                if (fromUserId === currentUser.id) return;

                syncCallParticipantIds((data?.participant_ids as string[] | undefined) ?? []);
                syncParticipantsFromPayload(data?.participants);
                syncMaxParticipants(data?.max_participants);

                if (stateRef.current.status === 'calling' && stateRef.current.connectedParticipantIds.length === 0) {
                    resetToIdle({ toastMessage: 'Call declined' });
                }
            })
            .listen('.CallJoinRequestUpdated', (data: any) => {
                const callId = data?.call_id as string | undefined;
                const requestStatus = data?.request?.status as string | undefined;
                if (!callId || !requestStatus) return;

                if (stateRef.current.status !== 'awaiting_approval' || stateRef.current.callId !== callId) {
                    return;
                }

                if (requestStatus === 'approved') {
                    fetchActiveCallSnapshot()
                        .then((call) => {
                            if (!call) return;
                            const activeCallId = (call?.id as string | undefined) || (call?.call_id as string | undefined);
                            if (!activeCallId || activeCallId !== callId) return;
                            return restoreFromCallSnapshot(call);
                        })
                        .catch(() => {
                            // ignore; IncomingCall will also arrive on approval
                        });
                    return;
                }

                if (requestStatus === 'rejected' || requestStatus === 'expired') {
                    const toastMessage = requestStatus === 'expired'
                        ? 'Join request expired'
                        : 'Join request was rejected';
                    resetToIdle({ toastMessage });
                }
            })
            .error((error: any) => {
                console.error('User channel error:', error);
            });
    }, [
        currentUser?.id,
        ensureEcho,
        fetchActiveCallSnapshot,
        normalizeParticipantIds,
        normalizeParticipantSummaries,
        resetToIdle,
        syncCallParticipantIds,
        syncMaxParticipants,
        syncParticipantsFromPayload,
        restoreFromCallSnapshot,
    ]);

    useEffect(() => {
        hasAttemptedInitialRestoreRef.current = false;
    }, [currentUser?.id]);

    useEffect(() => {
        if (state.status === 'incoming') {
            startIncomingRingtone();
            return;
        }
        if (state.status === 'calling' && state.role === 'caller') {
            startOutgoingRingback();
            return;
        }
        stopAllRinging();
    }, [state.role, state.status]);

    useEffect(() => () => {
        stopAllRinging();
    }, []);

    useEffect(() => {
        if (!currentUser?.id) {
            leaveUserChannel();
            resetToIdle();
            return;
        }

        subscribeToUserChannel();

        return () => {
            leaveUserChannel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id]);

    useEffect(() => {
        if (!currentUser?.id) return;
        if (hasAttemptedInitialRestoreRef.current) return;
        if (state.status !== 'idle') return;

        const query = new URLSearchParams(window.location.search);
        if (query.get('call_id') || query.get('call')) {
            hasAttemptedInitialRestoreRef.current = true;
            return;
        }

        hasAttemptedInitialRestoreRef.current = true;
        fetchActiveCallSnapshot()
            .then((call) => {
                if (!call || stateRef.current.status !== 'idle') return;
                restoreFromCallSnapshot(call).catch(() => {
                    // ignore
                });
            })
            .catch(() => {
                // ignore
            });
    }, [currentUser?.id, fetchActiveCallSnapshot, restoreFromCallSnapshot, state.status]);

    useEffect(() => {
        if (state.callId) {
            ensureEcho();
            subscribeToCallChannel(state.callId);
        } else {
            leaveCallChannel(state.callId);
        }
    }, [ensureEcho, leaveCallChannel, state.callId, subscribeToCallChannel]);

    useEffect(() => {
        stopHeartbeat();
        if (!state.callId) return;
        if (!['connecting', 'reconnecting', 'in_call'].includes(state.status)) return;

        const sendHeartbeat = async () => {
            try {
                await axiosInstance.post(`/api/calls/${state.callId}/heartbeat`);
            } catch (err: any) {
                const status = err?.response?.status as number | undefined;
                if (status === 404 || status === 409) {
                    resetToIdle({ toastMessage: 'Call ended' });
                }
            }
        };

        heartbeatTimerRef.current = window.setInterval(() => {
            sendHeartbeat().catch(() => {
                // ignore
            });
        }, HEARTBEAT_INTERVAL_MS);

        sendHeartbeat().catch(() => {
            // ignore
        });

        return () => {
            stopHeartbeat();
        };
    }, [resetToIdle, state.callId, state.status, stopHeartbeat]);

    useEffect(() => () => {
        stopHeartbeat();
        clearIceQueue();
    }, [clearIceQueue, stopHeartbeat]);

    const fetchPendingJoinRequests = useCallback(async (callId: string) => {
        try {
            const response = await axiosInstance.get(`/api/calls/${callId}/join-requests`);
            const requests = response?.data?.requests ?? response?.data?.data?.requests ?? [];
            syncPendingJoinRequests(requests);
        } catch (err: any) {
            const status = err?.response?.status as number | undefined;
            if (status === 403 || status === 404) {
                syncPendingJoinRequests([]);
            }
        }
    }, [syncPendingJoinRequests]);

    useEffect(() => {
        const shouldFetch = Boolean(state.callId)
            && state.role === 'caller'
            && ['calling', 'connecting', 'reconnecting', 'in_call'].includes(state.status);

        if (!shouldFetch || !state.callId) {
            syncPendingJoinRequests([]);
            return;
        }

        fetchPendingJoinRequests(state.callId).catch(() => {
            // ignore
        });
    }, [fetchPendingJoinRequests, state.callId, state.role, state.status, syncPendingJoinRequests]);

    const startCall = useCallback(async (conversationId: string, mode: CallMediaMode = 'video') => {
        if (!conversationId || !currentUser?.id) return;

        setState((prev) => {
            if (prev.status !== 'idle') return prev;
            return {
                ...prev,
                status: 'calling',
                role: 'caller',
                conversationId,
                mode,
                isCameraEnabled: mode === 'video',
            };
        });

        try {
            await ensureLocalStream(mode);
            const response = await axiosInstance.post(`/api/conversations/${conversationId}/calls`, {
                mode,
                max_participants: Math.max(2, stateRef.current.maxParticipants || 8),
            });
            const callId = response?.data?.call_id as string | undefined;
            const callee = response?.data?.callee as CallPeerUser | undefined;
            const participantIds = normalizeParticipantIds((response?.data?.participant_ids as string[] | undefined) ?? []);
            const participantSummaries = normalizeParticipantSummaries(response?.data?.participants);
            const initiatorId = (response?.data?.initiator_id as string | undefined) ?? currentUser.id;
            const maxParticipants = Number(response?.data?.max_participants);
            if (!callId) {
                throw new Error('Invalid call response');
            }

            setState((prev) => ({
                ...prev,
                status: 'calling',
                role: 'caller',
                callId,
                conversationId,
                initiatorId,
                mode,
                peer: callee,
                participants: participantSummaries,
                callParticipantIds: participantIds,
                connectedParticipantIds: participantIds.filter((id) => id !== currentUser.id),
                maxParticipants: Number.isFinite(maxParticipants) && maxParticipants >= 2 ? maxParticipants : prev.maxParticipants,
            }));

            if (callee) upsertParticipant(callee);
        } catch (err: any) {
            const status = err?.response?.status as number | undefined;
            if (status === 409) {
                try {
                    const activeCall = await fetchActiveCallSnapshot();
                    if (activeCall) {
                        await restoreFromCallSnapshot(activeCall);
                        toast('Already in a call. Rejoined active call.');
                        return;
                    }
                } catch {
                    // ignore
                }
            }

            const message = resolveMediaErrorMessage(err, mode, 'Failed to start call');
            toast(message);
            resetToIdle();
        }
    }, [
        currentUser?.id,
        ensureLocalStream,
        fetchActiveCallSnapshot,
        normalizeParticipantIds,
        normalizeParticipantSummaries,
        resetToIdle,
        restoreFromCallSnapshot,
        upsertParticipant,
    ]);

    const joinCallById = useCallback(async (callId: string) => {
        if (!currentUser?.id || !callId) return;
        try {
            const response = await axiosInstance.get(`/api/calls/${callId}`);
            const call = response?.data?.data ?? response?.data;
            const conversationId = call?.conversation_id as string | undefined;
            const mode = (call?.mode as CallMediaMode | undefined) ?? 'video';
            const participantIds = normalizeParticipantIds((call?.participant_ids as string[] | undefined) ?? []);
            const acceptedUserIds = normalizeParticipantIds((call?.accepted_user_ids as string[] | undefined) ?? []);
            const participantSummaries = normalizeParticipantSummaries(call?.participants);
            const maxParticipants = Number(call?.max_participants);
            if (!conversationId) {
                throw new Error('Call not found');
            }

            setState((prev) => ({
                ...prev,
                status: 'connecting',
                role: 'callee',
                callId,
                conversationId,
                mode,
                initiatorId: call?.initiator_id as string | undefined,
                participants: participantSummaries,
                callParticipantIds: participantIds,
                maxParticipants: Number.isFinite(maxParticipants) && maxParticipants >= 2 ? maxParticipants : prev.maxParticipants,
            }));

            await ensureLocalStream(mode);
            const acceptResponse = await axiosInstance.post(`/api/calls/${callId}/accept`);
            const responseParticipantIds = normalizeParticipantIds(
                (acceptResponse?.data?.participant_ids as string[] | undefined) ?? participantIds,
            );
            const responseAcceptedUserIds = normalizeParticipantIds(
                (acceptResponse?.data?.accepted_user_ids as string[] | undefined) ?? acceptedUserIds,
            );

            syncCallParticipantIds(responseParticipantIds);
            syncParticipantsFromPayload(acceptResponse?.data?.participants);
            syncMaxParticipants(acceptResponse?.data?.max_participants);
            setState((prev) => ({
                ...prev,
                status: 'reconnecting',
                connectedParticipantIds: responseAcceptedUserIds.filter((id) => id !== currentUser.id),
            }));

            const remoteAcceptedUserIds = responseAcceptedUserIds.filter((id) => id !== currentUser.id);
            for (const remoteUserId of remoteAcceptedUserIds) {
                createOfferTo(remoteUserId, { iceRestart: true }).catch(() => {
                    // ignore
                });
            }
        } catch (err: any) {
            const status = err?.response?.status as number | undefined;
            if (status === 403) {
                const params = new URLSearchParams(window.location.search);
                const joinToken = params.get('join_token');
                if (joinToken) {
                    try {
                        await axiosInstance.post(`/api/calls/${callId}/join-requests`, { join_token: joinToken });
                        setState((prev) => ({
                            ...prev,
                            status: 'awaiting_approval',
                            role: 'callee',
                            callId,
                        }));
                        toast('Join request sent. Waiting for host approval.');
                        return;
                    } catch (requestErr: any) {
                        toast(requestErr?.response?.data?.message ?? 'Unable to request join');
                        resetToIdle();
                        return;
                    }
                }
            }
            const message = resolveMediaErrorMessage(err, mode, 'Unable to join call');
            toast(message);
            resetToIdle();
        }
    }, [
        createOfferTo,
        currentUser?.id,
        ensureLocalStream,
        normalizeParticipantIds,
        normalizeParticipantSummaries,
        resetToIdle,
        syncCallParticipantIds,
        syncMaxParticipants,
        syncParticipantsFromPayload,
    ]);

    const inviteToCall = useCallback(async (userId: string) => {
        if (!state.callId || !userId.trim()) return;
        try {
            const response = await axiosInstance.post(`/api/calls/${state.callId}/invite`, { user_id: userId.trim() });
            syncCallParticipantIds((response?.data?.participant_ids as string[] | undefined) ?? []);
            syncParticipantsFromPayload(response?.data?.participants);
            toast('Invite sent');
        } catch (err: any) {
            toast(err?.response?.data?.message ?? 'Failed to invite user');
        }
    }, [state.callId, syncCallParticipantIds, syncParticipantsFromPayload]);

    const kickFromCall = useCallback(async (userId: string) => {
        if (!state.callId || !userId.trim()) return;
        try {
            const response = await axiosInstance.post(`/api/calls/${state.callId}/kick`, { user_id: userId.trim() });
            syncCallParticipantIds((response?.data?.participant_ids as string[] | undefined) ?? []);
            syncParticipantsFromPayload(response?.data?.participants);
            toast('User removed from call');
        } catch (err: any) {
            toast(err?.response?.data?.message ?? 'Failed to remove user');
        }
    }, [state.callId, syncCallParticipantIds, syncParticipantsFromPayload]);

    const copyJoinLink = useCallback(async () => {
        if (!state.callId) return;
        try {
            const response = await axiosInstance.post(`/api/calls/${state.callId}/join-link`);
            const url = response?.data?.join_url as string | undefined;
            if (!url) {
                throw new Error('Invalid join link response');
            }
            await navigator.clipboard.writeText(url);
            toast('Join link copied');
        } catch (err: any) {
            const status = err?.response?.status as number | undefined;
            if (status === 403) {
                toast('Only the host can create a join link');
                return;
            }
            toast(err?.response?.data?.message ?? 'Unable to copy link');
        }
    }, [state.callId]);

    const approveJoinRequest = useCallback(async (requestId: string) => {
        if (!state.callId || !requestId) return;
        try {
            const response = await axiosInstance.post(`/api/calls/${state.callId}/join-requests/${requestId}/approve`);
            syncCallParticipantIds((response?.data?.participant_ids as string[] | undefined) ?? []);
            syncParticipantsFromPayload(response?.data?.participants);
            await fetchPendingJoinRequests(state.callId);
            toast('Join request approved');
        } catch (err: any) {
            toast(err?.response?.data?.message ?? 'Failed to approve request');
        }
    }, [fetchPendingJoinRequests, state.callId, syncCallParticipantIds, syncParticipantsFromPayload]);

    const rejectJoinRequest = useCallback(async (requestId: string) => {
        if (!state.callId || !requestId) return;
        try {
            await axiosInstance.post(`/api/calls/${state.callId}/join-requests/${requestId}/reject`);
            await fetchPendingJoinRequests(state.callId);
            toast('Join request rejected');
        } catch (err: any) {
            toast(err?.response?.data?.message ?? 'Failed to reject request');
        }
    }, [fetchPendingJoinRequests, state.callId]);

    const acceptCall = useCallback(async () => {
        if (!currentUser?.id) return;
        if (state.status !== 'incoming' || !state.callId) return;

        setState((prev) => ({ ...prev, status: 'connecting', role: 'callee' }));

        try {
            await ensureLocalStream(state.mode);
            const response = await axiosInstance.post(`/api/calls/${state.callId}/accept`);
            syncCallParticipantIds((response?.data?.participant_ids as string[] | undefined) ?? []);
            syncParticipantsFromPayload(response?.data?.participants);
            syncMaxParticipants(response?.data?.max_participants);

            const acceptedUserIds = normalizeParticipantIds(
                (response?.data?.accepted_user_ids as string[] | undefined) ?? [],
            );
            const remoteAcceptedUserIds = acceptedUserIds.filter((id) => id !== currentUser.id);

            setState((prev) => ({
                ...prev,
                status: remoteAcceptedUserIds.length > 0 ? 'connecting' : 'in_call',
                connectedParticipantIds: remoteAcceptedUserIds,
            }));

            // In group calls the newest participant must also negotiate with everyone
            // already in the call. This avoids the "third person joined but has no media"
            // case when an existing participant misses the CallAccepted broadcast.
            for (const remoteUserId of remoteAcceptedUserIds) {
                createOfferTo(remoteUserId, { iceRestart: true }).catch(() => {
                    // Existing peers may also send offers; perfect negotiation handles glare.
                });
            }
        } catch (err: any) {
            const message = resolveMediaErrorMessage(err, state.mode, 'Failed to accept call');
            toast(message);
            resetToIdle();
        }
    }, [createOfferTo, currentUser?.id, ensureLocalStream, normalizeParticipantIds, resetToIdle, state.callId, state.mode, state.status, syncCallParticipantIds, syncMaxParticipants, syncParticipantsFromPayload]);

    const declineCall = useCallback(async () => {
        if (!currentUser?.id) return;
        if (!state.callId) return;

        try {
            await axiosInstance.post(`/api/calls/${state.callId}/decline`);
        } catch {
            // ignore
        } finally {
            resetToIdle();
        }
    }, [currentUser?.id, resetToIdle, state.callId]);

    const hangup = useCallback(async () => {
        if (!currentUser?.id) return;
        if (!state.callId) {
            resetToIdle();
            return;
        }

        const isInitiator = !!state.initiatorId && state.initiatorId === currentUser.id;
        const endpoint = isInitiator ? 'end' : 'leave';

        try {
            await axiosInstance.post(`/api/calls/${state.callId}/${endpoint}`);
        } catch {
            // ignore
        } finally {
            resetToIdle();
        }
    }, [currentUser?.id, resetToIdle, state.callId, state.callParticipantIds.length, state.initiatorId, state.participants.length]);

    const toggleMic = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        setState((prev) => {
            const next = !prev.isMicEnabled;
            stream.getAudioTracks().forEach((t) => (t.enabled = next));
            return { ...prev, isMicEnabled: next };
        });
    }, []);

    const toggleCamera = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream || stateRef.current.mode === 'audio') return;
        setState((prev) => {
            const next = !prev.isCameraEnabled;
            stream.getVideoTracks().forEach((t) => (t.enabled = next));
            return { ...prev, isCameraEnabled: next };
        });
    }, []);

    const value = useMemo<CallContextValue>(() => ({
        state,
        startCall,
        joinCallById,
        inviteToCall,
        kickFromCall,
        copyJoinLink,
        approveJoinRequest,
        rejectJoinRequest,
        acceptCall,
        declineCall,
        hangup,
        toggleMic,
        toggleCamera,
    }), [acceptCall, approveJoinRequest, copyJoinLink, declineCall, hangup, inviteToCall, joinCallById, kickFromCall, rejectJoinRequest, startCall, state, toggleCamera, toggleMic]);

    return (
        <CallContext.Provider value={value}>
            {children}
        </CallContext.Provider>
    );
}

export function useCall() {
    const ctx = useContext(CallContext);
    if (!ctx) {
        throw new Error('useCall must be used within CallProvider');
    }
    return ctx;
}
