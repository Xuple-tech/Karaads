import { cn } from '@/lib/utils';

interface LiveStreamUser {
    id: string;
    name: string;
    username?: string;
    avatar?: string;
}

interface LiveStreamCardProps {
    stream: {
        id: string;
        title: string;
        status?: 'draft' | 'live' | 'ended';
        viewer_count: number;
        ended_at?: string | null;
        user?: LiveStreamUser;
    };
    onClick?: () => void;
    className?: string;
    compact?: boolean;
}

const resolveAvatarUrl = (url?: string | null): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return url.startsWith('/') ? url : `/${url}`;
};

export function LiveStreamCard({ stream, onClick, className, compact = false }: LiveStreamCardProps) {
    const hostName = stream.user?.name ?? 'Host';
    const avatar = resolveAvatarUrl(stream.user?.avatar);
    const wasLive = stream.status === 'ended';
    const statusLabel = wasLive ? 'Was live' : 'Live now';
    const actionLabel = wasLive ? 'Replay' : 'Watch';

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'group w-full overflow-hidden rounded-3xl border border-white/10 bg-[#111827] text-left text-white shadow-[0_18px_50px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:border-white/25',
                className,
            )}
        >
            <div className={cn(
                'relative w-full overflow-hidden bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.20),transparent_22%),linear-gradient(135deg,rgba(239,68,68,0.78),rgba(168,85,247,0.35)_42%,rgba(2,6,23,0.92))]',
                compact ? 'h-40' : 'h-44',
            )}>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.72))]" />
                <div
                    className={cn(
                        'absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(0,0,0,0.25)]',
                        wasLive
                            ? 'bg-slate-900/80 backdrop-blur'
                            : 'bg-[#f02849] shadow-[0_8px_20px_rgba(240,40,73,0.42)]',
                    )}
                >
                    <span
                        className={cn(
                            'h-2 w-2 rounded-full bg-white',
                            wasLive ? 'opacity-70' : 'shadow-[0_0_10px_rgba(255,255,255,0.9)]',
                        )}
                    />
                    {statusLabel}
                </div>
                <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                    {wasLive ? 'Ended' : `${stream.viewer_count} watching`}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-md transition group-hover:scale-105">
                        <div className="ml-1 h-0 w-0 border-y-[12px] border-l-[18px] border-y-transparent border-l-white" />
                    </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-white/10">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={hostName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-black">
                                {hostName.slice(0, 1).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white">{hostName}</p>
                        {stream.user?.username ? (
                            <p className="truncate text-xs font-semibold text-white/70">@{stream.user.username}</p>
                        ) : null}
                    </div>
                </div>
            </div>
            <div className="space-y-2 px-4 pb-4 pt-3">
                <div className="line-clamp-2 text-base font-semibold text-white">
                    {stream.title}
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{wasLive ? `${hostName} was live` : 'Watch live'}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#111827]">
                        {actionLabel}
                    </span>
                </div>
            </div>
        </button>
    );
}
