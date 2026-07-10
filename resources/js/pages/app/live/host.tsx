import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getLocalMedia, stopMediaStream } from '@/lib/webrtc';
import { LiveChat } from '@/components/live-chat';
import { LiveChatSheet } from '@/components/live/live-chat-sheet';
import { LiveViewersSheet } from '@/components/live/live-viewers-sheet';
import { useLiveStream } from '@/hooks/use-live-stream';
import { useLiveKitStream } from '@/hooks/use-livekit-stream';
import { useReverbHealth } from '@/hooks/use-reverb-health';
import { ArrowLeft, Camera, Eye, Heart, MessageCircle, MonitorUp, SmilePlus, Users, Video, Square } from 'lucide-react';

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
    user?: {
        id: string;
        name: string;
        username?: string;
        avatar?: string;
    };
}

interface LiveViewerPreview {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    joined_at?: string | null;
    watch_minutes?: number;
}

const resolveAvatarUrl = (url?: string | null): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return url.startsWith('/') ? url : `/${url}`;
};

const initials = (value?: string | null): string => {
    const trimmed = (value ?? '').trim();
    if (!trimmed) return 'U';
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const formatViewerWatchTime = (viewer: { joined_at?: string | null; watch_minutes?: number }, now: number): string => {
    if (viewer.joined_at) {
        const joinedAt = new Date(viewer.joined_at).getTime();
        if (Number.isFinite(joinedAt)) {
            const minutes = Math.max(0, Math.floor((now - joinedAt) / 60000));
            if (minutes < 1) return 'Just joined';
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
        }
    }

    const minutes = Math.max(0, Math.floor(Number(viewer.watch_minutes ?? 0)));
    if (minutes < 1) return 'Just joined';
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
};

function ViewerAvatarStack({ viewers, onClick }: { viewers: LiveViewerPreview[]; onClick: () => void }) {
    const visibleViewers = viewers.slice(0, 5);
    const extraCount = Math.max(0, viewers.length - visibleViewers.length);

    return (
        <button
            type="button"
            onClick={onClick}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/32 px-2 py-1.5 text-white shadow-[0_16px_38px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
            <div className="flex -space-x-2">
                {visibleViewers.length === 0 ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-[10px] font-black text-white/70">
                        <Users className="h-4 w-4" />
                    </div>
                ) : (
                    visibleViewers.map((viewer) => {
                        const avatar = resolveAvatarUrl(viewer.avatar);
                        return (
                            <div
                                key={viewer.id}
                                className="h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-slate-800 text-[10px] font-black text-white"
                                title={viewer.name}
                            >
                                {avatar ? (
                                    <img src={avatar} alt={viewer.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        {initials(viewer.name)}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            <div className="text-left leading-tight">
                <div className="text-xs font-black">
                    {viewers.length > 0 ? `${viewers.length} joined` : 'No viewers yet'}
                    {extraCount > 0 ? ` +${extraCount}` : ''}
                </div>
                <div className="text-[10px] font-semibold text-white/65">
                    Tap to see profiles
                </div>
            </div>
        </button>
    );
}

function HostRailButton({
    label,
    onClick,
    disabled,
    active,
    danger,
    children,
}: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    active?: boolean;
    danger?: boolean;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="group flex flex-col items-center gap-1 text-white disabled:opacity-55"
        >
            <span
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/15 shadow-[0_16px_34px_rgba(0,0,0,0.35)] backdrop-blur-xl transition group-active:scale-95 ${
                    danger
                        ? 'bg-[#f02849] text-white'
                        : active
                        ? 'border-[#ff2d55]/70 bg-gradient-to-br from-[#ff2d55] to-[#ff8a00] text-white'
                          : 'bg-black/28 text-white'
                }`}
            >
                {children}
            </span>
            <span className="max-w-16 text-center text-[10px] font-black uppercase leading-tight">
                {label}
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

export default function LiveHost() {
    const { streamId } = useParams<{ streamId: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { auth } = useAuth();
    const isMobile = true;
    const [stream, setStream] = useState<LiveStream | null>(null);
    const [loading, setLoading] = useState(true);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [starting, setStarting] = useState(false);
    const [startQueued, setStartQueued] = useState(false);
    const [startQueueTick, setStartQueueTick] = useState(0);
    const [ending, setEnding] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [chatOpen, setChatOpen] = useState(false);
    const [liking, setLiking] = useState(false);
    const [viewersOpen, setViewersOpen] = useState(false);
    const [startError, setStartError] = useState<string | null>(null);
    const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
    const [sharingScreen, setSharingScreen] = useState(false);
    const [switchingSource, setSwitchingSource] = useState(false);
    const [watchTimeNow, setWatchTimeNow] = useState(() => Date.now());
    const { echoState, health } = useReverbHealth();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const uploadIdRef = useRef<string | null>(null);
    const chunkIndexRef = useRef(0);
    const pendingUploadsRef = useRef<Promise<any>[]>([]);
    const stopRecordingPromiseRef = useRef<Promise<void> | null>(null);
    const archiveFailedRef = useRef(false);
    const autoStartAttemptedRef = useRef(false);
    const startRequestInFlightRef = useRef(false);
    const startQueuedAtRef = useRef(0);

    const livekit = useLiveKitStream({
        streamId: streamId || '',
        role: 'host',
        localStream,
        enabled: Boolean(localStream && (stream?.status === 'live' || startQueued)),
    });
    const p2pEnabled = stream?.status === 'live' && (livekit.status === 'disabled' || livekit.status === 'failed');
    const { viewers, reactions, connectionState, replaceVideoTrack, sendSignal } = useLiveStream({
        streamId: streamId || '',
        role: 'host',
        currentUserId: auth?.user?.id || '',
        localStream,
        enabled: p2pEnabled,
    });
    const audienceViewers = viewers.filter((viewer) => viewer.id !== auth?.user?.id);
    const audienceCount = Math.max(Number(stream?.viewer_count ?? 0), audienceViewers.length, Math.max(0, livekit.participantCount - 1));
    const mediaConnectionState = livekit.connected ? 'livekit-connected' : livekit.status === 'connecting' ? 'livekit-connecting' : connectionState;

    const realtimeStatus = (() => {
        if (echoState === 'connected') {
            return { label: 'Realtime: Connected', className: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200' };
        }
        if (echoState === 'connecting' || echoState === 'unknown') {
            return { label: 'Realtime: Checking...', className: 'border-amber-500/40 bg-amber-500/15 text-amber-200' };
        }
        if (health && !health.ok) {
            return { label: 'Realtime: Offline', className: 'border-red-500/40 bg-red-500/15 text-red-200' };
        }
        return { label: 'Realtime: Offline', className: 'border-red-500/40 bg-red-500/15 text-red-200' };
    })();

    const fetchStream = useCallback(async () => {
        if (!streamId) return;
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(`/api/live/streams/${streamId}`);
            const payload = data?.data ?? data;
            setStream(payload);
        } finally {
            setLoading(false);
        }
    }, [streamId]);

    useEffect(() => {
        fetchStream().catch(() => {});
    }, [fetchStream]);

    useEffect(() => {
        if (!stream?.status || stream.status !== 'live') return;
        const interval = setInterval(() => {
            axiosInstance
                .post(`/api/live/streams/${stream.id}/heartbeat`, {
                    viewer_count: audienceCount,
                    connection_state: mediaConnectionState,
                    quality: audienceCount > 25 ? 'large-room' : 'standard',
                })
                .then(({ data }) => {
                    const payload = data?.data ?? data;
                    if (payload?.id) {
                        setStream(payload);
                    }
                })
                .catch(() => {});
        }, 10000);
        return () => clearInterval(interval);
    }, [audienceCount, mediaConnectionState, stream?.id, stream?.status]);

    useEffect(() => {
        if (stream?.status !== 'live') return;
        const interval = window.setInterval(() => setWatchTimeNow(Date.now()), 60000);
        return () => window.clearInterval(interval);
    }, [stream?.status]);

    const bindLocalVideo = useCallback((node: HTMLVideoElement | null) => {
        if (!node) return;
        if (node.srcObject !== localStream) {
            node.srcObject = localStream;
        }
    }, [localStream]);

    const showLiveError = useCallback((message: string) => {
        setStartError(message);
        window.setTimeout(() => {
            setStartError((current) => (current === message ? null : current));
        }, 5000);
    }, []);

    const replaceLocalVideoTrack = useCallback(async (track: MediaStreamTrack, nextSharingScreen: boolean) => {
        if (!localStream) return;

        const previousVideoTracks = localStream.getVideoTracks();
        previousVideoTracks.forEach((videoTrack) => {
            localStream.removeTrack(videoTrack);
            try {
                videoTrack.onended = null;
                videoTrack.stop();
            } catch {
                // ignore
            }
        });

        localStream.addTrack(track);
        await replaceVideoTrack(track);
        setLocalStream(new MediaStream(localStream.getTracks()));
        setSharingScreen(nextSharingScreen);
    }, [localStream, replaceVideoTrack]);

    const getCameraStream = useCallback(async (facingMode: 'user' | 'environment') => {
        const baseVideo = {
            width: { ideal: 480, max: 720 },
            height: { ideal: 360, max: 540 },
            frameRate: { ideal: 15, max: 18 },
        };

        try {
            return await navigator.mediaDevices.getUserMedia({
                video: {
                    ...baseVideo,
                    facingMode: { ideal: facingMode },
                },
                audio: false,
            });
        } catch (error) {
            const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
            const cameras = devices.filter((device) => device.kind === 'videoinput');
            const currentDeviceId = localStream?.getVideoTracks()[0]?.getSettings?.().deviceId;
            const nextCamera = cameras.find((camera) => camera.deviceId && camera.deviceId !== currentDeviceId) ?? cameras[0];

            if (!nextCamera?.deviceId) {
                throw error;
            }

            return navigator.mediaDevices.getUserMedia({
                video: {
                    ...baseVideo,
                    deviceId: { exact: nextCamera.deviceId },
                },
                audio: false,
            });
        }
    }, [localStream]);

    const switchCamera = useCallback(async () => {
        if (!localStream || switchingSource) return;
        setSwitchingSource(true);
        setStartError(null);
        const nextFacingMode = cameraFacingMode === 'user' ? 'environment' : 'user';

        try {
            const cameraStream = await getCameraStream(nextFacingMode);
            const [track] = cameraStream.getVideoTracks();
            if (!track) {
                throw new Error('No camera video track available.');
            }

            await replaceLocalVideoTrack(track, false);
            setCameraFacingMode(nextFacingMode);
        } catch {
            showLiveError('Unable to switch camera on this device. Please allow camera permission and try again.');
        } finally {
            setSwitchingSource(false);
        }
    }, [cameraFacingMode, getCameraStream, localStream, replaceLocalVideoTrack, showLiveError, switchingSource]);

    const stopScreenShare = useCallback(async () => {
        if (!localStream || switchingSource) return;
        setSwitchingSource(true);
        setStartError(null);

        try {
            const cameraStream = await getCameraStream(cameraFacingMode);
            const [track] = cameraStream.getVideoTracks();
            if (!track) {
                throw new Error('No camera video track available.');
            }

            await replaceLocalVideoTrack(track, false);
        } catch {
            showLiveError('Unable to return to camera. Please restart the live if the preview stays blank.');
        } finally {
            setSwitchingSource(false);
        }
    }, [cameraFacingMode, getCameraStream, localStream, replaceLocalVideoTrack, showLiveError, switchingSource]);

    const toggleScreenShare = useCallback(async () => {
        if (!localStream || switchingSource) return;

        if (sharingScreen) {
            await stopScreenShare();
            return;
        }

        if (!navigator.mediaDevices?.getDisplayMedia) {
            showLiveError('Screen sharing is not supported in this browser. Try Chrome or Edge on desktop.');
            return;
        }

        setSwitchingSource(true);
        setStartError(null);

        try {
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            });
            const [track] = displayStream.getVideoTracks();
            if (!track) {
                throw new Error('No screen video track available.');
            }

            track.onended = () => {
                stopScreenShare().catch(() => {});
            };

            await replaceLocalVideoTrack(track, true);
        } catch (error: any) {
            if (error?.name !== 'NotAllowedError') {
                showLiveError('Unable to start screen sharing. Please choose a screen/window and allow sharing.');
            }
        } finally {
            setSwitchingSource(false);
        }
    }, [localStream, replaceLocalVideoTrack, sharingScreen, showLiveError, stopScreenShare, switchingSource]);

    const sendReaction = useCallback((value: string) => {
        if (!auth?.user?.id) return;
        sendSignal({ type: 'reaction', from: auth.user.id, reaction: value });
    }, [auth?.user?.id, sendSignal]);

    const initArchive = useCallback(async (mimeType?: string) => {
        if (!streamId) return null;
        const { data } = await axiosInstance.post(
            `/api/live/streams/${streamId}/archive/init`,
            { mime_type: mimeType || 'video/webm' },
        );
        uploadIdRef.current = data.upload_id;
        chunkIndexRef.current = 0;
        pendingUploadsRef.current = [];
        archiveFailedRef.current = false;
        setUploadProgress(0);
        return data.upload_id as string;
    }, [streamId]);

    const uploadChunk = useCallback(
        (index: number, blob: Blob) => {
            if (!streamId || !uploadIdRef.current) return Promise.resolve();
            const formData = new FormData();
            formData.append('upload_id', uploadIdRef.current);
            formData.append('chunk_index', String(index));
            formData.append('total_chunks', String(index + 1));
            const extension = (blob.type || '').includes('mp4') ? 'mp4' : 'webm';
            formData.append(
                'chunk',
                new File([blob], `chunk-${index}.${extension}`, {
                    type: blob.type || 'video/webm',
                }),
            );
            const request = axiosInstance.post(
                `/api/live/streams/${streamId}/archive/chunk`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            ).catch((error) => {
                archiveFailedRef.current = true;
                throw error;
            });
            pendingUploadsRef.current.push(request);
            setUploadProgress((prev) => Math.min(95, prev + 5));
            return request;
        },
        [streamId],
    );

    const finalizeArchive = useCallback(async () => {
        if (!streamId || !uploadIdRef.current) return;
        try {
            setUploading(true);
            await new Promise((resolve) => window.setTimeout(resolve, 250));
            const uploads = await Promise.allSettled(pendingUploadsRef.current);
            const failedUploads = uploads.filter((result) => result.status === 'rejected').length;
            if (failedUploads > 0 || archiveFailedRef.current) {
                throw new Error('Some live video chunks failed to upload. Please check your connection before ending the live.');
            }
            if (chunkIndexRef.current < 1) {
                throw new Error('No live video was recorded. Keep the live open for a few seconds before ending it.');
            }
            await axiosInstance.post(`/api/live/streams/${streamId}/archive/complete`, {
                upload_id: uploadIdRef.current,
                total_chunks: chunkIndexRef.current,
            });
            setUploadProgress(100);
        } catch (error: any) {
            showLiveError(error?.response?.data?.message || error?.message || 'Unable to save this live as a video.');
            throw error;
        } finally {
            setUploading(false);
        }
    }, [showLiveError, streamId]);

    const startRecording = useCallback(async (streamToRecord?: MediaStream | null) => {
        const stream = streamToRecord ?? localStream;
        if (!stream) return;
        if (typeof MediaRecorder === 'undefined') {
            showLiveError('Live recording is not supported in this browser. Try Chrome, Edge, or Safari 17+.');
            return;
        }
        const mimeType = [
            'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
            'video/mp4;codecs=h264,aac',
            'video/mp4',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=vp9,opus',
            'video/webm',
        ].find((type) => MediaRecorder.isTypeSupported(type));

        const uploadId = await initArchive(mimeType);
        if (!uploadId) return;

        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

        recorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                const index = chunkIndexRef.current++;
                uploadChunk(index, event.data).catch(() => {});
            }
        };

        recorder.onerror = () => {
            archiveFailedRef.current = true;
            showLiveError('Live recording stopped unexpectedly. The live can continue, but the replay video may not save.');
        };

        recorder.onstop = () => {
            finalizeArchive().catch(() => {});
        };

        recorder.start(2000);
        mediaRecorderRef.current = recorder;
    }, [finalizeArchive, initArchive, localStream, showLiveError, uploadChunk]);

    const stopRecording = useCallback(async () => {
        const recorder = mediaRecorderRef.current;
        if (!recorder) {
            return stopRecordingPromiseRef.current ?? Promise.resolve();
        }

        if (stopRecordingPromiseRef.current) {
            return stopRecordingPromiseRef.current;
        }

        stopRecordingPromiseRef.current = new Promise<void>((resolve) => {
            recorder.onstop = async () => {
                try {
                    await finalizeArchive();
                    await Promise.allSettled(pendingUploadsRef.current);
                } catch {
                    // finalizeArchive already shows the user-facing error.
                } finally {
                    mediaRecorderRef.current = null;
                    stopRecordingPromiseRef.current = null;
                    resolve();
                }
            };

            try {
                if (recorder.state === 'recording') {
                    recorder.requestData();
                    recorder.stop();
                } else {
                    mediaRecorderRef.current = null;
                    stopRecordingPromiseRef.current = null;
                    resolve();
                }
            } catch {
                mediaRecorderRef.current = null;
                stopRecordingPromiseRef.current = null;
                resolve();
            }
        });

        return stopRecordingPromiseRef.current;
    }, [finalizeArchive]);

    useEffect(() => {
        if (!startQueued || !streamId || !localStream || startRequestInFlightRef.current) return;

        const elapsedMs = Date.now() - startQueuedAtRef.current;
        const livekitReady = livekit.connected || livekit.status === 'failed' || livekit.status === 'disabled';
        const waitedLongEnough = elapsedMs >= 500;

        if (!livekitReady && !waitedLongEnough) {
            const timer = window.setTimeout(() => setStartQueueTick((value) => value + 1), 150);
            return () => window.clearTimeout(timer);
        }

        startRequestInFlightRef.current = true;
        axiosInstance.post(`/api/live/streams/${streamId}/start`)
            .then(async ({ data }) => {
                setStream(data?.data ?? data);
                await startRecording(localStream);
            })
            .catch((error: any) => {
                setStartError(
                    error?.response?.data?.message ||
                    'Unable to start the live stream. Please check your camera and internet connection.',
                );
            })
            .finally(() => {
                startRequestInFlightRef.current = false;
                setStartQueued(false);
                setStarting(false);
            });
    }, [livekit.connected, livekit.status, localStream, startQueueTick, startQueued, startRecording, streamId]);

    const handleStart = async () => {
        if (!streamId || starting) return;
        setStarting(true);
        setStartError(null);
        try {
            const streamMedia = await getLocalMedia('video');
            setLocalStream(streamMedia);
            startQueuedAtRef.current = Date.now();
            setStartQueueTick((value) => value + 1);
            setStartQueued(true);
        } catch (error: any) {
            setStartError(
                error?.message?.includes('getUserMedia') || error?.name === 'NotAllowedError'
                    ? 'Camera or microphone permission is required before you can go live.'
                    : 'Unable to start the live stream. Please check your camera and internet connection.',
            );
            setStarting(false);
        } finally {
        }
    };

    useEffect(() => {
        if (autoStartAttemptedRef.current) return;
        if (searchParams.get('autostart') !== '1') return;
        if (!stream || stream.status === 'live') return;

        autoStartAttemptedRef.current = true;
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('autostart');
        setSearchParams(nextParams, { replace: true });
        handleStart();
    }, [handleStart, searchParams, setSearchParams, stream]);

    const handleEnd = async () => {
        if (!streamId || ending) return;
        if (!window.confirm('End this live stream now? Viewers will stop seeing the live video.')) return;
        setEnding(true);
        try {
            await stopRecording();
            await axiosInstance.post(`/api/live/streams/${streamId}/end`);
            stopMediaStream(localStream);
            setLocalStream(null);
            await fetchStream();
        } finally {
            setEnding(false);
        }
    };

    const handleLike = useCallback(async () => {
        if (!stream?.id || liking) return;
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
    }, [liking, stream]);

    useEffect(() => {
        return () => {
            stopRecording();
            stopMediaStream(localStream);
        };
    }, [localStream, stopRecording]);

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

    if (isMobile) {
        return (
            <div className="relative min-h-[100svh] overflow-hidden bg-[#05070d] text-white">
                <div className="absolute inset-0">
                    <video
                        ref={bindLocalVideo}
                        autoPlay
                        muted
                        playsInline
                    className="h-full w-full bg-black object-contain transition duration-500"
                />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.12),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.04)_32%,rgba(0,0,0,0.38)_58%,rgba(0,0,0,0.9)_100%)]" />
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
                    <button
                        type="button"
                        onClick={() => setViewersOpen(true)}
                        className="inline-flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/15 bg-black/28 px-2 py-1.5 shadow-lg backdrop-blur-xl"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#ff2d55] to-[#ff8a00] text-[10px] font-black uppercase text-white">
                            Live
                        </span>
                        <span className="min-w-0 text-left">
                            <span className="block truncate text-xs font-black">{auth?.user?.name ?? 'You'}</span>
                            <span className="block truncate text-[10px] font-semibold text-white/65">{stream.status === 'live' ? 'You are live now' : 'Ready to go live'}</span>
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewersOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/28 px-3 py-2 text-[11px] font-black text-white shadow-lg backdrop-blur-xl"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        {audienceCount}
                    </button>
                </div>

                {uploading ? (
                    <div className="absolute left-1/2 top-[calc(72px+env(safe-area-inset-top))] z-40 -translate-x-1/2 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[10px] font-black text-white shadow-lg backdrop-blur-xl">
                        Uploading replay {uploadProgress}%
                    </div>
                ) : null}

                {!localStream && stream.status !== 'live' ? (
                    <div className="absolute inset-0 flex items-center justify-center px-6">
                        <div className="live-glass rounded-2xl px-4 py-3 text-center text-sm text-white/80">
                            {startError || 'Camera preview will appear once you start the live.'}
                        </div>
                    </div>
                ) : null}

                {startError && (localStream || stream.status === 'live') ? (
                    <div className="absolute left-4 right-4 top-24 z-40 rounded-2xl border border-red-300/25 bg-red-500/18 px-4 py-3 text-sm font-semibold text-red-50 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
                        {startError}
                    </div>
                ) : null}

                <FloatingReactions reactions={reactions} />

                <div className="absolute left-3 top-[calc(72px+env(safe-area-inset-top))] z-30">
                    <ViewerAvatarStack viewers={audienceViewers} onClick={() => setViewersOpen(true)} />
                </div>

                <div className="absolute bottom-[calc(112px+env(safe-area-inset-bottom))] right-3 z-40 flex flex-col items-center gap-2.5">
                    <HostRailButton
                        label={stream.status === 'live' ? 'End' : 'Go live'}
                        onClick={stream.status === 'live' ? handleEnd : handleStart}
                        disabled={stream.status === 'live' ? ending : starting}
                        danger={stream.status === 'live'}
                        active={stream.status !== 'live'}
                    >
                        {stream.status === 'live' ? <Square className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                    </HostRailButton>
                    <HostRailButton
                        label="Camera"
                        onClick={switchCamera}
                        disabled={stream.status !== 'live' || switchingSource || !localStream}
                    >
                        <Camera className="h-6 w-6" />
                    </HostRailButton>
                    <HostRailButton
                        label={sharingScreen ? 'Camera' : 'Screen'}
                        onClick={toggleScreenShare}
                        disabled={stream.status !== 'live' || switchingSource || !localStream}
                        active={sharingScreen}
                    >
                        <MonitorUp className="h-6 w-6" />
                    </HostRailButton>
                    <HostRailButton
                        label={`${(stream.likes_count ?? 0).toLocaleString()} likes`}
                        onClick={handleLike}
                        disabled={liking || stream.status !== 'live'}
                        active={Boolean(stream.user_liked)}
                    >
                        <Heart className={`h-6 w-6 ${stream.user_liked ? 'fill-current text-[#ff2d55]' : ''}`} />
                    </HostRailButton>
                    <HostRailButton label="Emoji" onClick={() => sendReaction('🔥')}>
                        <SmilePlus className="h-6 w-6" />
                    </HostRailButton>
                    <HostRailButton label="Chat" onClick={() => setChatOpen(true)}>
                        <MessageCircle className="h-6 w-6" />
                    </HostRailButton>
                    <HostRailButton label="Viewers" onClick={() => setViewersOpen(true)}>
                        <Users className="h-6 w-6" />
                    </HostRailButton>
                </div>

                {stream.status === 'live' ? (
                    <div className="absolute bottom-[calc(108px+env(safe-area-inset-bottom))] left-3 right-20 z-30 max-h-[26vh]">
                        <LiveChat
                            streamId={stream.id}
                            currentUserId={auth?.user?.id}
                            canModerate
                            variant="floating"
                            showHeader={false}
                            compact
                            className="h-full max-h-[26vh]"
                        />
                    </div>
                ) : null}

                <div className="absolute bottom-[calc(14px+env(safe-area-inset-bottom))] left-3 right-20 z-40">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/32 px-3 py-1.5 text-xs font-black text-white shadow-[0_16px_38px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                        <span className={`h-2.5 w-2.5 rounded-full ${stream.status === 'live' ? 'bg-[#f02849]' : 'bg-white/50'}`} />
                        {stream.status === 'live' ? 'You are live' : 'Ready to go live'}
                    </div>
                    <p className="mt-2 line-clamp-1 text-base font-black drop-shadow-[0_3px_18px_rgba(0,0,0,0.8)]">
                        {stream.title}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/70">
                        {audienceCount} watching · {(stream.likes_count ?? 0).toLocaleString()} likes
                    </p>
                    <button
                        type="button"
                        onClick={() => setChatOpen(true)}
                        className="mt-2 flex h-10 w-full max-w-[360px] items-center rounded-full border border-white/15 bg-white/12 px-4 text-left text-sm font-semibold text-white/78 shadow-lg backdrop-blur-xl"
                    >
                        Comment with viewers...
                    </button>
                </div>

                {stream.status === 'live' ? (
                    <div className="absolute bottom-[calc(64px+env(safe-area-inset-bottom))] left-3 z-40 flex gap-2">
                        {['❤️', '😂', '🔥', '👏'].map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => sendReaction(emoji)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/32 text-base shadow-lg backdrop-blur-xl active:scale-95"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                ) : null}

                <LiveChatSheet
                    open={chatOpen}
                    onOpenChange={setChatOpen}
                    streamId={stream.id}
                    currentUserId={auth?.user?.id}
                    canModerate
                />
                <LiveViewersSheet
                    open={viewersOpen}
                    onOpenChange={setViewersOpen}
                    viewers={audienceViewers}
                />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 text-white">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">{stream.title}</h1>
                    <p className="text-sm text-white/60">
                        Host dashboard - Viewers {audienceCount} - Likes {(stream.likes_count ?? 0).toLocaleString()}
                    </p>
                    <span className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${realtimeStatus.className}`}>
                        {realtimeStatus.label}
                    </span>
                    <span className="ml-2 mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70">
                        Stream health: {stream.health_status ?? 'unknown'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate('/live')}>
                        Back to Live
                    </Button>
                    {stream.status !== 'live' ? (
                        <Button onClick={handleStart} disabled={starting}>
                            Start Live
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={switchCamera} disabled={switchingSource || !localStream}>
                                Switch Camera
                            </Button>
                            <Button variant={sharingScreen ? 'default' : 'outline'} onClick={toggleScreenShare} disabled={switchingSource || !localStream}>
                                {sharingScreen ? 'Stop Share' : 'Share Screen'}
                            </Button>
                            <Button variant={stream.user_liked ? 'default' : 'outline'} onClick={handleLike} disabled={liking}>
                                {stream.user_liked ? 'Liked' : 'Like'} {(stream.likes_count ?? 0).toLocaleString()}
                            </Button>
                            <Button variant="destructive" onClick={handleEnd} disabled={ending}>
                                End Live
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="live-surface p-4">
                    <div className="relative aspect-video overflow-hidden rounded-2xl bg-black/70">
                        <video
                            ref={bindLocalVideo}
                            autoPlay
                            muted
                            playsInline
                            className="h-full w-full bg-black object-contain"
                        />
                        <div className="absolute left-4 top-4">
                            <ViewerAvatarStack viewers={audienceViewers} onClick={() => setViewersOpen(true)} />
                        </div>
                    </div>
                    {!localStream ? (
                        <p className="mt-3 text-xs text-white/60">
                            {startError || 'Camera preview will appear once you start the live.'}
                        </p>
                    ) : null}
                    <div className="mt-4 text-sm text-white/60">
                        Status: {stream.status}
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-white/70 sm:grid-cols-4">
                        <div className="rounded-xl bg-white/5 p-3">
                            <div className="text-white/45">Peak viewers</div>
                            <div className="mt-1 text-lg font-black text-white">{Math.max(Number(stream.peak_viewer_count ?? 0), audienceCount)}</div>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3">
                            <div className="text-white/45">Reactions</div>
                            <div className="mt-1 text-lg font-black text-white">{(stream.reaction_count ?? 0).toLocaleString()}</div>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3">
                            <div className="text-white/45">Shares</div>
                            <div className="mt-1 text-lg font-black text-white">{(stream.share_count ?? 0).toLocaleString()}</div>
                        </div>
                        <div className="rounded-xl bg-white/5 p-3">
                            <div className="text-white/45">Connection</div>
                            <div className="mt-1 text-lg font-black text-white">{mediaConnectionState}</div>
                        </div>
                    </div>
                    {uploading ? (
                        <div className="mt-2 text-xs text-white/60">
                            Uploading archive... {uploadProgress}%
                        </div>
                    ) : null}
                    {startError ? (
                        <div className="mt-2 text-xs text-red-200">
                            {startError}
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-col gap-6">
                    <LiveChat
                        streamId={stream.id}
                        currentUserId={auth?.user?.id}
                        canModerate
                        variant="panel"
                        className="h-[360px] lg:h-[420px]"
                    />
                    <div className="live-surface p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold">People who joined</div>
                                <div className="text-xs text-white/45">Profile pictures and watch time update live.</div>
                            </div>
                            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-white/80">
                                {audienceCount}
                            </span>
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-white/70">
                            {audienceViewers.length === 0 ? (
                                <div>No viewers yet.</div>
                            ) : (
                                audienceViewers.map((viewer) => (
                                    <div key={viewer.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/15 bg-white/10 text-xs font-black text-white">
                                                {resolveAvatarUrl(viewer.avatar) ? (
                                                    <img
                                                        src={resolveAvatarUrl(viewer.avatar)}
                                                        alt={viewer.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        {initials(viewer.name)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                            <div className="truncate font-medium text-white">
                                                {viewer.name}
                                            </div>
                                            {viewer.username ? (
                                                <div className="truncate text-xs text-white/50">
                                                    @{viewer.username}
                                                </div>
                                            ) : null}
                                            </div>
                                        </div>
                                        <div className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                                            {formatViewerWatchTime(viewer, watchTimeNow)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
