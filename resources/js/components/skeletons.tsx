import { Skeleton } from '@/components/ui/skeleton';

export function AvatarSkeleton() {
    return <Skeleton className="h-10 w-10 rounded-full" />;
}

export function TextSkeleton({ lines = 1, className = '' }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 w-full ${i === lines - 1 ? 'w-3/4' : ''} ${className}`}
                />
            ))}
        </div>
    );
}

export function UserCardSkeleton() {
    return (
        <div className="flex items-center gap-3 rounded-full p-3">
            <AvatarSkeleton />
            <div className="flex-1 overflow-hidden">
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-8 w-16 rounded-full" />
        </div>
    );
}

export function TrendCardSkeleton() {
    return (
        <div className="px-4 py-3">
            <Skeleton className="mb-2 h-3 w-1/3" />
            <Skeleton className="mb-2 h-5 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
        </div>
    );
}

export function UserProfileSkeleton() {
    return (
        <div className="w-56 p-3">
            <div className="flex w-full items-center gap-3">
                <AvatarSkeleton />
                <div className="flex-1 overflow-hidden">
                    <Skeleton className="mb-1 h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-4 flex-shrink-0" />
            </div>
        </div>
    );
}

export function SidebarNavSkeleton() {
    return (
        <nav className="flex-1 space-y-1 px-2">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 rounded-full px-4 py-3"
                >
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-5 w-20" />
                </div>
            ))}
        </nav>
    );
}
