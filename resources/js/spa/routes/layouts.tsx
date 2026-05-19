import { useQuery } from '@tanstack/react-query';
import {
    Bookmark,
    Bot,
    ChevronDown,
    CircleHelp,
    Code2,
    CreditCard,
    Download,
    FileText,
    Globe,
    Grid2x2,
    History,
    Image,
    LayoutGrid,
    LogOut,
    Menu,
    MessageCircleMore,
    PanelsTopLeft,
    Plus,
    RadioTower,
    Search,
    Settings,
    Share2,
    Sparkles,
    Trash2,
    Video,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
import { subscribeToPrivateChannel } from '@/spa/lib/realtime';
import { useSessionQuery } from '@/spa/lib/session';

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

    for (const conversation of conversations) {
        const updatedAt = conversation.updated_at ? new Date(conversation.updated_at) : new Date(0);

        if (updatedAt >= today) groups['Today'].push(conversation);
        else if (updatedAt >= yesterday) groups['Yesterday'].push(conversation);
        else if (updatedAt >= week) groups['Previous 7 days'].push(conversation);
        else if (updatedAt >= month) groups['Previous 30 days'].push(conversation);
        else groups['Older'].push(conversation);
    }

    return groups;
}

function LoadingState() {
    return (
        <div className="flex min-h-screen animate-pulse bg-background">
            <div className="hidden w-[292px] flex-shrink-0 flex-col gap-3 border-r border-border/30 p-4 md:flex">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-muted/40" />
                    <div className="h-5 w-24 rounded bg-muted/35" />
                </div>
                <div className="mt-3 h-10 rounded-xl bg-muted/25" />
                <div className="h-10 rounded-xl bg-muted/20" />
                <div className="mt-5 space-y-2">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="h-8 rounded-lg bg-muted/20" />
                    ))}
                </div>
                <div className="mt-auto h-14 rounded-2xl bg-muted/20" />
            </div>
            <div className="flex flex-1 flex-col">
                <div className="h-16 border-b border-border/30" />
                <div className="flex flex-1 items-center justify-center p-8">
                    <div className="w-full max-w-3xl space-y-4">
                        <div className="mx-auto h-16 w-48 rounded-xl bg-muted/25" />
                        <div className="mx-auto h-5 w-72 rounded bg-muted/20" />
                        <div className="mt-8 h-36 rounded-[28px] bg-muted/15" />
                    </div>
                </div>
            </div>
        </div>
    );
}

const workspaceSections = [
    {
        label: 'Create',
        items: [
            { label: 'Kwati Slides', icon: LayoutGrid, badge: 'New', to: '/slides' },
            { label: 'Kwati Docs', icon: FileText, to: '/docs' },
            { label: 'Kwati Sheets', icon: Grid2x2 },
            { label: 'Kwati Sites', icon: Globe, badge: 'Beta' },
            { label: 'Kwati Video', icon: Video, badge: 'New' },
            { label: 'Kwati Vision', icon: Image },
        ],
    },
    {
        label: 'Build',
        items: [
            { label: 'Kwati Code', icon: Code2, badge: 'Hot' },
            { label: 'Kwati Agents', icon: Bot },
            { label: 'Kwati Canvas', icon: PanelsTopLeft, badge: 'Beta' },
            { label: 'Kwati API', icon: Sparkles },
            { label: 'Kwati Plugins', icon: RadioTower },
        ],
    },
    {
        label: 'Explore',
        items: [
            { label: 'Settings', icon: Settings, to: '/user/settings' },
            { label: 'Help & shortcuts', icon: CircleHelp },
            { label: 'Get app', icon: Download },
        ],
    },
];


