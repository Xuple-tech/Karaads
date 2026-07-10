import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileActionSheet } from '@/components/mobile-action-sheet';
import { MobilePageShell } from '@/components/mobile-page-shell';
import { MobileTopBar } from '@/components/mobile-top-bar';
import { LiveStreamCard } from '@/components/live/live-stream-card';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveStream {
    id: string;
    title: string;
    description?: string | null;
    status: 'draft' | 'live' | 'ended';
    visibility: 'everyone' | 'followers';
    viewer_count: number;
    started_at?: string | null;
    user?: {
        id: string;
        name: string;
        username?: string;
        avatar?: string;
    };
}

export default function LiveIndex() {
    const navigate = useNavigate();
    const { auth } = useAuth();
    const isMobile = useIsMobile();
    const [streams, setStreams] = useState<LiveStream[]>([]);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [creating, setCreating] = useState(false);
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const liveCount = streams.filter((stream) => stream.status === 'live').length;
    const endedCount = streams.filter((stream) => stream.status === 'ended').length;

    const fetchStreams = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get('/api/live/streams');
            const payload = data?.data ?? data ?? [];
            setStreams(payload);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStreams().catch(() => {});
    }, [fetchStreams]);

    useEffect(() => {
        if (!window.Echo) return;
        const channel = window.Echo.channel('live.global');
        channel.listen('.live.stream.started', () => {
            fetchStreams().catch(() => {});
        });
        channel.listen('.live.stream.ended', () => {
            fetchStreams().catch(() => {});
        });
        return () => {
            try {
                window.Echo.leaveChannel('live.global');
            } catch {
                // ignore
            }
        };
    }, [fetchStreams]);

    const handleCreate = async () => {
        if (creating) return;
        setCreating(true);
        try {
            const { data } = await axiosInstance.post('/api/live/streams', {
                title: title.trim() || 'Live Stream',
                visibility: 'everyone',
            });
            const stream = data?.data ?? data;
            if (stream?.id) {
                setShowCreateSheet(false);
                navigate(`/live/${stream.id}/host`);
            }
        } finally {
            setCreating(false);
        }
    };

    return (
        <MobilePageShell
            header={
                <MobileTopBar
                    title="Live"
                    subtitle="Watch ongoing streams or go live in seconds."
                    rightActions={[
                        {
                            icon: Video,
                            label: 'Go Live',
                            onClick: () => setShowCreateSheet(true),
                            disabled: !auth?.user,
                            variant: 'solid',
                        },
                    ]}
                />
            }
            contentClassName={cn(
                'max-w-6xl',
                isMobile ? 'px-3 pt-3' : 'px-4 pt-6',
            )}
        >
            <section className="space-y-4">
                <div className="live-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="karads-heading text-lg font-semibold text-white">
                            Start a live stream
                        </h2>
                        <p className="text-sm text-white/60">
                            Share updates with your audience in real time.
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowCreateSheet(true)}
                        disabled={!auth?.user || creating}
                        className="h-11 rounded-full px-6"
                    >
                        Go Live
                    </Button>
                </div>

                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
                        Live
                    </h3>
                    <span className="text-xs text-white/50">
                        {liveCount} live{endedCount ? ` · ${endedCount} was live` : ''}
                    </span>
                </div>

                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-44 animate-pulse rounded-3xl border border-white/10 bg-white/5"
                            />
                        ))}
                    </div>
                ) : streams.length === 0 ? (
                    <div className="live-surface p-6 text-center text-sm text-white/60">
                        No one is live right now. Be the first to go live.
                    </div>
                ) : (
                    <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3')}>
                        {streams.map((stream) => (
                            <LiveStreamCard
                                key={stream.id}
                                stream={stream}
                                onClick={() => navigate(`/live/${stream.id}`)}
                            />
                        ))}
                    </div>
                )}
            </section>

            <MobileActionSheet
                open={showCreateSheet}
                onOpenChange={setShowCreateSheet}
                title="Go Live"
                description="Pick a title and start streaming."
            >
                <div className="space-y-3">
                    <Input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Give your stream a title"
                        className="bg-black/40 text-white placeholder:text-white/40"
                    />
                    <Button onClick={handleCreate} disabled={!auth?.user || creating} className="w-full">
                        {creating ? 'Starting...' : 'Start Live'}
                    </Button>
                </div>
            </MobileActionSheet>
        </MobilePageShell>
    );
}
