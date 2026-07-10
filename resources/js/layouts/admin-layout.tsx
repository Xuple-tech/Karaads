import React, { useMemo, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    ChevronRight,
    Home,
    LogOut,
    Mail,
    Menu,
    Moon,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    Sun,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { adminNavigation, canAccessAdminItem, findActiveAdminItem, type AdminNavItem } from '@/lib/admin-navigation';
import { cn } from '@/lib/utils';
import { useAppearance } from '@/hooks/use-appearance';
import { home } from '@/routes';
import { dashboard, logout } from '@/routes/admin';

type PageProps = {
    auth: {
        admin?: { name?: string; email?: string; avatar?: string; role?: string; permissions?: string[] } | null;
        user?: { name?: string; email?: string; avatar?: string } | null;
    };
    flash: { success?: string; error?: string; info?: string; warning?: string };
    url: string;
};

type LayoutProps = {
    children: React.ReactNode;
    header?: string;
};

export default function AdminLayout({ children, header }: LayoutProps) {
    const { auth, flash, url } = usePage<PageProps>().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const admin = auth.admin || auth.user;
    const adminRole = auth.admin?.role ?? '';
    const adminPermissions = Array.isArray(auth.admin?.permissions) ? auth.admin.permissions : [];
    const currentPath = useMemo(() => (url || '').split('?')[0], [url]);
    const todayLabel = useMemo(
        () => new Date().toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        [],
    );

    const visibleSections = useMemo(() => {
        const visibleItems = adminNavigation
            .filter((item) => canAccessAdminItem(item, { role: adminRole, permissions: adminPermissions }))
            .map((item) => ({
                ...item,
                children: item.children?.filter((child) =>
                    canAccessAdminItem(child, { role: adminRole, permissions: adminPermissions }),
                ),
            }));

        const grouped = visibleItems.reduce<Record<string, AdminNavItem[]>>((accumulator, item) => {
            accumulator[item.section] ??= [];
            accumulator[item.section].push(item);
            return accumulator;
        }, {});

        return Object.entries(grouped);
    }, [adminPermissions, adminRole]);

    const activeItem = useMemo(
        () => findActiveAdminItem(visibleSections.flatMap(([, items]) => items), currentPath),
        [currentPath, visibleSections],
    );

    const activeSection = activeItem?.section ?? 'Overview';
    const canEmailUsers = canAccessAdminItem({ requires: { roles: ['super_admin', 'admin'] } }, { role: adminRole, permissions: adminPermissions });

    const isActive = (href?: string) => (href ? currentPath === href || currentPath.startsWith(`${href}/`) : false);

    const renderItem = (item: AdminNavItem) => {
        if (item.children?.length) {
            const parentActive = item.children.some((child) => isActive(child.href));

            return (
                <div key={item.label} className="space-y-1.5">
                    <div
                        className={cn(
                            'flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium',
                            parentActive
                                ? 'bg-slate-200/80 text-slate-950 dark:bg-[#303247] dark:text-white'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#303247] dark:hover:text-white',
                            sidebarCollapsed && 'justify-center',
                        )}
                    >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!sidebarCollapsed ? <span>{item.label}</span> : null}
                    </div>
                    {!sidebarCollapsed ? (
                        <div className="space-y-1 border-l border-slate-200 pl-4 dark:border-white/10">
                            {item.children.map((child) => (
                                <Link
                                    key={child.label}
                                    href={child.href!}
                                    className={cn(
                                        'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
                                        isActive(child.href)
                                            ? 'bg-[#ef3d5d] text-white shadow-sm'
                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#303247] dark:hover:text-white',
                                    )}
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                    <span>{child.label}</span>
                                </Link>
                            ))}
                        </div>
                    ) : null}
                </div>
            );
        }

        return (
            <Link
                key={item.label}
                href={item.href!}
                className={cn(
                    'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition',
                    isActive(item.href)
                        ? 'bg-slate-200/80 text-slate-950 shadow-sm dark:bg-[#303247] dark:text-white'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#303247] dark:hover:text-white',
                    sidebarCollapsed && 'justify-center',
                )}
            >
                <item.icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed ? <span>{item.label}</span> : null}
            </Link>
        );
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-white dark:bg-[#242638]">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-[#34364f]">
                <Link href={dashboard.url()} className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
                    <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm dark:bg-white">
                        <img src="/logo.png" alt="Karaads" className="h-full w-full object-cover" />
                    </div>
                    {!sidebarCollapsed ? (
                        <div>
                            <p className="karads-heading text-lg font-black leading-none text-slate-950 dark:text-white">Karaads</p>
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Admin command UI</p>
                        </div>
                    ) : null}
                </Link>
                {canEmailUsers ? (
                    <Link
                        href="/admin/email-users"
                        className={cn(
                            'mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#ef3d5d] px-3 py-3 text-sm font-bold text-white shadow-lg shadow-[#ef3d5d]/25 transition hover:-translate-y-0.5 hover:bg-[#dc284b]',
                            sidebarCollapsed && 'px-0',
                        )}
                        title="Email Users"
                    >
                        <Mail className="h-4 w-4 shrink-0" />
                        {!sidebarCollapsed ? <span>Email Users</span> : null}
                    </Link>
                ) : null}
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-5">
                <div className="space-y-5">
                    {visibleSections.map(([sectionTitle, items]) => (
                        <div key={sectionTitle} className="space-y-2">
                            {!sidebarCollapsed ? (
                                <p className="px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                                    {sectionTitle}
                                </p>
                            ) : null}
                            <div className="space-y-1.5">{items.map(renderItem)}</div>
                        </div>
                    ))}
                </div>
            </div>

            <Separator className="dark:bg-[#34364f]" />

            <div className="px-4 py-4">
                <div className={cn('space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-[#34364f] dark:bg-[#202234]', sidebarCollapsed && 'p-2')}>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={admin?.avatar} alt={admin?.name} />
                            <AvatarFallback>{admin?.name?.charAt(0) || 'A'}</AvatarFallback>
                        </Avatar>
                        {!sidebarCollapsed ? (
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{admin?.name || 'Admin'}</p>
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{admin?.email}</p>
                            </div>
                        ) : null}
                    </div>
                    <Link
                        href={logout.url()}
                        method="post"
                        as="button"
                        className={cn(
                            'inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-medium transition-colors hover:bg-slate-100 dark:border-[#3a3d58] dark:hover:bg-[#303247]',
                            sidebarCollapsed && 'px-0',
                        )}
                    >
                        <LogOut className="h-4 w-4" />
                        {!sidebarCollapsed ? 'Logout' : null}
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground dark:bg-[#1f2132] dark:text-slate-100">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="w-80 p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            <aside className={cn('fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200 dark:border-[#34364f] lg:block', sidebarCollapsed ? 'w-24' : 'w-[244px]')}>
                <SidebarContent />
            </aside>

            <div className={cn(sidebarCollapsed ? 'lg:pl-24' : 'lg:pl-[244px]')}>
                <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-[#34364f] dark:bg-[#242638]">
                    <div className="flex h-[72px] items-center justify-between px-4 sm:px-7">
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" className="border-slate-200 dark:border-[#3a3d58] dark:bg-[#26283d] lg:hidden" onClick={() => setMobileOpen(true)}>
                                <Menu className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="hidden border-slate-200 dark:border-[#3a3d58] dark:bg-[#26283d] lg:inline-flex"
                                onClick={() => setSidebarCollapsed((current) => !current)}
                            >
                                {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                            </Button>
                            <Avatar className="hidden h-10 w-10 rounded-lg sm:flex">
                                <AvatarImage src={admin?.avatar} alt={admin?.name} />
                                <AvatarFallback className="rounded-lg">{admin?.name?.charAt(0) || 'A'}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                                <h1 className="karads-heading text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
                                    {admin?.name || header || activeItem?.label || 'Admin'}
                                    <span className="ml-2 hidden text-xs font-normal text-slate-500 dark:text-slate-400 sm:inline">
                                        Last login was 23 hours ago.
                                    </span>
                                </h1>
                                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{activeSection}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden h-10 items-center gap-2 rounded border border-slate-200 px-4 text-sm text-slate-600 dark:border-[#3a3d58] dark:bg-[#26283d] dark:text-slate-300 md:flex">
                                Today : {todayLabel}
                                <CalendarDays className="h-4 w-4" />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="rounded border-slate-200 dark:border-[#3a3d58] dark:bg-[#26283d]"
                                aria-label={`Switch to ${resolvedAppearance === 'dark' ? 'light' : 'dark'} mode`}
                                onClick={() => updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark')}
                            >
                                {resolvedAppearance === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>

                            <Button type="button" variant="outline" size="icon" className="hidden rounded border-slate-200 dark:border-[#3a3d58] dark:bg-[#26283d] sm:inline-flex">
                                <Settings className="h-4 w-4" />
                            </Button>

                            <Button type="button" variant="outline" size="icon" className="hidden rounded border-slate-200 dark:border-[#3a3d58] dark:bg-[#26283d] sm:inline-flex">
                                <Bell className="h-4 w-4" />
                                <span className="absolute mt-[-18px] ml-4 h-1.5 w-1.5 rounded-full bg-[#ef3d5d]" />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-10 gap-2 rounded-full px-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={admin?.avatar} alt={admin?.name} />
                                            <AvatarFallback>{admin?.name?.charAt(0) || 'A'}</AvatarFallback>
                                        </Avatar>
                                        <span className="hidden text-sm sm:inline">{admin?.name || 'Admin'}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-60">
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{admin?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{admin?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={dashboard.url()}>Dashboard</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={home.url()}>
                                            <Home className="mr-2 h-4 w-4" />
                                            View Site
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={logout.url()} method="post" as="button">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl space-y-4">
                        {flash.success ? (
                            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-400/20 dark:bg-green-500/10 dark:text-green-200">
                                {flash.success}
                            </div>
                        ) : null}
                        {flash.error ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
                                {flash.error}
                            </div>
                        ) : null}
                        {flash.info ? (
                            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-200">
                                {flash.info}
                            </div>
                        ) : null}
                        {flash.warning ? (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
                                {flash.warning}
                            </div>
                        ) : null}

                        <div>{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
