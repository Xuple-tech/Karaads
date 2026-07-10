import { MobileActionSheet } from '@/components/mobile-action-sheet';
import { useEffect, useState } from 'react';

interface LiveViewer {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
    joined_at?: string | null;
    watch_minutes?: number;
}

interface LiveViewersSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    viewers: LiveViewer[];
}

const resolveAvatarUrl = (url?: string | null): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return url.startsWith('/') ? url : `/${url}`;
};

const formatWatchTime = (viewer: LiveViewer, now: number): string => {
    if (viewer.joined_at) {
        const joinedAt = new Date(viewer.joined_at).getTime();
        if (Number.isFinite(joinedAt)) {
            const minutes = Math.max(0, Math.floor((now - joinedAt) / 60000));
            if (minutes < 1) return 'Just joined';
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} watching`;
        }
    }

    const minutes = Math.max(0, Math.floor(Number(viewer.watch_minutes ?? 0)));
    if (minutes < 1) return 'Just joined';
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} watching`;
};

export function LiveViewersSheet({ open, onOpenChange, viewers }: LiveViewersSheetProps) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!open) return;
        const interval = window.setInterval(() => setNow(Date.now()), 60000);
        return () => window.clearInterval(interval);
    }, [open]);

    return (
        <MobileActionSheet
            open={open}
            onOpenChange={onOpenChange}
            title="Viewers"
            description="People currently watching your stream."
        >
            <div className="space-y-3">
                {viewers.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                        No viewers yet.
                    </div>
                ) : (
                    viewers.map((viewer) => (
                        <div
                            key={viewer.id}
                            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                        >
                            <div className="h-10 w-10 overflow-hidden rounded-full border border-white/15 bg-white/10">
                                {viewer.avatar ? (
                                    <img
                                        src={resolveAvatarUrl(viewer.avatar)}
                                        alt={viewer.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : null}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">
                                    {viewer.name}
                                </p>
                                {viewer.username ? (
                                    <p className="truncate text-xs text-white/60">
                                        @{viewer.username}
                                    </p>
                                ) : null}
                                <p className="truncate text-xs font-medium text-emerald-200">
                                    {formatWatchTime(viewer, now)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </MobileActionSheet>
    );
}
