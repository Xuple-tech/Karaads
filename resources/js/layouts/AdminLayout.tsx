import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    BarChart,
    Image,
    LogOut,
    Users2,
    Building2,
    TrendingUp,
    MessageSquare,
    Globe,
    Shield,
    Bot,
    UserCog,
    HandCoins,
    ChevronDown,
    ChevronRight,
    FileText,
    BookOpen,
    Wrench,
    Key,
    Layout as LayoutIcon,
    BarChart2,
    CreditCard,
    ClipboardList,
    Bell,
    Cpu
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import AppLogoIcon from '@/components/app-logo-icon';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import admin, { dashboard, managementDashboard, userStats } from '@/routes/admin';
import aiModes from '@/routes/admin/ai-modes';
import prompts from '@/routes/admin/prompts';
import agentTemplates from '@/routes/admin/agent-templates';
import aiAgents from '@/routes/admin/ai-agents';
import agentKnowledgeBases from '@/routes/admin/agent-knowledge-bases';
import agentTools from '@/routes/admin/agent-tools';
import agentApiKeys from '@/routes/admin/agent-api-keys';
import agentWidgetSettings from '@/routes/admin/agent-widget-settings';
import agentUsageStats from '@/routes/admin/agent-usage-stats';
import sites from '@/routes/admin/sites';
import siteSubscriptions from '@/routes/admin/site-subscriptions';
import agentPlans from '@/routes/admin/agent-plans';
import plans from '@/routes/admin/subscriptions/plans';
import { logout } from '@/routes';

interface AdminLayoutProps {
    children: React.ReactNode;
}

