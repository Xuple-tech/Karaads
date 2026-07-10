type RingingMode = 'incoming' | 'outgoing';

const DEFAULT_RINGTONE_URL = '/sounds/ringtone.mp3';
const DEFAULT_RINGBACK_URL = '/sounds/ringback.mp3';
const DEFAULT_RING_VOLUME = 0.8;

let activeMode: RingingMode | null = null;
let activeElement: HTMLAudioElement | null = null;
let fallbackTimer: number | null = null;
let fallbackToneCleanup: (() => void) | null = null;
let audioContext: AudioContext | null = null;
let gestureHookInstalled = false;
let startSequence = 0;

function getEnvValue(key: string, fallback: string): string {
    const raw = (import.meta as any)?.env?.[key];
    return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : fallback;
}

function getRingVolume(): number {
    const raw = Number((import.meta as any)?.env?.VITE_CALL_RING_VOLUME);
    if (!Number.isFinite(raw)) return DEFAULT_RING_VOLUME;
    return Math.min(1, Math.max(0, raw));
}

function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (audioContext) return audioContext;

    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;

    audioContext = new Ctx();
    return audioContext;
}

async function resumeAudioContext(): Promise<void> {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
        try {
            await ctx.resume();
        } catch {
            // ignore
        }
    }
}

function installAudioResumeHook() {
    if (typeof window === 'undefined' || gestureHookInstalled) return;
    gestureHookInstalled = true;

    const resume = () => {
        window.removeEventListener('pointerdown', resume);
        window.removeEventListener('keydown', resume);
        void resumeAudioContext();
        if (activeElement && activeElement.paused) {
            const playPromise = activeElement.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    // ignore autoplay restrictions after gesture retry
                });
            }
        }
    };

    window.addEventListener('pointerdown', resume, { passive: true });
    window.addEventListener('keydown', resume);
}

function stopHtmlAudioElement() {
    if (!activeElement) return;
    activeElement.onerror = null;
    try {
        activeElement.pause();
    } catch {
        // ignore
    }
    activeElement.loop = false;
    activeElement.currentTime = 0;
    activeElement.src = '';
    activeElement.load();
    activeElement = null;
}

function stopFallbackTone() {
    if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer);
        fallbackTimer = null;
    }
    if (fallbackToneCleanup) {
        fallbackToneCleanup();
        fallbackToneCleanup = null;
    }
}

function playFallbackTone(frequencyHz: number, durationMs: number, volume: number): (() => void) | null {
    const ctx = getAudioContext();
    if (!ctx) return null;

    const gain = ctx.createGain();
    const oscillator = ctx.createOscillator();
    gain.gain.value = Math.max(0.02, Math.min(0.18, volume * 0.2));
    oscillator.type = 'sine';
    oscillator.frequency.value = frequencyHz;
    oscillator.connect(gain);
    gain.connect(ctx.destination);

    const startAt = ctx.currentTime;
    oscillator.start(startAt);
    oscillator.stop(startAt + (durationMs / 1000));

    oscillator.onended = () => {
        try {
            oscillator.disconnect();
        } catch {
            // ignore
        }
        try {
            gain.disconnect();
        } catch {
            // ignore
        }
    };

    return () => {
        try {
            oscillator.stop();
        } catch {
            // ignore
        }
        try {
            oscillator.disconnect();
        } catch {
            // ignore
        }
        try {
            gain.disconnect();
        } catch {
            // ignore
        }
    };
}

function startFallbackLoop(mode: RingingMode) {
    stopFallbackTone();
    installAudioResumeHook();
    void resumeAudioContext();

    const volume = getRingVolume();
    const pattern = mode === 'incoming'
        ? [
            { frequencyHz: 880, durationMs: 320, silenceMs: 120 },
            { frequencyHz: 880, durationMs: 320, silenceMs: 120 },
            { frequencyHz: 880, durationMs: 320, silenceMs: 1400 },
        ]
        : [
            { frequencyHz: 440, durationMs: 380, silenceMs: 180 },
            { frequencyHz: 440, durationMs: 380, silenceMs: 2200 },
        ];

    let index = 0;
    const tick = () => {
        if (activeMode !== mode) return;
        const step = pattern[index % pattern.length];
        fallbackToneCleanup?.();
        fallbackToneCleanup = playFallbackTone(step.frequencyHz, step.durationMs, volume);
        fallbackTimer = window.setTimeout(() => {
            index += 1;
            tick();
        }, step.durationMs + step.silenceMs);
    };

    tick();
}

async function startRinging(mode: RingingMode, sourceUrl: string): Promise<void> {
    installAudioResumeHook();

    if (activeMode === mode) {
        return;
    }

    startSequence += 1;
    const sequence = startSequence;
    activeMode = mode;
    stopHtmlAudioElement();
    stopFallbackTone();

    const element = new Audio(sourceUrl);
    element.loop = true;
    element.volume = getRingVolume();
    element.preload = 'auto';
    element.onerror = () => {
        if (activeMode !== mode || sequence !== startSequence) return;
        stopHtmlAudioElement();
        startFallbackLoop(mode);
    };

    activeElement = element;

    try {
        await element.play();
    } catch {
        if (activeMode !== mode || sequence !== startSequence) return;
        stopHtmlAudioElement();
        startFallbackLoop(mode);
    }
}

export function startIncomingRingtone() {
    const url = getEnvValue('VITE_CALL_RINGTONE_URL', DEFAULT_RINGTONE_URL);
    void startRinging('incoming', url);
}

export function startOutgoingRingback() {
    const url = getEnvValue('VITE_CALL_RINGBACK_URL', DEFAULT_RINGBACK_URL);
    void startRinging('outgoing', url);
}

export function stopAllRinging() {
    startSequence += 1;
    activeMode = null;
    stopHtmlAudioElement();
    stopFallbackTone();
}