const topNavItems = [
    { to: '/new', label: 'Chat', icon: MessageCircleMore, matches: ['/app', '/new', '/c/'] },
    { to: '/new?mode=canvas', label: 'Canvas', icon: PanelsTopLeft, matches: ['/new?mode=canvas'] },
    { to: '/conversations', label: 'History', icon: History, matches: ['/conversations'] },
];

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
        if (!userId) return;

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
            await apiRequest('/api/chat/conversations', { method: 'DELETE' });
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
        <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border bg-sidebar/95">
            <SidebarHeader className="border-b border-sidebar-border px-4 pb-3 pt-5">
                <div className="flex items-center justify-between">
                    <NavLink className="flex items-center gap-3 rounded-lg transition-colors hover:opacity-90" to="/new">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6f4cff] text-sm font-bold text-white shadow-[0_0_24px_rgba(111,76,255,0.25)]">
                            K
                        </div>
                        <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">Kwati AI</span>
                    </NavLink>
                    <SidebarTrigger className="h-8 w-8 rounded-lg text-muted-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground" />
                </div>
            </SidebarHeader>

            <SidebarContent className="overflow-y-auto px-4 pb-4 custom-scrollbar">
                <div className="space-y-4 pt-3">
                    <NavLink
                        to="/new"
                        className="flex items-center justify-between rounded-xl border border-sidebar-border bg-sidebar-accent/55 px-4 py-3 text-sm text-sidebar-foreground transition-colors hover:border-[#6f4cff]/35 hover:bg-sidebar-accent"
                    >
                        <span className="flex items-center gap-2.5 font-medium">
                            <Plus size={16} className="text-sidebar-foreground/80" />
                            New Chat
                        </span>
                        <span className="rounded-md border border-sidebar-border px-2 py-0.5 text-[11px] text-muted-foreground">
                            Ctrl K
                        </span>
                    </NavLink>

                    <div className="flex items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/25 px-3 py-2.5 text-sm text-muted-foreground">
                        <Search size={15} className="flex-shrink-0" />
                        <span>Search chats...</span>
                    </div>
                </div>

                <div className="mt-7 space-y-6">
                    {workspaceSections.map((section) => (
                        <div key={section.label}>
                            <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/40">
                                {section.label}
                            </p>
                            <div className="space-y-1">
                                {section.items.map(({ label, icon: Icon, badge, to }) => {
                                    const content = (
                                        <>
                                            <Icon size={16} className="flex-shrink-0 text-muted-foreground/70" />
                                            <span className="min-w-0 flex-1 truncate">{label}</span>
                                            {badge ? (
                                                <span
                                                    className={cn(
                                                        'rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
                                                        badge === 'New' && 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
                                                        badge === 'Beta' && 'border-violet-500/25 bg-violet-500/10 text-violet-300',
                                                        badge === 'Hot' && 'border-amber-500/25 bg-amber-500/10 text-amber-300'
                                                    )}
                                                >
                                                    {badge}
                                                </span>
                                            ) : null}
                                        </>
                                    );

                                    const itemClass =
                                        'flex items-center gap-3 rounded-lg px-2 py-2 text-[15px] text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-foreground';

                                    if (to) {
                                        return (
                                            <NavLink key={label} className={itemClass} to={to}>
                                                {content}
                                            </NavLink>
                                        );
                                    }

                                    return (
                                        <div key={label} className={itemClass}>
                                            {content}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mx-1 my-6 h-px bg-sidebar-border" />

                {hasConversations ? (
                    <>
                        <div className="mb-3 flex items-center justify-between px-1">
                            <p className="select-none text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/40">History</p>
                            <button
                                type="button"
                                className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                title="Clear history"
                                onClick={() => setClearOpen(true)}
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>

                        {Object.entries(groups).map(([group, items]) =>
                            items.length > 0 ? (
                                <div key={group} className="mb-3">
                                    <p className="px-1 pb-1 pt-0.5 text-[11px] font-medium tracking-wide text-muted-foreground/40">
                                        {group}
                                    </p>
                                    <div className="space-y-px">
                                        {items.map((conversation) => (
                                            <div
                                                key={conversation.id}
                                                className={cn(
                                                    'group flex items-center gap-2 rounded-lg px-2 py-1 text-[13px] transition-colors',
                                                    location.pathname === `/c/${conversation.id}`
                                                        ? 'bg-sidebar-accent text-sidebar-foreground'
                                                        : 'text-sidebar-foreground/55 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                                                )}
                                            >
                                                <NavLink className="min-w-0 flex-1 truncate px-1 py-1.5 leading-snug" to={`/c/${conversation.id}`}>
                                                    {conversation.title || 'Untitled'}
                                                </NavLink>
                                                <div className="opacity-0 transition-opacity group-hover:opacity-100">
                                                    <ConversationActions
                                                        conversationId={conversation.id}
                                                        conversationTitle={conversation.title || 'Untitled'}
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
                    <div className="px-1 py-4 text-left">
                        <p className="text-xs text-muted-foreground/40">No conversations yet</p>
                    </div>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border p-3">
                <div className="mb-3 flex items-center justify-between rounded-xl border border-[#6f4cff]/25 bg-[#16121f] px-3 py-2.5 text-sm">
                    <span className="flex items-center gap-2 font-medium text-[#c8b6ff]">
                        <Sparkles size={14} />
                        Upgrade
                    </span>
                    <NavLink
                        to="/subscription"
                        className="rounded-lg border border-[#6f4cff]/30 bg-[#201730] px-2.5 py-1 text-xs text-[#d8ccff] transition-colors hover:bg-[#2a1e40]"
                    >
                        Plan
                    </NavLink>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#8b5cf6]/20 ring-1 ring-[#8b5cf6]/30">
                                <span className="text-[11px] font-bold text-[#8b5cf6]">{getInitials(session.data?.user?.name ?? '')}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium leading-tight text-sidebar-foreground">
                                    {session.data?.user?.name ?? 'Account'}
                                </p>
                                <p className="mt-0.5 truncate text-[11px] text-muted-foreground/50">{session.data?.user?.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="rounded-full border border-[#6f4cff]/30 bg-[#201730] px-2 py-0.5 text-[11px] text-[#d8ccff]">
                                    Upgrade
                                </span>
                                <ChevronDown size={14} className="flex-shrink-0 text-muted-foreground/35" />
                            </div>
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

function isTopNavActive(pathname: string, search: string, matches: string[]) {
    return matches.some((match) => {
        if (match.includes('?')) {
            return `${pathname}${search}` === match;
        }

        return pathname === match || pathname.startsWith(match);
    });
}

function SpaTopBar() {
    const location = useLocation();

    return (
        <header className="sticky top-0 z-30 flex h-15 shrink-0 items-center justify-between border-b border-border/40 bg-background/95 px-5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9 rounded-xl text-muted-foreground/50 hover:bg-accent/60 hover:text-foreground md:hidden" />
                <nav className="flex items-center gap-2">
                    {topNavItems.map(({ to, label, icon: Icon, matches }) => {
                        const active = isTopNavActive(location.pathname, location.search, matches);

                        return (
                            <NavLink
                                key={`${to}-${label}`}
                                to={to}
                                className={cn(
                                    'flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors',
                                    active
                                        ? 'border-[#6f4cff]/40 bg-[#171027] text-[#b8a5ff]'
                                        : 'border-transparent text-muted-foreground/55 hover:border-border hover:bg-accent/30 hover:text-foreground'
                                )}
                            >
                                <Icon size={15} />
                                {label}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-xl border border-border/60 bg-card/40 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                >
                    <Share2 size={16} />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-xl border border-border/60 bg-card/40 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                >
                    <Bookmark size={16} />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="hidden h-9 w-9 rounded-xl border border-border/60 bg-card/40 text-muted-foreground hover:bg-accent/60 hover:text-foreground md:inline-flex"
                >
                    <Sparkles size={16} />
                </Button>
                <NavLink
                    to="/subscription"
                    className="rounded-2xl border border-[#6f4cff]/30 bg-[#15111e] px-4 py-2 text-sm font-medium text-[#c4b5fd] transition-colors hover:bg-[#1c1629]"
                >
                    Upgrade your plan
                </NavLink>
            </div>
        </header>
    );
}

export function PublicLayout() {
    const { data } = useSessionQuery();
    const [mobileOpen, setMobileOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!mobileOpen) return;

        const handler = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMobileOpen(false);
            }
        };

        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [mobileOpen]);

    const navLinks = [
        { to: '/pricing', label: 'Pricing' },
        { to: '/privacy', label: 'Privacy' },
        { to: '/terms', label: 'Terms' },
    ];

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-md" ref={menuRef}>
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
                    <NavLink className="transition-opacity hover:opacity-75" to={data?.authenticated ? '/app' : '/'}>
                        <img src="/logo.png" alt="Kwati AI" className="h-7 w-auto select-none" draggable={false} />
                    </NavLink>

                    <nav className="hidden items-center gap-5 text-sm md:flex">
                        {navLinks.map(({ to, label }) => (
                            <NavLink key={to} className="text-muted-foreground transition-colors hover:text-foreground" to={to}>
                                {label}
                            </NavLink>
                        ))}
                        {data?.authenticated ? (
                            <NavLink
                                className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                to="/app"
                            >
                                Open app
                            </NavLink>
                        ) : (
                            <>
                                <NavLink className="text-muted-foreground transition-colors hover:text-foreground" to="/login">
                                    Sign in
                                </NavLink>
                                <NavLink
                                    className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                    to="/register"
                                >
                                    Get started
                                </NavLink>
                            </>
                        )}
                    </nav>

                    <button
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground md:hidden"
                        onClick={() => setMobileOpen((value) => !value)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {mobileOpen && (
                    <div className="flex flex-col gap-1 border-t border-border/30 bg-background/95 px-5 py-4 backdrop-blur-md md:hidden">
                        {navLinks.map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                            >
                                {label}
                            </NavLink>
                        ))}
                        <div className="mt-2 flex flex-col gap-2 border-t border-border/30 pt-2">
                            {data?.authenticated ? (
                                <NavLink
                                    to="/app"
                                    className="rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    Open app
                                </NavLink>
                            ) : (
                                <>
                                    <NavLink
                                        to="/login"
                                        className="rounded-xl border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-accent/60"
                                    >
                                        Sign in
                                    </NavLink>
                                    <NavLink
                                        to="/register"
                                        className="rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                        Get started
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
}

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

const CHAT_PATHS = ['/app', '/new', '/dashboard', '/c/'];

export function AppLayout() {
    const { pathname } = useLocation();
    const isChat = CHAT_PATHS.some((path) => pathname === path || pathname.startsWith(path));

    return (
        <SidebarProvider defaultOpen>
            <SpaSidebar />
            <SidebarInset className="flex h-dvh flex-col overflow-hidden bg-background">
                <SpaTopBar />
                {isChat ? (
                    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
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
