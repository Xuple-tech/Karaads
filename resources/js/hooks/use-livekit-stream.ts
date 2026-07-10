import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';
import axiosInstance from '@/lib/axios';

type LiveKitRole = 'host' | 'viewer';
type LiveKitStatus = 'idle' | 'disabled' | 'connecting' | 'connected' | 'failed';
const LIVEKIT_CONNECT_TIMEOUT_MS = 4500;

interface UseLiveKitStreamOptions {
    streamId: string;
    role: LiveKitRole;
    enabled?: boolean;
    localStream?: MediaStream | null;
}

interface LiveKitTokenResponse {
    enabled?: boolean;
    url?: string;
    token?: string;
    room?: string;
    role?: LiveKitRole;
    message?: string;
}

export function useLiveKitStream({
    streamId,
    role,
    enabled = true,
    localStream = null,
}: UseLiveKitStreamOptions) {
    const roomRef = useRef<Room | null>(null);
    const publishedTrackIdsRef = useRef<Set<string>>(new Set());
    const sessionIdRef = useRef(
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID().replace(/-/g, '').slice(0, 24)
            : Math.random().toString(36).slice(2, 18),
    );
    const [status, setStatus] = useState<LiveKitStatus>('idle');
    const [available, setAvailable] = useState(false);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [participantCount, setParticipantCount] = useState(0);
    const [restartNonce, setRestartNonce] = useState(0);

    const canConnect = Boolean(enabled && streamId && (role === 'viewer' || localStream));
    const restart = useCallback(() => {
        setRestartNonce((value) => value + 1);
    }, []);

    useEffect(() => {
        if (!canConnect) {
            setStatus(enabled ? 'idle' : 'disabled');
            setAvailable(false);
            setRemoteStream(null);
            return;
        }

        let stopped = false;
        const room = new Room({
            adaptiveStream: role === 'viewer',
            dynacast: role === 'host',
            publishDefaults: {
                simulcast: false,
            },
        });
        const nextRemoteStream = new MediaStream();
        roomRef.current = room;
        setStatus('connecting');

        const updateParticipantCount = () => {
            if (stopped) return;
            setParticipantCount(room.remoteParticipants.size + (room.localParticipant ? 1 : 0));
        };

        const addRemoteTrack = (track: any) => {
            if (stopped) return;
            const mediaTrack = track?.mediaStreamTrack;
            if (!mediaTrack) return;

            const alreadyAdded = nextRemoteStream
                .getTracks()
                .some((item) => item.id === mediaTrack.id);
            if (!alreadyAdded) {
                nextRemoteStream.addTrack(mediaTrack);
            }
            setRemoteStream(new MediaStream(nextRemoteStream.getTracks()));
        };

        const removeRemoteTrack = (track: any) => {
            if (stopped) return;
            const mediaTrack = track?.mediaStreamTrack;
            if (!mediaTrack) return;

            nextRemoteStream.getTracks()
                .filter((item) => item.id === mediaTrack.id)
                .forEach((item) => nextRemoteStream.removeTrack(item));
            setRemoteStream(new MediaStream(nextRemoteStream.getTracks()));
        };

        const subscribeToPublication = (publication: any) => {
            if (role !== 'viewer' || !publication) return;

            try {
                if (typeof publication.setSubscribed === 'function' && !publication.isSubscribed) {
                    publication.setSubscribed(true);
                }
            } catch {
                // LiveKit auto-subscribe still handles this in normal conditions.
            }

            if (publication.track) {
                addRemoteTrack(publication.track);
            }
        };

        room
            .on(RoomEvent.Connected, () => {
                if (stopped) return;
                setStatus('connected');
                updateParticipantCount();
            })
            .on(RoomEvent.Reconnecting, () => {
                if (stopped) return;
                setStatus('connecting');
            })
            .on(RoomEvent.Reconnected, () => {
                if (stopped) return;
                setStatus('connected');
                updateParticipantCount();
            })
            .on(RoomEvent.Disconnected, () => {
                if (stopped) return;
                setStatus('idle');
                setRemoteStream(null);
                setParticipantCount(0);
            })
            .on(RoomEvent.ParticipantConnected, updateParticipantCount)
            .on(RoomEvent.ParticipantDisconnected, updateParticipantCount)
            .on(RoomEvent.TrackPublished, (publication: any) => subscribeToPublication(publication))
            .on(RoomEvent.TrackSubscribed, (track: any) => addRemoteTrack(track))
            .on(RoomEvent.TrackUnsubscribed, (track: any) => removeRemoteTrack(track));

        const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
            let timeoutId: number | undefined;
            const timeout = new Promise<never>((_, reject) => {
                timeoutId = window.setTimeout(() => reject(new Error('LiveKit connection timed out.')), timeoutMs);
            });

            try {
                return await Promise.race([promise, timeout]);
            } finally {
                if (timeoutId !== undefined) {
                    window.clearTimeout(timeoutId);
                }
            }
        };

        const connect = async () => {
            try {
                const { data } = await axiosInstance.post<LiveKitTokenResponse>(
                    `/api/live/streams/${streamId}/livekit/token`,
                    {
                        role,
                        session_id: sessionIdRef.current,
                    },
                );

                if (!data?.enabled || !data.url || !data.token) {
                    setAvailable(false);
                    setStatus('disabled');
                    return;
                }

                setAvailable(true);
                await withTimeout(
                    room.connect(data.url, data.token, {
                        autoSubscribe: role === 'viewer',
                        maxRetries: 1,
                    }),
                    LIVEKIT_CONNECT_TIMEOUT_MS,
                );
                if (stopped) return;

                if (role === 'host' && localStream) {
                    const tracks = [
                        ...localStream.getAudioTracks(),
                        ...localStream.getVideoTracks(),
                    ];

                    for (const track of tracks) {
                        if (publishedTrackIdsRef.current.has(track.id)) continue;
                        publishedTrackIdsRef.current.add(track.id);
                        await room.localParticipant.publishTrack(track, {
                            source: track.kind === 'video' ? Track.Source.Camera : Track.Source.Microphone,
                            simulcast: false,
                            videoEncoding: track.kind === 'video'
                                ? {
                                    maxBitrate: 320_000,
                                    maxFramerate: 15,
                                }
                                : undefined,
                        });
                    }
                }

                room.remoteParticipants.forEach((participant) => {
                    participant.trackPublications.forEach((publication: any) => {
                        subscribeToPublication(publication);
                    });
                });
                updateParticipantCount();
            } catch {
                try {
                    room.disconnect();
                } catch {
                    // ignore disconnect errors during failed startup
                }
                setStatus('failed');
                setAvailable(false);
            }
        };

        connect().catch(() => {
            setStatus('failed');
            setAvailable(false);
        });

        return () => {
            stopped = true;
            publishedTrackIdsRef.current.clear();
            nextRemoteStream.getTracks().forEach((track) => track.stop());
            room.disconnect();
            roomRef.current = null;
        };
    }, [canConnect, localStream, restartNonce, role, streamId]);

    const connected = status === 'connected';

    return useMemo(
        () => ({
            available,
            connected,
            participantCount,
            restart,
            remoteStream,
            status,
        }),
        [available, connected, participantCount, remoteStream, restart, status],
    );
}
