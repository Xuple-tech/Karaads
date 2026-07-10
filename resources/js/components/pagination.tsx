import { Link } from '@/components/page-head';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
}

export default function Pagination({ links }: PaginationProps) {
    if (links.length <= 1) return null;

    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            {links.map((link, index) => {
                const label = link.label
                    .replace('&laquo;', '')
                    .replace('&raquo;', '')
                    .replace('Â', '')
                    .trim();

                return (
                    <Button
                        key={index}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        disabled={!link.url}
                        className={cn('min-w-[36px]', link.active && 'pointer-events-none')}
                        asChild={!!link.url}
                    >
                        {link.url ? (
                            <Link href={link.url} preserveScroll>
                                {label}
                            </Link>
                        ) : (
                            <span>{label}</span>
                        )}
                    </Button>
                );
            })}
        </div>
    );
}
