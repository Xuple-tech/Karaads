import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { type NavItem } from '@/types';
import { Link } from '@/components/page-head';
import { BadgeCheck, Palette, ShieldCheck, LockKeyhole, UserRound, Eye } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: UserRound,
    },
    {
        title: 'Kara Verified',
        href: '/settings/verification',
        icon: BadgeCheck,
    },
    {
        title: 'Password',
        href: editPassword(),
        icon: LockKeyhole,
    },
    {
        title: 'Two-Factor Auth',
        href: show(),
        icon: ShieldCheck,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: Palette,
    },
    {
        title: 'Privacy',
        href: '/settings/privacy',
        icon: Eye,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const isMobile = useIsMobile();

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    const renderNavItem = (item: NavItem, index: number) => {
        const isActive = isSameUrl(currentPath, item.href);
        const Icon = item.icon;

        return (
            <Button
                key={`${resolveUrl(item.href)}-${index}`}
                size="sm"
                variant="ghost"
                asChild
                className={cn(
                    'relative justify-start gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                    isMobile ? 'max-w-[148px] flex-none' : 'w-full',
                    isActive
                        ? 'border-primary/40 bg-primary/10 text-primary shadow-[0_14px_40px_-22px_rgba(59,130,246,0.65)]'
                        : 'border-transparent bg-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/40'
                )}
            >
                <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className="relative flex w-full items-center gap-3"
                >
                    {Icon ? (
                        <Icon
                            className={cn(
                                'h-4 w-4 flex-shrink-0',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )}
                        />
                    ) : null}
                    <span className="truncate">{item.title}</span>
                    {isActive ? (
                        <span
                            className="absolute -left-2 top-1/2 hidden h-7 w-1 -translate-y-1/2 rounded-full bg-primary lg:block"
                            aria-hidden
                        />
                    ) : null}
                </Link>
            </Button>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
            <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 md:px-8">
                <div className="relative isolate overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-[0_28px_70px_-45px_rgba(0,0,0,0.65)] backdrop-blur">
                    <div
                        className="pointer-events-none absolute inset-x-10 -top-24 h-48 rounded-full bg-primary/15 blur-3xl"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
                        aria-hidden
                    />

                    <div className="relative space-y-6 px-4 py-6 sm:px-6 md:px-10 md:py-8">
                        <Heading
                            title="Settings"
                            description="Manage your profile and account settings"
                        />

                        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                            <aside className="lg:w-64">
                                <nav
                                    aria-label="Settings navigation"
                                    className="hidden flex-col gap-2 lg:flex"
                                >
                                    {sidebarNavItems.map(renderNavItem)}
                                </nav>

                                <nav
                                    aria-label="Settings navigation"
                                    className="flex gap-2 overflow-x-auto rounded-2xl border border-border/60 bg-muted/30 p-2 lg:hidden"
                                >
                                    {sidebarNavItems.map(renderNavItem)}
                                </nav>
                            </aside>

                            <div className="hidden w-px self-stretch bg-border/60 lg:block" />

                            <section className="flex-1 lg:max-w-3xl">
                                <div className="space-y-12">{children}</div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
