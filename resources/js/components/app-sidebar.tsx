import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AudioLines, Mail, SquarePen, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';
import ConversationLink from './chat/conversionLink';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
const mainNavItems: NavItem[] = [
    {
        title: 'New Chat',
        href: '/new',
        icon: SquarePen,
    },
    {
        title: 'Voice',
        href: '/voice-chat',
        icon: AudioLines,
    },
    {
        title: 'Mails',
        href: '/mails',
        icon: Mail,
    },

];

const footerNavItems: NavItem[] = [

];

export function AppSidebar() {
    const [conversations, setConversation] = useState<{ id: string; title: string }[]>([]);
    const projects = [];
    const { auth } = usePage().props;
    const [isLoadingProjects, setIsloadingProjects] = useState(true);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const isFreePlan = auth.user.current_plan?.slug === 'free';
    const handleConversationUpdate = (id: string, updates: { title: string }) => {
        setConversation(prev =>
            prev.map(conv => conv.id === id ? { ...conv, ...updates } : conv)
        );
    };

    const handleConversationDelete = (id: string) => {
        setConversation(prev => prev.filter(conv => conv.id !== id));
    };

    useEffect(() => {
        setIsLoadingConversations(true);
        try {
            // Fetch conversations from the API
            fetch('/api/chat/conversations')
                .then((response) => response.json())
                .then((data: { conversations: { id: string; title: string }[] }) => {
                    setConversation(data.conversations ?? []);
                    setIsLoadingConversations(false);
                })
                .catch((error: Error) => {
                    console.error('Error fetching conversations:', error);
                    setIsLoadingConversations(false);
                });
        } catch (error) {
            setIsLoadingConversations(false);
        }
    }, []);
    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/new" prefetch>
                                <div className="">
                                    <AppLogo />
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavMain items={mainNavItems} />
            </SidebarHeader>

            <SidebarContent className="custom-scrollbar">
                <div className="gap-1 px-2 pb-2">
                    <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">Recent</p>
                    <div className="conversation-content">
                        {isLoadingConversations ? (
                            <>
                                <Skeleton className="mb-1 grid grid-cols-1 bg-none">
                                    <div className="bg-accent h-6 rounded-sm"></div>
                                </Skeleton>
                                <Skeleton className="mb-1 grid grid-cols-1 bg-none">
                                    <div className="bg-accent h-6 rounded-sm"></div>
                                </Skeleton>
                                <Skeleton className="mb-1 grid grid-cols-1 bg-none">
                                    <div className="bg-accent h-6 rounded-sm"></div>
                                </Skeleton>
                                <Skeleton className="mb-1 grid grid-cols-1 bg-none">
                                    <div className="bg-accent h-6 rounded-sm"></div>
                                </Skeleton>
                                <Skeleton className="mb-1 grid grid-cols-1 bg-none">
                                    <div className="bg-accent h-6 rounded-sm"></div>
                                </Skeleton>
                            </>
                        ) : conversations.length > 0 ? (
                            conversations.map((conversation) => (
                                <ConversationLink
                                    key={conversation.id}
                                    conversation={conversation}
                                    onConversationUpdate={handleConversationUpdate}
                                    onConversationDelete={handleConversationDelete}
                                />
                            ))
                        ) : (
                            <div className="px-2 py-4 text-center">
                                <p className="text-xs text-muted-foreground">No conversations yet.</p>
                                <p className="text-xs text-muted-foreground/60 mt-0.5">Start a new chat to begin.</p>
                            </div>
                        )}
                    </div>
                </div>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/50 pt-2">
                {isFreePlan && (
                    <Button asChild variant="default" className="w-full bg-primary/90 hover:bg-primary font-semibold text-primary-foreground shadow-sm">
                        <Link href="/pricing" as="button" prefetch>
                            <Zap className="mr-1.5 h-3.5 w-3.5" />
                            Upgrade to Pro
                        </Link>
                    </Button>
                )}
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
