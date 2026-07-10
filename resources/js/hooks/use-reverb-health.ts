import { useCallback, useEffect, useRef, useState } from 'react';
import axiosInstance from '@/lib/axios';

type EchoState = 'connected' | 'connecting' | 'disconnected' | 'unavailable' | 'error' | 'unknown';

interface ReverbHealthResponse {
    ok: boolean;
    status: 'ok' | 'down';
    host: string;
    port: number;
    scheme: string;
    latency_ms: number;
    error?: string | null;
}

export function useReverbHealth() {
    const [echoState, setEchoState] = useState<EchoState>('unknown');
    const [health, setHealth] = useState<ReverbHealthResponse | null>(null);
    const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
    const lastCheckRef = useRef<number | null>(null);

    const updateHealth = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get('/api/reverb/health');
            setHealth(data);
            setLastCheckedAt(new Date().toISOString());
        } catch (error: any) {
            setHealth({
                ok: false,
                status: 'down',
                host: '',
                port: 0,
                scheme: '',
                latency_ms: 0,
                error: error?.message ?? 'Failed to check Reverb health.',
            });
            setLastCheckedAt(new Date().toISOString());
        }
    }, []);

    useEffect(() => {
        if (!window.Echo) return;

        const connector: any = window.Echo.connector;
        const connection: any = connector?.pusher?.connection ?? connector?.socket ?? null;

        if (!connection) return;

        const resolveState = (state?: string): EchoState => {
            if (!state) return 'unknown';
            if (state === 'connected') return 'connected';
            if (state === 'connecting' || state === 'initialized') return 'connecting';
            if (state === 'disconnected') return 'disconnected';
            if (state === 'unavailable') return 'unavailable';
            return 'error';
        };

        const maybeCheckHealth = () => {
            const now = Date.now();
            if (lastCheckRef.current && now - lastCheckRef.current < 10_000) {
                return;
            }
            lastCheckRef.current = now;
            updateHealth().catch(() => {});
        };

        const handleState = (state?: string) => {
            const next = resolveState(state);
            setEchoState(next);
            if (next !== 'connected') {
                maybeCheckHealth();
            }
        };

        const handleStateChange = (payload: { previous: string; current: string }) => {
            handleState(payload?.current);
        };

        const bind = (event: string, handler: (...args: any[]) => void) => {
            if (typeof connection.bind === 'function') {
                connection.bind(event, handler);
                return () => connection.unbind(event, handler);
            }
            if (typeof connection.on === 'function') {
                connection.on(event, handler);
                return () => connection.off(event, handler);
            }
            return () => {};
        };

        const unbinds = [
            bind('connected', () => handleState('connected')),
            bind('disconnected', () => handleState('disconnected')),
            bind('error', () => handleState('error')),
            bind('unavailable', () => handleState('unavailable')),
            bind('state_change', handleStateChange),
        ];

        handleState(connection.state);

        return () => {
            unbinds.forEach((unbind) => unbind());
        };
    }, [updateHealth]);

    return {
        echoState,
        health,
        lastCheckedAt,
    };
}
