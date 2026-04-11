import { useQuery } from '@tanstack/react-query';
import { AudioLines, CreditCard, LogOut, PenSquare, RadioTower, Settings, SquarePen, Star, Trash2, MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, matchPath, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import ConversationActions from '@/spa/components/ConversationActions';
import { apiRequest } from '@/spa/lib/api';
import { logoutSpa, useAuthRuntimeState } from '@/spa/lib/auth-runtime';
import { useSpaLang } from '@/spa/lib/lang';
import { subscribeToPrivateChannel } from '@/spa/lib/realtime';
import { useSessionQuery } from '@/spa/lib/session';

// ─── helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
    return (name ?? '?')
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

type Conversation = { id: string; title: string; updated_at?: string };

function groupConversations(conversations: Conversation[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today.getTime() - 864e5);
    const week = new Date(today.getTime() - 7 * 864e5);
    const month = new Date(today.getTime() - 30 * 864e5);

    const groups: Record<string, Conversation[]> = {
        Today: [],
        Yesterday: [],
        'Previous 7 days': [],
        'Previous 30 days': [],
        Older: [],
    };

    for (const c of conversations) {
        const d = c.updated_at ? new Date(c.updated_at) : new Date(0);
        if (d >= today) groups['Today'].push(c);
        else if (d >= yesterday) groups['Yesterday'].push(c);
        else if (d >= week) groups['Previous 7 days'].push(c);
        else if (d >= month) groups['Previous 30 days'].push(c);
        else groups['Older'].push(c);
    }

    return groups;
}

// ─── loading skeleton ────────────────────────────────────────────────────────

function LoadingState() {
    return (
        <div className="flex min-h-screen bg-background animate-pulse">
            <div className="hidden md:flex w-[260px] flex-shrink-0 flex-col gap-3 border-r border-border/20 p-4">
                <div className="h-8 w-28 rounded-lg bg-muted/70" />
                <div className="mt-4 space-y-1">
                    {[72, 60, 80, 65].map((w, i) => (
                        <div key={i} className="h-8 rounded-lg bg-muted/40" style={{ width: `${w}%` }} />
                    ))}
                </div>
                <div className="mt-6">
                    <div className="h-3 w-16 rounded-full bg-muted/30 mb-2" />
                    <div className="space-y-1">
                        {[90, 75, 85].map((w, i) => (
                            <div key={i} className="h-7 rounded-md bg-muted/30" style={{ width: `${w}%` }} />
                        ))}
                    </div>
                </div>
                <div className="mt-auto flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-muted/50" />
                    <div className="h-4 w-24 rounded bg-muted/40" />
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-5 p-6">
                <div className="space-y-3 mt-8">
                    <div className="h-3.5 w-full rounded-full bg-muted/30" />
                    <div className="h-3.5 w-5/6 rounded-full bg-muted/30" />
                    <div className="h-3.5 w-2/3 rounded-full bg-muted/30" />
                </div>
            </div>
        </div>
    );
}

// ─── sidebar nav items ───────────────────────────────────────────────────────

const mainNavItems = [
    { to: '/new', label: 'New Chat', icon: SquarePen },
    { to: '/voice-chat', label: 'Voice', icon: AudioLines },
    { to: '/automations', label: 'Automations', icon: RadioTower },
    { to: '/subscription', label: 'Upgrade Plan', icon: Star },
];

// ─── sidebar ─────────────────────────────────────────────────────────────────

function SpaSidebar() {
    const session = useSessionQuery();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [clearOpen, setClearOpen] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const conversations = useQuery({
        queryKey: ['spa', 'conversations'],
        queryFn: () => apiRequest<{ conversations: Conversation[] }>('/api/chat/conversations'),
    });
    const userId = session.data?.user?.id;

    useEffect(() => {
        if (!userId) {
            return;
        }

        return subscribeToPrivateChannel(`user.${userId}`, (eventName) => {
            if (eventName === 'conversation.updated') {
                void conversations.refetch();
            }
        });
    }, [conversations, userId]);

    const groups = groupConversations(conversations.data?.conversations ?? []);
    const hasConversations = (conversations.data?.conversations?.length ?? 0) > 0;

    const clearHistory = async () => {
        setIsClearing(true);
        try {
            await apiRequest('/api/chat/conversations', {
                method: 'DELETE',
            });
            await conversations.refetch();
            setClearOpen(false);
            navigate('/new');
            toast.success('Conversation history cleared');
        } catch {
            toast.error('Failed to clear conversation history');
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border bg-sidebar">
            {/* ── header ── */}
            <SidebarHeader className="px-3 pt-3 pb-2">
                <div className="flex items-center justify-between">
                    <NavLink className="flex items-center gap-2.5 px-1 py-1 rounded-lg hover:bg-sidebar-accent/50 transition-colors" to="/new">
                        <img src="/icon.png" alt="Kwati AI logo" className="logo icon h-6 2-6" />
                        <span className="text-[15px] font-semibold text-sidebar-foreground tracking-tight">
                            Kwati AI
                        </span>
                    </NavLink>
                    <div className="flex items-center gap-0.5">
                        <NavLink to="/new">
                            <Button
                                className="h-8 w-8 rounded-lg text-muted-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                                size="icon"
                                title="New chat"
                                variant="ghost"
                            >
                                <PenSquare size={16} />
                            </Button>
                        </NavLink>
                        <SidebarTrigger className="h-8 w-8 rounded-lg text-muted-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent" />
                    </div>
                </div>
            </SidebarHeader>

            {/* ── nav + conversations ── */}
            <SidebarContent className="px-2 overflow-y-auto custom-scrollbar">
                {/* Primary nav */}
                <nav className="mb-1 space-y-0.5 pt-1">
                    {mainNavItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                                    isActive
                                        ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                                )
                            }
                            to={to}
                        >
                            <Icon size={15} className="flex-shrink-0 opacity-70" />
                            {label}
                        </NavLink>
                    ))}

                    {/* Settings inline */}
                    <NavLink
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                                isActive
                                    ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                            )
                        }
                        to="/user/settings"
                    >
                        <Settings size={15} className="flex-shrink-0 opacity-70" />
                        Settings
                    </NavLink>
                </nav>

                {/* Billing shortcut */}
                <NavLink
                    className={({ isActive }) =>
                        cn(
                            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors mt-0.5 mb-3',
                            isActive
                                ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                        )
                    }
                    to="/subscription"
                >
                    <CreditCard size={15} className="flex-shrink-0 opacity-70" />
                    Billing
                </NavLink>

                {/* Divider */}
                <div className="h-px bg-sidebar-border mx-1 mb-3" />

                {/* Conversation history */}
                {hasConversations ? (
                    <>
                        <div className="mb-3 flex items-center justify-between px-3">
                            <p className="text-[11px] font-medium text-muted-foreground/40 select-none tracking-wide">History</p>
                            <button
                                type="button"
                                className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                title="Clear history"
                                onClick={() => setClearOpen(true)}
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>

                        {Object.entries(groups).map(([group, convs]) =>
                            convs.length > 0 ? (
                                <div key={group} className="mb-3">
                                    <p className="px-3 pb-1 pt-0.5 text-[11px] font-medium text-muted-foreground/40 select-none tracking-wide">
                                        {group}
                                    </p>
                                    <div className="space-y-px">
                                        {convs.map((conv) => (
                                            <div
                                                key={conv.id}
                                                className={cn(
                                                    'group flex items-center gap-2 rounded-lg px-2 py-1 text-[13px] transition-colors',
                                                    location.pathname === `/c/${conv.id}`
                                                        ? 'bg-sidebar-accent text-sidebar-foreground'
                                                        : 'text-sidebar-foreground/55 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                                                )}
                                            >
                                                <NavLink className="min-w-0 flex-1 truncate px-1 py-1.5 leading-snug" to={`/c/${conv.id}`}>
                                                    {conv.title || 'Untitled'}
                                                </NavLink>
                                                <div className="opacity-0 transition-opacity group-hover:opacity-100">
                                                    <ConversationActions
                                                        conversationId={conv.id}
                                                        conversationTitle={conv.title || 'Untitled'}
                                                        onChanged={() => void conversations.refetch()}
                                                        onDeleted={() => void conversations.refetch()}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null
                        )}
                    </>
                ) : (
                    <div className="px-3 py-8 text-center">
                        <p className="text-xs text-muted-foreground/40">No conversations yet</p>
                    </div>
                )}
            </SidebarContent>

            {/* ── footer / user ── */}
            <SidebarFooter className="p-2 border-t border-sidebar-border">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#8b5cf6]/20 ring-1 ring-[#8b5cf6]/30">
                                <span className="text-[11px] font-bold text-[#8b5cf6]">
                                    {getInitials(session.data?.user?.name ?? '')}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-sidebar-foreground leading-tight">
                                    {session.data?.user?.name ?? 'Account'}
                                </p>
                                <p className="truncate text-[11px] text-muted-foreground/50 mt-0.5">
                                    {session.data?.user?.email}
                                </p>
                            </div>
                            <MoreHorizontal size={14} className="flex-shrink-0 text-muted-foreground/35" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52" side="top">
                        <DropdownMenuItem asChild>
                            <NavLink className="flex items-center gap-2" to="/user/settings">
                                <Settings size={14} />
                                Settings
                            </NavLink>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <NavLink className="flex items-center gap-2" to="/subscription">
                                <CreditCard size={14} />
                                Billing & Subscription
                            </NavLink>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="flex items-center gap-2 text-destructive focus:text-destructive"
                            disabled={isLoggingOut}
                            onSelect={async (event) => {
                                event.preventDefault();
                                setIsLoggingOut(true);
                                await logoutSpa();
                            }}
                        >
                                <LogOut size={14} />
                                {isLoggingOut ? 'Signing out...' : 'Sign out'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>

            <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear all conversation history?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently deletes all saved chat conversations for this account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => void clearHistory()}
                        >
                            {isClearing ? 'Clearing...' : 'Clear history'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Sidebar>
    );
}

// ─── top bar (inside main content) ───────────────────────────────────────────

function SpaTopBar() {
    const location = useLocation();
    const { lang, changeLanguage } = useSpaLang();
    const activeConversationMatch = matchPath('/c/:conversationId', location.pathname);
    const activeConversationId = activeConversationMatch?.params.conversationId;
    const conversation = useQuery({
        queryKey: ['spa', 'conversation', activeConversationId],
        queryFn: () => apiRequest<{ conversation: { id: string; title: string } }>(`/api/chat/conversations/${activeConversationId}`),
        enabled: Boolean(activeConversationId),
    });

    return (
        <header className="sticky top-0 z-30 flex h-11 shrink-0 items-center gap-2 px-3 bg-background border-b border-border/30">
            <SidebarTrigger className="h-8 w-8 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-accent/60" />
            {activeConversationId ? (
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                        {conversation.data?.conversation.title || 'New chat'}
                    </p>
                </div>
            ) : (
                <div className="flex-1" />
            )}
            {activeConversationId && conversation.data?.conversation ? (
                <ConversationActions
                    trigger="button"
                    conversationId={activeConversationId}
                    conversationTitle={conversation.data.conversation.title || 'New chat'}
                    onChanged={() => void conversation.refetch()}
                />
            ) : null}
            <Select defaultValue={lang} onValueChange={changeLanguage}>
                <SelectTrigger className="h-7 gap-1 border-0 bg-transparent px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 focus:ring-0 w-auto">
                    <SelectValue placeholder="Lang" />
                </SelectTrigger>
                <SelectContent align="end">
                    <SelectItem value="ENGLISH">English</SelectItem>
                    <SelectItem value="HAUSA">Hausa</SelectItem>
                    <SelectItem value="IGBO">Igbo</SelectItem>
                    <SelectItem value="YORUBA">Yoruba</SelectItem>
                </SelectContent>
            </Select>
        </header>
    );
}

// ─── public layout ────────────────────────────────────────────────────────────

export function PublicLayout() {
    const { data } = useSessionQuery();

    return (
        <div className="min-h-screen bg-background">
            {/* Nav */}
            <header className="sticky top-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
                    {/* Logo */}
                    <NavLink className="hover:opacity-75 transition-opacity" to={data?.authenticated ? '/app' : '/'}>
                        <img src="/logo.png" alt="Kwati AI" className="h-7 w-auto select-none" draggable={false} />
                    </NavLink>

                    {/* Links */}
                    <nav className="flex items-center gap-5 text-sm">
                        <NavLink className="text-muted-foreground hover:text-foreground transition-colors" to="/pricing">
                            Pricing
                        </NavLink>
                        <NavLink className="text-muted-foreground hover:text-foreground transition-colors" to="/privacy">
                            Privacy
                        </NavLink>
                        <NavLink className="text-muted-foreground hover:text-foreground transition-colors" to="/terms">
                            Terms
                        </NavLink>
                        {data?.authenticated ? (
                            <NavLink
                                className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                                to="/app"
                            >
                                Open app
                            </NavLink>
                        ) : (
                            <>
                                <NavLink className="text-muted-foreground hover:text-foreground transition-colors" to="/login">
                                    Sign in
                                </NavLink>
                                <NavLink
                                    className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                                    to="/register"
                                >
                                    Get started
                                </NavLink>
                            </>
                        )}
                    </nav>
                </div>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
}

// ─── route guards ─────────────────────────────────────────────────────────────

export function ProtectedOnly() {
    const location = useLocation();
    const session = useSessionQuery();
    const auth = useAuthRuntimeState();

    if (session.isLoading || auth.status === 'revalidating' || auth.status === 'unknown') return <LoadingState />;
    if (!session.data?.authenticated) {
        return <Navigate replace to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} />;
    }
    return <Outlet />;
}

export function GuestOnly() {
    const session = useSessionQuery();
    const auth = useAuthRuntimeState();

    if (session.isLoading || auth.status === 'revalidating' || auth.status === 'unknown') return <LoadingState />;
    if (session.data?.authenticated) return <Navigate replace to="/app" />;
    return <Outlet />;
}

// ─── app layout ───────────────────────────────────────────────────────────────

const CHAT_PATHS = ['/app', '/new', '/dashboard', '/c/'];

export function AppLayout() {
    const { pathname } = useLocation();
    const isChat = CHAT_PATHS.some((p) => pathname === p || pathname.startsWith(p));

    return (
        <SidebarProvider defaultOpen>
            <SpaSidebar />
            <SidebarInset className="bg-background flex h-dvh flex-col overflow-hidden">
                <SpaTopBar />
                {isChat ? (
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        <Outlet />
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6">
                        <Outlet />
                    </div>
                )}
            </SidebarInset>
        </SidebarProvider>
    );
}
