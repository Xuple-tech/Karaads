export type IceServersConfig = RTCIceServer[];
export type CallMediaMode = 'video' | 'audio';

function isLocalHostname(value: string): boolean {
    const host = value.trim().toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function normalizeIceServers(value: unknown): IceServersConfig {
    if (!Array.isArray(value)) return [];

    return value
        .filter((item): item is RTCIceServer => typeof item === 'object' && item !== null)
        .map((item) => {
            const urls = (item as RTCIceServer).urls;
            if (typeof urls === 'string') {
                return { ...item, urls: [urls] };
            }
            return item;
        })
        .filter((item) => {
            const urls = item.urls;
            if (typeof urls === 'string') return urls.trim().length > 0;
            if (Array.isArray(urls)) return urls.some((url) => typeof url === 'string' && url.trim().length > 0);
            return false;
        });
}

function hasTurnServer(iceServers: IceServersConfig): boolean {
    return iceServers.some((server) => {
        const urls = typeof server.urls === 'string' ? [server.urls] : server.urls;
        if (!Array.isArray(urls)) return false;
        return urls.some((url) => typeof url === 'string' && url.startsWith('turn'));
    });
}

export function getIceServersFromEnv(): IceServersConfig {
    const raw = (import.meta as any)?.env?.VITE_WEBRTC_ICE_SERVERS;
    if (typeof raw === 'string' && raw.trim().length > 0) {
        try {
            const parsed = JSON.parse(raw);
            const normalized = normalizeIceServers(parsed);
            if (normalized.length > 0) {
                const pageHost = typeof window !== 'undefined' ? window.location.hostname : '';
                if (pageHost && !isLocalHostname(pageHost) && !hasTurnServer(normalized)) {
                    console.warn('VITE_WEBRTC_ICE_SERVERS has no TURN entries. Calls may fail across different networks/NATs.');
                }
                return normalized;
            }
        } catch {
            console.warn('Invalid VITE_WEBRTC_ICE_SERVERS JSON. Falling back to STUN-only default.');
        }
    }

    const fallback: IceServersConfig = [{ urls: ['stun:stun.l.google.com:19302'] }];
    const pageHost = typeof window !== 'undefined' ? window.location.hostname : '';
    if (pageHost && !isLocalHostname(pageHost) && !hasTurnServer(fallback)) {
        console.warn('No TURN server configured. Calls may fail across different networks/NATs.');
    }
    return fallback;
}

export async function getLocalMedia(mode: CallMediaMode = 'video'): Promise<MediaStream> {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia is not available in this browser');
    }

    return navigator.mediaDevices.getUserMedia({
        video: mode === 'video'
            ? {
                width: { ideal: 480, max: 720 },
                height: { ideal: 360, max: 540 },
                frameRate: { ideal: 15, max: 18 },
                facingMode: 'user',
            }
            : false,
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 48000,
            sampleSize: 16,
        },
    });
}

export function stopMediaStream(stream: MediaStream | null) {
    if (!stream) return;
    for (const track of stream.getTracks()) {
        try {
            track.stop();
        } catch {
            // ignore
        }
    }
}

export function createPeerConnection(options: {
    iceServers?: IceServersConfig;
    onIceCandidate?: (candidate: RTCIceCandidate) => void;
    onTrack?: (stream: MediaStream) => void;
}) {
    const { iceServers = getIceServersFromEnv(), onIceCandidate, onTrack } = options;

    const pc = new RTCPeerConnection({ iceServers });
    const fallbackRemoteStream = new MediaStream();

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            onIceCandidate?.(event.candidate);
        }
    };

    pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (stream) {
            onTrack?.(stream);
            return;
        }

        // Some browsers deliver only the track. Keep those viewers connected too.
        fallbackRemoteStream.addTrack(event.track);
        onTrack?.(fallbackRemoteStream);
    };

    return pc;
}

export async function tunePeerConnectionSenders(
    pc: RTCPeerConnection,
    mode: CallMediaMode,
): Promise<void> {
    const tasks = pc.getSenders().map(async (sender) => {
        if (!sender.track || typeof sender.getParameters !== 'function' || typeof sender.setParameters !== 'function') {
            return;
        }

        const params = sender.getParameters();
        const encodings = (params.encodings && params.encodings.length > 0)
            ? params.encodings
            : [{} as RTCRtpEncodingParameters];

        if (sender.track.kind === 'audio') {
            encodings[0] = {
                ...encodings[0],
                maxBitrate: 32000,
            };
            params.encodings = encodings;
        } else if (sender.track.kind === 'video' && mode === 'video') {
            encodings[0] = {
                ...encodings[0],
                maxBitrate: 320000,
                maxFramerate: 15,
                scaleResolutionDownBy: 1,
            };
            params.encodings = encodings;
        } else {
            return;
        }

        try {
            await sender.setParameters(params);
        } catch {
            // ignore unsupported sender parameter tuning
        }
    });

    await Promise.all(tasks);
}
