import { useQuery } from '@tanstack/react-query';
import { AudioLines, CreditCard, FileText, LogOut, Mail, MoreHorizontal, PenSquare, Settings, SquarePen, Star } from 'lucide-react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';

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
import { apiRequest } from '@/spa/lib/api';
import { useSpaLang } from '@/spa/lib/lang';
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
    { to: '/doc-builder', label: 'Doc Builder', icon: FileText },
    { to: '/voice-chat', label: 'Voice', icon: AudioLines },
    { to: '/mails', label: 'Mails', icon: Mail },
    { to: '/subscription', label: 'Upgrade Plan', icon: Star },
];

// ─── sidebar ─────────────────────────────────────────────────────────────────

type DocSession = { id: string; title: string; document_type: string; updated_at: string };

function SpaSidebar() {
    const session = useSessionQuery();
    const conversations = useQuery({
        queryKey: ['spa', 'conversations'],
        queryFn: () => apiRequest<{ conversations: Conversation[] }>('/api/chat/conversations'),
    });
    const docSessions = useQuery({
        queryKey: ['spa', 'doc-builder-sessions'],
        queryFn: () => apiRequest<{ sessions: DocSession[] }>('/api/doc-builder/sessions'),
    });

    const groups = groupConversations(conversations.data?.conversations ?? []);
    const hasConversations = (conversations.data?.conversations?.length ?? 0) > 0;
    const hasDocs = (docSessions.data?.sessions?.length ?? 0) > 0;

    return (
        <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border bg-sidebar">
            {/* ── header ── */}
            <SidebarHeader className="px-3 pt-3 pb-2">
                <div className="flex items-center justify-between">
                    <NavLink className="flex items-center gap-2.5 px-1 py-1 rounded-lg hover:bg-sidebar-accent/50 transition-colors" to="/new">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9]">
                            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                            </svg>
                        </div>
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
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                                    isActive
                                        ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                                )
                            }
                            key={to}
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
                    Object.entries(groups).map(([group, convs]) =>
                        convs.length > 0 ? (
                            <div key={group} className="mb-3">
                                <p className="px-3 pb-1 pt-0.5 text-[11px] font-medium text-muted-foreground/40 select-none tracking-wide">
                                    {group}
                                </p>
                                <div className="space-y-px">
                                    {convs.map((conv) => (
                                        <NavLink
                                            className={({ isActive }) =>
                                                cn(
                                                    'group flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-colors',
                                                    isActive
                                                        ? 'bg-sidebar-accent text-sidebar-foreground'
                                                        : 'text-sidebar-foreground/55 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                                                )
                                            }
                                            key={conv.id}
                                            to={`/c/${conv.id}`}
                                        >
                                            <span className="truncate flex-1 leading-snug">{conv.title || 'Untitled'}</span>
                                            <MoreHorizontal
                                                size={13}
                                                className="flex-shrink-0 opacity-0 group-hover:opacity-50 transition-opacity"
                                            />
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        ) : null
                    )
                ) : (
                    <div className="px-3 py-8 text-center">
                        <p className="text-xs text-muted-foreground/40">No conversations yet</p>
                    </div>
                )}

                {/* Doc Builder sessions */}
                {hasDocs && (
                    <div className="mt-4">
                        <div className="h-px bg-sidebar-border mx-1 mb-3" />
                        <div className="mb-3">
                            <p className="px-3 pb-1 pt-0.5 text-[11px] font-medium text-muted-foreground/40 select-none tracking-wide flex items-center gap-1.5">
                                <FileText size={10} />
                                Documents
                            </p>
                            <div className="space-y-px">
                                {docSessions.data?.sessions.map(doc => (
                                    <NavLink
                                        key={doc.id}
                                        to={`/doc-builder/${doc.id}`}
                                        className={({ isActive }) =>
                                            cn(
                                                'group flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-colors',
                                                isActive
                                                    ? 'bg-sidebar-accent text-sidebar-foreground'
                                                    : 'text-sidebar-foreground/55 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                                            )
                                        }
                                    >
                                        <span className="truncate flex-1 leading-snug">{doc.title || 'Untitled Document'}</span>
                                        <MoreHorizontal size={13} className="flex-shrink-0 opacity-0 group-hover:opacity-50 transition-opacity" />
                                    </NavLink>
                                ))}
                            </div>
                        </div>
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
                        <DropdownMenuItem asChild>
                            <a className="flex items-center gap-2 text-destructive focus:text-destructive" href="/logout">
                                <LogOut size={14} />
                                Sign out
                            </a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

// ─── top bar (inside main content) ───────────────────────────────────────────

function SpaTopBar() {
    const { lang, changeLanguage } = useSpaLang();

    return (
        <header className="sticky top-0 z-30 flex h-11 shrink-0 items-center gap-2 px-3 bg-background border-b border-border/30">
            <SidebarTrigger className="h-8 w-8 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-accent/60" />
            <div className="flex-1" />
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
                    <NavLink className="flex items-center gap-2 hover:opacity-80 transition-opacity" to={data?.authenticated ? '/app' : '/'}>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9]">
                            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-foreground">Kwati AI</span>
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

    if (session.isLoading) return <LoadingState />;
    if (!session.data?.authenticated) {
        return <Navigate replace to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} />;
    }
    return <Outlet />;
}

export function GuestOnly() {
    const session = useSessionQuery();

    if (session.isLoading) return <LoadingState />;
    if (session.data?.authenticated) return <Navigate replace to="/app" />;
    return <Outlet />;
}

// ─── app layout ───────────────────────────────────────────────────────────────

const CHAT_PATHS = ['/app', '/new', '/dashboard', '/c/', '/doc-builder'];

export function AppLayout() {
    const { pathname } = useLocation();
    const isChat = CHAT_PATHS.some((p) => pathname === p || pathname.startsWith(p));

    return (
        <SidebarProvider defaultOpen>
            <SpaSidebar />
            <SidebarInset className="bg-background flex h-dvh flex-col overflow-hidden">
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

