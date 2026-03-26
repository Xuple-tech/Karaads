import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AudioLines, BookOpen, Folder, Mail, SquarePen, Zap, MessageCircle, Stars, BotMessageSquareIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';
import ConversationLink from './Chat/conversionLink';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { dashboard } from '@/routes/user';

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
        title: 'Agents',
        href: dashboard.url(),
        icon: BotMessageSquareIcon,
    },
    // {
    //     title: 'Meta Automation',
    //     href: '/meta/dashboard',
    //     icon: MessageCircle,
    // },
    {
        title: 'Mails',
        href: '/mails',
        icon: Mail,
    },

];

const footerNavItems: NavItem[] = [

];

export function AppSidebar() {
    const [conversations, setConversation] = useState<{ id: number; title: string }[]>([]);
    const projects = [];
    const { auth } = usePage().props;
    const [isLoadingProjects, setIsloadingProjects] = useState(true);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const isFreePlan = auth.user.current_plan?.slug === 'free';
    const handleConversationUpdate = (id: number, updates: { title: string }) => {
        setConversation(prev =>
            prev.map(conv => conv.id === id ? { ...conv, ...updates } : conv)
        );
    };

    const handleConversationDelete = (id: number) => {
        setConversation(prev => prev.filter(conv => conv.id !== id));
    };

    useEffect(() => {
        setIsLoadingConversations(true);
        try {
            // Fetch conversations from the API
            fetch('/api/conversations/new-api-new-users0request')
                .then((response) => response.json())
                .then((data: { cg_: { id: number; title: string }[] }) => {
                    setConversation(data.cg_);
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
                {/* <NavMain items={mainNavItems} /> */}
                <div className="gap-1 px-1">
                    <small className="text-muted-foreground"> last 7 days</small>
                    <div className="conversation-content px-2">
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
                            <div className="text-muted-foreground">No conversations found.</div>
                        )}
                    </div>
                </div>
            </SidebarContent>

            <SidebarFooter>
                {isFreePlan && <>
                    <Button asChild>
                        <Link
                            className="block w-full bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 dark:from-amber-950 dark:to-orange-950 dark:hover:from-amber-900 dark:hover:to-orange-900 font-semibold"
                            href="/pricing"
                            as="button"
                            prefetch
                        >
                            <Zap className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-amber-900 dark:text-amber-100">Upgrade to Pro</span>
                        </Link>
                    </Button>
                </>}
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