// Define menu groups
const MENU_GROUPS = [
    {
        id: 'main',
        title: 'Main',
        items: [
            { name: 'Dashboard', icon: LayoutDashboard, route: dashboard().url },
            { name: 'Management', icon: BarChart, route: managementDashboard.url() },
        ]
    },
    {
        id: 'users',
        title: 'User Management',
        items: [
            { name: 'Users', icon: Users, route: admin.users.index.url() },
            { name: 'User Stats', icon: TrendingUp, route: userStats.url() },
        ]
    },
    {
        id: 'ai',
        title: 'AI Tools',
        items: [
            { name: 'AI Prompts', icon: MessageSquare, route: prompts.index.url() },
            { name: 'AI Modes', icon: Bot, route: aiModes.index.url() },
        ]
    },
    {
        id: 'agents',
        title: 'AI Agents',
        items: [
            { name: 'AI Agents', icon: Bot, route: aiAgents.index.url() },
            { name: 'Agent Templates', icon: FileText, route: agentTemplates.index.url() },
            { name: 'Knowledge Base', icon: BookOpen, route: agentKnowledgeBases.index.url() },
            { name: 'Agent Tools', icon: Wrench, route: agentTools.index.url() },
            { name: 'API Keys', icon: Key, route: agentApiKeys.index.url() },
            { name: 'Widget Settings', icon: LayoutIcon, route: agentWidgetSettings.index.url() },
            { name: 'Usage Statistics', icon: BarChart2, route: agentUsageStats.index.url() },
        ]
    },
    {
        id: 'sites',
        title: 'Sites & Subscriptions',
        items: [
            { name: 'Sites', icon: Globe, route: sites.index.url() },
            { name: 'Subscriptions', icon: CreditCard, route: siteSubscriptions.index.url() },
            { name: 'Subscription Plans', icon: HandCoins, route: agentPlans.index.url() },
            { name: "App Subscribtion", icon: Cpu, route: plans.index.url() }
        ]
    },
    {
        id: 'content',
        title: 'Content',
        items: [
            { name: 'Image Uploads', icon: Image, route: admin.imageUploads.url() },
        ]
    },
    {
        id: 'system',
        title: 'System',
        items: [
            { name: 'Configuration', icon: Shield, route: admin.management.configuration.url() },
            { name: 'Audit Logs', icon: ClipboardList, route: admin.management.auditLogs.url() },
            { name: 'Alerts', icon: Bell, route: admin.management.alerts.url() },
            // { name: 'Grok API', icon: Cpu, route: admin.grokApi.index.url() },
        ]
    }
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { auth } = usePage().props;
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    // Initialize and restore section states from localStorage
    useEffect(() => {
        const savedStates = localStorage.getItem('adminSidebarSections');
        if (savedStates) {
            try {
                setOpenSections(JSON.parse(savedStates));
            } catch {
                // Fallback to default if parsing fails
                initializeDefaultStates();
            }
        } else {
            initializeDefaultStates();
        }
    }, []);

    const initializeDefaultStates = () => {
        const defaultStates: Record<string, boolean> = {};
        MENU_GROUPS.forEach(group => {
            defaultStates[group.id] = true; // Default to open
        });
        setOpenSections(defaultStates);
        localStorage.setItem('adminSidebarSections', JSON.stringify(defaultStates));
    };

    // Save section states to localStorage
    const toggleSection = (id: string) => {
        const newOpenSections = {
            ...openSections,
            [id]: !openSections[id]
        };
        setOpenSections(newOpenSections);
        localStorage.setItem('adminSidebarSections', JSON.stringify(newOpenSections));
    };

    // Get admin-only items
    const adminOnlyItems = auth?.user?.role === 'admin'
        ? [
            { name: 'Staff Management', icon: Users2, route: admin.staff.index.url() },
            { name: 'SaaS Owners', icon: Building2, route: admin.saasOwners.index.url() },
        ]
        : [];

    useEffect(() => {
        document.querySelector('body')?.setAttribute('class', 'buz-dark');
    }, []);

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon" variant='inset'>
                <SidebarHeader className="flex items-center gap-2 p-3">
                    <Link href="/admin" className="flex items-center gap-2">
                        <AppLogoIcon />
                        <span className="font-bold">Kwati AI</span>
                    </Link>
                </SidebarHeader>

                <SidebarContent className="p-2 space-y-2 overflow-x-hidden">
                    <SidebarMenu>
                        {MENU_GROUPS.map((group) => (
                            <Collapsible
                                key={group.id}
                                open={openSections[group.id]}
                                onOpenChange={() => toggleSection(group.id)}
                                className="w-full"
                            >
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuItem className="w-full">
                                        <SidebarMenuButton className="w-full justify-between">
                                            <span>{group.title}</span>
                                            {openSections[group.id]
                                                ? <ChevronDown className="h-4 w-4" />
                                                : <ChevronRight className="h-4 w-4" />}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <SidebarMenu className="py-1 ml-4 border-l border-border/50">
                                        {group.items.map((item) => (
                                            <SidebarMenuItem key={item.name}>
                                                <SidebarMenuButton asChild>
                                                    <Link href={item.route}>
                                                        <item.icon className="h-4 w-4" />
                                                        <span>{item.name}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </CollapsibleContent>
                            </Collapsible>
                        ))}

                        {/* Admin-only section */}
                        {adminOnlyItems.length > 0 && (
                            <Collapsible
                                open={openSections['admin']}
                                onOpenChange={() => toggleSection('admin')}
                                className="w-full mt-2 pt-2 border-t border-border/50"
                            >
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuItem className="w-full">
                                        <SidebarMenuButton className="w-full justify-between">
                                            <span>Admin Tools</span>
                                            {openSections['admin']
                                                ? <ChevronDown className="h-4 w-4" />
                                                : <ChevronRight className="h-4 w-4" />}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <SidebarMenu className="py-1 ml-4 border-l border-border/50">
                                        {adminOnlyItems.map((item) => (
                                            <SidebarMenuItem key={item.name}>
                                                <SidebarMenuButton asChild>
                                                    <Link href={item.route}>
                                                        <item.icon className="h-4 w-4" />
                                                        <span>{item.name}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                    </SidebarMenu>
                </SidebarContent>

                <div className="mt-auto p-2 border-t">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href={logout()} method="post" as="button">
                                    <LogOut className="h-4 w-4" />
                                    <span>Log Out</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </Sidebar>

            <SidebarInset>
                <SidebarHeader className="p-3 sticky top-0 backdrop-blur-md rounded-t-[inherit] border-b">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <h1 className="text-lg font-semibold">Admin Panel</h1>
                        {auth?.user?.role && (
                            <span className="ml-auto text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {auth.user.role.toUpperCase()}
                            </span>
                        )}
                    </div>
                </SidebarHeader>

                <main className="p-4 space-y-4">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AdminLayout;
