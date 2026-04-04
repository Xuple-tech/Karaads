import { useQuery } from '@tanstack/react-query';
import { AudioLines, CreditCard, Loader2, Mail, MessageSquare, Plus, Settings, Sparkles } from 'lucide-react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';

import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { apiRequest } from '@/spa/lib/api';
import { useSpaLang } from '@/spa/lib/lang';
import { useSessionQuery } from '@/spa/lib/session';

function LoadingState() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
            <Loader2 className="size-6 animate-spin" />
        </div>
    );
}

const mainNavItems = [
    { to: '/new', label: 'New Chat', icon: Plus },
    { to: '/voice-chat', label: 'Voice', icon: AudioLines },
    { to: '/mails', label: 'Mails', icon: Mail },
    { to: '/subscription', label: 'Billing', icon: CreditCard },
    { to: '/user/settings', label: 'Settings', icon: Settings },
];

function SidebarNavLink({
    to,
    children,
    icon: Icon,
}: {
    to: string;
    children: string;
    icon?: typeof Sparkles;
}) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children }}>
                <NavLink
                    className={({ isActive }) => (isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : '')}
                    to={to}
                >
                    {Icon ? <Icon /> : null}
                    <span>{children}</span>
                </NavLink>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function PublicLayout() {
    const { data } = useSessionQuery();

    return (
        <div className="min-h-screen bg-background">
            <div className="sticky top-0 z-50 shadow-md">
                <div className="rounded-none border-b border-border/70 bg-background/80 backdrop-blur-2xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                        <NavLink className="flex items-center" to={data?.authenticated ? '/app' : '/'}>
                            <AppLogoIcon />
                        </NavLink>
                        <div className="flex items-center gap-4 text-sm">
                            <NavLink className="text-primary hover:underline" to="/privacy">
                                Privacy
                            </NavLink>
                            <NavLink className="text-primary hover:underline" to="/terms">
                                Terms
                            </NavLink>
                            {data?.authenticated ? (
                                <NavLink className="text-primary hover:underline" to="/app">
                                    Open app
                                </NavLink>
                            ) : (
                                <>
                                    <NavLink className="text-primary hover:underline" to="/login">
                                        Log in
                                    </NavLink>
                                    <NavLink className="text-primary hover:underline" to="/register">
                                        Register
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export function ProtectedOnly() {
    const location = useLocation();
    const session = useSessionQuery();

    if (session.isLoading) {
        return <LoadingState />;
    }

    if (!session.data?.authenticated) {
        return <Navigate replace to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} />;
    }

    return <Outlet />;
}

export function GuestOnly() {
    const session = useSessionQuery();

    if (session.isLoading) {
        return <LoadingState />;
    }

    if (session.data?.authenticated) {
        return <Navigate replace to="/app" />;
    }

    return <Outlet />;
}

function SpaSidebarHeader() {
    const { lang, changeLanguage } = useSpaLang();

    return (
        <header className="border-sidebar-border/40 sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 rounded-t-[inherit] border-b bg-sidebar/95 px-3 backdrop-blur-xl">
            <div className="flex w-full items-center gap-1">
                <SidebarTrigger className="-ml-0.5 h-8 w-8 rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground" />
                <div className="mx-0.5 h-3.5 w-px bg-border/60" />
                <NavLink to="/new">
                    <Button className="h-8 w-8 text-muted-foreground hover:bg-accent/50 hover:text-foreground" size="icon" title="New chat" variant="ghost">
                        <Plus size={15} />
                    </Button>
                </NavLink>
                <div className="ms-auto flex items-center">
                    <Select defaultValue={lang} onValueChange={changeLanguage}>
                        <SelectTrigger className="h-8 gap-1 border-0 bg-transparent px-2 text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground focus:ring-0">
                            <SelectValue placeholder="Lang" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="ENGLISH">English</SelectItem>
                            <SelectItem value="HAUSA">Hausa</SelectItem>
                            <SelectItem value="IGBO">Igbo</SelectItem>
                            <SelectItem value="YORUBA">Yoruba</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </header>
    );
}

function SpaSidebar() {
    const session = useSessionQuery();
    const conversations = useQuery({
        queryKey: ['spa', 'conversations'],
        queryFn: () => apiRequest<{ conversations: Array<{ id: string; title: string }> }>('/api/spa/conversations'),
    });

    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg">
                            <NavLink to="/new">
                                <AppLogo />
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    {mainNavItems.map(({ to, label, icon }) => (
                        <SidebarNavLink icon={icon} key={to} to={to}>
                            {label}
                        </SidebarNavLink>
                    ))}
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="custom-scrollbar">
                <div className="gap-1 px-2 pb-2">
                    <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Recent</p>
                    <div className="space-y-1">
                        {conversations.data?.conversations?.length ? (
                            conversations.data.conversations.map((conversation) => (
                                <SidebarMenu key={conversation.id}>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild tooltip={{ children: conversation.title }}>
                                            <NavLink to={`/c/${conversation.id}`}>
                                                <MessageSquare />
                                                <span>{conversation.title}</span>
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            ))
                        ) : (
                            <div className="px-2 py-4 text-center">
                                <p className="text-xs text-muted-foreground">No conversations yet.</p>
                                <p className="mt-0.5 text-xs text-muted-foreground/60">Start a new chat to begin.</p>
                            </div>
                        )}
                    </div>
                </div>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/50 pt-2">
                <div className="rounded-xl border border-sidebar-border/50 bg-sidebar-accent/40 p-3">
                    <p className="text-sm font-medium">{session.data?.user?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{session.data?.user?.email}</p>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}

export function AppLayout() {
    return (
        <SidebarProvider defaultOpen>
            <SpaSidebar />
            <SidebarInset className="bg-background">
                <SpaSidebarHeader />
                <div className="flex flex-1 flex-col gap-6 px-4 py-5 sm:px-6">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
